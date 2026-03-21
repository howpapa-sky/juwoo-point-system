import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, BookOpen, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { WORLDVIEW } from '@/lib/designTokens';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface Book {
  id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_emoji: string;
  category: string;
  total_pages: number | null;
  source: string;
  registered_at: string;
  is_completed?: boolean;
}

const COVER_EMOJIS = ['📖', '📕', '📗', '📘', '📙', '📓', '📔', '🌍'];

const SOURCE_OPTIONS = [
  { value: 'home', label: '집' },
  { value: 'school_library', label: '학교 도서관' },
  { value: 'public_library', label: '공공 도서관' },
  { value: 'gift', label: '선물' },
];

function getKSTDate(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

export default function MyBookshelf() {
  const { user } = useSupabaseAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [completedBookIds, setCompletedBookIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📖');
  const [selectedSource, setSelectedSource] = useState('home');
  const [totalPages, setTotalPages] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);

    const [booksRes, logsRes] = await Promise.all([
      supabase
        .from('my_bookshelf')
        .select('*')
        .order('registered_at', { ascending: false }),
      supabase
        .from('reading_logs')
        .select('book_id')
        .eq('is_completed', true),
    ]);

    if (booksRes.error) {
      toast.error('책장을 불러오지 못했어요');
    } else {
      setBooks(booksRes.data ?? []);
    }

    if (logsRes.data) {
      const ids = new Set(logsRes.data.map((l) => l.book_id).filter(Boolean) as number[]);
      setCompletedBookIds(ids);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleRegister = async () => {
    if (!title.trim()) {
      toast.error('책 제목을 입력해주세요');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('my_bookshelf').insert({
      title: title.trim(),
      author: author.trim() || null,
      isbn: isbn.trim() || null,
      cover_emoji: selectedEmoji,
      source: selectedSource,
      total_pages: totalPages ? parseInt(totalPages) : null,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('이미 등록된 책이에요');
      } else {
        toast.error('등록에 오류가 발생했어요');
      }
      setSubmitting(false);
      return;
    }

    // Check badge for books_count
    const { count } = await supabase
      .from('my_bookshelf')
      .select('*', { count: 'exact', head: true });

    if (count !== null) {
      const { data: badges } = await supabase
        .from('activity_badges')
        .select('*')
        .eq('badge_type', 'reading')
        .eq('requirement_type', 'books_count')
        .eq('is_earned', false)
        .lte('requirement_value', count);

      if (badges && badges.length > 0) {
        for (const badge of badges) {
          await supabase
            .from('activity_badges')
            .update({ is_earned: true, earned_at: new Date().toISOString() })
            .eq('id', badge.id);

          toast.success(`새로운 탐험 훈장! ${badge.emoji} ${badge.name}`);
        }
      }
    }

    confetti({ particleCount: 50, spread: 60 });
    toast.success('새로운 행성 발견!');

    // Reset form
    setTitle('');
    setAuthor('');
    setIsbn('');
    setSelectedEmoji('📖');
    setSelectedSource('home');
    setTotalPages('');
    setShowRegister(false);
    setSubmitting(false);

    fetchBooks();
  };

  const totalBooks = books.length;
  const completedBooks = books.filter((b) => completedBookIds.has(b.id)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-4" style={{ fontSize: 16 }}>
            책장을 불러오는 중...
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
            <span className="text-sm font-bold text-indigo-700">{WORLDVIEW.reading}</span>
          </div>
        </div>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-slate-800 mb-1">나의 책장</h1>
          <p className="text-slate-500">발견한 행성들을 모아보자!</p>
        </motion.div>

        {/* 통계 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">등록한 행성</p>
                  <p className="text-3xl font-black">{totalBooks}권</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm">탐사 완료</p>
                  <p className="text-3xl font-black">{completedBooks}권</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 새 행성 발견 버튼 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base"
            style={{ minHeight: 48 }}
            onClick={() => setShowRegister(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            새 행성 발견!
          </Button>
        </motion.div>

        {/* 책 목록 */}
        {books.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="text-5xl mb-4">🔭</div>
                <p className="text-slate-500" style={{ fontSize: 16 }}>
                  아직 발견한 행성이 없어요.
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  책을 읽고 등록해보자!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {books.map((book, index) => {
              const isCompleted = completedBookIds.has(book.id);
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`border-2 transition-all ${
                      isCompleted
                        ? 'border-amber-400 shadow-lg shadow-amber-100'
                        : 'border-gray-200'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">{book.cover_emoji}</div>
                      <h3
                        className="font-bold text-slate-800 line-clamp-2 mb-1"
                        style={{ fontSize: 16 }}
                      >
                        {book.title}
                      </h3>
                      {book.author && (
                        <p className="text-sm text-slate-400 mb-2 truncate">
                          {book.author}
                        </p>
                      )}
                      <p className="text-sm text-slate-400">
                        {new Date(book.registered_at).toLocaleDateString('ko-KR')}
                      </p>
                      {isCompleted && (
                        <div className="flex items-center justify-center gap-1 mt-2 text-amber-600">
                          <Check className="h-3.5 w-3.5" />
                          <span className="text-sm font-bold">탐사 완료!</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 책 등록 Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              새 행성 발견!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 제목 */}
            <div>
              <Label className="text-base font-semibold">책 제목 *</Label>
              <Input
                placeholder="책 제목을 입력해주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 text-base"
                style={{ fontSize: 16 }}
              />
            </div>

            {/* 저자 */}
            <div>
              <Label className="text-base font-semibold">저자</Label>
              <Input
                placeholder="저자 (선택)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-2"
                style={{ fontSize: 16 }}
              />
            </div>

            {/* ISBN */}
            <div>
              <Label className="text-base font-semibold">ISBN</Label>
              <Input
                placeholder="ISBN (선택)"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="mt-2"
                style={{ fontSize: 16 }}
              />
            </div>

            {/* 표지 이모지 */}
            <div>
              <Label className="text-base font-semibold">표지 이모지</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {COVER_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${
                      selectedEmoji === emoji
                        ? 'border-indigo-500 bg-indigo-50 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ minWidth: 48, minHeight: 48 }}
                    onClick={() => setSelectedEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 출처 */}
            <div>
              <Label className="text-base font-semibold">출처</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {SOURCE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={selectedSource === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full ${
                      selectedSource === opt.value
                        ? 'bg-indigo-600 text-white'
                        : ''
                    }`}
                    style={{ minHeight: 40 }}
                    onClick={() => setSelectedSource(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 총 페이지 */}
            <div>
              <Label className="text-base font-semibold">총 페이지 수</Label>
              <Input
                type="number"
                placeholder="페이지 수 (선택)"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className="mt-2"
                style={{ fontSize: 16 }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegister(false)}>
              취소
            </Button>
            <Button
              onClick={handleRegister}
              disabled={submitting || !title.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {submitting ? '등록 중...' : '행성 등록!'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
