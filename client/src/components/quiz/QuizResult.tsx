// 퀴즈 결과 화면 — 모든 완료에 축하 (실패 개념 없음)
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, RotateCcw, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import confetti from 'canvas-confetti';
import type { ThemeKey } from '@/lib/quizConstants';
import { QUIZ_THEMES, LEVEL_TITLES } from '@/lib/quizConstants';
import { calculateStarRating, calculateXPRequired } from '@/lib/quizEngine';
import CharacterBuddy, { getBuddyMessage } from './CharacterBuddy';
import type { EnglishWord } from '@/data/englishWordsData';

interface Props {
  theme: ThemeKey;
  correctCount: number;
  totalQuestions: number;
  score: number;
  maxStreak: number;
  earnedXP: number;
  wrongWords: EnglishWord[];
  userLevel: number;
  currentXP: number;
  showLevelUp?: boolean;
  newBadge?: { name: string; icon: string } | null;
  modeName?: string;
  bossDefeated?: boolean;
  bossName?: string;
  speedCount?: number;
  onRestart: () => void;
  onSpeak: (text: string) => void;
}

export default function QuizResult({
  theme, correctCount, totalQuestions, score, maxStreak, earnedXP,
  wrongWords, userLevel, currentXP, showLevelUp, newBadge,
  modeName, bossDefeated, bossName, speedCount,
  onRestart, onSpeak,
}: Props) {
  const currentTheme = QUIZ_THEMES[theme];
  const stars = calculateStarRating(correctCount, totalQuestions);
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // 별 3개면 confetti (과도하지 않게)
  useEffect(() => {
    if (stars === 3) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  }, [stars]);

  // 레벨 칭호
  const levelTitle = [...LEVEL_TITLES].reverse().find(lt => userLevel >= lt.level);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.secondary}`}>
      <div className="container max-w-4xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Card className="border-4 border-yellow-400 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-6 md:p-8 text-center">
              {/* 트로피 */}
              <motion.div
                className="mb-4"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <motion.div
                  className="inline-block p-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Trophy className="h-16 w-16 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold mt-4 mb-1">
                  {bossDefeated
                    ? `${bossName} 처치! 🗡️`
                    : speedCount
                      ? `${speedCount}개 정답!`
                      : '퀴즈 완료!'}
                </h1>
                {modeName && (
                  <p className="text-sm text-gray-500">{modeName} 모드</p>
                )}
              </motion.div>

              {/* 영단이 메시지 */}
              <div className="mb-4">
                <CharacterBuddy message={getBuddyMessage('complete')} size="lg" />
              </div>

              {/* 레벨업 알림 */}
              <AnimatePresence>
                {showLevelUp && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-white"
                  >
                    <Crown className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-xl font-bold">🎉 레벨 업! Lv.{userLevel}</p>
                    {levelTitle && (
                      <p className="text-sm opacity-90">{levelTitle.icon} {levelTitle.title}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 새 배지 */}
              <AnimatePresence>
                {newBadge && (
                  <motion.div
                    initial={{ scale: 0, y: -50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 50 }}
                    className="mb-4 p-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl text-white"
                  >
                    <p className="text-3xl mb-2">{newBadge.icon}</p>
                    <p className="font-bold">새 배지 획득: {newBadge.name}!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 별점 */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.2, type: 'spring' }}
                  >
                    <Star
                      className={`h-14 w-14 ${
                        i <= stars ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* 점수 표시 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: '총 점수', value: score.toLocaleString(), color: 'blue', icon: '⭐' },
                  { label: '정답', value: `${correctCount}/${totalQuestions}`, color: 'green', icon: '✅' },
                  { label: '최대 연속', value: String(maxStreak), color: 'orange', icon: '🔥' },
                  { label: '획득 XP', value: `+${earnedXP}`, color: 'purple', icon: '✨' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`p-4 bg-${stat.color}-100 rounded-xl`}
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                    <div className={`text-sm text-${stat.color}-700`}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* 레벨 진행바 */}
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Lv.{userLevel} {levelTitle?.icon ?? ''}</span>
                  <span className="text-sm text-gray-600">
                    {currentXP} / {calculateXPRequired(userLevel)} XP
                  </span>
                </div>
                <div className="w-full h-4 bg-yellow-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentXP / calculateXPRequired(userLevel)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* 메시지 */}
              <motion.div
                className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-lg font-medium">
                  {scorePercent === 100 && '완벽해요! 영어 천재! 🏆'}
                  {scorePercent >= 90 && scorePercent < 100 && '대단해요! 영어 마스터! ⭐'}
                  {scorePercent >= 70 && scorePercent < 90 && '잘했어요! 영어 고수! 💪'}
                  {scorePercent >= 50 && scorePercent < 70 && '좋아요! 계속 성장중이야! 📚'}
                  {scorePercent < 50 && '끝까지 했어요! 대단해! 🌟'}
                </p>
              </motion.div>

              {/* 오늘 배운 단어 요약 */}
              {wrongWords.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 text-left">
                  <h3 className="font-bold text-amber-700 mb-2">📝 다시 봐야 할 단어</h3>
                  <div className="space-y-1">
                    {wrongWords.slice(0, 5).map(w => (
                      <div key={w.id} className="flex items-center gap-2 text-sm">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => onSpeak(w.word)}
                        >
                          🔊
                        </button>
                        <span className="font-medium">{w.word}</span>
                        <span className="text-gray-500">= {w.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-4 justify-center flex-wrap">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    onClick={onRestart}
                    className={`bg-gradient-to-r ${currentTheme.primary} text-white font-bold`}
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    한판 더!
                  </Button>
                </motion.div>
                <Link href="/english-learning">
                  <Button size="lg" variant="outline" className="font-bold">
                    오늘 끝!
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
