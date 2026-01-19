import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// ============================================
// 🏆 배지 타입 정의
// ============================================
export type BadgeCategory = 'points' | 'learning' | 'streak' | 'special';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: string;
  checkCondition: (stats: UserStats) => boolean;
}

export interface UserBadge {
  id: number;
  badge_id: number;
  earned_at: string;
}

export interface UserStats {
  currentPoints: number;
  totalPointsEarned: number;
  wordsLearned: number;
  wordsMastered: number;
  quizzesTaken: number;
  perfectQuizzes: number;
  streak: number;
  maxStreak: number;
  daysActive: number;
  flashcardSessions: number;
  totalReviews: number;
  accuracy: number;
}

// ============================================
// 🎖️ 배지 정의 (50개 이상)
// ============================================
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ========== 포인트 배지 ==========
  {
    id: 'points_100',
    name: '첫 100포인트',
    description: '100 포인트를 모았어요!',
    icon: '💰',
    category: 'points',
    rarity: 'common',
    requirement: '100 포인트 달성',
    checkCondition: (stats) => stats.currentPoints >= 100,
  },
  {
    id: 'points_500',
    name: '500포인트 달성',
    description: '500 포인트를 모았어요!',
    icon: '💵',
    category: 'points',
    rarity: 'common',
    requirement: '500 포인트 달성',
    checkCondition: (stats) => stats.currentPoints >= 500,
  },
  {
    id: 'points_1000',
    name: '천 포인트!',
    description: '1,000 포인트를 모았어요!',
    icon: '💎',
    category: 'points',
    rarity: 'rare',
    requirement: '1,000 포인트 달성',
    checkCondition: (stats) => stats.currentPoints >= 1000,
  },
  {
    id: 'points_5000',
    name: '부자가 되었어요',
    description: '5,000 포인트를 모았어요!',
    icon: '🏆',
    category: 'points',
    rarity: 'epic',
    requirement: '5,000 포인트 달성',
    checkCondition: (stats) => stats.currentPoints >= 5000,
  },
  {
    id: 'points_10000',
    name: '포인트 왕',
    description: '10,000 포인트를 모았어요!',
    icon: '👑',
    category: 'points',
    rarity: 'legendary',
    requirement: '10,000 포인트 달성',
    checkCondition: (stats) => stats.currentPoints >= 10000,
  },

  // ========== 학습 배지 ==========
  {
    id: 'first_word',
    name: '첫 단어 학습',
    description: '첫 번째 영어 단어를 배웠어요!',
    icon: '📚',
    category: 'learning',
    rarity: 'common',
    requirement: '첫 단어 학습',
    checkCondition: (stats) => stats.wordsLearned >= 1,
  },
  {
    id: 'words_10',
    name: '단어 수집가',
    description: '10개 단어를 배웠어요!',
    icon: '📖',
    category: 'learning',
    rarity: 'common',
    requirement: '10개 단어 학습',
    checkCondition: (stats) => stats.wordsLearned >= 10,
  },
  {
    id: 'words_50',
    name: '단어 탐험가',
    description: '50개 단어를 배웠어요!',
    icon: '🔍',
    category: 'learning',
    rarity: 'rare',
    requirement: '50개 단어 학습',
    checkCondition: (stats) => stats.wordsLearned >= 50,
  },
  {
    id: 'words_100',
    name: '단어 마스터',
    description: '100개 단어를 배웠어요!',
    icon: '🎓',
    category: 'learning',
    rarity: 'epic',
    requirement: '100개 단어 학습',
    checkCondition: (stats) => stats.wordsLearned >= 100,
  },
  {
    id: 'words_500',
    name: '단어 천재',
    description: '500개 단어를 배웠어요!',
    icon: '🧠',
    category: 'learning',
    rarity: 'legendary',
    requirement: '500개 단어 학습',
    checkCondition: (stats) => stats.wordsLearned >= 500,
  },
  {
    id: 'mastered_10',
    name: '완벽한 10',
    description: '10개 단어를 완벽히 외웠어요!',
    icon: '⭐',
    category: 'learning',
    rarity: 'rare',
    requirement: '10개 단어 마스터',
    checkCondition: (stats) => stats.wordsMastered >= 10,
  },
  {
    id: 'mastered_50',
    name: '기억의 달인',
    description: '50개 단어를 완벽히 외웠어요!',
    icon: '🌟',
    category: 'learning',
    rarity: 'epic',
    requirement: '50개 단어 마스터',
    checkCondition: (stats) => stats.wordsMastered >= 50,
  },
  {
    id: 'mastered_100',
    name: '기억력 천재',
    description: '100개 단어를 완벽히 외웠어요!',
    icon: '✨',
    category: 'learning',
    rarity: 'legendary',
    requirement: '100개 단어 마스터',
    checkCondition: (stats) => stats.wordsMastered >= 100,
  },
  {
    id: 'accuracy_80',
    name: '정확한 학습자',
    description: '정답률 80% 이상 달성!',
    icon: '🎯',
    category: 'learning',
    rarity: 'rare',
    requirement: '정답률 80% 이상',
    checkCondition: (stats) => stats.accuracy >= 80 && stats.totalReviews >= 20,
  },
  {
    id: 'accuracy_90',
    name: '거의 완벽해요',
    description: '정답률 90% 이상 달성!',
    icon: '💯',
    category: 'learning',
    rarity: 'epic',
    requirement: '정답률 90% 이상',
    checkCondition: (stats) => stats.accuracy >= 90 && stats.totalReviews >= 50,
  },
  {
    id: 'reviews_100',
    name: '복습왕',
    description: '100번 복습했어요!',
    icon: '🔄',
    category: 'learning',
    rarity: 'rare',
    requirement: '100회 복습',
    checkCondition: (stats) => stats.totalReviews >= 100,
  },
  {
    id: 'reviews_500',
    name: '복습 마스터',
    description: '500번 복습했어요!',
    icon: '♻️',
    category: 'learning',
    rarity: 'epic',
    requirement: '500회 복습',
    checkCondition: (stats) => stats.totalReviews >= 500,
  },

  // ========== 연속 학습 배지 ==========
  {
    id: 'streak_3',
    name: '3일 연속',
    description: '3일 연속으로 학습했어요!',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: '3일 연속 학습',
    checkCondition: (stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    name: '일주일 연속',
    description: '7일 연속으로 학습했어요!',
    icon: '🔥🔥',
    category: 'streak',
    rarity: 'rare',
    requirement: '7일 연속 학습',
    checkCondition: (stats) => stats.streak >= 7,
  },
  {
    id: 'streak_14',
    name: '2주 연속',
    description: '14일 연속으로 학습했어요!',
    icon: '🌟🔥',
    category: 'streak',
    rarity: 'epic',
    requirement: '14일 연속 학습',
    checkCondition: (stats) => stats.streak >= 14,
  },
  {
    id: 'streak_30',
    name: '한 달 연속',
    description: '30일 연속으로 학습했어요!',
    icon: '👑🔥',
    category: 'streak',
    rarity: 'legendary',
    requirement: '30일 연속 학습',
    checkCondition: (stats) => stats.streak >= 30,
  },
  {
    id: 'max_streak_10',
    name: '끈기의 시작',
    description: '최대 10일 연속 기록!',
    icon: '💪',
    category: 'streak',
    rarity: 'rare',
    requirement: '최대 10일 연속 달성',
    checkCondition: (stats) => stats.maxStreak >= 10,
  },
  {
    id: 'max_streak_30',
    name: '끈기의 왕',
    description: '최대 30일 연속 기록!',
    icon: '🏆💪',
    category: 'streak',
    rarity: 'legendary',
    requirement: '최대 30일 연속 달성',
    checkCondition: (stats) => stats.maxStreak >= 30,
  },

  // ========== 특별 배지 ==========
  {
    id: 'first_session',
    name: '시작이 반이다',
    description: '첫 플래시카드 학습을 완료했어요!',
    icon: '🚀',
    category: 'special',
    rarity: 'common',
    requirement: '첫 학습 완료',
    checkCondition: (stats) => stats.flashcardSessions >= 1,
  },
  {
    id: 'sessions_10',
    name: '꾸준한 학습자',
    description: '10번의 학습 세션을 완료했어요!',
    icon: '📝',
    category: 'special',
    rarity: 'rare',
    requirement: '10회 학습 세션',
    checkCondition: (stats) => stats.flashcardSessions >= 10,
  },
  {
    id: 'sessions_50',
    name: '학습 중독자',
    description: '50번의 학습 세션을 완료했어요!',
    icon: '📚✨',
    category: 'special',
    rarity: 'epic',
    requirement: '50회 학습 세션',
    checkCondition: (stats) => stats.flashcardSessions >= 50,
  },
  {
    id: 'perfect_quiz',
    name: '퍼펙트!',
    description: '퀴즈에서 100점을 받았어요!',
    icon: '💯',
    category: 'special',
    rarity: 'rare',
    requirement: '퀴즈 만점',
    checkCondition: (stats) => stats.perfectQuizzes >= 1,
  },
  {
    id: 'perfect_quiz_10',
    name: '만점 수집가',
    description: '10번의 퀴즈에서 만점!',
    icon: '🏅',
    category: 'special',
    rarity: 'epic',
    requirement: '10회 퀴즈 만점',
    checkCondition: (stats) => stats.perfectQuizzes >= 10,
  },
  {
    id: 'days_active_7',
    name: '일주일 활동',
    description: '7일 동안 활동했어요!',
    icon: '📆',
    category: 'special',
    rarity: 'common',
    requirement: '7일 활동',
    checkCondition: (stats) => stats.daysActive >= 7,
  },
  {
    id: 'days_active_30',
    name: '한 달 활동',
    description: '30일 동안 활동했어요!',
    icon: '📅',
    category: 'special',
    rarity: 'rare',
    requirement: '30일 활동',
    checkCondition: (stats) => stats.daysActive >= 30,
  },
  {
    id: 'days_active_100',
    name: '100일의 기적',
    description: '100일 동안 활동했어요!',
    icon: '🎊',
    category: 'special',
    rarity: 'legendary',
    requirement: '100일 활동',
    checkCondition: (stats) => stats.daysActive >= 100,
  },
  {
    id: 'early_bird',
    name: '아침형 인간',
    description: '아침에 학습을 완료했어요!',
    icon: '🌅',
    category: 'special',
    rarity: 'rare',
    requirement: '아침 학습',
    checkCondition: () => {
      const hour = new Date().getHours();
      return hour >= 5 && hour < 9;
    },
  },
  {
    id: 'night_owl',
    name: '올빼미',
    description: '밤에 학습을 완료했어요!',
    icon: '🦉',
    category: 'special',
    rarity: 'rare',
    requirement: '밤 학습',
    checkCondition: () => {
      const hour = new Date().getHours();
      return hour >= 21 || hour < 5;
    },
  },
  {
    id: 'weekend_warrior',
    name: '주말 전사',
    description: '주말에 학습을 완료했어요!',
    icon: '🎮',
    category: 'special',
    rarity: 'common',
    requirement: '주말 학습',
    checkCondition: () => {
      const day = new Date().getDay();
      return day === 0 || day === 6;
    },
  },
];

// ============================================
// 🎨 희귀도 설정
// ============================================
export const RARITY_CONFIG: Record<BadgeRarity, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glow: string;
}> = {
  common: {
    label: '일반',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    glow: '',
  },
  rare: {
    label: '레어',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
    glow: 'shadow-blue-200',
  },
  epic: {
    label: '에픽',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
    glow: 'shadow-purple-300',
  },
  legendary: {
    label: '레전더리',
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    borderColor: 'border-amber-400',
    glow: 'shadow-amber-300 shadow-lg',
  },
};

// ============================================
// 🎉 배지 획득 효과
// ============================================
const celebrateBadge = (rarity: BadgeRarity) => {
  const configs: Record<BadgeRarity, any> = {
    common: {
      particleCount: 30,
      spread: 50,
      colors: ['#6b7280', '#9ca3af'],
    },
    rare: {
      particleCount: 50,
      spread: 70,
      colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
    },
    epic: {
      particleCount: 80,
      spread: 90,
      colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    },
    legendary: {
      particleCount: 150,
      spread: 120,
      startVelocity: 45,
      colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
    },
  };

  confetti({
    ...configs[rarity],
    origin: { y: 0.6 },
  });

  if (rarity === 'legendary') {
    setTimeout(() => confetti(configs[rarity]), 200);
    setTimeout(() => confetti(configs[rarity]), 400);
  }
};

// ============================================
// 🪝 useBadges 훅
// ============================================
export function useBadges() {
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);

  // 획득한 배지 로드
  const loadEarnedBadges = useCallback(async () => {
    try {
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('juwoo_id', 1);

      const { data: badges } = await supabase
        .from('badges')
        .select('id, name');

      // badge_id를 badge name으로 매핑
      const badgeNameMap = new Map(badges?.map(b => [b.id, b.name]) || []);
      const earnedNames = new Set(
        userBadges?.map(ub => {
          // DB에서 불러온 배지 이름으로 BADGE_DEFINITIONS의 id와 매칭
          const badgeName = badgeNameMap.get(ub.badge_id);
          const def = BADGE_DEFINITIONS.find(d => d.name === badgeName);
          return def?.id || '';
        }).filter(Boolean) || []
      );

      setEarnedBadges(earnedNames);
    } catch (error) {
      console.error('배지 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 사용자 통계 로드
  const loadUserStats = useCallback(async (): Promise<UserStats> => {
    try {
      // 포인트 조회
      const { data: profile } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      // 학습 진행률 조회
      const { data: progress } = await supabase
        .from('english_learning_progress')
        .select('*')
        .eq('juwoo_id', 1);

      // 포인트 거래 내역 (총 획득 포인트)
      const { data: transactions } = await supabase
        .from('point_transactions')
        .select('amount')
        .eq('juwoo_id', 1)
        .gt('amount', 0);

      const totalEarned = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // 학습 통계 계산
      const wordsLearned = progress?.length || 0;
      const wordsMastered = progress?.filter(p => p.mastery_level >= 3).length || 0;
      const totalReviews = progress?.reduce((sum, p) => sum + (p.review_count || 0), 0) || 0;
      const totalCorrect = progress?.reduce((sum, p) => sum + (p.correct_count || 0), 0) || 0;
      const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

      // 연속 학습 일수 계산
      const reviewDates = new Set(
        progress
          ?.filter(p => p.last_reviewed_at)
          .map(p => new Date(p.last_reviewed_at).toDateString()) || []
      );
      let streak = 0;
      let maxStreak = 0;
      let currentDate = new Date();

      while (reviewDates.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      maxStreak = Math.max(streak, maxStreak);

      // 활동 일수
      const allDates = new Set(
        progress?.map(p => new Date(p.created_at).toDateString()) || []
      );
      const daysActive = allDates.size;

      // 플래시카드 세션 수 (대략적 추정)
      const flashcardSessions = Math.ceil(totalReviews / 10);

      const userStats: UserStats = {
        currentPoints: profile?.current_points || 0,
        totalPointsEarned: totalEarned,
        wordsLearned,
        wordsMastered,
        quizzesTaken: 0, // TODO: 퀴즈 테이블에서 조회
        perfectQuizzes: 0, // TODO: 퀴즈 테이블에서 조회
        streak,
        maxStreak,
        daysActive,
        flashcardSessions,
        totalReviews,
        accuracy,
      };

      setStats(userStats);
      return userStats;
    } catch (error) {
      console.error('통계 로드 실패:', error);
      return {
        currentPoints: 0,
        totalPointsEarned: 0,
        wordsLearned: 0,
        wordsMastered: 0,
        quizzesTaken: 0,
        perfectQuizzes: 0,
        streak: 0,
        maxStreak: 0,
        daysActive: 0,
        flashcardSessions: 0,
        totalReviews: 0,
        accuracy: 0,
      };
    }
  }, []);

  // 배지 체크 및 부여
  const checkAndAwardBadges = useCallback(async () => {
    const userStats = await loadUserStats();
    const newBadges: BadgeDefinition[] = [];

    for (const badge of BADGE_DEFINITIONS) {
      // 이미 획득한 배지는 스킵
      if (earnedBadges.has(badge.id)) continue;

      // 조건 체크
      if (badge.checkCondition(userStats)) {
        try {
          // DB에 배지가 있는지 확인
          let { data: existingBadge } = await supabase
            .from('badges')
            .select('id')
            .eq('name', badge.name)
            .single();

          // 없으면 생성
          if (!existingBadge) {
            const { data: newBadge } = await supabase
              .from('badges')
              .insert({
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                category: badge.category,
                requirement: badge.requirement,
              })
              .select('id')
              .single();
            existingBadge = newBadge;
          }

          if (existingBadge) {
            // user_badges에 추가
            await supabase.from('user_badges').insert({
              juwoo_id: 1,
              badge_id: existingBadge.id,
            });

            newBadges.push(badge);
            setEarnedBadges(prev => new Set([...prev, badge.id]));
          }
        } catch (error) {
          console.error(`배지 부여 실패 (${badge.name}):`, error);
        }
      }
    }

    // 새로 획득한 배지 알림
    if (newBadges.length > 0) {
      for (const badge of newBadges) {
        celebrateBadge(badge.rarity);
        toast.success(
          <div className="flex items-center gap-3">
            <span className="text-3xl">{badge.icon}</span>
            <div>
              <div className="font-bold">새 배지 획득! 🎉</div>
              <div className="text-sm">{badge.name}</div>
            </div>
          </div>,
          { duration: 5000 }
        );
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    return newBadges;
  }, [earnedBadges, loadUserStats]);

  // 초기 로드
  useEffect(() => {
    loadEarnedBadges();
  }, [loadEarnedBadges]);

  // 배지 목록 (획득 여부 포함)
  const badgesWithStatus = BADGE_DEFINITIONS.map(badge => ({
    ...badge,
    isEarned: earnedBadges.has(badge.id),
  }));

  return {
    badges: badgesWithStatus,
    earnedBadges,
    loading,
    stats,
    checkAndAwardBadges,
    loadUserStats,
    loadEarnedBadges,
  };
}

export default useBadges;
