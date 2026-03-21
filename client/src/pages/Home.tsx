import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { WORLDVIEW } from "@/lib/designTokens";
import {
  Sparkles,
  Gift,
  Target,
  BookOpen,
  BarChart3,
  Award,
  Brain,
  Zap,
  Flame,
  ChevronRight,
  Coins,
  Rocket,
  Package,
  Moon,
  Sprout,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [balance, setBalance] = useState<number | null>(null);
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      const [profileRes, streakRes] = await Promise.all([
        supabase
          .from("juwoo_profile")
          .select("current_points")
          .eq("id", 1)
          .single(),
        supabase
          .from("streaks")
          .select("streak_type, current_count"),
      ]);

      setBalance(profileRes.data?.current_points ?? 0);

      if (streakRes.data) {
        const streakMap: Record<string, number> = {};
        for (const s of streakRes.data) {
          streakMap[s.streak_type] = s.current_count ?? 0;
        }
        setStreaks(streakMap);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  /** 포인트 포맷: 만 단위 이상이면 "1,234만 E" */
  const formatPoints = (points: number): string => {
    if (points >= 10000) {
      const man = Math.floor(points / 10000);
      const remainder = points % 10000;
      if (remainder === 0) return `${man.toLocaleString()}만 E`;
      return `${man.toLocaleString()}만 ${remainder.toLocaleString()} E`;
    }
    return `${points.toLocaleString()} E`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500 mt-4 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const totalStreak = Object.values(streaks).reduce((a, b) => a + b, 0);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-6xl py-8 px-4">
          {/* 상단 네비게이션 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                탐험기지
              </span>
            </div>
            {balance !== null && (
              <Link href="/dashboard">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span className="font-bold text-gray-900">
                    {formatPoints(balance)}
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* 환영 메시지 */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full text-sm font-medium text-indigo-700 mb-3">
              <Sparkles className="h-4 w-4" />
              탐험대원 {user?.user_metadata?.name ?? "주우"}, 오늘도 화이팅!
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              주우의 탐험기지에 오신 걸 환영해!
            </h1>
            <p className="text-base text-gray-500">
              좋은 습관으로 에너지를 충전하고, 새로운 세계를 탐험하세요
            </p>
          </div>

          {/* 스트릭 표시 */}
          {totalStreak > 0 && (
            <div className="flex mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-200">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-orange-700">
                  {WORLDVIEW.streak} {totalStreak}일
                </span>
              </div>
            </div>
          )}

          {/* 빠른 액션 카드 — 토스 스타일: 흰색 배경 + 좌측 액센트 바 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* 기지 전력 충전 (루틴) */}
            <Link href="/routine">
              <Card className="group relative overflow-hidden border border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl" />
                <CardContent className="p-6 pl-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <Zap className="h-8 w-8 text-indigo-600" />
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 rounded-full text-sm font-medium text-indigo-700">
                      루틴
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{WORLDVIEW.routine}</h3>
                  <p className="text-gray-500 text-sm mb-4">아침/저녁 루틴 완료하기!</p>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <span className="text-sm font-medium">출발!</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 우주어 해독 (영어) */}
            <Link href="/english-learning">
              <Card className="group relative overflow-hidden border border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l-xl" />
                <CardContent className="p-6 pl-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-50 rounded-2xl">
                      <Brain className="h-8 w-8 text-purple-600" />
                    </div>
                    <span className="px-3 py-1 bg-purple-50 rounded-full text-sm font-medium text-purple-700">
                      학습
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{WORLDVIEW.english}</h3>
                  <p className="text-gray-500 text-sm mb-4">1,000개+ 단어로 우주어 해독!</p>
                  <div className="flex items-center gap-2 text-purple-600">
                    <span className="text-sm font-medium">해독 시작</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 씨앗 농장 (투자) */}
            <Link href="/seed-farm">
              <Card className="group relative overflow-hidden border border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
                <CardContent className="p-6 pl-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                      <Sprout className="h-8 w-8 text-emerald-600" />
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 rounded-full text-sm font-medium text-emerald-700">
                      투자
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{WORLDVIEW.invest}</h3>
                  <p className="text-gray-500 text-sm mb-4">씨앗을 심고 키워보자!</p>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <span className="text-sm font-medium">씨앗 심으러 가기</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* 메뉴 그리드 — 흰색 배경 + 아이콘만 컬러 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { href: "/dashboard", icon: Sparkles, label: "대시보드", iconBg: "bg-indigo-50", iconColor: "text-indigo-600", desc: `${WORLDVIEW.points}` },
              { href: "/worry-box", icon: Package, label: "걱정상자", iconBg: "bg-amber-50", iconColor: "text-amber-600", desc: "걱정 넣기" },
              { href: "/shop", icon: Gift, label: WORLDVIEW.shop, iconBg: "bg-pink-50", iconColor: "text-pink-600", desc: "보상 구매" },
              { href: "/wallet", icon: Coins, label: "내 지갑", iconBg: "bg-orange-50", iconColor: "text-orange-600", desc: "잔액 확인" },
              { href: "/sleep", icon: Moon, label: "충전 모드", iconBg: "bg-indigo-50", iconColor: "text-indigo-600", desc: "수면 보너스" },
              { href: "/goals", icon: Target, label: "목표", iconBg: "bg-amber-50", iconColor: "text-amber-600", desc: "목표 달성" },
              { href: "/badges", icon: Award, label: WORLDVIEW.badge, iconBg: "bg-yellow-50", iconColor: "text-yellow-600", desc: "획득 훈장" },
              { href: "/english-quiz", icon: BookOpen, label: WORLDVIEW.english, iconBg: "bg-purple-50", iconColor: "text-purple-600", desc: "단어 테스트" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="group border border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${item.iconBg}`}>
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{item.label}</h3>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* 하단 배너 — 연한 인디고 배경 */}
          <Card className="border border-indigo-100 bg-indigo-50 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="font-bold text-gray-900">오늘의 탐험</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    매일 루틴을 완료하고 {WORLDVIEW.streak} 기록을 세워보세요!
                  </p>
                </div>
                <Link href="/routine">
                  <Button className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-sm">
                    <Zap className="h-4 w-4 mr-1" />
                    도전하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 비로그인 랜딩 페이지
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl py-16 px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl shadow-lg mb-8">
            <Rocket className="h-12 w-12 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-6">
            <span className="text-indigo-600">주우의</span>
            <br />
            <span className="text-gray-900">탐험기지</span>
          </h1>

          <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
            좋은 습관으로 {WORLDVIEW.points}를 모으고,
            <br />
            새로운 세계를 탐험하세요!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { emoji: "🚀", text: "루틴 완료" },
              { emoji: "🌟", text: "에너지 충전" },
              { emoji: "🌱", text: "씨앗 키우기" },
              { emoji: "🎓", text: "우주어 해독" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="font-medium text-gray-700">{item.text}</div>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl px-10 py-7 rounded-2xl shadow-lg transition-all hover:-translate-y-1"
            onClick={() => (window.location.href = "/login")}
          >
            <Rocket className="h-6 w-6 mr-2" />
            탐험 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
