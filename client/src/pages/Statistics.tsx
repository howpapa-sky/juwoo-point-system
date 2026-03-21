import { useEffect, useState, useMemo } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Scatter
} from 'recharts';
import {
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, Coins, Target, Trophy,
  Flame, Star, Crown, Zap, BookOpen, Brain, Sparkles, Medal, Gift,
  Calendar, Clock, Award, Heart, Gamepad2, ShoppingCart, PiggyBank,
  Rocket, Activity, Eye, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight,
  Percent, DollarSign, LineChartIcon, PieChartIcon, Layers, Filter,
  Download, Share2, RefreshCw, ChevronRight, Info, Lightbulb
} from "lucide-react";

// 색상 팔레트
const COLORS = {
  primary: '#8b5cf6',
  secondary: '#ec4899',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  orange: '#f97316',
  rose: '#f43f5e',
};

const CHART_COLORS = ['#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#06b6d4', '#10b981', '#f97316'];

// 카테고리 색상
const categoryColors: Record<string, string> = {
  "학습": "#8b5cf6",
  "생활습관": "#22c55e",
  "도움": "#3b82f6",
  "특별": "#f59e0b",
  "퀴즈": "#ec4899",
  "읽기": "#06b6d4",
  "상점": "#ef4444",
  "목표": "#10b981",
};

interface Transaction {
  id: number;
  amount: number;
  note: string;
  created_at: string;
  balance_after: number;
  rule_id?: number;
}

interface DailyStat {
  date: string;
  dateLabel: string;
  earned: number;
  spent: number;
  net: number;
  transactions: number;
}

interface CategoryStat {
  name: string;
  earned: number;
  spent: number;
  count: number;
  color: string;
}

interface GoalProgress {
  title: string;
  target: number;
  current: number;
  percentage: number;
  status: string;
}

interface QuizStat {
  bookId: string;
  bookTitle: string;
  attempts: number;
  bestScore: number;
  avgScore: number;
  tierProgress: Record<string, boolean>;
}

interface Streak {
  current: number;
  longest: number;
  lastActivity: Date | null;
}

interface AchievementPreview {
  name: string;
  icon: string;
  progress: number;
  target: number;
  color: string;
}

export default function Statistics() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // 데이터 상태
  const [profile, setProfile] = useState<{ current_points: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [quizProgress, setQuizProgress] = useState<any[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [ebookProgress, setEbookProgress] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, timeRange]);

  async function loadAllData() {
    setLoading(true);
    try {
      const startDate = getStartDate();

      // 병렬로 모든 데이터 로드
      const [
        profileRes,
        transactionsRes,
        goalsRes,
        quizProgressRes,
        learningRes,
        badgesRes,
        ebookRes,
      ] = await Promise.all([
        supabase.from('juwoo_profile').select('current_points').eq('id', 1).single(),
        supabase
          .from('point_transactions')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true }),
        supabase.from('goals').select('*').eq('juwoo_id', 1),
        supabase.from('ebook_quiz_progress').select('*').eq('juwoo_id', 1),
        supabase.from('english_learning_progress').select('*').eq('juwoo_id', 1),
        supabase.from('user_badges').select('*, badges(*)').eq('juwoo_id', 1),
        supabase.from('ebook_progress').select('*').eq('juwoo_id', 1),
      ]);

      setProfile(profileRes.data);
      setTransactions(transactionsRes.data || []);
      setGoals(goalsRes.data || []);
      setQuizProgress(quizProgressRes.data || []);
      setLearningProgress(learningRes.data || []);
      setBadges(badgesRes.data || []);
      setEbookProgress(ebookRes.data || []);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStartDate(): Date {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      default:
        return new Date('2020-01-01');
    }
  }

  // 계산된 통계
  const stats = useMemo(() => {
    if (transactions.length === 0) {
      return {
        totalEarned: 0,
        totalSpent: 0,
        netChange: 0,
        avgDaily: 0,
        transactionCount: 0,
        earnCount: 0,
        spendCount: 0,
        biggestEarn: 0,
        biggestSpend: 0,
        dailyStats: [],
        categoryStats: [],
        weekdayStats: [],
        hourlyStats: [],
        streak: { current: 0, longest: 0, lastActivity: null },
        trendDirection: 'stable' as 'up' | 'down' | 'stable',
        trendPercent: 0,
      };
    }

    const earned = transactions.filter(t => t.amount > 0);
    const spent = transactions.filter(t => t.amount < 0);

    const totalEarned = earned.reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = Math.abs(spent.reduce((sum, t) => sum + t.amount, 0));
    const netChange = totalEarned - totalSpent;

    // 일별 통계
    const dailyMap = new Map<string, DailyStat>();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dateLabel = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

      dailyMap.set(dateStr, {
        date: dateStr,
        dateLabel,
        earned: 0,
        spent: 0,
        net: 0,
        transactions: 0,
      });
    }

    transactions.forEach(t => {
      const dateStr = new Date(t.created_at).toISOString().split('T')[0];
      const stat = dailyMap.get(dateStr);
      if (stat) {
        if (t.amount > 0) {
          stat.earned += t.amount;
        } else {
          stat.spent += Math.abs(t.amount);
        }
        stat.net = stat.earned - stat.spent;
        stat.transactions++;
      }
    });

    const dailyStats = Array.from(dailyMap.values());
    const avgDaily = dailyStats.length > 0
      ? Math.round(dailyStats.reduce((sum, d) => sum + d.earned, 0) / dailyStats.length)
      : 0;

    // 카테고리별 통계 (노트에서 추출)
    const categoryMap = new Map<string, CategoryStat>();
    transactions.forEach(t => {
      let category = '기타';
      const note = t.note?.toLowerCase() ?? '';

      if (note.includes('퀴즈') || note.includes('quiz')) category = '퀴즈';
      else if (note.includes('플래시') || note.includes('단어') || note.includes('학습')) category = '학습';
      else if (note.includes('책') || note.includes('읽기') || note.includes('ebook')) category = '읽기';
      else if (note.includes('상점') || note.includes('구매') || note.includes('shop')) category = '상점';
      else if (note.includes('목표')) category = '목표';
      else if (note.includes('특별') || note.includes('보너스')) category = '특별';
      else if (t.amount > 0) category = '생활습관';

      const existing = categoryMap.get(category) || {
        name: category,
        earned: 0,
        spent: 0,
        count: 0,
        color: categoryColors[category] || '#6b7280',
      };

      if (t.amount > 0) {
        existing.earned += t.amount;
      } else {
        existing.spent += Math.abs(t.amount);
      }
      existing.count++;
      categoryMap.set(category, existing);
    });

    const categoryStats = Array.from(categoryMap.values())
      .sort((a, b) => (b.earned + b.spent) - (a.earned + a.spent));

    // 요일별 통계
    const weekdayMap = new Map<number, { day: string; earned: number; spent: number; count: number }>();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    for (let i = 0; i < 7; i++) {
      weekdayMap.set(i, { day: dayNames[i], earned: 0, spent: 0, count: 0 });
    }

    transactions.forEach(t => {
      const day = new Date(t.created_at).getDay();
      const stat = weekdayMap.get(day)!;
      if (t.amount > 0) stat.earned += t.amount;
      else stat.spent += Math.abs(t.amount);
      stat.count++;
    });

    const weekdayStats = Array.from(weekdayMap.values());

    // 시간대별 통계
    const hourlyMap = new Map<number, { hour: string; count: number; points: number }>();
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { hour: `${i}시`, count: 0, points: 0 });
    }

    transactions.forEach(t => {
      const hour = new Date(t.created_at).getHours();
      const stat = hourlyMap.get(hour)!;
      stat.count++;
      stat.points += t.amount;
    });

    const hourlyStats = Array.from(hourlyMap.values());

    // 연속 활동 일수
    const activityDates = new Set(
      transactions.map(t => new Date(t.created_at).toDateString())
    );
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let checkDate = new Date();

    while (activityDates.has(checkDate.toDateString())) {
      tempStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    currentStreak = tempStreak;
    longestStreak = Math.max(currentStreak, longestStreak);

    // 트렌드 계산 (최근 7일 vs 이전 7일)
    const now = new Date();
    const recent7Days = transactions.filter(t => {
      const date = new Date(t.created_at);
      const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo < 7 && t.amount > 0;
    });
    const prev7Days = transactions.filter(t => {
      const date = new Date(t.created_at);
      const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo >= 7 && daysAgo < 14 && t.amount > 0;
    });

    const recentEarned = recent7Days.reduce((sum, t) => sum + t.amount, 0);
    const prevEarned = prev7Days.reduce((sum, t) => sum + t.amount, 0);

    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    let trendPercent = 0;
    if (prevEarned > 0) {
      trendPercent = Math.round(((recentEarned - prevEarned) / prevEarned) * 100);
      trendDirection = trendPercent > 5 ? 'up' : trendPercent < -5 ? 'down' : 'stable';
    }

    return {
      totalEarned,
      totalSpent,
      netChange,
      avgDaily,
      transactionCount: transactions.length,
      earnCount: earned.length,
      spendCount: spent.length,
      biggestEarn: earned.length > 0 ? Math.max(...earned.map(t => t.amount)) : 0,
      biggestSpend: spent.length > 0 ? Math.max(...spent.map(t => Math.abs(t.amount))) : 0,
      dailyStats,
      categoryStats,
      weekdayStats,
      hourlyStats,
      streak: {
        current: currentStreak,
        longest: longestStreak,
        lastActivity: transactions.length > 0 ? new Date(transactions[transactions.length - 1].created_at) : null,
      },
      trendDirection,
      trendPercent,
    };
  }, [transactions, timeRange]);

  // 학습 통계
  const learningStats = useMemo(() => {
    const totalWords = learningProgress.length;
    const masteredWords = learningProgress.filter(p => p.mastery_level >= 3).length;
    const totalReviews = learningProgress.reduce((sum, p) => sum + (p.review_count ?? 0), 0);
    const totalCorrect = learningProgress.reduce((sum, p) => sum + (p.correct_count ?? 0), 0);
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    return {
      totalWords,
      masteredWords,
      totalReviews,
      accuracy,
      masteryRate: totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0,
    };
  }, [learningProgress]);

  // 퀴즈 통계
  const quizStats = useMemo(() => {
    const completedQuizzes = quizProgress.filter(q => q.is_completed).length;
    const totalAttempts = quizProgress.reduce((sum, q) => sum + (q.total_attempts ?? 0), 0);
    const avgScore = quizProgress.length > 0
      ? Math.round(quizProgress.reduce((sum, q) => sum + (q.best_score ?? 0), 0) / quizProgress.length)
      : 0;

    const byTier = {
      basic: quizProgress.filter(q => q.quiz_tier === 'basic' && q.is_completed).length,
      intermediate: quizProgress.filter(q => q.quiz_tier === 'intermediate' && q.is_completed).length,
      master: quizProgress.filter(q => q.quiz_tier === 'master' && q.is_completed).length,
    };

    return {
      completedQuizzes,
      totalAttempts,
      avgScore,
      byTier,
    };
  }, [quizProgress]);

  // 목표 통계
  const goalStats = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    const totalSaved = activeGoals.reduce((sum, g) => sum + (g.current_points ?? 0), 0);
    const totalTarget = activeGoals.reduce((sum, g) => sum + (g.target_points ?? 0), 0);

    return {
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      totalSaved,
      totalTarget,
      progressPercent: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
    };
  }, [goals]);

  // 배지 통계
  const badgeStats = useMemo(() => {
    const earnedCount = badges.length;
    const recentBadges = badges
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, 5);

    return {
      earnedCount,
      recentBadges,
    };
  }, [badges]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <Card className="max-w-md w-full shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">로그인이 필요합니다</CardTitle>
            <CardDescription>통계를 확인하려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadAllData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold mb-4 shadow-lg">
            <BarChart3 className="h-4 w-4" />
            주우의 성장 기록
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
            통계 대시보드 📊
          </h1>
          <p className="text-lg text-muted-foreground">
            {profile?.current_points?.toLocaleString() ?? 0}포인트 보유 중!
          </p>
        </motion.div>

        {/* 기간 선택 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg">
            {[
              { value: '7d', label: '7일' },
              { value: '30d', label: '30일' },
              { value: '90d', label: '90일' },
              { value: 'all', label: '전체' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === option.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-5 w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Layers className="h-4 w-4 mr-1 hidden sm:inline" />
              개요
            </TabsTrigger>
            <TabsTrigger value="points" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Coins className="h-4 w-4 mr-1 hidden sm:inline" />
              포인트
            </TabsTrigger>
            <TabsTrigger value="learning" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Brain className="h-4 w-4 mr-1 hidden sm:inline" />
              학습
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Trophy className="h-4 w-4 mr-1 hidden sm:inline" />
              업적
            </TabsTrigger>
            <TabsTrigger value="insights" className="hidden md:flex rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Lightbulb className="h-4 w-4 mr-1" />
              인사이트
            </TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 핵심 지표 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-5 w-5" />
                      <span className="text-sm font-medium opacity-90">현재 포인트</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-black">
                      {profile?.current_points?.toLocaleString() ?? 0}
                    </div>
                    <p className="text-xs opacity-80 mt-1">보유 중</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-sm font-medium opacity-90">총 적립</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-black">
                      +{stats.totalEarned.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                      {stats.trendDirection === 'up' && <ArrowUpRight className="h-3 w-3" />}
                      {stats.trendDirection === 'down' && <ArrowDownRight className="h-3 w-3" />}
                      {stats.trendPercent !== 0 && `${stats.trendPercent > 0 ? '+' : ''}${stats.trendPercent}%`}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="h-5 w-5" />
                      <span className="text-sm font-medium opacity-90">연속 활동</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-black">{stats.streak.current}일</div>
                    <p className="text-xs opacity-80 mt-1">
                      최고 {stats.streak.longest}일
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white border-0 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Medal className="h-5 w-5" />
                      <span className="text-sm font-medium opacity-90">획득 배지</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-black">{badgeStats.earnedCount}개</div>
                    <p className="text-xs opacity-80 mt-1">컬렉션 중</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 메인 차트 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-2 border-purple-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    포인트 흐름
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    적립과 사용 추이
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {stats.dailyStats.length > 0 && stats.dailyStats.some(d => d.earned > 0 || d.spent > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={stats.dailyStats.slice(-14)}>
                        <defs>
                          <linearGradient id="earnedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="dateLabel" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                          formatter={(value: number, name: string) => [
                            `${value.toLocaleString()}P`,
                            name === 'earned' ? '적립' : name === 'spent' ? '사용' : '순수익'
                          ]}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="earned" name="적립" fill="url(#earnedGradient)" stroke="#22c55e" strokeWidth={2} />
                        <Area type="monotone" dataKey="spent" name="사용" fill="url(#spentGradient)" stroke="#ef4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="net" name="순수익" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                      <Activity className="h-16 w-16 mb-4 opacity-30" />
                      <p className="text-lg font-medium">아직 데이터가 없어요</p>
                      <p className="text-sm">활동하면 여기에 기록이 나타나요!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 보조 차트들 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 카테고리별 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-2 border-purple-200 shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-pink-500" />
                      카테고리별 적립
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.categoryStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={stats.categoryStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="earned"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {stats.categoryStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`${value.toLocaleString()}P`, '적립']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-gray-400">
                        데이터가 없어요
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* 요일별 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="border-2 border-purple-200 shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      요일별 활동
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={stats.weekdayStats}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="day" fontSize={12} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} fontSize={10} />
                        <Radar name="적립" dataKey="earned" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
                        <Radar name="사용" dataKey="spent" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 빠른 통계 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    빠른 통계
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <div className="text-2xl md:text-3xl font-black text-green-600">{stats.avgDaily}</div>
                      <div className="text-sm text-green-700">일 평균 적립</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                      <div className="text-2xl md:text-3xl font-black text-blue-600">{stats.transactionCount}</div>
                      <div className="text-sm text-blue-700">총 거래 수</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                      <div className="text-2xl md:text-3xl font-black text-purple-600">{stats.biggestEarn}</div>
                      <div className="text-sm text-purple-700">최대 적립</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                      <div className="text-2xl md:text-3xl font-black text-amber-600">
                        {stats.totalEarned > 0 ? Math.round((stats.totalSpent / stats.totalEarned) * 100) : 0}%
                      </div>
                      <div className="text-sm text-amber-700">사용률</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* 포인트 탭 */}
          <TabsContent value="points" className="space-y-6">
            {/* 포인트 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <TrendingUp className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">+{stats.totalEarned.toLocaleString()}</div>
                  <div className="text-sm opacity-80">총 적립</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500 to-rose-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <TrendingDown className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">-{stats.totalSpent.toLocaleString()}</div>
                  <div className="text-sm opacity-80">총 사용</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <Activity className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{stats.netChange >= 0 ? '+' : ''}{stats.netChange.toLocaleString()}</div>
                  <div className="text-sm opacity-80">순 변동</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{stats.avgDaily}</div>
                  <div className="text-sm opacity-80">일 평균</div>
                </CardContent>
              </Card>
            </div>

            {/* 일별 상세 차트 */}
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-purple-500" />
                  일별 포인트 추이
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.dailyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={stats.dailyStats}>
                      <defs>
                        <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="dateLabel" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value: number, name: string) => [
                          `${value.toLocaleString()}P`,
                          name === 'earned' ? '적립' : '사용'
                        ]}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="earned" name="적립" stroke="#22c55e" fillOpacity={1} fill="url(#colorEarned)" />
                      <Area type="monotone" dataKey="spent" name="사용" stroke="#ef4444" fillOpacity={1} fill="url(#colorSpent)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-gray-400">
                    데이터가 없어요
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 카테고리별 상세 */}
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-pink-500" />
                  카테고리별 상세
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.categoryStats.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl border-2 hover:shadow-md transition-all"
                      style={{ borderColor: cat.color + '40', backgroundColor: cat.color + '10' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg" style={{ color: cat.color }}>{cat.name}</span>
                        <Badge variant="outline" style={{ borderColor: cat.color, color: cat.color }}>
                          {cat.count}회
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">적립</div>
                          <div className="text-xl font-bold text-green-600">+{cat.earned.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">사용</div>
                          <div className="text-xl font-bold text-red-600">-{cat.spent.toLocaleString()}</div>
                        </div>
                      </div>
                      <Progress
                        value={cat.earned > 0 ? (cat.earned / (cat.earned + cat.spent)) * 100 : 0}
                        className="h-2 mt-3"
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 학습 탭 */}
          <TabsContent value="learning" className="space-y-6">
            {/* 학습 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <BookOpen className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{learningStats.totalWords}</div>
                  <div className="text-sm opacity-80">학습한 단어</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <Crown className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{learningStats.masteredWords}</div>
                  <div className="text-sm opacity-80">마스터</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{learningStats.accuracy}%</div>
                  <div className="text-sm opacity-80">정답률</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <Gamepad2 className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{quizStats.completedQuizzes}</div>
                  <div className="text-sm opacity-80">퀴즈 클리어</div>
                </CardContent>
              </Card>
            </div>

            {/* 학습 진행률 */}
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  영어 학습 진행률
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">마스터 진행률</span>
                      <span className="font-bold text-purple-600">{learningStats.masteryRate}%</span>
                    </div>
                    <Progress value={learningStats.masteryRate} className="h-4" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {learningStats.masteredWords}개 마스터 / {learningStats.totalWords}개 학습
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">복습 횟수</span>
                      <span className="font-bold text-blue-600">{learningStats.totalReviews}회</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{learningStats.totalReviews}</div>
                        <div className="text-xs text-blue-700">총 복습</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">{learningStats.accuracy}%</div>
                        <div className="text-xs text-green-700">정답률</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">{learningStats.masteredWords}</div>
                        <div className="text-xs text-yellow-700">마스터</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 퀴즈 통계 */}
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  퀴즈 성과
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="text-3xl mb-1">🌱</div>
                    <div className="text-2xl font-black text-green-600">{quizStats.byTier.basic}</div>
                    <div className="text-sm text-green-700">기초 클리어</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                    <div className="text-3xl mb-1">⚡</div>
                    <div className="text-2xl font-black text-blue-600">{quizStats.byTier.intermediate}</div>
                    <div className="text-sm text-blue-700">실력 클리어</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200">
                    <div className="text-3xl mb-1">👑</div>
                    <div className="text-2xl font-black text-purple-600">{quizStats.byTier.master}</div>
                    <div className="text-sm text-purple-700">마스터 클리어</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500">총 도전 횟수</div>
                    <div className="text-2xl font-bold">{quizStats.totalAttempts}회</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500">평균 점수</div>
                    <div className="text-2xl font-bold">{quizStats.avgScore}점</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 업적 탭 */}
          <TabsContent value="achievements" className="space-y-6">
            {/* 업적 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <Medal className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{badgeStats.earnedCount}</div>
                  <div className="text-sm opacity-80">획득 배지</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <Flame className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{stats.streak.longest}</div>
                  <div className="text-sm opacity-80">최장 연속</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{goalStats.completedCount}</div>
                  <div className="text-sm opacity-80">목표 달성</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <Star className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-black">{stats.biggestEarn}</div>
                  <div className="text-sm opacity-80">최대 적립</div>
                </CardContent>
              </Card>
            </div>

            {/* 최근 배지 */}
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  최근 획득 배지
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {badgeStats.recentBadges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {badgeStats.recentBadges.map((badge: any, idx: number) => (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200"
                      >
                        <div className="text-4xl mb-2">{badge.badges?.icon || '🏆'}</div>
                        <div className="font-bold text-sm">{badge.badges?.name || '배지'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(badge.earned_at).toLocaleDateString('ko-KR')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Medal className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>아직 획득한 배지가 없어요</p>
                    <p className="text-sm">활동을 하면 배지를 받을 수 있어요!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 목표 진행률 */}
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  저축 목표
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <PiggyBank className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <div className="text-3xl font-black text-green-600">{goalStats.totalSaved.toLocaleString()}</div>
                    <div className="text-sm text-green-700">모은 포인트</div>
                    <Progress value={goalStats.progressPercent} className="h-2 mt-3" />
                    <div className="text-xs text-gray-500 mt-1">
                      목표의 {goalStats.progressPercent}% 달성
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <span className="text-gray-600">진행 중인 목표</span>
                      <span className="text-xl font-bold text-blue-600">{goalStats.activeCount}개</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <span className="text-gray-600">달성한 목표</span>
                      <span className="text-xl font-bold text-green-600">{goalStats.completedCount}개</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <span className="text-gray-600">목표 포인트</span>
                      <span className="text-xl font-bold text-purple-600">{goalStats.totalTarget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 인사이트 탭 */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  주우의 성장 인사이트
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* 동적 인사이트 생성 */}
                {stats.streak.current >= 3 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-l-4 border-orange-500"
                  >
                    <div className="flex items-center gap-3">
                      <Flame className="h-8 w-8 text-orange-500" />
                      <div>
                        <div className="font-bold text-orange-800">연속 활동 대단해요! 🔥</div>
                        <div className="text-sm text-orange-600">
                          {stats.streak.current}일 연속으로 활동하고 있어요! 이 기세로 계속 가보자!
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {stats.trendDirection === 'up' && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="font-bold text-green-800">포인트 상승 중! 📈</div>
                        <div className="text-sm text-green-600">
                          지난주보다 {stats.trendPercent}% 더 많이 적립했어요!
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {learningStats.accuracy >= 80 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-500"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="font-bold text-blue-800">영어 천재 등장! 🎯</div>
                        <div className="text-sm text-blue-600">
                          정답률 {learningStats.accuracy}%! 정말 잘하고 있어요!
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {badgeStats.earnedCount >= 5 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-l-4 border-yellow-500"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-yellow-500" />
                      <div>
                        <div className="font-bold text-yellow-800">배지 수집가! 🏆</div>
                        <div className="text-sm text-yellow-600">
                          벌써 {badgeStats.earnedCount}개의 배지를 모았어요!
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 기본 인사이트 */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border-l-4 border-purple-500"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="font-bold text-purple-800">오늘의 팁! 💡</div>
                      <div className="text-sm text-purple-600">
                        {stats.avgDaily > 0
                          ? `하루 평균 ${stats.avgDaily}포인트를 적립하고 있어요. 꾸준히 하면 큰 보상을 받을 수 있어요!`
                          : '활동을 시작하면 포인트를 모을 수 있어요!'}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 시간대별 활동 분석 */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-l-4 border-pink-500"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-pink-500" />
                    <div>
                      <div className="font-bold text-pink-800">활동 시간대 분석 ⏰</div>
                      <div className="text-sm text-pink-600">
                        {(() => {
                          const peakHour = stats.hourlyStats.reduce((max, h) =>
                            h.count > max.count ? h : max
                          , { hour: '0시', count: 0 });
                          return peakHour.count > 0
                            ? `${peakHour.hour}에 가장 활발하게 활동해요!`
                            : '활동 데이터를 모으고 있어요!';
                        })()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* 시간대별 히트맵 */}
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  시간대별 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.hourlyStats.filter((_, i) => i >= 6 && i <= 22)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="hour" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip
                      formatter={(value: number) => [`${value}회`, '활동']}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 하단 격려 메시지 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white border-0 shadow-2xl">
            <CardContent className="py-8 text-center">
              <div className="text-5xl mb-4">
                {stats.streak.current >= 7 ? '🏆' : stats.streak.current >= 3 ? '⭐' : '🌟'}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {stats.streak.current >= 7
                  ? '와! 일주일 넘게 연속 활동!'
                  : badgeStats.earnedCount >= 10
                  ? '배지 마스터!'
                  : stats.totalEarned >= 1000
                  ? '1000포인트 이상 적립!'
                  : '꾸준히 잘하고 있어요!'}
              </h3>
              <p className="opacity-90">
                {stats.streak.current >= 7
                  ? '정말 대단한 끈기예요! 계속 화이팅!'
                  : badgeStats.earnedCount >= 10
                  ? '배지를 많이 모았네요! 대단해!'
                  : stats.totalEarned >= 1000
                  ? '엄청난 포인트 부자!'
                  : '매일 조금씩 성장하고 있어요!'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
