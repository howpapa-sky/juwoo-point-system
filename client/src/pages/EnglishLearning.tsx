import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Brain, Trophy, Sparkles, Star, Mic } from "lucide-react";

export default function EnglishLearning() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>영어 학습을 시작하려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">로그인하기</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
      <div className="container max-w-4xl py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <BookOpen className="h-10 w-10 text-blue-600" />
              영어 학습 📚
            </h1>
            <p className="text-lg text-muted-foreground">
              영어 단어를 학습하고 포인트를 획득하세요!
            </p>
          </div>
        </div>

        {/* 학습 메뉴 카드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 플래시카드 학습 */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-500 group">
            <CardHeader className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-t-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white/20 rounded-full">
                  <Brain className="h-12 w-12" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">플래시카드 학습</CardTitle>
              <CardDescription className="text-center text-white/90">
                카드를 뒤집어 단어를 외워보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>3D 카드 뒤집기 애니메이션</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>음성 발음 듣기</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>학습 완료 시 +500P</span>
                </div>
              </div>
              <Link href="/english-flashcard">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg py-6 group-hover:scale-105 transition-transform">
                  학습 시작하기
                  <BookOpen className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 퀴즈 풀기 */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-500 group">
            <CardHeader className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-t-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white/20 rounded-full">
                  <Trophy className="h-12 w-12" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">영어 퀴즈</CardTitle>
              <CardDescription className="text-center text-white/90">
                4지선다 퀴즈로 실력을 테스트하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>10문제 4지선다형</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>별점 시스템 (최대 ⭐⭐⭐)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>만점 시 +1000P, 70점 이상 +500P</span>
                </div>
              </div>
              <Link href="/english-quiz">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-6 group-hover:scale-105 transition-transform">
                  퀴즈 풀기
                  <Trophy className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 단어 학습 (텍스트 입력) */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-500 group">
            <CardHeader className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-t-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white/20 rounded-full">
                  <BookOpen className="h-12 w-12" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">단어 학습</CardTitle>
              <CardDescription className="text-center text-white/90">
                텍스트 입력으로 단어를 외워보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>카테고리별 학습</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>직접 입력하여 암기</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>카테고리 완료 시 +300P</span>
                </div>
              </div>
              <Link href="/word-learning">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg py-6 group-hover:scale-105 transition-transform">
                  학습 시작하기
                  <BookOpen className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 음성 인식 학습 */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-red-500 group">
            <CardHeader className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-t-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white/20 rounded-full">
                  <Mic className="h-12 w-12" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">음성 인식 학습</CardTitle>
              <CardDescription className="text-center text-white/90">
                발음하면서 단어를 외워보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>음성 인식 기술 활용</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>발음 정확도 체크</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>80% 이상 정답 시 +500P</span>
                </div>
              </div>
              <Link href="/voice-learning">
                <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-lg py-6 group-hover:scale-105 transition-transform">
                  학습 시작하기
                  <Mic className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 학습 통계 버튼 */}
        <div className="mt-8 text-center">
          <Link href="/learning-stats">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-lg py-6 px-8">
              <Trophy className="mr-2 h-5 w-5" />
              학습 통계 보기
            </Button>
          </Link>
        </div>

        {/* 학습 팁 */}
        <Card className="mt-8 border-2 border-dashed border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              학습 팁
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>먼저 <strong>플래시카드</strong>로 단어를 외운 후, <strong>퀴즈</strong>로 복습하세요!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>발음 듣기 버튼을 눌러 정확한 발음을 익히세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>매일 조금씩 학습하면 포인트도 쌓이고 실력도 늘어요!</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
