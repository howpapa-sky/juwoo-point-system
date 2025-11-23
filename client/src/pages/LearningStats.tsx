import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Target, Award } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export default function LearningStats() {
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // 일별 학습 통계 (최근 7일)
      const { data: progressData } = await supabase
        .from('english_learning_progress')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      // 일별 데이터 집계
      const dailyMap = new Map<string, { date: string; count: number; correct: number }>();
      progressData?.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        const existing = dailyMap.get(date) || { date, count: 0, correct: 0 };
        dailyMap.set(date, {
          date,
          count: existing.count + 1,
          correct: existing.correct + (item.is_correct ? 1 : 0)
        });
      });
      setDailyStats(Array.from(dailyMap.values()));

      // 카테고리별 정답률
      const { data: allProgress } = await supabase
        .from('english_learning_progress')
        .select('word_id, is_correct');

      const { data: words } = await supabase
        .from('english_words')
        .select('id, category');

      const categoryMap = new Map<string, { total: number; correct: number }>();
      allProgress?.forEach(item => {
        const word = words?.find(w => w.id === item.word_id);
        if (word) {
          const existing = categoryMap.get(word.category) || { total: 0, correct: 0 };
          categoryMap.set(word.category, {
            total: existing.total + 1,
            correct: existing.correct + (item.is_correct ? 1 : 0)
          });
        }
      });

      const categoryStatsData = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        name: category,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        total: stats.total
      }));
      setCategoryStats(categoryStatsData);

      // 연속 학습 일수 계산
      const uniqueDates = new Set(
        progressData?.map(item => new Date(item.created_at).toDateString()) || []
      );
      let streak = 0;
      let currentDate = new Date();
      while (uniqueDates.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      setStreakDays(streak);

      // 총 학습 단어 수
      const uniqueWords = new Set(progressData?.map(item => item.word_id) || []);
      setTotalWords(uniqueWords.size);

    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">통계 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 학습 통계</h1>
          <p className="text-gray-600">주우의 영어 학습 기록을 확인해보세요!</p>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                연속 학습
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{streakDays}일</div>
              <p className="text-xs text-blue-100 mt-1">계속 이어가세요! 🔥</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                학습한 단어
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalWords}개</div>
              <p className="text-xs text-green-100 mt-1">총 100개 중</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                최근 7일 학습
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dailyStats.reduce((sum, day) => sum + day.count, 0)}회</div>
              <p className="text-xs text-purple-100 mt-1">꾸준히 하고 있어요!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                평균 정답률
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {categoryStats.length > 0
                  ? Math.round(categoryStats.reduce((sum, cat) => sum + cat.accuracy, 0) / categoryStats.length)
                  : 0}%
              </div>
              <p className="text-xs text-orange-100 mt-1">잘하고 있어요! 👍</p>
            </CardContent>
          </Card>
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 일별 학습 현황 */}
          <Card>
            <CardHeader>
              <CardTitle>📅 일별 학습 현황</CardTitle>
              <CardDescription>최근 7일간 학습한 단어 수</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="학습 횟수" />
                    <Bar dataKey="correct" fill="#82ca9d" name="정답 수" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  아직 학습 기록이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 카테고리별 정답률 */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 카테고리별 정답률</CardTitle>
              <CardDescription>각 카테고리에서의 정답률</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#ffc658" name="정답률 (%)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  아직 학습 기록이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 카테고리별 학습 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>📊 카테고리별 학습 분포</CardTitle>
              <CardDescription>어떤 카테고리를 많이 학습했는지 확인</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  아직 학습 기록이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 학습 목표 달성률 */}
          <Card>
            <CardHeader>
              <CardTitle>🎖️ 학습 목표 달성률</CardTitle>
              <CardDescription>전체 100개 단어 중 학습 진행률</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">전체 진행률</span>
                    <span className="text-sm font-medium">{totalWords}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(totalWords / 100) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {totalWords >= 100 ? '🎉 모든 단어를 학습했어요!' : `앞으로 ${100 - totalWords}개 남았어요!`}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {categoryStats.filter(c => c.accuracy >= 80).length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">80% 이상</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {categoryStats.filter(c => c.accuracy >= 60 && c.accuracy < 80).length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">60-79%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {categoryStats.filter(c => c.accuracy < 60).length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">60% 미만</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
