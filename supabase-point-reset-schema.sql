-- ================================================
-- 포인트 시스템 전체 초기화 SQL
-- Supabase SQL Editor에서 실행
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
