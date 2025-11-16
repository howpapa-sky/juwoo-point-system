# Supabase 스키마 설정 가이드

이 문서는 Supabase 데이터베이스 스키마를 수동으로 설정하는 방법을 안내합니다.

## 1. Supabase Dashboard에서 SQL Editor 열기

1. https://supabase.com/dashboard 접속
2. `juwoo_point` 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

## 2. 아래 SQL을 복사하여 실행

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_signed_in TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Juwoo profile
CREATE TABLE IF NOT EXISTS juwoo_profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) DEFAULT '주우' NOT NULL,
  age INTEGER DEFAULT 7,
  current_points INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Point rules
CREATE TABLE IF NOT EXISTS point_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  point_amount INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Shop items
CREATE TABLE IF NOT EXISTS shop_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  point_cost INTEGER NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Point transactions
CREATE TABLE IF NOT EXISTS point_transactions (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL,
  rule_id INTEGER,
  amount INTEGER NOT NULL,
  note TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  FOREIGN KEY (rule_id) REFERENCES point_rules(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL,
  item_id INTEGER NOT NULL,
  point_cost INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  note TEXT,
  approved_by INTEGER,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- English words
CREATE TABLE IF NOT EXISTS english_words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  korean VARCHAR(100) NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  category VARCHAR(50),
  example_sentence TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_point_transactions_juwoo ON point_transactions(juwoo_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created ON point_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_juwoo ON purchases(juwoo_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_english_words_level ON english_words(level);
```

## 3. 데이터 삽입

스키마 생성 후, 다음 명령어로 포인트 규칙과 상점 아이템 데이터를 삽입합니다:

```bash
cd /home/ubuntu/juwoo-point-system
node scripts/setup-supabase.mjs
```

이 스크립트는 다음을 수행합니다:
- 주우 프로필 생성 (ID: 1, 이름: 주우, 나이: 7세)
- 38개의 포인트 규칙 삽입 (생활습관, 운동건강, 학습독서, 예의태도, 집안일, 부정적행동)
- 34개의 상점 아이템 삽입 (게임시간, 장난감, 간식음식, 특별활동, 특권)

## 4. 확인

데이터가 정상적으로 삽입되었는지 확인:

```sql
SELECT COUNT(*) FROM point_rules;  -- 38개 예상
SELECT COUNT(*) FROM shop_items;   -- 34개 예상
SELECT * FROM juwoo_profile WHERE id = 1;  -- 주우 프로필 확인
```

## 주의사항

- Supabase의 anon key는 공개되어도 안전합니다 (Row Level Security로 보호됨)
- 하지만 프로덕션 환경에서는 RLS 정책을 반드시 설정해야 합니다
- 현재는 개발 단계이므로 RLS를 비활성화한 상태입니다
