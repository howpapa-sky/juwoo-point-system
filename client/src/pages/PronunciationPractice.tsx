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
  Mic,
  Coins,
  PartyPopper,
  HelpCircle,
  SkipForward,
} from 'lucide-react';
import { useSRS, type WordSRS } from '@/hooks/useSRS';
import { useXP } from '@/hooks/useXP';
import { usePronunciation } from '@/hooks/usePronunciation';
import { useSessionLog } from '@/hooks/useSessionLog';
import { supabase } from '@/lib/supabaseClient';

type Phase = 'loading' | 'listen' | 'speak' | 'feedback' | 'done';

const TIER_CONFIG = {
  excellent: { emoji: '🌟', label: '완벽해!', color: 'text-amber-600', bg: 'bg-amber-50' },
  good: { emoji: '👏', label: '잘했어!', color: 'text-blue-600', bg: 'bg-blue-50' },
  tryAgain: { emoji: '💪', label: '좋은 시도야!', color: 'text-slate-600', bg: 'bg-slate-50' },
};

export default function PronunciationPractice() {
  const { reviewWords, loading: srsLoading } = useSRS();
  const { addXP, updateStreak, incrementStat } = useXP();
  const { speak, startRecognition, stopRecognition, getFeedback, isListening, isSupported } = usePronunciation();
  const { startSession, logAnswer, endSession } = useSessionLog();

  const [phase, setPhase] = useState<Phase>('loading');
  const [words, setWords] = useState<WordSRS[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<{
    score: number;
    message: string;
    tier: 'excellent' | 'good' | 'tryAgain';
    coins: number;
  } | null>(null);
  const sessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (srsLoading) return;

    // Use review words + limit to 10 for a session
    const available = [...reviewWords].slice(0, 10);
    if (available.length === 0) {
      setWords([]);
      setPhase('done');
      return;
    }

    setWords(available);

    async function init() {
      const sid = await startSession('pronunciation');
      sessionIdRef.current = sid;
      await updateStreak();
      setPhase('listen');
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srsLoading]);

  const currentWord = words[currentIndex];
  const total = words.length;
  const progressPercent = total > 0 ? Math.round((currentIndex / total) * 100) : 0;

  // Step 1: Auto-play TTS on entering listen phase
  useEffect(() => {
    if (phase === 'listen' && currentWord) {
      speak(currentWord.word);
    }
  }, [phase, currentIndex, currentWord, speak]);

  const handleListen = useCallback(() => {
    if (currentWord) {
      speak(currentWord.word);
    }
  }, [currentWord, speak]);

  const handleStartSpeak = useCallback(() => {
    setPhase('speak');
  }, []);

  const handleRecord = useCallback(async () => {
    if (!currentWord || isListening) return;

    const result = await startRecognition(currentWord.word);
    const feedback = getFeedback(result.score);

    setCurrentFeedback(feedback);
    setScores((prev) => [...prev, result.score]);
    setTotalCoins((prev) => prev + feedback.coins);

    // XP based on tier
    const xpAction = feedback.tier === 'excellent'
      ? 'pronunciation_excellent' as const
      : feedback.tier === 'good'
      ? 'pronunciation_good' as const
      : 'pronunciation_tried' as const;
    const { xpGained } = await addXP(xpAction);
    setTotalXP((prev) => prev + xpGained);

    await incrementStat('total_pronunciation_practices');

    if (sessionIdRef.current) {
      await logAnswer({
        sessionId: sessionIdRef.current,
        word: currentWord.word,
        questionType: 'pronunciation',
        isCorrect: feedback.tier !== 'tryAgain',
        pronunciationScore: result.score,
      });
    }

    setPhase('feedback');
  }, [currentWord, isListening, startRecognition, getFeedback, addXP, incrementStat, logAnswer]);

  const handleDontKnow = useCallback(async () => {
    if (!currentWord) return;

    // Just listen to TTS
    speak(currentWord.word);
    setTotalCoins((prev) => prev + 1);
    setScores((prev) => [...prev, 0]);

    const { xpGained } = await addXP('pronunciation_tried');
    setTotalXP((prev) => prev + xpGained);

    if (sessionIdRef.current) {
      await logAnswer({
        sessionId: sessionIdRef.current,
        word: currentWord.word,
        questionType: 'pronunciation',
        isCorrect: false,
        usedDontKnow: true,
        pronunciationScore: 0,
      });
    }

    setCurrentFeedback({
      score: 0,
      message: '괜찮아! 잘 들어보고 다음에 해보자!',
      tier: 'tryAgain',
      coins: 1,
    });
    setPhase('feedback');
  }, [currentWord, speak, addXP, logAnswer]);

  const handleNext = useCallback(async () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= total) {
      // End session
      const correctCount = scores.filter((s) => s >= 60).length;
      if (sessionIdRef.current) {
        await endSession(sessionIdRef.current, {
          totalCorrect: correctCount,
          totalWrong: total - correctCount,
          totalDontKnow: scores.filter((s) => s === 0).length,
          guessingCount: 0,
          xpEarned: totalXP,
          coinsEarned: totalCoins,
        });
      }

      // Award coins
      if (totalCoins > 0) {
        const { data: profile, error: profileErr } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        if (!profileErr && profile) {
          const newBalance = (profile.current_points ?? 0) + totalCoins;
          const { error: txError } = await supabase.from('point_transactions').insert({
            juwoo_id: 1,
            rule_id: null,
            amount: totalCoins,
            balance_after: newBalance,
            note: `발음 연습 보상 (${total}단어)`,
            created_by: 1,
          });
          if (txError) {
            if (import.meta.env.DEV) console.error('발음 연습 포인트 기록 에러:', txError);
          } else {
            const { error: updateError } = await supabase.from('juwoo_profile').update({ current_points: newBalance }).eq('id', 1);
            if (updateError && import.meta.env.DEV) console.error('프로필 업데이트 에러:', updateError);
          }
        }
      }

      setPhase('done');
    } else {
      setCurrentIndex(nextIdx);
      setCurrentFeedback(null);
      setPhase('listen');
    }
  }, [currentIndex, total, scores, totalXP, totalCoins, endSession]);

  // Loading
  if (phase === 'loading' || srsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
        />
        <p className="text-slate-500 mt-4 text-lg font-medium">발음 연습 준비 중...</p>
      </div>
    );
  }

  // No words
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
            <div className="text-7xl mb-4">🎤</div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">연습할 단어가 없어요</h1>
            <p className="text-lg text-slate-500 mb-6">
              단어를 먼저 학습하면 발음 연습을 할 수 있어요!
            </p>
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

  // Done
  if (phase === 'done') {
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const excellentCount = scores.filter((s) => s >= 85).length;

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
            <PartyPopper className="h-16 w-16 mx-auto text-teal-500 mb-4" />
            <h1 className="text-3xl font-black text-slate-800 mb-2">발음 연습 완료!</h1>
            <p className="text-lg text-slate-500 mb-6">소리 내어 연습하니까 기억이 더 잘 돼요!</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="border-0 bg-teal-50 shadow-md rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-black text-teal-600">{total}</div>
                  <p className="text-sm text-teal-500 mt-1">연습 단어</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-indigo-50 shadow-md rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-black text-indigo-600">{avgScore}점</div>
                  <p className="text-sm text-indigo-500 mt-1">평균 점수</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-amber-50 shadow-md rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Coins className="h-5 w-5 text-amber-600" />
                    <span className="text-3xl font-black text-amber-600">{totalCoins}</span>
                  </div>
                  <p className="text-sm text-amber-500 mt-1">포인트 획득</p>
                </CardContent>
              </Card>
            </div>

            {excellentCount > 0 && (
              <p className="text-slate-500 mb-6">
                완벽한 발음 {excellentCount}개! 대단해요!
              </p>
            )}

            <Link href="/english-learning">
              <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg">
                영어 학습으로 돌아가기
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Practice phases: listen, speak, feedback
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

        <AnimatePresence mode="wait">
          {/* Step 1: 듣기 */}
          {phase === 'listen' && currentWord && (
            <motion.div
              key={`listen-${currentIndex}`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <Card className="border-0 bg-white shadow-xl rounded-3xl">
                <CardContent className="p-8 text-center">
                  <p className="text-lg text-teal-600 font-bold mb-4">Step 1: 잘 들어보자!</p>

                  <h2 className="text-4xl font-black text-slate-800 mb-2">{currentWord.word}</h2>
                  <p className="text-xl text-slate-500 mb-2">{currentWord.meaning}</p>
                  {currentWord.pronunciation && (
                    <p className="text-lg text-slate-400 mb-6">[{currentWord.pronunciation}]</p>
                  )}

                  <button
                    onClick={handleListen}
                    className="mx-auto mb-8 p-6 rounded-full bg-teal-100 hover:bg-teal-200 transition-colors shadow-lg"
                  >
                    <Volume2 className="h-10 w-10 text-teal-600" />
                  </button>

                  <div className="space-y-3">
                    <Button
                      onClick={handleStartSpeak}
                      className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      따라하기 시작!
                    </Button>
                    <Button
                      onClick={handleDontKnow}
                      variant="outline"
                      className="w-full h-14 text-lg font-bold rounded-2xl border-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <HelpCircle className="h-5 w-5 mr-2" />
                      모르겠어요 (+1포인트)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: 따라하기 */}
          {phase === 'speak' && currentWord && (
            <motion.div
              key={`speak-${currentIndex}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <Card className="border-0 bg-white shadow-xl rounded-3xl">
                <CardContent className="p-8 text-center">
                  <p className="text-lg text-teal-600 font-bold mb-4">Step 2: 따라 말해보자!</p>

                  <h2 className="text-4xl font-black text-slate-800 mb-8">{currentWord.word}</h2>

                  <Button
                    onClick={handleRecord}
                    disabled={isListening}
                    className={`h-24 w-24 rounded-full mx-auto shadow-xl ${
                      isListening
                        ? 'bg-orange-500 hover:bg-orange-600 animate-pulse'
                        : 'bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                    }`}
                  >
                    <Mic className="h-10 w-10 text-white" />
                  </Button>

                  {isListening && (
                    <p className="text-orange-500 mt-4 animate-pulse text-lg font-bold">
                      듣고 있어요...
                    </p>
                  )}

                  {!isListening && !isSupported && (
                    <p className="text-slate-400 mt-4">
                      이 브라우저는 음성인식을 지원하지 않아요
                    </p>
                  )}

                  <Button
                    onClick={() => speak(currentWord.word)}
                    variant="ghost"
                    className="mt-6"
                  >
                    <Volume2 className="h-5 w-5 mr-2 text-slate-400" />
                    <span className="text-slate-400">다시 듣기</span>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: 피드백 */}
          {phase === 'feedback' && currentWord && currentFeedback && (
            <motion.div
              key={`feedback-${currentIndex}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <Card className={`border-0 shadow-xl rounded-3xl ${TIER_CONFIG[currentFeedback.tier].bg}`}>
                <CardContent className="p-8 text-center">
                  <p className="text-lg font-bold mb-2">Step 3: 결과</p>

                  <div className="text-6xl mb-3">
                    {TIER_CONFIG[currentFeedback.tier].emoji}
                  </div>

                  <h3 className={`text-2xl font-black mb-2 ${TIER_CONFIG[currentFeedback.tier].color}`}>
                    {TIER_CONFIG[currentFeedback.tier].label}
                  </h3>

                  {currentFeedback.score > 0 && (
                    <div className="text-4xl font-black text-slate-800 mb-2">
                      {currentFeedback.score}점
                    </div>
                  )}

                  <p className="text-lg text-slate-600 mb-2">{currentFeedback.message}</p>

                  <div className="flex items-center justify-center gap-1 mb-6">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <span className="font-bold text-amber-600">+{currentFeedback.coins} 포인트</span>
                  </div>

                  <h2 className="text-2xl font-black text-slate-800 mb-1">{currentWord.word}</h2>
                  <p className="text-lg text-slate-500 mb-6">{currentWord.meaning}</p>

                  <Button
                    onClick={handleNext}
                    className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg"
                  >
                    {currentIndex + 1 >= total ? '결과 보기' : '다음 단어'}
                    {currentIndex + 1 < total && <SkipForward className="h-5 w-5 ml-2" />}
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
