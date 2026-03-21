// 듀오링고식 정답/오답 피드백 배너 — Phase 2 강화
// 정답: 초록(#4CAF50) + confetti + 포인트 카운트업
// 오답: 주황(#FF9600) + 정답 TTS + 실수 친구 안내 + mild shake
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bannerSlideUp } from '@/lib/quizAnimations';
import { COLORS } from '@/lib/designTokens';
import type { EnglishWord } from '@/data/englishWordsData';

interface Props {
  visible: boolean;
  isCorrect: boolean;
  word: EnglishWord;
  buddyMessage: string;
  onNext: () => void;
  onSpeak: (text: string) => void;
  newMistakeFriend?: boolean;
  pointsEarned?: number;
}

export default function QuizFeedbackBanner({
  visible, isCorrect, word, buddyMessage, onNext, onSpeak,
  newMistakeFriend, pointsEarned,
}: Props) {
  // 오답 시 자동 TTS
  useEffect(() => {
    if (visible && !isCorrect) {
      const timer = setTimeout(() => onSpeak(word.word), 500);
      return () => clearTimeout(timer);
    }
  }, [visible, isCorrect, word.word, onSpeak]);

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
          {/* 오답 시 mild shake */}
          <motion.div
            animate={isCorrect ? {} : { x: [-3, 3, -3, 0], transition: { duration: 0.3 } }}
          >
            <div
              className="p-5 pb-8 rounded-t-3xl shadow-2xl"
              style={{ backgroundColor: isCorrect ? COLORS.success : COLORS.incorrect }}
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
                    {isCorrect ? '정답이에요!' : '아까워!'}
                  </span>
                  {isCorrect && pointsEarned != null && pointsEarned > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="ml-auto px-3 py-1 bg-white/20 rounded-full text-sm font-bold"
                    >
                      +{pointsEarned}P
                    </motion.span>
                  )}
                </div>

                {/* 영단이 대사 */}
                <div className="flex items-start gap-2 mb-3 bg-white/20 rounded-xl p-3">
                  <motion.span
                    className="text-xl"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🤖
                  </motion.span>
                  <span className="font-medium">{buddyMessage}</span>
                </div>

                {/* 단어 정보 */}
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white hover:bg-white/20"
                    onClick={() => onSpeak(word.word)}
                    style={{ minWidth: 48, minHeight: 48 }}
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <span className="font-bold text-lg">
                    {isCorrect ? '' : '정답은 '}{word.word} [{word.pronunciation}] = {word.meaning}
                  </span>
                </div>

                {/* 예문 */}
                <p className="text-sm opacity-90 mb-1">📝 {word.example}</p>
                <p className="text-xs opacity-75 mb-3">{word.exampleKorean}</p>

                {/* 실수 친구 안내 (오답 시) */}
                {!isCorrect && newMistakeFriend && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/15 rounded-xl p-3 mb-3 flex items-center gap-2"
                  >
                    <span className="text-xl">🤝</span>
                    <span className="text-sm font-medium">
                      새로운 실수 친구가 생겼어! 도감에서 만나보자!
                    </span>
                  </motion.div>
                )}

                {/* 다음 버튼 */}
                <Button
                  onClick={onNext}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-bold text-lg py-6 rounded-xl"
                  style={{ minHeight: 56 }}
                >
                  다음 ➡️
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
