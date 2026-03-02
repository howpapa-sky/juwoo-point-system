// 객관식 퀴즈 컴포넌트 (개선)
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Turtle, Lightbulb } from 'lucide-react';
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
  showHint?: boolean;
}

export default function MultipleChoice({ word, options, onAnswer, onSpeak, onSpeakSlow, showHint = true }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [eliminated, setEliminated] = useState<Set<string>>(new Set());
  const [usedHint, setUsedHint] = useState(false);
  const emoji = wordEmojiMap[word.word.toLowerCase()];

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    onAnswer(option, usedHint);
  };

  const handleHint = () => {
    if (usedHint) return;
    setUsedHint(true);
    // 50/50: 오답 2개 제거
    const wrongOptions = options.filter(o => o !== word.meaning);
    const toEliminate = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminated(new Set(toEliminate));
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
        {/* 문제 영역 */}
        <div className="text-center mb-8">
          {emoji && <span className="text-5xl block mb-3">{emoji}</span>}

          <div className="flex items-center justify-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-blue-600"
              onClick={() => onSpeak(word.word)}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            <span className="text-2xl font-bold text-gray-800">{word.word}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-blue-400"
              onClick={() => onSpeakSlow(word.word)}
            >
              <Turtle className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-400">[{word.pronunciation}]</p>
          <p className="text-lg font-medium text-gray-600 mt-3">이 단어의 뜻은?</p>
        </div>

        {/* 보기 */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {options.map((option, idx) => {
            const isEliminated = eliminated.has(option);
            const isSelected = selected === option;
            const isCorrect = option === word.meaning;
            const showResult = selected !== null;

            let bgColor = 'bg-gray-50 hover:bg-gray-100 border-gray-200';
            if (isEliminated) {
              bgColor = 'bg-gray-100 border-gray-200 opacity-30';
            } else if (showResult && isSelected && isCorrect) {
              bgColor = 'border-2';
            } else if (showResult && isSelected && !isCorrect) {
              bgColor = 'border-2';
            } else if (showResult && isCorrect) {
              bgColor = 'border-2';
            }

            return (
              <motion.button
                key={idx}
                variants={buttonVariants}
                whileHover={!selected && !isEliminated ? 'hover' : undefined}
                whileTap={!selected && !isEliminated ? 'tap' : undefined}
                onClick={() => !isEliminated && handleSelect(option)}
                disabled={!!selected || isEliminated}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 text-lg font-medium transition-colors min-h-[56px] ${bgColor}`}
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

        {/* 힌트 버튼 */}
        {showHint && !selected && (
          <Button
            variant="outline"
            onClick={handleHint}
            disabled={usedHint}
            className="w-full text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {usedHint ? '힌트 사용됨 (50/50)' : '힌트 쓰기 (50/50)'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
