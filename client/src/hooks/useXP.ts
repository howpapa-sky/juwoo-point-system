// 경험치(XP) & 레벨 관리 훅
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { XP_TABLE, getLevelFromXP, getLevelProgress, type EnglishLevel } from '@/lib/englishConstants';

// KST 오늘 날짜 (YYYY-MM-DD)
function getKSTToday(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function getKSTYesterday(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  kst.setDate(kst.getDate() - 1);
  return kst.toISOString().slice(0, 10);
}

export interface EnglishProfile {
  id: number;
  juwoo_id: number;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  total_study_minutes: number;
  total_words_learned: number;
  total_words_mastered: number;
  total_stories_completed: number;
  total_pronunciation_practices: number;
}

export function useXP() {
  const [profile, setProfile] = useState<EnglishProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelUpInfo, setLevelUpInfo] = useState<EnglishLevel | null>(null);
  const profileRef = useRef<EnglishProfile | null>(null);

  // profileRef를 profile과 동기화
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('english_profile')
        .select('*')
        .eq('juwoo_id', 1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // 프로필 없으면 생성
        const { data: created, error: createErr } = await supabase
          .from('english_profile')
          .upsert({ juwoo_id: 1 }, { onConflict: 'juwoo_id' })
          .select()
          .single();
        if (createErr) throw createErr;
        setProfile(created);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('XP profile load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // XP 추가 (useRef로 stale closure 방지)
  const addXP = useCallback(async (action: keyof typeof XP_TABLE, multiplier = 1): Promise<{ xpGained: number; leveledUp: boolean; newLevel?: EnglishLevel }> => {
    const xp = XP_TABLE[action] * multiplier;
    const current = profileRef.current;
    if (!current) return { xpGained: 0, leveledUp: false };

    const oldLevel = getLevelFromXP(current.total_xp);
    const newTotalXP = current.total_xp + xp;
    const newLevel = getLevelFromXP(newTotalXP);
    const leveledUp = newLevel.level > oldLevel.level;

    try {
      const { error } = await supabase
        .from('english_profile')
        .update({
          total_xp: newTotalXP,
          level: newLevel.level,
          updated_at: new Date().toISOString(),
        })
        .eq('juwoo_id', 1);

      if (error) throw error;

      const updated = { ...current, total_xp: newTotalXP, level: newLevel.level };
      profileRef.current = updated;
      setProfile(updated);

      if (leveledUp) {
        setLevelUpInfo(newLevel);
      }

      return { xpGained: xp, leveledUp, newLevel: leveledUp ? newLevel : undefined };
    } catch (err) {
      console.error('XP add error:', err);
      return { xpGained: 0, leveledUp: false };
    }
  }, []);

  // 스트릭 업데이트 (KST 기준)
  const updateStreak = useCallback(async () => {
    const current = profileRef.current;
    if (!current) return;

    const today = getKSTToday();
    const lastDate = current.last_study_date;

    if (lastDate === today) {
      // 이미 오늘 학습함
      return;
    }

    let newStreak: number;
    const yesterdayStr = getKSTYesterday();

    if (lastDate === yesterdayStr) {
      newStreak = current.current_streak + 1;
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, current.longest_streak);

    try {
      const { error } = await supabase
        .from('english_profile')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_study_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('juwoo_id', 1);

      if (error) throw error;

      const updated = { ...current, current_streak: newStreak, longest_streak: longestStreak, last_study_date: today };
      profileRef.current = updated;
      setProfile(updated);
    } catch (err) {
      console.error('Streak update error:', err);
    }
  }, []);

  // 학습 통계 업데이트
  const incrementStat = useCallback(async (stat: 'total_words_learned' | 'total_words_mastered' | 'total_stories_completed' | 'total_pronunciation_practices', amount = 1) => {
    const current = profileRef.current;
    if (!current) return;

    try {
      const newVal = (current[stat] ?? 0) + amount;
      const { error } = await supabase
        .from('english_profile')
        .update({
          [stat]: newVal,
          updated_at: new Date().toISOString(),
        })
        .eq('juwoo_id', 1);

      if (error) throw error;
      const updated = { ...current, [stat]: newVal };
      profileRef.current = updated;
      setProfile(updated);
    } catch (err) {
      console.error('Stat update error:', err);
    }
  }, []);

  // 레벨업 알림 dismiss
  const dismissLevelUp = useCallback(() => {
    setLevelUpInfo(null);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const levelProgress = profile ? getLevelProgress(profile.total_xp) : null;

  return {
    profile,
    loading,
    levelProgress,
    levelUpInfo,
    addXP,
    updateStreak,
    incrementStat,
    dismissLevelUp,
    reload: loadProfile,
  };
}
