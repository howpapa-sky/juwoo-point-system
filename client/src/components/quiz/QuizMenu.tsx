// 퀴즈 메뉴 화면 — 모드/난이도/카테고리 선택
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, MousePointer, Keyboard, Headphones, BookOpen,
  Image, Shuffle, Clock, Timer, Swords, Shield, Link2,
  Zap, Gamepad2, Settings, Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { QuizMode, ThemeKey } from '@/lib/quizConstants';
import { QUIZ_THEMES, ALL_BADGES } from '@/lib/quizConstants';
import type { WordCategory, WordDifficulty } from '@/data/englishWordsData';
import { wordCategories, categoryEmojis } from '@/data/englishWordsData';

interface Props {
  theme: ThemeKey;
  streak?: number;
  onStart: (mode: QuizMode, difficulty: WordDifficulty | 'all', category: WordCategory | 'all') => void;
  onThemeChange: (theme: ThemeKey) => void;
  onSettings: () => void;
  playSound: (type: 'click') => void;
}

const gameModes: { id: QuizMode; name: string; icon: React.ReactNode; desc: string; color: string; isNew?: boolean }[] = [
  { id: 'mixed', name: '믹스', icon: <Sparkles className="h-6 w-6" />, desc: '다양한 유형 섞기', color: 'purple' },
  { id: 'multiple-choice', name: '객관식', icon: <MousePointer className="h-6 w-6" />, desc: '3지선다', color: 'blue' },
  { id: 'typing', name: '타이핑', icon: <Keyboard className="h-6 w-6" />, desc: '직접 입력', color: 'green' },
  { id: 'listening', name: '듣기', icon: <Headphones className="h-6 w-6" />, desc: '발음 듣고 맞추기', color: 'pink' },
  { id: 'reverse', name: '한→영', icon: <BookOpen className="h-6 w-6" />, desc: '영어로 답하기', color: 'orange' },
  { id: 'picture-match', name: '그림 맞추기', icon: <Image className="h-6 w-6" />, desc: '이모지 매칭', color: 'cyan' },
  { id: 'word-scramble', name: '철자 퍼즐', icon: <Shuffle className="h-6 w-6" />, desc: '섞인 글자 배열', color: 'yellow' },
  { id: 'matching', name: '짝맞추기', icon: <Link2 className="h-6 w-6" />, desc: '영어↔한글 연결', color: 'emerald', isNew: true },
  { id: 'fill-blank', name: '빈칸 채우기', icon: <BookOpen className="h-6 w-6" />, desc: '문장 속 빈칸', color: 'amber', isNew: true },
  { id: 'speed-round', name: '스피드', icon: <Clock className="h-6 w-6" />, desc: '60초 도전', color: 'teal' },
  { id: 'time-attack', name: '타임어택', icon: <Timer className="h-6 w-6" />, desc: '최단 시간 도전', color: 'amber' },
  { id: 'boss-battle', name: '보스 배틀', icon: <Swords className="h-6 w-6" />, desc: '포켓몬 보스전', color: 'violet' },
  { id: 'survival', name: '서바이벌', icon: <Shield className="h-6 w-6" />, desc: '에너지가 바닥나기 전까지', color: 'slate' },
];

export default function QuizMenu({ theme, streak, onStart, onThemeChange, onSettings, playSound }: Props) {
  const [difficulty, setDifficulty] = useState<WordDifficulty | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | 'all'>('all');
  const currentTheme = QUIZ_THEMES[theme];
  const earnedBadges = ALL_BADGES.filter(b => b.earned);

  const startGame = (mode?: QuizMode) => {
    onStart(mode ?? 'mixed', difficulty, selectedCategory);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.secondary}`}>
      <div className="container max-w-4xl py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-2xl bg-white/95 backdrop-blur border-2">
            <CardContent className="p-6">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className={`text-3xl font-bold bg-gradient-to-r ${currentTheme.primary} bg-clip-text text-transparent`}>
                    영어 퀴즈
                  </h1>
                  {streak !== undefined && streak > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-amber-600">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-bold">{streak}일 연속 학습중!</span>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={onSettings}>
                  <Settings className="h-5 w-5 text-gray-500" />
                </Button>
              </div>

              {/* 테마 선택 */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {(Object.entries(QUIZ_THEMES) as [ThemeKey, typeof QUIZ_THEMES[ThemeKey]][]).map(([key, t]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { onThemeChange(key); playSound('click'); }}
                    className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium flex-shrink-0 ${
                      theme === key
                        ? `bg-gradient-to-r ${t.primary} text-white border-transparent`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {t.icon} {t.name}
                  </motion.button>
                ))}
              </div>

              {/* 게임 모드 */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-blue-600" />
                  게임 모드
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {gameModes.map((mode, i) => (
                    <motion.button
                      key={mode.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startGame(mode.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left bg-white hover:shadow-lg ${
                        mode.isNew ? 'border-yellow-400' : 'border-gray-200'
                      }`}
                    >
                      {mode.isNew && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                          NEW
                        </span>
                      )}
                      <div className={`text-${mode.color}-500 mb-2`}>{mode.icon}</div>
                      <div className="font-bold">{mode.name}</div>
                      <p className="text-xs text-muted-foreground">{mode.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 난이도 선택 (빨간색 안 씀!) */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  난이도
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'all', label: '전체', color: 'purple' },
                    { value: 'easy', label: '쉬움', color: 'green' },
                    { value: 'medium', label: '보통', color: 'yellow' },
                    { value: 'hard', label: '어려움', color: 'orange' },  // orange, not red!
                    { value: 'expert', label: '전문가', color: 'violet' },
                  ].map(d => (
                    <motion.button
                      key={d.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setDifficulty(d.value as WordDifficulty | 'all'); playSound('click'); }}
                      className={`p-3 rounded-xl border-2 font-bold transition-all ${
                        difficulty === d.value
                          ? `bg-${d.color}-100 border-${d.color}-400 text-${d.color}-700`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {d.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 카테고리 선택 */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  카테고리
                </h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedCategory('all'); playSound('click'); }}
                    className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                      selectedCategory === 'all'
                        ? `bg-gradient-to-r ${currentTheme.primary} text-white border-transparent`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    🌈 전체
                  </motion.button>
                  {wordCategories.map(cat => (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedCategory(cat); playSound('click'); }}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                        selectedCategory === cat
                          ? `bg-gradient-to-r ${currentTheme.primary} text-white border-transparent`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {categoryEmojis[cat]} {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 배지 */}
              {earnedBadges.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    🏅 획득 배지
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {earnedBadges.map(badge => (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        className="text-2xl cursor-pointer"
                        title={`${badge.name}: ${badge.condition}`}
                      >
                        {badge.icon}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 빠른 시작 */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={() => startGame()}
                  className={`w-full bg-gradient-to-r ${currentTheme.primary} hover:opacity-90 text-white font-bold text-xl py-6 shadow-lg`}
                >
                  <Zap className="h-6 w-6 mr-2" />
                  빠른 시작 (믹스 모드)
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
