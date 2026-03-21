// ============================================
// 플래시카드 학습 — 리팩토링 완료
// 기존 1,689줄 → 슬림 오케스트레이터 + 모듈 분리
// ============================================
import { useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RotateCcw, Brain, Sparkles, Star,
  Target, BookOpen, Shuffle, Music, Rocket,
  Check, Flame, Zap,
} from 'lucide-react';
import type { WordCategory, WordDifficulty } from '@/data/englishWordsData';

import { useFlashCardSession } from '@/components/flashcard/useFlashCardSession';
import FlashCardProgress from '@/components/flashcard/FlashCardProgress';
import FlashCardDeck from '@/components/flashcard/FlashCardDeck';
import { ClassicQuizCard, SpellingCard, ListeningCard, getCategoryTheme } from '@/components/flashcard/FlashCardItem';

export default function FlashCard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const session = useFlashCardSession();

  // 매칭 게임 완료 체크
  useEffect(() => {
    if (session.mode === 'matching' && session.matchCards.length > 0) {
      if (session.matchCards.every(c => c.isMatched)) {
        setTimeout(() => session.finishGame(), 1000);
      }
    }
  }, [session.matchCards, session.mode]);

  // 로딩
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 p-4">
        <Card className="max-w-md w-full border-2 border-purple-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold mb-4">로그인이 필요해요!</h2>
            <a href={getLoginUrl()}>
              <Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // 설정 화면
  // ============================================
  if (session.phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100">
        <div className="container max-w-4xl py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/english-learning">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />돌아가기
              </Button>
            </Link>
          </div>

          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold mb-4">
              <Sparkles className="h-4 w-4" />우주어 해독 카드<Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
              플래시카드 학습 🃏
            </h1>
            <p className="text-lg text-muted-foreground">재미있게 우주어를 배워봐요!</p>
          </motion.div>

          {/* 학습 모드 */}
          <Card className="mb-6 border-2 border-purple-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="h-5 w-5" />학습 모드 선택
              </h2>
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {([
                  { id: 'classic' as const, icon: <Target className="h-8 w-8" />, label: '뜻 맞추기', desc: '3지선다', color: 'from-blue-500 to-cyan-500' },
                  { id: 'matching' as const, icon: <Shuffle className="h-8 w-8" />, label: '매칭 게임', desc: '짝 맞추기', color: 'from-green-500 to-emerald-500' },
                  { id: 'spelling' as const, icon: <Brain className="h-8 w-8" />, label: '스펠링', desc: '철자 맞추기', color: 'from-orange-500 to-amber-500' },
                  { id: 'listening' as const, icon: <Music className="h-8 w-8" />, label: '듣기', desc: '귀로 배우기', color: 'from-purple-500 to-pink-500' },
                ]).map((m) => (
                  <motion.button
                    key={m.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => session.setMode(m.id)}
                    className={`p-4 rounded-xl border-3 transition-all ${
                      session.mode === m.id
                        ? `border-purple-500 bg-gradient-to-br ${m.color} text-white shadow-lg`
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className={`mb-2 ${session.mode === m.id ? 'text-white' : 'text-gray-600'}`}>{m.icon}</div>
                    <div className="font-bold text-sm">{m.label}</div>
                    <div className={`text-xs ${session.mode === m.id ? 'text-white/80' : 'text-gray-400'}`}>{m.desc}</div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 카테고리 */}
          <Card className="mb-6 border-2 border-purple-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />카테고리 선택 <span className="text-sm font-normal opacity-80">(선택 안하면 전체)</span>
              </h2>
            </div>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {session.availableCategories.map((cat) => {
                  const theme = getCategoryTheme(cat);
                  const isSelected = session.selectedCategories.includes(cat);
                  return (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        session.setSelectedCategories(prev =>
                          isSelected ? prev.filter(c => c !== cat) : [...prev, cat]
                        );
                      }}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md`
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {theme.icon} {cat}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 난이도 & 카드 수 */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="border-2 border-purple-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Star className="h-5 w-5" />난이도</h2>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'all' as const, label: '자동 추천', desc: '맞춤 난이도' },
                    { id: 'easy' as WordDifficulty, label: '쉬움', desc: '기초 단어' },
                    { id: 'medium' as WordDifficulty, label: '보통', desc: '도전해보자' },
                    { id: 'hard' as WordDifficulty, label: '어려움', desc: '실력 UP' },
                  ]).map((d) => (
                    <motion.button
                      key={d.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => session.setSelectedDifficulty(d.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        session.selectedDifficulty === d.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="font-bold text-sm">{d.label}</div>
                      <div className="text-xs text-gray-500">{d.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen className="h-5 w-5" />카드 개수</h2>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <motion.button
                      key={count}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => session.setCardCount(count)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        session.cardCount === count ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-black text-2xl text-center">{count}</div>
                      <div className="text-xs text-gray-500 text-center">장</div>
                    </motion.button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground text-center">
                  선택 가능: {session.filteredWords.length}개 단어
                </p>
              </CardContent>
            </Card>
          </div>

          <Button
            size="lg"
            onClick={session.startGame}
            disabled={session.filteredWords.length === 0}
            className="w-full h-16 text-xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 shadow-xl"
            style={{ minHeight: 64 }}
          >
            <Rocket className="h-6 w-6 mr-2" />학습 시작! 🚀
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // 결과 화면
  // ============================================
  if (session.phase === 'result') {
    const accuracy = session.stats.totalCards > 0
      ? Math.round((session.stats.knownCards / session.stats.totalCards) * 100) : 0;
    const isPerfect = accuracy === 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100">
        <div className="container max-w-4xl py-6 px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
            <Card className="border-4 border-yellow-400 shadow-2xl overflow-hidden">
              <div className={`p-6 text-center ${isPerfect ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                <div className="text-8xl mb-2">
                  {isPerfect ? '👑' : accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🎉' : '💪'}
                </div>
                <h1 className="text-4xl font-black text-white mb-2">
                  {isPerfect ? '퍼펙트!!' : '학습 완료!'}
                </h1>
                <p className="text-white/90 text-lg">
                  {isPerfect ? '모든 단어를 맞췄어요! 천재야! 🌟'
                    : accuracy >= 80 ? '아주 잘했어요! 대단해! 🎊'
                    : accuracy >= 60 ? '잘했어요! 조금만 더 연습하면 완벽해요! 💫'
                    : '좋아요! 계속 연습하면 더 잘할 수 있어요! 🔥'}
                </p>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: <Check className="h-8 w-8 text-green-600" />, value: session.stats.knownCards, label: '맞힌 단어', cls: 'from-green-100 to-emerald-100 border-green-300' },
                    { icon: <Target className="h-8 w-8 text-blue-600" />, value: `${accuracy}%`, label: '정확도', cls: 'from-blue-100 to-cyan-100 border-blue-300' },
                    { icon: <Flame className="h-8 w-8 text-orange-600" />, value: session.stats.maxStreak, label: '최대 연속', cls: 'from-orange-100 to-amber-100 border-orange-300' },
                    { icon: <Zap className="h-8 w-8 text-purple-600" />, value: `+${session.stats.xp}`, label: 'XP 획득', cls: 'from-purple-100 to-pink-100 border-purple-300' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * (i + 1) }}
                      className={`bg-gradient-to-br ${item.cls} p-4 rounded-xl border-2 text-center`}
                    >
                      <div className="mx-auto mb-1 w-fit">{item.icon}</div>
                      <div className="text-3xl font-black">{item.value}</div>
                      <div className="text-sm">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button size="lg" onClick={session.resetGame} className="h-14 bg-gradient-to-r from-purple-500 to-pink-500">
                    <RotateCcw className="h-5 w-5 mr-2" />다시 학습하기
                  </Button>
                  <Link href="/english-quiz">
                    <Button size="lg" variant="outline" className="w-full h-14 border-2">
                      <Brain className="h-5 w-5 mr-2" />퀴즈 도전
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

  // ============================================
  // 학습 화면
  // ============================================
  const theme = session.currentWord ? getCategoryTheme(session.currentWord.category) : getCategoryTheme('동물' as any);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} transition-colors duration-500`}>
      <div className="container max-w-4xl py-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={session.resetGame} className="gap-1">
            <ArrowLeft className="h-4 w-4" />설정
          </Button>
        </div>

        <FlashCardProgress
          mode={session.mode}
          currentIndex={session.currentIndex}
          totalWords={session.words.length}
          matchedPairs={session.matchedPairs}
          matchCards={session.matchCards}
          stats={session.stats}
        />

        {/* 스트릭 애니메이션 */}
        <AnimatePresence>
          {session.showStreakAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-6xl font-black text-orange-500 drop-shadow-lg">
                🔥 {session.stats.streak} 연속! 🔥
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 플로팅 XP */}
        <AnimatePresence>
          {session.floatingXp && (
            <motion.div
              key={session.floatingXp.id}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -50, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-1/3 left-1/2 transform -translate-x-1/2 text-2xl font-black text-purple-600 z-50 pointer-events-none"
            >
              +{session.floatingXp.amount} XP
            </motion.div>
          )}
        </AnimatePresence>

        {/* 클래식 모드 */}
        {session.mode === 'classic' && session.currentWord && (
          <ClassicQuizCard
            word={session.currentWord}
            options={session.classicOptions}
            selectedAnswer={session.selectedClassicAnswer}
            isAnswered={session.isClassicAnswered}
            srsBox={session.wordSrsBoxes[session.currentWord.word]}
            onAnswer={session.handleClassicAnswer}
            onSpeak={session.speak}
            difficultyLabel={session.difficultyConfig[session.currentWord.difficulty].label}
            difficultyStars={session.difficultyConfig[session.currentWord.difficulty].stars}
          />
        )}

        {/* 매칭 모드 */}
        {session.mode === 'matching' && (
          <FlashCardDeck
            cards={session.matchCards}
            selectedCards={session.selectedMatchCards}
            matchMoves={session.matchMoves}
            onCardClick={session.handleMatchCardClick}
          />
        )}

        {/* 스펠링 모드 */}
        {session.mode === 'spelling' && session.currentWord && (
          <SpellingCard
            word={session.currentWord}
            srsBox={session.wordSrsBoxes[session.currentWord.word]}
            hintText={session.getSpellingHintText()}
            input={session.spellingInput}
            onInputChange={session.setSpellingInput}
            onSubmit={session.handleSpellingSubmit}
            onHint={session.handleSpellingHint}
            onNext={session.nextCard}
            onSpeak={session.speak}
            hintCount={session.spellingHint}
            showAnswer={session.showSpellingAnswer}
          />
        )}

        {/* 듣기 모드 */}
        {session.mode === 'listening' && session.currentWord && (
          <ListeningCard
            word={session.currentWord}
            options={session.listeningOptions}
            selectedAnswer={session.selectedListeningAnswer}
            isAnswered={session.isListeningAnswered}
            srsBox={session.wordSrsBoxes[session.currentWord.word]}
            onAnswer={session.handleListeningAnswer}
            onPlay={session.playCurrentWord}
          />
        )}
      </div>
    </div>
  );
}
