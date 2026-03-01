import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowLeft,
  Coins,
  Target,
  Plus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface SavingGoal {
  id: number;
  title: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  status: string;
  created_at: string;
  achieved_at: string | null;
}

export default function GoalSaving() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [achievedGoals, setAchievedGoals] = useState<SavingGoal[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  // 새 목표
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎯");
  const [newTarget, setNewTarget] = useState("");

  const EMOJI_OPTIONS = ["🎮", "🎯", "🎁", "🍕", "🎬", "🏀", "🎨", "📚", "🎵", "🌟"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();
      setWalletBalance(profileData?.current_points || 0);

      const { data: activeGoals } = await supabase
        .from("saving_goals")
        .select("*")
        .eq("juwoo_id", 1)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      setGoals(activeGoals || []);

      const { data: doneGoals } = await supabase
        .from("saving_goals")
        .select("*")
        .eq("juwoo_id", 1)
        .eq("status", "achieved")
        .order("achieved_at", { ascending: false })
        .limit(10);

      setAchievedGoals(doneGoals || []);
    } catch (error: any) {
      console.error("Error fetching goals:", error);
      toast.error("목표 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  const handleCreateGoal = async () => {
    if (!newTitle.trim()) {
      toast.error("목표 이름을 입력해주세요!");
      return;
    }
    const target = parseInt(newTarget);
    if (!target || target < 10) {
      toast.error("최소 10코인 이상 목표를 설정해주세요!");
      return;
    }

    setProcessing(true);
    try {
      await supabase.from("saving_goals").insert({
        juwoo_id: 1,
        title: newTitle,
        emoji: newEmoji,
        target_amount: target,
        current_amount: 0,
        status: "active",
      });

      toast.success("새 목표를 만들었어요!", {
        description: `${newEmoji} ${newTitle} - ${target}코인`,
      });

      setShowNewGoalModal(false);
      setNewTitle("");
      setNewEmoji("🎯");
      setNewTarget("");
      fetchData();
    } catch (error: any) {
      console.error("Error creating goal:", error);
      toast.error("목표 생성에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 1 || !selectedGoal) {
      toast.error("금액을 입력해주세요!");
      return;
    }
    if (amount > walletBalance) {
      toast.error("지갑에 코인이 부족해요!");
      return;
    }

    setProcessing(true);
    try {
      const newGoalAmount = selectedGoal.current_amount + amount;
      const isAchieved = newGoalAmount >= selectedGoal.target_amount;

      // 목표 업데이트
      const updateData: any = { current_amount: newGoalAmount };
      if (isAchieved) {
        updateData.status = "achieved";
        updateData.achieved_at = new Date().toISOString();
      }

      await supabase
        .from("saving_goals")
        .update(updateData)
        .eq("id", selectedGoal.id);

      // 입금 기록
      await supabase.from("goal_deposits").insert({
        goal_id: selectedGoal.id,
        amount,
      });

      // 지갑 차감
      const newBalance = walletBalance - amount;
      await supabase
        .from("juwoo_profile")
        .update({ current_points: newBalance })
        .eq("id", 1);

      // 거래 내역
      await supabase.from("point_transactions").insert({
        juwoo_id: 1,
        rule_id: null,
        amount: -amount,
        balance_after: newBalance,
        note: `🎯 목표 저축: ${selectedGoal.emoji} ${selectedGoal.title} (${amount}코인)`,
        created_by: 1,
      });

      if (isAchieved) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
        });
        toast.success("🎉 목표 달성!", {
          description: `${selectedGoal.emoji} ${selectedGoal.title}을(를) 모두 모았어요!`,
        });
      } else {
        toast.success(`${amount}코인을 넣었어요!`);
      }

      setShowDepositModal(false);
      setDepositAmount("");
      setSelectedGoal(null);
      fetchData();
    } catch (error: any) {
      console.error("Error depositing:", error);
      toast.error("입금에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-3xl w-fit mb-4 shadow-lg">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">로그인이 필요해요</h2>
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-lg rounded-2xl">
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
          <div className="w-20 h-20 border-4 border-red-200 rounded-full animate-spin border-t-red-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="h-8 w-8 text-red-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">목표를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-red-400/30 to-rose-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-16 w-48 h-48 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <Link href="/wallet">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              🎯 목표 모으기
            </h1>
          </div>
          <Button
            size="icon"
            className="rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg"
            onClick={() => setShowNewGoalModal(true)}
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* 진행 중 목표 */}
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const percent = Math.min(
                100,
                Math.round((goal.current_amount / goal.target_amount) * 100)
              );
              const remaining = goal.target_amount - goal.current_amount;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">{goal.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-black text-slate-800 text-lg">{goal.title}</h3>
                          <p className="text-sm text-slate-500">
                            목표: {goal.target_amount.toLocaleString()} 코인
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600 font-medium">
                            현재: {goal.current_amount.toLocaleString()} 코인
                          </span>
                          <span className="font-bold text-red-600">{percent}%</span>
                        </div>
                        <Progress value={percent} className="h-3" />
                      </div>

                      {percent >= 90 && percent < 100 && (
                        <p className="text-xs text-amber-600 font-medium mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          거의 다 모았어! 조금만 더!
                        </p>
                      )}

                      <p className="text-xs text-slate-500 mb-3">
                        남은 금액: {remaining.toLocaleString()} 코인
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-2 border-red-200 text-red-700 hover:bg-red-50 font-bold"
                          onClick={() => {
                            setSelectedGoal(goal);
                            setDepositAmount("10");
                            setShowDepositModal(true);
                          }}
                        >
                          10코인 넣기
                        </Button>
                        <Button
                          className="h-10 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold"
                          onClick={() => {
                            setSelectedGoal(goal);
                            setDepositAmount("");
                            setShowDepositModal(true);
                          }}
                        >
                          더 넣기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="border-0 bg-white/90 rounded-2xl shadow-lg">
            <CardContent className="p-8 text-center">
              <span className="text-5xl block mb-3">🎯</span>
              <h3 className="font-black text-slate-800 text-lg mb-1">
                아직 목표가 없어요
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                갖고 싶은 것을 목표로 세우고 코인을 모아보세요!
              </p>
              <Button
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-2xl h-12 px-6"
                onClick={() => setShowNewGoalModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                첫 번째 목표 만들기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 달성 기록 */}
        {achievedGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
              <CardContent className="p-4">
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  🏆 달성한 목표
                </h3>
                <div className="space-y-2">
                  {achievedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-amber-50"
                    >
                      <div className="flex items-center gap-2">
                        <span>{goal.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {goal.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {goal.achieved_at
                              ? new Date(goal.achieved_at).toLocaleDateString("ko-KR", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}{" "}
                            달성
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-amber-600 text-sm">
                        {goal.target_amount.toLocaleString()}코인 ✅
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* 새 목표 모달 */}
      <AnimatePresence>
        {showNewGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNewGoalModal(false)}
            />
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl"
            >
              <h2 className="text-xl font-black text-slate-800 mb-4">새 목표 만들기</h2>

              <div className="mb-4">
                <label className="text-sm text-slate-500 mb-2 block">이모지 선택</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        newEmoji === emoji
                          ? "bg-red-100 ring-2 ring-red-500 scale-110"
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                      onClick={() => setNewEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-slate-500 mb-1 block">목표 이름</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 닌텐도 게임 시간 1시간"
                  className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-base font-medium focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm text-slate-500 mb-1 block">목표 코인</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="100"
                    className="flex-1 h-12 px-4 border-2 border-slate-200 rounded-xl text-lg font-bold focus:border-red-500 focus:outline-none"
                    min={10}
                  />
                  <span className="text-slate-500 font-medium">코인</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl"
                  onClick={() => setShowNewGoalModal(false)}
                >
                  취소
                </Button>
                <Button
                  className="h-12 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl"
                  onClick={handleCreateGoal}
                  disabled={processing}
                >
                  {processing ? "만드는 중..." : "만들기!"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 입금 모달 */}
      <AnimatePresence>
        {showDepositModal && selectedGoal && (
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
              <h2 className="text-xl font-black text-slate-800 mb-1">
                {selectedGoal.emoji} {selectedGoal.title}
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                내 지갑: <strong>{walletBalance.toLocaleString()}</strong> 코인 | 남은 목표:{" "}
                <strong>
                  {(selectedGoal.target_amount - selectedGoal.current_amount).toLocaleString()}
                </strong>{" "}
                코인
              </p>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[10, 20, 50].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    className="h-12 font-bold rounded-xl border-2 border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => setDepositAmount(String(amt))}
                    disabled={amt > walletBalance}
                  >
                    {amt}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="h-12 font-bold rounded-xl border-2 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => {
                    const remaining = selectedGoal.target_amount - selectedGoal.current_amount;
                    setDepositAmount(String(Math.min(remaining, walletBalance)));
                  }}
                >
                  딱 맞게
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="직접 입력"
                  className="flex-1 h-12 px-4 border-2 border-slate-200 rounded-xl text-lg font-bold focus:border-red-500 focus:outline-none"
                  min={1}
                  max={walletBalance}
                />
                <span className="text-slate-500 font-medium">코인</span>
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
                  className="h-12 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl"
                  onClick={handleDeposit}
                  disabled={processing}
                >
                  {processing ? "넣는 중..." : "넣기!"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
