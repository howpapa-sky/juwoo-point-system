import { useState, useEffect, useCallback } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { Link, useParams, useLocation } from "wouter";
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
  Gamepad2,
  RotateCcw,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { booksData, Book } from "@/data/booksData";
import {
  getQuizzesByBookAndTier,
  QuizQuestion,
  QuizTier,
  TIER_INFO,
  calculateFinalPoints,
  isQuizPassed,
  TIER_COMPLETION_BONUS,
  ENCOURAGEMENT_MESSAGES,
} from "@/data/quizData";
import { useEbookProgress, isBookCompleted } from "@/hooks/useEbookProgress";
import { useQuizProgress, awardQuizPoints } from "@/hooks/useQuizProgress";

type GameState = "select" | "playing" | "result";

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
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([]);
  const [bookCompleted, setBookCompleted] = useState(false);

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

      // 완독했으면 기초 퀴즈 잠금 해제
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

    // 문제 섞기
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
    setWrongQuestions([]);
    setGameState("playing");
  };

  // 힌트 사용
  const useHint = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || currentHintIndex >= currentQuestion.hints.length) return;

    const hint = currentQuestion.hints[currentHintIndex];

    // 오답 제거 힌트
    if (hint.eliminateOption !== undefined && currentQuestion.options) {
      const correctIndex = currentQuestion.options.indexOf(currentQuestion.correctAnswer);
      if (hint.eliminateOption !== correctIndex && !eliminatedOptions.includes(hint.eliminateOption)) {
        setEliminatedOptions([...eliminatedOptions, hint.eliminateOption]);
      }
    }

    setHintsUsed(hintsUsed + 1);
    setTotalHintsUsed(totalHintsUsed + 1);
    setCurrentHintIndex(currentHintIndex + 1);
    setShowHint(true);
    toast.info(`💡 힌트 ${currentHintIndex + 1} 사용!`);
  };

  // 책 페이지로 이동
  const goToBookPage = (pageNumber: number) => {
    setLocation(`/ebook-reader/${bookId}?page=${pageNumber - 1}`);
  };

  // 답변 선택
  const selectAnswer = async (answer: string) => {
    if (isAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    // 포인트 계산
    const earnedPoints = isCorrect ? calculateFinalPoints(currentQuestion.points, hintsUsed) : 0;

    if (isCorrect) {
      setScore(score + earnedPoints);
      setCorrectCount(correctCount + 1);
      setConsecutiveCorrect(consecutiveCorrect + 1);

      // 연속 정답 메시지
      if (consecutiveCorrect >= 1 && consecutiveCorrect < 5) {
        toast.success(ENCOURAGEMENT_MESSAGES.streak[Math.min(consecutiveCorrect - 1, 3)]);
      }

      // 정답 축하
      const randomMsg = ENCOURAGEMENT_MESSAGES.correct[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.correct.length)];
      toast.success(`✅ ${randomMsg}`);

      if (consecutiveCorrect >= 2) {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
        });
      }
    } else {
      setConsecutiveCorrect(0);
      setWrongQuestions([...wrongQuestions, currentQuestion]);

      const randomMsg = ENCOURAGEMENT_MESSAGES.wrong[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.wrong.length)];
      toast.error(`❌ ${randomMsg}`);
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
    } else {
      // 퀴즈 완료
      await finishQuiz();
    }
  };

  // 퀴즈 완료
  const finishQuiz = async () => {
    const passed = isQuizPassed(correctCount, questions.length);

    // 완료 보너스 추가 (통과 시)
    let finalScore = score;
    if (passed && selectedTier) {
      finalScore += TIER_COMPLETION_BONUS[selectedTier];
    }

    // 퀴즈 완료 처리
    const result = await completeQuiz(selectedTier!, finalScore, correctCount, questions.length);

    // 포인트 지급
    if (finalScore > 0) {
      const tierLabel = TIER_INFO[selectedTier!].label;
      await awardQuizPoints(
        bookId,
        selectedTier!,
        finalScore,
        `📚 ${book?.title} - ${tierLabel} 완료 (${correctCount}/${questions.length})`
      );
    }

    // 축하 효과
    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#f59e0b", "#a855f7"],
      });
    }

    setScore(finalScore);
    setGameState("result");
  };

  // 로딩/인증 체크
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-2xl">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Card className="max-w-md w-full border-4 border-green-400">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-4">퀴즈를 풀려면 로그인해주세요!</p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Card className="max-w-md w-full border-4 border-green-400">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-4">책을 찾을 수 없어요</h2>
            <Link href="/ebook-library">
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                도서관으로 가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 책 미완독 시 잠금 화면
  if (!bookCompleted && !ebookProgress?.is_completed) {
    const progressPercent = ebookProgress
      ? Math.round((ebookProgress.current_page / ebookProgress.total_pages) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="container max-w-2xl mx-auto py-10">
          <Card className="border-4 border-gray-300">
            <CardContent className="p-8 text-center">
              <Lock className="h-20 w-20 mx-auto mb-4 text-gray-400" />
              <h1 className="text-3xl font-bold mb-4">아직 책을 다 읽지 않았어!</h1>
              <p className="text-xl text-gray-600 mb-6">
                📚 "{book.title}"을 먼저 읽어봐!
              </p>

              {ebookProgress && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">진행률</p>
                  <Progress value={progressPercent} className="h-4 mb-2" />
                  <p className="text-lg font-bold text-green-600">
                    {progressPercent}% ({ebookProgress.current_page}/{ebookProgress.total_pages} 페이지)
                  </p>
                </div>
              )}

              <Link href={`/ebook-reader/${bookId}`}>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  {ebookProgress?.current_page ? "이어서 읽기" : "책 읽으러 가기"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 티어 선택 화면
  if (gameState === "select") {
    const tiers: QuizTier[] = ["basic", "intermediate", "master"];

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="container max-w-2xl mx-auto py-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <Link href={`/ebook-reader/${bookId}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                책으로
              </Button>
            </Link>
            <Link href="/ebook-library">
              <Button variant="ghost" size="icon">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <p className="text-6xl mb-4">{book.coverEmoji}</p>
            <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
            <p className="text-gray-600">퀴즈에 도전해봐!</p>
          </div>

          <div className="space-y-4">
            {tiers.map((tier) => {
              const info = TIER_INFO[tier];
              const unlocked = tier === "basic" || isTierUnlocked(tier);
              const completed = isTierCompleted(tier);
              const progress = progressByTier[tier];
              const quizCount = getQuizzesByBookAndTier(bookId, tier).length;

              return (
                <Card
                  key={tier}
                  className={`border-4 transition-all ${
                    unlocked
                      ? completed
                        ? "border-green-400 bg-green-50"
                        : `border-${info.color}-400 hover:shadow-lg cursor-pointer`
                      : "border-gray-300 bg-gray-100 opacity-70"
                  }`}
                  onClick={() => unlocked && startQuiz(tier)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{info.emoji}</span>
                        <div>
                          <h3 className="text-xl font-bold">{info.label}</h3>
                          <p className="text-sm text-gray-500">
                            문제 {quizCount}개
                            {progress?.best_score ? ` | 최고 점수: ${progress.best_score}점` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {completed ? (
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        ) : unlocked ? (
                          <Unlock className="h-6 w-6 text-gray-400" />
                        ) : (
                          <Lock className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {!unlocked && (
                      <p className="text-sm text-gray-500 mt-2">
                        {tier === "intermediate"
                          ? "🔒 기초 퀴즈를 먼저 통과해야 해!"
                          : "🔒 실력 퀴즈를 먼저 통과해야 해!"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 퀴즈 플레이 화면
  if (gameState === "playing" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentHint = currentQuestion.hints[currentHintIndex - 1];
    const maxPoints = calculateFinalPoints(currentQuestion.points, 0);
    const potentialPoints = calculateFinalPoints(currentQuestion.points, hintsUsed);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="container max-w-2xl mx-auto py-6">
          {/* 상단 정보 */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">
              문제 {currentQuestionIndex + 1}/{questions.length}
            </div>
            <div className="text-sm font-medium">
              현재 점수: <span className="text-green-600 font-bold">{score}점</span>
            </div>
          </div>

          <Progress value={progressPercent} className="h-2 mb-6" />

          {/* 문제 카드 */}
          <Card className="border-4 border-green-400 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${TIER_INFO[selectedTier!].color}-100 text-${TIER_INFO[selectedTier!].color}-700`}>
                  {TIER_INFO[selectedTier!].emoji} {TIER_INFO[selectedTier!].label}
                </span>
                <span className="text-sm text-gray-500">
                  💎 {potentialPoints}점 {hintsUsed > 0 && `(최대 ${maxPoints}점)`}
                </span>
              </div>

              <h2 className="text-xl font-bold mb-6">{currentQuestion.question}</h2>

              {/* 선택지 */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => {
                  const isEliminated = eliminatedOptions.includes(index);
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;

                  let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all ";

                  if (isAnswered) {
                    if (isCorrect) {
                      buttonClass += "border-green-500 bg-green-100 text-green-800";
                    } else if (isSelected) {
                      buttonClass += "border-red-500 bg-red-100 text-red-800";
                    } else {
                      buttonClass += "border-gray-200 bg-gray-50 text-gray-400";
                    }
                  } else if (isEliminated) {
                    buttonClass += "border-gray-200 bg-gray-100 text-gray-400 line-through opacity-50";
                  } else {
                    buttonClass += "border-gray-200 bg-white hover:border-green-400 hover:bg-green-50";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !isEliminated && !isAnswered && selectAnswer(option)}
                      disabled={isEliminated || isAnswered}
                      className={buttonClass}
                    >
                      <span className="font-medium">{option}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-600" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="inline-block ml-2 h-5 w-5 text-red-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 힌트 영역 */}
              {!isAnswered && currentHintIndex < currentQuestion.hints.length && (
                <div className="mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={useHint}
                    className="w-full border-amber-400 text-amber-700 hover:bg-amber-50"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    힌트 사용 ({currentQuestion.hints.length - currentHintIndex}개 남음)
                    <span className="ml-2 text-xs">(-10% 포인트)</span>
                  </Button>
                </div>
              )}

              {/* 힌트 표시 */}
              {showHint && currentHint && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-amber-800">
                    💡 {currentHint.text || currentHint.pageHint}
                  </p>
                  {currentHint.pageHint && (
                    <Button
                      variant="link"
                      className="text-amber-700 p-0 h-auto mt-2"
                      onClick={() => goToBookPage(currentQuestion.pageReference)}
                    >
                      📖 책에서 확인하기
                    </Button>
                  )}
                </div>
              )}

              {/* 정답 후 해설 */}
              {isAnswered && (
                <div className={`mt-6 p-4 rounded-xl ${selectedAnswer === currentQuestion.correctAnswer ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <p className="font-bold mb-2">
                    {selectedAnswer === currentQuestion.correctAnswer ? "🎉 정답!" : "😢 아쉬워!"}
                  </p>
                  <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
                  {selectedAnswer !== currentQuestion.correctAnswer && (
                    <Button
                      variant="link"
                      className="text-amber-700 p-0 h-auto mt-2"
                      onClick={() => goToBookPage(currentQuestion.pageReference)}
                    >
                      📖 {currentQuestion.pageReference}페이지에서 확인하기
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 다음 버튼 */}
          {isAnswered && (
            <Button
              size="lg"
              onClick={nextQuestion}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
            >
              {currentQuestionIndex < questions.length - 1 ? "다음 문제" : "결과 보기"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 결과 화면
  if (gameState === "result") {
    const passed = isQuizPassed(correctCount, questions.length);
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="container max-w-2xl mx-auto py-6">
          <Card className={`border-4 ${passed ? "border-green-400" : "border-amber-400"}`}>
            <CardContent className="p-8 text-center">
              {/* 결과 아이콘 */}
              <div className={`inline-block p-4 rounded-full mb-4 ${passed ? "bg-green-100" : "bg-amber-100"}`}>
                {passed ? (
                  <Trophy className="h-16 w-16 text-green-600" />
                ) : (
                  <Star className="h-16 w-16 text-amber-600" />
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">
                {passed ? "🎉 통과!" : "💪 다시 도전해보자!"}
              </h1>

              <p className="text-gray-600 mb-6">
                {passed
                  ? "정말 잘했어, 주우!"
                  : "60% 이상 맞아야 통과야. 힘내!"}
              </p>

              {/* 점수 카드 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">{correctCount}/{questions.length}</p>
                  <p className="text-sm text-gray-500">정답</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600">{percentage}%</p>
                  <p className="text-sm text-gray-500">정답률</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{score}점</p>
                  <p className="text-sm text-gray-500">획득 점수</p>
                </div>
              </div>

              {/* 힌트 사용 정보 */}
              {totalHintsUsed > 0 && (
                <p className="text-sm text-gray-500 mb-6">
                  💡 힌트 {totalHintsUsed}개 사용
                </p>
              )}

              {/* 틀린 문제 안내 */}
              {wrongQuestions.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 rounded-xl text-left">
                  <p className="font-bold mb-2">📖 틀린 문제는 책에서 확인해봐!</p>
                  <ul className="space-y-1 text-sm">
                    {wrongQuestions.map((q, i) => (
                      <li key={i}>
                        • {q.question.slice(0, 30)}... →{" "}
                        <button
                          className="text-amber-700 underline"
                          onClick={() => goToBookPage(q.pageReference)}
                        >
                          {q.pageReference}페이지
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 버튼들 */}
              <div className="space-y-3">
                {passed && selectedTier !== "master" && (
                  <Button
                    size="lg"
                    onClick={() => {
                      const nextTier = selectedTier === "basic" ? "intermediate" : "master";
                      startQuiz(nextTier);
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                  >
                    {selectedTier === "basic" ? "⭐ 실력 퀴즈 도전!" : "🏆 마스터 퀴즈 도전!"}
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => startQuiz(selectedTier!)}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  다시 도전
                </Button>

                <div className="flex gap-3">
                  <Link href={`/ebook-reader/${bookId}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      📖 책 다시 읽기
                    </Button>
                  </Link>
                  <Link href="/ebook-library" className="flex-1">
                    <Button variant="outline" className="w-full">
                      📚 도서관
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
