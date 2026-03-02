// 철자 배열 퀴즈 — 글자를 순서대로 탭해서 단어 완성
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Turtle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardVariants } from '@/lib/quizAnimations';
import { QUIZ_COLORS } from '@/lib/quizConstants';
import type { EnglishWord } from '@/data/englishWordsData';
import { wordEmojiMap } from '@/lib/quizEngine';

interface Props {
  word: EnglishWord;
  scrambledLetters: string[];
  onAnswer: (answer: string, usedHint: boolean) => void;
  onSpeak: (text: string) => void;
  onSpeakSlow: (text: string) => void;
  showFirstLetter?: boolean;
}

export default function SpellingQuiz({
  word, scrambledLetters, onAnswer, onSpeak, onSpeakSlow,
  showFirstLetter = false,
}: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const emoji = wordEmojiMap[word.word.toLowerCase()];

  const currentWord = selected.map(idx => scrambledLetters[idx]).join('');
  const isComplete = currentWord.length === word.word.length;

  const handleLetterTap = useCallback((idx: number) => {
    if (submitted) return;
    if (selected.includes(idx)) return;
    const newSelected = [...selected, idx];
    setSelected(newSelected);

    // 자동 제출 (모든 글자를 배치하면)
    if (newSelected.length === scrambledLetters.length) {
      const answer = newSelected.map(i => scrambledLetters[i]).join('');
      setSubmitted(true);
      onAnswer(answer, showFirstLetter);
    }
  }, [selected, submitted, scrambledLetters, onAnswer, showFirstLetter]);

  const handleUndo = () => {
    if (submitted) return;
    setSelected(prev => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (submitted) return;
    setSelected([]);
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
        <div className="text-center mb-6">
          <span className="inline-block bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-bold">
            🔤 글자를 순서대로 눌러요!
          </span>
        </div>

        {/* 단어 뜻 + 발음 */}
        <div className="text-center mb-6">
          {emoji && <span className="text-4xl block mb-2">{emoji}</span>}
          <p className="text-2xl font-bold text-gray-700 mb-2">{word.meaning}</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600"
              onClick={() => onSpeak(word.word)}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            <span className="text-sm text-gray-400">[{word.pronunciation}]</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-400"
              onClick={() => onSpeakSlow(word.word)}
            >
              <Turtle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 답 표시 영역 */}
        <div className="flex items-center justify-center gap-1.5 mb-6 min-h-[56px]">
          {word.word.split('').map((_, idx) => {
            const letter = selected[idx] !== undefined ? scrambledLetters[selected[idx]] : '';
            const isFirstFixed = showFirstLetter && idx === 0;
            const isCorrectPos = submitted && letter.toLowerCase() === word.word[idx].toLowerCase();
            const isWrongPos = submitted && letter && !isCorrectPos;

            return (
              <motion.div
                key={idx}
                layout
                className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold ${
                  isFirstFixed
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : isCorrectPos
                      ? 'border-2'
                      : isWrongPos
                        ? 'border-2'
                        : letter
                          ? 'bg-gray-100 border-gray-300 text-gray-800'
                          : 'bg-gray-50 border-gray-200 border-dashed'
                }`}
                style={
                  isCorrectPos
                    ? { borderColor: QUIZ_COLORS.correct, backgroundColor: `${QUIZ_COLORS.correct}15` }
                    : isWrongPos
                      ? { borderColor: QUIZ_COLORS.incorrect, backgroundColor: `${QUIZ_COLORS.incorrect}15` }
                      : undefined
                }
                onClick={() => {
                  if (!submitted && selected[idx] !== undefined && !isFirstFixed) {
                    // 탭하면 되돌리기
                    setSelected(prev => prev.filter((_, i) => i !== idx));
                  }
                }}
              >
                {isFirstFixed ? word.word[0] : letter}
              </motion.div>
            );
          })}
        </div>

        {/* 글자 선택 영역 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {scrambledLetters.map((letter, idx) => {
            const isUsed = selected.includes(idx);
            const isFirstFixed = showFirstLetter && scrambledLetters[idx].toLowerCase() === word.word[0].toLowerCase() && idx === selected[0];

            return (
              <motion.button
                key={idx}
                whileHover={!isUsed && !submitted ? { scale: 1.1 } : undefined}
                whileTap={!isUsed && !submitted ? { scale: 0.9 } : undefined}
                onClick={() => handleLetterTap(idx)}
                disabled={isUsed || submitted}
                className={`w-12 h-12 rounded-xl border-2 text-xl font-bold transition-all ${
                  isUsed || isFirstFixed
                    ? 'bg-gray-100 border-gray-200 text-gray-300'
                    : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100 shadow-sm'
                }`}
              >
                {letter}
              </motion.button>
            );
          })}
        </div>

        {/* 리셋/되돌리기 */}
        {!submitted && (
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={selected.length === 0}>
              ← 되돌리기
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} disabled={selected.length === 0}>
              <RotateCcw className="h-3 w-3 mr-1" />
              초기화
            </Button>
          </div>
        )}

        {/* 완성 표시 */}
        {isComplete && !submitted && (
          <div className="text-center mt-3">
            <span className="text-sm text-green-600 font-medium">모든 글자를 배치했어요!</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
