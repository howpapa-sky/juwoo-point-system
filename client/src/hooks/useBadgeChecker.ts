// 배지 획득 체크 및 관리 훅
// english_badges 테이블 연동
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ENGLISH_BADGES, type EnglishBadgeDef } from '@/data/englishBadges';
import type { EnglishProfile } from './useXP';

export interface EarnedBadge {
  id: number;
  badge_id: string;
  earned_at: string;
}

export function useBadgeChecker() {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState<EnglishBadgeDef | null>(null);

  const loadEarnedBadges = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('english_badges')
        .select('*')
        .eq('juwoo_id', 1)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setEarnedBadges(data ?? []);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Badge load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 배지 획득
  const awardBadge = useCallback(async (badgeId: string): Promise<boolean> => {
    // 이미 획득한 배지인지 확인
    const already = earnedBadges.some((b) => b.badge_id === badgeId);
    if (already) return false;

    try {
      const { error } = await supabase
        .from('english_badges')
        .upsert({
          juwoo_id: 1,
          badge_id: badgeId,
          earned_at: new Date().toISOString(),
        }, { onConflict: 'juwoo_id,badge_id' });

      if (error) throw error;

      const def = ENGLISH_BADGES.find((b) => b.id === badgeId);
      if (def) setNewBadge(def);

      await loadEarnedBadges();
      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Badge award error:', err);
      return false;
    }
  }, [earnedBadges, loadEarnedBadges]);

  // 배지 조건 검사 (프로필 + SRS 통계 기반)
  const checkBadges = useCallback(async (
    profile: EnglishProfile | null,
    gardenStats: Record<number, number>,
  ) => {
    if (!profile) return;

    const earned = new Set(earnedBadges.map((b) => b.badge_id));
    const toAward: string[] = [];

    // === 학습량 배지 ===
    const wordsLearned = profile.total_words_learned ?? 0;
    if (wordsLearned >= 1 && !earned.has('first-word')) toAward.push('first-word');
    if (wordsLearned >= 10 && !earned.has('ten-words')) toAward.push('ten-words');
    if (wordsLearned >= 25 && !earned.has('twenty-five-words')) toAward.push('twenty-five-words');
    if (wordsLearned >= 50 && !earned.has('fifty-words')) toAward.push('fifty-words');
    if (wordsLearned >= 100 && !earned.has('hundred-words')) toAward.push('hundred-words');

    // === 스트릭 배지 ===
    const streak = profile.current_streak ?? 0;
    const longestStreak = profile.longest_streak ?? 0;
    const maxStreak = Math.max(streak, longestStreak);
    if (maxStreak >= 3 && !earned.has('streak-3')) toAward.push('streak-3');
    if (maxStreak >= 7 && !earned.has('streak-7')) toAward.push('streak-7');
    if (maxStreak >= 14 && !earned.has('streak-14')) toAward.push('streak-14');
    if (maxStreak >= 30 && !earned.has('streak-30')) toAward.push('streak-30');

    // === 스킬 배지 (SRS 정원) ===
    const box4Count = gardenStats[4] ?? 0;
    const box5Count = gardenStats[5] ?? 0;
    if (box4Count >= 10 && !earned.has('garden-keeper')) toAward.push('garden-keeper');
    if (box5Count >= 10 && !earned.has('star-collector')) toAward.push('star-collector');

    // === 스토리 배지 ===
    const storiesCompleted = profile.total_stories_completed ?? 0;
    if (storiesCompleted >= 3 && !earned.has('story-lover')) toAward.push('story-lover');
    if (storiesCompleted >= 6 && !earned.has('story-master')) toAward.push('story-master');

    // === 발음 배지 ===
    const pronunciationPractices = profile.total_pronunciation_practices ?? 0;
    if (pronunciationPractices >= 10 && !earned.has('good-voice')) toAward.push('good-voice');

    // 한 번에 하나씩만 알림 (마지막 것)
    for (const badgeId of toAward) {
      await awardBadge(badgeId);
    }
  }, [earnedBadges, awardBadge]);

  // 특정 이벤트 기반 배지 체크 (세션 데이터 필요)
  const checkSessionBadges = useCallback(async (stats: {
    dontKnowCount?: number;
    guessingFreeCount?: number;
    reviewSessionCount?: number;
  }) => {
    const earned = new Set(earnedBadges.map((b) => b.badge_id));

    // 모르겠어요 사용 배지 — 누적이므로 DB에서 총합 조회
    try {
      const { data: sessions } = await supabase
        .from('english_sessions')
        .select('dont_know_count')
        .eq('juwoo_id', 1);

      const totalDontKnow = (sessions ?? []).reduce((sum, s) => sum + (s.dont_know_count ?? 0), 0);
      if (totalDontKnow >= 10 && !earned.has('brave-learner')) await awardBadge('brave-learner');
      if (totalDontKnow >= 50 && !earned.has('super-brave')) await awardBadge('super-brave');

      // 찍기 0회 퀴즈 완료 횟수
      const guessingFreeCount = (sessions ?? []).filter(
        (s) => (s.dont_know_count ?? 0) >= 0 && s.dont_know_count !== null,
      ).length;
      if (guessingFreeCount >= 5 && !earned.has('honest-player')) await awardBadge('honest-player');

      // 복습 세션 배지
      const reviewSessions = (sessions ?? []).filter(
        (s) => s.dont_know_count !== null,
      );
      if (reviewSessions.length >= 1 && !earned.has('first-review')) await awardBadge('first-review');
      if (reviewSessions.length >= 30 && !earned.has('review-master')) await awardBadge('review-master');
    } catch (err) {
      if (import.meta.env.DEV) console.error('Session badge check error:', err);
    }
  }, [earnedBadges, awardBadge]);

  // 새 배지 알림 dismiss
  const dismissNewBadge = useCallback(() => {
    setNewBadge(null);
  }, []);

  // 배지 획득 여부 확인
  const hasBadge = useCallback((badgeId: string): boolean => {
    return earnedBadges.some((b) => b.badge_id === badgeId);
  }, [earnedBadges]);

  useEffect(() => {
    loadEarnedBadges();
  }, [loadEarnedBadges]);

  return {
    earnedBadges,
    loading,
    newBadge,
    checkBadges,
    checkSessionBadges,
    awardBadge,
    dismissNewBadge,
    hasBadge,
    reload: loadEarnedBadges,
  };
}
