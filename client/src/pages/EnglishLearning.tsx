import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  BookOpen,
  Brain,
  Trophy,
  Sparkles,
  Mic,
  ChevronRight,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
} from "lucide-react";

interface LearningMode {
  href: string;
  icon: any;
  title: string;
  description: string;
  reward: string;
  gradient: string;
  shadowColor: string;
  features: string[];
}

const learningModes: LearningMode[] = [
  {
    href: "/english-flashcard",
    icon: Brain,
    title: "플래시카드",
    description: "카드를 뒤집어 단어를 외워요",
    reward: "+500P",
    gradient: "from-blue-500 to-cyan-500",
    shadowColor: "shadow-blue-500/25",
    features: ["3D 뒤집기", "발음 듣기"],
  },
  {
    href: "/english-quiz",
    icon: Trophy,
    title: "영어 퀴즈",
    description: "4지선다 퀴즈로 실력 테스트",
    reward: "+1000P",
    gradient: "from-purple-500 to-pink-500",
    shadowColor: "shadow-purple-500/25",
    features: ["10문제", "별점 시스템"],
  },
  {
    href: "/word-learning",
    icon: BookOpen,
    title: "단어 학습",
    description: "직접 입력하며 암기해요",
    reward: "+300P",
    gradient: "from-emerald-500 to-teal-500",
    shadowColor: "shadow-emerald-500/25",
    features: ["카테고리별", "진도 저장"],
  },
  {
    href: "/voice-learning",
    icon: Mic,
    title: "음성 학습",
    description: "발음하며 단어를 외워요",
    reward: "+500P",
    gradient: "from-rose-500 to-pink-500",
    shadowColor: "shadow-rose-500/25",
    features: ["음성 인식", "발음 체크"],
  },
];

export default function EnglishLearning() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  // 로딩 화면
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">로딩 중...</p>
      </div>
    );
  }

  // 로그인 필요 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl w-fit mb-4 shadow-lg shadow-blue-500/30">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-black">로그인이 필요해요</CardTitle>
            <CardDescription className="text-base">영어 학습을 시작하려면 로그인해주세요</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-16 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="pt-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full mb-3">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">학습하고 포인트 GET!</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-1">영어 학습</h1>
          <p className="text-slate-500">원하는 학습 방법을 선택하세요</p>
        </div>

        {/* 학습 메뉴 카드 */}
        <div className="space-y-3">
          {learningModes.map((mode, index) => (
            <Link key={mode.href} href={mode.href}>
              <Card
                className={`border-0 bg-white/80 backdrop-blur-sm shadow-lg ${mode.shadowColor} rounded-2xl overflow-hidden active:scale-[0.98] transition-all hover:-translate-y-0.5`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    {/* 아이콘 */}
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${mode.gradient} shadow-lg mr-4 flex-shrink-0`}>
                      <mode.icon className="h-7 w-7 text-white" />
                    </div>

                    {/* 콘텐츠 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-slate-800">{mode.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${mode.gradient} text-white`}>
                          {mode.reward}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{mode.description}</p>
                      <div className="flex gap-2">
                        {mode.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-0.5 bg-slate-100 rounded-md text-xs text-slate-600"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 화살표 */}
                    <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 학습 통계 버튼 */}
        <Link href="/learning-stats">
          <Card className="border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/30 rounded-2xl overflow-hidden active:scale-[0.98] transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold">내 학습 통계</p>
                    <p className="text-sm text-white/80">학습 기록을 확인해보세요</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-white/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 학습 팁 */}
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-amber-800 mb-2">학습 팁</h4>
                <ul className="space-y-1.5 text-sm text-amber-700">
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>먼저 <strong>플래시카드</strong>로 단어를 외운 후 <strong>퀴즈</strong>로 복습!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>매일 조금씩 학습하면 포인트도 쌓이고 실력도 UP!</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
