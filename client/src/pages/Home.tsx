import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Sparkles, TrendingUp, Gift, Target, Star, BookOpen, BarChart3, Award } from "lucide-react";

export default function Home() {
  const { user, loading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <div className="container py-12">
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🌟 주우의 포인트 시스템 🌟
            </h1>
            <p className="text-xl text-muted-foreground">
              좋은 행동으로 포인트를 모으고, 원하는 것을 얻어보세요!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  대시보드
                </CardTitle>
                <CardDescription>내 포인트 확인하기</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard">
                  <Button className="w-full">바로가기</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  포인트 관리
                </CardTitle>
                <CardDescription>포인트 적립/차감</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/points">
                  <Button className="w-full">바로가기</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-6 w-6 text-red-500" />
                  포인트 상점
                </CardTitle>
                <CardDescription>포인트로 구매하기</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/shop">
                  <Button className="w-full">바로가기</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                  영어 학습
                </CardTitle>
                <CardDescription>단어를 배우고 포인트 획득!</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/english">
                  <Button className="w-full">학습하기</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-purple-500" />
                  목표 설정
                </CardTitle>
                <CardDescription>포인트 목표 달성하기!</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/goals">
                  <Button className="w-full">목표 보기</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  배지
                </CardTitle>
                <CardDescription>획득한 배지 보기!</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/badges">
                  <Button className="w-full">배지 보기</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: "0.7s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                  통계
                </CardTitle>
                <CardDescription>포인트 사용 기록</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/statistics">
                  <Button className="w-full">보기</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">⭐</div>
          <CardTitle className="text-4xl font-bold mb-2">주우의 포인트 시스템</CardTitle>
          <CardDescription className="text-lg">
            좋은 행동으로 포인트를 모으고, 원하는 것을 얻어보세요!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-center">
            <p className="flex items-center justify-center gap-2">
              ✨ 숙제를 일찍 끝내면 포인트 적립
            </p>
            <p className="flex items-center justify-center gap-2">
              🏃 운동을 하면 포인트 적립
            </p>
            <p className="flex items-center justify-center gap-2">
              📚 책을 읽으면 포인트 적립
            </p>
            <p className="flex items-center justify-center gap-2">
              🎓 영어 단어를 배우면 포인트 적립
            </p>
            <p className="flex items-center justify-center gap-2">
              🎮 포인트로 게임 시간 구매
            </p>
            <p className="flex items-center justify-center gap-2">
              🎁 포인트로 장난감 구매
            </p>
          </div>

          <Button 
            className="w-full text-lg py-6" 
            size="lg"
            onClick={() => window.location.href = '/login'}
          >
            로그인하고 시작하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
