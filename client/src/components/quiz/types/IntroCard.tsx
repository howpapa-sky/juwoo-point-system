// 새 단어 소개 카드 — 퀴즈 전 학습 (평가 없음, 불안 자극 제로)
import { motion } from 'framer-motion';
import { Volume2, Turtle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardVariants } from '@/lib/quizAnimations';
import type { EnglishWord } from '@/data/englishWordsData';
import { wordEmojiMap } from '@/lib/quizEngine';

interface Props {
  word: EnglishWord;
  onComplete: () => void;
  onSpeak: (text: string) => void;
  onSpeakSlow: (text: string) => void;
}

export default function IntroCard({ word, onComplete, onSpeak, onSpeakSlow }: Props) {
  const emoji = wordEmojiMap[word.word.toLowerCase()] ?? '📖';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 shadow-lg border-2 border-purple-200">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <span className="inline-block bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold">
            🌟 새로운 단어!
          </span>
        </div>

        {/* 이모지 */}
        <div className="text-center mb-4">
          <span className="text-6xl">{emoji}</span>
        </div>

        {/* 영단어 + 발음 */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-blue-600 hover:bg-blue-100"
              onClick={() => onSpeak(word.word)}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
            <span className="text-3xl font-bold text-gray-800">{word.word}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-blue-400 hover:bg-blue-100"
              onClick={() => onSpeakSlow(word.word)}
              title="느리게 듣기"
            >
              <Turtle className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-lg text-gray-500 mt-1">[{word.pronunciation}]</p>
        </div>

        {/* 한글 뜻 */}
        <div className="text-center mb-6">
          <span className="text-2xl font-bold text-purple-700">{word.meaning}</span>
        </div>

        {/* 예문 */}
        <div className="bg-white/80 rounded-xl p-4 mb-6">
          <p className="text-base text-gray-700 font-medium mb-1">
            📝 &quot;{word.example}&quot;
          </p>
          <p className="text-sm text-gray-500">
            ({word.exampleKorean})
          </p>
        </div>

        {/* 팁 */}
        {word.tip && (
          <div className="bg-yellow-50 rounded-xl p-3 mb-6 text-center">
            <p className="text-sm text-yellow-700">💡 {word.tip}</p>
          </div>
        )}

        {/* 확인 버튼 */}
        <Button
          onClick={onComplete}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-6 rounded-xl"
        >
          알겠어요! ✓
        </Button>
      </div>
    </motion.div>
  );
}
