// 찍기 감지 훅
// - 3초 이내 오답: 찍기 의심
// - 같은 번호 연속 4회: 찍기 감지
// - 정답인 경우 3초 이내여도 감지 안 함

import { useCallback, useRef } from 'react';
import {
  GUESSING_TIME_THRESHOLD_MS,
  GUESSING_REPEAT_THRESHOLD,
  randomMessage,
  GUESSING_MESSAGES,
} from '@/lib/englishConstants';

interface GuessingResult {
  isGuessing: boolean;
  message: string;
}

export function useGuessingDetector() {
  const recentAnswers = useRef<number[]>([]);
  const guessingCount = useRef(0);

  const recordAnswer = useCallback((
    answerIndex: number,
    isCorrect: boolean,
    timeMs: number,
  ): GuessingResult => {
    // 정답인 경우 → 빠르더라도 찍기 아님 (아는 문제)
    if (isCorrect) {
      recentAnswers.current = [];
      return { isGuessing: false, message: '' };
    }

    // 1) 시간 기반 감지: 3초 이내 오답
    const tooFast = timeMs < GUESSING_TIME_THRESHOLD_MS;

    // 2) 패턴 기반 감지: 같은 번호 연속 선택
    recentAnswers.current.push(answerIndex);
    if (recentAnswers.current.length > GUESSING_REPEAT_THRESHOLD) {
      recentAnswers.current = recentAnswers.current.slice(-GUESSING_REPEAT_THRESHOLD);
    }

    const allSame =
      recentAnswers.current.length >= GUESSING_REPEAT_THRESHOLD &&
      recentAnswers.current.every((a) => a === recentAnswers.current[0]);

    const isGuessing = tooFast || allSame;

    if (isGuessing) {
      guessingCount.current += 1;
      recentAnswers.current = [];
      return {
        isGuessing: true,
        message: randomMessage(GUESSING_MESSAGES),
      };
    }

    return { isGuessing: false, message: '' };
  }, []);

  const resetDetector = useCallback(() => {
    recentAnswers.current = [];
  }, []);

  const getGuessingCount = useCallback(() => guessingCount.current, []);

  const resetGuessingCount = useCallback(() => {
    guessingCount.current = 0;
  }, []);

  return { recordAnswer, resetDetector, getGuessingCount, resetGuessingCount };
}
