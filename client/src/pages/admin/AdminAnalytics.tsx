import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  BarChart3, TrendingUp, TrendingDown, Coins, Target, Trophy,
  Flame, Star, Crown, Zap, BookOpen, Brain, Sparkles, Medal,
  Calendar, Clock, Award, Gamepad2, ShoppingCart, PiggyBank,
  Activity, ArrowUpRight, ArrowDownRight, Users, RefreshCw,
  Download, Filter, Layers, Eye, CheckCircle2, XCircle
} from "lucide-react";

const CHART_COLORS = ['#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#06b6d4', '#10b981', '#f97316', '#ef4444', '#a855f7'];

interface Transaction {
  id: number;
  amount: number;
  note: string;
  created_at: string;
  balance_after: number;
}

interface AnalyticsData {
  transactions: Transaction[];
  quizProgress: any[];
  learningProgress: any[];
  badges: any[];
  goals: any[];
  purchases: any[];
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<AnalyticsData>({
    transactions: [],
    quizProgress: [],
    learningProgress: [],
    badges: [],
    goals: [],
    purchases: [],
  });

  useEffect(() => {
    loadData();
  }, [timeRange]);

  async function loadData() {
    setLoading(true);
    try {
      const startDate = getStartDate();

      const [txRes, quizRes, learningRes, badgesRes, goalsRes, purchasesRes] = await Promise.all([
        supabase
          .from('point_transactions')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true }),
        supabase.from('ebook_quiz_progress').select('*'),
        supabase.from('english_learning_progress').select('*'),
        supabase.from('user_badges').select('*, badges(*)'),
        supabase.from('goals').select('*'),
        supabase.from('purchases').select('*, shop_items(*)'),
      ]);

      setData({
        transactions: txRes.data || [],
        quizProgress: quizRes.data || [],
        learningProgress: learningRes.data || [],
        badges: badgesRes.data || [],
        goals: goalsRes.data || [],
        purchases: purchasesRes.data || [],
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStartDate(): Date {
    const now = new Date();
    switch (timeRange) {
      case '7d': return new Date(now.setDate(now.getDate() - 7));
      case '30d': return new Date(now.setDate(now.getDate() - 30));
      case '90d': return new Date(now.setDate(now.getDate() - 90));
      default: return new Date('2020-01-01');
    }
  }

  // 포인트 분석
  const pointsAnalytics = useMemo(() => {
    const { transactions } = data;
    if (transactions.length === 0) return null;

    const earned = transactions.filter(t => t.amount > 0);
    const spent = transactions.filter(t => t.amount < 0);
    const totalEarned = earned.reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = Math.abs(spent.reduce((sum, t) => sum + t.amount, 0));

    // 일별 데이터
    const dailyMap = new Map<string, { date: string; earned: number; spent: number; count: number }>();
    transactions.forEach(t => {
      const dateStr = new Date(t.created_at).toISOString().split('T')[0];
      const existing = dailyMap.get(dateStr) || { date: dateStr, earned: 0, spent: 0, count: 0 };
      if (t.amount > 0) existing.earned += t.amount;
      else existing.spent += Math.abs(t.amount);
      existing.count++;
      dailyMap.set(dateStr, existing);
    });
    const dailyData = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        ...d,
        dateLabel: new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        net: d.earned - d.spent,
      }));

    // 카테고리 분석
    const categoryMap = new Map<string, { name: string; earned: number; spent: number; count: number }>();
    transactions.forEach(t => {
      let category = '기타';
      const note = t.note?.toLowerCase() ?? '';
      if (note.includes('퀴즈') || note.includes('quiz')) category = '퀴즈';
      else if (note.includes('플래시') || note.includes('단어') || note.includes('학습')) category = '학습';
      else if (note.includes('책') || note.includes('읽기')) category = '읽기';
      else if (note.includes('상점') || note.includes('구매')) category = '상점';
      else if (t.amount > 0) category = '생활습관';

      const existing = categoryMap.get(category) || { name: category, earned: 0, spent: 0, count: 0 };
      if (t.amount > 0) existing.earned += t.amount;
      else existing.spent += Math.abs(t.amount);
      existing.count++;
      categoryMap.set(category, existing);
    });
    const categoryData = Array.from(categoryMap.values());

    // 요일별 분석
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
    const weekdayData = Array.from(weekdayMap.values());

    // 시간대별 분석
    const hourlyMap = new Map<number, { hour: string; count: number; points: number }>();
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { hour: `${i}시`, count: 0, points: 0 });
    }
    transactions.forEach(t => {
      const hour = new Date(t.created_at).getHours();
      const stat = hourlyMap.get(hour)!;
      stat.count++;
      if (t.amount > 0) stat.points += t.amount;
    });
    const hourlyData = Array.from(hourlyMap.values());

    // 트렌드 계산
    const now = new Date();
    const recent7 = transactions.filter(t => {
      const days = Math.floor((now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return days < 7 && t.amount > 0;
    });
    const prev7 = transactions.filter(t => {
      const days = Math.floor((now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 7 && days < 14 && t.amount > 0;
    });
    const recentEarned = recent7.reduce((sum, t) => sum + t.amount, 0);
    const prevEarned = prev7.reduce((sum, t) => sum + t.amount, 0);
    const trendPercent = prevEarned > 0 ? Math.round(((recentEarned - prevEarned) / prevEarned) * 100) : 0;

    return {
      totalEarned,
      totalSpent,
      netChange: totalEarned - totalSpent,
      earnCount: earned.length,
      spendCount: spent.length,
      avgEarn: earned.length > 0 ? Math.round(totalEarned / earned.length) : 0,
      avgSpend: spent.length > 0 ? Math.round(totalSpent / spent.length) : 0,
      biggestEarn: earned.length > 0 ? Math.max(...earned.map(t => t.amount)) : 0,
      biggestSpend: spent.length > 0 ? Math.max(...spent.map(t => Math.abs(t.amount))) : 0,
      dailyData,
      categoryData,
      weekdayData,
      hourlyData,
      trendPercent,
      trendDirection: trendPercent > 5 ? 'up' : trendPercent < -5 ? 'down' : 'stable',
    };
  }, [data.transactions]);

  // 학습 분석
  const learningAnalytics = useMemo(() => {
    const { learningProgress, quizProgress } = data;

    const totalWords = learningProgress.length;
    const masteredWords = learningProgress.filter(p => p.mastery_level >= 3).length;
    const totalReviews = learningProgress.reduce((sum, p) => sum + (p.review_count ?? 0), 0);
    const totalCorrect = learningProgress.reduce((sum, p) => sum + (p.correct_count ?? 0), 0);
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    // 마스터리 분포
    const masteryDistribution = [
      { name: '미학습', value: 100 - totalWords, color: '#e5e7eb' },
      { name: '레벨 1', value: learningProgress.filter(p => p.mastery_level === 1).length, color: '#fbbf24' },
      { name: '레벨 2', value: learningProgress.filter(p => p.mastery_level === 2).length, color: '#60a5fa' },
      { name: '마스터', value: masteredWords, color: '#22c55e' },
    ].filter(d => d.value > 0);

    // 퀴즈 통계
    const completedQuizzes = quizProgress.filter(q => q.is_completed).length;
    const totalAttempts = quizProgress.reduce((sum, q) => sum + (q.total_attempts ?? 0), 0);
    const avgScore = quizProgress.length > 0
      ? Math.round(quizProgress.reduce((sum, q) => sum + (q.best_score ?? 0), 0) / quizProgress.length)
      : 0;

    const quizByTier = [
      { tier: '기초', completed: quizProgress.filter(q => q.quiz_tier === 'basic' && q.is_completed).length, total: quizProgress.filter(q => q.quiz_tier === 'basic').length },
      { tier: '실력', completed: quizProgress.filter(q => q.quiz_tier === 'intermediate' && q.is_completed).length, total: quizProgress.filter(q => q.quiz_tier === 'intermediate').length },
      { tier: '마스터', completed: quizProgress.filter(q => q.quiz_tier === 'master' && q.is_completed).length, total: quizProgress.filter(q => q.quiz_tier === 'master').length },
    ];

    return {
      totalWords,
      masteredWords,
      totalReviews,
      accuracy,
      masteryRate: totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0,
      masteryDistribution,
      completedQuizzes,
      totalAttempts,
      avgScore,
      quizByTier,
    };
  }, [data.learningProgress, data.quizProgress]);

  // 업적 분석
  const achievementAnalytics = useMemo(() => {
    const { badges, goals } = data;

    const earnedBadges = badges.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;

    // 배지 카테고리별
    const badgesByCategory = badges.reduce((acc: Record<string, number>, b: any) => {
      const category = b.badges?.category || '기타';
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    }, {});

    const badgeCategoryData = Object.entries(badgesByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    // 최근 배지
    const recentBadges = badges
      .sort((a: any, b: any) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, 5);

    return {
      earnedBadges,
      activeGoals,
      completedGoals,
      badgeCategoryData,
      recentBadges,
    };
  }, [data.badges, data.goals]);

  // 구매 분석
  const purchaseAnalytics = useMemo(() => {
    const { purchases } = data;

    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + (p.point_cost ?? 0), 0);
    const completedPurchases = purchases.filter(p => p.status === 'completed').length;

    // 카테고리별 구매
    const categoryMap = new Map<string, number>();
    purchases.forEach((p: any) => {
      const category = p.shop_items?.category || '기타';
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
    });
    const purchaseByCategoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      totalPurchases,
      totalSpent,
      completedPurchases,
      purchaseByCategoryData,
      avgPurchase: totalPurchases > 0 ? Math.round(totalSpent / totalPurchases) : 0,
    };
  }, [data.purchases]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            분석 대시보드
          </h1>
          <p className="text-muted-foreground mt-1">
            주우의 활동 데이터를 분석합니다
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7일</SelectItem>
              <SelectItem value="30d">30일</SelectItem>
              <SelectItem value="90d">90일</SelectItem>
              <SelectItem value="all">전체</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            리포트
          </Button>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">총 적립</p>
                  <p className="text-3xl font-black">
                    {pointsAnalytics ? `+${pointsAnalytics.totalEarned.toLocaleString()}` : '0'}
                  </p>
                  {pointsAnalytics && pointsAnalytics.trendDirection !== 'stable' && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {pointsAnalytics.trendDirection === 'up' ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(pointsAnalytics.trendPercent)}% vs 지난주
                    </div>
                  )}
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-red-500 to-rose-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">총 사용</p>
                  <p className="text-3xl font-black">
                    {pointsAnalytics ? `-${pointsAnalytics.totalSpent.toLocaleString()}` : '0'}
                  </p>
                  <p className="text-xs mt-1 opacity-80">
                    {pointsAnalytics?.spendCount ?? 0}회 사용
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">학습 단어</p>
                  <p className="text-3xl font-black">{learningAnalytics.totalWords}</p>
                  <p className="text-xs mt-1 opacity-80">
                    정답률 {learningAnalytics.accuracy}%
                  </p>
                </div>
                <BookOpen className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">획득 배지</p>
                  <p className="text-3xl font-black">{achievementAnalytics.earnedBadges}</p>
                  <p className="text-xs mt-1 opacity-80">
                    목표 {achievementAnalytics.completedGoals}개 달성
                  </p>
                </div>
                <Medal className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 메인 차트 영역 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 포인트 추이 */}
        <Card className="lg:col-span-2 border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              포인트 추이
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {pointsAnalytics && pointsAnalytics.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={pointsAnalytics.dailyData.slice(-14)}>
                  <defs>
                    <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="dateLabel" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()}P`,
                      name === 'earned' ? '적립' : name === 'spent' ? '사용' : '순수익'
                    ]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="earned" name="적립" fill="url(#earnGrad)" stroke="#22c55e" />
                  <Area type="monotone" dataKey="spent" name="사용" fill="url(#spendGrad)" stroke="#ef4444" />
                  <Line type="monotone" dataKey="net" name="순수익" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>데이터가 없습니다</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 카테고리별 */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-pink-500" />
              카테고리별 적립
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {pointsAnalytics && pointsAnalytics.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pointsAnalytics.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="earned"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pointsAnalytics.categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()}P`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                데이터 없음
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 중간 분석 영역 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 요일별 활동 */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              요일별 활동
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {pointsAnalytics && (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={pointsAnalytics.weekdayData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="day" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} fontSize={10} />
                  <Radar name="적립" dataKey="earned" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 시간대별 활동 */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              시간대별 활동
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {pointsAnalytics && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pointsAnalytics.hourlyData.filter((_, i) => i >= 6 && i <= 22)}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip formatter={(value: number) => [`${value}회`]} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 퀴즈 티어별 */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-pink-500" />
              퀴즈 티어별 클리어
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {learningAnalytics.quizByTier.map((tier, idx) => (
                <div key={tier.tier}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{tier.tier}</span>
                    <span className="text-sm text-muted-foreground">
                      {tier.completed}/{tier.total}
                    </span>
                  </div>
                  <Progress
                    value={tier.total > 0 ? (tier.completed / tier.total) * 100 : 0}
                    className="h-2"
                  />
                </div>
              ))}
              <div className="pt-4 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{learningAnalytics.completedQuizzes}</div>
                  <div className="text-xs text-purple-700">클리어</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{learningAnalytics.totalAttempts}</div>
                  <div className="text-xs text-blue-700">시도</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 하단 분석 영역 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 상세 통계 */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              핵심 지표
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-green-700">평균 적립</div>
                <div className="text-2xl font-bold text-green-600">
                  {pointsAnalytics?.avgEarn ?? 0}P
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <div className="text-sm text-red-700">평균 사용</div>
                <div className="text-2xl font-bold text-red-600">
                  {pointsAnalytics?.avgSpend ?? 0}P
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-sm text-blue-700">최대 적립</div>
                <div className="text-2xl font-bold text-blue-600">
                  {pointsAnalytics?.biggestEarn ?? 0}P
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-sm text-purple-700">마스터율</div>
                <div className="text-2xl font-bold text-purple-600">
                  {learningAnalytics.masteryRate}%
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">학습 진행률</span>
                <span className="text-sm text-muted-foreground">
                  {learningAnalytics.masteredWords}/{learningAnalytics.totalWords} 마스터
                </span>
              </div>
              <Progress value={learningAnalytics.masteryRate} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* 최근 배지 */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              최근 업적
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {achievementAnalytics.recentBadges.length > 0 ? (
              <div className="space-y-3">
                {achievementAnalytics.recentBadges.map((badge: any, idx: number) => (
                  <motion.div
                    key={badge.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl"
                  >
                    <div className="text-3xl">{badge.badges?.icon || '🏆'}</div>
                    <div className="flex-1">
                      <div className="font-medium">{badge.badges?.name || '배지'}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(badge.earned_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Medal className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>아직 획득한 배지가 없습니다</p>
              </div>
            )}

            {/* 배지 카테고리 분포 */}
            {achievementAnalytics.badgeCategoryData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">카테고리별 배지</h4>
                <div className="flex flex-wrap gap-2">
                  {achievementAnalytics.badgeCategoryData.map((cat, idx) => (
                    <Badge
                      key={cat.name}
                      variant="outline"
                      style={{ borderColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    >
                      {cat.name}: {cat.value}개
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 구매 분석 */}
      {purchaseAnalytics.totalPurchases > 0 && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              구매 분석
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600">{purchaseAnalytics.totalPurchases}</div>
                <div className="text-sm text-blue-700">총 구매</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-600">{purchaseAnalytics.completedPurchases}</div>
                <div className="text-sm text-green-700">완료</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-amber-600">{purchaseAnalytics.totalSpent.toLocaleString()}</div>
                <div className="text-sm text-amber-700">사용 포인트</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-purple-600">{purchaseAnalytics.avgPurchase}</div>
                <div className="text-sm text-purple-700">평균 구매</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
