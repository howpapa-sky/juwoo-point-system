import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Volume2,
  Coins,
  PartyPopper,
  RefreshCw,
  ThumbsUp,
  HelpCircle,
} from 'lucide-react';
import { useSRS, type WordSRS } from '@/hooks/useSRS';
import { useXP } from '@/hooks/useXP';
import { useSessionLog } from '@/hooks/useSessionLog';
import { usePronunciation } from '@/hooks/usePronunciation';
import { supabase } from '@/lib/supabaseClient';
import {
  randomMessage,
  CORRECT_MESSAGES,
  DONT_KNOW_MESSAGES,
} from '@/lib/englishConstants';

type Phase = 'loading' | 'review' | 'feedback' | 'done';

export default function EnglishReview() {
  const { reviewWords, loading: srsLoading, updateWord, reload } = useSRS();
  const { addXP, updateStreak } = useXP();
  const { startSession, logAnswer, endSession } = useSessionLog();
  const { speak } = usePronunciation();

  const [phase, setPhase] = useState<Phase>('loading');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbackResult, setFeedbackResult] = useState<'correct' | 'dont_know' | null>(null);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalDontKnow, setTotalDontKnow] = useState(0);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const sessionIdRef = useRef<number | null>(null);
  const words = useRef<WordSRS[]>([]);

  // Initialize session
  useEffect(() => {
    if (srsLoading) return;

    words.current = [...reviewWords];

    if (words.current.length === 0) {
      setPhase('done');
      return;
    }

    async function init() {
      const sid = await startSession('review');
      sessionIdRef.current = sid;
      await updateStreak();
      setPhase('review');
    }
    init();
    // Only run once after loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srsLoading]);

  const currentWord = words.current[currentIndex];
  const total = words.current.length;
  const progressPercent = total > 0 ? Math.round((currentIndex / total) * 100) : 0;

  const handleKnow = useCallback(async () => {
    if (!currentWord) return;

    await updateWord(currentWord.id, 'correct');

    const { xpGained } = await addXP('quiz_correct_easy');
    setTotalXPEarned((prev) => prev + xpGained);
    setTotalCoins((prev) => prev + 2);
    setTotalCorrect((prev) => prev + 1);

    if (sessionIdRef.current) {
      await logAnswer({
        sessionId: sessionIdRef.current,
        word: currentWord.word,
        questionType: 'review',
        isCorrect: true,
        usedDontKnow: false,
      });
    }

    setFeedbackResult('correct');
    setPhase('feedback');
  }, [currentWord, updateWord, addXP, logAnswer]);

  const handleDontKnow = useCallback(async () => {
    if (!currentWord) return;

    await updateWord(currentWord.id, 'dont_know');

    const { xpGained } = await addXP('quiz_dont_know');
    setTotalXPEarned((prev) => prev + xpGained);
    setTotalCoins((prev) => prev + 1);
    setTotalDontKnow((prev) => prev + 1);

    if (sessionIdRef.current) {
      await logAnswer({
        sessionId: sessionIdRef.current,
        word: currentWord.word,
        questionType: 'review',
        isCorrect: false,
        usedDontKnow: true,
      });
    }

    // TTS for learning
    speak(currentWord.word);

    setFeedbackResult('dont_know');
    setPhase('feedback');
  }, [currentWord, updateWord, addXP, logAnswer, speak]);

  const handleNext = useCallback(async () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= total) {
      // End session
      if (sessionIdRef.current) {
        await endSession(sessionIdRef.current, {
          totalCorrect,
          totalWrong: 0,
          totalDontKnow,
          guessingCount: 0,
          xpEarned: totalXPEarned,
          coinsEarned: totalCoins,
        });
      }

      // Award coins to juwoo_profile
      if (totalCoins > 0) {
        const { data: profile, error: profileErr } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        if (!profileErr && profile) {
          const newBalance = (profile.current_points ?? 0) + totalCoins;
          await supabase.from('point_transactions').insert({
            juwoo_id: 1,
            rule_id: null,
            amount: totalCoins,
            balance_after: newBalance,
            note: `영어 복습 보상 (${total}단어)`,
            created_by: 1,
          });
          await supabase.from('juwoo_profile').update({ current_points: newBalance }).eq('id', 1);
        }
      }

      await addXP('daily_review_completed');
      await reload();
      setPhase('done');
    } else {
      setCurrentIndex(nextIdx);
      setFeedbackResult(null);
      setPhase('review');
    }
  }, [currentIndex, total, totalCorrect, totalDontKnow, totalXPEarned, totalCoins, endSession, addXP, reload]);

  // Loading
  if (phase === 'loading' || srsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full"
        />
        <p className="text-slate-500 mt-4 text-lg font-medium">복습 준비 중...</p>
      </div>
    );
  }

  // No words to review
  if (phase === 'done' && total === 0) {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="px-4 pt-4 max-w-lg mx-auto space-y-6">
          <Link href="/english-learning">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              영어 학습
            </Button>
          </Link>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-7xl mb-4">🎉</div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">
              오늘 복습할 단어가 없어요!
            </h1>
            <p className="text-lg text-slate-500 mb-6">대단해! 모든 단어를 잘 기억하고 있어요!</p>
            <Link href="/english-learning">
              <Button className="h-14 px-8 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg">
                영어 학습으로 돌아가기
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Done with review
  if (phase === 'done') {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="px-4 pt-4 max-w-lg mx-auto space-y-6">
          <Link href="/english-learning">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              영어 학습
            </Button>
          </Link>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-7xl mb-4">
              <PartyPopper className="h-16 w-16 mx-auto text-amber-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">복습 완료!</h1>
            <p className="text-lg text-slate-500 mb-6">오늘도 열심히 했어요!</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="border-0 bg-blue-50 shadow-md rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-black text-blue-600">{total}</div>
                  <p className="text-sm text-blue-500 mt-1">복습 단어</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-green-50 shadow-md rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-black text-green-600">{totalCorrect}</div>
                  <p className="text-sm text-green-500 mt-1">알고 있었어요</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-amber-50 shadow-md rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Coins className="h-5 w-5 text-amber-600" />
                    <span className="text-3xl font-black text-amber-600">{totalCoins}</span>
                  </div>
                  <p className="text-sm text-amber-500 mt-1">코인 획득</p>
                </CardContent>
              </Card>
            </div>

            {totalDontKnow > 0 && (
              <p className="text-slate-500 mb-6">
                &quot;모르겠어요&quot;를 {totalDontKnow}번 눌렀어요. 솔직한 주우, 멋져!
              </p>
            )}

            <Link href="/english-learning">
              <Button className="h-14 px-8 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg">
                영어 학습으로 돌아가기
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Review / Feedback phases
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="px-4 pt-4 max-w-lg mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Link href="/english-learning">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              나가기
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-amber-600">{totalCoins}</span>
          </div>
        </div>

        {/* 진행률 */}
        <div>
          <div className="flex justify-between text-sm text-slate-500 mb-1">
            <span>{currentIndex + 1} / {total}</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* 카드 */}
        <AnimatePresence mode="wait">
          {phase === 'review' && currentWord && (
            <motion.div
              key={`review-${currentIndex}`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 bg-white shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 text-center">
                  {/* TTS 버튼 */}
                  <button
                    onClick={() => speak(currentWord.word)}
                    className="mx-auto mb-6 p-4 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors"
                  >
                    <Volume2 className="h-8 w-8 text-indigo-600" />
                  </button>

                  <h2 className="text-4xl font-black text-slate-800 mb-2">
                    {currentWord.word}
                  </h2>
                  {currentWord.pronunciation && (
                    <p className="text-lg text-slate-400 mb-8">
                      [{currentWord.pronunciation}]
                    </p>
                  )}

                  <p className="text-xl text-slate-500 mb-8">이 단어의 뜻을 알고 있나요?</p>

                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleKnow}
                      className="h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25"
                    >
                      <ThumbsUp className="h-6 w-6 mr-2" />
                      알아요! (+2코인)
                    </Button>
                    <Button
                      onClick={handleDontKnow}
                      variant="outline"
                      className="h-16 text-xl font-bold rounded-2xl border-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <HelpCircle className="h-6 w-6 mr-2" />
                      모르겠어요 (+1코인)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === 'feedback' && currentWord && (
            <motion.div
              key={`feedback-${currentIndex}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`border-0 shadow-xl rounded-3xl overflow-hidden ${
                feedbackResult === 'correct' ? 'bg-green-50' : 'bg-amber-50'
              }`}>
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">
                    {feedbackResult === 'correct' ? '🌟' : '💎'}
                  </div>

                  <p className="text-lg font-bold mb-4">
                    {feedbackResult === 'correct'
                      ? randomMessage(CORRECT_MESSAGES)
                      : randomMessage(DONT_KNOW_MESSAGES)}
                  </p>

                  <h2 className="text-3xl font-black text-slate-800 mb-1">
                    {currentWord.word}
                  </h2>
                  <p className="text-2xl text-slate-600 mb-2">{currentWord.meaning}</p>
                  {currentWord.pronunciation && (
                    <p className="text-lg text-slate-400 mb-6">
                      [{currentWord.pronunciation}]
                    </p>
                  )}

                  {/* TTS 다시 듣기 */}
                  <button
                    onClick={() => speak(currentWord.word)}
                    className="mx-auto mb-6 p-3 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors"
                  >
                    <Volume2 className="h-6 w-6 text-indigo-600" />
                  </button>

                  <Button
                    onClick={handleNext}
                    className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg"
                  >
                    {currentIndex + 1 >= total ? '결과 보기' : '다음 단어'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
