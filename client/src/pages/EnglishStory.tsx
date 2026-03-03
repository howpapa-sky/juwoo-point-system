import { useState, useEffect, useCallback } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Mic,
  BookOpen,
  PartyPopper,
  Check,
} from 'lucide-react';
import { getStoryById, type LearningStory, type StoryPage } from '@/data/stories';
import { useStoryProgress } from '@/hooks/useStoryProgress';
import { usePronunciation } from '@/hooks/usePronunciation';
import { useXP } from '@/hooks/useXP';

export default function EnglishStory() {
  const [, params] = useRoute('/english-story/:storyId');
  const [, navigate] = useLocation();
  const storyId = params?.storyId ?? '';

  const { saveProgress } = useStoryProgress();
  const { speak, startRecognition, isListening, isSupported, getFeedback } = usePronunciation();
  const { addXP, incrementStat } = useXP();

  const [story, setStory] = useState<LearningStory | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [interactionsCompleted, setInteractionsCompleted] = useState(0);
  const [showMeaning, setShowMeaning] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null);
  const [speakScore, setSpeakScore] = useState<number | null>(null);
  const [pageInteractionDone, setPageInteractionDone] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!storyId) return;
    const found = getStoryById(storyId);
    if (found) {
      setStory(found);
    }
  }, [storyId]);

  const page: StoryPage | null = story ? (story.pages[currentPageIdx] ?? null) : null;
  const totalPages = story?.pages.length ?? 0;
  const progressPercent = totalPages > 0 ? Math.round(((currentPageIdx + 1) / totalPages) * 100) : 0;

  // Reset state when page changes
  useEffect(() => {
    setSelectedAnswer(null);
    setAnswerResult(null);
    setShowMeaning(null);
    setSpeakScore(null);
    setPageInteractionDone(false);
  }, [currentPageIdx]);

  // Check if current page has no interaction requirement (read / tap-word with no interaction)
  const isReadOnly = page?.interactionType === 'read';

  const handleTapWord = useCallback(
    (word: string) => {
      speak(word);
      // Show a simple meaning from story target words
      const meanings: Record<string, string> = {};
      if (story) {
        // We just show the word was tapped via TTS; more info not available per-word in story data
      }
      setShowMeaning(word);
      setTimeout(() => setShowMeaning(null), 2000);
    },
    [speak, story],
  );

  const handleFillBlank = useCallback(
    (option: string) => {
      if (answerResult) return; // already answered
      setSelectedAnswer(option);
      const correct = page?.interaction?.correctAnswer;
      if (option === correct) {
        setAnswerResult('correct');
        setInteractionsCompleted((prev) => prev + 1);
        setPageInteractionDone(true);
        toast.success('정답이에요!');
      } else {
        setAnswerResult('wrong');
        // After a brief delay, reset so they can try again
        setTimeout(() => {
          setSelectedAnswer(null);
          setAnswerResult(null);
        }, 1200);
        toast('아깝다! 다시 골라보자!', { icon: '💪' });
      }
    },
    [answerResult, page],
  );

  const handleChoose = useCallback(
    (option: string) => {
      if (answerResult) return;
      setSelectedAnswer(option);
      const correct = page?.interaction?.correctAnswer;
      if (option === correct) {
        setAnswerResult('correct');
        setInteractionsCompleted((prev) => prev + 1);
        setPageInteractionDone(true);
        toast.success('맞았어요!');
      } else {
        setAnswerResult('wrong');
        setTimeout(() => {
          setSelectedAnswer(null);
          setAnswerResult(null);
        }, 1200);
        toast('괜찮아! 다시 해보자!', { icon: '💪' });
      }
    },
    [answerResult, page],
  );

  const handleSpeak = useCallback(async () => {
    if (!page || isListening) return;

    // We need a target word — for speak pages we try to extract a sensible target
    const targetWord = page.highlightWords[0] ?? 'hello';
    const result = await startRecognition(targetWord);
    const feedback = getFeedback(result.score);
    setSpeakScore(result.score);
    setInteractionsCompleted((prev) => prev + 1);
    setPageInteractionDone(true);
    toast(feedback.message, { icon: feedback.tier === 'excellent' ? '🌟' : feedback.tier === 'good' ? '👏' : '💪' });
  }, [page, isListening, startRecognition, getFeedback]);

  const handlePrev = useCallback(() => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx((prev) => prev - 1);
    }
  }, [currentPageIdx]);

  const handleNext = useCallback(async () => {
    if (currentPageIdx < totalPages - 1) {
      setCurrentPageIdx((prev) => prev + 1);
    } else {
      // Completed story
      if (story) {
        await saveProgress(story.id, totalPages, totalPages, interactionsCompleted, true);
        await addXP('story_completed');
        await incrementStat('total_stories_completed');
      }
      setFinished(true);
    }
  }, [currentPageIdx, totalPages, story, saveProgress, interactionsCompleted, addXP, incrementStat]);

  // Not found
  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">스토리를 찾을 수 없어요</h1>
        <Link href="/english-learning">
          <Button className="mt-4">영어 학습으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  // Finished
  if (finished) {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <PartyPopper className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h1 className="text-3xl font-black text-slate-800 mb-2">스토리 완료!</h1>
            <p className="text-lg text-slate-500 mb-2">
              &quot;{story.title}&quot;을 다 읽었어요!
            </p>
            <p className="text-slate-500 mb-8">XP를 받았어요!</p>

            <div className="space-y-3">
              <Link href="/english-learning">
                <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg">
                  영어 학습으로 돌아가기
                </Button>
              </Link>
              <Link href="/english-review">
                <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-2xl border-2">
                  <BookOpen className="h-5 w-5 mr-2" />
                  스토리에서 만난 단어 복습하기
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Render highlighted text
  const renderTextEn = (textEn: string, highlights: string[]) => {
    if (highlights.length === 0 || page?.interactionType === 'read') {
      return <span>{textEn}</span>;
    }

    // Split text by highlighted words for tap-word interaction
    const regex = new RegExp(`(${highlights.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = textEn.split(regex);

    return (
      <>
        {parts.map((part, i) => {
          const isHighlight = highlights.some((h) => h.toLowerCase() === part.toLowerCase());
          if (isHighlight && page?.interactionType === 'tap-word') {
            return (
              <button
                key={i}
                onClick={() => handleTapWord(part)}
                className="inline-block px-1 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg font-bold underline decoration-dotted decoration-indigo-400 active:bg-indigo-200 transition-colors"
              >
                {part}
              </button>
            );
          }
          if (isHighlight) {
            return (
              <span key={i} className="font-bold text-indigo-600">
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="px-4 pt-4 max-w-lg mx-auto space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Link href="/english-learning">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              나가기
            </Button>
          </Link>
          <span className="text-sm font-bold text-slate-500">
            {currentPageIdx + 1} / {totalPages}
          </span>
        </div>

        {/* 진행률 */}
        <Progress value={progressPercent} className="h-2" />

        {/* 스토리 카드 */}
        <AnimatePresence mode="wait">
          {page && (
            <motion.div
              key={currentPageIdx}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 bg-white shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-6 space-y-5">
                  {/* 한국어 텍스트 */}
                  <div className="text-lg text-slate-600 leading-relaxed">
                    {page.textKo}
                  </div>

                  {/* 영어 텍스트 */}
                  <div className="text-xl font-bold text-slate-800 leading-relaxed">
                    {renderTextEn(page.textEn, page.highlightWords)}
                  </div>

                  {/* TTS 버튼 */}
                  <button
                    onClick={() => speak(page.textEn)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                  >
                    <Volume2 className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-600">문장 듣기</span>
                  </button>

                  {/* Tap-word meaning popup */}
                  {showMeaning && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-center p-3 bg-indigo-50 rounded-xl"
                    >
                      <span className="text-lg font-bold text-indigo-700">{showMeaning}</span>
                    </motion.div>
                  )}

                  {/* Interaction: fill-blank */}
                  {page.interactionType === 'fill-blank' && page.interaction && (
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-slate-700">{page.interaction.prompt}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {page.interaction.options?.map((option) => (
                          <Button
                            key={option}
                            onClick={() => handleFillBlank(option)}
                            disabled={!!answerResult && answerResult === 'correct'}
                            className={`h-14 text-lg font-bold rounded-2xl transition-all ${
                              selectedAnswer === option && answerResult === 'correct'
                                ? 'bg-green-500 hover:bg-green-500 text-white'
                                : selectedAnswer === option && answerResult === 'wrong'
                                ? 'bg-gray-300 hover:bg-gray-300 text-gray-600'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                            variant="ghost"
                          >
                            {option}
                            {selectedAnswer === option && answerResult === 'correct' && (
                              <Check className="h-5 w-5 ml-2" />
                            )}
                          </Button>
                        ))}
                      </div>
                      {page.interaction.hint && !pageInteractionDone && (
                        <p className="text-sm text-slate-400 text-center">
                          힌트: {page.interaction.hint}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Interaction: choose */}
                  {page.interactionType === 'choose' && page.interaction && (
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-slate-700">{page.interaction.prompt}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {page.interaction.options?.map((option) => (
                          <Button
                            key={option}
                            onClick={() => handleChoose(option)}
                            disabled={!!answerResult && answerResult === 'correct'}
                            className={`h-14 text-lg font-bold rounded-2xl transition-all ${
                              selectedAnswer === option && answerResult === 'correct'
                                ? 'bg-green-500 hover:bg-green-500 text-white'
                                : selectedAnswer === option && answerResult === 'wrong'
                                ? 'bg-gray-300 hover:bg-gray-300 text-gray-600'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                            variant="ghost"
                          >
                            {option}
                            {selectedAnswer === option && answerResult === 'correct' && (
                              <Check className="h-5 w-5 ml-2" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interaction: speak */}
                  {page.interactionType === 'speak' && (
                    <div className="text-center space-y-3">
                      {page.interaction?.prompt && (
                        <p className="text-lg font-bold text-slate-700">{page.interaction.prompt}</p>
                      )}
                      {isSupported ? (
                        <>
                          <Button
                            onClick={handleSpeak}
                            disabled={isListening || pageInteractionDone}
                            className={`h-16 w-16 rounded-full mx-auto ${
                              isListening
                                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                : pageInteractionDone
                                ? 'bg-green-500 hover:bg-green-500'
                                : 'bg-indigo-500 hover:bg-indigo-600'
                            } shadow-lg`}
                          >
                            {pageInteractionDone ? (
                              <Check className="h-8 w-8 text-white" />
                            ) : (
                              <Mic className="h-8 w-8 text-white" />
                            )}
                          </Button>
                          {isListening && (
                            <p className="text-sm text-red-500 animate-pulse">듣고 있어요...</p>
                          )}
                          {speakScore !== null && (
                            <p className="text-lg font-bold text-indigo-600">
                              발음 점수: {speakScore}점
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-slate-400">이 브라우저는 음성인식을 지원하지 않아요</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-3">
          <Button
            onClick={handlePrev}
            disabled={currentPageIdx === 0}
            variant="outline"
            className="flex-1 h-14 text-lg font-bold rounded-2xl border-2"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            이전
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg"
          >
            {currentPageIdx >= totalPages - 1 ? '완료!' : '다음'}
            {currentPageIdx < totalPages - 1 && <ChevronRight className="h-5 w-5 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
