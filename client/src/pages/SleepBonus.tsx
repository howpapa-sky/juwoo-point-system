import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Moon, Clock, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { adjustPoints } from '@/lib/pointsHelper';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

function getKSTDate(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

interface TimeOption {
  label: string;
  time: string;
  points: number;
  message: string;
  emoji: string;
}

const TIME_OPTIONS: TimeOption[] = [
  { label: '21:00 전', time: '21:00', points: 1500, message: '탐험대원 최고 충전!', emoji: '🌟' },
  { label: '21:30 전', time: '21:30', points: 1000, message: '좋은 충전!', emoji: '⭐' },
  { label: '22:00 전', time: '22:00', points: 500, message: '기본 충전 완료', emoji: '🌙' },
  { label: '22:00 이후', time: '22:01', points: 0, message: '내일 탐험을 위해 푹 자자', emoji: '💤' },
];

export default function SleepBonus() {
  const { user } = useSupabaseAuth();
  const [selectedTime, setSelectedTime] = useState<TimeOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const todayDate = getKSTDate();

  const handleSubmit = async () => {
    if (!selectedTime || submitting) return;

    setSubmitting(true);

    // Check if already submitted today
    const { data: existing } = await supabase
      .from('sleep_records')
      .select('id')
      .eq('record_date', todayDate)
      .single();

    if (existing) {
      toast.error('오늘은 이미 기록했어요!');
      setSubmitting(false);
      return;
    }

    // Insert sleep record
    const { error: sleepError } = await supabase.from('sleep_records').insert({
      record_date: todayDate,
      bedtime: selectedTime.time,
      bonus_points: selectedTime.points,
      approved_by: user?.id ?? null,
    });

    if (sleepError) {
      toast.error('기록에 오류가 발생했어요');
      setSubmitting(false);
      return;
    }

    // Award points if > 0
    if (selectedTime.points > 0) {
      const result = await adjustPoints({
        amount: selectedTime.points,
        note: `수면 보너스: ${selectedTime.label}`,
      });

      if (result.success) {
        confetti({ particleCount: 50, spread: 60 });
        toast.success(`+${selectedTime.points.toLocaleString()} 탐험 에너지!`);
      } else {
        toast.error(result.error ?? '포인트 적립에 오류가 발생했어요');
      }
    } else {
      toast.success(selectedTime.message);
    }

    // Insert approval queue record
    await supabase.from('approval_queue').insert({
      request_type: 'sleep',
      reference_table: 'sleep_records',
      description: `취침: ${selectedTime.label}`,
      worldview_message: '충전 모드 진입!',
      point_amount: selectedTime.points,
      status: 'approved',
    });

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">{selectedTime?.emoji ?? '🌙'}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{selectedTime?.message}</h2>
          {(selectedTime?.points ?? 0) > 0 && (
            <p className="text-indigo-200 text-lg mb-6">
              +{selectedTime?.points.toLocaleString()} 탐험 에너지
            </p>
          )}
          <Link href="/">
            <Button className="bg-white text-indigo-900 hover:bg-white/90" style={{ minHeight: 48, fontSize: 16 }}>
              홈으로 돌아가기
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-gradient-to-b from-indigo-900 to-purple-900">
      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Link href="/routine">
            <Button variant="ghost" size="sm" className="gap-2 text-white/80 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              루틴으로
            </Button>
          </Link>
        </div>

        {/* 타이틀 */}
        <div className="text-center">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="text-3xl font-bold text-white mb-2">충전 모드</h1>
          <p className="text-indigo-200" style={{ fontSize: 16 }}>
            오늘 몇 시에 잠자리에 들었나요?
          </p>
        </div>

        {/* 시간 선택 */}
        <div className="space-y-3">
          {TIME_OPTIONS.map((option) => (
            <motion.div key={option.time} whileTap={{ scale: 0.97 }}>
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedTime?.time === option.time
                    ? 'border-indigo-400 bg-indigo-900/50 shadow-lg shadow-indigo-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setSelectedTime(option)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{option.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white" style={{ fontSize: 18 }}>
                        {option.label}
                      </h3>
                      <p className="text-sm text-indigo-200">{option.message}</p>
                    </div>
                    {option.points > 0 && (
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/30 rounded-full">
                        <Zap className="h-4 w-4 text-amber-300" />
                        <span className="font-bold text-amber-200" style={{ fontSize: 16 }}>
                          +{option.points.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 제출 */}
        <Button
          className="w-full h-14 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          style={{ minHeight: 48, fontSize: 18 }}
          disabled={!selectedTime || submitting}
          onClick={handleSubmit}
        >
          {submitting ? '기록 중...' : '기록하기'}
        </Button>
      </div>
    </div>
  );
}
