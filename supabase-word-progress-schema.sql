-- ============================================
-- 영어 단어 퀴즈 학습 시스템 스키마
-- 듀오링고급 퀄리티 업그레이드용
-- ============================================

-- 1. 단어별 학습 기록 (SRS 기반)
CREATE TABLE IF NOT EXISTS word_mastery (
    id SERIAL PRIMARY KEY,
    juwoo_id INTEGER NOT NULL DEFAULT 1,
    word_id INTEGER NOT NULL,
    mastery_level INTEGER DEFAULT 0,       -- 0:씨앗 1:새싹 2:나무 3:마스터 4:전설
    correct_streak INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    last_seen TIMESTAMPTZ,
    next_review TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(juwoo_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_word_mastery_review ON word_mastery(juwoo_id, next_review);
CREATE INDEX IF NOT EXISTS idx_word_mastery_level ON word_mastery(juwoo_id, mastery_level);

-- 2. 퀴즈 세션 기록
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id SERIAL PRIMARY KEY,
    juwoo_id INTEGER NOT NULL DEFAULT 1,
    session_type VARCHAR(50),
    category VARCHAR(50),
    difficulty VARCHAR(20),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    star_rating INTEGER DEFAULT 0,
    streak_maintained BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_date ON quiz_sessions(juwoo_id, started_at);

-- 3. 일별 스트릭
CREATE TABLE IF NOT EXISTS daily_streak (
    id SERIAL PRIMARY KEY,
    juwoo_id INTEGER NOT NULL DEFAULT 1,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    streak_frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(juwoo_id, date)
);

-- RLS 정책
ALTER TABLE word_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streak ENABLE ROW LEVEL SECURITY;

CREATE POLICY "word_mastery_all" ON word_mastery FOR ALL USING (true);
CREATE POLICY "quiz_sessions_all" ON quiz_sessions FOR ALL USING (true);
CREATE POLICY "daily_streak_all" ON daily_streak FOR ALL USING (true);
