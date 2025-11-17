-- Supabase PostgreSQL 데이터베이스 설정 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 기존 테이블 삭제 (재설정 시에만 사용)
-- DROP TABLE IF EXISTS user_badges CASCADE;
-- DROP TABLE IF EXISTS badges CASCADE;
-- DROP TABLE IF EXISTS word_learning_progress CASCADE;
-- DROP TABLE IF EXISTS english_words CASCADE;
-- DROP TABLE IF EXISTS goals CASCADE;
-- DROP TABLE IF EXISTS purchases CASCADE;
-- DROP TABLE IF EXISTS shop_items CASCADE;
-- DROP TABLE IF EXISTS point_transactions CASCADE;
-- DROP TABLE IF EXISTS point_rules CASCADE;
-- DROP TABLE IF EXISTS juwoo_profile CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. ENUM 타입 생성
DO $$ BEGIN
  CREATE TYPE role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE category AS ENUM (
    '생활습관', '운동건강', '학습독서', '예의태도', '집안일', 
    '거짓말태도', '시간약속', '생활미준수', '물건관리'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE shop_category AS ENUM (
    '게임시간', '장난감', '간식음식', '특별활동', '특권'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE purchase_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE goal_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE learning_status AS ENUM ('learning', 'mastered');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE badge_category AS ENUM ('points', 'learning', 'streak', 'special');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. 테이블 생성

-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_signed_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Juwoo Profile 테이블
CREATE TABLE IF NOT EXISTS juwoo_profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) DEFAULT '주우' NOT NULL,
  current_points INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Point Rules 테이블
CREATE TABLE IF NOT EXISTS point_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category category NOT NULL,
  point_amount INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Point Transactions 테이블
CREATE TABLE IF NOT EXISTS point_transactions (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL,
  rule_id INTEGER,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  note TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Shop Items 테이블
CREATE TABLE IF NOT EXISTS shop_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category shop_category NOT NULL,
  point_cost INTEGER NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Purchases 테이블
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL,
  item_id INTEGER NOT NULL,
  point_cost INTEGER NOT NULL,
  status purchase_status DEFAULT 'pending' NOT NULL,
  note TEXT,
  approved_by INTEGER,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Goals 테이블
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_points INTEGER NOT NULL,
  current_points INTEGER DEFAULT 0 NOT NULL,
  status goal_status DEFAULT 'active' NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- English Words 테이블
CREATE TABLE IF NOT EXISTS english_words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  korean VARCHAR(100) NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  category VARCHAR(50) NOT NULL,
  example_sentence TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Word Learning Progress 테이블
CREATE TABLE IF NOT EXISTS word_learning_progress (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL,
  word_id INTEGER NOT NULL,
  status learning_status DEFAULT 'learning' NOT NULL,
  correct_count INTEGER DEFAULT 0 NOT NULL,
  incorrect_count INTEGER DEFAULT 0 NOT NULL,
  last_practiced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Badges 테이블
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  category badge_category NOT NULL,
  requirement INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User Badges 테이블
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL,
  badge_id INTEGER NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. 초기 데이터 삽입

-- Juwoo Profile 초기화
INSERT INTO juwoo_profile (id, name, current_points)
VALUES (1, '주우', 0)
ON CONFLICT (id) DO NOTHING;

-- 5. Row Level Security (RLS) 설정
-- 개발 단계에서는 RLS를 비활성화하거나 모든 접근을 허용합니다
-- 프로덕션 환경에서는 적절한 RLS 정책을 설정하세요

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE juwoo_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- 개발 단계: 모든 사용자에게 모든 권한 허용
CREATE POLICY "Allow all for authenticated users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON juwoo_profile FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON point_rules FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON point_transactions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON shop_items FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON purchases FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON goals FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON english_words FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON word_learning_progress FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON badges FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON user_badges FOR ALL USING (true);

-- 6. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users(open_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_juwoo_id ON point_transactions(juwoo_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_juwoo_id ON purchases(juwoo_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_word_learning_progress_juwoo_id ON word_learning_progress(juwoo_id);
CREATE INDEX IF NOT EXISTS idx_word_learning_progress_word_id ON word_learning_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_juwoo_id ON user_badges(juwoo_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- 완료!
-- 이제 POINT_RULES_DATA.md, SHOP_ITEMS_DATA.md, ENGLISH_WORDS_DATA.md, BADGES_DATA.md 파일의 SQL 스크립트를 실행하여 초기 데이터를 삽입하세요.
