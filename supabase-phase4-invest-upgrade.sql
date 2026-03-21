-- ============================================
-- Phase 4: 투자 시스템 시드 추가
-- ============================================

-- 투자 관련 양육 리마인더 추가
INSERT INTO parenting_reminders (trigger_context, message) VALUES
  ('invest_together', '투자 시스템을 주우와 함께 보면서, "이 씨앗은 왜 이렇게 자랐을까?" 물어보세요. 주우의 VCI(111) 강점을 활용하는 대화입니다.'),
  ('invest_together', '아버님이 욕구를 조절하고 목표를 향해 나아가는 모습을 보여주는 것이 가장 큰 교육입니다. (임상 보고서 권고)'),
  ('invest_loss', '씨앗이 적게 열렸을 때, "네가 잘못한 게 아니야, 날씨 탓이야"라고 말해주세요. 외부 귀인이 주우의 예기불안(HA1)을 낮춥니다.')
ON CONFLICT DO NOTHING;

-- savings_account에 초기 레코드 없으면 생성
INSERT INTO savings_account (juwoo_id, balance, interest_rate, last_interest_date)
VALUES (1, 0, 0.03, NOW())
ON CONFLICT (juwoo_id) DO NOTHING;
