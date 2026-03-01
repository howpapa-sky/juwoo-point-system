-- 투자 시스템 리뉴얼 마이그레이션
-- 저축 계좌, 이자 기록, 씨앗(투자), 목표 저축 테이블 추가

-- 저축 계좌
CREATE TABLE IF NOT EXISTS savings_account (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0 NOT NULL,
  interest_rate DECIMAL(4,2) DEFAULT 0.10 NOT NULL,
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

-- 초기 저축 계좌 생성 (juwoo_id UNIQUE로 중복 방지)
INSERT INTO savings_account (juwoo_id, balance, interest_rate)
VALUES (1, 0, 0.10)
ON CONFLICT (juwoo_id) DO NOTHING;
