// 스피드 라운드 — 제한시간 내 최대한 많이 맞추기
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardVariants, buttonVariants } from '@/lib/quizAnimations';
import { QUIZ_COLORS } from '@/lib/quizConstants';
import type { QuizQuestion } from '@/lib/quizEngine';

interface Props {
  questions: QuizQuestion[];
  timeLimit?: number;  // 초 (기본 60)
  onComplete: (correctCount: number, totalAnswered: number) => void;
  onSpeak: (text: string) => void;
  playSound: (type: 'correct' | 'wrong' | 'streak') => void;
}

export default function SpeedRound({ questions, timeLimit = 60, onComplete, onSpeak, playSound }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFlash, setShowFlash] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const totalAnsweredRef = useRef(0);

  const currentQ = questions[currentIndex];

  // 타이머
  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      setIsFinished(true);
      onComplete(correctCount, totalAnsweredRef.current);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, correctCount, onComplete]);

  const handleAnswer = useCallback((option: string) => {
    if (isFinished || !currentQ) return;

    const isCorrect = option === currentQ.correctAnswer;
    totalAnsweredRef.current += 1;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      playSound(streak + 1 >= 5 ? 'streak' : 'correct');
    } else {
      setStreak(0);
      playSound('wrong');
    }

    setShowFlash(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setShowFlash(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
        onComplete(correctCount + (isCorrect ? 1 : 0), totalAnsweredRef.current);
      }
    }, 300);
  }, [isFinished, currentQ, currentIndex, questions.length, streak, correctCount, onComplete, playSound]);

  if (!currentQ) return null;

  // 타이머 색상 (5초 이하에서도 빨간색 안 씀!)
  const timerUrgent = timeLeft <= 5;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 relative overflow-hidden">
        {/* 플래시 효과 */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-3xl z-10 pointer-events-none"
              style={{
                backgroundColor: showFlash === 'correct' ? QUIZ_COLORS.correct : QUIZ_COLORS.incorrect,
              }}
            />
          )}
        </AnimatePresence>

        {/* 상단바: 타이머 + 스코어 */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold ${
            timerUrgent ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
          }`}>
            <Timer className="h-4 w-4" />
            <span className="text-lg">{timeLeft}초</span>
          </div>

          <div className="flex items-center gap-4">
            {streak >= 3 && (
              <motion.div
                key={streak}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 text-amber-500 font-bold"
              >
                <Zap className="h-4 w-4" />
                <span>{streak}연속!</span>
              </motion.div>
            )}
            <div className="text-lg font-bold text-gray-700">
              ✓ {correctCount}
            </div>
          </div>
        </div>

        {/* 타이머 바 */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: timerUrgent ? QUIZ_COLORS.incorrect : QUIZ_COLORS.primary }}
            animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* 문제 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.15 }}
          >
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-gray-800 mb-1">{currentQ.word.word}</p>
              <p className="text-sm text-gray-400">[{currentQ.word.pronunciation}]</p>
            </div>

            {/* 보기 (2x2 격자) */}
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options?.map((option, idx) => (
                <motion.button
                  key={idx}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleAnswer(option)}
                  className="px-4 py-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 text-base font-bold min-h-[56px] transition-colors"
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* "모르겠어요" 버튼 */}
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
            onClick={() => handleAnswer('')}
          >
            패스 →
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
