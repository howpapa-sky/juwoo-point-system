import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowLeft,
  X,
  Sparkles,
  Star,
  Trophy,
  Target,
  Gift,
  BookOpen,
  Gamepad2,
  ChevronRight,
  Flame,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface Transaction {
  id: number;
  amount: number;
  note: string | null;
  created_at: string;
  rule_name: string | null;
  rule_category: string | null;
}

interface Stats {
  totalEarned: number;
  totalSpent: number;
}

export default function Dashboard() {
  const { user, userRole, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ totalEarned: 0, totalSpent: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch balance from juwoo_profile
        const { data: profileData, error: profileError } = await supabase
          .from("juwoo_profile")
          .select("current_points")
          .eq("id", 1)
          .single();

        if (profileError) throw profileError;
        setBalance(profileData?.current_points || 0);

        // 2. Fetch recent 7 days stats
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: statsData, error: statsError } = await supabase
          .from("point_transactions")
          .select("amount")
          .gte("created_at", sevenDaysAgo.toISOString());

        if (statsError) throw statsError;

        const totalEarned = (statsData || [])
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);

        const totalSpent = Math.abs(
          (statsData || [])
            .filter((t) => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0)
        );

        setStats({ totalEarned, totalSpent });

        // 3. Fetch recent 5 transactions
        const { data: txData, error: txError } = await supabase
          .from("point_transactions")
          .select("id, amount, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (txError) throw txError;

        const txWithBalance = (txData || []).map((tx: any) => ({
          id: tx.id,
          amount: tx.amount,
          note: null,
          created_at: tx.created_at,
          rule_name: null,
          rule_category: null,
        }));

        setTransactions(txWithBalance);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleCancel = async (transactionId: number) => {
    if (!confirm("정말로 이 거래를 취소하시겠습니까?")) return;

    try {
      // Find the transaction to cancel
      const { data: txData, error: txError } = await supabase
        .from("point_transactions")
        .select("amount")
        .eq("id", transactionId)
        .single();

      if (txError) throw txError;

      const newBalance = balance - txData.amount;

      // Create a reverse transaction
      const { error: insertError } = await supabase
        .from("point_transactions")
        .insert({
          amount: -txData.amount,
        });

      if (insertError) throw insertError;

      // Update juwoo_profile balance
      const { error: updateError } = await supabase
        .from("juwoo_profile")
        .update({ current_points: newBalance })
        .eq("id", 1);

      if (updateError) throw updateError;

      toast.success("포인트가 취소되었습니다!");

      // Refresh data
      setBalance(newBalance);
      window.location.reload();
    } catch (error: any) {
      console.error("Error canceling transaction:", error);
      toast.error("취소에 실패했습니다.");
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <Card className="max-w-md w-full border-2 border-purple-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl w-fit mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">로그인이 필요합니다</CardTitle>
            <CardDescription>대시보드를 보려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-5xl py-8 px-4 relative">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/50">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* 환영 메시지 */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium text-purple-700 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            환영합니다
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2">
            안녕하세요, {user?.user_metadata?.name || user?.email?.split("@")[0] || "주우"}님! 👋
          </h1>
          <p className="text-muted-foreground">오늘도 좋은 하루 보내세요!</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Coins className="h-6 w-6 text-purple-600 animate-pulse" />
              </div>
            </div>
            <p className="text-muted-foreground mt-4">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 메인 포인트 카드 */}
            <Card className="mb-6 border-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                <div className="relative p-6 md:p-8">
                  {/* 배경 장식 */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                          <Coins className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-white/70 text-sm font-medium">내 포인트</p>
                          <p className="text-4xl md:text-5xl font-black">{balance.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="hidden md:block text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                          <span className="font-medium">포인트 마스터</span>
                        </div>
                        <p className="text-white/60 text-sm">레벨 업 진행중!</p>
                      </div>
                    </div>

                    {/* 주간 통계 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-300" />
                          <span className="text-white/70 text-sm">이번 주 적립</span>
                        </div>
                        <p className="text-2xl font-bold text-green-300">+{stats.totalEarned.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="h-4 w-4 text-rose-300" />
                          <span className="text-white/70 text-sm">이번 주 사용</span>
                        </div>
                        <p className="text-2xl font-bold text-rose-300">-{stats.totalSpent.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 빠른 액션 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                {
                  href: "/pokemon-quiz",
                  icon: Gamepad2,
                  label: "퀴즈",
                  color: "from-yellow-500 to-orange-500",
                  desc: "도전하기",
                },
                {
                  href: "/english-learning",
                  icon: BookOpen,
                  label: "영어 학습",
                  color: "from-blue-500 to-indigo-500",
                  desc: "단어 배우기",
                },
                {
                  href: "/shop",
                  icon: Gift,
                  label: "상점",
                  color: "from-pink-500 to-rose-500",
                  desc: "보상 구매",
                },
                {
                  href: "/goals",
                  icon: Target,
                  label: "목표",
                  color: "from-emerald-500 to-teal-500",
                  desc: "달성하기",
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="group border border-white/50 bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div
                        className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg mb-3 group-hover:scale-110 transition-transform`}
                      >
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-800">{item.label}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 최근 활동 */}
            <Card className="border border-white/50 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">최근 활동</CardTitle>
                      <CardDescription>최근 5개의 포인트 변동 내역</CardDescription>
                    </div>
                  </div>
                  <Link href="/transactions">
                    <Button variant="ghost" size="sm" className="gap-1 text-purple-600 hover:text-purple-700">
                      전체 보기
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx, index) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-shadow"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${
                              tx.amount > 0
                                ? "bg-green-100 text-green-600"
                                : "bg-rose-100 text-rose-600"
                            }`}
                          >
                            {tx.amount > 0 ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingDown className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {tx.note || tx.rule_name || "포인트 변동"}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {tx.rule_category && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  {tx.rule_category}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(tx.created_at).toLocaleDateString("ko-KR", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div
                              className={`text-xl font-bold ${
                                tx.amount > 0 ? "text-green-600" : "text-rose-600"
                              }`}
                            >
                              {tx.amount > 0 ? "+" : ""}
                              {tx.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString("ko-KR")}
                            </div>
                          </div>
                          {userRole === "admin" && !tx.note?.startsWith("취소:") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8"
                              onClick={() => handleCancel(tx.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <Activity className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      아직 활동 내역이 없습니다
                    </p>
                    <p className="text-sm text-muted-foreground">좋은 행동으로 포인트를 모아보세요!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 하단 배너 */}
            <Card className="mt-6 border-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Flame className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">포켓몬GO 퀴즈에 도전해보세요!</p>
                      <p className="text-white/80 text-sm">퀴즈를 풀고 게임 이용권을 얻어요</p>
                    </div>
                  </div>
                  <Link href="/pokemon-quiz">
                    <Button className="bg-white text-orange-600 hover:bg-white/90 font-bold shadow-lg">
                      도전하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
