import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Map,
  Flower2,
  RefreshCw,
  Trophy,
  BookOpen,
  Mic,
  Volume2,
  BarChart3,
  ChevronRight,
  Flame,
  Star,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { useSRS } from '@/hooks/useSRS';
import { useXP } from '@/hooks/useXP';
import { getLevelProgress } from '@/lib/englishConstants';
import { STORIES } from '@/data/stories';

interface NavItem {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  shadowColor: string;
}

const navItems: NavItem[] = [
  {
    href: '/english-adventure',
    icon: Map,
    title: '모험 지도',
    description: '유닛별 학습 여행을 떠나요',
    gradient: 'from-indigo-500 to-purple-500',
    shadowColor: 'shadow-indigo-500/25',
  },
  {
    href: '/word-garden',
    icon: Flower2,
    title: '단어 정원',
    description: '내 단어들이 자라는 정원',
    gradient: 'from-green-500 to-emerald-500',
    shadowColor: 'shadow-green-500/25',
  },
  {
    href: '/english-review',
    icon: RefreshCw,
    title: '복습하기',
    description: '오늘의 복습으로 기억력 UP',
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/25',
  },
  {
    href: '/english-quiz',
    icon: Trophy,
    title: '퀴즈',
    description: '3지선다 퀴즈로 실력 확인',
    gradient: 'from-purple-500 to-pink-500',
    shadowColor: 'shadow-purple-500/25',
  },
  {
    href: '/english-flashcard',
    icon: BookOpen,
    title: '플래시카드',
    description: '카드를 뒤집어 단어를 외워요',
    gradient: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/25',
  },
  {
    href: '/english-story/story-hello-juwoo',
    icon: Sparkles,
    title: '스토리',
    description: '재미있는 이야기 속에서 배워요',
    gradient: 'from-rose-500 to-pink-500',
    shadowColor: 'shadow-rose-500/25',
  },
  {
    href: '/pronunciation-practice',
    icon: Mic,
    title: '발음 연습',
    description: '소리 내어 발음해보아요',
    gradient: 'from-teal-500 to-cyan-500',
    shadowColor: 'shadow-teal-500/25',
  },
  {
    href: '/voice-learning',
    icon: Volume2,
    title: '음성 학습',
    description: '듣고 따라 말하면서 배워요',
    gradient: 'from-fuchsia-500 to-pink-500',
    shadowColor: 'shadow-fuchsia-500/25',
  },
  {
    href: '/learning-stats',
    icon: BarChart3,
    title: '학습 통계',
    description: '내 학습 기록을 확인해요',
    gradient: 'from-slate-500 to-gray-500',
    shadowColor: 'shadow-slate-500/25',
  },
];

export default function EnglishHome() {
  const { reviewWords, loading: srsLoading } = useSRS();
  const { profile, levelProgress, loading: xpLoading } = useXP();

  const loading = srsLoading || xpLoading;
  const reviewCount = reviewWords.length;
  const streak = profile?.current_streak ?? 0;
  const totalXP = profile?.total_xp ?? 0;
  const currentLevel = levelProgress?.current;
  const progressPercent = levelProgress ? Math.round(levelProgress.progress * 100) : 0;

  // Pick a random story for the "스토리" nav card link
  const storyCount = STORIES.length;
  const randomStoryId = storyCount > 0
    ? STORIES[Math.floor(Math.random() * storyCount)].id
    : 'story-hello-juwoo';

  // Override the story nav item link dynamically
  const itemsWithDynamicStory = navItems.map((item) =>
    item.title === '스토리' ? { ...item, href: `/english-story/${randomStoryId}` } : item,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
        <p className="text-slate-500 mt-4 text-lg font-medium">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-16 w-48 h-48 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        {/* 뒤로가기 */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </Link>

        {/* 헤더: 레벨 + 스트릭 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-slate-800 mb-2">영어 학습</h1>
          <div className="flex items-center justify-center gap-4 mb-3">
            {/* 레벨 */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 rounded-full">
              <Star className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-700">
                Lv.{currentLevel?.level ?? 1} {currentLevel?.title ?? ''}
              </span>
            </div>
            {/* 스트릭 */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 rounded-full">
                <Flame className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-bold text-orange-700">{streak}일 연속</span>
              </div>
            )}
          </div>
          {/* XP 프로그레스 */}
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>XP {totalXP}</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </motion.div>

        {/* 복습 알림 배너 */}
        {reviewCount > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/english-review">
              <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 rounded-2xl overflow-hidden active:scale-[0.98] transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <RefreshCw className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">복습할 단어 {reviewCount}개!</p>
                        <p className="text-sm text-white/80">물주기를 하면 단어가 쑥쑥 자라요</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-white/70" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* 네비게이션 카드 */}
        <div className="space-y-3">
          {itemsWithDynamicStory.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.05 * index + 0.15 }}
            >
              <Link href={item.href}>
                <Card
                  className={`border-0 bg-white/80 backdrop-blur-sm shadow-lg ${item.shadowColor} rounded-2xl overflow-hidden active:scale-[0.98] transition-all hover:-translate-y-0.5 cursor-pointer`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg mr-4 flex-shrink-0`}>
                        <item.icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* 부모 대시보드 링크 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/parent-dashboard">
            <Card className="border-0 bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg rounded-2xl overflow-hidden active:scale-[0.98] transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">부모님 대시보드</p>
                    <p className="text-sm text-white/70">학습 분석과 인사이트</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/60" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
