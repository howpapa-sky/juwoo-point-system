-- 경제 리밸런싱: 이자율 10% → 3%
ALTER TABLE savings_account ALTER COLUMN interest_rate SET DEFAULT 0.03;
UPDATE savings_account SET interest_rate = 0.03 WHERE interest_rate = 0.10;
