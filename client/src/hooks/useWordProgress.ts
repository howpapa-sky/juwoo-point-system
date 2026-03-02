// 단어 숙련도 관리 훅 (SRS 기반)
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MASTERY_LEVELS } from '@/lib/quizConstants';

export interface WordMastery {
  word_id: number;
  mastery_level: number;
  correct_streak: number;
  total_attempts: number;
  total_correct: number;
  next_review: string | null;
}

export function useWordProgress() {
  const [masteryMap, setMasteryMap] = useState<Record<number, WordMastery>>({});
  const [loading, setLoading] = useState(false);

  const loadMastery = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('word_mastery')
        .select('*')
        .eq('juwoo_id', 1);

      if (error) throw error;

      const map: Record<number, WordMastery> = {};
      data?.forEach((item: WordMastery) => {
        map[item.word_id] = item;
      });
      setMasteryMap(map);
    } catch {
      // 테이블이 없을 수 있음 (첫 실행 시)
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMastery = useCallback(async (wordId: number, isCorrect: boolean) => {
    const current = masteryMap[wordId];
    const now = new Date().toISOString();

    let newLevel = current?.mastery_level ?? 0;
    let newStreak = current?.correct_streak ?? 0;
    const totalAttempts = (current?.total_attempts ?? 0) + 1;
    const totalCorrect = (current?.total_correct ?? 0) + (isCorrect ? 1 : 0);

    if (isCorrect) {
      newStreak += 1;
      // 레벨업 조건
      if (newLevel === 0 && newStreak >= 1) newLevel = 1;
      else if (newLevel === 1 && newStreak >= 3) newLevel = 2;
      else if (newLevel === 2 && newStreak >= 5) newLevel = 3;
      else if (newLevel === 3 && newStreak >= 7) newLevel = 4;
    } else {
      newStreak = 0;
      // 1단계만 하락 (0으로 초기화 금지)
      if (newLevel > 0) newLevel -= 1;
    }

    const reviewDays = MASTERY_LEVELS[Math.min(newLevel, 4)]?.reviewDays ?? 1;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + reviewDays);

    const record = {
      juwoo_id: 1,
      word_id: wordId,
      mastery_level: newLevel,
      correct_streak: newStreak,
      total_attempts: totalAttempts,
      total_correct: totalCorrect,
      last_seen: now,
      next_review: nextReview.toISOString(),
      updated_at: now,
    };

    try {
      await supabase
        .from('word_mastery')
        .upsert(record, { onConflict: 'juwoo_id,word_id' });
    } catch {
      // 실패 시 로컬만 업데이트
    }

    setMasteryMap(prev => ({
      ...prev,
      [wordId]: {
        word_id: wordId,
        mastery_level: newLevel,
        correct_streak: newStreak,
        total_attempts: totalAttempts,
        total_correct: totalCorrect,
        next_review: nextReview.toISOString(),
      },
    }));

    return newLevel;
  }, [masteryMap]);

  const getMastery = useCallback((wordId: number): number => {
    return masteryMap[wordId]?.mastery_level ?? 0;
  }, [masteryMap]);

  return { masteryMap, loading, loadMastery, updateMastery, getMastery };
}
