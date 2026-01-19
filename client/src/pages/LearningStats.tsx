import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import {
  Calendar, TrendingUp, Target, Award, ArrowLeft, Star, Flame,
  Trophy, Crown, Zap, BookOpen, Brain, Sparkles, Medal,
  CheckCircle, XCircle, Clock, BarChart3
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { englishWordsData, type WordCategory } from "@/data/englishWordsData";
import { motion, AnimatePresence } from "framer-motion";

// 카테고리 색상
const categoryColors: Record<string, string> = {
  "동물": "#f59e0b",
  "과일": "#ef4444",
  "색깔": "#8b5cf6",
  "숫자": "#3b82f6",
  "가족": "#ec4899",
  "음식": "#eab308",
  "자연": "#22c55e",
  "탈것": "#64748b",
  "신체": "#f43f5e",
  "감정": "#fbbf24",
  "날씨": "#0ea5e9",
  "포켓몬": "#facc15",
  "동사": "#6366f1",
  "학교": "#2563eb",
  "장소": "#14b8a6",
  "반대말": "#a855f7",
  "시간": "#f97316",
  "일상표현": "#84cc16",
  "옷": "#d946ef",
  "집": "#d97706",
  "스포츠": "#10b981",
  "직업": "#06b6d4",
  "악기": "#7c3aed",
  "형용사": "#059669",
  "문장": "#4f46e5",
};

const CHART_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

interface LearningProgress {
  id: number;
  juwoo_id: number;
  word_id: number;
  mastery_level: number;
  review_count: number;
  correct_count: number;
  last_reviewed_at: string;
  created_at: string;
}

interface CategoryStat {
  name: string;
  total: number;
  learned: number;
  mastered: number;
  accuracy: number;
  color: string;
}

interface DailyStat {
  date: string;
  reviews: number;
  correct: number;
  accuracy: number;
}

export default function LearningStats() {
  const [progressData, setProgressData] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // 전체 단어 수 (englishWordsData 기준)
  const totalWordsCount = englishWordsData.length;

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { data } = await supabase
        .from('english_learning_progress')
        .select('*')
        .eq('juwoo_id', 1)
        .order('last_reviewed_at', { ascending: false });

      setProgressData(data || []);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  // 계산된 통계들
  const stats = useMemo(() => {
    // 학습한 고유 단어 수
    const learnedWords = new Set(progressData.map(p => p.word_id));
    const learnedCount = learnedWords.size;

    // 마스터한 단어 수 (mastery_level >= 3)
    const masteredCount = progressData.filter(p => p.mastery_level >= 3).length;

    // 총 복습 횟수
    const totalReviews = progressData.reduce((sum, p) => sum + p.review_count, 0);

    // 총 정답 수
    const totalCorrect = progressData.reduce((sum, p) => sum + p.correct_count, 0);

    // 평균 정답률
    const avgAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    // 연속 학습 일수 계산
    const reviewDates = new Set(
      progressData
        .filter(p => p.last_reviewed_at)
        .map(p => new Date(p.last_reviewed_at).toDateString())
    );
    let streak = 0;
    let currentDate = new Date();
    while (reviewDates.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // 일별 통계 (최근 7일)
    const dailyStats: DailyStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayLabel = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

      const dayProgress = progressData.filter(p => {
        if (!p.last_reviewed_at) return false;
        return new Date(p.last_reviewed_at).toDateString() === dateStr;
      });

      const reviews = dayProgress.reduce((sum, p) => sum + p.review_count, 0);
      const correct = dayProgress.reduce((sum, p) => sum + p.correct_count, 0);

      dailyStats.push({
        date: dayLabel,
        reviews: dayProgress.length, // 해당 날짜에 학습한 단어 수
        correct: correct,
        accuracy: reviews > 0 ? Math.round((correct / reviews) * 100) : 0,
      });
    }

    // 카테고리별 통계
    const categoryStatsMap = new Map<string, CategoryStat>();

    // 먼저 모든 카테고리 초기화
    const allCategories = new Set(englishWordsData.map(w => w.category));
    allCategories.forEach(cat => {
      const wordsInCategory = englishWordsData.filter(w => w.category === cat);
      categoryStatsMap.set(cat, {
        name: cat,
        total: wordsInCategory.length,
        learned: 0,
        mastered: 0,
        accuracy: 0,
        color: categoryColors[cat] || '#6b7280',
      });
    });

    // 학습 데이터 반영
    progressData.forEach(p => {
      const word = englishWordsData.find(w => w.id === p.word_id);
      if (word) {
        const stat = categoryStatsMap.get(word.category);
        if (stat) {
          stat.learned++;
          if (p.mastery_level >= 3) stat.mastered++;
        }
      }
    });

    // 카테고리별 정확도 계산
    const categoryAccuracy = new Map<string, { correct: number; total: number }>();
    progressData.forEach(p => {
      const word = englishWordsData.find(w => w.id === p.word_id);
      if (word) {
        const existing = categoryAccuracy.get(word.category) || { correct: 0, total: 0 };
        categoryAccuracy.set(word.category, {
          correct: existing.correct + p.correct_count,
          total: existing.total + p.review_count,
        });
      }
    });

    categoryAccuracy.forEach((acc, cat) => {
      const stat = categoryStatsMap.get(cat);
      if (stat && acc.total > 0) {
        stat.accuracy = Math.round((acc.correct / acc.total) * 100);
      }
    });

    const categoryStats = Array.from(categoryStatsMap.values())
      .filter(s => s.learned > 0)
      .sort((a, b) => b.learned - a.learned);

    // 마스터리 분포
    const masteryDistribution = [
      { name: '새로운 단어', value: totalWordsCount - learnedCount, fill: '#e5e7eb' },
      { name: '학습 중', value: progressData.filter(p => p.mastery_level < 3).length, fill: '#fbbf24' },
      { name: '마스터', value: masteredCount, fill: '#22c55e' },
    ];

    return {
      learnedCount,
      masteredCount,
      totalReviews,
      totalCorrect,
      avgAccuracy,
      streak,
      dailyStats,
      categoryStats,
      masteryDistribution,
    };
  }, [progressData, totalWordsCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const progressPercent = Math.round((stats.learnedCount / totalWordsCount) * 100);
  const masteryPercent = Math.round((stats.masteredCount / totalWordsCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/english-learning">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Button>
          </Link>
        </div>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold mb-4">
            <BarChart3 className="h-4 w-4" />
            주우의 학습 기록
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
            학습 통계 📊
          </h1>
          <p className="text-lg text-muted-foreground">
            꾸준히 열심히 하고 있어요!
          </p>
        </motion.div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">연속 학습</span>
                </div>
                <div className="text-4xl font-black">{stats.streak}일</div>
                <p className="text-xs opacity-80 mt-1">
                  {stats.streak >= 7 ? "🔥 대단해!" : stats.streak >= 3 ? "💪 잘하고 있어!" : "🌟 시작이 좋아!"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">학습한 단어</span>
                </div>
                <div className="text-4xl font-black">{stats.learnedCount}개</div>
                <p className="text-xs opacity-80 mt-1">총 {totalWordsCount}개 중</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">마스터</span>
                </div>
                <div className="text-4xl font-black">{stats.masteredCount}개</div>
                <p className="text-xs opacity-80 mt-1">완벽하게 외운 단어!</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">정답률</span>
                </div>
                <div className="text-4xl font-black">{stats.avgAccuracy}%</div>
                <p className="text-xs opacity-80 mt-1">
                  {stats.avgAccuracy >= 80 ? "👍 최고예요!" : stats.avgAccuracy >= 60 ? "💪 잘하고 있어!" : "🌟 화이팅!"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 진행률 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="border-2 border-purple-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                전체 진행률
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* 학습 진행률 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      학습 진행률
                    </span>
                    <span className="font-bold text-blue-600">{stats.learnedCount} / {totalWordsCount}</span>
                  </div>
                  <div className="relative">
                    <Progress value={progressPercent} className="h-4" />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                      {progressPercent}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {totalWordsCount - stats.learnedCount}개 단어가 남았어요!
                  </p>
                </div>

                {/* 마스터 진행률 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      마스터 진행률
                    </span>
                    <span className="font-bold text-yellow-600">{stats.masteredCount} / {totalWordsCount}</span>
                  </div>
                  <div className="relative">
                    <Progress value={masteryPercent} className="h-4 [&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-amber-500" />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                      {masteryPercent}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    완벽하게 외운 단어예요!
                  </p>
                </div>
              </div>

              {/* 마스터리 분포 */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-black text-gray-400">{totalWordsCount - stats.learnedCount}</div>
                  <div className="text-sm text-gray-500">새로운 단어</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <div className="text-3xl font-black text-yellow-600">{stats.learnedCount - stats.masteredCount}</div>
                  <div className="text-sm text-yellow-700">학습 중</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-black text-green-600">{stats.masteredCount}</div>
                  <div className="text-sm text-green-700">마스터!</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 차트 영역 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 일별 학습 현황 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-2 border-purple-200 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  일별 학습 현황
                </CardTitle>
                <CardDescription>최근 7일간 학습 기록</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.dailyStats.some(d => d.reviews > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        formatter={(value: number, name: string) => [
                          value,
                          name === 'reviews' ? '학습 단어' : '정답'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="reviews" fill="#8b5cf6" name="학습 단어" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="correct" fill="#22c55e" name="정답" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
                    <BookOpen className="h-12 w-12 mb-3 opacity-50" />
                    <p>아직 학습 기록이 없어요</p>
                    <Link href="/english-flashcard">
                      <Button variant="link" className="mt-2">학습 시작하기 →</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 카테고리별 학습 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-2 border-purple-200 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-pink-500" />
                  카테고리별 학습
                </CardTitle>
                <CardDescription>어떤 주제를 많이 배웠는지</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.categoryStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.categoryStats.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="learned"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {stats.categoryStats.slice(0, 8).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string, props: any) => [
                          `${value}개 학습`,
                          props.payload.name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
                    <Brain className="h-12 w-12 mb-3 opacity-50" />
                    <p>아직 학습 기록이 없어요</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 카테고리별 상세 */}
        {stats.categoryStats.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  카테고리별 상세 통계
                </CardTitle>
                <CardDescription>각 주제별 학습 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stats.categoryStats.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 * idx }}
                      className="p-4 rounded-xl border-2 hover:shadow-md transition-shadow"
                      style={{ borderColor: cat.color + '40', backgroundColor: cat.color + '10' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold" style={{ color: cat.color }}>{cat.name}</span>
                        <Badge
                          variant="outline"
                          style={{ borderColor: cat.color, color: cat.color }}
                        >
                          {cat.accuracy}%
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {cat.learned} / {cat.total} 학습
                      </div>
                      <Progress
                        value={(cat.learned / cat.total) * 100}
                        className="h-2"
                        style={{
                          backgroundColor: cat.color + '20',
                        }}
                      />
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Crown className="h-3 w-3 text-yellow-500" />
                        <span>{cat.mastered}개 마스터</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 학습 시작 유도 (데이터 없을 때) */}
        {stats.learnedCount === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2">아직 학습 기록이 없어요!</h2>
            <p className="text-muted-foreground mb-6">
              플래시카드로 영어 단어를 배워보세요!
            </p>
            <Link href="/english-flashcard">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Sparkles className="h-5 w-5 mr-2" />
                학습 시작하기
              </Button>
            </Link>
          </motion.div>
        )}

        {/* 격려 메시지 */}
        {stats.learnedCount > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white border-0 shadow-xl">
              <CardContent className="py-8">
                <div className="text-4xl mb-4">
                  {stats.streak >= 7 ? "🏆" : stats.streak >= 3 ? "⭐" : "🌟"}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {stats.streak >= 7
                    ? "와! 일주일 넘게 연속 학습 중!"
                    : stats.masteredCount >= 50
                    ? "50개 이상 마스터! 대단해!"
                    : stats.avgAccuracy >= 80
                    ? "정답률이 아주 높아요!"
                    : "꾸준히 잘하고 있어요!"}
                </h3>
                <p className="opacity-90">
                  {stats.streak >= 7
                    ? "정말 대단한 끈기예요! 계속 화이팅!"
                    : stats.masteredCount >= 50
                    ? "영어 천재가 되고 있어요!"
                    : stats.avgAccuracy >= 80
                    ? "이 기세로 계속 달려봐요!"
                    : "매일 조금씩 성장하고 있어요!"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
