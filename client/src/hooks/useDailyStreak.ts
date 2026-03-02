// 일별 연속 학습일 (스트릭) 관리 훅
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useDailyStreak() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);

  const loadStreak = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // 오늘 기록 확인
      const { data: todayData } = await supabase
        .from('daily_streak')
        .select('*')
        .eq('juwoo_id', 1)
        .eq('date', today)
        .maybeSingle();

      setTodayCompleted(todayData?.completed ?? false);

      // 연속일 계산
      const { data: streakData } = await supabase
        .from('daily_streak')
        .select('date, completed, streak_frozen')
        .eq('juwoo_id', 1)
        .order('date', { ascending: false })
        .limit(30);

      if (!streakData) {
        setCurrentStreak(0);
        return;
      }

      let streak = 0;
      const sortedDates = streakData
        .filter(d => d.completed || d.streak_frozen)
        .map(d => d.date)
        .sort((a: string, b: string) => b.localeCompare(a));

      const now = new Date();
      for (let i = 0; i < sortedDates.length; i++) {
        const expected = new Date(now);
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];
        if (sortedDates[i] === expectedStr) {
          streak++;
        } else {
          break;
        }
      }

      setCurrentStreak(streak);
    } catch {
      // 테이블 없을 수 있음
    }
  }, []);

  const completeToday = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      await supabase
        .from('daily_streak')
        .upsert({
          juwoo_id: 1,
          date: today,
          completed: true,
        }, { onConflict: 'juwoo_id,date' });

      setTodayCompleted(true);
      await loadStreak();
    } catch {
      // 실패 무시
    }
  }, [loadStreak]);

  return { currentStreak, todayCompleted, loadStreak, completeToday };
}
