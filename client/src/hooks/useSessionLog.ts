// 학습 세션 및 답변 로그 훅
// english_sessions + english_answer_logs 테이블 연동
import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AnswerLogInput {
  sessionId: number;
  word?: string;
  questionType?: string;
  difficulty?: string;
  userAnswer?: string;
  correctAnswer?: string;
  isCorrect: boolean;
  wasGuessing?: boolean;
  usedDontKnow?: boolean;
  hintsUsed?: number;
  answerTimeMs?: number;
  pronunciationScore?: number;
}

interface SessionEndInput {
  totalCorrect: number;
  totalWrong: number;
  totalDontKnow: number;
  guessingCount: number;
  xpEarned: number;
  coinsEarned: number;
}

export function useSessionLog() {
  // 새 세션 시작
  const startSession = useCallback(async (
    sessionType: string,
    unitId?: string,
  ): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .from('english_sessions')
        .insert({
          juwoo_id: 1,
          session_type: sessionType,
          unit_id: unitId ?? null,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id ?? null;
    } catch (err) {
      console.error('Session start error:', err);
      return null;
    }
  }, []);

  // 답변 로그 기록
  const logAnswer = useCallback(async (input: AnswerLogInput) => {
    try {
      const { error } = await supabase
        .from('english_answer_logs')
        .insert({
          session_id: input.sessionId,
          word: input.word ?? null,
          question_type: input.questionType ?? null,
          difficulty: input.difficulty ?? null,
          user_answer: input.userAnswer ?? null,
          correct_answer: input.correctAnswer ?? null,
          is_correct: input.isCorrect,
          was_guessing: input.wasGuessing ?? false,
          used_dont_know: input.usedDontKnow ?? false,
          hints_used: input.hintsUsed ?? 0,
          answer_time_ms: input.answerTimeMs ?? null,
          pronunciation_score: input.pronunciationScore ?? null,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Answer log error:', err);
    }
  }, []);

  // 세션 종료
  const endSession = useCallback(async (
    sessionId: number,
    input: SessionEndInput,
  ) => {
    try {
      const totalItems = input.totalCorrect + input.totalWrong + input.totalDontKnow;
      const { error } = await supabase
        .from('english_sessions')
        .update({
          total_items: totalItems,
          correct_count: input.totalCorrect,
          dont_know_count: input.totalDontKnow,
          guessing_count: input.guessingCount,
          xp_earned: input.xpEarned,
          coins_earned: input.coinsEarned,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (err) {
      console.error('Session end error:', err);
    }
  }, []);

  // 최근 세션 목록 조회 (부모 대시보드용)
  const getRecentSessions = useCallback(async (days = 7) => {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from('english_sessions')
        .select('*')
        .eq('juwoo_id', 1)
        .gte('started_at', since.toISOString())
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Recent sessions error:', err);
      return [];
    }
  }, []);

  // 세션별 답변 로그 조회
  const getSessionAnswers = useCallback(async (sessionId: number) => {
    try {
      const { data, error } = await supabase
        .from('english_answer_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Session answers error:', err);
      return [];
    }
  }, []);

  return {
    startSession,
    logAnswer,
    endSession,
    getRecentSessions,
    getSessionAnswers,
  };
}
