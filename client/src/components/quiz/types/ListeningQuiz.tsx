// 듣기 퀴즈 컴포넌트 — 발음 듣고 뜻 고르기
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Turtle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardVariants, buttonVariants } from '@/lib/quizAnimations';
import { QUIZ_COLORS } from '@/lib/quizConstants';
import type { EnglishWord } from '@/data/englishWordsData';

interface Props {
  word: EnglishWord;
  options: string[];
  onAnswer: (answer: string, usedHint: boolean) => void;
  onSpeak: (text: string) => void;
  onSpeakSlow: (text: string) => void;
}

export default function ListeningQuiz({ word, options, onAnswer, onSpeak, onSpeakSlow }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // 자동으로 발음 재생
  useEffect(() => {
    const timeout = setTimeout(() => onSpeak(word.word), 300);
    return () => clearTimeout(timeout);
  }, [word.word, onSpeak]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    onAnswer(option, false);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100">
        {/* 듣기 영역 */}
        <div className="text-center mb-8">
          <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🎧 잘 듣고 골라보세요!
          </span>

          <div className="flex items-center justify-center gap-4 mb-4">
            {/* 재생 버튼 (크게) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSpeak(word.word)}
              className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg"
            >
              <Volume2 className="h-10 w-10" />
            </motion.button>

            {/* 느린 재생 */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSpeakSlow(word.word)}
              className="w-14 h-14 rounded-full bg-blue-300 hover:bg-blue-400 text-white flex items-center justify-center shadow"
              title="느리게 듣기"
            >
              <Turtle className="h-7 w-7" />
            </motion.button>
          </div>

          <p className="text-sm text-gray-400">탭해서 다시 들어보세요! (무제한)</p>
        </div>

        {/* 보기 */}
        <div className="grid grid-cols-1 gap-3">
          {options.map((option, idx) => {
            const isSelected = selected === option;
            const isCorrect = option === word.meaning;
            const showResult = selected !== null;

            return (
              <motion.button
                key={idx}
                variants={buttonVariants}
                whileHover={!selected ? 'hover' : undefined}
                whileTap={!selected ? 'tap' : undefined}
                onClick={() => handleSelect(option)}
                disabled={!!selected}
                className="w-full text-left px-5 py-4 rounded-xl border-2 text-lg font-medium transition-colors min-h-[56px] bg-gray-50 hover:bg-gray-100 border-gray-200"
                style={
                  showResult && isCorrect
                    ? { borderColor: QUIZ_COLORS.correct, backgroundColor: `${QUIZ_COLORS.correct}15` }
                    : showResult && isSelected && !isCorrect
                      ? { borderColor: QUIZ_COLORS.incorrect, backgroundColor: `${QUIZ_COLORS.incorrect}15` }
                      : undefined
                }
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                  {showResult && isCorrect && <span className="ml-auto">✓</span>}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
