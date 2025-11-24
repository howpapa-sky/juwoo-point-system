-- ========================================
-- 주우 포인트 시스템 - 안전한 데이터베이스 초기화
-- ========================================
-- 이 스크립트는 기존 테이블을 안전하게 삭제하고 새로 생성합니다.
-- Supabase SQL Editor에서 전체를 복사하여 한 번에 실행하세요.

-- 1단계: 기존 함수 삭제 (있다면)
DROP FUNCTION IF EXISTS get_points_statistics(timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS get_category_statistics(timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS get_user_ranking(integer);

-- 2단계: 기존 테이블 삭제 (있다면) - CASCADE로 관련 제약조건도 함께 삭제
DROP TABLE IF EXISTS point_transactions CASCADE;
DROP TABLE IF EXISTS point_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3단계: 확장 기능 활성화 (UUID 생성용)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4단계: 테이블 생성

-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 테이블 (거래 테이블보다 먼저 생성)
CREATE TABLE point_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend')),
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 포인트 거래 테이블
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend', 'adjust')),
  category VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5단계: 인덱스 생성 (성능 최적화)
CREATE INDEX idx_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON point_transactions(type);
CREATE INDEX idx_transactions_category ON point_transactions(category);
CREATE INDEX idx_users_total_points ON users(total_points DESC);

-- 6단계: Row Level Security (RLS) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_categories ENABLE ROW LEVEL SECURITY;

-- RLS 정책 - 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON point_transactions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON point_categories FOR SELECT USING (true);

-- 7단계: 통계 함수 생성

-- 기간별 포인트 통계
CREATE OR REPLACE FUNCTION get_points_statistics(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  date DATE,
  earned INTEGER,
  spent INTEGER,
  net INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(pt.created_at) as date,
    COALESCE(SUM(CASE WHEN pt.type = 'earn' THEN pt.amount ELSE 0 END), 0)::INTEGER as earned,
    COALESCE(SUM(CASE WHEN pt.type = 'spend' THEN pt.amount ELSE 0 END), 0)::INTEGER as spent,
    COALESCE(SUM(CASE WHEN pt.type = 'earn' THEN pt.amount ELSE -pt.amount END), 0)::INTEGER as net
  FROM point_transactions pt
  WHERE pt.created_at >= start_date 
    AND pt.created_at <= end_date
  GROUP BY DATE(pt.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 카테고리별 통계
CREATE OR REPLACE FUNCTION get_category_statistics(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  category VARCHAR(50),
  total_amount INTEGER,
  transaction_count BIGINT,
  type VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.category,
    SUM(pt.amount)::INTEGER as total_amount,
    COUNT(*)::BIGINT as transaction_count,
    pt.type
  FROM point_transactions pt
  WHERE pt.created_at >= start_date 
    AND pt.created_at <= end_date
    AND pt.category IS NOT NULL
  GROUP BY pt.category, pt.type
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 사용자 랭킹
CREATE OR REPLACE FUNCTION get_user_ranking(
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  user_name VARCHAR(100),
  total_points INTEGER,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.name as user_name,
    u.total_points,
    ROW_NUMBER() OVER (ORDER BY u.total_points DESC) as rank
  FROM users u
  ORDER BY u.total_points DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8단계: 샘플 카테고리 데이터
INSERT INTO point_categories (name, type, color, icon) VALUES
  ('출석', 'earn', '#10B981', 'calendar-check'),
  ('퀴즈', 'earn', '#3B82F6', 'brain'),
  ('추천', 'earn', '#8B5CF6', 'user-plus'),
  ('리뷰', 'earn', '#F59E0B', 'star'),
  ('이벤트', 'earn', '#EC4899', 'gift'),
  ('상품구매', 'spend', '#EF4444', 'shopping-cart'),
  ('기프티콘', 'spend', '#F97316', 'ticket'),
  ('기부', 'spend', '#06B6D4', 'heart');

-- 9단계: 샘플 사용자 데이터
INSERT INTO users (name, email, total_points) VALUES
  ('김주우', 'juwoo@example.com', 5230),
  ('이하늘', 'sky@example.com', 4850),
  ('박바다', 'sea@example.com', 4320),
  ('최산', 'mountain@example.com', 3890),
  ('정강', 'river@example.com', 3560),
  ('홍숲', 'forest@example.com', 3120),
  ('양구름', 'cloud@example.com', 2890),
  ('송별', 'star@example.com', 2450),
  ('차달', 'moon@example.com', 2100),
  ('한햇', 'sun@example.com', 1850);

-- 10단계: 샘플 거래 데이터 (최근 30일)
DO $$
DECLARE
  user_record RECORD;
  random_days INTEGER;
  random_amount INTEGER;
  random_type VARCHAR(20);
  random_category VARCHAR(50);
  categories_earn VARCHAR[] := ARRAY['출석', '퀴즈', '추천', '리뷰', '이벤트'];
  categories_spend VARCHAR[] := ARRAY['상품구매', '기프티콘', '기부'];
BEGIN
  FOR user_record IN SELECT id FROM users LOOP
    FOR i IN 1..25 LOOP
      random_days := FLOOR(RANDOM() * 30);
      random_amount := FLOOR(RANDOM() * 400 + 100)::INTEGER;
      
      IF RANDOM() < 0.65 THEN
        random_type := 'earn';
        random_category := categories_earn[FLOOR(RANDOM() * array_length(categories_earn, 1) + 1)];
      ELSE
        random_type := 'spend';
        random_category := categories_spend[FLOOR(RANDOM() * array_length(categories_spend, 1) + 1)];
      END IF;
      
      INSERT INTO point_transactions (user_id, amount, type, category, description, created_at)
      VALUES (
        user_record.id,
        random_amount,
        random_type,
        random_category,
        CASE random_type
          WHEN 'earn' THEN random_category || '으로 포인트 적립'
          ELSE random_category || '로 포인트 사용'
        END,
        NOW() - (random_days || ' days')::INTERVAL - (RANDOM() * INTERVAL '24 hours')
      );
    END LOOP;
  END LOOP;
END $$;

-- 11단계: Realtime 활성화 (선택사항)
ALTER PUBLICATION supabase_realtime ADD TABLE point_transactions;

-- ========================================
-- 초기화 완료!
-- ========================================

-- 확인 쿼리 (실행해서 데이터가 제대로 들어갔는지 확인)
SELECT 'Users:' as table_name, COUNT(*)::TEXT as count FROM users
UNION ALL
SELECT 'Transactions:', COUNT(*)::TEXT FROM point_transactions
UNION ALL
SELECT 'Categories:', COUNT(*)::TEXT FROM point_categories;

-- 통계 함수 테스트
SELECT * FROM get_points_statistics(NOW() - INTERVAL '7 days', NOW()) LIMIT 5;
