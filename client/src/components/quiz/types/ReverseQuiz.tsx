// 한→영 역방향 퀴즈 — 한글 뜻을 보고 영단어 고르기
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardVariants, buttonVariants } from '@/lib/quizAnimations';
import { QUIZ_COLORS } from '@/lib/quizConstants';
import type { EnglishWord } from '@/data/englishWordsData';
import { wordEmojiMap } from '@/lib/quizEngine';

interface Props {
  word: EnglishWord;
  options: string[];  // 영단어 보기들
  onAnswer: (answer: string, usedHint: boolean) => void;
  onSpeak: (text: string) => void;
}

export default function ReverseQuiz({ word, options, onAnswer, onSpeak }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const emoji = wordEmojiMap[word.word.toLowerCase()];

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    onSpeak(option);
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
        {/* 헤더 */}
        <div className="text-center mb-4">
          <span className="inline-block bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-bold">
            🔄 영어로 뭐라고 할까?
          </span>
        </div>

        {/* 한글 뜻 표시 */}
        <div className="text-center mb-8">
          {emoji && <span className="text-5xl block mb-3">{emoji}</span>}
          <p className="text-3xl font-bold text-gray-800 mb-2">{word.meaning}</p>
          <p className="text-sm text-gray-400">[{word.pronunciation}]</p>
        </div>

        {/* 보기 (영단어) */}
        <div className="grid grid-cols-1 gap-3">
          {options.map((option, idx) => {
            const isSelected = selected === option;
            const isCorrect = option.toLowerCase() === word.word.toLowerCase();
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
                  {showResult && isCorrect && (
                    <span className="ml-auto flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onSpeak(option); }}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      ✓
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
