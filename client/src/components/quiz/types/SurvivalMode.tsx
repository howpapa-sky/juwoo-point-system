// 서바이벌 모드 — 에너지가 바닥나기 전까지 계속!
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardVariants, buttonVariants } from '@/lib/quizAnimations';
import { QUIZ_COLORS } from '@/lib/quizConstants';
import type { QuizQuestion } from '@/lib/quizEngine';

interface Props {
  questions: QuizQuestion[];
  onComplete: (correctCount: number, totalAnswered: number) => void;
  onSpeak: (text: string) => void;
  playSound: (type: 'correct' | 'wrong' | 'streak' | 'complete') => void;
}

export default function SurvivalMode({ questions, onComplete, onSpeak, playSound }: Props) {
  const [energy, setEnergy] = useState(100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFlash, setShowFlash] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleAnswer = useCallback((option: string) => {
    if (isFinished || !currentQ) return;

    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      // 에너지 회복 (정답 시 +5, 콤보 시 +10)
      setEnergy(prev => Math.min(100, prev + (newStreak >= 3 ? 10 : 5)));
      playSound(newStreak >= 5 ? 'streak' : 'correct');
    } else {
      setStreak(0);
      const newEnergy = energy - 20;
      setEnergy(newEnergy);
      playSound('wrong');

      if (newEnergy <= 0) {
        setIsFinished(true);
        playSound('complete');
        setTimeout(() => onComplete(correctCount, currentIndex + 1), 500);
        return;
      }
    }

    setShowFlash(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setShowFlash(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
        onComplete(correctCount + (isCorrect ? 1 : 0), currentIndex + 1);
      }
    }, 400);
  }, [isFinished, currentQ, streak, energy, currentIndex, correctCount, questions.length, onComplete, playSound]);

  // 에너지 색상 (빨간색 절대 안 씀!)
  const energyColor = energy > 50
    ? QUIZ_COLORS.correct
    : energy > 20
      ? '#EAB308'
      : QUIZ_COLORS.incorrect;

  if (!currentQ && !isFinished) return null;

  // 종료 화면
  if (isFinished) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg mx-auto text-center"
      >
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 shadow-lg border-2 border-purple-200">
          <span className="text-6xl block mb-4">🏅</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">서바이벌 완료!</h2>
          <p className="text-lg text-gray-600 mb-4">
            {correctCount}문제 정답! 대단해!
          </p>
          {correctCount >= 20 && (
            <p className="text-purple-600 font-bold text-lg">🌟 20문제 돌파 보너스!</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 relative overflow-hidden">
        {/* 플래시 */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-3xl z-10 pointer-events-none"
              style={{
                backgroundColor: showFlash === 'correct' ? QUIZ_COLORS.correct : QUIZ_COLORS.incorrect,
              }}
            />
          )}
        </AnimatePresence>

        {/* 상단바 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" style={{ color: energyColor }} />
            <span className="font-bold text-gray-700">에너지</span>
          </div>
          <div className="flex items-center gap-3">
            {streak >= 3 && (
              <motion.span
                key={streak}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-amber-500 font-bold flex items-center gap-1 text-sm"
              >
                <Zap className="h-3 w-3" />
                {streak}연속!
              </motion.span>
            )}
            <span className="font-bold text-gray-700">
              ✓ {correctCount} / #{currentIndex + 1}
            </span>
          </div>
        </div>

        {/* 에너지 바 */}
        <div className="w-full h-4 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: energyColor }}
            animate={{ width: `${energy}%` }}
            transition={{ duration: 0.5, type: 'spring' }}
          />
        </div>

        {/* 문제 */}
        {currentQ && (
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

              <div className="flex flex-col gap-3 mb-3">
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

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400"
                  onClick={() => handleAnswer('')}
                >
                  모르겠어요 🤔
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
