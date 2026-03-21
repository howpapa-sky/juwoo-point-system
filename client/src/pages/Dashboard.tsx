import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Activity,
  X,
  Sparkles,
  Star,
  Gift,
  BookOpen,
  Gamepad2,
  ChevronRight,
  Flame,
  Clock,
  Zap,
  Crown,
  Medal,
  Trophy,
  Target,
  Wallet,
  Landmark,
  Sprout,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

// ============================================
// 레벨 시스템
// ============================================
interface LevelInfo {
  level: number;
  name: string;
  icon: string;
  minPoints: number;
  maxPoints: number;
  gradient: string;
  starCount: number;
}

const LEVELS: LevelInfo[] = [
  { level: 1, name: "새싹", icon: "🌱", minPoints: 0, maxPoints: 999, gradient: "from-green-400 to-emerald-500", starCount: 1 },
  { level: 2, name: "작은 별", icon: "⭐", minPoints: 1000, maxPoints: 2999, gradient: "from-yellow-400 to-amber-500", starCount: 1 },
  { level: 3, name: "용감한 탐험가", icon: "🧭", minPoints: 3000, maxPoints: 5999, gradient: "from-blue-400 to-cyan-500", starCount: 2 },
  { level: 4, name: "빛나는 기사", icon: "⚔️", minPoints: 6000, maxPoints: 9999, gradient: "from-purple-400 to-violet-500", starCount: 2 },
  { level: 5, name: "멋진 영웅", icon: "🦸", minPoints: 10000, maxPoints: 14999, gradient: "from-rose-400 to-pink-500", starCount: 3 },
  { level: 6, name: "전설의 마법사", icon: "🧙", minPoints: 15000, maxPoints: 19999, gradient: "from-indigo-400 to-blue-500", starCount: 3 },
  { level: 7, name: "슈퍼 챔피언", icon: "🏆", minPoints: 20000, maxPoints: 29999, gradient: "from-orange-400 to-amber-500", starCount: 4 },
  { level: 8, name: "드래곤 마스터", icon: "🐉", minPoints: 30000, maxPoints: 49999, gradient: "from-purple-500 to-violet-600", starCount: 4 },
  { level: 9, name: "우주 대장", icon: "🚀", minPoints: 50000, maxPoints: 99999, gradient: "from-cyan-400 to-blue-600", starCount: 5 },
  { level: 10, name: "전설의 왕", icon: "👑", minPoints: 100000, maxPoints: Infinity, gradient: "from-amber-400 to-yellow-500", starCount: 5 },
];

function getCurrentLevel(points: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

function getLevelProgress(points: number, level: LevelInfo): number {
  if (level.maxPoints === Infinity) return 100;
  const range = level.maxPoints - level.minPoints + 1;
  const progress = points - level.minPoints;
  return Math.min(Math.round((progress / range) * 100), 100);
}

function getNextLevel(currentLevel: LevelInfo): LevelInfo | null {
  const idx = LEVELS.findIndex(l => l.level === currentLevel.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

// ============================================

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
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [investmentBalance, setInvestmentBalance] = useState(0);
  const [readySeeds, setReadySeeds] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("juwoo_profile")
          .select("current_points")
          .eq("id", 1)
          .single();

        if (profileError) throw profileError;
        setBalance(profileData?.current_points || 0);

        // 금고 잔액
        const { data: savingsData } = await supabase
          .from("savings_account")
          .select("balance")
          .eq("juwoo_id", 1)
          .single();
        setSavingsBalance(savingsData?.balance || 0);

        // 씨앗밭 투자액
        const { data: seedsData } = await supabase
          .from("seeds")
          .select("invested_amount, status, harvest_date")
          .eq("juwoo_id", 1)
          .in("status", ["growing", "ready"]);

        const investTotal = (seedsData || []).reduce(
          (sum: number, s: any) => sum + s.invested_amount,
          0
        );
        setInvestmentBalance(investTotal);

        // 수확 가능한 씨앗 수
        const readyCount = (seedsData || []).filter(
          (s: any) => s.status === "ready" || new Date(s.harvest_date) <= new Date()
        ).length;
        setReadySeeds(readyCount);

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

        const { data: txData, error: txError } = await supabase
          .from("point_transactions")
          .select("id, amount, note, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (txError) throw txError;

        const txWithBalance = (txData || []).map((tx: any) => ({
          id: tx.id,
          amount: tx.amount,
          note: tx.note,
          created_at: tx.created_at,
          rule_name: null,
          rule_category: null,
        }));

        setTransactions(txWithBalance);
      } catch (error: any) {
        if (import.meta.env.DEV) console.error("Error fetching dashboard data:", error);
        toast.error("데이터를 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleCancel = async (transactionId: number) => {
    if (!confirm("정말로 이 거래를 취소하시겠습니까?")) return;

    try {
      const { data: txData, error: txError } = await supabase
        .from("point_transactions")
        .select("amount")
        .eq("id", transactionId)
        .single();

      if (txError) throw txError;

      const newBalance = balance - txData.amount;

      const { error: insertError } = await supabase
        .from("point_transactions")
        .insert({
          juwoo_id: 1,
          rule_id: null,
          amount: -txData.amount,
          balance_after: newBalance,
          note: `거래 취소 (ID: ${transactionId})`,
          created_by: 1,
        });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("juwoo_profile")
        .update({ current_points: newBalance })
        .eq("id", 1);

      if (updateError) throw updateError;

      toast.success("포인트가 취소되었습니다!");
      setBalance(newBalance);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error canceling transaction:", error);
      toast.error("취소가 잘 안 됐어요. 다시 해볼까?");
    }
  };

  // 로그인 필요 화면
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-4 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl w-fit mb-4 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-black">로그인이 필요해요</CardTitle>
            <CardDescription className="text-base">대시보드를 보려면 로그인해주세요</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Coins className="h-8 w-8 text-violet-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 레벨 계산
  const currentLevel = getCurrentLevel(balance);
  const levelProgress = getLevelProgress(balance, currentLevel);
  const nextLevel = getNextLevel(currentLevel);
  const pointsToNextLevel = nextLevel ? nextLevel.minPoints - balance : 0;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-violet-400/30 to-fuchsia-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-16 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* 환영 섹션 */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">👋</span>
            <span className="text-slate-500 font-medium">안녕하세요!</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800">
            {user?.user_metadata?.name || user?.email?.split("@")[0] || "주우"}님
          </h1>
        </div>

        {/* 메인 포인트 카드 */}
        <Card className="border-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white overflow-hidden shadow-2xl shadow-violet-500/30 rounded-3xl">
          <CardContent className="p-0">
            <div className="relative p-5">
              {/* 배경 장식 */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

              <div className="relative">
                {/* 상단: 레벨 배지 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                    <span className="text-lg">{currentLevel.icon}</span>
                    <span className="text-sm font-bold">Lv.{currentLevel.level} {currentLevel.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < currentLevel.starCount
                            ? "text-yellow-300 fill-yellow-300"
                            : "text-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* 포인트 표시 */}
                <div className="flex items-end gap-3 mb-5">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Coins className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-0.5">보유 포인트</p>
                    <p className="text-4xl font-black tracking-tight">{balance.toLocaleString()}<span className="text-lg ml-1">P</span></p>
                  </div>
                </div>

                {/* 주간 통계 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                      <span className="text-white/70 text-sm">이번 주 적립</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-300">+{stats.totalEarned.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingDown className="h-3.5 w-3.5 text-rose-300" />
                      <span className="text-white/70 text-sm">이번 주 사용</span>
                    </div>
                    <p className="text-xl font-bold text-rose-300">-{stats.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 레벨 진행 카드 */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentLevel.gradient} shadow-lg`}>
                <span className="text-2xl">{currentLevel.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">
                    Lv.{currentLevel.level} {currentLevel.name}
                  </h3>
                  {nextLevel && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      다음: {nextLevel.icon} {nextLevel.name}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
                    <span>{balance.toLocaleString()}P</span>
                    <span>{nextLevel ? nextLevel.minPoints.toLocaleString() + 'P' : 'MAX'}</span>
                  </div>
                  <Progress value={levelProgress} className="h-2.5" />
                </div>
                {nextLevel && (
                  <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>다음 레벨까지 <strong className="text-violet-600">{pointsToNextLevel.toLocaleString()}P</strong></span>
                  </p>
                )}
                {!nextLevel && (
                  <p className="text-sm font-bold text-amber-600 mt-1.5 flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    최고 레벨 달성!
                  </p>
                )}
              </div>
            </div>

            {/* 전체 레벨 미니맵 */}
            <div className="flex items-center gap-0.5 mt-1">
              {LEVELS.map((level) => (
                <div
                  key={level.level}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    balance >= level.minPoints
                      ? `bg-gradient-to-r ${level.gradient}`
                      : "bg-slate-200"
                  }`}
                  title={`Lv.${level.level} ${level.name} (${level.minPoints.toLocaleString()}P)`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 오늘의 미션 배너 */}
        <Card className="border-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white overflow-hidden shadow-lg shadow-orange-500/25 rounded-2xl">
          <CardContent className="p-4 relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <Link href="/pokemon-quiz">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">오늘의 미션</p>
                    <p className="text-white/90 text-sm">퀴즈 풀고 포인트 GET!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">+500P</span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* 내 자산 현황 카드 */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-slate-700 text-sm">내 자산 현황</h3>
              </div>
              <Link href="/wallet">
                <Button variant="ghost" size="sm" className="h-12 px-2 gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg text-base font-semibold">
                  지갑 열기
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/wallet">
                <div className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer text-center">
                  <Wallet className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-sm text-slate-500">지갑</p>
                  <p className="text-sm font-bold text-amber-600">{balance.toLocaleString()}</p>
                </div>
              </Link>
              <Link href="/savings">
                <div className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer text-center">
                  <Landmark className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm text-slate-500">금고</p>
                  <p className="text-sm font-bold text-blue-600">{savingsBalance.toLocaleString()}</p>
                </div>
              </Link>
              <Link href="/seed-farm">
                <div className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer text-center">
                  <Sprout className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                  <p className="text-sm text-slate-500">씨앗밭</p>
                  <p className="text-sm font-bold text-emerald-600">{investmentBalance.toLocaleString()}</p>
                </div>
              </Link>
            </div>
            <div className="mt-2 p-2 bg-slate-50 rounded-lg text-center">
              <p className="text-sm text-slate-500">
                전체 자산: <strong className="text-slate-700">{(balance + savingsBalance + investmentBalance).toLocaleString()}P</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 수확 가능 알림 */}
        {readySeeds > 0 && (
          <Link href="/seed-farm">
            <Card className="border-0 bg-gradient-to-r from-emerald-400 to-green-500 text-white overflow-hidden shadow-lg shadow-emerald-500/25 rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Sprout className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">씨앗이 다 자랐어요!</p>
                      <p className="text-white/90 text-sm">{readySeeds}개 수확 가능</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* 빠른 액션 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              href: "/wallet",
              icon: Wallet,
              label: "내 지갑",
              color: "from-amber-500 to-orange-500",
              shadow: "shadow-orange-500/20",
              desc: "쓰기/모으기/심기",
            },
            {
              href: "/english-learning",
              icon: BookOpen,
              label: "영어 학습",
              color: "from-blue-500 to-indigo-500",
              shadow: "shadow-blue-500/20",
              desc: "단어 배우기",
            },
            {
              href: "/shop",
              icon: Gift,
              label: "상점",
              color: "from-pink-500 to-rose-500",
              shadow: "shadow-pink-500/20",
              desc: "보상 구매",
            },
            {
              href: "/badges",
              icon: Trophy,
              label: "배지",
              color: "from-yellow-500 to-amber-500",
              shadow: "shadow-yellow-500/20",
              desc: "내 컬렉션",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className={`group border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-xl ${item.shadow} hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full rounded-2xl active:scale-[0.98]`}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 최근 활동 */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg shadow-violet-500/25">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">최근 활동</CardTitle>
                  <CardDescription className="text-sm">포인트 변동 내역</CardDescription>
                </div>
              </div>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="h-12 px-3 gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl text-base font-semibold">
                  전체
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          tx.amount > 0
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {tx.note || tx.rule_name || "포인트 변동"}
                        </p>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(tx.created_at).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          tx.amount > 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                      </span>
                      {userRole === "admin" && !tx.note?.startsWith("취소:") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-12 w-12 rounded-lg"
                          onClick={() => handleCancel(tx.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-3 bg-slate-100 rounded-full w-fit mx-auto mb-3">
                  <Zap className="h-6 w-6 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-600 mb-1">아직 활동이 없어요</p>
                <p className="text-sm text-slate-400">좋은 행동으로 포인트를 모아보세요!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
