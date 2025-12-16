import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Gift,
  Target,
  BookOpen,
  BarChart3,
  Award,
  Gamepad2,
  Brain,
  Library,
  Zap,
  Star,
  Crown,
  Flame,
  ChevronRight,
  Coins,
  Trophy,
  Rocket,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchBalance = async () => {
      const { data } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();
      setBalance(data?.current_points || 0);
    };

    fetchBalance();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground mt-4 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950">
        {/* 히어로 섹션 */}
        <div className="relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl" />
            <div className="absolute top-20 -left-20 w-60 h-60 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl" />
          </div>

          <div className="container max-w-6xl py-8 px-4 relative">
            {/* 상단 네비게이션 */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  주우 포인트
                </span>
              </div>
              {balance !== null && (
                <Link href="/dashboard">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-purple-200 hover:shadow-xl transition-all cursor-pointer">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold text-purple-700">{balance.toLocaleString()}P</span>
                  </div>
                </Link>
              )}
            </div>

            {/* 환영 메시지 */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium text-purple-700 mb-4">
                <Sparkles className="h-4 w-4" />
                {user?.user_metadata?.name || "주우"}님, 오늘도 화이팅!
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                  포인트를 모아
                </span>
                <br />
                <span className="text-slate-800 dark:text-white">꿈을 이루자!</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                좋은 습관으로 포인트를 모으고, 원하는 보상을 얻어보세요 ✨
              </p>
            </div>

            {/* 빠른 액션 카드 - 주요 3개 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* 포켓몬 퀴즈 */}
              <Link href="/pokemon-quiz">
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Gamepad2 className="h-8 w-8" />
                      </div>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                        🎮 퀴즈
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">포켓몬GO 퀴즈</h3>
                    <p className="text-white/80 text-sm mb-4">퀴즈 풀고 게임 이용권 얻기!</p>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="text-sm font-medium">지금 도전</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* 영어 학습 */}
              <Link href="/english-learning">
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Brain className="h-8 w-8" />
                      </div>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                        📚 학습
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">영어 단어 학습</h3>
                    <p className="text-white/80 text-sm mb-4">105개 단어로 실력 UP!</p>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="text-sm font-medium">학습 시작</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* e북 도서관 */}
              <Link href="/ebook-library">
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Library className="h-8 w-8" />
                      </div>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                        📖 도서관
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">e북 도서관</h3>
                    <p className="text-white/80 text-sm mb-4">포켓몬GO 공략집 읽기!</p>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="text-sm font-medium">책 보러가기</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* 메뉴 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { href: "/dashboard", icon: Sparkles, label: "대시보드", color: "from-purple-500 to-indigo-500", desc: "내 포인트" },
                { href: "/points", icon: TrendingUp, label: "포인트 관리", color: "from-green-500 to-emerald-500", desc: "적립/차감" },
                { href: "/shop", icon: Gift, label: "상점", color: "from-rose-500 to-pink-500", desc: "보상 구매" },
                { href: "/goals", icon: Target, label: "목표", color: "from-amber-500 to-orange-500", desc: "목표 달성" },
                { href: "/badges", icon: Award, label: "배지", color: "from-yellow-500 to-amber-500", desc: "획득 배지" },
                { href: "/statistics", icon: BarChart3, label: "통계", color: "from-cyan-500 to-blue-500", desc: "활동 기록" },
                { href: "/transactions", icon: Coins, label: "거래 내역", color: "from-slate-500 to-gray-600", desc: "포인트 기록" },
                { href: "/english-quiz", icon: BookOpen, label: "영어 퀴즈", color: "from-violet-500 to-purple-500", desc: "단어 테스트" },
              ].map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <Card
                    className="group border border-white/50 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-sm`}>
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{item.label}</h3>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 하단 배너 */}
            <Card className="border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="h-5 w-5 text-yellow-300" />
                      <span className="font-bold">오늘의 도전</span>
                    </div>
                    <p className="text-white/80 text-sm">
                      매일 퀴즈를 풀고 연속 기록을 세워보세요!
                    </p>
                  </div>
                  <Link href="/pokemon-quiz">
                    <Button className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg">
                      <Zap className="h-4 w-4 mr-1" />
                      도전하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 비로그인 랜딩 페이지
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-20 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container max-w-4xl py-16 px-4 relative">
          <div className="text-center">
            {/* 로고 */}
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl mb-8 animate-bounce">
              <Star className="h-12 w-12 text-white" />
            </div>

            {/* 타이틀 */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                주우의
              </span>
              <br />
              <span className="text-slate-800 dark:text-white">포인트 시스템</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
              좋은 습관을 만들고, 포인트를 모아
              <br />
              원하는 보상을 받아보세요! ✨
            </p>

            {/* 특징 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { emoji: "✨", text: "숙제 완료" },
                { emoji: "🏃", text: "운동하기" },
                { emoji: "📚", text: "책 읽기" },
                { emoji: "🎓", text: "영어 학습" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg"
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="font-medium text-slate-700">{item.text}</div>
                </div>
              ))}
            </div>

            {/* 보상 미리보기 */}
            <div className="mb-10 p-6 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-center gap-2">
                <Gift className="h-5 w-5 text-pink-500" />
                포인트로 얻을 수 있는 것들
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {["🎮 게임 시간", "🎁 장난감", "🍕 맛있는 음식", "🎬 영화 관람", "🎪 놀이공원"].map(
                  (reward, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium text-purple-700"
                    >
                      {reward}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* CTA 버튼 */}
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl px-10 py-7 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all hover:-translate-y-1"
              onClick={() => (window.location.href = "/login")}
            >
              <Rocket className="h-6 w-6 mr-2" />
              시작하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
