import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowLeft,
  Coins,
  Landmark,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  Calendar,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SavingsData {
  id: number;
  balance: number;
  interestRate: number;
  lastInterestDate: string | null;
}

interface InterestRecord {
  id: number;
  balance_before: number;
  interest_amount: number;
  balance_after: number;
  calculated_at: string;
}

export default function Savings() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [savings, setSavings] = useState<SavingsData | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [interestHistory, setInterestHistory] = useState<InterestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();
      setWalletBalance(profileData?.current_points || 0);

      let { data: savingsData } = await supabase
        .from("savings_account")
        .select("*")
        .eq("juwoo_id", 1)
        .single();

      if (!savingsData) {
        const { data: newSavings } = await supabase
          .from("savings_account")
          .insert({ juwoo_id: 1, balance: 0, interest_rate: 0.03 })
          .select()
          .single();
        savingsData = newSavings;
      }

      if (savingsData) {
        setSavings({
          id: savingsData.id,
          balance: savingsData.balance,
          interestRate: Number(savingsData.interest_rate),
          lastInterestDate: savingsData.last_interest_date,
        });

        const { data: historyData } = await supabase
          .from("interest_history")
          .select("*")
          .eq("savings_id", savingsData.id)
          .order("calculated_at", { ascending: false })
          .limit(10);

        setInterestHistory(historyData || []);
      }
    } catch (error: any) {
      console.error("Error fetching savings:", error);
      toast.error("금고 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  const getNextSunday = () => {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSunday = day === 0 ? 7 : 7 - day;
    const next = new Date(now);
    next.setDate(now.getDate() + daysUntilSunday);
    return next.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 5) {
      toast.error("최소 5코인부터 입금할 수 있어요!");
      return;
    }
    if (amount > walletBalance) {
      toast.error("지갑에 코인이 부족해요!");
      return;
    }
    if (!savings) return;

    setProcessing(true);
    try {
      const newWalletBalance = walletBalance - amount;
      const newSavingsBalance = savings.balance + amount;

      // 지갑에서 차감
      await supabase
        .from("juwoo_profile")
        .update({ current_points: newWalletBalance })
        .eq("id", 1);

      // 금고에 추가
      await supabase
        .from("savings_account")
        .update({ balance: newSavingsBalance })
        .eq("id", savings.id);

      // 거래 내역 기록
      await supabase.from("point_transactions").insert({
        juwoo_id: 1,
        rule_id: null,
        amount: -amount,
        balance_after: newWalletBalance,
        note: `🏦 금고 입금 ${amount}코인`,
        created_by: 1,
      });

      toast.success(`금고에 ${amount}코인을 넣었어요!`, {
        description: "매주 일요일에 이자가 붙어요!",
      });

      setShowDepositModal(false);
      setDepositAmount("");
      fetchData();
    } catch (error: any) {
      console.error("Error depositing:", error);
      toast.error("입금에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 1) {
      toast.error("출금할 금액을 입력해주세요!");
      return;
    }
    if (!savings || amount > savings.balance) {
      toast.error("금고에 코인이 부족해요!");
      return;
    }

    setProcessing(true);
    try {
      const newWalletBalance = walletBalance + amount;
      const newSavingsBalance = savings.balance - amount;

      // 지갑에 추가
      await supabase
        .from("juwoo_profile")
        .update({ current_points: newWalletBalance })
        .eq("id", 1);

      // 금고에서 차감
      await supabase
        .from("savings_account")
        .update({ balance: newSavingsBalance })
        .eq("id", savings.id);

      // 거래 내역 기록
      await supabase.from("point_transactions").insert({
        juwoo_id: 1,
        rule_id: null,
        amount: amount,
        balance_after: newWalletBalance,
        note: `🏦 금고 출금 ${amount}코인`,
        created_by: 1,
      });

      toast.success(`금고에서 ${amount}코인을 꺼냈어요!`);

      setShowWithdrawModal(false);
      setWithdrawAmount("");
      fetchData();
    } catch (error: any) {
      console.error("Error withdrawing:", error);
      toast.error("출금에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl w-fit mb-4 shadow-lg">
              <Landmark className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">로그인이 필요해요</h2>
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl">
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
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Landmark className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">금고를 여는 중...</p>
      </div>
    );
  }

  const estimatedInterest = savings ? Math.floor(savings.balance * savings.interestRate) : 0;
  const lastInterest = interestHistory.length > 0 ? interestHistory[0] : null;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-16 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
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
              🏦 주우의 금고
            </h1>
          </div>
        </div>

        {/* 금고 잔액 카드 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white overflow-hidden shadow-2xl shadow-blue-500/30 rounded-3xl">
            <CardContent className="p-5 relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />

              <div className="relative">
                <p className="text-white/70 text-sm font-medium mb-1">금고 잔액</p>
                <div className="flex items-end gap-2 mb-4">
                  <p className="text-4xl font-black tracking-tight">
                    {savings?.balance.toLocaleString() || 0}
                    <span className="text-lg ml-1">코인</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                      <span className="text-white/70 text-xs">지난 이자</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-300">
                      +{lastInterest?.interest_amount || 0}코인
                    </p>
                  </div>
                  <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-300" />
                      <span className="text-white/70 text-xs">다음 이자일</span>
                    </div>
                    <p className="text-sm font-bold text-amber-300">{getNextSunday()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 예상 이자 안내 */}
        {savings && savings.balance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 bg-blue-50 rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  다음 일요일에 약 <strong>{estimatedInterest}코인</strong> 이자를 받을 수 있어요!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 시간여행 — 복리 시뮬레이션 */}
        {savings && savings.balance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
              <CardContent className="p-4">
                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                  🔮 시간여행: 금고에 계속 넣어두면?
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "1주 뒤", weeks: 1, icon: "🌱" },
                    { label: "2주 뒤", weeks: 2, icon: "🌿" },
                    { label: "1달 뒤", weeks: 4, icon: "🌳" },
                    { label: "2달 뒤", weeks: 8, icon: "🌳🌳" },
                  ].map(({ label, weeks, icon }) => {
                    const futureBalance = Math.floor(
                      savings.balance * Math.pow(1 + savings.interestRate, weeks)
                    );
                    const gain = futureBalance - savings.balance;
                    return (
                      <div key={weeks} className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                        <span className="text-sm text-slate-600 flex items-center gap-2">
                          <span>{icon}</span> {label}
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                          {futureBalance.toLocaleString()}코인 <span className="text-indigo-400 font-normal">(+{gain.toLocaleString()})</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  오래 두면 이자가 이자를 낳아요! 이게 복리예요 🪄
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 입금 / 출금 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            className="h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
            onClick={() => setShowDepositModal(true)}
          >
            <ArrowDownToLine className="h-5 w-5 mr-2" />
            입금하기
          </Button>
          <Button
            variant="outline"
            className="h-14 font-bold text-lg rounded-2xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 active:scale-[0.98] transition-all"
            onClick={() => setShowWithdrawModal(true)}
            disabled={!savings || savings.balance === 0}
          >
            <ArrowUpFromLine className="h-5 w-5 mr-2" />
            출금하기
          </Button>
        </motion.div>

        {/* 이자 기록 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                📅 이자 기록
              </h3>
              {interestHistory.length > 0 ? (
                <div className="space-y-2">
                  {interestHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-blue-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {new Date(record.calculated_at).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {record.balance_before}코인 → {record.balance_after}코인
                        </p>
                      </div>
                      <span className="font-bold text-emerald-600 text-lg">
                        +{record.interest_amount}코인
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Landmark className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">아직 이자 기록이 없어요</p>
                  <p className="text-slate-400 text-xs mt-1">
                    금고에 코인을 넣으면 매주 일요일에 이자가 붙어요!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
            <CardContent className="p-4">
              <p className="text-sm text-blue-700 font-medium">
                💡 금고에 오래 넣어둘수록 이자가 더 많이 붙어요!
              </p>
              <p className="text-xs text-blue-500 mt-1">
                매주 일요일에 금고 잔액의 3%가 이자로 들어옵니다.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 입금 모달 */}
      <AnimatePresence>
        {showDepositModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDepositModal(false)}
            />
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl"
            >
              <h2 className="text-xl font-black text-slate-800 mb-1">금고에 얼마나 넣을까?</h2>
              <p className="text-sm text-slate-500 mb-4">
                내 지갑: <strong>{walletBalance.toLocaleString()}</strong> 코인
              </p>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[10, 20, 50].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    className="h-12 font-bold rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => setDepositAmount(String(amt))}
                    disabled={amt > walletBalance}
                  >
                    {amt}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="h-12 font-bold rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => setDepositAmount(String(walletBalance))}
                  disabled={walletBalance < 5}
                >
                  전부
                </Button>
              </div>

              <div className="mb-4">
                <label className="text-sm text-slate-500 mb-1 block">직접 입력</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="금액 입력"
                    className="flex-1 h-12 px-4 border-2 border-slate-200 rounded-xl text-lg font-bold focus:border-blue-500 focus:outline-none"
                    min={5}
                    max={walletBalance}
                  />
                  <span className="text-slate-500 font-medium">코인</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl mb-4">
                <p className="text-sm text-blue-700">
                  📈 넣으면 매주 일요일에 이자가 붙어요!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl"
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount("");
                  }}
                >
                  취소
                </Button>
                <Button
                  className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl"
                  onClick={handleDeposit}
                  disabled={processing}
                >
                  {processing ? "넣는 중..." : "넣기"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 출금 모달 */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowWithdrawModal(false)}
            />
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl"
            >
              <h2 className="text-xl font-black text-slate-800 mb-1">금고에서 얼마나 꺼낼까?</h2>
              <p className="text-sm text-slate-500 mb-4">
                금고 잔액: <strong>{savings?.balance.toLocaleString()}</strong> 코인
              </p>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[10, 20, 50].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    className="h-12 font-bold rounded-xl border-2 border-slate-200"
                    onClick={() => setWithdrawAmount(String(amt))}
                    disabled={!savings || amt > savings.balance}
                  >
                    {amt}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="h-12 font-bold rounded-xl border-2 border-slate-200"
                  onClick={() => setWithdrawAmount(String(savings?.balance || 0))}
                  disabled={!savings || savings.balance === 0}
                >
                  전부
                </Button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="금액 입력"
                    className="flex-1 h-12 px-4 border-2 border-slate-200 rounded-xl text-lg font-bold focus:border-blue-500 focus:outline-none"
                    min={1}
                    max={savings?.balance || 0}
                  />
                  <span className="text-slate-500 font-medium">코인</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount("");
                  }}
                >
                  취소
                </Button>
                <Button
                  className="h-12 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold rounded-xl"
                  onClick={handleWithdraw}
                  disabled={processing}
                >
                  {processing ? "꺼내는 중..." : "꺼내기"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
