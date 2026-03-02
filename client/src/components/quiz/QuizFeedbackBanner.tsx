// 듀오링고식 정답/오답 피드백 배너
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bannerSlideUp } from '@/lib/quizAnimations';
import { QUIZ_COLORS } from '@/lib/quizConstants';
import type { EnglishWord } from '@/data/englishWordsData';

interface Props {
  visible: boolean;
  isCorrect: boolean;
  word: EnglishWord;
  buddyMessage: string;
  onNext: () => void;
  onSpeak: (text: string) => void;
}

export default function QuizFeedbackBanner({ visible, isCorrect, word, buddyMessage, onNext, onSpeak }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={bannerSlideUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div
            className="p-5 pb-8 rounded-t-3xl shadow-2xl"
            style={{ backgroundColor: isCorrect ? QUIZ_COLORS.correct : QUIZ_COLORS.incorrect }}
          >
            <div className="max-w-2xl mx-auto text-white">
              {/* 상태 아이콘 + 메시지 */}
              <div className="flex items-center gap-3 mb-3">
                {isCorrect ? (
                  <CheckCircle className="h-7 w-7 flex-shrink-0" />
                ) : (
                  <span className="text-2xl flex-shrink-0">💡</span>
                )}
                <span className="text-lg font-bold">
                  {isCorrect ? '정답이에요!' : '아쉬워요!'}
                </span>
              </div>

              {/* 영단이 대사 */}
              <div className="flex items-start gap-2 mb-3 bg-white/20 rounded-xl p-3">
                <span className="text-xl">🤖</span>
                <span className="font-medium">{buddyMessage}</span>
              </div>

              {/* 단어 정보 */}
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => onSpeak(word.word)}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
                <span className="font-bold text-lg">
                  {isCorrect ? '' : '정답은 '}{word.word} [{word.pronunciation}] = {word.meaning}
                </span>
              </div>

              {/* 예문 */}
              <p className="text-sm opacity-90 mb-1">📝 {word.example}</p>
              <p className="text-xs opacity-75 mb-4">{word.exampleKorean}</p>

              {/* 다음 버튼 */}
              <Button
                onClick={onNext}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold text-lg py-6 rounded-xl"
              >
                다음 ➡️
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
