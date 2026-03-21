import { useState, useEffect, useMemo } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowLeft, Trophy, Star, Lock, Crown, Sparkles, Flame,
  Target, BookOpen, Zap, Medal, Award, Gift, CheckCircle,
  TrendingUp, Calendar, Brain, ChevronRight, Dumbbell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBadges, BADGE_DEFINITIONS, RARITY_CONFIG, type BadgeCategory, type BadgeRarity, type UserStats } from "@/hooks/useBadges.js";
import { useActivityBadges, type ActivityBadge } from "@/hooks/useActivityBadges";

// ============================================
// 배지 진행률 계산
// ============================================
function getBadgeProgress(badgeId: string, stats: UserStats | null): { current: number; target: number; percent: number } {
  if (!stats) return { current: 0, target: 1, percent: 0 };

  const progressMap: Record<string, { current: number; target: number }> = {
    'points_100': { current: stats.currentPoints, target: 100 },
    'points_500': { current: stats.currentPoints, target: 500 },
    'points_1000': { current: stats.currentPoints, target: 1000 },
    'points_5000': { current: stats.currentPoints, target: 5000 },
    'points_10000': { current: stats.currentPoints, target: 10000 },
    'first_word': { current: stats.wordsLearned, target: 1 },
    'words_10': { current: stats.wordsLearned, target: 10 },
    'words_50': { current: stats.wordsLearned, target: 50 },
    'words_100': { current: stats.wordsLearned, target: 100 },
    'words_500': { current: stats.wordsLearned, target: 500 },
    'mastered_10': { current: stats.wordsMastered, target: 10 },
    'mastered_50': { current: stats.wordsMastered, target: 50 },
    'mastered_100': { current: stats.wordsMastered, target: 100 },
    'accuracy_80': { current: stats.accuracy, target: 80 },
    'accuracy_90': { current: stats.accuracy, target: 90 },
    'reviews_100': { current: stats.totalReviews, target: 100 },
    'reviews_500': { current: stats.totalReviews, target: 500 },
    'streak_3': { current: stats.streak, target: 3 },
    'streak_7': { current: stats.streak, target: 7 },
    'streak_14': { current: stats.streak, target: 14 },
    'streak_30': { current: stats.streak, target: 30 },
    'max_streak_10': { current: stats.maxStreak, target: 10 },
    'max_streak_30': { current: stats.maxStreak, target: 30 },
    'first_session': { current: stats.flashcardSessions, target: 1 },
    'sessions_10': { current: stats.flashcardSessions, target: 10 },
    'sessions_50': { current: stats.flashcardSessions, target: 50 },
    'perfect_quiz': { current: stats.perfectQuizzes, target: 1 },
    'perfect_quiz_10': { current: stats.perfectQuizzes, target: 10 },
    'days_active_7': { current: stats.daysActive, target: 7 },
    'days_active_30': { current: stats.daysActive, target: 30 },
    'days_active_100': { current: stats.daysActive, target: 100 },
  };

  const data = progressMap[badgeId];
  if (!data) return { current: 0, target: 1, percent: 0 };

  return {
    current: data.current,
    target: data.target,
    percent: Math.min(Math.round((data.current / data.target) * 100), 100),
  };
}

// ============================================
// 카테고리 설정
// ============================================
const CATEGORY_CONFIG: Record<BadgeCategory, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  emoji: string;
}> = {
  points: {
    label: '포인트',
    icon: <Trophy className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-500 to-amber-500',
    emoji: '💰',
  },
  learning: {
    label: '학습',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-cyan-500',
    emoji: '📚',
  },
  streak: {
    label: '연속 학습',
    icon: <Flame className="h-5 w-5" />,
    color: 'text-orange-600',
    bgGradient: 'from-orange-500 to-amber-500',
    emoji: '🔥',
  },
  special: {
    label: '특별',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-purple-600',
    bgGradient: 'from-purple-500 to-pink-500',
    emoji: '✨',
  },
};

// ============================================
// 배지 카드 컴포넌트
// ============================================
function BadgeCard({
  badge,
  isEarned,
  onClick,
  index,
  progress,
}: {
  badge: typeof BADGE_DEFINITIONS[0];
  isEarned: boolean;
  onClick: () => void;
  index: number;
  progress: { current: number; target: number; percent: number };
}) {
  const rarityConfig = RARITY_CONFIG[badge.rarity];
  const categoryConfig = CATEGORY_CONFIG[badge.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: isEarned ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${
          isEarned
            ? `border-2 ${rarityConfig.borderColor} ${rarityConfig.glow} shadow-lg hover:shadow-xl`
            : 'border-2 border-gray-200 opacity-70 hover:opacity-90'
        }`}
      >
        {/* 희귀도 배지 */}
        <div className="absolute top-2 right-2 z-10">
          <Badge
            className={`text-sm ${
              isEarned
                ? `${rarityConfig.bgColor} ${rarityConfig.color} border-0`
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {rarityConfig.label}
          </Badge>
        </div>

        {/* 잠금 아이콘 */}
        {!isEarned && (
          <div className="absolute top-2 left-2 z-10">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
        )}

        {/* 레전더리 효과 */}
        {isEarned && badge.rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-amber-400/20"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <CardContent className="p-3 flex flex-col items-center text-center relative">
          {/* 아이콘 */}
          <motion.div
            className={`text-4xl mb-2 ${!isEarned && 'grayscale opacity-50'}`}
            animate={isEarned ? {
              scale: [1, 1.08, 1],
            } : {}}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            {badge.icon}
          </motion.div>

          {/* 이름 */}
          <h3 className={`font-bold text-base mb-0.5 leading-tight ${isEarned ? rarityConfig.color : 'text-gray-400'}`}>
            {badge.name}
          </h3>

          {/* 조건 */}
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {badge.requirement}
          </p>

          {/* 진행률 (미획득인 경우) */}
          {!isEarned && progress.percent > 0 && (
            <div className="w-full">
              <Progress value={progress.percent} className="h-1.5 mb-0.5" />
              <p className="text-sm text-slate-400">{progress.percent}%</p>
            </div>
          )}

          {/* 획득 완료 표시 */}
          {isEarned && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span className="text-sm font-bold">획득!</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// 배지 상세 모달
// ============================================
function BadgeModal({
  badge,
  isEarned,
  progress,
  onClose,
}: {
  badge: typeof BADGE_DEFINITIONS[0] | null;
  isEarned: boolean;
  progress: { current: number; target: number; percent: number };
  onClose: () => void;
}) {
  if (!badge) return null;

  const rarityConfig = RARITY_CONFIG[badge.rarity];
  const categoryConfig = CATEGORY_CONFIG[badge.category];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={`p-8 text-center bg-gradient-to-br ${
          isEarned ? categoryConfig.bgGradient : 'from-gray-400 to-gray-500'
        } relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/5" />
          <motion.div
            className="text-7xl mb-3 relative"
            animate={isEarned ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.8 }}
          >
            {badge.icon}
          </motion.div>
          <h2 className="text-2xl font-black text-white relative">{badge.name}</h2>
          <Badge className={`mt-2 ${rarityConfig.bgColor} ${rarityConfig.color} border-0 text-sm`}>
            {rarityConfig.label}
          </Badge>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          <p className="text-center text-gray-600 text-lg">
            {badge.description}
          </p>

          {/* 진행률 */}
          {!isEarned && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">진행률</span>
                <span className="text-sm font-bold text-violet-600">{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} className="h-3 mb-2" />
              <p className="text-sm text-slate-500 text-center">
                {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                {categoryConfig.icon}
                카테고리
              </span>
              <span className={`font-bold ${categoryConfig.color}`}>
                {categoryConfig.emoji} {categoryConfig.label}
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                획득 조건
              </span>
              <span className="font-medium text-gray-700">{badge.requirement}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                상태
              </span>
              <span className={`font-bold text-lg ${isEarned ? 'text-green-600' : 'text-gray-400'}`}>
                {isEarned ? '획득 완료!' : '도전 중'}
              </span>
            </div>
          </div>

          <Button
            onClick={onClose}
            className={`w-full h-12 rounded-xl font-bold text-base ${
              isEarned
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
            }`}
          >
            {isEarned ? '확인' : '열심히 하면 얻을 수 있어요!'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// 메인 페이지
// ============================================
export default function Badges() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const { badges, earnedBadges, loading, stats, checkAndAwardBadges, loadUserStats } = useBadges();
  const { badges: activityBadges, loading: activityLoading, loadBadges: loadActivityBadges, checkAllBadges: checkAllActivityBadges } = useActivityBadges();

  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [showEarned, setShowEarned] = useState<'all' | 'earned' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGE_DEFINITIONS[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'learning' | 'activity'>('learning');

  // 배지 체크 (페이지 진입 시)
  useEffect(() => {
    if (isAuthenticated) {
      checkAndAwardBadges();
      loadActivityBadges();
    }
  }, [isAuthenticated]);

  // 필터링된 배지
  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
      if (showEarned === 'earned' && !badge.isEarned) return false;
      if (showEarned === 'locked' && badge.isEarned) return false;
      return true;
    });
  }, [badges, selectedCategory, showEarned]);

  // 통계
  const earnedCount = badges.filter(b => b.isEarned).length;
  const totalCount = badges.length;
  const progressPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // 도전 중! 배지 (미획득 중 진행률이 높은 상위 3개)
  const challengeBadges = useMemo(() => {
    return badges
      .filter(b => !b.isEarned)
      .map(b => ({
        ...b,
        progress: getBadgeProgress(b.id, stats),
      }))
      .filter(b => b.progress.percent > 0 && b.progress.percent < 100)
      .sort((a, b) => b.progress.percent - a.progress.percent)
      .slice(0, 3);
  }, [badges, stats]);

  // 희귀도별 통계
  const rarityStats = useMemo(() => {
    const result: Record<BadgeRarity, { earned: number; total: number }> = {
      common: { earned: 0, total: 0 },
      rare: { earned: 0, total: 0 },
      epic: { earned: 0, total: 0 },
      legendary: { earned: 0, total: 0 },
    };
    badges.forEach(b => {
      result[b.rarity].total++;
      if (b.isEarned) result[b.rarity].earned++;
    });
    return result;
  }, [badges]);

  // 로딩 화면
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // 로그인 필요
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="max-w-md w-full border-2 border-yellow-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">로그인이 필요해요!</h2>
              <p className="text-muted-foreground mb-6">
                멋진 배지들을 보려면<br />먼저 로그인해줘!
              </p>
              <a href={getLoginUrl()}>
                <Button size="lg" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
                  로그인하기
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 pb-24 md:pb-8">
      <div className="container max-w-2xl py-6 px-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkAndAwardBadges()}
            className="gap-2 bg-white/80"
          >
            <Sparkles className="h-4 w-4" />
            배지 체크
          </Button>
        </div>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-600 via-orange-500 to-amber-500 bg-clip-text text-transparent mb-1">
            나의 배지 컬렉션
          </h1>
          <p className="text-sm text-muted-foreground">
            열심히 해서 멋진 배지를 모아보세요!
          </p>
        </motion.div>

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'learning' ? 'default' : 'outline'}
            className={`flex-1 rounded-full ${activeTab === 'learning' ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-0' : 'bg-white/80'}`}
            style={{ minHeight: 48 }}
            onClick={() => setActiveTab('learning')}
          >
            <Brain className="h-4 w-4 mr-1" />
            학습 배지
          </Button>
          <Button
            variant={activeTab === 'activity' ? 'default' : 'outline'}
            className={`flex-1 rounded-full ${activeTab === 'activity' ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 border-0' : 'bg-white/80'}`}
            style={{ minHeight: 48 }}
            onClick={() => setActiveTab('activity')}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            독서/운동
          </Button>
        </div>

        {/* 독서/운동 배지 탭 */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* 독서 배지 */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                독서 배지
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {activityBadges
                  .filter((b) => b.badge_type === 'reading')
                  .map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`relative overflow-hidden transition-all ${
                          badge.is_earned
                            ? 'border-2 border-indigo-400 shadow-lg shadow-indigo-100'
                            : 'border-2 border-gray-200 opacity-70'
                        }`}
                      >
                        {!badge.is_earned && (
                          <div className="absolute top-2 left-2 z-10">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <CardContent className="p-3 flex flex-col items-center text-center">
                          <div className={`text-4xl mb-2 ${!badge.is_earned && 'grayscale opacity-50'}`}>
                            {badge.emoji}
                          </div>
                          <h3 className={`font-bold text-base mb-0.5 ${badge.is_earned ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {badge.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                          {badge.is_earned && (
                            <div className="flex items-center gap-1 text-green-600 mt-1">
                              <CheckCircle className="h-3 w-3" />
                              <span className="text-sm font-bold">획득!</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* 운동 배지 */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-emerald-600" />
                운동 배지
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {activityBadges
                  .filter((b) => b.badge_type === 'exercise')
                  .map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`relative overflow-hidden transition-all ${
                          badge.is_earned
                            ? 'border-2 border-emerald-400 shadow-lg shadow-emerald-100'
                            : 'border-2 border-gray-200 opacity-70'
                        }`}
                      >
                        {!badge.is_earned && (
                          <div className="absolute top-2 left-2 z-10">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <CardContent className="p-3 flex flex-col items-center text-center">
                          <div className={`text-4xl mb-2 ${!badge.is_earned && 'grayscale opacity-50'}`}>
                            {badge.emoji}
                          </div>
                          <h3 className={`font-bold text-base mb-0.5 ${badge.is_earned ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {badge.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                          {badge.is_earned && (
                            <div className="flex items-center gap-1 text-green-600 mt-1">
                              <CheckCircle className="h-3 w-3" />
                              <span className="text-sm font-bold">획득!</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>

            {activityBadges.length === 0 && !activityLoading && (
              <Card className="py-8 border-0 bg-white/80">
                <CardContent className="text-center">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-muted-foreground font-medium" style={{ fontSize: 16 }}>
                    독서와 운동을 시작하면 배지를 얻을 수 있어요!
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab !== 'activity' && (
        <>
        {/* 전체 진행률 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-0 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white shadow-xl shadow-orange-500/25 rounded-2xl overflow-hidden">
            <CardContent className="p-5 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Trophy className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">수집한 배지</p>
                      <p className="text-3xl font-black">{earnedCount}<span className="text-lg text-white/60 ml-1">/ {totalCount}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black">{progressPercent}%</p>
                    <p className="text-sm text-white/70">달성률</p>
                  </div>
                </div>

                <Progress value={progressPercent} className="h-3 bg-white/20" />

                {/* 희귀도별 미니 현황 */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {(['common', 'rare', 'epic', 'legendary'] as BadgeRarity[]).map(rarity => {
                    const config = RARITY_CONFIG[rarity];
                    const stat = rarityStats[rarity];
                    return (
                      <div key={rarity} className="p-2 bg-white/15 rounded-xl backdrop-blur-sm text-center">
                        <p className="text-base font-black">{stat.earned}/{stat.total}</p>
                        <p className="text-sm text-white/70">{config.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 도전 중! 섹션 */}
        {challengeBadges.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              거의 다 됐어요!
            </h2>
            <div className="space-y-2">
              {challengeBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedBadge(badge)}
                  className="cursor-pointer"
                >
                  <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-md rounded-xl hover:shadow-lg transition-all">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{badge.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-sm text-slate-800 truncate">{badge.name}</h3>
                            <span className="text-sm font-bold text-orange-600 ml-2">{badge.progress.percent}%</span>
                          </div>
                          <Progress value={badge.progress.percent} className="h-2 mb-1" />
                          <p className="text-sm text-slate-500">
                            {badge.progress.current.toLocaleString()} / {badge.progress.target.toLocaleString()} - {badge.requirement}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 필터 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 space-y-3"
        >
          {/* 카테고리 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="rounded-full flex-shrink-0 bg-white/80"
            >
              전체
            </Button>
            {(Object.keys(CATEGORY_CONFIG) as BadgeCategory[]).map(cat => {
              const config = CATEGORY_CONFIG[cat];
              return (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full flex-shrink-0 ${
                    selectedCategory === cat
                      ? `bg-gradient-to-r ${config.bgGradient} border-0`
                      : 'bg-white/80'
                  }`}
                >
                  <span className="mr-1">{config.emoji}</span>
                  {config.label}
                </Button>
              );
            })}
          </div>

          {/* 획득 상태 필터 */}
          <div className="flex gap-2">
            <Button
              variant={showEarned === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowEarned('all')}
              className={`rounded-full flex-1 ${showEarned !== 'all' ? 'bg-white/80' : ''}`}
            >
              전체 ({badges.length})
            </Button>
            <Button
              variant={showEarned === 'earned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowEarned('earned')}
              className={`rounded-full flex-1 ${
                showEarned === 'earned' ? 'bg-green-500 border-0' : 'bg-white/80'
              }`}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              획득 ({earnedCount})
            </Button>
            <Button
              variant={showEarned === 'locked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowEarned('locked')}
              className={`rounded-full flex-1 ${
                showEarned === 'locked' ? 'bg-gray-500 border-0' : 'bg-white/80'
              }`}
            >
              <Lock className="h-3.5 w-3.5 mr-1" />
              미획득 ({totalCount - earnedCount})
            </Button>
          </div>
        </motion.div>

        {/* 배지 그리드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {filteredBadges.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredBadges.map((badge, index) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isEarned={badge.isEarned}
                  onClick={() => setSelectedBadge(badge)}
                  index={index}
                  progress={getBadgeProgress(badge.id, stats)}
                />
              ))}
            </div>
          ) : (
            <Card className="py-12 border-0 bg-white/80">
              <CardContent className="text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-muted-foreground font-medium">
                  조건에 맞는 배지가 없어요
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* 격려 메시지 */}
        {earnedCount > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card className="bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 text-white border-0 shadow-xl rounded-2xl">
              <CardContent className="py-5 text-center">
                <div className="text-3xl mb-2">
                  {earnedCount >= 20 ? '👑' : earnedCount >= 10 ? '🏆' : earnedCount >= 5 ? '⭐' : '🌟'}
                </div>
                <h3 className="text-lg font-bold mb-0.5">
                  {earnedCount >= 20
                    ? '배지 수집 마스터!'
                    : earnedCount >= 10
                    ? '대단해요! 배지 수집왕!'
                    : earnedCount >= 5
                    ? '잘하고 있어요!'
                    : '좋은 시작이에요!'}
                </h3>
                <p className="text-sm opacity-90">
                  {earnedCount >= 20
                    ? '정말 대단해! 계속 도전하자!'
                    : earnedCount >= 10
                    ? `벌써 ${earnedCount}개의 배지를 모았어요!`
                    : earnedCount >= 5
                    ? '더 많은 배지를 모아보세요!'
                    : '학습하면서 더 많은 배지를 모아봐요!'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        </>
        )}
      </div>

      {/* 배지 상세 모달 */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeModal
            badge={selectedBadge}
            isEarned={earnedBadges.has(selectedBadge.id)}
            progress={getBadgeProgress(selectedBadge.id, stats)}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
