-- ============================================
-- Phase 3: 독서 + 운동
-- ============================================

-- 1. 나의 책장 (종이책 등록)
CREATE TABLE IF NOT EXISTS my_bookshelf (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  cover_emoji TEXT DEFAULT '📖',
  category TEXT DEFAULT 'general',
  total_pages INTEGER,
  source TEXT DEFAULT 'home' CHECK (source IN ('home', 'school_library', 'public_library', 'gift')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(title, author)
);

-- 2. 독서 기록
CREATE TABLE IF NOT EXISTS reading_logs (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES my_bookshelf(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  minutes_read INTEGER NOT NULL DEFAULT 0,
  pages_read INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  memo TEXT,
  points_earned INTEGER DEFAULT 0,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 운동 기록
CREATE TABLE IF NOT EXISTS exercise_logs (
  id SERIAL PRIMARY KEY,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN (
    'swimming', 'running', 'cycling', 'stretching', 'walking', 'playground', 'other'
  )),
  exercise_name TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  distance_km REAL,
  exercise_date DATE NOT NULL,
  with_parent BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 독서/운동 배지
CREATE TABLE IF NOT EXISTS activity_badges (
  id SERIAL PRIMARY KEY,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('reading', 'exercise')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  is_earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(badge_type, name)
);

-- 5. 아빠와 함께 미션
CREATE TABLE IF NOT EXISTS parent_missions (
  id SERIAL PRIMARY KEY,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('exercise', 'reading', 'special')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  worldview_label TEXT,
  bonus_points INTEGER DEFAULT 500,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  week_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 시드 데이터
-- ============================================

-- 독서 배지
INSERT INTO activity_badges (badge_type, name, description, emoji, requirement_type, requirement_value) VALUES
  ('reading', '첫 번째 행성', '첫 책 등록!', '🌍', 'books_count', 1),
  ('reading', '행성 탐험가', '5권 등록', '🪐', 'books_count', 5),
  ('reading', '은하 탐험대', '10권 등록', '🌌', 'books_count', 10),
  ('reading', '우주 도서관장', '30권 등록', '📚', 'books_count', 30),
  ('reading', '3일 연속 독서', '독서 3일 연속', '🔥', 'reading_streak', 3),
  ('reading', '7일 연속 독서', '독서 7일 연속', '⭐', 'reading_streak', 7),
  ('reading', '30일 연속 독서', '독서 30일 연속!', '🏆', 'reading_streak', 30)
ON CONFLICT (badge_type, name) DO NOTHING;

-- 운동 배지
INSERT INTO activity_badges (badge_type, name, description, emoji, requirement_type, requirement_value) VALUES
  ('exercise', '첫 훈련', '첫 운동 기록!', '💪', 'exercise_count', 1),
  ('exercise', '체력 5단', '운동 5회', '🏃', 'exercise_count', 5),
  ('exercise', '체력 마스터', '운동 20회', '🥇', 'exercise_count', 20),
  ('exercise', '3일 연속 훈련', '운동 3일 연속', '🔥', 'exercise_streak', 3),
  ('exercise', '7일 연속 훈련', '운동 7일 연속', '⭐', 'exercise_streak', 7)
ON CONFLICT (badge_type, name) DO NOTHING;

-- 아빠와 함께 미션 (초기 4주분)
INSERT INTO parent_missions (mission_type, title, description, worldview_label, bonus_points, week_number) VALUES
  ('exercise', '아빠와 자전거 타기', '아빠와 함께 자전거 30분 이상', '탐험대 합동 순찰!', 500, 1),
  ('exercise', '아빠와 달리기', '아빠와 함께 공원 달리기', '탐험대 합동 체력 훈련!', 500, 2),
  ('reading', '아빠와 함께 읽기', '아빠와 같은 책 읽고 이야기 나누기', '탐험대 합동 행성 탐사!', 500, 3),
  ('special', '아빠와 새로운 도전', '아빠와 함께 새로운 운동 해보기', '미지의 행성 탐험!', 700, 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE my_bookshelf ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all" ON my_bookshelf FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON reading_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON exercise_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON activity_badges FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON parent_missions FOR ALL TO authenticated USING (true) WITH CHECK (true);
