-- ============================================
-- Phase 1: 루틴 + 승인 + 걱정상자 + 스트릭
-- ============================================

-- 1. 데일리 루틴 정의
CREATE TABLE IF NOT EXISTS daily_routines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,                    -- '양치하기', '아침식사' 등
  category TEXT NOT NULL CHECK (category IN ('morning', 'evening')),
  point_amount INTEGER NOT NULL,         -- 완료 시 포인트
  sort_order INTEGER DEFAULT 0,          -- 표시 순서
  icon TEXT,                             -- Lucide 아이콘 이름
  worldview_label TEXT,                  -- "기지 전력 충전" 등
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 루틴 완료 기록
CREATE TABLE IF NOT EXISTS routine_completions (
  id SERIAL PRIMARY KEY,
  routine_id INTEGER REFERENCES daily_routines(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,          -- 완료 날짜 (KST 기준)
  approved_by UUID REFERENCES auth.users(id),  -- 승인한 부모
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  point_transaction_id INTEGER REFERENCES point_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(routine_id, completed_date)     -- 하루에 같은 루틴 1번만
);

-- 3. 수면 보너스 기록
CREATE TABLE IF NOT EXISTS sleep_records (
  id SERIAL PRIMARY KEY,
  record_date DATE NOT NULL UNIQUE,      -- KST 기준 날짜
  bedtime TIME,                          -- 취침 시간
  wake_time TIME,                        -- 기상 시간
  bonus_points INTEGER DEFAULT 0,        -- 부여된 보너스
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 식사 기록
CREATE TABLE IF NOT EXISTS meal_records (
  id SERIAL PRIMARY KEY,
  record_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'dinner')),
  with_parent BOOLEAN DEFAULT false,     -- 부모와 함께 여부
  new_food_tried BOOLEAN DEFAULT false,  -- 새로운 음식 도전
  points_earned INTEGER DEFAULT 0,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(record_date, meal_type)
);

-- 5. 걱정상자
CREATE TABLE IF NOT EXISTS worry_box (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,                 -- 걱정 내용
  emoji TEXT DEFAULT '😟',              -- 걱정 이모지
  is_resolved BOOLEAN DEFAULT false,     -- 해결 여부
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 스트릭 기록
CREATE TABLE IF NOT EXISTS streaks (
  id SERIAL PRIMARY KEY,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('routine_morning', 'routine_evening', 'sleep', 'reading', 'exercise')),
  current_count INTEGER DEFAULT 0,
  best_count INTEGER DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(streak_type)
);

-- 7. 승인 요청 큐
CREATE TABLE IF NOT EXISTS approval_queue (
  id SERIAL PRIMARY KEY,
  request_type TEXT NOT NULL CHECK (request_type IN ('routine', 'sleep', 'meal', 'exercise', 'reading', 'deduction')),
  reference_id INTEGER,                  -- routine_completions.id 등
  reference_table TEXT,                  -- 참조 테이블명
  description TEXT NOT NULL,             -- "양치하기 완료" 등
  worldview_message TEXT,                -- "기지 전력 충전 요청!" 등
  point_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  deduction_reason TEXT                  -- 차감 시 사유 (Track C)
);

-- 8. 양육태도 리마인더
CREATE TABLE IF NOT EXISTS parenting_reminders (
  id SERIAL PRIMARY KEY,
  trigger_context TEXT NOT NULL,         -- 'deduction', 'weekly_report', 'low_streak' 등
  message TEXT NOT NULL,                 -- "주우는 이 상황이 무서울 수 있어요..."
  is_active BOOLEAN DEFAULT true
);

-- ============================================
-- juwoo_profile 확장
-- ============================================
ALTER TABLE juwoo_profile ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE juwoo_profile ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'child' CHECK (role IN ('child', 'parent'));

-- ============================================
-- 시드 데이터
-- ============================================

-- 아침 루틴 시드
INSERT INTO daily_routines (name, category, point_amount, sort_order, icon, worldview_label) VALUES
  ('스스로 일어나기', 'morning', 500, 1, 'Sun', '탐험대원 기상!'),
  ('양치하기', 'morning', 200, 2, 'Sparkles', '장비 점검 완료'),
  ('아침식사 (부모와 함께)', 'morning', 800, 3, 'Utensils', '에너지 충전'),
  ('등교 준비 (가방 싸기)', 'morning', 300, 4, 'Backpack', '탐험 장비 준비')
ON CONFLICT DO NOTHING;

-- 저녁 루틴 시드
INSERT INTO daily_routines (name, category, point_amount, sort_order, icon, worldview_label) VALUES
  ('숙제 + 학원 숙제', 'evening', 1000, 1, 'BookOpen', '미션 보고서 작성'),
  ('독서 30분', 'evening', 800, 2, 'Book', '새로운 행성 탐사'),
  ('저녁식사 (부모와 함께)', 'evening', 800, 3, 'Utensils', '에너지 충전'),
  ('양치 + 잠자리 준비', 'evening', 200, 4, 'Moon', '기지 점검'),
  ('취침', 'evening', 0, 5, 'Bed', '충전 모드')
ON CONFLICT DO NOTHING;

-- 스트릭 초기화
INSERT INTO streaks (streak_type, current_count, best_count) VALUES
  ('routine_morning', 0, 0),
  ('routine_evening', 0, 0),
  ('sleep', 0, 0),
  ('reading', 0, 0),
  ('exercise', 0, 0)
ON CONFLICT (streak_type) DO NOTHING;

-- 양육태도 리마인더 시드
INSERT INTO parenting_reminders (trigger_context, message) VALUES
  ('deduction', '주우는 이 상황이 무서울 수 있어요. 꼭 필요한 차감인가요? 주우의 위험회피(HA) 성향이 높아, 차감 자체가 큰 스트레스입니다.'),
  ('deduction', '주우의 낮은 자율성(SD 27%)은 "태도"가 아니라 "능력"의 문제입니다. "해 봐"보다 "지금은 이것만 하자"가 효과적이에요.'),
  ('weekly_report', '이번 주 주우의 "시도" 횟수에 주목해주세요. 결과보다 과정이 중요합니다.'),
  ('weekly_report', '카이와 주우의 자율성(SD) 간극이 큽니다 (92% vs 27%). 주우의 속도를 기다려주세요.'),
  ('low_streak', '스트릭이 끊겼지만 괜찮아요. 주우에게 "다시 시작하면 돼"라고 말해주세요.')
ON CONFLICT DO NOTHING;

-- ============================================
-- 포인트 규칙 추가
-- ============================================
INSERT INTO point_rules (name, category, point_amount, description, is_active) VALUES
  ('21시 전 취침', 'sleep', 1500, '탐험대원 최고 충전!', true),
  ('21:30 전 취침', 'sleep', 1000, '좋은 충전!', true),
  ('22시 전 취침', 'sleep', 500, '기본 충전 완료', true),
  ('7일 연속 조기취침', 'sleep', 2000, '탐험기지 슈퍼충전!', true),
  ('부모와 함께 아침식사', 'meal', 800, '함께 에너지 충전', true),
  ('부모와 함께 저녁식사', 'meal', 800, '함께 에너지 충전', true),
  ('새로운 음식 도전', 'meal', 300, '새로운 행성 음식 발견!', true),
  ('아침 루틴 완전 완료', 'routine', 500, '기지 전력 충전 완료!', true),
  ('저녁 루틴 완전 완료', 'routine', 500, '기지 점검 완료!', true)
ON CONFLICT DO NOTHING;

-- 기존 상점 리밸런싱
UPDATE shop_items SET point_cost = 1000 WHERE name LIKE '%자전거%';
UPDATE shop_items SET point_cost = 8000 WHERE name LIKE '%닌텐도 30분%';
UPDATE shop_items SET point_cost = 3000 WHERE name LIKE '%포켓몬고 10분%';

-- ============================================
-- RLS 정책
-- ============================================
ALTER TABLE daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE worry_box ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE parenting_reminders ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 모두 읽기 가능 (가족 앱이므로)
CREATE POLICY "authenticated_read" ON daily_routines FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON routine_completions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON sleep_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON meal_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON worry_box FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON streaks FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON approval_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON parenting_reminders FOR SELECT TO authenticated USING (true);

-- INSERT/UPDATE는 인증된 사용자 모두 허용 (역할 체크는 프론트에서)
CREATE POLICY "authenticated_write" ON routine_completions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON routine_completions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated_write" ON sleep_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_write" ON meal_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_write" ON worry_box FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON worry_box FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated_write" ON approval_queue FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON approval_queue FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated_update" ON streaks FOR UPDATE TO authenticated USING (true);

-- 기존 테이블에도 RLS 활성화
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE juwoo_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_all" ON point_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON juwoo_profile FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON shop_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);
