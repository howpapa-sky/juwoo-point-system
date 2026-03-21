import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GROWTH_DAYS,
  GROWTH_LABELS,
  MIN_GUARANTEE,
  MAX_MULTIPLIER,
} from "@/lib/investmentConstants";

// 도감 씨앗 정의
interface AlbumSeed {
  type: string;
  icon: string;
  name: string;
  description: string;
  growthLabel: string;
  resultRange: string;
  gradient: string;
  hidden: boolean;
  unlockHint: string;
  unlockCondition: (stats: SeedStats) => boolean;
}

interface SeedStats {
  totalInvested: number;
  totalProfit: number;
  harvestCounts: Record<string, number>;
  simultaneousTypes: number; // 동시 재배 종류 수 기록
  bestRecords: Record<string, number>; // 씨앗별 최고 수익률
}

const ALBUM_SEEDS: AlbumSeed[] = [
  {
    type: "sunflower",
    icon: "🌻",
    name: "해바라기 씨앗",
    description: "항상 웃는 친구. 믿음직해요!",
    growthLabel: GROWTH_LABELS["sunflower"],
    resultRange: "무조건 110%",
    gradient: "from-yellow-400 to-amber-500",
    hidden: false,
    unlockHint: "",
    unlockCondition: () => true,
  },
  {
    type: "tree",
    icon: "🌳",
    name: "나무 씨앗",
    description: "비바람도 이겨내는 든든한 친구",
    growthLabel: GROWTH_LABELS["tree"],
    resultRange: "85~140%",
    gradient: "from-green-400 to-emerald-500",
    hidden: false,
    unlockHint: "",
    unlockCondition: () => true,
  },
  {
    type: "clover",
    icon: "🍀",
    name: "네잎클로버 씨앗",
    description: "무지개 너머의 행운을 찾아요",
    growthLabel: GROWTH_LABELS["clover"],
    resultRange: "30~250%",
    gradient: "from-emerald-400 to-teal-500",
    hidden: false,
    unlockHint: "",
    unlockCondition: () => true,
  },
  {
    type: "rose",
    icon: "🌹",
    name: "장미 씨앗",
    description: "아름다운 장미에는 가시가 있어요",
    growthLabel: GROWTH_LABELS["rose"],
    resultRange: "100~180%",
    gradient: "from-rose-400 to-pink-500",
    hidden: true,
    unlockHint: "총 500코인 이상 투자하면 나타나요",
    unlockCondition: (stats) => stats.totalInvested >= 500,
  },
  {
    type: "bamboo",
    icon: "🎋",
    name: "대나무 씨앗",
    description: "대나무는 참을성 있게 자라요",
    growthLabel: GROWTH_LABELS["bamboo"],
    resultRange: "105~125%",
    gradient: "from-lime-400 to-green-500",
    hidden: true,
    unlockHint: "3종류 씨앗을 동시에 키워본 적 5번이면...",
    unlockCondition: (stats) => stats.simultaneousTypes >= 5,
  },
  {
    type: "rainbow",
    icon: "🌈",
    name: "무지개 씨앗",
    description: "모든 가능성이 담긴 특별한 씨앗",
    growthLabel: GROWTH_LABELS["rainbow"],
    resultRange: "50~300%",
    gradient: "from-violet-400 to-pink-500",
    hidden: true,
    unlockHint: "총 수익 100코인을 넘기면 나타나요",
    unlockCondition: (stats) => stats.totalProfit >= 100,
  },
];

function getStarRating(count: number): string {
  if (count >= 10) return "⭐⭐⭐";
  if (count >= 5) return "⭐⭐";
  if (count >= 1) return "⭐";
  return "";
}

export default function SeedAlbum() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [stats, setStats] = useState<SeedStats>({
    totalInvested: 0,
    totalProfit: 0,
    harvestCounts: {},
    simultaneousTypes: 0,
    bestRecords: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        // 모든 수확 완료된 씨앗
        const { data: harvested } = await supabase
          .from("seeds")
          .select("*")
          .eq("juwoo_id", 1)
          .eq("status", "harvested");

        // 모든 씨앗 (투자 총액용)
        const { data: allSeeds } = await supabase
          .from("seeds")
          .select("*")
          .eq("juwoo_id", 1);

        const seeds = harvested || [];
        const all = allSeeds || [];

        // 총 투자액
        const totalInvested = all.reduce(
          (sum: number, s: any) => sum + (s.invested_amount ?? 0),
          0
        );

        // 총 수익
        const totalProfit = seeds.reduce(
          (sum: number, s: any) =>
            sum + ((s.harvested_amount ?? 0) - (s.invested_amount ?? 0)),
          0
        );

        // 씨앗별 수확 횟수
        const harvestCounts: Record<string, number> = {};
        for (const s of seeds) {
          harvestCounts[s.seed_type] = (harvestCounts[s.seed_type] ?? 0) + 1;
        }

        // 씨앗별 최고 수익률
        const bestRecords: Record<string, number> = {};
        for (const s of seeds) {
          if (s.result_multiplier) {
            const current = bestRecords[s.seed_type] ?? 0;
            if (s.result_multiplier > current) {
              bestRecords[s.seed_type] = s.result_multiplier;
            }
          }
        }

        // 동시 재배 3종류 횟수 (간략하게 추정: 수확된 씨앗 날짜 겹침 기반)
        // 간단한 방법: 3종류 이상 수확한 적이 있으면 횟수 계산
        let simultaneousTypes = 0;
        const growingSeeds = all.filter((s: any) => s.status !== "harvested");
        const uniqueGrowingTypes = new Set(
          growingSeeds.map((s: any) => s.seed_type)
        );
        // 과거 동시 재배 수를 추정: 수확 완료 씨앗 중 겹치는 기간 체크
        const harvestedByDate = seeds.sort(
          (a: any, b: any) =>
            new Date(a.planted_date).getTime() -
            new Date(b.planted_date).getTime()
        );
        for (let i = 0; i < harvestedByDate.length; i++) {
          const planted = new Date(harvestedByDate[i].planted_date);
          const harvest = new Date(harvestedByDate[i].harvest_date);
          const overlapping = harvestedByDate.filter((s: any) => {
            const sp = new Date(s.planted_date);
            const sh = new Date(s.harvest_date);
            return sp < harvest && sh > planted;
          });
          const uniqueTypes = new Set(overlapping.map((s: any) => s.seed_type));
          if (uniqueTypes.size >= 3) simultaneousTypes++;
        }
        // Also count current growing
        if (uniqueGrowingTypes.size >= 3) simultaneousTypes++;

        setStats({
          totalInvested,
          totalProfit,
          harvestCounts,
          simultaneousTypes,
          bestRecords,
        });
      } catch (error: any) {
        if (import.meta.env.DEV) console.error("Error fetching album stats:", error);
        toast.error("도감 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl w-fit mb-4 shadow-lg">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">로그인이 필요해요</h2>
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-lg rounded-2xl">
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
          <div className="w-20 h-20 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-violet-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">도감을 준비하는 중...</p>
      </div>
    );
  }

  const totalHarvests = Object.values(stats.harvestCounts).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <Link href="/seed-farm">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              📖 씨앗 도감
            </h1>
            <p className="text-sm text-slate-500">
              총 {totalHarvests}번 수확 | 수익{" "}
              {stats.totalProfit >= 0 ? "+" : ""}
              {stats.totalProfit}코인
            </p>
          </div>
        </div>

        {/* 씨앗 목록 */}
        <div className="space-y-3">
          {ALBUM_SEEDS.map((seed, index) => {
            const isUnlocked = !seed.hidden || seed.unlockCondition(stats);
            const harvestCount = stats.harvestCounts[seed.type] ?? 0;
            const bestMultiplier = stats.bestRecords[seed.type];
            const stars = getStarRating(harvestCount);

            return (
              <motion.div
                key={seed.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card
                  className={`border-0 rounded-2xl overflow-hidden ${
                    isUnlocked
                      ? "bg-white/90 backdrop-blur-sm shadow-lg"
                      : "bg-slate-100/80"
                  }`}
                >
                  <CardContent className="p-5">
                    {isUnlocked ? (
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${seed.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <span className="text-3xl">{seed.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-slate-800 text-lg">
                              {seed.name}
                            </h3>
                            {stars && (
                              <span className="text-sm">{stars}</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-sm mb-2">
                            "{seed.description}"
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                              {seed.growthLabel}
                            </span>
                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-sm font-bold text-emerald-600">
                              {seed.resultRange}
                            </span>
                            {seed.hidden && (
                              <span className="px-2 py-1 bg-violet-100 rounded-lg text-sm font-bold text-violet-600">
                                숨겨진 씨앗!
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>수확 {harvestCount}회</span>
                            {bestMultiplier && (
                              <span>
                                최고 기록:{" "}
                                {Math.round(bestMultiplier * 100)}%
                              </span>
                            )}
                            <span>
                              성장: {GROWTH_DAYS[seed.type]}일
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl text-slate-400">❓</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-slate-400 text-lg">
                            ??? 비밀 씨앗
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">
                            💡 힌트: {seed.unlockHint}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 씨앗밭으로 돌아가기 */}
        <Link href="/seed-farm">
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl font-bold text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-50"
          >
            🌱 씨앗밭으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
