import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Utensils,
  Check,
  Clock,
  Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { adjustPoints } from '@/lib/pointsHelper';
import { WORLDVIEW } from '@/lib/designTokens';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface DailyRoutine {
  id: number;
  name: string;
  category: 'morning' | 'evening';
  point_amount: number;
  sort_order: number;
  icon: string;
  worldview_label: string;
  is_active: boolean;
}

interface RoutineCompletion {
  id: number;
  routine_id: number;
  completed_date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sun: <Sun className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Utensils: <Utensils className="h-5 w-5" />,
  Backpack: <Zap className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Book: <BookOpen className="h-5 w-5" />,
  Moon: <Moon className="h-5 w-5" />,
  Bed: <Moon className="h-5 w-5" />,
};

function getKSTDate(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

export default function RoutineTimeline() {
  const { user } = useSupabaseAuth();
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [completions, setCompletions] = useState<RoutineCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);

  const currentHour = new Date().getHours();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>(
    currentHour < 14 ? 'morning' : 'evening'
  );
  const todayDate = getKSTDate();

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [routinesRes, completionsRes] = await Promise.all([
      supabase
        .from('daily_routines')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('routine_completions')
        .select('*')
        .eq('completed_date', todayDate),
    ]);

    if (routinesRes.error) {
      toast.error('루틴을 불러오지 못했어요');
    } else {
      setRoutines(routinesRes.data ?? []);
    }

    if (!completionsRes.error) {
      setCompletions(completionsRes.data ?? []);
    }

    setLoading(false);
  }, [todayDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription for approval updates
  useEffect(() => {
    const channel = supabase
      .channel('routine-approvals')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'approval_queue',
          filter: 'status=eq.approved',
        },
        () => {
          confetti({ particleCount: 50, spread: 60 });
          toast.success('승인 완료! 포인트 받았어!');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const filteredRoutines = routines.filter((r) => r.category === timeOfDay);
  const completedCount = filteredRoutines.filter((r) =>
    completions.some(
      (c) => c.routine_id === r.id && (c.status === 'pending' || c.status === 'approved')
    )
  ).length;
  const totalCount = filteredRoutines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = completedCount === totalCount && totalCount > 0;

  const getStatus = (routineId: number) => {
    const completion = completions.find((c) => c.routine_id === routineId);
    if (!completion) return 'waiting';
    return completion.status;
  };

  const handleComplete = async (routine: DailyRoutine) => {
    if (getStatus(routine.id) !== 'waiting' || submitting !== null) return;

    setSubmitting(routine.id);

    // Insert routine completion
    const { data: completionData, error: completionError } = await supabase
      .from('routine_completions')
      .insert({
        routine_id: routine.id,
        completed_date: todayDate,
        status: 'pending',
      })
      .select()
      .single();

    if (completionError) {
      toast.error('이미 완료했거나 오류가 발생했어요');
      setSubmitting(null);
      return;
    }

    // Insert approval request
    const { error: approvalError } = await supabase
      .from('approval_queue')
      .insert({
        request_type: 'routine',
        reference_id: completionData.id,
        reference_table: 'routine_completions',
        description: `${routine.name} 완료`,
        worldview_message: routine.worldview_label ?? WORLDVIEW.routine,
        point_amount: routine.point_amount,
        status: 'pending',
      });

    if (approvalError) {
      toast.error('승인 요청에 오류가 발생했어요');
    } else {
      toast.success(`"${routine.name}" 승인 대기 중이에요!`);
      setCompletions((prev) => [
        ...prev,
        {
          id: completionData.id,
          routine_id: routine.id,
          completed_date: todayDate,
          status: 'pending',
        },
      ]);
    }

    setSubmitting(null);

    // Check if all routines are now complete (including pending)
    const newCompletedCount = filteredRoutines.filter((r) => {
      if (r.id === routine.id) return true;
      return completions.some(
        (c) => c.routine_id === r.id && (c.status === 'pending' || c.status === 'approved')
      );
    }).length;

    if (newCompletedCount === totalCount && totalCount > 0) {
      // Full completion bonus
      const bonusType = timeOfDay === 'morning' ? '아침 루틴 완전 완료' : '저녁 루틴 완전 완료';
      await adjustPoints({ amount: 500, note: bonusType });
      confetti({ particleCount: 80, spread: 100 });
      toast.success(
        timeOfDay === 'morning'
          ? '오늘 할 일 완료! +500 포인트!'
          : '할 일 완료! +500 포인트!'
      );
    }
  };

  const statusConfig = {
    waiting: {
      bg: 'bg-gray-100',
      border: 'border-gray-200',
      icon: <Clock className="h-4 w-4 text-gray-400" />,
      label: '대기',
    },
    pending: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      label: '승인 대기',
    },
    approved: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <Check className="h-4 w-4 text-green-600" />,
      label: '완료',
    },
    rejected: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: <Clock className="h-4 w-4 text-gray-400" />,
      label: '다시 해보자',
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-4" style={{ fontSize: 16 }}>
            루틴을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-gradient-to-b from-indigo-50 to-purple-50">
      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 rounded-full">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-700">{WORLDVIEW.routine}</span>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2">
          <Button
            variant={timeOfDay === 'morning' ? 'default' : 'outline'}
            className={`flex-1 h-12 text-base ${
              timeOfDay === 'morning'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                : ''
            }`}
            style={{ minHeight: 48 }}
            onClick={() => setTimeOfDay('morning')}
          >
            <Sun className="h-5 w-5 mr-2" />
            아침 탐험 준비
          </Button>
          <Button
            variant={timeOfDay === 'evening' ? 'default' : 'outline'}
            className={`flex-1 h-12 text-base ${
              timeOfDay === 'evening'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : ''
            }`}
            style={{ minHeight: 48 }}
            onClick={() => setTimeOfDay('evening')}
          >
            <Moon className="h-5 w-5 mr-2" />
            저녁 기지 점검
          </Button>
        </div>

        {/* 진행률 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">
              {completedCount}/{totalCount} 완료
            </span>
            <span className="text-sm font-bold text-indigo-600">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3 [&>div]:bg-indigo-500" />
        </div>

        {/* 전체 완료 배너 */}
        <AnimatePresence>
          {allComplete && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl">
                <CardContent className="p-5 text-center">
                  <div className="text-3xl mb-2">
                    {timeOfDay === 'morning' ? '🌅' : '🌙'}
                  </div>
                  <h3 className="text-xl font-bold mb-1">
                    {timeOfDay === 'morning'
                      ? '오늘 할 일 다 했어!'
                      : '오늘 할 일 다 했어!'}
                  </h3>
                  <p className="text-white/80 text-sm">+500 포인트 보너스!</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 루틴 타임라인 */}
        <div className="space-y-3">
          {filteredRoutines.map((routine, index) => {
            const status = getStatus(routine.id);
            const config = statusConfig[status];
            const isSubmitting = submitting === routine.id;

            return (
              <motion.div
                key={routine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card
                  className={`border-2 ${config.border} ${config.bg} transition-all ${
                    status === 'waiting'
                      ? 'cursor-pointer hover:shadow-md hover:border-indigo-300 active:scale-[0.98]'
                      : ''
                  }`}
                  onClick={() => status === 'waiting' && handleComplete(routine)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* 아이콘 */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          status === 'approved'
                            ? 'bg-green-100 text-green-600'
                            : status === 'pending'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-indigo-100 text-indigo-600'
                        }`}
                        style={{ minWidth: 48, minHeight: 48 }}
                      >
                        {ICON_MAP[routine.icon] ?? <Sparkles className="h-5 w-5" />}
                      </div>

                      {/* 텍스트 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800" style={{ fontSize: 16 }}>
                          {routine.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {routine.worldview_label}
                        </p>
                      </div>

                      {/* 포인트 + 상태 */}
                      <div className="text-right flex-shrink-0">
                        {routine.point_amount > 0 && (
                          <div className="font-bold text-indigo-600" style={{ fontSize: 16 }}>
                            +{routine.point_amount.toLocaleString()}
                          </div>
                        )}
                        <div className="flex items-center gap-1 justify-end mt-1">
                          {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-indigo-400 rounded-full animate-spin border-t-transparent" />
                          ) : (
                            config.icon
                          )}
                          <span className="text-sm text-gray-500">{config.label}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredRoutines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500" style={{ fontSize: 16 }}>
              등록된 루틴이 없어요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
