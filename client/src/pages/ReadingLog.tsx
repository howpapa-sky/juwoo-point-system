import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Check,
  Minus,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { adjustPoints } from '@/lib/pointsHelper';
import { WORLDVIEW } from '@/lib/designTokens';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface Book {
  id: number;
  title: string;
  author: string | null;
  cover_emoji: string;
}

interface ReadingLogEntry {
  id: number;
  book_id: number;
  reading_date: string;
  minutes_read: number;
  pages_read: number;
  is_completed: boolean;
  memo: string | null;
  status: string;
  points_earned: number;
}

function getKSTDate(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

function calculateReadingPoints(minutes: number): number {
  if (minutes >= 60) return 1200;
  if (minutes >= 30) return 800;
  if (minutes >= 15) return 400;
  return 200;
}

export default function ReadingLog() {
  const { user } = useSupabaseAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [todayLogs, setTodayLogs] = useState<ReadingLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [minutes, setMinutes] = useState(30);
  const [pagesRead, setPagesRead] = useState(0);
  const [memo, setMemo] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const todayDate = getKSTDate();

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [booksRes, logsRes] = await Promise.all([
      supabase
        .from('my_bookshelf')
        .select('id, title, author, cover_emoji')
        .order('registered_at', { ascending: false }),
      supabase
        .from('reading_logs')
        .select('*')
        .eq('reading_date', todayDate)
        .order('created_at', { ascending: false }),
    ]);

    setBooks(booksRes.data ?? []);
    setTodayLogs(logsRes.data ?? []);
    setLoading(false);
  }, [todayDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!selectedBookId) {
      toast.error('책을 선택해주세요');
      return;
    }
    if (minutes <= 0) {
      toast.error('읽은 시간을 입력해주세요');
      return;
    }

    setSubmitting(true);

    const basePoints = calculateReadingPoints(minutes);
    const completionBonus = isCompleted ? 500 : 0;
    const memoBonus = memo.trim() ? 100 : 0;
    const totalPoints = basePoints + completionBonus + memoBonus;

    // Insert reading log
    const { data: logData, error: logError } = await supabase
      .from('reading_logs')
      .insert({
        book_id: selectedBookId,
        reading_date: todayDate,
        minutes_read: minutes,
        pages_read: pagesRead > 0 ? pagesRead : 0,
        is_completed: isCompleted,
        memo: memo.trim() || null,
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

    // Insert into approval_queue
    const selectedBook = books.find((b) => b.id === selectedBookId);
    const description = `독서: ${selectedBook?.title ?? '책'} ${minutes}분${isCompleted ? ' (완독!)' : ''}`;

    const { error: approvalError } = await supabase
      .from('approval_queue')
      .insert({
        request_type: 'reading',
        reference_id: logData.id,
        reference_table: 'reading_logs',
        description,
        worldview_message: `${WORLDVIEW.reading} — 행성 탐사 기록!`,
        point_amount: totalPoints,
        status: 'pending',
      });

    if (approvalError) {
      toast.error('승인 요청에 오류가 발생했어요');
    } else {
      // Auto-award completion bonus (no approval needed)
      if (isCompleted) {
        confetti({ particleCount: 80, spread: 100 });
        toast.success(`탐사 완료! 완독 보너스 +500 포인트!`);
      }

      if (memoBonus > 0) {
        toast.success('한 줄 감상 보너스 +100 포인트!');
      }

      toast.success(`"${selectedBook?.title}" 탐사 기록 승인 대기 중!`);
    }

    // Update streak
    await updateReadingStreak();

    // Reset form
    setSelectedBookId(null);
    setMinutes(30);
    setPagesRead(0);
    setMemo('');
    setIsCompleted(false);
    setSubmitting(false);

    fetchData();
  };

  const updateReadingStreak = async () => {
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('streak_type', 'reading')
      .single();

    const today = getKSTDate();

    if (streak) {
      const lastDate = streak.last_completed_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCount = streak.current_count ?? 0;

      if (lastDate === today) {
        // Already counted today
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
        .eq('streak_type', 'reading');

      // 7-day streak bonus
      if (newCount === 7) {
        await adjustPoints({ amount: 2000, note: '7일 연속 독서 보너스!' });
        confetti({ particleCount: 100, spread: 120 });
        toast.success('7일 연속 독서! +2,000 탐험 에너지!');
      }

      // Check streak badges
      const { data: badges } = await supabase
        .from('activity_badges')
        .select('*')
        .eq('badge_type', 'reading')
        .eq('requirement_type', 'reading_streak')
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
      // Create streak if not exists
      await supabase.from('streaks').insert({
        streak_type: 'reading',
        current_count: 1,
        best_count: 1,
        last_completed_date: today,
      });
    }
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const estimatedPoints = selectedBookId
    ? calculateReadingPoints(minutes) + (isCompleted ? 500 : 0) + (memo.trim() ? 100 : 0)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-4" style={{ fontSize: 16 }}>
            불러오는 중...
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
            <BookOpen className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-700">독서 기록</span>
          </div>
        </div>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-slate-800 mb-1">행성 탐사 기록</h1>
          <p className="text-slate-500">오늘 읽은 책을 기록하세요!</p>
        </motion.div>

        {/* 책 선택 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Label className="text-base font-semibold text-slate-700 mb-2 block">
            어떤 행성을 탐사했나요?
          </Label>
          {books.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-4 text-center">
                <p className="text-slate-400" style={{ fontSize: 16 }}>
                  먼저 책장에 책을 등록해주세요
                </p>
                <Link href="/my-bookshelf">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    style={{ minHeight: 40 }}
                  >
                    책장으로 이동
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {books.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    selectedBookId === book.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  style={{ minHeight: 48 }}
                  onClick={() => setSelectedBookId(book.id)}
                >
                  <div className="text-2xl mb-1">{book.cover_emoji}</div>
                  <p className="text-sm font-bold text-slate-700 line-clamp-2">
                    {book.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* 읽은 시간 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Label className="text-base font-semibold text-slate-700 mb-2 block">
            <Clock className="h-4 w-4 inline mr-1" />
            읽은 시간 (분)
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
            <div className="text-4xl font-black text-indigo-600 w-20 text-center">
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
                  minutes === v ? 'bg-indigo-600 text-white' : ''
                }`}
                onClick={() => setMinutes(v)}
              >
                {v}분
              </Button>
            ))}
          </div>
        </motion.div>

        {/* 읽은 페이지 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Label className="text-base font-semibold text-slate-700 mb-2 block">
            읽은 페이지 수 (선택)
          </Label>
          <Input
            type="number"
            placeholder="0"
            value={pagesRead ?? ''}
            onChange={(e) => setPagesRead(parseInt(e.target.value) || 0)}
            className="text-center text-lg"
            style={{ fontSize: 16 }}
          />
        </motion.div>

        {/* 한 줄 감상 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Label className="text-base font-semibold text-slate-700 mb-2 block">
            <MessageSquare className="h-4 w-4 inline mr-1" />
            한 줄 감상 (+100 포인트)
          </Label>
          <Input
            placeholder="이 책에서 뭐가 재밌었어?"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="text-base"
            style={{ fontSize: 16 }}
          />
        </motion.div>

        {/* 완독 체크 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              isCompleted
                ? 'border-amber-400 bg-amber-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            style={{ minHeight: 48 }}
            onClick={() => setIsCompleted(!isCompleted)}
          >
            <div
              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                isCompleted
                  ? 'border-amber-500 bg-amber-500'
                  : 'border-gray-300'
              }`}
            >
              {isCompleted && <Check className="h-5 w-5 text-white" />}
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800" style={{ fontSize: 16 }}>
                이 책 완독했어요!
              </p>
              <p className="text-sm text-slate-500">완독 보너스 +500 포인트</p>
            </div>
          </button>
        </motion.div>

        {/* 예상 포인트 + 제출 */}
        {selectedBookId && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-3"
          >
            <Card className="border-0 bg-indigo-50 rounded-xl">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-indigo-600 font-medium">예상 포인트</p>
                <p className="text-2xl font-black text-indigo-700">
                  +{estimatedPoints.toLocaleString()} E
                </p>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base"
              style={{ minHeight: 48 }}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? '기록 중...' : '탐사 기록!'}
            </Button>
          </motion.div>
        )}

        {/* 오늘의 기록 */}
        {todayLogs.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-bold text-slate-800 mb-3">오늘의 탐사 기록</h2>
            <div className="space-y-2">
              {todayLogs.map((log) => {
                const book = books.find((b) => b.id === log.book_id);
                return (
                  <Card key={log.id} className="border-0 shadow-sm rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{book?.cover_emoji ?? '📖'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800" style={{ fontSize: 16 }}>
                            {book?.title ?? '알 수 없는 책'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {log.minutes_read}분 읽음
                            {log.is_completed && ' · 완독!'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600">
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
