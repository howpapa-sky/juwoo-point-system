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
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { adjustPoints } from "@/lib/pointsHelper";
import InvestTutorial, { shouldShowTutorial } from "@/components/invest/InvestTutorial";
import { FlyingCoin, MultiCoinBurst } from "@/components/invest/CoinAnimation";
import {
  GROWTH_DAYS,
  GROWTH_LABELS,
  MIN_GUARANTEE,
  MAX_MULTIPLIER,
  getTodayWeather,
  getWeatherBonus,
} from "@/lib/investmentConstants";

// ============================================
// 씨앗 타입 정의
// ============================================
interface SeedType {
  type: string;
  icon: string;
  name: string;
  concept: string;
  description: string;
  resultRange: string;
  minGuarantee: string;
  color: string;
  gradient: string;
  hidden?: boolean;
}

const BASE_SEED_TYPES: SeedType[] = [
  {
    type: "sunflower",
    icon: "🌻",
    name: "해바라기 씨앗",
    concept: "예금",
    description: "항상 웃는 친구. 믿음직해요!",
    resultRange: "무조건 110%",
    minGuarantee: "110%",
    color: "text-yellow-600",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    type: "tree",
    icon: "🌳",
    name: "나무 씨앗",
    concept: "펀드",
    description: "비바람도 이겨내는 든든한 친구",
    resultRange: "85~140%",
    minGuarantee: "85%",
    color: "text-green-600",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    type: "clover",
    icon: "🍀",
    name: "네잎클로버 씨앗",
    concept: "주식",
    description: "무지개 너머의 행운을 찾아요",
    resultRange: "30~250%",
    minGuarantee: "30%",
    color: "text-emerald-600",
    gradient: "from-emerald-400 to-teal-500",
  },
];

const HIDDEN_SEED_TYPES: SeedType[] = [
  {
    type: "rose",
    icon: "🌹",
    name: "장미 씨앗",
    concept: "안정성장",
    description: "아름다운 장미에는 가시가 있어요",
    resultRange: "100~180%",
    minGuarantee: "100%",
    color: "text-rose-600",
    gradient: "from-rose-400 to-pink-500",
    hidden: true,
  },
  {
    type: "bamboo",
    icon: "🎋",
    name: "대나무 씨앗",
    concept: "꾸준함",
    description: "대나무는 참을성 있게 자라요",
    resultRange: "105~125%",
    minGuarantee: "105%",
    color: "text-lime-600",
    gradient: "from-lime-400 to-green-500",
    hidden: true,
  },
  {
    type: "rainbow",
    icon: "🌈",
    name: "무지개 씨앗",
    concept: "올인",
    description: "모든 가능성이 담긴 특별한 씨앗",
    resultRange: "50~300%",
    minGuarantee: "50%",
    color: "text-violet-600",
    gradient: "from-violet-400 to-pink-500",
    hidden: true,
  },
];

// 기본 SEED_TYPES (숨겨진 씨앗 포함하여 조회용)
const ALL_SEED_TYPES: SeedType[] = [...BASE_SEED_TYPES, ...HIDDEN_SEED_TYPES];
const SEED_TYPES = ALL_SEED_TYPES;

// 결과 분포 함수 (수정된 확률 분포)
function getResultMultiplier(seedType: string): number {
  const rand = Math.random() * 100;

  if (seedType === "sunflower") {
    return 1.1; // 110% 확정
  }

  if (seedType === "tree") {
    // 85%:10%, 95%:10%, 100%:15%, 110%:25%, 120%:20%, 130%:10%, 140%:10%
    // 기대값 ~112%, 최소 85%
    if (rand < 10) return 0.85;
    if (rand < 20) return 0.95;
    if (rand < 35) return 1.0;
    if (rand < 60) return 1.1;
    if (rand < 80) return 1.2;
    if (rand < 90) return 1.3;
    return 1.4;
  }

  if (seedType === "clover") {
    // 30%:5%, 50%:8%, 80%:12%, 100%:15%, 150%:25%, 200%:20%, 250%:15%
    // 기대값 ~145%, 최소 30%
    if (rand < 5) return 0.3;
    if (rand < 13) return 0.5;
    if (rand < 25) return 0.8;
    if (rand < 40) return 1.0;
    if (rand < 65) return 1.5;
    if (rand < 85) return 2.0;
    return 2.5;
  }

  // 숨겨진 씨앗들
  if (seedType === "rose") {
    // 100%:20%, 120%:25%, 140%:25%, 160%:20%, 180%:10%
    if (rand < 20) return 1.0;
    if (rand < 45) return 1.2;
    if (rand < 70) return 1.4;
    if (rand < 90) return 1.6;
    return 1.8;
  }

  if (seedType === "bamboo") {
    // 105%:25%, 110%:30%, 115%:25%, 120%:15%, 125%:5%
    if (rand < 25) return 1.05;
    if (rand < 55) return 1.1;
    if (rand < 80) return 1.15;
    if (rand < 95) return 1.2;
    return 1.25;
  }

  if (seedType === "rainbow") {
    // 50%:10%, 80%:15%, 100%:15%, 150%:20%, 200%:20%, 250%:10%, 300%:10%
    if (rand < 10) return 0.5;
    if (rand < 25) return 0.8;
    if (rand < 40) return 1.0;
    if (rand < 60) return 1.5;
    if (rand < 80) return 2.0;
    if (rand < 90) return 2.5;
    return 3.0;
  }

  return 1.0;
}

// 성장 스토리 스니펫
function getGrowthStory(progress: number, daysLeft: number, isReady: boolean): string {
  if (isReady || daysLeft === 0) return "🌾 열매가 익었어요! 수확해볼까?";
  if (daysLeft === 1) return "내일 열매가 열려요! 두근두근 🥁";
  if (progress >= 80) return "🌸 꽃이 피기 시작했어요!";
  if (progress >= 50) return "🌿 잎이 무성해졌어요! 열매가 곧 열릴 거예요";
  if (progress >= 20) return "🌱 싹이 났어요! 잘 자라고 있어요";
  return "💤 아직 땅속에서 준비 중...";
}

// 수확 결과 스토리
function getHarvestStory(seedIcon: string, profit: number, invested: number): string {
  if (profit > invested * 0.3) return `${seedIcon} 황금 열매가 가득 열렸어요! +${profit}포인트 🍎`;
  if (profit > 0) return `${seedIcon} 열매가 잘 익었어요! +${profit}포인트`;
  if (profit === 0) return "심은 만큼 돌아왔어요. 다음엔 더 좋은 일이 있을 거야!";
  return "이번엔 열매가 적었어요. 하지만 나무는 더 단단해졌어요 💪";
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

// 외부 귀인 메시지 (손실 시) — HA1 예기불안 8점(평균 2.3배)인 주우에게
// 손실의 원인을 외부(날씨)로 돌리면 자기비난 감소 (Weiner 귀인 이론)
const LOSS_MESSAGES = [
  "날씨가 안 좋아서 적게 열렸어요 🌧️",
  "바람이 너무 세서 조금 힘들었어요 💨",
  "구름이 많아서 햇빛이 부족했어요 ⛅",
  "비가 많이 와서 물을 너무 많이 먹었어요 🌧️",
];

function getRandomLossMessage(): string {
  return LOSS_MESSAGES[Math.floor(Math.random() * LOSS_MESSAGES.length)];
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
  const [step, setStep] = useState<"main" | "select" | "amount" | "diary" | "harvest" | "bundle">("main");
  const [selectedSeedType, setSelectedSeedType] = useState<SeedType | null>(null);
  const [plantAmount, setPlantAmount] = useState("");
  const [diaryEntry, setDiaryEntry] = useState("");
  const [customDiary, setCustomDiary] = useState("");
  const [processing, setProcessing] = useState(false);

  // 숨겨진 씨앗 해금 상태
  const [unlockedHidden, setUnlockedHidden] = useState<Set<string>>(new Set());

  // 묶음 심기 상태
  const [bundleAllocations, setBundleAllocations] = useState<Record<string, number>>({});

  // 수확
  const [harvestingSeed, setHarvestingSeed] = useState<Seed | null>(null);
  const [harvestResult, setHarvestResult] = useState<{
    seed: Seed;
    multiplier: number;
    amount: number;
    weatherName?: string;
    weatherIcon?: string;
    weatherBonus?: number;
  } | null>(null);
  const [harvestReflection, setHarvestReflection] = useState("");
  const [showHarvestAnimation, setShowHarvestAnimation] = useState(false);

  // 자동 수확 결과 목록
  const [autoHarvestResults, setAutoHarvestResults] = useState<
    Array<{
      seed: Seed;
      harvestedAmount: number;
      profit: number;
      lossMessage?: string;
    }>
  >([]);
  const autoHarvestCheckedRef = useRef(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPlantAnimation, setShowPlantAnimation] = useState(false);
  const [showHarvestBurst, setShowHarvestBurst] = useState(false);

  // 수확 자동 체크
  const checkAutoHarvest = async () => {
    if (autoHarvestCheckedRef.current) return;
    autoHarvestCheckedRef.current = true;

    const { data: readySeeds, error: readyError } = await supabase
      .from("seeds")
      .select("*")
      .eq("juwoo_id", 1)
      .eq("status", "growing")
      .lte("harvest_date", new Date().toISOString());

    if (readyError) {
      if (import.meta.env.DEV) console.error('수확 대상 조회 실패:', readyError);
      return;
    }
    if (!readySeeds || readySeeds.length === 0) return;

    const results: typeof autoHarvestResults = [];

    for (const seed of readySeeds) {
      const weather = getTodayWeather();
      const baseMultiplier = getResultMultiplier(seed.seed_type);
      const weatherBonus = getWeatherBonus(seed.seed_type);
      const minGuarantee = MIN_GUARANTEE[seed.seed_type] ?? 0.1;
      const multiplier = Math.max(minGuarantee, baseMultiplier + weatherBonus);
      const harvestedAmount = Math.max(1, Math.floor(seed.invested_amount * multiplier));
      const profit = harvestedAmount - seed.invested_amount;

      // DB 업데이트
      const { error: updateError } = await supabase
        .from("seeds")
        .update({
          status: "harvested",
          result_multiplier: multiplier,
          harvested_amount: harvestedAmount,
        })
        .eq("id", seed.id);
      if (updateError) {
        if (import.meta.env.DEV) console.error('씨앗 수확 업데이트 실패:', updateError);
        continue;
      }

      // 포인트 적립 (adjustPoints 사용)
      const profitText = profit >= 0 ? `+${profit}` : `${profit}`;
      await adjustPoints({
        amount: harvestedAmount,
        note: `🌱 씨앗 수확: ${getSeedIcon(seed.seed_type)} ${harvestedAmount}포인트 (${profitText})`,
      });

      results.push({
        seed,
        harvestedAmount,
        profit,
        lossMessage: profit < 0 ? getRandomLossMessage() : undefined,
      });
    }

    if (results.length > 0) {
      setAutoHarvestResults(results);
      const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);
      if (totalProfit > 0) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();
      if (profileError) {
        if (import.meta.env.DEV) console.error('프로필 조회 실패:', profileError);
        toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        return;
      }
      setWalletBalance(profileData?.current_points ?? 0);

      // 자라는 중인 씨앗
      const { data: growingSeeds, error: growingError } = await supabase
        .from("seeds")
        .select("*")
        .eq("juwoo_id", 1)
        .in("status", ["growing", "ready"])
        .order("planted_date", { ascending: false });
      if (growingError) {
        if (import.meta.env.DEV) console.error('성장 중 씨앗 조회 실패:', growingError);
        toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        return;
      }

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
          const { error: readyUpdateError } = await supabase.from("seeds").update({ status: "ready" }).eq("id", seed.id);
          if (readyUpdateError) {
            if (import.meta.env.DEV) console.error('씨앗 상태 업데이트 실패:', readyUpdateError);
          }
        }
      }

      setActiveSeeds(updatedSeeds);

      // 수확 완료 기록
      const { data: harvestedSeeds, error: harvestedError } = await supabase
        .from("seeds")
        .select("*")
        .eq("juwoo_id", 1)
        .eq("status", "harvested")
        .order("harvest_date", { ascending: false })
        .limit(20);
      if (harvestedError) {
        if (import.meta.env.DEV) console.error('수확 기록 조회 실패:', harvestedError);
      }

      setHarvestHistory(harvestedSeeds ?? []);

      // 숨겨진 씨앗 해금 체크
      const allSeedsData = [...updatedSeeds, ...(harvestedSeeds ?? [])];
      const totalInvested = allSeedsData.reduce((sum, s) => sum + (s.invested_amount ?? 0), 0);
      const totalProfit = (harvestedSeeds ?? []).reduce(
        (sum: number, s: Seed) => sum + ((s.harvested_amount ?? 0) - s.invested_amount),
        0
      );

      // 동시 재배 3종 횟수 추정
      let simultaneousCount = 0;
      const sortedSeeds = allSeedsData.sort(
        (a, b) => new Date(a.planted_date).getTime() - new Date(b.planted_date).getTime()
      );
      for (const s of sortedSeeds) {
        const planted = new Date(s.planted_date);
        const harvest = new Date(s.harvest_date);
        const overlapping = sortedSeeds.filter((os) => {
          const op = new Date(os.planted_date);
          const oh = new Date(os.harvest_date);
          return op < harvest && oh > planted;
        });
        const uniqueTypes = new Set(overlapping.map((os) => os.seed_type));
        if (uniqueTypes.size >= 3) simultaneousCount++;
      }

      const unlocked = new Set<string>();
      if (totalInvested >= 500) unlocked.add("rose");
      if (simultaneousCount >= 5) unlocked.add("bamboo");
      if (totalProfit >= 100) unlocked.add("rainbow");
      setUnlockedHidden(unlocked);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error fetching seed farm:", error);
      toast.error("데이터를 불러오지 못했어요. 다시 시도해볼까?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (shouldShowTutorial()) {
      setShowTutorial(true);
    }
    const init = async () => {
      await checkAutoHarvest();
      await fetchData();
    };
    init();
  }, [isAuthenticated]);

  // 씨앗 심기
  const handlePlant = async () => {
    const amount = parseInt(plantAmount);
    if (!selectedSeedType || !amount || amount < 10) {
      toast.error("최소 10포인트부터 심을 수 있어요!");
      return;
    }
    if (amount > walletBalance) {
      toast.error("지갑에 포인트이 부족해요!");
      return;
    }

    setProcessing(true);
    try {
      const now = new Date();
      const harvestDate = new Date(now);
      const growthDays = GROWTH_DAYS[selectedSeedType.type] ?? 14;
      harvestDate.setDate(harvestDate.getDate() + growthDays);

      const diary = diaryEntry === "custom" ? customDiary : diaryEntry;

      // 씨앗 생성
      const { error: seedError } = await supabase.from("seeds").insert({
        juwoo_id: 1,
        seed_type: selectedSeedType.type,
        invested_amount: amount,
        planted_date: now.toISOString(),
        harvest_date: harvestDate.toISOString(),
        status: "growing",
        diary_entry: diary || null,
      });
      if (seedError) {
        if (import.meta.env.DEV) console.error('씨앗 생성 실패:', seedError);
        toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        return;
      }

      // 지갑에서 차감
      const newBalance = walletBalance - amount;
      const { error: walletError } = await supabase
        .from("juwoo_profile")
        .update({ current_points: newBalance })
        .eq("id", 1);
      if (walletError) {
        if (import.meta.env.DEV) console.error('지갑 차감 실패:', walletError);
        toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        return;
      }

      // 거래 내역
      const { error: txError } = await supabase.from("point_transactions").insert({
        juwoo_id: 1,
        rule_id: null,
        amount: -amount,
        balance_after: newBalance,
        note: `🌱 씨앗 심기: ${selectedSeedType.icon} ${selectedSeedType.name} ${amount}포인트`,
        created_by: 1,
      });
      if (txError) {
        if (import.meta.env.DEV) console.error('거래 내역 기록 실패:', txError);
      }

      // 포인트 이동 애니메이션
      setShowPlantAnimation(true);
      setTimeout(() => setShowPlantAnimation(false), 1000);

      toast.success(`${selectedSeedType.icon} ${selectedSeedType.name}을 심었어요!`, {
        description: `${growthDays}일 뒤에 수확할 수 있어요!`,
      });

      setStep("main");
      setSelectedSeedType(null);
      setPlantAmount("");
      setDiaryEntry("");
      setCustomDiary("");
      fetchData();
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error planting seed:", error);
      toast.error("잘 안 됐어요. 다시 해볼까?");
    } finally {
      setProcessing(false);
    }
  };

  // 수확하기
  const handleHarvest = async (seed: Seed) => {
    setHarvestingSeed(seed);
    setShowHarvestAnimation(true);

    const weather = getTodayWeather();
    const baseMultiplier = getResultMultiplier(seed.seed_type);
    const weatherBonus = getWeatherBonus(seed.seed_type);
    const minGuarantee = MIN_GUARANTEE[seed.seed_type] ?? 0.1;
    const multiplier = Math.max(minGuarantee, baseMultiplier + weatherBonus);
    const harvestedAmount = Math.max(1, Math.floor(seed.invested_amount * multiplier));

    // 두근두근 애니메이션 후 결과
    setTimeout(async () => {
      try {
        // DB 업데이트
        const { error: seedUpdateError } = await supabase
          .from("seeds")
          .update({
            status: "harvested",
            result_multiplier: multiplier,
            harvested_amount: harvestedAmount,
          })
          .eq("id", seed.id);
        if (seedUpdateError) {
          if (import.meta.env.DEV) console.error('씨앗 수확 업데이트 실패:', seedUpdateError);
          toast.error('잠깐, 문제가 생겼어! 다시 해보자');
          setShowHarvestAnimation(false);
          return;
        }

        // 지갑에 추가
        const { data: profileData, error: profileError } = await supabase
          .from("juwoo_profile")
          .select("current_points")
          .eq("id", 1)
          .single();
        if (profileError) {
          if (import.meta.env.DEV) console.error('프로필 조회 실패:', profileError);
          toast.error('잠깐, 문제가 생겼어! 다시 해보자');
          setShowHarvestAnimation(false);
          return;
        }

        const currentBalance = profileData?.current_points ?? 0;
        const newBalance = currentBalance + harvestedAmount;

        const { error: walletUpdateError } = await supabase
          .from("juwoo_profile")
          .update({ current_points: newBalance })
          .eq("id", 1);
        if (walletUpdateError) {
          if (import.meta.env.DEV) console.error('지갑 업데이트 실패:', walletUpdateError);
          toast.error('잠깐, 문제가 생겼어! 다시 해보자');
          setShowHarvestAnimation(false);
          return;
        }

        // 거래 내역
        const profit = harvestedAmount - seed.invested_amount;
        const profitText = profit >= 0 ? `+${profit}` : `${profit}`;
        const { error: txError } = await supabase.from("point_transactions").insert({
          juwoo_id: 1,
          rule_id: null,
          amount: harvestedAmount,
          balance_after: newBalance,
          note: `🌱 씨앗 수확: ${getSeedIcon(seed.seed_type)} ${harvestedAmount}포인트 (${profitText})`,
          created_by: 1,
        });
        if (txError) {
          if (import.meta.env.DEV) console.error('거래 내역 기록 실패:', txError);
        }

        setHarvestResult({
          seed,
          multiplier,
          amount: harvestedAmount,
          weatherName: weather.name,
          weatherIcon: weather.icon,
          weatherBonus: weatherBonus,
        });

        setShowHarvestAnimation(false);
        setStep("harvest");

        // 이익이면 축하 효과
        if (profit > 0) {
          setShowHarvestBurst(true);
          setTimeout(() => setShowHarvestBurst(false), 1500);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (error: any) {
        if (import.meta.env.DEV) console.error("Error harvesting:", error);
        toast.error("잘 안 됐어요. 다시 해볼까?");
        setShowHarvestAnimation(false);
      }
    }, 2000);
  };

  // 수확 후 소감 저장
  const handleSaveReflection = async (options?: { nextStep?: "main" | "select"; navigateTo?: string }) => {
    if (!harvestResult) return;
    try {
      if (harvestReflection) {
        const { error: reflectionError } = await supabase
          .from("seeds")
          .update({ diary_reflection: harvestReflection })
          .eq("id", harvestResult.seed.id);
        if (reflectionError) {
          if (import.meta.env.DEV) console.error('투자 일기 저장 실패:', reflectionError);
          toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        } else {
          toast.success("투자 일기를 저장했어요!");
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error saving reflection:", error);
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
  // 튜토리얼
  // ============================================
  if (showTutorial) {
    return <InvestTutorial onClose={() => setShowTutorial(false)} />;
  }

  // ============================================
  // 자동 수확 결과 화면
  // ============================================
  if (autoHarvestResults.length > 0) {
    const totalHarvested = autoHarvestResults.reduce((sum, r) => sum + r.harvestedAmount, 0);
    const totalProfit = autoHarvestResults.reduce((sum, r) => sum + r.profit, 0);
    const hasProfit = totalProfit >= 0;

    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="px-4 pt-8 space-y-4 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-5xl mb-4">{hasProfit ? "🎉" : "😊"}</p>
            <h1 className="text-2xl font-black text-slate-800 mb-2">
              씨앗이 다 자랐어요!
            </h1>
            <p className="text-slate-600">
              {autoHarvestResults.length}개의 씨앗을 자동으로 수확했어요
            </p>
          </motion.div>

          <div className="space-y-3">
            {autoHarvestResults.map((result, index) => (
              <motion.div
                key={result.seed.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <Card
                  className={`border-0 ${result.profit >= 0 ? "bg-emerald-50" : "bg-slate-50"} rounded-2xl`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getSeedIcon(result.seed.seed_type)}</span>
                        <span className="font-bold text-slate-800">
                          {getSeedName(result.seed.seed_type)}
                        </span>
                      </div>
                      <span
                        className={`font-bold ${result.profit >= 0 ? "text-emerald-600" : "text-slate-500"}`}
                      >
                        {result.profit >= 0 ? `+${result.profit}` : result.profit}포인트
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {result.seed.invested_amount}포인트 → {result.harvestedAmount}포인트
                    </p>
                    {result.lossMessage && (
                      <p className="text-sm text-slate-500 mt-1">{result.lossMessage}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: autoHarvestResults.length * 0.15 + 0.2 }}
          >
            <Card
              className={`border-0 ${hasProfit ? "bg-gradient-to-r from-emerald-500 to-green-600" : "bg-gradient-to-r from-slate-500 to-slate-600"} text-white rounded-2xl`}
            >
              <CardContent className="p-4 text-center">
                <p className="text-white/70 text-sm">총 수확</p>
                <p className="text-3xl font-black">{totalHarvested.toLocaleString()}포인트</p>
                <p className="text-white/80 text-sm mt-1">
                  {hasProfit
                    ? `씨앗이 잘 자랐어요! +${totalProfit}포인트 이득!`
                    : "다음에는 더 좋은 날씨가 올 거예요!"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <Button
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-2xl shadow-lg"
            onClick={() => {
              setAutoHarvestResults([]);
              fetchData();
            }}
          >
            확인했어요! 🌱
          </Button>
        </div>
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
                    <p className="text-sm text-slate-500">심은 포인트</p>
                    <p className="text-2xl font-black text-slate-700">
                      {harvestResult.seed.invested_amount}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <ChevronRight className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">수확 포인트</p>
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
                    {isProfit ? `+${profit}포인트!` : `${profit}포인트`}
                  </span>
                </div>

                <p className="mt-4 text-slate-600">
                  {getHarvestStory(
                    getSeedIcon(harvestResult.seed.seed_type),
                    profit,
                    harvestResult.seed.invested_amount
                  )}
                </p>

                {harvestResult.weatherBonus !== undefined && harvestResult.weatherBonus !== 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    {harvestResult.weatherIcon} 오늘 {harvestResult.weatherName} 날씨가 영향을 줬어요!
                  </p>
                )}

                {!isProfit && (
                  <div className="mt-3 p-3 bg-slate-100 rounded-xl">
                    <p className="text-sm text-slate-600 font-medium">
                      {getRandomLossMessage()}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      💡 팁: 여러 종류 씨앗을 섞어서 심으면 더 안전해요!
                    </p>
                  </div>
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
              수확한 포인트으로 뭐 할까?
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 rounded-2xl border-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => handleSaveReflection({ navigateTo: "/shop" })}
              >
                <span className="text-lg">🛒</span>
                <span className="text-base font-bold">쓰기</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 rounded-2xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => handleSaveReflection({ navigateTo: "/savings" })}
              >
                <span className="text-lg">🏦</span>
                <span className="text-base font-bold">금고에 넣기</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 rounded-2xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleSaveReflection({ nextStep: "select" })}
              >
                <span className="text-lg">🌱</span>
                <span className="text-base font-bold">다시 심기</span>
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

          {/* 기본 씨앗 */}
          <div className="space-y-3">
            {(() => {
              const availableSeeds = [
                ...BASE_SEED_TYPES,
                ...HIDDEN_SEED_TYPES.filter((s) => unlockedHidden.has(s.type)),
              ];
              return availableSeeds.map((seed, index) => (
                <motion.div
                  key={seed.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl active:scale-[0.98] ${seed.hidden ? "ring-2 ring-violet-200" : ""}`}
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-800 text-lg">{seed.name}</h3>
                            {seed.hidden && (
                              <span className="px-1.5 py-0.5 bg-violet-100 rounded text-sm font-bold text-violet-600">특별</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-sm mb-2">"{seed.description}"</p>
                          {/* 과거 결과 예시 (있을 경우) */}
                          {harvestHistory.find(h => h.seed_type === seed.type) && (() => {
                            const last = harvestHistory.find(h => h.seed_type === seed.type)!;
                            return (
                              <p className="text-sm text-slate-400 mb-2">
                                지난번: {last.invested_amount}포인트 → {last.harvested_amount}포인트 됐어요
                              </p>
                            );
                          })()}
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                              {GROWTH_LABELS[seed.type] || "2주 후 결과"}
                            </span>
                            <span className={`px-2 py-1 bg-slate-100 rounded-lg text-sm font-bold ${seed.color}`}>
                              {seed.resultRange}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ));
            })()}
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
    const bestCase = Math.floor(amount * (MAX_MULTIPLIER[selectedSeedType.type] ?? 1.1));
    const worstCase = Math.floor(amount * (MIN_GUARANTEE[selectedSeedType.type] ?? 1.0));

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
                포인트
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
                <span className="text-slate-500 font-medium">포인트</span>
              </div>

              {amount >= 10 && (
                <div className="p-3 bg-slate-50 rounded-xl mb-4">
                  <p className="text-sm text-slate-600 mb-1">
                    {selectedSeedType.type !== "sunflower" && (
                      <>
                        좋을 때: {plantAmount}포인트 → <strong className="text-emerald-600">{bestCase}포인트</strong>
                      </>
                    )}
                    {selectedSeedType.type === "sunflower" && (
                      <>
                        확정 결과: {plantAmount}포인트 → <strong className="text-emerald-600">{bestCase}포인트</strong>
                      </>
                    )}
                  </p>
                  {selectedSeedType.type !== "sunflower" && (
                    <p className="text-sm text-slate-500">
                      아쉬울 때: {plantAmount}포인트 → <strong className="text-slate-500">{worstCase}포인트</strong>
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
  // 묶음 심기 화면
  // ============================================
  if (step === "bundle") {
    const availableForBundle = [
      ...BASE_SEED_TYPES,
      ...HIDDEN_SEED_TYPES.filter((s) => unlockedHidden.has(s.type)),
    ];
    const totalAllocated = Object.values(bundleAllocations).reduce((sum, v) => sum + v, 0);
    const remaining = walletBalance - totalAllocated;

    const applyPreset = (preset: "equal" | "safe" | "adventure") => {
      const types = availableForBundle.map((s) => s.type);
      const newAllocations: Record<string, number> = {};
      if (preset === "equal") {
        const each = Math.floor(walletBalance / types.length);
        types.forEach((t) => (newAllocations[t] = Math.max(0, Math.min(each, walletBalance))));
      } else if (preset === "safe") {
        // 해바라기 50%, 나머지 균등
        const sunflowerAmt = Math.floor(walletBalance * 0.5);
        newAllocations["sunflower"] = sunflowerAmt;
        const rest = walletBalance - sunflowerAmt;
        const others = types.filter((t) => t !== "sunflower");
        const each = Math.floor(rest / others.length);
        others.forEach((t) => (newAllocations[t] = each));
      } else {
        // 클로버 50%, 나머지 균등
        const cloverAmt = Math.floor(walletBalance * 0.5);
        newAllocations["clover"] = cloverAmt;
        const rest = walletBalance - cloverAmt;
        const others = types.filter((t) => t !== "clover");
        const each = Math.floor(rest / others.length);
        others.forEach((t) => (newAllocations[t] = each));
      }
      setBundleAllocations(newAllocations);
    };

    const handleBundlePlant = async () => {
      const entries = Object.entries(bundleAllocations).filter(([, v]) => v >= 10);
      if (entries.length === 0) {
        toast.error("최소 10포인트 이상 심어야 해요!");
        return;
      }
      // 유효한 항목만의 합계로 검증 및 차감
      const validTotal = entries.reduce((sum, [, v]) => sum + v, 0);
      if (validTotal > walletBalance) {
        toast.error("지갑에 포인트이 부족해요!");
        return;
      }

      setProcessing(true);
      try {
        const now = new Date();

        // 각 씨앗별로 개별 레코드 생성
        for (const [seedType, amount] of entries) {
          const harvestDate = new Date(now);
          harvestDate.setDate(harvestDate.getDate() + (GROWTH_DAYS[seedType] ?? 14));

          const { error: seedInsertError } = await supabase.from("seeds").insert({
            juwoo_id: 1,
            seed_type: seedType,
            invested_amount: amount,
            planted_date: now.toISOString(),
            harvest_date: harvestDate.toISOString(),
            status: "growing",
            diary_entry: "묶음 심기",
          });
          if (seedInsertError) {
            if (import.meta.env.DEV) console.error('묶음 씨앗 생성 실패:', seedInsertError);
            toast.error('잠깐, 문제가 생겼어! 다시 해보자');
            return;
          }
        }

        // 지갑 차감 (유효 항목 합계만)
        const newBalance = walletBalance - validTotal;
        const { error: walletError } = await supabase
          .from("juwoo_profile")
          .update({ current_points: newBalance })
          .eq("id", 1);
        if (walletError) {
          if (import.meta.env.DEV) console.error('지갑 차감 실패:', walletError);
          toast.error('잠깐, 문제가 생겼어! 다시 해보자');
          return;
        }

        // 거래 내역
        const seedNames = entries.map(([type]) => {
          const seed = SEED_TYPES.find((s) => s.type === type);
          return seed ? `${seed.icon}${seed.name}` : type;
        });
        const { error: txError } = await supabase.from("point_transactions").insert({
          juwoo_id: 1,
          rule_id: null,
          amount: -validTotal,
          balance_after: newBalance,
          note: `🌈 묶음 심기: ${seedNames.join(", ")} (${validTotal}포인트)`,
          created_by: 1,
        });
        if (txError) {
          if (import.meta.env.DEV) console.error('거래 내역 기록 실패:', txError);
        }

        toast.success("묶음 심기 완료!", {
          description: `${entries.length}종류의 씨앗을 심었어요!`,
        });

        setBundleAllocations({});
        setStep("main");
        fetchData();
      } catch (error: any) {
        if (import.meta.env.DEV) console.error("Error bundle planting:", error);
        toast.error("잘 안 됐어요. 다시 해볼까?");
      } finally {
        setProcessing(false);
      }
    };

    // 예측 범위 계산
    const bundleMin = Object.entries(bundleAllocations)
      .filter(([, v]) => v >= 10)
      .reduce((sum, [type, amt]) => sum + Math.floor(amt * (MIN_GUARANTEE[type] ?? 1.0)), 0);
    const bundleMax = Object.entries(bundleAllocations)
      .filter(([, v]) => v >= 10)
      .reduce((sum, [type, amt]) => sum + Math.floor(amt * (MAX_MULTIPLIER[type] ?? 1.1)), 0);

    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => {
                setStep("main");
                setBundleAllocations({});
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                🌈 묶음 심기
              </h1>
              <p className="text-sm text-slate-500">
                여러 씨앗을 한꺼번에 심어요
              </p>
            </div>
          </div>

          {/* 지갑 잔액 */}
          <div className="flex items-center justify-between p-3 bg-white/80 rounded-2xl">
            <span className="text-sm text-slate-600">내 지갑</span>
            <span className="font-bold text-slate-800">
              {walletBalance.toLocaleString()}포인트
            </span>
          </div>

          {/* 프리셋 버튼 */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="h-12 rounded-xl text-base font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => applyPreset("equal")}
            >
              균등 분배
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl text-base font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => applyPreset("safe")}
            >
              안전 위주
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl text-base font-bold border-violet-200 text-violet-700 hover:bg-violet-50"
              onClick={() => applyPreset("adventure")}
            >
              모험 위주
            </Button>
          </div>

          {/* 씨앗별 분배 */}
          <Card className="border-0 bg-white/90 rounded-2xl shadow-lg">
            <CardContent className="p-4 space-y-3">
              {availableForBundle.map((seed) => (
                <div key={seed.type} className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{seed.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">{seed.name}</p>
                    <p className="text-sm text-slate-400">
                      {GROWTH_LABELS[seed.type]} | {seed.resultRange}
                    </p>
                  </div>
                  <input
                    type="number"
                    value={bundleAllocations[seed.type] || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setBundleAllocations((prev) => ({
                        ...prev,
                        [seed.type]: val,
                      }));
                    }}
                    placeholder="0"
                    className="w-20 h-10 px-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-right focus:border-emerald-500 focus:outline-none"
                    min={0}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 합산 정보 */}
          <Card className="border-0 bg-slate-50 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">투자 합계</span>
                <span className={`font-bold ${totalAllocated > walletBalance ? "text-amber-600" : "text-slate-800"}`}>
                  {totalAllocated.toLocaleString()}포인트
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">남는 포인트</span>
                <span className={`font-bold ${remaining < 0 ? "text-amber-600" : "text-slate-600"}`}>
                  {remaining.toLocaleString()}포인트
                </span>
              </div>
              {totalAllocated > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-sm text-slate-500">
                    예상 수확: {bundleMin.toLocaleString()}~{bundleMax.toLocaleString()}포인트
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 심기 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-14 rounded-2xl font-bold"
              onClick={() => {
                setStep("main");
                setBundleAllocations({});
              }}
            >
              다시 생각해볼래
            </Button>
            <Button
              className="h-14 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-[0.98] transition-all"
              onClick={handleBundlePlant}
              disabled={processing || totalAllocated === 0 || totalAllocated > walletBalance}
            >
              {processing ? "심는 중..." : "묶음 심기! 🌈"}
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
      <FlyingCoin show={showPlantAnimation} direction="to-seed" />
      <MultiCoinBurst show={showHarvestBurst} count={6} />
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

        {/* 오늘의 날씨 카드 — 강화 UI */}
        {(() => {
          const weather = getTodayWeather();
          const weatherEffects: Record<string, { text: string; textColor: string; bgColor: string }> = {
            sunny: { text: "씨앗이 잘 자라는 날!", textColor: "text-emerald-600", bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50" },
            cloudy: { text: "보통 날이에요", textColor: "text-slate-500", bgColor: "bg-gradient-to-r from-slate-50 to-gray-50" },
            rainy: { text: "나무는 좋지만 클로버는 힘들어요", textColor: "text-blue-600", bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50" },
            windy: { text: "클로버는 좋지만 나무는 힘들어요", textColor: "text-blue-600", bgColor: "bg-gradient-to-r from-sky-50 to-blue-50" },
          };
          const effect = weatherEffects[weather.type] ?? weatherEffects.cloudy;

          return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`border-0 ${effect.bgColor} rounded-2xl shadow-sm`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <motion.span
                      className="text-4xl"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {weather.icon}
                    </motion.span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">
                        오늘 씨앗 농장의 기후는 {weather.icon} {weather.name}이에요!
                      </p>
                      <p className={`text-sm font-medium mt-0.5 ${effect.textColor}`}>
                        {effect.text}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">{weather.description}</p>
                    </div>
                  </div>
                  {/* 씨앗별 영향 */}
                  {weather.type !== "cloudy" && (
                    <div className="flex gap-2 mt-3">
                      {Object.entries(weather.seedBonus)
                        .filter(([, bonus]) => bonus !== 0)
                        .map(([seed, bonus]) => (
                          <span
                            key={seed}
                            className={`px-2 py-1 rounded-lg text-sm font-medium ${
                              bonus > 0
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {getSeedIcon(seed)} {bonus > 0 ? `+${Math.round(bonus * 100)}%` : `${Math.round(bonus * 100)}%`}
                          </span>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}

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
                              ({seed.invested_amount}포인트)
                            </span>
                          </div>
                          <span
                            className={`text-sm font-bold ${isReady ? "text-emerald-600" : "text-slate-500"}`}
                          >
                            {isReady ? "수확 가능!" : `D-${daysLeft}`}
                          </span>
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
                            <span>{progress}% 자람</span>
                            <span>
                              예상 수확:{" "}
                              {seedType?.type === "sunflower"
                                ? `${Math.floor(seed.invested_amount * 1.1)}포인트 확정`
                                : `${Math.floor(seed.invested_amount * (MIN_GUARANTEE[seedType?.type ?? "tree"] ?? 0.85))}~${Math.floor(seed.invested_amount * (MAX_MULTIPLIER[seedType?.type ?? "tree"] ?? 1.4))}포인트`}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2.5" />
                          <p className="text-sm text-emerald-600 mt-1 font-medium">
                            {getGrowthStory(progress, daysLeft, isReady)}
                          </p>
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
                  <p className="text-slate-400 text-sm mt-1">아래에서 씨앗을 심어보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 새 씨앗 심기 + 묶음 심기 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Button
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
            onClick={() => setStep("select")}
          >
            <Sprout className="h-5 w-5 mr-2" />
            새로운 씨앗 심기
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-12 rounded-2xl font-bold border-2 border-violet-200 text-violet-700 hover:bg-violet-50"
              onClick={() => setStep("bundle")}
            >
              🌈 묶음 심기
            </Button>
            <Link href="/seed-album">
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl font-bold border-2 border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                📖 씨앗 도감
              </Button>
            </Link>
          </div>
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
                    const profit = (seed.harvested_amount ?? 0) - seed.invested_amount;
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
                            <p className="text-sm text-slate-500">
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
