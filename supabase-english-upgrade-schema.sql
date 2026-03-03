-- ============================================
-- 영어학습 글로벌 업그레이드 SQL 스키마
-- 7개 테이블 + RLS 정책 + 인덱스
-- 실행 대상: Supabase SQL Editor
-- ============================================

-- 1. 단어 SRS (간격반복) 상태 테이블
CREATE TABLE IF NOT EXISTS english_word_srs (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1,
  word VARCHAR(100) NOT NULL,
  meaning VARCHAR(200) NOT NULL,
  pronunciation VARCHAR(100),
  category VARCHAR(50),
  unit_id VARCHAR(50),
  difficulty VARCHAR(10) DEFAULT 'easy',
  box INTEGER DEFAULT 1 CHECK (box BETWEEN 1 AND 5),
  correct_streak INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  pronunciation_best_score INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ,
  last_correct_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(juwoo_id, word)
);

CREATE INDEX IF NOT EXISTS idx_srs_review ON english_word_srs(juwoo_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_srs_box ON english_word_srs(juwoo_id, box);
CREATE INDEX IF NOT EXISTS idx_srs_unit ON english_word_srs(juwoo_id, unit_id);

-- 2. 학습 유닛 진행 상태
CREATE TABLE IF NOT EXISTS english_unit_progress (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1,
  unit_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')),
  words_mastered INTEGER DEFAULT 0,
  total_words INTEGER NOT NULL DEFAULT 0,
  mastery_percent FLOAT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(juwoo_id, unit_id)
);

-- 3. 학습 세션 로그
CREATE TABLE IF NOT EXISTS english_sessions (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1,
  session_type VARCHAR(30) NOT NULL,
  unit_id VARCHAR(50),
  total_items INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  dont_know_count INTEGER DEFAULT 0,
  guessing_count INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON english_sessions(juwoo_id, started_at);

-- 4. 개별 답변 로그
CREATE TABLE IF NOT EXISTS english_answer_logs (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES english_sessions(id) ON DELETE CASCADE,
  word VARCHAR(100),
  question_type VARCHAR(30),
  difficulty VARCHAR(10),
  user_answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN,
  was_guessing BOOLEAN DEFAULT FALSE,
  used_dont_know BOOLEAN DEFAULT FALSE,
  hints_used INTEGER DEFAULT 0,
  answer_time_ms INTEGER,
  pronunciation_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answers_session ON english_answer_logs(session_id);

-- 5. 영어 프로필 (레벨 & XP)
CREATE TABLE IF NOT EXISTS english_profile (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1 UNIQUE,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  total_study_minutes INTEGER DEFAULT 0,
  total_words_learned INTEGER DEFAULT 0,
  total_words_mastered INTEGER DEFAULT 0,
  total_stories_completed INTEGER DEFAULT 0,
  total_pronunciation_practices INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 영어 배지 획득 기록
CREATE TABLE IF NOT EXISTS english_badges (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1,
  badge_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(juwoo_id, badge_id)
);

-- 7. 스토리 진행 상태
CREATE TABLE IF NOT EXISTS english_story_progress (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER DEFAULT 1,
  story_id VARCHAR(50) NOT NULL,
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  interactions_completed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(juwoo_id, story_id)
);

-- ============================================
-- RLS 정책
-- ============================================

ALTER TABLE english_word_srs ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_unit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_answer_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_story_progress ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자에게 모든 작업 허용 (단일 사용자 앱)
CREATE POLICY "english_word_srs_all" ON english_word_srs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "english_unit_progress_all" ON english_unit_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "english_sessions_all" ON english_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "english_answer_logs_all" ON english_answer_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "english_profile_all" ON english_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "english_badges_all" ON english_badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "english_story_progress_all" ON english_story_progress FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- updated_at 자동 갱신 트리거
-- ============================================
CREATE OR REPLACE FUNCTION english_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_english_word_srs_updated_at
  BEFORE UPDATE ON english_word_srs
  FOR EACH ROW EXECUTE FUNCTION english_set_updated_at();

CREATE TRIGGER set_english_profile_updated_at
  BEFORE UPDATE ON english_profile
  FOR EACH ROW EXECUTE FUNCTION english_set_updated_at();

-- ============================================
-- 초기 데이터: 영어 프로필 생성
-- ============================================
INSERT INTO english_profile (juwoo_id) VALUES (1) ON CONFLICT (juwoo_id) DO NOTHING;

-- ============================================
-- 초기 데이터: Unit 1 활성화
-- ============================================
INSERT INTO english_unit_progress (juwoo_id, unit_id, status, total_words)
VALUES (1, 'unit-01', 'active', 13)
ON CONFLICT (juwoo_id, unit_id) DO NOTHING;
