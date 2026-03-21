import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Coins,
  ShoppingBag,
  Landmark,
  Sprout,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InvestTutorial, { shouldShowTutorial } from "@/components/invest/InvestTutorial";

interface WalletSummary {
  currentBalance: number;
  savingsBalance: number;
  investmentBalance: number;
  monthlyEarned: number;
  monthlySpent: number;
  monthlyInterest: number;
  monthlyInvestReturn: number;
}

export default function MyWallet() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [summary, setSummary] = useState<WalletSummary>({
    currentBalance: 0,
    savingsBalance: 0,
    investmentBalance: 0,
    monthlyEarned: 0,
    monthlySpent: 0,
    monthlyInterest: 0,
    monthlyInvestReturn: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDadView, setShowDadView] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (shouldShowTutorial()) {
      setShowTutorial(true);
    }

    const fetchWalletData = async () => {
      setLoading(true);
      try {
        // 지갑 잔액
        const { data: profileData } = await supabase
          .from("juwoo_profile")
          .select("current_points")
          .eq("id", 1)
          .single();

        // 금고 잔액
        const { data: savingsData } = await supabase
          .from("savings_account")
          .select("balance")
          .eq("juwoo_id", 1)
          .single();

        // 씨앗밭 현재 투자 중 총액
        const { data: seedsData } = await supabase
          .from("seeds")
          .select("invested_amount")
          .eq("juwoo_id", 1)
          .eq("status", "growing");

        const investmentBalance = (seedsData || []).reduce(
          (sum: number, s: any) => sum + s.invested_amount,
          0
        );

        // 이번 달 통계
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: monthlyTx } = await supabase
          .from("point_transactions")
          .select("amount, note")
          .gte("created_at", startOfMonth.toISOString());

        const monthlyEarned = (monthlyTx || [])
          .filter((t: any) => t.amount > 0 && !t.note?.includes("이자") && !t.note?.includes("수확"))
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const monthlySpent = Math.abs(
          (monthlyTx || [])
            .filter((t: any) => t.amount < 0 && !t.note?.includes("금고") && !t.note?.includes("씨앗"))
            .reduce((sum: number, t: any) => sum + t.amount, 0)
        );

        const monthlyInterest = (monthlyTx || [])
          .filter((t: any) => t.note?.includes("이자"))
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const monthlyInvestReturn = (monthlyTx || [])
          .filter((t: any) => t.note?.includes("수확"))
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        setSummary({
          currentBalance: profileData?.current_points || 0,
          savingsBalance: savingsData?.balance || 0,
          investmentBalance,
          monthlyEarned,
          monthlySpent,
          monthlyInterest,
          monthlyInvestReturn,
        });
      } catch (error: any) {
        if (import.meta.env.DEV) console.error("Error fetching wallet data:", error);
        toast.error("데이터를 불러오지 못했어요. 다시 시도해볼까?");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl w-fit mb-4 shadow-lg">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">로그인이 필요해요</h2>
            <p className="text-slate-500 mb-4">지갑을 보려면 로그인해주세요</p>
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg rounded-2xl">
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-200 rounded-full animate-spin border-t-amber-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Coins className="h-8 w-8 text-amber-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">지갑을 열고 있어요...</p>
      </div>
    );
  }

  if (showTutorial) {
    return <InvestTutorial onClose={() => setShowTutorial(false)} />;
  }

  const totalAssets =
    summary.currentBalance + summary.savingsBalance + summary.investmentBalance;

  const choices = [
    {
      href: "/shop",
      icon: "🛒",
      title: "쓰기",
      subtitle: "상점에서 바로 사기",
      color: "from-orange-400 to-amber-500",
      shadow: "shadow-orange-500/25",
      bgLight: "bg-orange-50",
    },
    {
      href: "/savings",
      icon: "🏦",
      title: "모으기",
      subtitle: "금고에 넣으면 이자가 붙어요",
      color: "from-blue-400 to-indigo-500",
      shadow: "shadow-blue-500/25",
      bgLight: "bg-blue-50",
    },
    {
      href: "/seed-farm",
      icon: "🌱",
      title: "심기",
      subtitle: "씨앗밭에 심으면 자라서 열매가 열려요",
      color: "from-emerald-400 to-green-500",
      shadow: "shadow-emerald-500/25",
      bgLight: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-16 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🪙</span>
            <span className="text-slate-500 font-medium">주우의</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800">내 지갑</h1>
        </motion.div>

        {/* 메인 잔액 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white overflow-hidden shadow-2xl shadow-orange-500/30 rounded-3xl">
            <CardContent className="p-0">
              <div className="relative p-5">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                      <span className="text-sm font-bold">지갑 잔액</span>
                    </div>
                  </div>

                  <div className="flex items-end gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Coins className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-4xl font-black tracking-tight">
                        {summary.currentBalance.toLocaleString()}
                        <span className="text-lg ml-1">코인</span>
                      </p>
                    </div>
                  </div>

                  {/* 전체 자산 */}
                  <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">전체 자산 (지갑 + 금고 + 씨앗밭)</span>
                      <span className="font-bold text-lg">
                        {totalAssets.toLocaleString()} 코인
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3가지 선택지 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            코인으로 뭐 할까?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {choices.map((choice, index) => (
              <Link key={choice.href} href={choice.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card
                    className={`group border-0 bg-white/90 backdrop-blur-sm hover:bg-white hover:shadow-xl ${choice.shadow} hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl active:scale-[0.97]`}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${choice.color} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <span className="text-2xl">{choice.icon}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-1">
                        {choice.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {choice.subtitle}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* 자산 현황 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-blue-500" />
                내 자산 현황
              </h3>
              <div className="space-y-3">
                <Link href="/savings">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏦</span>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">금고</p>
                        <p className="text-xs text-slate-500">매주 이자 +3%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">
                        {summary.savingsBalance.toLocaleString()} 코인
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </Link>

                <Link href="/seed-farm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌱</span>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">씨앗밭</p>
                        <p className="text-xs text-slate-500">투자 중인 코인</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">
                        {summary.investmentBalance.toLocaleString()} 코인
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 이번 달 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                📊 이번 달 요약
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs text-slate-500">번 코인</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">
                    +{summary.monthlyEarned.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShoppingBag className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs text-slate-500">쓴 코인</span>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    -{summary.monthlySpent.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Landmark className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs text-slate-500">이자 수입</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">
                    +{summary.monthlyInterest.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs text-slate-500">투자 수익</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">
                    +{summary.monthlyInvestReturn.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 빠른 링크 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Link href="/goal-saving">
              <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer rounded-2xl active:scale-[0.98]">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">목표 모으기</p>
                    <p className="text-xs text-slate-500">목표를 세우고 모아요</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/invest-report">
              <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer rounded-2xl active:scale-[0.98]">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">투자 리포트</p>
                    <p className="text-xs text-slate-500">주간 돈 이야기</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* 아빠와 함께 투자 보기 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl font-bold border-2 border-violet-200 text-violet-700 hover:bg-violet-50 active:scale-[0.98] transition-all"
            onClick={() => setShowDadView(!showDadView)}
          >
            <span className="text-xl mr-2">👨‍👦</span>
            아빠와 함께 투자 보기
          </Button>
        </motion.div>

        {/* 아빠와 함께 보기 뷰 */}
        <AnimatePresence>
          {showDadView && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl shadow-lg">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    👨‍👦 아빠한테 설명해볼까?
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 bg-white/70 rounded-xl">
                      <p className="text-sm text-slate-500 mb-1">내 전체 자산</p>
                      <p className="text-2xl font-black text-slate-800">
                        {totalAssets.toLocaleString()} 코인
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-orange-50 rounded-lg text-center">
                        <p className="text-xs text-slate-500">지갑</p>
                        <p className="text-sm font-bold text-orange-600">
                          {summary.currentBalance.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg text-center">
                        <p className="text-xs text-slate-500">금고</p>
                        <p className="text-sm font-bold text-blue-600">
                          {summary.savingsBalance.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg text-center">
                        <p className="text-xs text-slate-500">씨앗밭</p>
                        <p className="text-sm font-bold text-emerald-600">
                          {summary.investmentBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-white/70 rounded-xl">
                      <p className="text-sm text-slate-600">
                        이번 달 번 코인: <strong className="text-emerald-600">+{summary.monthlyEarned.toLocaleString()}</strong>
                      </p>
                      <p className="text-sm text-slate-600">
                        이번 달 쓴 코인: <strong className="text-orange-600">-{summary.monthlySpent.toLocaleString()}</strong>
                      </p>
                      {summary.monthlyInterest > 0 && (
                        <p className="text-sm text-slate-600">
                          이자 수입: <strong className="text-blue-600">+{summary.monthlyInterest.toLocaleString()}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-violet-100 rounded-xl">
                    <p className="text-sm text-violet-700">
                      💡 주우가 아빠에게 자기 자산을 직접 설명해보는 건 어떨까요? (VCI 111 강점 활용)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
