// 퀴즈 세션 상태 관리 훅
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { QuizMode, SessionPhase } from '@/lib/quizConstants';
import { SESSION_CONFIG, POINT_REWARDS } from '@/lib/quizConstants';
import { type QuizQuestion, generateQuestions, calculateStarRating } from '@/lib/quizEngine';
import type { EnglishWord, WordCategory, WordDifficulty } from '@/data/englishWordsData';

export interface SessionState {
  phase: SessionPhase;
  questions: QuizQuestion[];
  currentIndex: number;
  correctCount: number;
  wrongWords: EnglishWord[];
  score: number;
  streak: number;
  maxStreak: number;
  combo: number;
  earnedXP: number;
  starRating: number;
}

const initialState: SessionState = {
  phase: 'greeting',
  questions: [],
  currentIndex: 0,
  correctCount: 0,
  wrongWords: [],
  score: 0,
  streak: 0,
  maxStreak: 0,
  combo: 1,
  earnedXP: 0,
  starRating: 0,
};

export function useQuizSession() {
  const [session, setSession] = useState<SessionState>(initialState);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const startSession = useCallback(async (
    mode: QuizMode,
    difficulty: WordDifficulty | 'all',
    category: WordCategory | 'all',
  ) => {
    const questions = generateQuestions(mode, difficulty, category);
    setSession({
      ...initialState,
      phase: 'greeting',
      questions,
    });

    // DB에 세션 기록 시작
    try {
      const { data } = await supabase
        .from('quiz_sessions')
        .insert({
          juwoo_id: 1,
          session_type: mode,
          category: category === 'all' ? null : category,
          difficulty: difficulty,
          total_questions: questions.length,
        })
        .select('id')
        .single();

      if (data) setSessionId(data.id);
    } catch {
      // 테이블 없을 수 있음
    }
  }, []);

  const advancePhase = useCallback(() => {
    setSession(prev => {
      if (prev.phase === 'greeting') return { ...prev, phase: 'main' };
      if (prev.phase === 'main' && prev.currentIndex >= prev.questions.length - 1) {
        if (prev.wrongWords.length > 0) {
          // 보너스 라운드 문제 생성
          const bonusQuestions: QuizQuestion[] = prev.wrongWords
            .slice(0, SESSION_CONFIG.maxBonusRound)
            .map(word => ({
              word,
              questionType: 'multiple-choice' as QuizMode,
              options: undefined,
              correctAnswer: word.meaning,
              isBonusRound: true,
            }));
          return {
            ...prev,
            phase: 'bonus-round',
            questions: [...prev.questions, ...bonusQuestions],
          };
        }
        return { ...prev, phase: 'complete' };
      }
      if (prev.phase === 'bonus-round') return { ...prev, phase: 'complete' };
      return prev;
    });
  }, []);

  const recordAnswer = useCallback((isCorrect: boolean, word: EnglishWord) => {
    setSession(prev => {
      const baseXP = { easy: 10, medium: 15, hard: 25, expert: 40 };
      let xpGained = baseXP[word.difficulty as keyof typeof baseXP] ?? 10;

      if (isCorrect) {
        const newStreak = prev.streak + 1;
        const basePoints = word.difficulty === 'easy' ? 10 :
                          word.difficulty === 'medium' ? 15 :
                          word.difficulty === 'hard' ? 25 : 40;
        const streakBonus = Math.min(newStreak * 3, 30);
        const comboMultiplier = Math.min(prev.combo, 5);
        const totalPoints = Math.floor((basePoints + streakBonus) * comboMultiplier);

        if (newStreak >= 10) xpGained *= 2;
        else if (newStreak >= 5) xpGained *= 1.5;
        else if (newStreak >= 3) xpGained *= 1.2;

        return {
          ...prev,
          correctCount: prev.correctCount + 1,
          score: prev.score + totalPoints,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          combo: Math.min(prev.combo + 0.2, 5),
          earnedXP: prev.earnedXP + Math.floor(xpGained),
        };
      }

      return {
        ...prev,
        streak: 0,
        combo: 1,
        wrongWords: [...prev.wrongWords, word],
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setSession(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
    }));
  }, []);

  const completeSession = useCallback(async () => {
    const stars = calculateStarRating(session.correctCount, session.questions.length);
    setSession(prev => ({ ...prev, phase: 'complete', starRating: stars }));

    // DB 세션 완료 기록
    if (sessionId) {
      try {
        await supabase
          .from('quiz_sessions')
          .update({
            completed_at: new Date().toISOString(),
            correct_answers: session.correctCount,
            xp_earned: session.earnedXP,
            star_rating: stars,
          })
          .eq('id', sessionId);
      } catch {
        // 무시
      }
    }

    return stars;
  }, [session, sessionId]);

  const awardPoints = useCallback(async (
    mode: QuizMode,
    correctCount: number,
    totalQuestions: number,
    maxStreak: number,
    speedCount?: number,
    bossHP?: number,
    bossName?: string,
  ) => {
    try {
      // 오늘 이미 영어 퀴즈 포인트를 받았는지 확인 (일일 제한)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: existing } = await supabase
        .from('point_transactions')
        .select('id')
        .eq('juwoo_id', 1)
        .like('note', '영어 퀴즈%')
        .gte('created_at', today.toISOString())
        .limit(1);

      if (existing && existing.length > 0) {
        return 0;
      }

      const { data: profile } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      const currentBalance = profile?.current_points ?? 0;
      const totalQ = mode === 'speed-round' ? (speedCount ?? 1) : totalQuestions;
      const scorePercent = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

      let points = 0;
      let note = '';

      if (mode === 'boss-battle' && (bossHP ?? 100) <= 0) {
        points = POINT_REWARDS.bossKill;
        note = `영어 퀴즈 보스 ${bossName ?? '보스'} 처치! 🗡️`;
      } else if (mode === 'speed-round') {
        points = (speedCount ?? 0) * POINT_REWARDS.speedPerCorrect;
        note = `영어 퀴즈 스피드 라운드 ${speedCount}개 정답! ⚡`;
      } else if (mode === 'survival' && correctCount >= 20) {
        points = correctCount * POINT_REWARDS.survivalPerCorrect;
        note = `영어 퀴즈 서바이벌 ${correctCount}문제 클리어! 🏅`;
      } else if (scorePercent === 100) {
        points = POINT_REWARDS.perfect;
        note = '영어 퀴즈 만점 달성! 🏆';
      } else if (scorePercent >= 90) {
        points = POINT_REWARDS.over90;
        note = '영어 퀴즈 마스터! ⭐';
      } else if (scorePercent >= 80) {
        points = POINT_REWARDS.over80;
        note = '영어 퀴즈 고수! 💪';
      } else if (scorePercent >= 70) {
        points = POINT_REWARDS.over70;
        note = '영어 퀴즈 도전자!';
      } else if (scorePercent >= 50) {
        points = POINT_REWARDS.over50;
        note = '영어 퀴즈 학습중!';
      } else if (correctCount > 0) {
        points = POINT_REWARDS.participation;
        note = '영어 퀴즈 도전!';
      }

      if (maxStreak >= 10) {
        points += POINT_REWARDS.streakBonus10;
        note += ' (10연속 보너스!)';
      } else if (maxStreak >= 5) {
        points += POINT_REWARDS.streakBonus5;
      }

      if (points > 0) {
        const newBalance = currentBalance + points;

        const { error: txError } = await supabase.from('point_transactions').insert({
          juwoo_id: 1,
          rule_id: null,
          amount: points,
          balance_after: newBalance,
          note,
          created_by: 1,
        });

        if (txError) throw txError;

        const { error: updateError } = await supabase
          .from('juwoo_profile')
          .update({ current_points: newBalance })
          .eq('id', 1);

        if (updateError) throw updateError;
      }

      return points;
    } catch {
      return 0;
    }
  }, []);

  const resetSession = useCallback(() => {
    setSession(initialState);
    setSessionId(null);
  }, []);

  return {
    session,
    startSession,
    advancePhase,
    recordAnswer,
    nextQuestion,
    completeSession,
    awardPoints,
    resetSession,
  };
}
