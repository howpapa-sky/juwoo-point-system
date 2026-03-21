import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Package, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Worry {
  id: number;
  content: string;
  emoji: string;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

const WORRY_EMOJIS = ['😟', '😰', '😢', '😔', '🤔', '😤', '😨'];

export default function WorryBox() {
  const [worries, setWorries] = useState<Worry[]>([]);
  const [newWorry, setNewWorry] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😟');
  const [submitting, setSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorries = useCallback(async () => {
    const { data, error } = await supabase
      .from('worry_box')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWorries(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWorries();
  }, [fetchWorries]);

  const handleSubmit = async () => {
    if (!newWorry.trim() || submitting) return;

    setSubmitting(true);

    const { data, error } = await supabase
      .from('worry_box')
      .insert({
        content: newWorry.trim(),
        emoji: selectedEmoji,
      })
      .select()
      .single();

    if (error) {
      toast.error('걱정을 저장하지 못했어요');
      setSubmitting(false);
      return;
    }

    // Show box animation
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
      setWorries((prev) => [data, ...prev]);
      setNewWorry('');
      setSelectedEmoji('😟');
      toast.success('걱정을 상자에 넣었어요. 이제 마음이 조금 편해질 거예요.');
    }, 1200);

    setSubmitting(false);
  };

  const handleResolve = async (worry: Worry) => {
    const { error } = await supabase
      .from('worry_box')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', worry.id);

    if (error) {
      toast.error('업데이트에 오류가 발생했어요');
      return;
    }

    setWorries((prev) =>
      prev.map((w) =>
        w.id === worry.id
          ? { ...w, is_resolved: true, resolved_at: new Date().toISOString() }
          : w
      )
    );
    toast.success('걱정이 해결됐어요! 대단해!');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const unresolvedWorries = worries.filter((w) => !w.is_resolved);
  const resolvedWorries = worries.filter((w) => w.is_resolved);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-200 rounded-full animate-spin border-t-cyan-600 mx-auto" />
          <p className="text-gray-500 mt-4" style={{ fontSize: 16 }}>
            걱정상자를 여는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-gradient-to-b from-cyan-50 to-blue-50">
      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
        </div>

        {/* 타이틀 */}
        <div className="text-center">
          <div className="text-5xl mb-3">📦</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">걱정상자</h1>
          <p className="text-gray-500" style={{ fontSize: 16 }}>
            걱정되는 것을 적어서 상자에 넣어봐
          </p>
        </div>

        {/* 입력 영역 */}
        <Card className="border-2 border-cyan-200 shadow-lg">
          <CardContent className="p-5 space-y-4">
            {/* 이모지 선택 */}
            <div className="flex gap-2 justify-center">
              {WORRY_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className={`text-2xl p-1.5 rounded-lg transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-cyan-100 scale-110 ring-2 ring-cyan-400'
                      : 'hover:bg-gray-100'
                  }`}
                  style={{ minWidth: 48, minHeight: 48 }}
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* 텍스트 입력 */}
            <Textarea
              value={newWorry}
              onChange={(e) => setNewWorry(e.target.value)}
              placeholder="오늘 걱정되는 것을 적어봐"
              rows={3}
              className="text-base resize-none"
              style={{ fontSize: 16 }}
            />

            {/* 제출 버튼 */}
            <Button
              className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              style={{ minHeight: 48, fontSize: 16 }}
              disabled={!newWorry.trim() || submitting}
              onClick={handleSubmit}
            >
              <Package className="h-5 w-5 mr-2" />
              상자에 넣기
            </Button>
          </CardContent>
        </Card>

        {/* 넣기 애니메이션 */}
        <AnimatePresence>
          {showAnimation && (
            <motion.div
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: 100, scale: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-6xl">📝</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 이전 걱정 목록 */}
        {unresolvedWorries.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-700" style={{ fontSize: 18 }}>
              상자 안의 걱정들 ({unresolvedWorries.length})
            </h2>
            {unresolvedWorries.map((worry) => (
              <motion.div
                key={worry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === worry.id ? null : worry.id)
                      }
                    >
                      <span className="text-xl flex-shrink-0">{worry.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-gray-700 ${
                            expandedId === worry.id ? '' : 'line-clamp-1'
                          }`}
                          style={{ fontSize: 16 }}
                        >
                          {worry.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(worry.created_at)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {expandedId === worry.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === worry.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t">
                            <Button
                              size="sm"
                              className="w-full bg-green-500 hover:bg-green-600 text-white"
                              style={{ minHeight: 48, fontSize: 16 }}
                              onClick={() => handleResolve(worry)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              해결됐어요!
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* 해결된 걱정 */}
        {resolvedWorries.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-700" style={{ fontSize: 18 }}>
              해결한 걱정들 ({resolvedWorries.length})
            </h2>
            {resolvedWorries.slice(0, 5).map((worry) => (
              <Card key={worry.id} className="border border-green-100 bg-green-50/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-gray-500 line-clamp-1 flex-1">
                      {worry.content}
                    </p>
                    <span className="text-xs text-green-500 flex-shrink-0">해결!</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
