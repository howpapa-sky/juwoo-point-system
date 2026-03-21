// 문장 빈칸 채우기 퀴즈
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Turtle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardVariants, buttonVariants } from '@/lib/quizAnimations';
import { QUIZ_COLORS } from '@/lib/quizConstants';
import type { EnglishWord } from '@/data/englishWordsData';
import { wordEmojiMap } from '@/lib/quizEngine';

interface Props {
  word: EnglishWord;
  options: string[];
  onAnswer: (answer: string, usedHint: boolean) => void;
  onSpeak: (text: string) => void;
  onSpeakSlow: (text: string) => void;
}

export default function FillBlankQuiz({ word, options, onAnswer, onSpeak, onSpeakSlow }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const emoji = wordEmojiMap[word.word.toLowerCase()];

  // 예문에서 단어를 빈칸으로 대체
  const sentenceWithBlank = word.example.replace(
    new RegExp(`\\b${word.word}\\b`, 'gi'),
    '_____'
  );

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
        {/* 헤더 */}
        <div className="text-center mb-4">
          <span className="inline-block bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold">
            📝 빈칸을 채워보세요!
          </span>
        </div>

        {/* 문장 영역 */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4">
          <div className="flex items-start gap-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 flex-shrink-0"
              onClick={() => onSpeak(word.example)}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <p className="text-lg font-medium text-gray-800 leading-relaxed">
              &quot;{sentenceWithBlank}&quot;
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-400 flex-shrink-0"
              onClick={() => onSpeakSlow(word.example)}
            >
              <Turtle className="h-4 w-4" />
            </Button>
            <p className="text-sm text-gray-500">
              ({word.exampleKorean})
            </p>
          </div>
        </div>

        {/* 뜻 힌트 */}
        <div className="text-center mb-6">
          <span className="text-lg text-gray-600">
            {emoji && <span className="mr-1">{emoji}</span>}
            빈칸에 들어갈 뜻: <span className="font-bold text-purple-600">{word.meaning}</span>
          </span>
        </div>

        {/* 보기 */}
        <div className="flex flex-col gap-3">
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
                className="px-4 py-4 rounded-xl border-2 text-base font-bold transition-colors min-h-[56px] bg-gray-50 hover:bg-gray-100 border-gray-200"
                style={
                  showResult && isCorrect
                    ? { borderColor: QUIZ_COLORS.correct, backgroundColor: `${QUIZ_COLORS.correct}15` }
                    : showResult && isSelected && !isCorrect
                      ? { borderColor: QUIZ_COLORS.incorrect, backgroundColor: `${QUIZ_COLORS.incorrect}15` }
                      : undefined
                }
              >
                {option}
                {showResult && isCorrect && ' ✓'}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
