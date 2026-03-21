import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Droplets,
  Sparkles,
  Star,
} from 'lucide-react';
import { useSRS } from '@/hooks/useSRS';
import { SRS_BOX_META } from '@/lib/englishConstants';

const BOX_COLORS: Record<number, { bg: string; text: string; progressBg: string }> = {
  1: { bg: 'bg-amber-50', text: 'text-amber-700', progressBg: '[&>div]:bg-amber-400' },
  2: { bg: 'bg-lime-50', text: 'text-lime-700', progressBg: '[&>div]:bg-lime-400' },
  3: { bg: 'bg-green-50', text: 'text-green-700', progressBg: '[&>div]:bg-green-500' },
  4: { bg: 'bg-pink-50', text: 'text-pink-700', progressBg: '[&>div]:bg-pink-400' },
  5: { bg: 'bg-indigo-50', text: 'text-indigo-700', progressBg: '[&>div]:bg-indigo-500' },
};

export default function WordGarden() {
  const { gardenStats, totalWords, reviewWords, loading } = useSRS();

  const masteredCount = (gardenStats[4] ?? 0) + (gardenStats[5] ?? 0);
  const reviewCount = reviewWords.length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
        />
        <p className="text-slate-500 mt-4 text-lg font-medium">정원을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-16 w-56 h-56 bg-gradient-to-br from-pink-400/15 to-rose-400/15 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        {/* 뒤로가기 */}
        <Link href="/english-learning">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            영어 학습
          </Button>
        </Link>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-3">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span className="text-sm font-bold text-green-700">나의 단어 정원</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-1">단어 정원</h1>
          <p className="text-slate-500">복습하면 단어가 쑥쑥 자라요!</p>
        </motion.div>

        {/* 요약 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl shadow-green-500/25 rounded-2xl">
            <CardContent className="p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-black">{totalWords}</div>
                  <p className="text-sm text-white/80">전체 단어</p>
                </div>
                <div>
                  <div className="text-3xl font-black">{masteredCount}</div>
                  <p className="text-sm text-white/80">마스터</p>
                </div>
                <div>
                  <div className="text-3xl font-black">{reviewCount}</div>
                  <p className="text-sm text-white/80">복습 대기</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 정원 시각화 — 5개 행 */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((box, index) => {
            const meta = SRS_BOX_META[box];
            const count = gardenStats[box] ?? 0;
            const percent = totalWords > 0 ? Math.round((count / totalWords) * 100) : 0;
            const colors = BOX_COLORS[box];

            return (
              <motion.div
                key={box}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 + index * 0.08 }}
              >
                <Card className={`border-0 ${colors.bg} shadow-md rounded-2xl`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* 아이콘 */}
                      <div className="text-4xl flex-shrink-0 w-12 text-center">
                        {meta.icon}
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className={`font-bold text-lg ${colors.text}`}>{meta.label}</span>
                            <span className="text-sm text-slate-500 ml-2">{meta.description}</span>
                          </div>
                          <span className={`text-2xl font-black ${colors.text}`}>{count}</span>
                        </div>
                        <Progress value={percent} className={`h-3 ${colors.progressBg}`} />
                        <p className="text-sm text-slate-400 mt-1">{percent}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 물주기 버튼 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/english-review">
            <Button
              className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all"
            >
              <Droplets className="h-6 w-6 mr-2" />
              {reviewCount > 0
                ? `오늘의 물주기 시작하기 (${reviewCount}개)`
                : '오늘의 물주기 시작하기'}
            </Button>
          </Link>
        </motion.div>

        {/* 정원 팁 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-0 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-bold mb-1">정원 관리 팁</p>
                  <ul className="space-y-1">
                    <li>매일 복습하면 씨앗이 새싹으로 자라요!</li>
                    <li>꽃(Box4)과 별(Box5)이 되면 마스터예요!</li>
                    <li>&quot;모르겠어요&quot;를 눌러도 괜찮아요. 솔직함이 최고!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
