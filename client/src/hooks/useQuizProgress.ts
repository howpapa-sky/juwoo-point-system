// 퀴즈 진행률 관리 훅
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { QuizTier, isQuizPassed } from '@/data/quizData/types';

export interface QuizProgress {
  id: number;
  juwoo_id: number;
  book_id: string;
  quiz_tier: QuizTier;
  is_unlocked: boolean;
  is_completed: boolean;
  best_score: number;
  total_attempts: number;
  last_attempt_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  bookId: string;
  quizTier: QuizTier;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  hintsUsed: number;
  basePoints: number;
  earnedPoints: number;
  timeSpentSeconds?: number;
}

export function useQuizProgress(bookId: string) {
  const [progressByTier, setProgressByTier] = useState<Record<QuizTier, QuizProgress | null>>({
    basic: null,
    intermediate: null,
    master: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 진행률 로드
  const loadProgress = useCallback(async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('ebook_quiz_progress')
        .select('*')
        .eq('juwoo_id', 1)
        .eq('book_id', bookId);

      if (fetchError) throw fetchError;

      const byTier: Record<QuizTier, QuizProgress | null> = {
        basic: null,
        intermediate: null,
        master: null,
      };

      data?.forEach((item: QuizProgress) => {
        byTier[item.quiz_tier as QuizTier] = item;
      });

      setProgressByTier(byTier);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  // 티어 잠금 해제
  const unlockTier = useCallback(async (tier: QuizTier) => {
    if (!bookId) return;

    try {
      const { data, error: upsertError } = await supabase
        .from('ebook_quiz_progress')
        .upsert({
          juwoo_id: 1,
          book_id: bookId,
          quiz_tier: tier,
          is_unlocked: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'juwoo_id,book_id,quiz_tier',
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      setProgressByTier(prev => ({
        ...prev,
        [tier]: data,
      }));

      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, [bookId]);

  // 퀴즈 완료 처리
  const completeQuiz = useCallback(async (
    tier: QuizTier,
    score: number,
    correctCount: number,
    totalQuestions: number
  ) => {
    if (!bookId) return { passed: false, nextTierUnlocked: false };

    const passed = isQuizPassed(correctCount, totalQuestions);
    const currentProgress = progressByTier[tier];
    const isNewBestScore = !currentProgress || score > currentProgress.best_score;

    try {
      // 1. 현재 티어 업데이트
      const { error: updateError } = await supabase
        .from('ebook_quiz_progress')
        .upsert({
          juwoo_id: 1,
          book_id: bookId,
          quiz_tier: tier,
          is_unlocked: true,
          is_completed: passed || (currentProgress?.is_completed || false),
          best_score: isNewBestScore ? score : (currentProgress?.best_score || 0),
          total_attempts: (currentProgress?.total_attempts || 0) + 1,
          last_attempt_at: new Date().toISOString(),
          completed_at: passed ? new Date().toISOString() : currentProgress?.completed_at,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'juwoo_id,book_id,quiz_tier',
        });

      if (updateError) throw updateError;

      // 2. 통과 시 다음 티어 해금
      let nextTierUnlocked = false;
      if (passed) {
        const nextTier = tier === 'basic' ? 'intermediate' : tier === 'intermediate' ? 'master' : null;
        if (nextTier) {
          await unlockTier(nextTier);
          nextTierUnlocked = true;
        }
      }

      // 진행률 다시 로드
      await loadProgress();

      return { passed, nextTierUnlocked, isNewBestScore };
    } catch (err) {
      setError(err as Error);
      return { passed: false, nextTierUnlocked: false, isNewBestScore: false };
    }
  }, [bookId, progressByTier, unlockTier, loadProgress]);

  // 퀴즈 시도 기록 저장
  const saveAttempt = useCallback(async (attempt: QuizAttempt) => {
    try {
      const { error: insertError } = await supabase
        .from('quiz_attempt_history')
        .insert({
          juwoo_id: 1,
          book_id: attempt.bookId,
          quiz_tier: attempt.quizTier,
          question_id: attempt.questionId,
          user_answer: attempt.userAnswer,
          is_correct: attempt.isCorrect,
          hints_used: attempt.hintsUsed,
          base_points: attempt.basePoints,
          earned_points: attempt.earnedPoints,
          time_spent_seconds: attempt.timeSpentSeconds,
        });

      if (insertError) throw insertError;
    } catch (err) {
      console.error('Failed to save quiz attempt:', err);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // 티어 잠금 상태 확인
  const isTierUnlocked = useCallback((tier: QuizTier): boolean => {
    if (tier === 'basic') {
      // 기초 퀴즈는 e북 완독 시 해금 (이 훅에서는 항상 true로 가정, 별도 체크 필요)
      return progressByTier.basic?.is_unlocked || false;
    }
    if (tier === 'intermediate') {
      return progressByTier.intermediate?.is_unlocked || false;
    }
    if (tier === 'master') {
      return progressByTier.master?.is_unlocked || false;
    }
    return false;
  }, [progressByTier]);

  // 티어 완료 상태 확인
  const isTierCompleted = useCallback((tier: QuizTier): boolean => {
    return progressByTier[tier]?.is_completed || false;
  }, [progressByTier]);

  return {
    progressByTier,
    loading,
    error,
    unlockTier,
    completeQuiz,
    saveAttempt,
    isTierUnlocked,
    isTierCompleted,
    reload: loadProgress,
  };
}

// 포인트 지급 함수
export async function awardQuizPoints(
  bookId: string,
  tier: QuizTier,
  score: number,
  note: string
): Promise<boolean> {
  try {
    // 1. 현재 포인트 조회
    const { data: profile } = await supabase
      .from('juwoo_profile')
      .select('current_points')
      .eq('id', 1)
      .single();

    const currentBalance = profile?.current_points || 0;
    const newBalance = currentBalance + score;

    // 2. 트랜잭션 기록
    const { error: txError } = await supabase
      .from('point_transactions')
      .insert({
        juwoo_id: 1,
        rule_id: null,
        amount: score,
        balance_after: newBalance,
        note: note,
        created_by: 1,
      });

    if (txError) throw txError;

    // 3. 프로필 업데이트
    const { error: updateError } = await supabase
      .from('juwoo_profile')
      .update({ current_points: newBalance })
      .eq('id', 1);

    if (updateError) throw updateError;

    return true;
  } catch (err) {
    console.error('Failed to award quiz points:', err);
    return false;
  }
}
