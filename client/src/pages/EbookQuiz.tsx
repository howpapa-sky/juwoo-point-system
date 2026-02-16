import { useState, useEffect, useCallback, useRef } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { Link, useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Unlock,
  Trophy,
  Star,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Flame,
  Sparkles,
  Crown,
  Heart,
  Zap,
  Award,
  MessageCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { booksData, Book } from "@/data/booksData";
import {
  getQuizzesByBookAndTier,
  QuizQuestion,
  QuizTier,
  TIER_INFO,
  QUESTION_TYPE_INFO,
  calculateFinalPoints,
  isQuizPassed,
  getQuizGrade,
  GRADE_INFO,
  TIER_COMPLETION_BONUS,
  ENCOURAGEMENT_MESSAGES,
  getStreakMultiplier,
} from "@/data/quizData";
import { useEbookProgress, isBookCompleted } from "@/hooks/useEbookProgress";
import { useQuizProgress, awardQuizPoints } from "@/hooks/useQuizProgress";

type GameState = "select" | "playing" | "result";

// ============================================
// 효과음 시스템
// ============================================
const playSound = (type: "correct" | "wrong" | "complete" | "streak" | "hint" | "click") => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "correct") {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === "wrong") {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === "streak") {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
      });
    } else if (type === "complete") {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.25, audioContext.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.4);
        osc.start(audioContext.currentTime + i * 0.15);
        osc.stop(audioContext.currentTime + i * 0.15 + 0.4);
      });
    } else if (type === "hint") {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === "click") {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    }
  } catch {
    // Audio not supported
  }
};

// ============================================
// 애니메이션 variants
// ============================================
const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, x: -200, scale: 0.8, transition: { duration: 0.3 } },
};

const optionVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.1, type: "spring", stiffness: 300, damping: 25 },
  }),
};

const resultVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

// ============================================
// 선택지 가져오기 헬퍼
// ============================================
function getAnswerOptions(q: QuizQuestion): { label: string; emoji?: string; description?: string }[] {
  // emotion-guess: emotionOptions 사용
  if (q.type === "emotion-guess" && q.emotionOptions?.length) {
    return q.emotionOptions.map((eo) => ({
      label: eo.emotion,
      emoji: eo.emoji,
      description: eo.description,
    }));
  }

  // quote-speaker: speakerOptions 사용
  if (q.type === "quote-speaker" && q.speakerOptions?.length) {
    return q.speakerOptions.map((s, i) => ({
      label: s,
      emoji: q.optionEmojis?.[i],
    }));
  }

  // matching: matchingItems를 선택지로 변환
  if (q.type === "matching" && q.matchingItems?.length) {
    return q.matchingItems.map((item) => ({
      label: `${item.left} → ${item.right}`,
      emoji: item.leftEmoji,
    }));
  }

  // sequence / time-order: sequenceItems를 선택지로 변환
  if ((q.type === "sequence" || q.type === "time-order") && q.sequenceItems?.length) {
    return q.sequenceItems.map((item) => ({
      label: item.text,
      emoji: item.emoji,
    }));
  }

  // options 배열 사용 (가장 일반적)
  if (q.options?.length) {
    return q.options.map((opt, i) => ({
      label: opt,
      emoji: q.optionEmojis?.[i],
      description: q.optionDescriptions?.[i],
    }));
  }

  // 옵션 없음 - fill-blank 등 텍스트 입력 필요
  return [];
}

// ============================================
// 텍스트 입력이 필요한지 확인
// ============================================
function needsTextInput(q: QuizQuestion): boolean {
  const opts = getAnswerOptions(q);
  return opts.length === 0;
}

// ============================================
// 메인 컴포넌트
// ============================================
export default function EbookQuiz() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId || "";
  const [, setLocation] = useLocation();

  const [book, setBook] = useState<Book | null>(null);
  const [gameState, setGameState] = useState<GameState>("select");
  const [selectedTier, setSelectedTier] = useState<QuizTier | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([]);
  const [bookCompleted, setBookCompleted] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // 훅
  const { progress: ebookProgress } = useEbookProgress(bookId, book?.pages.length || 0);
  const {
    progressByTier,
    loading: quizLoading,
    isTierUnlocked,
    isTierCompleted,
    completeQuiz,
    saveAttempt,
    unlockTier,
  } = useQuizProgress(bookId);

  // 책 데이터 로드
  useEffect(() => {
    const foundBook = booksData.find((b) => b.id === bookId);
    if (foundBook) {
      setBook(foundBook);
    }
  }, [bookId]);

  // 책 완독 여부 확인
  useEffect(() => {
    const checkCompletion = async () => {
      const completed = await isBookCompleted(bookId);
      setBookCompleted(completed);
      if (completed) {
        unlockTier("basic");
      }
    };
    if (bookId) checkCompletion();
  }, [bookId, unlockTier]);

  // 퀴즈 시작
  const startQuiz = (tier: QuizTier) => {
    const tierQuestions = getQuizzesByBookAndTier(bookId, tier);
    if (tierQuestions.length === 0) {
      toast.error("퀴즈 문제가 없어요!");
      return;
    }

    const shuffled = [...tierQuestions].sort(() => Math.random() - 0.5);

    setSelectedTier(tier);
    setQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setHintsUsed(0);
    setTotalHintsUsed(0);
    setShowHint(false);
    setCurrentHintIndex(0);
    setEliminatedOptions([]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setConsecutiveCorrect(0);
    setMaxStreak(0);
    setWrongQuestions([]);
    setTextAnswer("");
    setGameState("playing");
    playSound("click");
  };

  // 힌트 사용
  const useHint = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || currentHintIndex >= currentQuestion.hints.length) return;

    const hint = currentQuestion.hints[currentHintIndex];

    // 오답 제거 힌트
    if (hint.eliminateOption !== undefined) {
      const opts = getAnswerOptions(currentQuestion);
      const correctIdx = opts.findIndex((o) => o.label === currentQuestion.correctAnswer);
      if (hint.eliminateOption !== correctIdx && !eliminatedOptions.includes(hint.eliminateOption)) {
        setEliminatedOptions([...eliminatedOptions, hint.eliminateOption]);
      }
    }

    setHintsUsed(hintsUsed + 1);
    setTotalHintsUsed(totalHintsUsed + 1);
    setCurrentHintIndex(currentHintIndex + 1);
    setShowHint(true);
    playSound("hint");
    toast.info(`💡 힌트 ${currentHintIndex + 1} 사용! (-10% 포인트)`);
  };

  // 책 페이지로 이동
  const goToBookPage = (pageNumber: number) => {
    setLocation(`/ebook-reader/${bookId}?page=${pageNumber - 1}`);
  };

  // 답변 확인 (텍스트 입력용)
  const checkTextAnswer = (answer: string, question: QuizQuestion): boolean => {
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrect = question.correctAnswer.toLowerCase();

    if (normalizedAnswer === normalizedCorrect) return true;

    if (question.acceptableAnswers) {
      return question.acceptableAnswers.some(
        (a) => a.toLowerCase() === normalizedAnswer
      );
    }

    return false;
  };

  // 답변 선택 (공통 처리)
  const processAnswer = async (answer: string) => {
    if (isAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isTextInput = needsTextInput(currentQuestion);
    const isCorrect = isTextInput
      ? checkTextAnswer(answer, currentQuestion)
      : answer === currentQuestion.correctAnswer;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const streakMult = getStreakMultiplier(consecutiveCorrect);
    const earnedPoints = isCorrect ? calculateFinalPoints(currentQuestion.points, hintsUsed, 0, streakMult) : 0;

    if (isCorrect) {
      setScore(score + earnedPoints);
      setCorrectCount(correctCount + 1);
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));

      playSound(newStreak >= 3 ? "streak" : "correct");

      if (newStreak >= 3) {
        confetti({
          particleCount: 30 + newStreak * 10,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#9B59B6"],
        });
      }

      // 스트릭 메시지
      const streakMsgs = ENCOURAGEMENT_MESSAGES.streak;
      const streakMsg = streakMsgs.find((s) => s.count === newStreak);
      if (streakMsg) {
        toast.success(streakMsg.text);
      } else {
        const randomMsg = ENCOURAGEMENT_MESSAGES.correct[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.correct.length)];
        toast.success(`✅ ${randomMsg.text} +${earnedPoints}점`);
      }
    } else {
      setConsecutiveCorrect(0);
      setWrongQuestions([...wrongQuestions, currentQuestion]);
      playSound("wrong");

      const randomMsg = ENCOURAGEMENT_MESSAGES.wrong[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.wrong.length)];
      toast.error(`${randomMsg.emoji} ${randomMsg.text}`);
    }

    // 시도 기록 저장
    await saveAttempt({
      bookId,
      quizTier: selectedTier!,
      questionId: currentQuestion.id,
      userAnswer: answer,
      isCorrect,
      hintsUsed,
      basePoints: currentQuestion.points,
      earnedPoints,
    });
  };

  // 객관식 답 선택
  const selectAnswer = (answer: string) => {
    processAnswer(answer);
  };

  // 주관식 제출
  const submitTextAnswer = () => {
    if (!textAnswer.trim()) return;
    processAnswer(textAnswer.trim());
  };

  // 다음 문제
  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setHintsUsed(0);
      setShowHint(false);
      setCurrentHintIndex(0);
      setEliminatedOptions([]);
      setTextAnswer("");

      // 다음 문제가 텍스트 입력이면 포커스
      const next = questions[currentQuestionIndex + 1];
      if (next && needsTextInput(next)) {
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    } else {
      await finishQuiz();
    }
  };

  // 퀴즈 완료
  const finishQuiz = async () => {
    const passed = isQuizPassed(correctCount, questions.length);

    let finalScore = score;
    if (passed && selectedTier) {
      finalScore += TIER_COMPLETION_BONUS[selectedTier];
    }

    await completeQuiz(selectedTier!, finalScore, correctCount, questions.length);

    if (finalScore > 0) {
      const tierLabel = TIER_INFO[selectedTier!].label;
      await awardQuizPoints(
        bookId,
        selectedTier!,
        finalScore,
        `📚 ${book?.title} - ${tierLabel} 완료 (${correctCount}/${questions.length})`
      );
    }

    playSound("complete");

    if (passed) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#22c55e", "#f59e0b", "#a855f7", "#3b82f6"],
      });
    }

    setScore(finalScore);
    setGameState("result");
  };

  // ============================================
  // 로딩/인증 체크
  // ============================================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            className="text-6xl"
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            📚
          </motion.div>
          <p className="text-lg font-medium text-gray-600">로딩 중...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full border-4 border-emerald-400 shadow-2xl">
            <CardContent className="p-8 text-center">
              <motion.div
                className="text-7xl mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                📖
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
              <p className="text-muted-foreground mb-6">퀴즈를 풀려면 로그인해주세요!</p>
              <a href={getLoginUrl()}>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-6">
                  로그인하기
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-md w-full border-4 border-emerald-400 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold mb-4">책을 찾을 수 없어요</h2>
              <Link href="/ebook-library">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  도서관으로 가기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // 책 미완독 시 잠금 화면
  // ============================================
  if (!bookCompleted && !ebookProgress?.is_completed) {
    const progressPercent = ebookProgress
      ? Math.round((ebookProgress.current_page / ebookProgress.total_pages) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="container max-w-2xl mx-auto py-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-4 border-gray-300 shadow-2xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300" />
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Lock className="h-20 w-20 mx-auto mb-4 text-gray-400" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-4">아직 책을 다 읽지 않았어!</h1>
                <p className="text-xl text-gray-600 mb-6">
                  📚 &ldquo;{book.title}&rdquo;을 먼저 읽어봐!
                </p>

                {ebookProgress && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">읽기 진행률</p>
                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                        {progressPercent}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {ebookProgress.current_page}/{ebookProgress.total_pages} 페이지
                    </p>
                  </div>
                )}

                <Link href={`/ebook-reader/${bookId}`}>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    {ebookProgress?.current_page ? "이어서 읽기" : "책 읽으러 가기"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // 티어 선택 화면 (프리미엄)
  // ============================================
  if (gameState === "select") {
    const tiers: QuizTier[] = ["basic", "intermediate", "master"];

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="container max-w-2xl mx-auto py-6">
          {/* 헤더 */}
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Link href={`/ebook-reader/${bookId}`}>
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/60">
                <ArrowLeft className="h-4 w-4" />
                책으로
              </Button>
            </Link>
            <Link href="/ebook-library">
              <Button variant="ghost" size="icon" className="hover:bg-white/60">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* 책 정보 헤더 */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="inline-block p-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mb-4 shadow-xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <span className="text-5xl">{book.coverEmoji}</span>
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {book.title}
            </h1>
            <p className="text-gray-600 text-lg">퀴즈에 도전해봐! 🎯</p>
          </motion.div>

          {/* 퀴즈 진행 프로그레스 */}
          <motion.div
            className="mb-6 p-4 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-white/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">퀴즈 진행도</span>
              <span className="text-sm font-bold text-emerald-600">
                {tiers.filter((t) => isTierCompleted(t)).length}/3 완료
              </span>
            </div>
            <div className="flex gap-2">
              {tiers.map((tier) => {
                const completed = isTierCompleted(tier);
                const unlocked = tier === "basic" || isTierUnlocked(tier);
                const info = TIER_INFO[tier];
                return (
                  <div key={tier} className="flex-1">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        completed
                          ? `bg-gradient-to-r ${info.bgGradient}`
                          : unlocked
                            ? "bg-gray-300"
                            : "bg-gray-200"
                      }`}
                    />
                    <p className="text-xs text-center mt-1 text-gray-500">{info.emoji}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* 티어 카드 */}
          <div className="space-y-4">
            {tiers.map((tier, index) => {
              const info = TIER_INFO[tier];
              const unlocked = tier === "basic" || isTierUnlocked(tier);
              const completed = isTierCompleted(tier);
              const progress = progressByTier[tier];
              const quizCount = getQuizzesByBookAndTier(bookId, tier).length;

              return (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                >
                  <motion.div
                    whileHover={unlocked ? { scale: 1.02, y: -4 } : {}}
                    whileTap={unlocked ? { scale: 0.98 } : {}}
                  >
                    <Card
                      className={`overflow-hidden transition-all cursor-pointer shadow-lg ${
                        completed
                          ? "border-4 border-emerald-400 shadow-emerald-200/50"
                          : unlocked
                            ? "border-4 border-transparent hover:shadow-xl bg-white"
                            : "border-4 border-gray-200 opacity-60"
                      }`}
                      onClick={() => unlocked && startQuiz(tier)}
                    >
                      {/* 상단 그라디언트 바 */}
                      <div
                        className={`h-2 bg-gradient-to-r ${
                          completed || unlocked
                            ? info.bgGradient
                            : "from-gray-300 to-gray-400"
                        }`}
                      />

                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <motion.div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md ${
                                completed
                                  ? "bg-gradient-to-br from-emerald-100 to-teal-100"
                                  : unlocked
                                    ? "bg-gradient-to-br from-white to-gray-50"
                                    : "bg-gray-100"
                              }`}
                              animate={completed ? { rotate: [0, 5, -5, 0] } : {}}
                              transition={{ repeat: Infinity, duration: 3 }}
                            >
                              {info.emoji}
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-bold flex items-center gap-2">
                                {info.label}
                                {completed && (
                                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                    완료!
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {info.description} · {quizCount}문제
                              </p>
                              {progress?.best_score ? (
                                <p className="text-xs text-amber-600 font-medium mt-0.5">
                                  ⭐ 최고 {progress.best_score}점
                                  {progress.attempts && ` · ${progress.attempts}회 도전`}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center">
                            {completed ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"
                              >
                                <CheckCircle2 className="h-6 w-6 text-white" />
                              </motion.div>
                            ) : unlocked ? (
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow">
                                <ChevronRight className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Lock className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {!unlocked && (
                          <motion.p
                            className="text-sm text-gray-400 mt-3 pl-[74px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            🔒{" "}
                            {tier === "intermediate"
                              ? "기초 퀴즈를 먼저 통과해야 해!"
                              : "실력 퀴즈를 먼저 통과해야 해!"}
                          </motion.p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* 규칙 안내 */}
          <motion.div
            className="mt-6 p-4 bg-white/60 backdrop-blur rounded-2xl border border-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="font-bold mb-2 flex items-center gap-2 text-gray-700">
              <Award className="h-4 w-4 text-amber-500" />
              게임 규칙
            </h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• 60% 이상 맞으면 통과! 다음 단계가 열려요</li>
              <li>• 💡 힌트를 쓰면 포인트가 10%씩 줄어요</li>
              <li>• 🔥 연속 정답이면 보너스 포인트!</li>
              <li>• 📖 틀려도 괜찮아! 책에서 다시 확인할 수 있어요</li>
            </ul>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // 퀴즈 플레이 화면 (프리미엄)
  // ============================================
  if (gameState === "playing" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentHint = currentQuestion.hints[currentHintIndex - 1];
    const maxPoints = calculateFinalPoints(currentQuestion.points, 0);
    const potentialPoints = calculateFinalPoints(currentQuestion.points, hintsUsed);
    const answerOptions = getAnswerOptions(currentQuestion);
    const isTextInputQuestion = needsTextInput(currentQuestion);
    const typeInfo = QUESTION_TYPE_INFO[currentQuestion.type];
    const tierInfo = TIER_INFO[selectedTier!];

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="container max-w-2xl mx-auto py-4">
          {/* 상단 헤더 */}
          <motion.div
            className="flex items-center justify-between mb-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGameState("select")}
              className="gap-1 text-gray-500 hover:bg-white/60"
            >
              <ArrowLeft className="h-4 w-4" />
              나가기
            </Button>

            <div className="flex items-center gap-2">
              {/* 스트릭 표시 */}
              <AnimatePresence>
                {consecutiveCorrect >= 2 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full shadow-sm"
                  >
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-bold text-orange-600 text-sm">{consecutiveCorrect}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 점수 */}
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-emerald-700 text-sm">{score}점</span>
              </div>
            </div>
          </motion.div>

          {/* 진행률 바 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-500">
                문제 {currentQuestionIndex + 1}/{questions.length}
              </span>
              <span className="text-xs font-medium text-gray-500">
                정답 {correctCount}개
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
          </div>

          {/* 문제 카드 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="shadow-xl bg-white/95 backdrop-blur overflow-hidden border-0">
                {/* 카드 상단 바 */}
                <div className={`h-1.5 bg-gradient-to-r ${tierInfo.bgGradient}`} />

                <CardContent className="p-5 md:p-7">
                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${tierInfo.bgGradient} text-white`}>
                        {tierInfo.emoji} {tierInfo.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {typeInfo.emoji} {typeInfo.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-600">
                        💎 {potentialPoints}점
                      </span>
                      {hintsUsed > 0 && (
                        <span className="text-xs text-gray-400 ml-1">(최대 {maxPoints})</span>
                      )}
                    </div>
                  </div>

                  {/* 문제 이모지 */}
                  {currentQuestion.questionEmoji && (
                    <motion.div
                      className="text-center mb-3"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <span className="text-4xl">{currentQuestion.questionEmoji}</span>
                    </motion.div>
                  )}

                  {/* 컨텍스트 */}
                  {currentQuestion.context && !isAnswered && (
                    <motion.div
                      className="mb-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700 border border-blue-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      📝 {currentQuestion.context}
                    </motion.div>
                  )}

                  {/* 인용문 (quote-speaker) */}
                  {currentQuestion.type === "quote-speaker" && currentQuestion.quote && (
                    <motion.div
                      className="mb-5 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 relative"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <MessageCircle className="absolute -top-3 -left-2 h-6 w-6 text-amber-400 rotate-12" />
                      <p className="text-lg font-bold text-amber-900 italic text-center">
                        &ldquo;{currentQuestion.quote}&rdquo;
                      </p>
                    </motion.div>
                  )}

                  {/* 문제 텍스트 */}
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1 leading-relaxed">
                    {currentQuestion.question}
                  </h2>

                  {/* 서브 질문 */}
                  {currentQuestion.subQuestion && (
                    <p className="text-sm text-gray-500 mb-4">{currentQuestion.subQuestion}</p>
                  )}

                  {!currentQuestion.subQuestion && <div className="mb-5" />}

                  {/* ===== 답변 영역 ===== */}

                  {/* 감정 맞추기 (emotion-guess) - 특별 카드 UI */}
                  {currentQuestion.type === "emotion-guess" && answerOptions.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {answerOptions.map((option, index) => {
                        const isEliminated = eliminatedOptions.includes(index);
                        const isSelected = selectedAnswer === option.label;
                        const isCorrectOpt = option.label === currentQuestion.correctAnswer;

                        return (
                          <motion.div
                            key={index}
                            custom={index}
                            variants={optionVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.button
                              whileHover={!isAnswered && !isEliminated ? { scale: 1.03, y: -2 } : {}}
                              whileTap={!isAnswered && !isEliminated ? { scale: 0.97 } : {}}
                              onClick={() => !isEliminated && !isAnswered && selectAnswer(option.label)}
                              disabled={isEliminated || isAnswered}
                              className={`w-full p-4 rounded-2xl border-3 text-center transition-all ${
                                isAnswered
                                  ? isCorrectOpt
                                    ? "border-emerald-500 bg-emerald-50 shadow-emerald-200/50 shadow-lg"
                                    : isSelected && !isCorrectOpt
                                      ? "border-red-400 bg-red-50"
                                      : "border-gray-200 bg-gray-50 opacity-50"
                                  : isEliminated
                                    ? "border-gray-200 bg-gray-100 opacity-30"
                                    : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
                              }`}
                            >
                              <span className="text-3xl mb-2 block">{option.emoji}</span>
                              <span className="font-bold text-sm block">{option.label}</span>
                              {option.description && (
                                <span className="text-xs text-gray-500 block mt-0.5">{option.description}</span>
                              )}
                              {isAnswered && isCorrectOpt && (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mt-1" />
                              )}
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* 인용문 화자 맞추기 (quote-speaker) */}
                  {currentQuestion.type === "quote-speaker" && answerOptions.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {answerOptions.map((option, index) => {
                        const isEliminated = eliminatedOptions.includes(index);
                        const isSelected = selectedAnswer === option.label;
                        const isCorrectOpt = option.label === currentQuestion.correctAnswer;

                        return (
                          <motion.div
                            key={index}
                            custom={index}
                            variants={optionVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.button
                              whileHover={!isAnswered && !isEliminated ? { scale: 1.03 } : {}}
                              whileTap={!isAnswered && !isEliminated ? { scale: 0.97 } : {}}
                              onClick={() => !isEliminated && !isAnswered && selectAnswer(option.label)}
                              disabled={isEliminated || isAnswered}
                              className={`w-full p-4 rounded-2xl border-2 text-center transition-all ${
                                isAnswered
                                  ? isCorrectOpt
                                    ? "border-emerald-500 bg-emerald-50 shadow-lg"
                                    : isSelected && !isCorrectOpt
                                      ? "border-red-400 bg-red-50"
                                      : "border-gray-200 bg-gray-50 opacity-50"
                                  : isEliminated
                                    ? "border-gray-200 bg-gray-100 opacity-30"
                                    : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
                              }`}
                            >
                              {option.emoji && <span className="text-2xl mb-1 block">{option.emoji}</span>}
                              <span className="font-bold text-sm">{option.label}</span>
                              {isAnswered && isCorrectOpt && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto mt-1" />
                              )}
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* 일반 선택지 (multiple-choice, true-false, visual-choice 등) */}
                  {currentQuestion.type !== "emotion-guess" &&
                    currentQuestion.type !== "quote-speaker" &&
                    !isTextInputQuestion &&
                    answerOptions.length > 0 && (
                    <div className="space-y-2.5">
                      {answerOptions.map((option, index) => {
                        const isEliminated = eliminatedOptions.includes(index);
                        const isSelected = selectedAnswer === option.label;
                        const isCorrectOpt = option.label === currentQuestion.correctAnswer;

                        return (
                          <motion.div
                            key={index}
                            custom={index}
                            variants={optionVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.button
                              whileHover={!isAnswered && !isEliminated ? { scale: 1.01, x: 4 } : {}}
                              whileTap={!isAnswered && !isEliminated ? { scale: 0.99 } : {}}
                              onClick={() => !isEliminated && !isAnswered && selectAnswer(option.label)}
                              disabled={isEliminated || isAnswered}
                              className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-3 ${
                                isAnswered
                                  ? isCorrectOpt
                                    ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
                                    : isSelected && !isCorrectOpt
                                      ? "border-red-400 bg-red-50"
                                      : "border-gray-200 bg-gray-50 opacity-50"
                                  : isEliminated
                                    ? "border-gray-200 bg-gray-100 opacity-30 line-through"
                                    : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm"
                              }`}
                            >
                              {/* 옵션 번호 - 항상 숫자 표시 */}
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                  isAnswered && isCorrectOpt
                                    ? "bg-emerald-500 text-white"
                                    : isAnswered && isSelected && !isCorrectOpt
                                      ? "bg-red-400 text-white"
                                      : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {index + 1}
                              </span>

                              {/* 옵션 이모지 (있는 경우 별도 표시) */}
                              {option.emoji && (
                                <span className="text-xl flex-shrink-0">{option.emoji}</span>
                              )}

                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm leading-tight block">{option.label}</span>
                                {option.description && (
                                  <span className="text-xs text-gray-500 block mt-0.5">{option.description}</span>
                                )}
                              </div>

                              {isAnswered && isCorrectOpt && (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              )}
                              {isAnswered && isSelected && !isCorrectOpt && (
                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              )}
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* 텍스트 입력 (fill-blank 등) */}
                  {isTextInputQuestion && (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex gap-3">
                        <Input
                          ref={inputRef}
                          type="text"
                          placeholder="정답을 입력하세요..."
                          value={textAnswer}
                          onChange={(e) => setTextAnswer(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submitTextAnswer()}
                          disabled={isAnswered}
                          autoFocus
                          className="text-lg text-center h-14 border-2 border-emerald-300 focus:border-emerald-500 rounded-xl"
                        />
                        <Button
                          onClick={submitTextAnswer}
                          disabled={isAnswered || !textAnswer.trim()}
                          className="h-14 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl"
                        >
                          확인
                        </Button>
                      </div>

                      {isAnswered && (
                        <motion.div
                          className={`p-3 rounded-xl flex items-center gap-2 ${
                            selectedAnswer === currentQuestion.correctAnswer ||
                            currentQuestion.acceptableAnswers?.some(
                              (a) => a.toLowerCase() === textAnswer.trim().toLowerCase()
                            )
                              ? "bg-emerald-100"
                              : "bg-red-100"
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {selectedAnswer === currentQuestion.correctAnswer ||
                          currentQuestion.acceptableAnswers?.some(
                            (a) => a.toLowerCase() === textAnswer.trim().toLowerCase()
                          ) ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-bold text-sm">
                            정답: {currentQuestion.correctAnswer}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* 힌트 영역 */}
                  {!isAnswered && currentHintIndex < currentQuestion.hints.length && (
                    <motion.div
                      className="mt-5 pt-4 border-t border-gray-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        variant="outline"
                        onClick={useHint}
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl h-11"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        힌트 사용 ({currentQuestion.hints.length - currentHintIndex}개 남음)
                        <span className="ml-2 text-xs opacity-70">-10% 포인트</span>
                      </Button>
                    </motion.div>
                  )}

                  {/* 힌트 표시 */}
                  <AnimatePresence>
                    {showHint && currentHint && (
                      <motion.div
                        className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {/* 텍스트 힌트 */}
                        {currentHint.text && (
                          <p className="text-amber-800 text-sm">💡 {currentHint.text}</p>
                        )}

                        {/* 페이지 힌트 */}
                        {currentHint.pageHint && (
                          <div>
                            <p className="text-amber-800 text-sm">📖 {currentHint.pageHint}</p>
                            <Button
                              variant="link"
                              className="text-amber-700 p-0 h-auto mt-1 text-sm"
                              onClick={() => goToBookPage(currentQuestion.pageReference)}
                            >
                              책에서 확인하기 →
                            </Button>
                          </div>
                        )}

                        {/* 캐릭터 힌트 */}
                        {currentHint.characterHint && (
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">{currentHint.characterHint.emoji}</span>
                            <div className="bg-white/80 rounded-xl p-2 text-sm">
                              <span className="font-bold text-amber-800">
                                {currentHint.characterHint.character}:
                              </span>{" "}
                              <span className="text-amber-700">{currentHint.characterHint.message}</span>
                            </div>
                          </div>
                        )}

                        {/* 비주얼 힌트 */}
                        {currentHint.visualHint && (
                          <div className="text-center">
                            <p className="text-3xl mb-1">{currentHint.visualHint.emoji}</p>
                            <p className="text-amber-700 text-sm">{currentHint.visualHint.description}</p>
                          </div>
                        )}

                        {/* 스토리 요약 힌트 */}
                        {currentHint.storyRecap && (
                          <p className="text-amber-800 text-sm">📜 {currentHint.storyRecap}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 정답 후 해설 */}
                  <AnimatePresence>
                    {isAnswered && (
                      <motion.div
                        className={`mt-5 p-4 rounded-xl border ${
                          (selectedAnswer === currentQuestion.correctAnswer ||
                          (isTextInputQuestion && checkTextAnswer(textAnswer, currentQuestion)))
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-red-50 border-red-200"
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="font-bold mb-1.5 text-sm">
                          {(selectedAnswer === currentQuestion.correctAnswer ||
                          (isTextInputQuestion && checkTextAnswer(textAnswer, currentQuestion)))
                            ? "🎉 정답!"
                            : "😢 아쉬워!"}
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>

                        {/* 재미있는 사실 */}
                        {currentQuestion.funFact && (
                          <p className="text-sm text-blue-600 mt-2">{currentQuestion.funFact}</p>
                        )}

                        {/* 오답시 책 페이지 링크 */}
                        {selectedAnswer !== currentQuestion.correctAnswer &&
                          !(isTextInputQuestion && checkTextAnswer(textAnswer, currentQuestion)) && (
                          <Button
                            variant="link"
                            className="text-amber-700 p-0 h-auto mt-2 text-sm"
                            onClick={() => goToBookPage(currentQuestion.pageReference)}
                          >
                            📖 {currentQuestion.pageReference}페이지에서 확인하기 →
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* 다음 버튼 */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={nextQuestion}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-lg rounded-xl h-14 shadow-lg shadow-emerald-200/50"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        다음 문제
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    ) : (
                      <>
                        결과 보기
                        <Trophy className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ============================================
  // 결과 화면 (프리미엄)
  // ============================================
  if (gameState === "result") {
    const passed = isQuizPassed(correctCount, questions.length);
    const percentage = Math.round((correctCount / questions.length) * 100);
    const grade = getQuizGrade(correctCount, questions.length);
    const gradeInfo = GRADE_INFO[grade];

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="container max-w-2xl mx-auto py-6">
          <motion.div variants={resultVariants} initial="hidden" animate="visible">
            <Card className="shadow-2xl bg-white/95 backdrop-blur overflow-hidden border-0">
              {/* 상단 그라디언트 */}
              <div className={`h-2 bg-gradient-to-r ${passed ? "from-emerald-400 via-teal-500 to-cyan-500" : "from-amber-400 to-orange-500"}`} />

              <CardContent className="p-6 md:p-8 text-center">
                {/* 등급 배지 */}
                <motion.div
                  className="mb-6"
                  initial={{ y: -30, scale: 0 }}
                  animate={{ y: 0, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                >
                  <motion.div
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${gradeInfo.color} shadow-xl`}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <span className="text-5xl">{gradeInfo.emoji}</span>
                  </motion.div>
                </motion.div>

                {/* 등급 표시 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className={`inline-block px-6 py-2 rounded-full text-white font-bold text-xl mb-3 bg-gradient-to-r ${gradeInfo.color} shadow-lg`}>
                    {grade}등급
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {passed ? "🎉 통과!" : "💪 다시 도전해보자!"}
                  </h1>
                  <p className="text-gray-600 text-lg">{gradeInfo.message}</p>
                </motion.div>

                {/* 스탯 그리드 */}
                <motion.div
                  className="grid grid-cols-4 gap-3 my-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {[
                    { label: "정답", value: `${correctCount}/${questions.length}`, icon: "✅", bg: "bg-emerald-50", color: "text-emerald-600" },
                    { label: "정답률", value: `${percentage}%`, icon: "📊", bg: "bg-blue-50", color: "text-blue-600" },
                    { label: "점수", value: `${score}`, icon: "⭐", bg: "bg-amber-50", color: "text-amber-600" },
                    { label: "최대연속", value: `${maxStreak}`, icon: "🔥", bg: "bg-orange-50", color: "text-orange-600" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className={`p-3 ${stat.bg} rounded-xl`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <div className="text-xl mb-1">{stat.icon}</div>
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* 힌트 사용 */}
                {totalHintsUsed > 0 && (
                  <motion.p
                    className="text-sm text-gray-500 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    💡 힌트 {totalHintsUsed}개 사용
                  </motion.p>
                )}

                {/* 별점 */}
                <motion.div
                  className="flex justify-center gap-2 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {[1, 2, 3].map((i) => {
                    const filled =
                      (grade === "S" && i <= 3) ||
                      (grade === "A" && i <= 2) ||
                      (grade === "B" && i <= 1);
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
                      >
                        <Star
                          className={`h-10 w-10 ${
                            filled
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* 틀린 문제 안내 */}
                {wrongQuestions.length > 0 && (
                  <motion.div
                    className="mb-6 p-4 bg-amber-50 rounded-xl text-left border border-amber-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <p className="font-bold text-sm mb-2 text-amber-800">📖 틀린 문제는 책에서 확인해봐!</p>
                    <ul className="space-y-1.5">
                      {wrongQuestions.map((q, i) => (
                        <li key={i} className="text-sm flex items-start gap-1">
                          <span className="text-amber-500">•</span>
                          <span className="text-gray-700">{q.question.slice(0, 35)}...</span>
                          <button
                            className="text-amber-700 underline whitespace-nowrap flex-shrink-0"
                            onClick={() => goToBookPage(q.pageReference)}
                          >
                            {q.pageReference}p
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* 버튼들 */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  {passed && selectedTier !== "master" && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        onClick={() => {
                          const nextTier = selectedTier === "basic" ? "intermediate" : "master";
                          startQuiz(nextTier as QuizTier);
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl h-14 shadow-lg"
                      >
                        {selectedTier === "basic" ? "⭐ 실력 퀴즈 도전!" : "🏆 마스터 퀴즈 도전!"}
                      </Button>
                    </motion.div>
                  )}

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => startQuiz(selectedTier!)}
                      className="w-full rounded-xl h-12 font-bold"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      다시 도전
                    </Button>
                  </motion.div>

                  <div className="flex gap-3">
                    <Link href={`/ebook-reader/${bookId}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-xl">
                        📖 책 읽기
                      </Button>
                    </Link>
                    <Link href="/ebook-library" className="flex-1">
                      <Button variant="outline" className="w-full rounded-xl">
                        📚 도서관
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
