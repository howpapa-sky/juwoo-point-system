// ============================================
// 영어 단어 퀴즈 — Phase 2 강화
// StopLookSpeak + 실수 친구 연동 + 연습/시험 모드 + 실수 목표
// ============================================
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

import { supabase } from '@/lib/supabaseClient';
import type { QuizMode, ThemeKey, GameState } from '@/lib/quizConstants';
import { QUIZ_THEMES } from '@/lib/quizConstants';
import { generateQuestions } from '@/lib/quizEngine';
import type { WordCategory, WordDifficulty } from '@/data/englishWordsData';
import type { QuizQuestion } from '@/lib/quizEngine';

import { useQuizSound } from '@/hooks/useQuizSound';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { useMistakeFriends } from '@/hooks/useMistakeFriends';
import { useMistakeGoal } from '@/hooks/useMistakeGoal';

import QuizMenu from '@/components/quiz/QuizMenu';
import QuizSessionManager, { type SessionResult } from '@/components/quiz/QuizSessionManager';
import QuizResult from '@/components/quiz/QuizResult';
import QuizSettings, { type QuizSettingsState, defaultSettings } from '@/components/quiz/QuizSettings';
import StopLookSpeak from '@/components/quiz/StopLookSpeak';
import MistakeGoalBanner from '@/components/quiz/MistakeGoalBanner';
import { awardLearningPoints, calculateStars, getStarPoints } from '@/lib/learningPointsHelper';

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

  // Phase 2: StopLookSpeak
  const [showStopLookSpeak, setShowStopLookSpeak] = useState(false);
  const [stopLookSpeakType, setStopLookSpeakType] = useState<'session_start' | 'speed_warning'>('session_start');
  const pendingStartRef = useRef<{ mode: QuizMode; difficulty: WordDifficulty | 'all'; category: WordCategory | 'all' } | null>(null);

  // Phase 2: 연습/시험 모드
  const [isPracticeMode, setIsPracticeMode] = useState(true); // 기본: 연습 모드

  // XP/레벨 상태
  const [userLevel, setUserLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newBadge, setNewBadge] = useState<{ name: string; icon: string } | null>(null);

  // 훅
  const { playSound, speakWord } = useQuizSound();
  const { awardPoints } = useQuizSession();
  const { currentStreak: dailyStreak, completeToday } = useDailyStreak();
  const { recordMistake } = useMistakeFriends();
  const { todayGoal, loadOrCreateTodayGoal, incrementMistake } = useMistakeGoal();

  // 실수 목표 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadOrCreateTodayGoal();
    }
  }, [isAuthenticated, loadOrCreateTodayGoal]);

  const theme = QUIZ_THEMES[currentTheme];

  // 게임 시작 (StopLookSpeak 후)
  const actuallyStart = useCallback(() => {
    const pending = pendingStartRef.current;
    if (!pending) return;

    const count = settings.questionCount;
    const qs = generateQuestions(pending.mode, pending.difficulty, pending.category, count);
    setQuizMode(pending.mode);
    setQuestions(qs);
    setSessionResult(null);
    setShowLevelUp(false);
    setNewBadge(null);
    setGameState('playing');
    pendingStartRef.current = null;
  }, [settings.questionCount]);

  // 게임 시작 요청 → StopLookSpeak 표시
  const handleStart = useCallback((mode: QuizMode, difficulty: WordDifficulty | 'all', category: WordCategory | 'all') => {
    pendingStartRef.current = { mode, difficulty, category };
    setStopLookSpeakType('session_start');
    setShowStopLookSpeak(true);
    playSound('click');
  }, [playSound]);

  // StopLookSpeak 완료
  const handleStopLookSpeakReady = useCallback(() => {
    setShowStopLookSpeak(false);
    if (stopLookSpeakType === 'session_start') {
      actuallyStart();
    }
  }, [stopLookSpeakType, actuallyStart]);

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

    // 실수 친구 등록 (오답 단어)
    let mistakeFriendsMet = 0;
    for (const wrongWord of result.wrongWords) {
      const friend = await recordMistake(wrongWord.word, wrongWord.meaning);
      if (friend) mistakeFriendsMet++;

      // 실수 목표 증가
      const goalResult = await incrementMistake();
      if (goalResult?.goalMet) {
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
        toast.success('실수 목표 달성! 잘했어! 🎉');
        // 실수 목표 달성 포인트
        await awardLearningPoints({
          category: 'mistake_goal',
          basePoints: 100,
          note: '실수 목표 달성',
        });
      }
    }

    // 별 계산 + 포인트 적립
    const stars = calculateStars(result.correctCount, result.totalQuestions);
    const basePoints = getStarPoints(stars);

    const pointResult = await awardLearningPoints({
      category: 'practice',
      basePoints,
      note: `퀴즈 완료 (${quizMode}, 별 ${stars}개, ${result.correctCount}/${result.totalQuestions})`,
    });

    if (pointResult.awarded > 0) {
      toast.success(`🎉 ${pointResult.awarded.toLocaleString()} 포인트 획득!`);
    }
    if (pointResult.capped) {
      toast.info('오늘 연습 포인트 상한에 도달했어요!');
    }

    // 세션 기록
    try {
      await supabase.from('english_sessions').insert({
        session_type: 'practice',
        mode: isPracticeMode ? 'practice' : 'test',
        words_total: result.totalQuestions,
        words_correct: result.correctCount,
        words_wrong: result.wrongWords.length,
        stars,
        points_earned: pointResult.awarded,
        mistake_friends_met: mistakeFriendsMet,
      });
    } catch (err) {
      console.error('세션 기록 에러:', err);
    }

    if (mistakeFriendsMet > 0) {
      toast(`새 실수 친구 ${mistakeFriendsMet}명과 만났어!`, { icon: '🤝' });
    }

    playSound('complete');
    setGameState('result');
  }, [currentXP, userLevel, quizMode, isPracticeMode, completeToday, recordMistake, incrementMistake, playSound]);

  // 메뉴로 돌아가기
  const handleRestart = useCallback(() => {
    setGameState('menu');
    setQuestions([]);
    setSessionResult(null);
    setShowLevelUp(false);
    setNewBadge(null);
  }, []);

  // ============================================
  // StopLookSpeak 오버레이
  // ============================================
  if (showStopLookSpeak) {
    return <StopLookSpeak type={stopLookSpeakType} onReady={handleStopLookSpeakReady} />;
  }

  // ============================================
  // 인증 로딩 중
  // ============================================
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme.secondary}`}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground" style={{ fontSize: 16 }}>퀴즈 준비 중...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // 로그인 체크
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme.secondary}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Card className={`max-w-md w-full border-4 ${theme.card} shadow-2xl`}>
            <CardContent className="p-8 text-center">
              <motion.div className="text-7xl mb-6" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
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
          <QuizSettings settings={settings} onSettingsChange={setSettings} onBack={() => setShowSettings(false)} />
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
      <div>
        {/* 실수 목표 배너 */}
        <div className={`bg-gradient-to-br ${theme.secondary} px-4 pt-4`}>
          <div className="container max-w-4xl">
            <MistakeGoalBanner goal={todayGoal} />
            {isPracticeMode && (
              <div className="text-center mb-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  🎯 연습 모드 — 틀려도 되는 시간이야!
                </span>
              </div>
            )}
          </div>
        </div>
        <QuizSessionManager
          theme={currentTheme}
          mode={quizMode}
          questions={questions}
          onComplete={handleSessionComplete}
          onExit={handleRestart}
          showHints={settings.hintsEnabled}
        />
      </div>
    );
  }

  // ============================================
  // 메인 메뉴
  // ============================================
  return (
    <div>
      <div className={`bg-gradient-to-br ${theme.secondary}`}>
        <div className="container max-w-4xl pt-8 px-4">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <Link href="/english-learning">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/50">
                <ArrowLeft className="h-4 w-4" />영어 학습
              </Button>
            </Link>
          </motion.div>

          {/* 연습/시험 모드 토글 */}
          <div className="flex items-center justify-center gap-2 mt-4 mb-2">
            <button
              onClick={() => setIsPracticeMode(true)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                isPracticeMode
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white/60 text-slate-600'
              }`}
            >
              🎯 연습 모드
            </button>
            <button
              onClick={() => setIsPracticeMode(false)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                !isPracticeMode
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white/60 text-slate-600'
              }`}
            >
              📝 시험 모드
            </button>
          </div>
          {isPracticeMode && (
            <p className="text-center text-sm text-slate-500 mb-4">
              틀려도 괜찮아! 힌트도 쓸 수 있어요.
            </p>
          )}
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
