// ============================================
// 영어 단어 퀴즈 — 듀오링고급 퀄리티 (리팩토링 완료)
// 2025줄 모놀리스 → 슬림 오케스트레이터
// ============================================
import { useState, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import type { QuizMode, ThemeKey, GameState } from '@/lib/quizConstants';
import { QUIZ_THEMES } from '@/lib/quizConstants';
import { generateQuestions } from '@/lib/quizEngine';
import type { WordCategory, WordDifficulty } from '@/data/englishWordsData';
import type { QuizQuestion } from '@/lib/quizEngine';

import { useQuizSound } from '@/hooks/useQuizSound';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useDailyStreak } from '@/hooks/useDailyStreak';

import QuizMenu from '@/components/quiz/QuizMenu';
import QuizSessionManager, { type SessionResult } from '@/components/quiz/QuizSessionManager';
import QuizResult from '@/components/quiz/QuizResult';
import QuizSettings, { type QuizSettingsState, defaultSettings } from '@/components/quiz/QuizSettings';

export default function EnglishQuiz() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  // 상태
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('default');
  const [quizMode, setQuizMode] = useState<QuizMode>('mixed');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<QuizSettingsState>(defaultSettings);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  // XP/레벨 상태 (로컬 — DB 연동은 useQuizSession에서)
  const [userLevel, setUserLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newBadge, setNewBadge] = useState<{ name: string; icon: string } | null>(null);

  // 훅
  const { playSound, speakWord } = useQuizSound();
  const { awardPoints } = useQuizSession();
  const { currentStreak: dailyStreak, completeToday } = useDailyStreak();

  const theme = QUIZ_THEMES[currentTheme];

  // 게임 시작
  const handleStart = useCallback((mode: QuizMode, difficulty: WordDifficulty | 'all', category: WordCategory | 'all') => {
    const count = settings.questionCount;
    const qs = generateQuestions(mode, difficulty, category, count);
    setQuizMode(mode);
    setQuestions(qs);
    setSessionResult(null);
    setShowLevelUp(false);
    setNewBadge(null);
    setGameState('playing');
    playSound('click');
  }, [settings.questionCount, playSound]);

  // 세션 완료 처리
  const handleSessionComplete = useCallback(async (result: SessionResult) => {
    setSessionResult(result);

    // XP 적용
    const newXP = currentXP + result.earnedXP;
    const xpRequired = Math.floor(100 * Math.pow(1.3, userLevel - 1));
    if (newXP >= xpRequired) {
      setUserLevel(prev => prev + 1);
      setCurrentXP(newXP - xpRequired);
      setShowLevelUp(true);
      playSound('levelup');
    } else {
      setCurrentXP(newXP);
    }

    // 일일 스트릭 완료
    await completeToday();

    // 포인트 지급
    const points = await awardPoints(
      quizMode,
      result.correctCount,
      result.totalQuestions,
      result.maxStreak,
      result.speedCount,
      result.bossHP,
      result.bossName,
    );

    if (points > 0) {
      toast.success(`🎉 ${points.toLocaleString()} 포인트 획득!`);
    }

    playSound('complete');
    setGameState('result');
  }, [currentXP, userLevel, quizMode, completeToday, awardPoints, playSound]);

  // 메뉴로 돌아가기
  const handleRestart = useCallback(() => {
    setGameState('menu');
    setQuestions([]);
    setSessionResult(null);
    setShowLevelUp(false);
    setNewBadge(null);
  }, []);

  // ============================================
  // 로그인 체크
  // ============================================
  if (authLoading || !isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme.secondary}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Card className={`max-w-md w-full border-4 ${theme.card} shadow-2xl`}>
            <CardContent className="p-8 text-center">
              <motion.div
                className="text-7xl mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                📚
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
              <p className="text-muted-foreground mb-6">영어 퀴즈를 풀려면 로그인해주세요!</p>
              <a href={getLoginUrl()}>
                <Button className={`w-full bg-gradient-to-r ${theme.primary} text-white font-bold text-lg py-6`}>
                  로그인하기
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // 설정 화면
  // ============================================
  if (showSettings) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.secondary}`}>
        <div className="container max-w-4xl py-8 px-4">
          <QuizSettings
            settings={settings}
            onSettingsChange={setSettings}
            onBack={() => setShowSettings(false)}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // 결과 화면
  // ============================================
  if (gameState === 'result' && sessionResult) {
    return (
      <QuizResult
        theme={currentTheme}
        correctCount={sessionResult.correctCount}
        totalQuestions={sessionResult.totalQuestions}
        score={sessionResult.score}
        maxStreak={sessionResult.maxStreak}
        earnedXP={sessionResult.earnedXP}
        wrongWords={sessionResult.wrongWords}
        userLevel={userLevel}
        currentXP={currentXP}
        showLevelUp={showLevelUp}
        newBadge={newBadge}
        modeName={quizMode}
        bossDefeated={sessionResult.bossHP !== undefined && sessionResult.bossHP <= 0}
        bossName={sessionResult.bossName}
        speedCount={sessionResult.speedCount}
        onRestart={handleRestart}
        onSpeak={speakWord}
      />
    );
  }

  // ============================================
  // 퀴즈 진행 화면
  // ============================================
  if (gameState === 'playing' && questions.length > 0) {
    return (
      <QuizSessionManager
        theme={currentTheme}
        mode={quizMode}
        questions={questions}
        onComplete={handleSessionComplete}
        onExit={handleRestart}
        showHints={settings.hintsEnabled}
      />
    );
  }

  // ============================================
  // 메인 메뉴
  // ============================================
  return (
    <div>
      {/* 뒤로가기 */}
      <div className={`bg-gradient-to-br ${theme.secondary}`}>
        <div className="container max-w-4xl pt-8 px-4">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Link href="/english-learning">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/50">
                <ArrowLeft className="h-4 w-4" />
                영어 학습
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <QuizMenu
        theme={currentTheme}
        streak={dailyStreak}
        onStart={handleStart}
        onThemeChange={setCurrentTheme}
        onSettings={() => setShowSettings(true)}
        playSound={playSound}
      />
    </div>
  );
}
