// 적응형 난이도 엔진
// - 최근 10문제 정답률 기반
// - 연속 2회 오답 → 다음 3문제 easy (쿠션)
// - hard 다음 → 반드시 easy (쿠션)

import { useCallback, useRef } from 'react';
import type { Difficulty } from '@/lib/englishConstants';

export function useDifficulty() {
  const recentResults = useRef<boolean[]>([]);
  const consecutiveWrong = useRef(0);
  const cushionRemaining = useRef(0);
  const lastDifficulty = useRef<Difficulty>('easy');

  const recordResult = useCallback((isCorrect: boolean) => {
    recentResults.current.push(isCorrect);
    if (recentResults.current.length > 10) {
      recentResults.current = recentResults.current.slice(-10);
    }

    if (isCorrect) {
      consecutiveWrong.current = 0;
    } else {
      consecutiveWrong.current += 1;
      // 연속 2회 오답 → 다음 3문제 easy (기존 쿠션 남아있으면 유지)
      if (consecutiveWrong.current >= 2) {
        cushionRemaining.current = Math.max(cushionRemaining.current, 3);
        consecutiveWrong.current = 0;
      }
    }
  }, []);

  const getNextDifficulty = useCallback((): Difficulty => {
    // 쿠션 문제 우선 (연속 오답 후)
    if (cushionRemaining.current > 0) {
      cushionRemaining.current -= 1;
      lastDifficulty.current = 'easy';
      return 'easy';
    }

    // hard 다음 → 정답률 90% 이상이면 medium, 그 외 easy (쿠션)
    if (lastDifficulty.current === 'hard') {
      const results = recentResults.current;
      const acc = results.length > 0 ? results.filter(Boolean).length / results.length : 0;
      const next: Difficulty = acc >= 0.9 ? 'medium' : 'easy';
      lastDifficulty.current = next;
      return next;
    }

    // 최근 정답률 계산
    const results = recentResults.current;
    if (results.length === 0) {
      lastDifficulty.current = 'easy';
      return 'easy';
    }

    const correctCount = results.filter(Boolean).length;
    const accuracy = correctCount / results.length;

    let difficulty: Difficulty;
    if (accuracy >= 0.85) {
      difficulty = 'hard';
    } else if (accuracy >= 0.60) {
      difficulty = 'medium';
    } else {
      difficulty = 'easy';
    }

    lastDifficulty.current = difficulty;
    return difficulty;
  }, []);

  const getAccuracy = useCallback((): number => {
    const results = recentResults.current;
    if (results.length === 0) return 0;
    return results.filter(Boolean).length / results.length;
  }, []);

  const reset = useCallback(() => {
    recentResults.current = [];
    consecutiveWrong.current = 0;
    cushionRemaining.current = 0;
    lastDifficulty.current = 'easy';
  }, []);

  return { getNextDifficulty, recordResult, getAccuracy, reset };
}
