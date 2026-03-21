// ============================================
// 영어 학습 허브 — 3단계 영어 학습 사이클
// 만나기(Learn) → 연습(Practice) → 복습(Review)
// ============================================
import { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  BookOpen, Brain, Trophy, Sparkles, Mic, ChevronRight,
  Target, BarChart3, Lightbulb, Rocket, Users,
} from 'lucide-react';
import { useSRS } from '@/hooks/useSRS';
import { WORLDVIEW } from '@/lib/designTokens';

type LearningStage = 'learn' | 'practice' | 'review';

const STAGES: { id: LearningStage; icon: typeof BookOpen; title: string; description: string; color: string; gradient: string }[] = [
  {
    id: 'learn',
    icon: BookOpen,
    title: '만나기',
    description: '새로운 단어를 배워요',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'practice',
    icon: Brain,
    title: '연습',
    description: '배운 단어로 퀴즈!',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'review',
    icon: Target,
    title: '복습',
    description: '잊기 전에 다시 한 번!',
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export default function EnglishLearning() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const { reviewWords, totalWords, loading: srsLoading } = useSRS();
  const [activeStage, setActiveStage] = useState<LearningStage>('learn');

  // 로딩/로그인 체크
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl w-fit mb-4 shadow-lg">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">로그인이 필요해요</h2>
            <p className="text-slate-500 mb-4">{WORLDVIEW.english}을 시작하려면 로그인해줘!</p>
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reviewCount = reviewWords.length;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-16 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="pt-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 rounded-full mb-3">
            <Rocket className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">{WORLDVIEW.english}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-1">영어 공부</h1>
          <p className="text-slate-500">3단계로 영어를 마스터하자!</p>
        </div>

        {/* 레벨 & 통계 바 */}
        <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">배운 단어</p>
                <p className="text-2xl font-black">{totalWords}개</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">오늘 복습</p>
                <p className="text-2xl font-black">{reviewCount}개</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3단계 탭 */}
        <div className="flex gap-2">
          {STAGES.map((stage) => {
            const isActive = activeStage === stage.id;
            const Icon = stage.icon;
            return (
              <motion.button
                key={stage.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveStage(stage.id)}
                className={`flex-1 py-3 px-2 rounded-xl text-center transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${stage.gradient} text-white shadow-lg`
                    : 'bg-white/80 text-slate-500 border border-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 mx-auto mb-1 ${isActive ? 'text-white' : stage.color}`} />
                <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                  {stage.title}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* 단계별 콘텐츠 */}
        {activeStage === 'learn' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Card className="border-0 bg-white/80 shadow-lg rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <motion.span
                    className="text-3xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🤖
                  </motion.span>
                  <div className="bg-blue-50 rounded-xl rounded-tl-none px-4 py-2">
                    <span className="font-medium text-blue-700">
                      새로운 단어를 배우자! 카드를 넘기면서!
                    </span>
                  </div>
                </div>
                <Link href="/english-flashcard">
                  <Button className="w-full h-14 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-lg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    새 단어 배우기 (5개씩)
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-1">만나기 단계란?</h4>
                    <p className="text-sm text-blue-700">
                      플래시카드로 새 단어를 처음 만나요. 그림 + 뜻 + 예문 + 발음을 함께 봐요.
                      먼저 보여주고, 그 다음에 물어보니까 걱정 마!
                    </p>
                    <p className="text-sm text-blue-500 mt-1">완료 시 +200P (하루 3회)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeStage === 'practice' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Card className="border-0 bg-white/80 shadow-lg rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <motion.span
                    className="text-3xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🤖
                  </motion.span>
                  <div className="bg-purple-50 rounded-xl rounded-tl-none px-4 py-2">
                    <span className="font-medium text-purple-700">
                      배운 단어로 퀴즈를 풀어보자! 틀려도 괜찮아!
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href="/english-quiz">
                    <Button className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg">
                      <Trophy className="h-5 w-5 mr-2" />
                      연습 모드로 퀴즈 풀기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/word-learning">
                <Card className="border-0 bg-white/80 shadow-md rounded-2xl active:scale-[0.98] transition-all h-full">
                  <CardContent className="p-4 text-center">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl w-fit mx-auto mb-2 shadow-md">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-bold text-sm text-slate-700">단어 학습</p>
                    <p className="text-sm text-slate-400">직접 입력</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/voice-learning">
                <Card className="border-0 bg-white/80 shadow-md rounded-2xl active:scale-[0.98] transition-all h-full">
                  <CardContent className="p-4 text-center">
                    <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl w-fit mx-auto mb-2 shadow-md">
                      <Mic className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-bold text-sm text-slate-700">음성 학습</p>
                    <p className="text-sm text-slate-400">발음 체크</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-800 mb-1">연습 단계란?</h4>
                    <p className="text-sm text-purple-700">
                      배운 단어로 퀴즈를 풀어요! 기본은 연습 모드라서 틀려도 괜찮아.
                      힌트도 쓸 수 있고, 틀리면 정답을 알려줘요.
                    </p>
                    <p className="text-sm text-purple-500 mt-1">별 1~3개 기반 +300~500P (하루 상한 1,500P)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeStage === 'review' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Card className="border-0 bg-white/80 shadow-lg rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <motion.span
                    className="text-3xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🤖
                  </motion.span>
                  <div className="bg-emerald-50 rounded-xl rounded-tl-none px-4 py-2">
                    <span className="font-medium text-emerald-700">
                      {reviewCount > 0
                        ? `오늘 복습할 단어가 ${reviewCount}개 있어! 가볍게 시작하자!`
                        : '오늘 복습할 단어가 없어! 대단해!'}
                    </span>
                  </div>
                </div>
                <Link href="/english-quiz">
                  <Button
                    className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-2xl shadow-lg"
                    disabled={reviewCount === 0}
                  >
                    <Target className="h-5 w-5 mr-2" />
                    {reviewCount > 0 ? `복습하기 (${reviewCount}개)` : '복습 완료!'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800 mb-1">복습 단계란?</h4>
                    <p className="text-sm text-emerald-700">
                      SRS(간격반복) 시스템이 까먹을 타이밍에 자동으로 복습 단어를 골라줘요.
                      오답 단어는 자동으로 다시 나와요!
                    </p>
                    <p className="text-sm text-emerald-500 mt-1">완료 시 +200P (하루 2회)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 실수 친구 도감 링크 */}
        <Link href="/mistake-friends">
          <Card className="border-0 bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg rounded-2xl active:scale-[0.98] transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold">실수 친구 도감</p>
                    <p className="text-sm text-white/80">실수도 친구가 될 수 있어!</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-white/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 학습 통계 */}
        <Link href="/learning-stats">
          <Card className="border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/30 rounded-2xl active:scale-[0.98] transition-all">
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
                <h4 className="font-bold text-amber-800 mb-2">영어 공부 팁</h4>
                <ul className="space-y-1.5 text-sm text-amber-700">
                  <li className="flex items-start gap-2">
                    <span className="text-base">1️⃣</span>
                    <span>먼저 <strong>만나기</strong>로 새 단어를 배워요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-base">2️⃣</span>
                    <span><strong>연습</strong>으로 배운 단어를 확인해요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-base">3️⃣</span>
                    <span><strong>복습</strong>으로 기억을 단단하게!</span>
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
