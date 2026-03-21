-- ============================================
-- Phase 2: 영어 학습 SRS + 실수 친구 도감
-- ============================================

-- 1. SRS 단어 진행률 (useSRS.ts가 참조하는 테이블)
CREATE TABLE IF NOT EXISTS english_word_srs (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  pronunciation TEXT,
  category TEXT,
  unit_id TEXT,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  box INTEGER DEFAULT 1 CHECK (box BETWEEN 1 AND 5),  -- Leitner 5-Box
  correct_streak INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  pronunciation_best_score REAL DEFAULT 0,
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ,
  last_correct_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(juwoo_id, word)
);

-- 2. 실수 친구 도감
CREATE TABLE IF NOT EXISTS mistake_friends (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL,                    -- 틀린 단어
  meaning TEXT NOT NULL,                 -- 한국어 뜻
  friend_name TEXT,                      -- 주우가 지어준 이름
  friend_emoji TEXT DEFAULT '🤔',       -- 실수 친구 이모지
  encounter_count INTEGER DEFAULT 1,     -- 만난 횟수
  is_mastered BOOLEAN DEFAULT false,     -- 마스터 여부 (3회 연속 정답)
  mastered_at TIMESTAMPTZ,
  first_met_at TIMESTAMPTZ DEFAULT NOW(),
  last_met_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 학습 세션 기록
CREATE TABLE IF NOT EXISTS english_sessions (
  id SERIAL PRIMARY KEY,
  session_type TEXT NOT NULL CHECK (session_type IN ('learn', 'practice', 'review')),
  mode TEXT DEFAULT 'practice' CHECK (mode IN ('practice', 'test')),
  words_total INTEGER DEFAULT 0,
  words_correct INTEGER DEFAULT 0,
  words_wrong INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),  -- 별 1~3개
  points_earned INTEGER DEFAULT 0,
  mistake_friends_met INTEGER DEFAULT 0,  -- 이번 세션에서 만난 실수 친구 수
  duration_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 실수 목표 기록
CREATE TABLE IF NOT EXISTS mistake_goals (
  id SERIAL PRIMARY KEY,
  goal_date DATE NOT NULL UNIQUE,        -- 오늘 날짜
  target_mistakes INTEGER DEFAULT 3,     -- "오늘 실수 3번이 목표!"
  actual_mistakes INTEGER DEFAULT 0,     -- 실제 실수 횟수
  goal_met BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE english_word_srs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all" ON english_word_srs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON mistake_friends FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON english_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON mistake_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- Realtime 활성화 (카이에게 안내)
-- ============================================
-- Dashboard > Database > Publications > supabase_realtime에서 추가:
-- english_word_srs, english_sessions
