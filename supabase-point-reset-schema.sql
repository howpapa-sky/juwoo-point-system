-- ================================================
-- 주우 포인트 시스템 — 전체 초기화 + 테이블 보장 SQL
-- Supabase SQL Editor에서 실행
-- ================================================

-- ================================================
-- PART 1: 투자 시스템 테이블 생성 (이미 있으면 스킵)
-- ================================================

-- 저축 계좌
CREATE TABLE IF NOT EXISTS savings_account (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0 NOT NULL,
  interest_rate DECIMAL(4,2) DEFAULT 0.03 NOT NULL,
  last_interest_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 이자 기록
CREATE TABLE IF NOT EXISTS interest_history (
  id SERIAL PRIMARY KEY,
  savings_id INTEGER REFERENCES savings_account(id),
  balance_before INTEGER NOT NULL,
  interest_amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  calculated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 씨앗 (투자)
CREATE TABLE IF NOT EXISTS seeds (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL,
  seed_type VARCHAR(20) NOT NULL,
  invested_amount INTEGER NOT NULL,
  planted_date TIMESTAMP DEFAULT NOW() NOT NULL,
  harvest_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'growing' NOT NULL,
  result_multiplier DECIMAL(4,2),
  harvested_amount INTEGER,
  diary_entry TEXT,
  diary_reflection TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 목표 저축
CREATE TABLE IF NOT EXISTS saving_goals (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL,
  title VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) DEFAULT '🎯',
  target_amount INTEGER NOT NULL,
  current_amount INTEGER DEFAULT 0 NOT NULL,
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  achieved_at TIMESTAMP
);

-- 목표 저축 입금 기록
CREATE TABLE IF NOT EXISTS goal_deposits (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER REFERENCES saving_goals(id),
  amount INTEGER NOT NULL,
  deposited_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 저축 계좌 초기 레코드 (없으면 생성)
INSERT INTO savings_account (juwoo_id, balance, interest_rate)
VALUES (1, 0, 0.03)
ON CONFLICT (juwoo_id) DO NOTHING;

-- 이자율 3%로 보장
UPDATE savings_account SET interest_rate = 0.03 WHERE juwoo_id = 1;

-- ================================================
-- PART 2: RLS 정책 (이미 있으면 스킵)
-- ================================================

ALTER TABLE savings_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE saving_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_deposits ENABLE ROW LEVEL SECURITY;

-- savings_account
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'savings_account_all' AND tablename = 'savings_account') THEN
    CREATE POLICY savings_account_all ON savings_account FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- interest_history
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'interest_history_all' AND tablename = 'interest_history') THEN
    CREATE POLICY interest_history_all ON interest_history FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- seeds
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seeds_all' AND tablename = 'seeds') THEN
    CREATE POLICY seeds_all ON seeds FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- saving_goals
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'saving_goals_all' AND tablename = 'saving_goals') THEN
    CREATE POLICY saving_goals_all ON saving_goals FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- goal_deposits
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'goal_deposits_all' AND tablename = 'goal_deposits') THEN
    CREATE POLICY goal_deposits_all ON goal_deposits FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ================================================
-- PART 3: 전체 데이터 초기화
-- ================================================

-- 1. 의존 테이블부터 삭제 (FK 순서 준수)
DELETE FROM goal_deposits;
DELETE FROM saving_goals WHERE juwoo_id = 1;
DELETE FROM interest_history;
DELETE FROM seeds WHERE juwoo_id = 1;
DELETE FROM purchases;
DELETE FROM point_transactions WHERE juwoo_id = 1;

-- 2. 금고 잔액 초기화
UPDATE savings_account SET balance = 0, last_interest_date = NULL WHERE juwoo_id = 1;

-- 3. 지갑 잔액 초기화
UPDATE juwoo_profile SET current_points = 0 WHERE id = 1;
