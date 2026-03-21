import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { LEARNING_PATH, type LearningUnit } from '@/data/learningPath';
import { getStoryByUnitId } from '@/data/stories';
import { useUnitProgress, type UnitProgressRow } from '@/hooks/useUnitProgress';
import { useSRS } from '@/hooks/useSRS';

export default function EnglishAdventure() {
  const [, navigate] = useLocation();
  const { progress, loading: unitLoading, getUnitStatus, getUnitProgress: getUnitProg, checkUnlock, activateUnit } = useUnitProgress();
  const { getUnitMastery } = useSRS();
  const [unlockStatus, setUnlockStatus] = useState<Record<string, boolean>>({});
  const [checkingUnlocks, setCheckingUnlocks] = useState(true);

  // Check unlock status for all units
  useEffect(() => {
    if (unitLoading) return;

    async function checkAllUnlocks() {
      setCheckingUnlocks(true);
      const statuses: Record<string, boolean> = {};
      for (const unit of LEARNING_PATH) {
        const currentStatus = getUnitStatus(unit.id);
        if (currentStatus === 'locked') {
          statuses[unit.id] = await checkUnlock(unit.id, getUnitMastery);
        } else {
          statuses[unit.id] = true;
        }
      }
      setUnlockStatus(statuses);
      setCheckingUnlocks(false);
    }

    checkAllUnlocks();
  }, [unitLoading, progress, getUnitStatus, checkUnlock, getUnitMastery]);

  const handleUnitClick = async (unit: LearningUnit) => {
    const status = getUnitStatus(unit.id);

    if (status === 'locked') {
      const canUnlock = unlockStatus[unit.id];
      if (canUnlock) {
        await activateUnit(unit.id);
        // Navigate to story
        const story = getStoryByUnitId(unit.id);
        if (story) {
          navigate(`/english-story/${story.id}`);
        }
      }
      return;
    }

    // Active or completed -> go to story
    const story = getStoryByUnitId(unit.id);
    if (story) {
      navigate(`/english-story/${story.id}`);
    }
  };

  const loading = unitLoading || checkingUnlocks;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
        <p className="text-slate-500 mt-4 text-lg font-medium">모험 지도를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-16 w-56 h-56 bg-gradient-to-br from-green-400/15 to-emerald-400/15 rounded-full blur-3xl" />
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-3">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-700">영어 모험 지도</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-1">모험을 떠나요!</h1>
          <p className="text-slate-500">한 유닛씩 클리어하며 영어 실력을 키워요</p>
        </motion.div>

        {/* 유닛 목록 (세로 스크롤 지도) */}
        <div className="relative">
          {/* 연결선 */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 rounded-full" />

          <div className="space-y-4">
            {LEARNING_PATH.map((unit, index) => {
              const status = getUnitStatus(unit.id);
              const unitProg: UnitProgressRow | null = getUnitProg(unit.id);
              const canUnlock = unlockStatus[unit.id] ?? false;
              const isLocked = status === 'locked' && !canUnlock;
              const isActive = status === 'active' || (status === 'locked' && canUnlock);
              const isCompleted = status === 'completed';

              return (
                <motion.div
                  key={unit.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.06 }}
                  className="relative pl-12"
                >
                  {/* 노드 아이콘 */}
                  <div className="absolute left-4 top-4 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-md">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    ) : isLocked ? (
                      <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse">
                        <span className="text-white font-bold text-sm">{unit.unitNumber}</span>
                      </div>
                    )}
                  </div>

                  <Card
                    className={`border-0 rounded-2xl overflow-hidden transition-all cursor-pointer ${
                      isLocked
                        ? 'bg-slate-100/80 opacity-60'
                        : isCompleted
                        ? 'bg-green-50/80 shadow-md shadow-green-500/10 hover:-translate-y-0.5'
                        : 'bg-white/90 shadow-lg shadow-indigo-500/10 hover:-translate-y-0.5 active:scale-[0.98]'
                    }`}
                    onClick={() => !isLocked && handleUnitClick(unit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {/* 유닛 아이콘 */}
                        <div className={`text-3xl flex-shrink-0 ${isLocked ? 'grayscale' : ''}`}>
                          {unit.icon}
                        </div>

                        {/* 유닛 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold text-slate-400">Unit {unit.unitNumber}</span>
                            {isCompleted && (
                              <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                완료
                              </span>
                            )}
                          </div>
                          <h3 className={`font-bold text-lg ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                            {unit.title}
                          </h3>
                          <p className={`text-sm ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>
                            {unit.titleEn}
                          </p>

                          {/* 진행률 (active일 때) */}
                          {isActive && unitProg && (
                            <div className="mt-2">
                              <div className="flex justify-between text-sm text-slate-500 mb-1">
                                <span>{unitProg.words_mastered ?? 0} / {unitProg.total_words ?? unit.targetWords.length} 단어</span>
                                <span>{unitProg.mastery_percent ?? 0}%</span>
                              </div>
                              <Progress value={unitProg.mastery_percent ?? 0} className="h-2" />
                            </div>
                          )}

                          {/* 잠금 메시지 */}
                          {isLocked && (
                            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              이전 유닛 60% 달성 필요
                            </p>
                          )}
                        </div>

                        {/* 화살표 */}
                        {!isLocked && (
                          <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
