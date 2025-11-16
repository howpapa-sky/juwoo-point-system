import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, PieChart, BarChart3, Target, Award } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

export default function Statistics() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");

  const { data: dailyStats, isLoading: dailyLoading } = trpc.points.dailyStats.useQuery(
    { days: period === "week" ? 7 : period === "month" ? 30 : 90 },
    { enabled: isAuthenticated }
  );

  const { data: categoryStats, isLoading: categoryLoading } = trpc.points.categoryStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: balance } = trpc.points.balance.useQuery(undefined, { enabled: isAuthenticated });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>통계를 보려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">로그인하기</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const COLORS = [
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#ef4444", // red
    "#6366f1", // indigo
    "#14b8a6", // teal
    "#f97316", // orange
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>

        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">통계 📊</h1>
          <p className="text-muted-foreground">주우의 성장을 한눈에 확인하세요!</p>
        </div>

        {/* 기간 선택 */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={period === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("week")}
          >
            최근 7일
          </Button>
          <Button
            variant={period === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("month")}
          >
            최근 30일
          </Button>
          <Button
            variant={period === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("all")}
          >
            최근 90일
          </Button>
        </div>

        {/* 요약 카드 */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="animate-slide-up">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                현재 포인트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {balance?.toLocaleString() || 0}P
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                총 적립
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {dailyStats
                  ?.reduce((sum: number, day: any) => sum + (day.earned || 0), 0)
                  .toLocaleString() || 0}
                P
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                총 사용
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {dailyStats
                  ?.reduce((sum: number, day: any) => sum + (day.spent || 0), 0)
                  .toLocaleString() || 0}
                P
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 일별 포인트 변화 그래프 */}
        <Card className="mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              일별 포인트 변화
            </CardTitle>
            <CardDescription>적립과 사용 내역을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : dailyStats && dailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="earned"
                    stroke="#10b981"
                    name="적립"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="spent"
                    stroke="#ef4444"
                    name="사용"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#8b5cf6"
                    name="순증감"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                아직 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 카테고리별 포인트 분포 */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-6 w-6 text-purple-500" />
                카테고리별 포인트
              </CardTitle>
              <CardDescription>어떤 활동으로 포인트를 많이 받았나요?</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : categoryStats && categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {categoryStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  아직 데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 카테고리별 막대 그래프 */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-500" />
                카테고리별 상세
              </CardTitle>
              <CardDescription>카테고리별 포인트 비교</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : categoryStats && categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8b5cf6" name="총 포인트" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  아직 데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 성취 배지 */}
        <Card className="mt-8 animate-slide-up" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              성취 배지
            </CardTitle>
            <CardDescription>주우가 달성한 멋진 성과들!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {balance && balance >= 10000 && (
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="font-bold">만포인트 달성</div>
                  <div className="text-sm text-muted-foreground">10,000P 이상</div>
                </div>
              )}
              {balance && balance >= 50000 && (
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                  <div className="text-4xl mb-2">💎</div>
                  <div className="font-bold">부자 주우</div>
                  <div className="text-sm text-muted-foreground">50,000P 이상</div>
                </div>
              )}
              {dailyStats && dailyStats.filter((d: any) => d.earned > 0).length >= 7 && (
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                  <div className="text-4xl mb-2">🔥</div>
                  <div className="font-bold">7일 연속</div>
                  <div className="text-sm text-muted-foreground">매일 포인트 적립</div>
                </div>
              )}
              {dailyStats &&
                dailyStats.reduce((sum: number, d: any) => sum + (d.earned || 0), 0) >= 100000 && (
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                    <div className="text-4xl mb-2">⭐</div>
                    <div className="font-bold">슈퍼스타</div>
                    <div className="text-sm text-muted-foreground">총 100,000P 적립</div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
