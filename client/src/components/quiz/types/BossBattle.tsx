// 보스 배틀 — 보스 HP를 깎아서 물리치기
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardVariants, buttonVariants } from '@/lib/quizAnimations';
import { QUIZ_COLORS, BOSSES } from '@/lib/quizConstants';
import type { QuizQuestion } from '@/lib/quizEngine';

interface Props {
  questions: QuizQuestion[];
  onComplete: (correctCount: number, bossHP: number, bossName: string) => void;
  onSpeak: (text: string) => void;
  playSound: (type: 'correct' | 'wrong' | 'boss' | 'complete') => void;
}

export default function BossBattle({ questions, onComplete, onSpeak, playSound }: Props) {
  const [boss] = useState(() => BOSSES[Math.floor(Math.random() * BOSSES.length)]);
  const [bossHP, setBossHP] = useState(100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFlash, setShowFlash] = useState<'hit' | 'miss' | null>(null);
  const [playerHP, setPlayerHP] = useState(100);

  const currentQ = questions[currentIndex];
  const damagePerHit = Math.ceil(100 / questions.length);
  const isFinished = !currentQ || bossHP <= 0;

  const handleAnswer = useCallback((option: string) => {
    if (isFinished || !currentQ) return;

    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      const newHP = Math.max(0, bossHP - damagePerHit);
      setBossHP(newHP);
      setCorrectCount(prev => prev + 1);
      playSound(newHP <= 0 ? 'complete' : 'correct');
      setShowFlash('hit');

      if (newHP <= 0) {
        setTimeout(() => onComplete(correctCount + 1, 0, boss.name), 800);
        return;
      }
    } else {
      setPlayerHP(prev => Math.max(0, prev - 10));
      playSound('wrong');
      setShowFlash('miss');
    }

    setTimeout(() => {
      setShowFlash(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete(correctCount + (isCorrect ? 1 : 0), bossHP - (isCorrect ? damagePerHit : 0), boss.name);
      }
    }, 500);
  }, [isFinished, currentQ, bossHP, damagePerHit, currentIndex, questions.length, correctCount, boss.name, onComplete, playSound]);

  if (!currentQ && !isFinished) return null;

  // 보스 처치 화면
  if (bossHP <= 0) {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg mx-auto text-center"
      >
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-8 shadow-lg border-2 border-amber-200">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">보스 처치!</h2>
          <p className="text-lg text-gray-600 mb-4">
            {boss.emoji} {boss.name}을(를) 물리쳤어!
          </p>
          <p className="text-amber-600 font-bold text-xl">
            🗡️ {correctCount}번 공격 성공!
          </p>
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
        {/* 타격 이펙트 */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-3xl z-10 pointer-events-none"
              style={{
                backgroundColor: showFlash === 'hit' ? QUIZ_COLORS.correct : QUIZ_COLORS.incorrect,
              }}
            />
          )}
        </AnimatePresence>

        {/* 보스 영역 */}
        <div className="text-center mb-4">
          <motion.span
            className="text-6xl block mb-2"
            animate={showFlash === 'hit' ? { x: [0, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            {boss.emoji}
          </motion.span>
          <p className="font-bold text-lg text-gray-800">
            <Swords className="h-4 w-4 inline mr-1" />
            {boss.name}
          </p>
        </div>

        {/* 보스 HP 바 (주황색, 빨간색 안 씀!) */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>보스 HP</span>
            <span>{bossHP}%</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: bossHP > 30 ? QUIZ_COLORS.incorrect : '#EAB308' }}
              animate={{ width: `${bossHP}%` }}
              transition={{ duration: 0.5, type: 'spring' }}
            />
          </div>
        </div>

        {/* 플레이어 HP */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>주우 HP</span>
            <span>{playerHP}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: QUIZ_COLORS.correct }}
              animate={{ width: `${playerHP}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* 문제 */}
        {currentQ && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-4">
                <p className="text-xl font-bold text-gray-800">{currentQ.word.word}</p>
                <p className="text-sm text-gray-400">[{currentQ.word.pronunciation}]</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
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

              {/* 모르겠어요 */}
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
