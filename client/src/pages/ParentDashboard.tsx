import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft,
  BarChart3,
  Brain,
  Flame,
  Star,
  Heart,
  Clock,
  Shield,
  Award,
  BookOpen,
  Target,
  Lightbulb,
  Flower2,
  Sprout,
  Check,
  X,
  AlertTriangle,
  Minus,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { adjustPoints } from '@/lib/pointsHelper';
import { WORLDVIEW } from '@/lib/designTokens';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface InvestmentSummary {
  activeSeeds: Array<{
    seed_type: string;
    invested_amount: number;
    harvest_date: string;
  }>;
  savingsBalance: number;
  weeklyInterest: number;
  weeklyPlanted: number;
}

interface ParentMission {
  id: number;
  mission_type: string;
  title: string;
  description: string;
  worldview_label: string | null;
  bonus_points: number;
  is_completed: boolean;
  completed_at: string | null;
  week_number: number | null;
}

interface ApprovalItem {
  id: number;
  request_type: string;
  reference_id: number | null;
  reference_table: string | null;
  description: string;
  worldview_message: string | null;
  point_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}

interface StreakData {
  streak_type: string;
  current_count: number;
  best_count: number;
}

export default function ParentDashboard() {
  const { user } = useSupabaseAuth();

  const [approvalQueue, setApprovalQueue] = useState<ApprovalItem[]>([]);
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({ earned: 0, spent: 0, attempts: 0 });
  const [reminders, setReminders] = useState<string[]>([]);
  const [missions, setMissions] = useState<ParentMission[]>([]);
  const [investSummary, setInvestSummary] = useState<InvestmentSummary>({
    activeSeeds: [],
    savingsBalance: 0,
    weeklyInterest: 0,
    weeklyPlanted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [missionProcessing, setMissionProcessing] = useState<number | null>(null);

  // Deduction dialog
  const [showDeductDialog, setShowDeductDialog] = useState(false);
  const [deductAmount, setDeductAmount] = useState('');
  const [deductReason, setDeductReason] = useState('');
  const [deductReminder, setDeductReminder] = useState<string | null>(null);
  const [reminderConfirmed, setReminderConfirmed] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [queueRes, streakRes, txRes, reminderRes, missionRes, seedsRes, savingsRes] = await Promise.all([
      supabase
        .from('approval_queue')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false }),
      supabase
        .from('streaks')
        .select('*'),
      supabase
        .from('point_transactions')
        .select('amount, note')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('parenting_reminders')
        .select('message')
        .eq('is_active', true),
      supabase
        .from('parent_missions')
        .select('*')
        .order('week_number', { ascending: true }),
      supabase
        .from('seeds')
        .select('seed_type, invested_amount, harvest_date')
        .eq('juwoo_id', 1)
        .in('status', ['growing', 'ready']),
      supabase
        .from('savings_account')
        .select('balance')
        .eq('juwoo_id', 1)
        .single(),
    ]);

    setApprovalQueue(queueRes.data ?? []);
    setStreaks(streakRes.data ?? []);
    setMissions(missionRes.data ?? []);

    if (txRes.data) {
      const earned = txRes.data.filter(t => (t.amount ?? 0) > 0).reduce((s, t) => s + (t.amount ?? 0), 0);
      const spent = Math.abs(txRes.data.filter(t => (t.amount ?? 0) < 0).reduce((s, t) => s + (t.amount ?? 0), 0));
      setWeeklyStats({ earned, spent, attempts: txRes.data.length });

      // 투자 관련 주간 통계
      const weeklyInterest = txRes.data
        .filter(t => (t as any).note?.includes('이자'))
        .reduce((s, t) => s + (t.amount ?? 0), 0);
      const weeklyPlanted = txRes.data
        .filter(t => (t as any).note?.includes('씨앗 심기'))
        .reduce((s, t) => s + Math.abs(t.amount ?? 0), 0);

      setInvestSummary({
        activeSeeds: seedsRes.data ?? [],
        savingsBalance: savingsRes.data?.balance ?? 0,
        weeklyInterest,
        weeklyPlanted,
      });
    }

    setReminders((reminderRes.data ?? []).map(r => r.message));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime for new approval requests
  useEffect(() => {
    const channel = supabase
      .channel('parent-approval-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'approval_queue',
          filter: 'status=eq.pending',
        },
        (payload) => {
          const newItem = payload.new as ApprovalItem;
          toast(`${newItem.description} — ${newItem.worldview_message ?? ''}`);
          setApprovalQueue(prev => [newItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (item: ApprovalItem) => {
    setProcessing(item.id);

    // Update approval status
    const { error: updateError } = await supabase
      .from('approval_queue')
      .update({
        status: 'approved',
        responded_at: new Date().toISOString(),
        responded_by: user?.id ?? null,
      })
      .eq('id', item.id);

    if (updateError) {
      toast.error('승인 처리에 오류가 발생했어요');
      setProcessing(null);
      return;
    }

    // Update reference table if applicable
    if (item.reference_table && item.reference_id) {
      const updatePayload: Record<string, unknown> = {
        status: 'approved',
        approved_by: user?.id ?? null,
        approved_at: new Date().toISOString(),
      };

      await supabase
        .from(item.reference_table)
        .update(updatePayload)
        .eq('id', item.reference_id);
    }

    // Award points
    if (item.point_amount > 0) {
      const result = await adjustPoints({
        amount: item.point_amount,
        note: item.description,
      });

      if (!result.success) {
        toast.error(result.error ?? '포인트 적립 오류');
      }
    }

    setApprovalQueue(prev => prev.filter(q => q.id !== item.id));
    confetti({ particleCount: 30, spread: 60 });
    toast.success(`"${item.description}" 승인 완료! 주우가 스스로 요청했어요!`);
    setProcessing(null);
  };

  const handleReject = async (item: ApprovalItem) => {
    setProcessing(item.id);

    await supabase
      .from('approval_queue')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString(),
        responded_by: user?.id ?? null,
      })
      .eq('id', item.id);

    if (item.reference_table && item.reference_id) {
      await supabase
        .from(item.reference_table)
        .update({ status: 'rejected' })
        .eq('id', item.reference_id);
    }

    setApprovalQueue(prev => prev.filter(q => q.id !== item.id));
    toast('다시 해보자!');
    setProcessing(null);
  };

  const handleCompleteMission = async (mission: ParentMission) => {
    setMissionProcessing(mission.id);

    const { error } = await supabase
      .from('parent_missions')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', mission.id);

    if (error) {
      toast.error('미션 완료 처리에 오류가 발생했어요');
      setMissionProcessing(null);
      return;
    }

    // Award bonus points
    const result = await adjustPoints({
      amount: mission.bonus_points,
      note: `아빠와 함께 미션: ${mission.title}`,
    });

    if (result.success) {
      confetti({ particleCount: 80, spread: 100 });
      toast.success(`탐험대 합동 미션 완료! +${mission.bonus_points.toLocaleString()} 에너지!`);
    }

    setMissionProcessing(null);
    setMissions((prev) =>
      prev.map((m) =>
        m.id === mission.id ? { ...m, is_completed: true, completed_at: new Date().toISOString() } : m
      )
    );
  };

  const openDeductDialog = () => {
    // Show random reminder
    if (reminders.length > 0) {
      setDeductReminder(reminders[Math.floor(Math.random() * reminders.length)]);
    }
    setReminderConfirmed(false);
    setDeductAmount('');
    setDeductReason('');
    setShowDeductDialog(true);
  };

  const handleDeduct = async () => {
    const amount = parseInt(deductAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('유효한 금액을 입력해주세요');
      return;
    }
    if (!deductReason.trim()) {
      toast.error('사유를 입력해주세요');
      return;
    }

    const result = await adjustPoints({
      amount: -amount,
      note: `포인트 차감: ${deductReason}`,
    });

    if (result.success) {
      // Log in approval queue for tracking
      await supabase.from('approval_queue').insert({
        request_type: 'deduction',
        description: `포인트 차감: ${deductReason}`,
        worldview_message: '포인트 차감',
        point_amount: -amount,
        status: 'approved',
        responded_by: user?.id ?? null,
        responded_at: new Date().toISOString(),
        deduction_reason: deductReason,
      });

      toast.success(`${amount.toLocaleString()} 포인트 차감 완료`);
      setShowDeductDialog(false);
    } else {
      toast.error(result.error ?? '차감 오류');
    }
  };

  const streakLabels: Record<string, string> = {
    routine_morning: '아침 루틴',
    routine_evening: '저녁 루틴',
    sleep: '수면',
    reading: '독서',
    exercise: '운동',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-slate-500 border-t-transparent rounded-full"
        />
        <p className="text-slate-500 mt-4 text-lg font-medium">대시보드를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-slate-50">
      <div className="px-4 pt-4 space-y-5 max-w-2xl mx-auto">
        {/* 뒤로가기 */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Button>
        </Link>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-slate-800 mb-1">카이 대시보드</h1>
          <p className="text-slate-500">승인 대기열 + 성장 분석 + 양육 팁</p>
        </motion.div>

        {/* 1. 승인 대기열 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            승인 대기열 ({approvalQueue.length})
          </h2>

          {approvalQueue.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-5 text-center">
                <p className="text-slate-400" style={{ fontSize: 16 }}>
                  대기 중인 요청이 없어요
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {approvalQueue.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800" style={{ fontSize: 16 }}>
                          {item.description}
                        </p>
                        {item.worldview_message && (
                          <p className="text-sm text-indigo-500">{item.worldview_message}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          주우가 스스로 요청했어요!
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {item.point_amount > 0 && (
                          <p className="font-bold text-green-600 mb-1">
                            +{item.point_amount.toLocaleString()}
                          </p>
                        )}
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            style={{ minHeight: 40 }}
                            disabled={processing === item.id}
                            onClick={() => handleApprove(item)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-gray-500"
                            style={{ minHeight: 40 }}
                            disabled={processing === item.id}
                            onClick={() => handleReject(item)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* 2. 이번 주 성장 포인트 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            이번 주 성장
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-slate-500">시도 횟수</p>
                <div className="text-2xl font-black text-indigo-600">{weeklyStats.attempts}번</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-slate-500">충전 에너지</p>
                <div className="text-2xl font-black text-green-600">{weeklyStats.earned.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-slate-500">소모 에너지</p>
                <div className="text-2xl font-black text-gray-500">{weeklyStats.spent.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* 2.5 투자 현황 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-500" />
            투자 현황
          </h2>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4 space-y-3">
              {/* 금고 잔액 */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏦</span>
                  <span className="text-sm font-medium text-slate-700">금고 잔액</span>
                </div>
                <span className="font-bold text-blue-600">
                  {investSummary.savingsBalance.toLocaleString()}포인트
                </span>
              </div>

              {/* 이번 주 이자 */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span className="text-sm font-medium text-slate-700">이번 주 이자</span>
                </div>
                <span className="font-bold text-emerald-600">
                  +{investSummary.weeklyInterest.toLocaleString()}포인트
                </span>
              </div>

              {/* 심어진 씨앗 */}
              {investSummary.activeSeeds.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    자라고 있는 씨앗 ({investSummary.activeSeeds.length}개)
                  </p>
                  <div className="space-y-1.5">
                    {investSummary.activeSeeds.map((seed, i) => {
                      const seedIcons: Record<string, string> = {
                        sunflower: "🌻", tree: "🌳", clover: "🍀",
                        rose: "🌹", bamboo: "🎋", rainbow: "🌈",
                      };
                      const harvestDate = new Date(seed.harvest_date);
                      const daysLeft = Math.max(0, Math.ceil(
                        (harvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      ));
                      return (
                        <div key={i} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                          <span>
                            {seedIcons[seed.seed_type] ?? "🌱"} {seed.invested_amount}포인트
                          </span>
                          <span className="text-slate-500">
                            {daysLeft > 0
                              ? `D-${daysLeft} (${harvestDate.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })})`
                              : "수확 가능!"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-2">
                  현재 심어진 씨앗이 없어요
                </p>
              )}

              {/* 주간 리포트 요약 */}
              {investSummary.weeklyPlanted > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700">
                    📊 주우가 이번 주 {investSummary.weeklyPlanted.toLocaleString()}포인트를 씨앗밭에 심었어요
                  </p>
                </div>
              )}

              {/* 임상 보고서 연동 */}
              <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                <p className="text-xs text-violet-600 leading-relaxed">
                  💡 돈과 에너지의 통제 모델링 — 아버님이 자신의 욕구를 조절하고 절제하는 모습을 보여주는 것만으로도 큰 교육이 됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2.6 아빠와 함께 미션 */}
        {missions.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              아빠와 함께 미션
            </h2>
            <div className="space-y-2">
              {missions.map((mission) => (
                <Card key={mission.id} className={`border-0 shadow-sm rounded-xl ${mission.is_completed ? 'bg-amber-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        mission.is_completed ? 'bg-amber-100' : 'bg-slate-100'
                      }`}>
                        <span className="text-lg">
                          {mission.mission_type === 'exercise' ? '💪' : mission.mission_type === 'reading' ? '📖' : '🌟'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800" style={{ fontSize: 16 }}>
                          {mission.title}
                        </p>
                        <p className="text-sm text-slate-500">{mission.description}</p>
                        {mission.worldview_label && (
                          <p className="text-xs text-indigo-500 mt-0.5">{mission.worldview_label}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-amber-600 mb-1">
                          +{mission.bonus_points.toLocaleString()}
                        </p>
                        {mission.is_completed ? (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Check className="h-4 w-4" />
                            <span className="text-xs font-bold">완료!</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                            style={{ minHeight: 36 }}
                            disabled={missionProcessing === mission.id}
                            onClick={() => handleCompleteMission(mission)}
                          >
                            완료
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. 차감 (Track C) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gray-500" />
            포인트 차감
          </h2>
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-600"
            style={{ minHeight: 48, fontSize: 16 }}
            onClick={openDeductDialog}
          >
            <Minus className="h-4 w-4 mr-2" />
            차감 입력
          </Button>
        </motion.div>

        {/* 4. 스트릭 현황 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            {WORLDVIEW.streak} 현황
          </h2>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {streaks.map((s) => (
                  <div key={s.streak_type} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <Flame className={`h-5 w-5 ${s.current_count > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {streakLabels[s.streak_type] ?? s.streak_type}
                      </p>
                      <p className="text-xs text-slate-400">
                        현재 {s.current_count}일 / 최고 {s.best_count}일
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 5. 양육 팁 */}
        {reminders.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              양육 팁
            </h2>
            <Card className="border-0 shadow-sm rounded-xl bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {reminders[Math.floor(Math.random() * reminders.length)]}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* 차감 Dialog */}
      <Dialog open={showDeductDialog} onOpenChange={setShowDeductDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-500" />
              포인트 차감
            </DialogTitle>
            <DialogDescription>
              꼭 필요한 차감인지 한번 더 생각해주세요.
            </DialogDescription>
          </DialogHeader>

          {/* 리마인더 */}
          {deductReminder && !reminderConfirmed && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    {deductReminder}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReminderConfirmed(true)}
                  >
                    확인했어요, 계속할게요
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(!deductReminder || reminderConfirmed) && (
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-base font-semibold">차감 금액</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(e.target.value)}
                  className="mt-2 text-lg"
                />
              </div>
              <div>
                <Label className="text-base font-semibold">사유</Label>
                <Input
                  placeholder="예: 떼쓰기"
                  value={deductReason}
                  onChange={(e) => setDeductReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeductDialog(false)}>
              취소
            </Button>
            {(!deductReminder || reminderConfirmed) && (
              <Button
                onClick={handleDeduct}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                차감 실행
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
