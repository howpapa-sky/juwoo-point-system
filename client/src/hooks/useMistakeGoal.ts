// 실수 목표 시스템 훅
// 실수를 "실패"가 아닌 "훈련의 일부"로 재프레이밍.
// 성장 마인드셋(Dweck, 2006): 실수 목표를 설정하면 편도체 위협 반응 감소.
// HA1 예기불안 8점(평균 2.3배) → 실수에 대한 사전 허가가 불안 완화에 핵심.

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface MistakeGoal {
  id: number;
  goal_date: string;
  target_mistakes: number;
  actual_mistakes: number;
  goal_met: boolean;
  created_at: string;
}

export function useMistakeGoal() {
  const [todayGoal, setTodayGoal] = useState<MistakeGoal | null>(null);
  const [loading, setLoading] = useState(false);

  const getTodayDateStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // 오늘 목표 로드 (없으면 생성)
  const loadOrCreateTodayGoal = useCallback(async (): Promise<MistakeGoal | null> => {
    try {
      setLoading(true);
      const today = getTodayDateStr();

      const { data, error } = await supabase
        .from('mistake_goals')
        .select('*')
        .eq('goal_date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTodayGoal(data);
        return data;
      }

      // 오늘 목표 생성
      const { data: created, error: insertErr } = await supabase
        .from('mistake_goals')
        .insert({
          goal_date: today,
          target_mistakes: 3,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      setTodayGoal(created);
      return created;
    } catch (err) {
      if (import.meta.env.DEV) console.error('실수 목표 로드 에러:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 실수 횟수 증가
  const incrementMistake = useCallback(async (): Promise<{ goalMet: boolean } | null> => {
    try {
      let goal = todayGoal;
      if (!goal) {
        goal = await loadOrCreateTodayGoal();
      }
      if (!goal) return null;

      const newCount = goal.actual_mistakes + 1;
      const goalMet = newCount >= goal.target_mistakes;

      const { data: updated, error } = await supabase
        .from('mistake_goals')
        .update({
          actual_mistakes: newCount,
          goal_met: goalMet,
        })
        .eq('id', goal.id)
        .select()
        .single();

      if (error) throw error;
      setTodayGoal(updated);
      return { goalMet };
    } catch (err) {
      if (import.meta.env.DEV) console.error('실수 목표 업데이트 에러:', err);
      return null;
    }
  }, [todayGoal, loadOrCreateTodayGoal]);

  return {
    todayGoal,
    loading,
    loadOrCreateTodayGoal,
    incrementMistake,
  };
}
