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
  TrendingUp, Calendar, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBadges, BADGE_DEFINITIONS, RARITY_CONFIG, type BadgeCategory, type BadgeRarity } from "@/hooks/useBadges.js";
import confetti from "canvas-confetti";

// ============================================
// 🎨 카테고리 설정
// ============================================
const CATEGORY_CONFIG: Record<BadgeCategory, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
}> = {
  points: {
    label: '포인트',
    icon: <Trophy className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-500 to-amber-500',
  },
  learning: {
    label: '학습',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-cyan-500',
  },
  streak: {
    label: '연속 학습',
    icon: <Flame className="h-5 w-5" />,
    color: 'text-orange-600',
    bgGradient: 'from-orange-500 to-red-500',
  },
  special: {
    label: '특별',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-purple-600',
    bgGradient: 'from-purple-500 to-pink-500',
  },
};

// ============================================
// 🏆 배지 카드 컴포넌트
// ============================================
function BadgeCard({
  badge,
  isEarned,
  onClick,
  index,
}: {
  badge: typeof BADGE_DEFINITIONS[0];
  isEarned: boolean;
  onClick: () => void;
  index: number;
}) {
  const rarityConfig = RARITY_CONFIG[badge.rarity];
  const categoryConfig = CATEGORY_CONFIG[badge.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: isEarned ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${
          isEarned
            ? `border-2 ${rarityConfig.borderColor} ${rarityConfig.glow} shadow-lg`
            : 'border-2 border-gray-200 opacity-60 grayscale hover:opacity-80 hover:grayscale-0'
        }`}
      >
        {/* 희귀도 배지 */}
        <div className="absolute top-2 right-2">
          <Badge
            className={`text-xs ${
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
          <div className="absolute top-2 left-2">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
        )}

        {/* 레전더리 효과 */}
        {isEarned && badge.rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-amber-400/20"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <CardContent className="p-4 flex flex-col items-center text-center">
          {/* 아이콘 */}
          <motion.div
            className={`text-5xl mb-3 ${!isEarned && 'filter grayscale'}`}
            animate={isEarned ? {
              scale: [1, 1.1, 1],
              rotate: badge.rarity === 'legendary' ? [0, -5, 5, 0] : 0
            } : {}}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {badge.icon}
          </motion.div>

          {/* 이름 */}
          <h3 className={`font-bold text-sm mb-1 ${isEarned ? rarityConfig.color : 'text-gray-400'}`}>
            {badge.name}
          </h3>

          {/* 설명 */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {badge.description}
          </p>

          {/* 카테고리 */}
          <div className={`flex items-center gap-1 text-xs ${isEarned ? categoryConfig.color : 'text-gray-400'}`}>
            {categoryConfig.icon}
            <span>{categoryConfig.label}</span>
          </div>

          {/* 조건 */}
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Target className="h-3 w-3" />
            {badge.requirement}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// 🎯 배지 상세 모달
// ============================================
function BadgeModal({
  badge,
  isEarned,
  onClose,
}: {
  badge: typeof BADGE_DEFINITIONS[0] | null;
  isEarned: boolean;
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={`p-6 text-center bg-gradient-to-br ${
          isEarned ? categoryConfig.bgGradient : 'from-gray-400 to-gray-500'
        }`}>
          <motion.div
            className="text-7xl mb-3"
            animate={isEarned ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {badge.icon}
          </motion.div>
          <h2 className="text-2xl font-black text-white">{badge.name}</h2>
          <Badge className={`mt-2 ${rarityConfig.bgColor} ${rarityConfig.color} border-0`}>
            {rarityConfig.label}
          </Badge>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <p className="text-center text-gray-600 mb-4">
            {badge.description}
          </p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">카테고리</span>
              <span className={`font-medium flex items-center gap-1 ${categoryConfig.color}`}>
                {categoryConfig.icon}
                {categoryConfig.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">획득 조건</span>
              <span className="font-medium text-gray-700">{badge.requirement}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">상태</span>
              <span className={`font-bold ${isEarned ? 'text-green-600' : 'text-gray-400'}`}>
                {isEarned ? '✓ 획득 완료!' : '🔒 미획득'}
              </span>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full mt-4"
            variant={isEarned ? "default" : "outline"}
          >
            확인
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// 📱 메인 페이지
// ============================================
export default function Badges() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const { badges, earnedBadges, loading, stats, checkAndAwardBadges, loadUserStats } = useBadges();

  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [showEarned, setShowEarned] = useState<'all' | 'earned' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGE_DEFINITIONS[0] | null>(null);

  // 배지 체크 (페이지 진입 시)
  useEffect(() => {
    if (isAuthenticated) {
      checkAndAwardBadges();
    }
  }, [isAuthenticated]);

  // 필터링된 배지
  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      // 카테고리 필터
      if (selectedCategory !== 'all' && badge.category !== selectedCategory) {
        return false;
      }
      // 획득 상태 필터
      if (showEarned === 'earned' && !badge.isEarned) return false;
      if (showEarned === 'locked' && badge.isEarned) return false;
      return true;
    });
  }, [badges, selectedCategory, showEarned]);

  // 통계
  const earnedCount = badges.filter(b => b.isEarned).length;
  const totalCount = badges.length;
  const progressPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // 희귀도별 통계
  const rarityStats = useMemo(() => {
    const stats: Record<BadgeRarity, { earned: number; total: number }> = {
      common: { earned: 0, total: 0 },
      rare: { earned: 0, total: 0 },
      epic: { earned: 0, total: 0 },
      legendary: { earned: 0, total: 0 },
    };
    badges.forEach(b => {
      stats[b.rarity].total++;
      if (b.isEarned) stats[b.rarity].earned++;
    });
    return stats;
  }, [badges]);

  // 로딩 화면
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="max-w-md w-full border-2 border-yellow-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">로그인이 필요해요!</h2>
              <p className="text-muted-foreground mb-6">
                멋진 배지들을 확인하려면<br />먼저 로그인해주세요!
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-6xl py-6 px-4">
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
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            배지 체크
          </Button>
        </div>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-bold mb-4">
            <Trophy className="h-4 w-4" />
            나의 배지 컬렉션
            <Crown className="h-4 w-4" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
            배지 컬렉션 🏆
          </h1>
          <p className="text-lg text-muted-foreground">
            멋진 배지를 모아보세요!
          </p>
        </motion.div>

        {/* 전체 진행률 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 border-yellow-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Medal className="h-5 w-5" />
                배지 수집 현황
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-black text-yellow-600">{earnedCount}</div>
                  <div className="text-gray-400 text-2xl">/</div>
                  <div className="text-3xl font-bold text-gray-400">{totalCount}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-orange-600">{progressPercent}%</div>
                  <div className="text-sm text-gray-500">달성률</div>
                </div>
              </div>
              <Progress value={progressPercent} className="h-4 mb-6" />

              {/* 희귀도별 현황 */}
              <div className="grid grid-cols-4 gap-3">
                {(['common', 'rare', 'epic', 'legendary'] as BadgeRarity[]).map(rarity => {
                  const config = RARITY_CONFIG[rarity];
                  const stat = rarityStats[rarity];
                  return (
                    <div
                      key={rarity}
                      className={`p-3 rounded-xl text-center ${config.bgColor} border ${config.borderColor}`}
                    >
                      <div className={`text-xl font-black ${config.color}`}>
                        {stat.earned}/{stat.total}
                      </div>
                      <div className="text-xs text-gray-600">{config.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 필터 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 space-y-4"
        >
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
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
                  className={selectedCategory === cat ? `bg-gradient-to-r ${config.bgGradient}` : ''}
                >
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
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
            >
              전체 ({badges.length})
            </Button>
            <Button
              variant={showEarned === 'earned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowEarned('earned')}
              className={showEarned === 'earned' ? 'bg-green-500' : ''}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              획득 ({earnedCount})
            </Button>
            <Button
              variant={showEarned === 'locked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowEarned('locked')}
              className={showEarned === 'locked' ? 'bg-gray-500' : ''}
            >
              <Lock className="h-4 w-4 mr-1" />
              미획득 ({totalCount - earnedCount})
            </Button>
          </div>
        </motion.div>

        {/* 배지 그리드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredBadges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredBadges.map((badge, index) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isEarned={badge.isEarned}
                  onClick={() => setSelectedBadge(badge)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-muted-foreground">
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
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white border-0 shadow-xl">
              <CardContent className="py-6 text-center">
                <div className="text-4xl mb-3">
                  {earnedCount >= 20 ? '👑' : earnedCount >= 10 ? '🏆' : earnedCount >= 5 ? '⭐' : '🌟'}
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {earnedCount >= 20
                    ? '배지 수집 마스터!'
                    : earnedCount >= 10
                    ? '대단해요! 배지 수집왕!'
                    : earnedCount >= 5
                    ? '잘하고 있어요!'
                    : '좋은 시작이에요!'}
                </h3>
                <p className="opacity-90">
                  {earnedCount >= 20
                    ? '정말 대단해요! 계속 도전하세요!'
                    : earnedCount >= 10
                    ? '벌써 10개 이상의 배지를 모았어요!'
                    : earnedCount >= 5
                    ? '더 많은 배지를 모아보세요!'
                    : '학습하면서 더 많은 배지를 모아봐요!'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* 배지 상세 모달 */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeModal
            badge={selectedBadge}
            isEarned={earnedBadges.has(selectedBadge.id)}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
