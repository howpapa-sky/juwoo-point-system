import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Sprout,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ============================================
// 씨앗 타입 정의
// ============================================
interface SeedType {
  type: "sunflower" | "tree" | "clover";
  icon: string;
  name: string;
  concept: string;
  description: string;
  resultRange: string;
  minGuarantee: string;
  color: string;
  gradient: string;
}

const SEED_TYPES: SeedType[] = [
  {
    type: "sunflower",
    icon: "🌻",
    name: "해바라기 씨앗",
    concept: "예금",
    description: "느리지만 확실해요",
    resultRange: "무조건 120%",
    minGuarantee: "120%",
    color: "text-yellow-600",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    type: "tree",
    icon: "🌳",
    name: "나무 씨앗",
    concept: "펀드",
    description: "보통은 잘 자라요",
    resultRange: "80~150%",
    minGuarantee: "80%",
    color: "text-green-600",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    type: "clover",
    icon: "🍀",
    name: "네잎클로버 씨앗",
    concept: "주식",
    description: "대박 아니면 쪽박!",
    resultRange: "20~250%",
    minGuarantee: "20%",
    color: "text-emerald-600",
    gradient: "from-emerald-400 to-teal-500",
  },
];

// 결과 분포 함수
function getResultMultiplier(seedType: string): number {
  const rand = Math.random() * 100;

  if (seedType === "sunflower") {
    return 1.2;
  }

  if (seedType === "tree") {
    // 80%: 15%, 90%: 15%, 100%: 15%, 110%: 20%, 120%: 15%, 130%: 10%, 150%: 10%
    if (rand < 15) return 0.8;
    if (rand < 30) return 0.9;
    if (rand < 45) return 1.0;
    if (rand < 65) return 1.1;
    if (rand < 80) return 1.2;
    if (rand < 90) return 1.3;
    return 1.5;
  }

  if (seedType === "clover") {
    // 20%: 10%, 50%: 10%, 80%: 15%, 100%: 15%, 150%: 20%, 200%: 15%, 250%: 15%
    if (rand < 10) return 0.2;
    if (rand < 20) return 0.5;
    if (rand < 35) return 0.8;
    if (rand < 50) return 1.0;
    if (rand < 70) return 1.5;
    if (rand < 85) return 2.0;
    return 2.5;
  }

  return 1.0;
}

interface Seed {
  id: number;
  seed_type: string;
  invested_amount: number;
  planted_date: string;
  harvest_date: string;
  status: string;
  result_multiplier: number | null;
  harvested_amount: number | null;
  diary_entry: string | null;
  diary_reflection: string | null;
}

// 투자 일기 선택지
const DIARY_OPTIONS = [
  "확실한 게 좋아서",
  "크게 벌고 싶어서",
  "한번 해보고 싶어서",
  "골고루 심어보고 싶어서",
];

export default function SeedFarm() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [, navigate] = useLocation();

  const [walletBalance, setWalletBalance] = useState(0);
  const [activeSeeds, setActiveSeeds] = useState<Seed[]>([]);
  const [harvestHistory, setHarvestHistory] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(true);

  // 플로우 상태
  const [step, setStep] = useState<"main" | "select" | "amount" | "diary" | "harvest">("main");
  const [selectedSeedType, setSelectedSeedType] = useState<SeedType | null>(null);
  const [plantAmount, setPlantAmount] = useState("");
  const [diaryEntry, setDiaryEntry] = useState("");
  const [customDiary, setCustomDiary] = useState("");
  const [processing, setProcessing] = useState(false);

  // 수확
  const [harvestingSeed, setHarvestingSeed] = useState<Seed | null>(null);
  const [harvestResult, setHarvestResult] = useState<{
    seed: Seed;
    multiplier: number;
    amount: number;
  } | null>(null);
  const [harvestReflection, setHarvestReflection] = useState("");
  const [showHarvestAnimation, setShowHarvestAnimation] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();
      setWalletBalance(profileData?.current_points || 0);

      // 자라는 중인 씨앗
      const { data: growingSeeds } = await supabase
        .from("seeds")
        .select("*")
        .eq("juwoo_id", 1)
        .in("status", ["growing", "ready"])
        .order("planted_date", { ascending: false });

      // 수확 가능한 씨앗 체크 (harvest_date가 지남)
      const now = new Date();
      const updatedSeeds = (growingSeeds || []).map((seed: Seed) => {
        if (seed.status === "growing" && new Date(seed.harvest_date) <= now) {
          return { ...seed, status: "ready" };
        }
        return seed;
      });

      // DB에서 ready 상태로 업데이트
      for (const seed of updatedSeeds) {
        if (
          seed.status === "ready" &&
          growingSeeds?.find((s: Seed) => s.id === seed.id)?.status === "growing"
        ) {
          await supabase.from("seeds").update({ status: "ready" }).eq("id", seed.id);
        }
      }

      setActiveSeeds(updatedSeeds);

      // 수확 완료 기록
      const { data: harvestedSeeds } = await supabase
        .from("seeds")
        .select("*")
        .eq("juwoo_id", 1)
        .eq("status", "harvested")
        .order("harvest_date", { ascending: false })
        .limit(20);

      setHarvestHistory(harvestedSeeds || []);
    } catch (error: any) {
      console.error("Error fetching seed farm:", error);
      toast.error("씨앗밭 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  // 씨앗 심기
  const handlePlant = async () => {
    const amount = parseInt(plantAmount);
    if (!selectedSeedType || !amount || amount < 10) {
      toast.error("최소 10코인부터 심을 수 있어요!");
      return;
    }
    if (amount > walletBalance) {
      toast.error("지갑에 코인이 부족해요!");
      return;
    }

    setProcessing(true);
    try {
      const now = new Date();
      const harvestDate = new Date(now);
      harvestDate.setDate(harvestDate.getDate() + 14);

      const diary = diaryEntry === "custom" ? customDiary : diaryEntry;

      // 씨앗 생성
      await supabase.from("seeds").insert({
        juwoo_id: 1,
        seed_type: selectedSeedType.type,
        invested_amount: amount,
        planted_date: now.toISOString(),
        harvest_date: harvestDate.toISOString(),
        status: "growing",
        diary_entry: diary || null,
      });

      // 지갑에서 차감
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
        note: `🌱 씨앗 심기: ${selectedSeedType.icon} ${selectedSeedType.name} ${amount}코인`,
        created_by: 1,
      });

      toast.success(`${selectedSeedType.icon} ${selectedSeedType.name}을 심었어요!`, {
        description: "2주 뒤에 수확할 수 있어요!",
      });

      setStep("main");
      setSelectedSeedType(null);
      setPlantAmount("");
      setDiaryEntry("");
      setCustomDiary("");
      fetchData();
    } catch (error: any) {
      console.error("Error planting seed:", error);
      toast.error("씨앗 심기에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  // 수확하기
  const handleHarvest = async (seed: Seed) => {
    setHarvestingSeed(seed);
    setShowHarvestAnimation(true);

    const multiplier = getResultMultiplier(seed.seed_type);
    const harvestedAmount = Math.max(1, Math.floor(seed.invested_amount * multiplier));

    // 두근두근 애니메이션 후 결과
    setTimeout(async () => {
      try {
        // DB 업데이트
        await supabase
          .from("seeds")
          .update({
            status: "harvested",
            result_multiplier: multiplier,
            harvested_amount: harvestedAmount,
          })
          .eq("id", seed.id);

        // 지갑에 추가
        const { data: profileData } = await supabase
          .from("juwoo_profile")
          .select("current_points")
          .eq("id", 1)
          .single();

        const currentBalance = profileData?.current_points || 0;
        const newBalance = currentBalance + harvestedAmount;

        await supabase
          .from("juwoo_profile")
          .update({ current_points: newBalance })
          .eq("id", 1);

        // 거래 내역
        const profit = harvestedAmount - seed.invested_amount;
        const profitText = profit >= 0 ? `+${profit}` : `${profit}`;
        await supabase.from("point_transactions").insert({
          juwoo_id: 1,
          rule_id: null,
          amount: harvestedAmount,
          balance_after: newBalance,
          note: `🌱 씨앗 수확: ${getSeedIcon(seed.seed_type)} ${harvestedAmount}코인 (${profitText})`,
          created_by: 1,
        });

        setHarvestResult({
          seed,
          multiplier,
          amount: harvestedAmount,
        });

        setShowHarvestAnimation(false);
        setStep("harvest");

        // 이익이면 축하 효과
        if (profit > 0) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (error: any) {
        console.error("Error harvesting:", error);
        toast.error("수확에 실패했습니다.");
        setShowHarvestAnimation(false);
      }
    }, 2000);
  };

  // 수확 후 소감 저장
  const handleSaveReflection = async (options?: { nextStep?: "main" | "select"; navigateTo?: string }) => {
    if (!harvestResult) return;
    try {
      if (harvestReflection) {
        await supabase
          .from("seeds")
          .update({ diary_reflection: harvestReflection })
          .eq("id", harvestResult.seed.id);
        toast.success("투자 일기를 저장했어요!");
      }
    } catch (error) {
      console.error("Error saving reflection:", error);
    }
    setHarvestResult(null);
    setHarvestReflection("");
    setHarvestingSeed(null);

    if (options?.navigateTo) {
      navigate(options.navigateTo);
    } else {
      setStep(options?.nextStep || "main");
      fetchData();
    }
  };

  const getSeedIcon = (type: string) => {
    return SEED_TYPES.find((s) => s.type === type)?.icon || "🌱";
  };

  const getSeedName = (type: string) => {
    return SEED_TYPES.find((s) => s.type === type)?.name || "씨앗";
  };

  const getGrowthProgress = (seed: Seed) => {
    const planted = new Date(seed.planted_date).getTime();
    const harvest = new Date(seed.harvest_date).getTime();
    const now = Date.now();
    if (now >= harvest) return 100;
    return Math.min(100, Math.round(((now - planted) / (harvest - planted)) * 100));
  };

  const getDaysLeft = (seed: Seed) => {
    const harvest = new Date(seed.harvest_date).getTime();
    const now = Date.now();
    const days = Math.ceil((harvest - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl w-fit mb-4 shadow-lg">
              <Sprout className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">로그인이 필요해요</h2>
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-2xl">
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
          <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sprout className="h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">씨앗밭을 준비하는 중...</p>
      </div>
    );
  }

  // ============================================
  // 수확 두근두근 애니메이션
  // ============================================
  if (showHarvestAnimation && harvestingSeed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          animate={{
            scale: [1, 1.2, 1, 1.2, 1],
            rotate: [0, 5, -5, 5, 0],
          }}
          transition={{ duration: 2, repeat: 0 }}
          className="text-8xl mb-8"
        >
          {getSeedIcon(harvestingSeed.seed_type)}
        </motion.div>
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-2xl font-black text-slate-700"
        >
          두근두근...
        </motion.p>
        <p className="text-slate-500 mt-2">수확 결과를 확인하고 있어요!</p>
      </div>
    );
  }

  // ============================================
  // 수확 결과 화면
  // ============================================
  if (step === "harvest" && harvestResult) {
    const profit = harvestResult.amount - harvestResult.seed.invested_amount;
    const isProfit = profit >= 0;

    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="px-4 pt-8 space-y-4 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-5xl mb-4">{isProfit ? "🎉" : "😊"}</p>
            <h1 className="text-2xl font-black text-slate-800 mb-2">
              {isProfit ? "수확 시간!" : "수확 시간"}
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              {getSeedIcon(harvestResult.seed.seed_type)} {getSeedName(harvestResult.seed.seed_type)}
              {isProfit ? "이 잘 자랐어요!" : " 결과"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`border-0 ${isProfit ? "bg-emerald-50" : "bg-slate-50"} rounded-2xl`}>
              <CardContent className="p-6 text-center">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">심은 코인</p>
                    <p className="text-2xl font-black text-slate-700">
                      {harvestResult.seed.invested_amount}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <ChevronRight className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">수확 코인</p>
                    <p
                      className={`text-2xl font-black ${isProfit ? "text-emerald-600" : "text-slate-600"}`}
                    >
                      {harvestResult.amount}
                    </p>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    isProfit
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isProfit ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-bold">
                    {isProfit ? `+${profit}코인!` : `${profit}코인`}
                  </span>
                </div>

                <p className="mt-4 text-slate-600">
                  {isProfit
                    ? profit > harvestResult.seed.invested_amount * 0.3
                      ? "와! 대박이에요! 엄청 잘 자랐어요!"
                      : "와! 잘 자랐어요!"
                    : "괜찮아! 투자는 이런 거야. 다음엔 더 잘할 수 있어!"}
                </p>

                {!isProfit && (
                  <p className="mt-2 text-sm text-slate-500">
                    💡 팁: 여러 종류 씨앗을 섞어서 심으면 더 안전해요!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 투자 일기 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
              <CardContent className="p-4">
                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                  📝 결과 보고 한마디
                </h3>
                {harvestResult.seed.diary_entry && (
                  <p className="text-sm text-slate-500 mb-2">
                    심을 때: "{harvestResult.seed.diary_entry}"
                  </p>
                )}
                <textarea
                  value={harvestReflection}
                  onChange={(e) => setHarvestReflection(e.target.value)}
                  placeholder="수확 결과를 보고 어떤 생각이 들었어?"
                  className="w-full h-20 p-3 border-2 border-slate-200 rounded-xl text-sm resize-none focus:border-emerald-500 focus:outline-none"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* 수확 후 행동 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-center text-slate-600 font-medium mb-3">
              수확한 코인으로 뭐 할까?
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 rounded-2xl border-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => handleSaveReflection({ navigateTo: "/shop" })}
              >
                <span className="text-lg">🛒</span>
                <span className="text-xs font-bold">쓰기</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 rounded-2xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => handleSaveReflection({ navigateTo: "/savings" })}
              >
                <span className="text-lg">🏦</span>
                <span className="text-xs font-bold">금고에 넣기</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 rounded-2xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleSaveReflection({ nextStep: "select" })}
              >
                <span className="text-lg">🌱</span>
                <span className="text-xs font-bold">다시 심기</span>
              </Button>
            </div>
          </motion.div>

          <Button
            variant="ghost"
            className="w-full rounded-2xl text-slate-500"
            onClick={() => handleSaveReflection()}
          >
            나중에 결정할래
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // 씨앗 선택 화면
  // ============================================
  if (step === "select") {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setStep("main")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-black text-slate-800">
              어떤 씨앗을 심을까? 🌱
            </h1>
          </div>

          <div className="space-y-3">
            {SEED_TYPES.map((seed, index) => (
              <motion.div
                key={seed.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl active:scale-[0.98]`}
                  onClick={() => {
                    setSelectedSeedType(seed);
                    setStep("amount");
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${seed.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <span className="text-3xl">{seed.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-slate-800 text-lg">{seed.name}</h3>
                        <p className="text-slate-500 text-sm mb-2">"{seed.description}"</p>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                            2주 후 결과
                          </span>
                          <span className={`px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold ${seed.color}`}>
                            {seed.resultRange}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // 금액 입력 + 일기 화면
  // ============================================
  if (step === "amount" && selectedSeedType) {
    const amount = parseInt(plantAmount) || 0;
    const bestCase =
      selectedSeedType.type === "sunflower"
        ? Math.floor(amount * 1.2)
        : selectedSeedType.type === "tree"
          ? Math.floor(amount * 1.5)
          : Math.floor(amount * 2.5);
    const worstCase =
      selectedSeedType.type === "sunflower"
        ? Math.floor(amount * 1.2)
        : selectedSeedType.type === "tree"
          ? Math.floor(amount * 0.8)
          : Math.floor(amount * 0.2);

    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setStep("select")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black text-slate-800">
              {selectedSeedType.icon} {selectedSeedType.name}에 얼마나 심을까?
            </h1>
          </div>

          <Card className="border-0 bg-white/90 rounded-2xl shadow-lg">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500 mb-3">
                내 지갑: <strong className="text-slate-800">{walletBalance.toLocaleString()}</strong>{" "}
                코인
              </p>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[10, 20, 30, 50].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    className="h-12 font-bold rounded-xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setPlantAmount(String(amt))}
                    disabled={amt > walletBalance}
                  >
                    {amt}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="number"
                  value={plantAmount}
                  onChange={(e) => setPlantAmount(e.target.value)}
                  placeholder="직접 입력"
                  className="flex-1 h-12 px-4 border-2 border-slate-200 rounded-xl text-lg font-bold focus:border-emerald-500 focus:outline-none"
                  min={10}
                  max={walletBalance}
                />
                <span className="text-slate-500 font-medium">코인</span>
              </div>

              {amount >= 10 && (
                <div className="p-3 bg-slate-50 rounded-xl mb-4">
                  <p className="text-sm text-slate-600 mb-1">
                    {selectedSeedType.type !== "sunflower" && (
                      <>
                        좋을 때: {plantAmount}코인 → <strong className="text-emerald-600">{bestCase}코인</strong>
                      </>
                    )}
                    {selectedSeedType.type === "sunflower" && (
                      <>
                        확정 결과: {plantAmount}코인 → <strong className="text-emerald-600">{bestCase}코인</strong>
                      </>
                    )}
                  </p>
                  {selectedSeedType.type !== "sunflower" && (
                    <p className="text-sm text-slate-500">
                      아쉬울 때: {plantAmount}코인 → <strong className="text-slate-500">{worstCase}코인</strong>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 투자 일기 */}
          <Card className="border-0 bg-white/90 rounded-2xl shadow-lg">
            <CardContent className="p-5">
              <h3 className="font-bold text-slate-700 mb-3">📝 왜 이 씨앗을 골랐어?</h3>
              <div className="space-y-2 mb-3">
                {DIARY_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    variant={diaryEntry === option ? "default" : "outline"}
                    className={`w-full justify-start h-10 rounded-xl text-sm ${
                      diaryEntry === option
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "border-slate-200"
                    }`}
                    onClick={() => setDiaryEntry(option)}
                  >
                    {option}
                  </Button>
                ))}
                <Button
                  variant={diaryEntry === "custom" ? "default" : "outline"}
                  className={`w-full justify-start h-10 rounded-xl text-sm ${
                    diaryEntry === "custom"
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "border-slate-200"
                  }`}
                  onClick={() => setDiaryEntry("custom")}
                >
                  직접 쓸래요
                </Button>
              </div>
              {diaryEntry === "custom" && (
                <input
                  type="text"
                  value={customDiary}
                  onChange={(e) => setCustomDiary(e.target.value)}
                  placeholder="이유를 써봐요"
                  className="w-full h-10 px-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none"
                />
              )}
            </CardContent>
          </Card>

          {/* 심기 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-14 rounded-2xl font-bold"
              onClick={() => {
                setStep("select");
                setPlantAmount("");
                setDiaryEntry("");
              }}
            >
              다시 생각해볼래
            </Button>
            <Button
              className="h-14 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-[0.98]"
              onClick={handlePlant}
              disabled={processing || !plantAmount || parseInt(plantAmount) < 10}
            >
              {processing ? "심는 중..." : "심기! 🌱"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // 메인 화면
  // ============================================
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-400/30 to-green-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-16 w-48 h-48 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 rounded-full blur-3xl" />
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
              🌱 주우의 씨앗밭
            </h1>
          </div>
        </div>

        {/* 자라는 중인 씨앗 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Sprout className="h-4 w-4 text-emerald-500" />
                지금 자라고 있는 씨앗
              </h3>

              {activeSeeds.length > 0 ? (
                <div className="space-y-3">
                  {activeSeeds.map((seed) => {
                    const progress = getGrowthProgress(seed);
                    const daysLeft = getDaysLeft(seed);
                    const isReady = seed.status === "ready" || daysLeft === 0;
                    const seedType = SEED_TYPES.find((s) => s.type === seed.seed_type);

                    return (
                      <div
                        key={seed.id}
                        className={`p-4 rounded-xl ${isReady ? "bg-emerald-50 border-2 border-emerald-200" : "bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getSeedIcon(seed.seed_type)}</span>
                            <span className="font-bold text-slate-800">
                              {getSeedName(seed.seed_type)}
                            </span>
                            <span className="text-sm text-slate-500">
                              ({seed.invested_amount}코인)
                            </span>
                          </div>
                          <span
                            className={`text-sm font-bold ${isReady ? "text-emerald-600" : "text-slate-500"}`}
                          >
                            {isReady ? "수확 가능!" : `D-${daysLeft}`}
                          </span>
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>{progress}% 자람</span>
                            <span>
                              예상 수확:{" "}
                              {seedType?.type === "sunflower"
                                ? `${Math.floor(seed.invested_amount * 1.2)}코인 확정`
                                : `${Math.floor(seed.invested_amount * (seedType?.type === "tree" ? 0.8 : 0.2))}~${Math.floor(seed.invested_amount * (seedType?.type === "tree" ? 1.5 : 2.5))}코인`}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2.5" />
                        </div>

                        {isReady && (
                          <Button
                            className="w-full h-10 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl mt-2 active:scale-[0.98]"
                            onClick={() => handleHarvest(seed)}
                          >
                            🌾 수확하기!
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-4xl block mb-2">🌿</span>
                  <p className="text-slate-500 text-sm">아직 심은 씨앗이 없어요</p>
                  <p className="text-slate-400 text-xs mt-1">아래에서 씨앗을 심어보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 새 씨앗 심기 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
            onClick={() => setStep("select")}
          >
            <Sprout className="h-5 w-5 mr-2" />
            새로운 씨앗 심기
          </Button>
        </motion.div>

        {/* 수확 기록 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                📖 수확 기록
              </h3>
              {harvestHistory.length > 0 ? (
                <div className="space-y-2">
                  {harvestHistory.map((seed) => {
                    const profit = (seed.harvested_amount || 0) - seed.invested_amount;
                    const isProfit = profit >= 0;
                    return (
                      <div
                        key={seed.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <span>{getSeedIcon(seed.seed_type)}</span>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              {getSeedName(seed.seed_type)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(seed.harvest_date).toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">
                            {seed.invested_amount}→{seed.harvested_amount}
                          </p>
                          <p
                            className={`text-sm font-bold ${isProfit ? "text-emerald-600" : "text-slate-500"}`}
                          >
                            {isProfit ? (
                              <span className="flex items-center gap-1">
                                (+{profit}) <Sparkles className="h-3 w-3" />
                              </span>
                            ) : (
                              <span>({profit}) 📉</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sprout className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">아직 수확 기록이 없어요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
