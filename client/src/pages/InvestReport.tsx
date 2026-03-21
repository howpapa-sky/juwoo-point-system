import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Landmark,
  Sprout,
  ShoppingBag,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SAVINGS_INTEREST_RATE, MAX_MULTIPLIER } from "@/lib/investmentConstants";

interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  earned: number;
  spent: number;
  savedToVault: number;
  investedToSeed: number;
  interestEarned: number;
  harvestReturned: number;
  spendPercent: number;
  savePercent: number;
  investPercent: number;
  counterfactualSavings: number;
  counterfactualInvestment: number;
}

export default function InvestReport() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        // 이번 주 범위 계산 (월요일~일요일)
        const now = new Date();
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const { data: txData } = await supabase
          .from("point_transactions")
          .select("amount, note, created_at")
          .gte("created_at", monday.toISOString())
          .lte("created_at", sunday.toISOString());

        const transactions = txData || [];

        // 분류
        let earned = 0;
        let spent = 0;
        let savedToVault = 0;
        let investedToSeed = 0;
        let interestEarned = 0;
        let harvestReturned = 0;

        for (const tx of transactions) {
          const note = tx.note || "";
          if (note.includes("이자")) {
            interestEarned += tx.amount;
          } else if (note.includes("수확")) {
            harvestReturned += tx.amount;
          } else if (note.includes("금고 입금")) {
            savedToVault += Math.abs(tx.amount);
          } else if (note.includes("금고 출금")) {
            // 출금은 별도 분류
          } else if (note.includes("씨앗 심기")) {
            investedToSeed += Math.abs(tx.amount);
          } else if (note.includes("목표 저축")) {
            savedToVault += Math.abs(tx.amount);
          } else if (tx.amount > 0) {
            earned += tx.amount;
          } else if (tx.amount < 0) {
            spent += Math.abs(tx.amount);
          }
        }

        const totalOutflow = spent + savedToVault + investedToSeed;
        const spendPercent = totalOutflow > 0 ? Math.round((spent / totalOutflow) * 100) : 0;
        const savePercent = totalOutflow > 0 ? Math.round((savedToVault / totalOutflow) * 100) : 0;
        const investPercent = totalOutflow > 0 ? Math.round((investedToSeed / totalOutflow) * 100) : 0;

        // 반사실적 사고: 소비한 코인의 기회비용
        const counterfactualSavings = Math.round(spent * SAVINGS_INTEREST_RATE);
        const counterfactualInvestment = Math.round(spent * (MAX_MULTIPLIER['sunflower'] - 1)); // 해바라기 기준

        setReport({
          weekStart: monday.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
          weekEnd: sunday.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
          earned,
          spent,
          savedToVault,
          investedToSeed,
          interestEarned,
          harvestReturned,
          spendPercent,
          savePercent,
          investPercent,
          counterfactualSavings,
          counterfactualInvestment,
        });
      } catch (error: any) {
        if (import.meta.env.DEV) console.error("Error fetching report:", error);
        toast.error("리포트 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isAuthenticated]);

  const getAdvice = () => {
    if (!report) return "";
    if (report.earned === 0) return "이번 주에 포인트를 모아보세요!";
    if (report.savePercent > 40) return "금고에 잘 모으고 있어! 다음 주에 이자 더 많이 받을 거야!";
    if (report.investPercent > 40)
      return "씨앗밭에 많이 심었네! 수확이 기대돼요!";
    if (report.spendPercent > 70)
      return "이번 주는 많이 썼네! 다음 주엔 금고에도 넣어볼까?";
    return "잘하고 있어! 쓰기, 모으기, 심기를 골고루 해보자!";
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-slate-500 to-gray-600 rounded-3xl w-fit mb-4 shadow-lg">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">로그인이 필요해요</h2>
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-slate-600 to-gray-700 text-white font-bold text-lg rounded-2xl">
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
          <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin border-t-slate-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-slate-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">리포트를 만드는 중...</p>
      </div>
    );
  }

  if (!report) return null;

  const barColors = [
    { label: "쓰기", percent: report.spendPercent, color: "bg-orange-400", icon: "🛒" },
    { label: "금고", percent: report.savePercent, color: "bg-blue-400", icon: "🏦" },
    { label: "씨앗", percent: report.investPercent, color: "bg-emerald-400", icon: "🌱" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <Link href="/wallet">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              📊 이번 주 돈 이야기
            </h1>
            <p className="text-sm text-slate-500">
              {report.weekStart} ~ {report.weekEnd}
            </p>
          </div>
        </div>

        {/* 번 코인 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white overflow-hidden shadow-2xl shadow-violet-500/30 rounded-3xl">
            <CardContent className="p-5 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="relative">
                <p className="text-white/70 text-sm font-medium mb-1">이번 주 번 코인</p>
                <p className="text-4xl font-black tracking-tight">
                  {report.earned.toLocaleString()}
                  <span className="text-lg ml-1">코인</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 어디에 썼을까? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-5">
              <h3 className="font-bold text-slate-700 mb-4">어디에 썼을까?</h3>

              {report.spent + report.savedToVault + report.investedToSeed > 0 ? (
                <>
                  {/* 비율 바 */}
                  <div className="flex h-8 rounded-xl overflow-hidden mb-4">
                    {barColors.map(
                      (bar) =>
                        bar.percent > 0 && (
                          <div
                            key={bar.label}
                            className={`${bar.color} flex items-center justify-center text-white text-sm font-bold transition-all`}
                            style={{ width: `${bar.percent}%` }}
                          >
                            {bar.percent}%
                          </div>
                        )
                    )}
                  </div>

                  {/* 상세 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-slate-700">
                          🛒 쓰기
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-orange-600">
                          {report.spent.toLocaleString()}코인
                        </span>
                        <span className="text-sm text-slate-500 ml-1">({report.spendPercent}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-700">
                          🏦 금고
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-600">
                          {report.savedToVault.toLocaleString()}코인
                        </span>
                        <span className="text-sm text-slate-500 ml-1">({report.savePercent}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
                      <div className="flex items-center gap-2">
                        <Sprout className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-700">
                          🌱 씨앗
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600">
                          {report.investedToSeed.toLocaleString()}코인
                        </span>
                        <span className="text-sm text-slate-500 ml-1">({report.investPercent}%)</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm">이번 주에는 아직 사용 기록이 없어요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 수입 상세 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-5">
              <h3 className="font-bold text-slate-700 mb-3">추가 수입</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Landmark className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-sm text-slate-500">금고 이자</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">
                    +{report.interestEarned.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-slate-500">씨앗 수확</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">
                    +{report.harvestReturned.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 한마디 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
            <CardContent className="p-5">
              <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                💡 이번 주 한마디
              </h3>
              <p className="text-sm text-slate-600">{getAdvice()}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 반사실적 사고: 만약에... */}
        {report.spent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl">
              <CardContent className="p-5">
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-violet-500" />
                  🔍 만약에...
                </h3>
                <p className="text-sm text-slate-500 mb-3">
                  이번 주 쓴 {report.spent.toLocaleString()}코인으로 다른 걸 했다면?
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <span className="text-lg">🏦</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">금고에 넣었다면</p>
                      <p className="text-sm text-blue-600 font-bold">
                        매주 이자 +{report.counterfactualSavings}코인씩!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <span className="text-lg">🌻</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">해바라기에 심었다면</p>
                      <p className="text-sm text-emerald-600 font-bold">
                        +{report.counterfactualInvestment}코인 돌아왔을 거예요!
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-3 text-center">
                  그것도 좋은 선택이야! 다음에는 어떻게 할까? 😊
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
