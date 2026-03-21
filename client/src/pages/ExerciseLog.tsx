import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  Minus,
  Plus,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { adjustPoints } from '@/lib/pointsHelper';
import { WORLDVIEW } from '@/lib/designTokens';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface ExerciseLogEntry {
  id: number;
  exercise_type: string;
  exercise_name: string;
  duration_minutes: number;
  distance_km: number | null;
  exercise_date: string;
  with_parent: boolean;
  points_earned: number;
  status: string;
}

const EXERCISE_TYPES = [
  { value: 'swimming', label: '수영', emoji: '🏊', basePoints: 1500 },
  { value: 'running', label: '달리기', emoji: '🏃', basePoints: 1000 },
  { value: 'cycling', label: '자전거', emoji: '🚴', basePoints: 800 },
  { value: 'stretching', label: '스트레칭', emoji: '🤸', basePoints: 500 },
  { value: 'walking', label: '산책', emoji: '🚶', basePoints: 400 },
  { value: 'playground', label: '놀이터', emoji: '🛝', basePoints: 600 },
  { value: 'other', label: '기타', emoji: '⚡', basePoints: 500 },
] as const;

function getKSTDate(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

function calculateExercisePoints(type: string, minutes: number): number {
  const exercise = EXERCISE_TYPES.find((e) => e.value === type);
  if (!exercise) return 500;

  // Base points are for 30 minutes; scale proportionally but with min 200
  const ratio = Math.min(minutes / 30, 2);
  return Math.max(200, Math.round(exercise.basePoints * ratio));
}

export default function ExerciseLog() {
  const { user } = useSupabaseAuth();
  const [todayLogs, setTodayLogs] = useState<ExerciseLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(30);
  const [distance, setDistance] = useState('');
  const [withParent, setWithParent] = useState(false);

  const todayDate = getKSTDate();

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('exercise_date', todayDate)
      .order('created_at', { ascending: false });

    if (!error) {
      setTodayLogs(data ?? []);
    }

    setLoading(false);
  }, [todayDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error('운동 종류를 선택해주세요');
      return;
    }
    if (minutes <= 0) {
      toast.error('운동 시간을 입력해주세요');
      return;
    }

    setSubmitting(true);

    const basePoints = calculateExercisePoints(selectedType, minutes);
    const parentBonus = withParent ? 500 : 0;
    const totalPoints = basePoints + parentBonus;

    const exercise = EXERCISE_TYPES.find((e) => e.value === selectedType);
    const exerciseName = `${exercise?.label ?? '운동'} ${minutes}분`;

    const { data: logData, error: logError } = await supabase
      .from('exercise_logs')
      .insert({
        exercise_type: selectedType,
        exercise_name: exerciseName,
        duration_minutes: minutes,
        distance_km: distance ? parseFloat(distance) : null,
        exercise_date: todayDate,
        with_parent: withParent,
        points_earned: totalPoints,
        status: 'pending',
      })
      .select()
      .single();

    if (logError) {
      toast.error('기록에 오류가 발생했어요');
      setSubmitting(false);
      return;
    }

    // Insert approval queue
    const description = `${exercise?.emoji ?? '⚡'} ${exerciseName}${withParent ? ' (아빠와 함께!)' : ''}`;

    const { error: approvalError } = await supabase
      .from('approval_queue')
      .insert({
        request_type: 'exercise',
        reference_id: logData.id,
        reference_table: 'exercise_logs',
        description,
        worldview_message: `${WORLDVIEW.exercise} — 체력 훈련 완료!`,
        point_amount: totalPoints,
        status: 'pending',
      });

    if (approvalError) {
      toast.error('승인 요청에 오류가 발생했어요');
    } else {
      confetti({ particleCount: 30, spread: 60 });
      toast.success(`${exerciseName} 훈련 기록 승인 대기 중!`);
    }

    // Update streak
    await updateExerciseStreak();

    // Reset form
    setSelectedType(null);
    setMinutes(30);
    setDistance('');
    setWithParent(false);
    setSubmitting(false);

    fetchData();
  };

  const updateExerciseStreak = async () => {
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('streak_type', 'exercise')
      .single();

    const today = getKSTDate();

    if (streak) {
      const lastDate = streak.last_completed_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCount = streak.current_count ?? 0;

      if (lastDate === today) {
        return;
      } else if (lastDate === yesterdayStr) {
        newCount += 1;
      } else {
        newCount = 1;
      }

      const newBest = Math.max(newCount, streak.best_count ?? 0);

      await supabase
        .from('streaks')
        .update({
          current_count: newCount,
          best_count: newBest,
          last_completed_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('streak_type', 'exercise');

      // Check exercise streak badges
      const { data: badges } = await supabase
        .from('activity_badges')
        .select('*')
        .eq('badge_type', 'exercise')
        .eq('requirement_type', 'exercise_streak')
        .eq('is_earned', false)
        .lte('requirement_value', newCount);

      if (badges && badges.length > 0) {
        for (const badge of badges) {
          await supabase
            .from('activity_badges')
            .update({ is_earned: true, earned_at: new Date().toISOString() })
            .eq('id', badge.id);
          toast.success(`새로운 탐험 훈장! ${badge.emoji} ${badge.name}`);
        }
      }
    } else {
      await supabase.from('streaks').insert({
        streak_type: 'exercise',
        current_count: 1,
        best_count: 1,
        last_completed_date: today,
      });
    }

    // Check exercise count badges
    const { count } = await supabase
      .from('exercise_logs')
      .select('*', { count: 'exact', head: true });

    if (count !== null) {
      const { data: countBadges } = await supabase
        .from('activity_badges')
        .select('*')
        .eq('badge_type', 'exercise')
        .eq('requirement_type', 'exercise_count')
        .eq('is_earned', false)
        .lte('requirement_value', count);

      if (countBadges && countBadges.length > 0) {
        for (const badge of countBadges) {
          await supabase
            .from('activity_badges')
            .update({ is_earned: true, earned_at: new Date().toISOString() })
            .eq('id', badge.id);
          toast.success(`새로운 탐험 훈장! ${badge.emoji} ${badge.name}`);
        }
      }
    }
  };

  const showDistance = selectedType === 'running' || selectedType === 'cycling';
  const estimatedPoints = selectedType
    ? calculateExercisePoints(selectedType, minutes) + (withParent ? 500 : 0)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600 mx-auto" />
          <p className="text-gray-500 mt-4" style={{ fontSize: 16 }}>
            불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-gradient-to-b from-emerald-50 to-teal-50">
      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 rounded-full">
            <Dumbbell className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">{WORLDVIEW.exercise}</span>
          </div>
        </div>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-slate-800 mb-1">체력 훈련 기록</h1>
          <p className="text-slate-500">탐험대원의 체력을 키워보자!</p>
        </motion.div>

        {/* 운동 종류 선택 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Label className="text-base font-semibold text-slate-700 mb-2 block">
            어떤 훈련을 했나요?
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {EXERCISE_TYPES.map((exercise) => (
              <button
                key={exercise.value}
                type="button"
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedType === exercise.value
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                style={{ minHeight: 48 }}
                onClick={() => setSelectedType(exercise.value)}
              >
                <div className="text-2xl mb-1">{exercise.emoji}</div>
                <p className="text-sm font-bold text-slate-700">{exercise.label}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 시간 입력 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Label className="text-base font-semibold text-slate-700 mb-2 block">
            <Clock className="h-4 w-4 inline mr-1" />
            운동 시간 (분)
          </Label>
          <div className="flex items-center gap-3 justify-center">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              style={{ minWidth: 48, minHeight: 48 }}
              onClick={() => setMinutes((m) => Math.max(5, m - 5))}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <div className="text-4xl font-black text-emerald-600 w-20 text-center">
              {minutes}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              style={{ minWidth: 48, minHeight: 48 }}
              onClick={() => setMinutes((m) => Math.min(180, m + 5))}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex justify-center gap-2 mt-2">
            {[15, 30, 60].map((v) => (
              <Button
                key={v}
                variant={minutes === v ? 'default' : 'outline'}
                size="sm"
                className={`rounded-full ${
                  minutes === v ? 'bg-emerald-600 text-white' : ''
                }`}
                onClick={() => setMinutes(v)}
              >
                {v}분
              </Button>
            ))}
          </div>
        </motion.div>

        {/* 거리 (달리기/자전거) */}
        {showDistance && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Label className="text-base font-semibold text-slate-700 mb-2 block">
              거리 (km, 선택)
            </Label>
            <Input
              type="number"
              step="0.1"
              placeholder="예: 1.5"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="text-center text-lg"
              style={{ fontSize: 16 }}
            />
          </motion.div>
        )}

        {/* 아빠와 함께 토글 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            type="button"
            className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              withParent
                ? 'border-amber-400 bg-amber-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            style={{ minHeight: 48 }}
            onClick={() => setWithParent(!withParent)}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                withParent ? 'bg-amber-500' : 'bg-gray-200'
              }`}
              style={{ minWidth: 40, minHeight: 40 }}
            >
              <Users className={`h-5 w-5 ${withParent ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800" style={{ fontSize: 16 }}>
                아빠와 함께!
              </p>
              <p className="text-sm text-slate-500">
                {withParent ? '탐험대 합동 훈련 보너스 +500' : '함께 하면 보너스 +500'}
              </p>
            </div>
          </button>
        </motion.div>

        {/* 예상 포인트 + 제출 */}
        {selectedType && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="space-y-3"
          >
            <Card className="border-0 bg-emerald-50 rounded-xl">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-emerald-600 font-medium">예상 포인트</p>
                <p className="text-2xl font-black text-emerald-700">
                  +{estimatedPoints.toLocaleString()} E
                </p>
                {withParent && (
                  <p className="text-sm text-amber-600 mt-1">
                    아빠와 함께 보너스 포함!
                  </p>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base"
              style={{ minHeight: 48 }}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? '기록 중...' : '훈련 기록!'}
            </Button>
          </motion.div>
        )}

        {/* 오늘의 기록 */}
        {todayLogs.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-bold text-slate-800 mb-3">오늘의 훈련 기록</h2>
            <div className="space-y-2">
              {todayLogs.map((log) => {
                const exercise = EXERCISE_TYPES.find((e) => e.value === log.exercise_type);
                return (
                  <Card key={log.id} className="border-0 shadow-sm rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{exercise?.emoji ?? '⚡'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800" style={{ fontSize: 16 }}>
                            {log.exercise_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {log.duration_minutes}분
                            {log.distance_km ? ` · ${log.distance_km}km` : ''}
                            {log.with_parent ? ' · 아빠와 함께!' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">
                            +{log.points_earned.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-400">
                            {log.status === 'pending'
                              ? '승인 대기'
                              : log.status === 'approved'
                              ? '승인 완료'
                              : '다시 해보자'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
