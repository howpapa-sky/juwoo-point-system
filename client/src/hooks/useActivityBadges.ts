import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export interface ActivityBadge {
  id: number;
  badge_type: 'reading' | 'exercise';
  name: string;
  description: string;
  emoji: string;
  requirement_type: string;
  requirement_value: number;
  is_earned: boolean;
  earned_at: string | null;
}

export function useActivityBadges() {
  const [badges, setBadges] = useState<ActivityBadge[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBadges = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_badges')
      .select('*')
      .order('id');

    if (!error) {
      setBadges(data ?? []);
    }
    setLoading(false);
  }, []);

  const checkBooksCountBadges = useCallback(async () => {
    const { count } = await supabase
      .from('my_bookshelf')
      .select('*', { count: 'exact', head: true });

    if (count === null) return;

    const { data: unearned } = await supabase
      .from('activity_badges')
      .select('*')
      .eq('badge_type', 'reading')
      .eq('requirement_type', 'books_count')
      .eq('is_earned', false)
      .lte('requirement_value', count);

    if (unearned && unearned.length > 0) {
      for (const badge of unearned) {
        await supabase
          .from('activity_badges')
          .update({ is_earned: true, earned_at: new Date().toISOString() })
          .eq('id', badge.id);

        confetti({ particleCount: 50, spread: 60 });
        toast.success(`새로운 배지! ${badge.emoji} ${badge.name}`);
      }
    }
  }, []);

  const checkReadingStreakBadges = useCallback(async () => {
    const { data: streak } = await supabase
      .from('streaks')
      .select('current_count')
      .eq('streak_type', 'reading')
      .single();

    if (!streak) return;

    const { data: unearned } = await supabase
      .from('activity_badges')
      .select('*')
      .eq('badge_type', 'reading')
      .eq('requirement_type', 'reading_streak')
      .eq('is_earned', false)
      .lte('requirement_value', streak.current_count ?? 0);

    if (unearned && unearned.length > 0) {
      for (const badge of unearned) {
        await supabase
          .from('activity_badges')
          .update({ is_earned: true, earned_at: new Date().toISOString() })
          .eq('id', badge.id);

        confetti({ particleCount: 50, spread: 60 });
        toast.success(`새로운 배지! ${badge.emoji} ${badge.name}`);
      }
    }
  }, []);

  const checkExerciseCountBadges = useCallback(async () => {
    const { count } = await supabase
      .from('exercise_logs')
      .select('*', { count: 'exact', head: true });

    if (count === null) return;

    const { data: unearned } = await supabase
      .from('activity_badges')
      .select('*')
      .eq('badge_type', 'exercise')
      .eq('requirement_type', 'exercise_count')
      .eq('is_earned', false)
      .lte('requirement_value', count);

    if (unearned && unearned.length > 0) {
      for (const badge of unearned) {
        await supabase
          .from('activity_badges')
          .update({ is_earned: true, earned_at: new Date().toISOString() })
          .eq('id', badge.id);

        confetti({ particleCount: 50, spread: 60 });
        toast.success(`새로운 배지! ${badge.emoji} ${badge.name}`);
      }
    }
  }, []);

  const checkExerciseStreakBadges = useCallback(async () => {
    const { data: streak } = await supabase
      .from('streaks')
      .select('current_count')
      .eq('streak_type', 'exercise')
      .single();

    if (!streak) return;

    const { data: unearned } = await supabase
      .from('activity_badges')
      .select('*')
      .eq('badge_type', 'exercise')
      .eq('requirement_type', 'exercise_streak')
      .eq('is_earned', false)
      .lte('requirement_value', streak.current_count ?? 0);

    if (unearned && unearned.length > 0) {
      for (const badge of unearned) {
        await supabase
          .from('activity_badges')
          .update({ is_earned: true, earned_at: new Date().toISOString() })
          .eq('id', badge.id);

        confetti({ particleCount: 50, spread: 60 });
        toast.success(`새로운 배지! ${badge.emoji} ${badge.name}`);
      }
    }
  }, []);

  const checkAllBadges = useCallback(async () => {
    await Promise.all([
      checkBooksCountBadges(),
      checkReadingStreakBadges(),
      checkExerciseCountBadges(),
      checkExerciseStreakBadges(),
    ]);
    await loadBadges();
  }, [checkBooksCountBadges, checkReadingStreakBadges, checkExerciseCountBadges, checkExerciseStreakBadges, loadBadges]);

  return {
    badges,
    loading,
    loadBadges,
    checkAllBadges,
    checkBooksCountBadges,
    checkReadingStreakBadges,
    checkExerciseCountBadges,
    checkExerciseStreakBadges,
  };
}
