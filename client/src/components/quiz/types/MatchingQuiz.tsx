// 매칭 짝맞추기 퀴즈 — 듀오링고 핵심 유형
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cardVariants } from '@/lib/quizAnimations';
import { QUIZ_COLORS } from '@/lib/quizConstants';
import type { EnglishWord } from '@/data/englishWordsData';

interface MatchPair {
  word: EnglishWord;
  matched: boolean;
}

interface Props {
  pairs: EnglishWord[];  // 4~5개 단어
  onComplete: (correctCount: number, totalPairs: number) => void;
  onSpeak: (text: string) => void;
}

export default function MatchingQuiz({ pairs, onComplete, onSpeak }: Props) {
  const [matchPairs] = useState<MatchPair[]>(() =>
    pairs.map(word => ({ word, matched: false }))
  );
  const [shuffledEnglish] = useState<string[]>(() =>
    [...pairs].sort(() => Math.random() - 0.5).map(w => w.word)
  );
  const [shuffledKorean] = useState<string[]>(() =>
    [...pairs].sort(() => Math.random() - 0.5).map(w => w.meaning)
  );
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedKorean, setSelectedKorean] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const checkMatch = useCallback((english: string, korean: string) => {
    const matchWord = matchPairs.find(p => p.word.word === english);
    if (matchWord && matchWord.word.meaning === korean) {
      // 정답!
      onSpeak(english);
      const newMatched = new Set(matchedPairs);
      newMatched.add(english);
      setMatchedPairs(newMatched);
      setCorrectCount(prev => prev + 1);
      setSelectedEnglish(null);
      setSelectedKorean(null);

      // 모든 짝을 맞추면 완료
      if (newMatched.size === matchPairs.length) {
        setTimeout(() => onComplete(correctCount + 1, matchPairs.length), 500);
      }
    } else {
      // 오답
      setWrongFlash(true);
      setTimeout(() => {
        setWrongFlash(false);
        setSelectedEnglish(null);
        setSelectedKorean(null);
      }, 500);
    }
  }, [matchPairs, matchedPairs, correctCount, onComplete, onSpeak]);

  const handleEnglishSelect = (word: string) => {
    if (matchedPairs.has(word)) return;
    setSelectedEnglish(word);
    if (selectedKorean) {
      checkMatch(word, selectedKorean);
    }
  };

  const handleKoreanSelect = (meaning: string) => {
    // 이미 매칭된 뜻인지 확인
    const isMatched = matchPairs.some(p => p.word.meaning === meaning && matchedPairs.has(p.word.word));
    if (isMatched) return;
    setSelectedKorean(meaning);
    if (selectedEnglish) {
      checkMatch(selectedEnglish, meaning);
    }
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
          <span className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold">
            🔗 짝을 맞춰보세요!
          </span>
          <p className="text-sm text-gray-400 mt-2">
            영어와 뜻을 하나씩 터치해서 연결해요
          </p>
        </div>

        {/* 매칭 영역 — 2열 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 영어 열 */}
          <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center font-medium mb-1">🇺🇸 영어</p>
            <AnimatePresence>
              {shuffledEnglish.map(word => {
                const isMatched = matchedPairs.has(word);
                const isSelected = selectedEnglish === word;

                return (
                  <motion.button
                    key={word}
                    layout
                    onClick={() => handleEnglishSelect(word)}
                    disabled={isMatched}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-base font-bold transition-all min-h-[48px] ${
                      isMatched
                        ? 'border-green-300 bg-green-50 opacity-50'
                        : isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : wrongFlash && isSelected
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    style={isMatched ? { borderColor: QUIZ_COLORS.correct } : undefined}
                  >
                    {isMatched ? `✓ ${word}` : word}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* 한글 열 */}
          <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center font-medium mb-1">🇰🇷 뜻</p>
            <AnimatePresence>
              {shuffledKorean.map(meaning => {
                const matchWord = matchPairs.find(p => p.word.meaning === meaning);
                const isMatched = matchWord ? matchedPairs.has(matchWord.word.word) : false;
                const isSelected = selectedKorean === meaning;

                return (
                  <motion.button
                    key={meaning}
                    layout
                    onClick={() => handleKoreanSelect(meaning)}
                    disabled={isMatched}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-base font-bold transition-all min-h-[48px] ${
                      isMatched
                        ? 'border-green-300 bg-green-50 opacity-50'
                        : isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : wrongFlash && isSelected
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    style={isMatched ? { borderColor: QUIZ_COLORS.correct } : undefined}
                  >
                    {isMatched ? `✓ ${meaning}` : meaning}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* 진행률 */}
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">
            {matchedPairs.size} / {matchPairs.length} 완료
          </span>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: QUIZ_COLORS.correct }}
              animate={{ width: `${(matchedPairs.size / matchPairs.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
