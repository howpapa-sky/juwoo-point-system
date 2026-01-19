import { useState, useEffect, useRef, useCallback } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowLeft,
  Volume2,
  Star,
  Trophy,
  RotateCcw,
  Sparkles,
  Zap,
  BookOpen,
  Brain,
  Target,
  CheckCircle,
  XCircle,
  Lightbulb,
  Award,
  Timer,
  Flame,
  Crown,
  Headphones,
  Keyboard,
  MousePointer,
  Heart,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabaseClient";
import {
  englishWordsData,
  getRandomWords,
  wordCategories,
  categoryEmojis,
  type EnglishWord,
  type WordCategory,
  type WordDifficulty,
} from "@/data/englishWordsData";
import {
  FEEDBACK_MESSAGES,
  getRandomMessage,
  getCorrectMessage,
  getIncorrectMessage,
  getDontKnowMessage,
  getGuessingMessage,
  getStreakMessage,
  SESSION_CONFIG,
} from "@/constants/feedbackMessages";

// 퀴즈 모드 타입
type QuizMode = "multiple-choice" | "typing" | "listening" | "reverse" | "mixed";
type GameState = "menu" | "playing" | "result";

interface QuizQuestion {
  word: EnglishWord;
  questionType: QuizMode;
  options?: string[];
  correctAnswer: string;
}

// 효과음 재생 함수
const playSound = (type: "correct" | "wrong" | "complete" | "streak") => {
  // Web Audio API 사용
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === "correct") {
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } else if (type === "wrong") {
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } else if (type === "streak") {
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } else if (type === "complete") {
    // 완료 팡파레
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
      osc.start(audioContext.currentTime + i * 0.15);
      osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
    });
  }
};

// TTS 발음 함수
const speakWord = (text: string, rate: number = 0.8) => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }
};

export default function EnglishQuiz() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  // 게임 상태
  const [gameState, setGameState] = useState<GameState>("menu");
  const [quizMode, setQuizMode] = useState<QuizMode>("mixed");
  const [difficulty, setDifficulty] = useState<WordDifficulty | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | "all">("all");
  const [useTimer, setUseTimer] = useState(false);

  // 퀴즈 진행
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 점수 및 연속 정답
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);

  // 타이머
  const [timeLeft, setTimeLeft] = useState(15);
  const [totalTime, setTotalTime] = useState(0);

  // 🆕 주우 맞춤 개선 - 새로운 상태들
  const [hintLevel, setHintLevel] = useState(0); // 0~3단계 힌트
  const [answerStartTime, setAnswerStartTime] = useState<number>(0); // 문제 시작 시간
  const [lastAnswerPattern, setLastAnswerPattern] = useState<string[]>([]); // 최근 답변 패턴
  const [guessingDetected, setGuessingDetected] = useState(false); // 찍기 감지됨
  const [usedDontKnow, setUsedDontKnow] = useState(false); // 모르겠어요 사용
  const [totalCoins, setTotalCoins] = useState(0); // 획득 코인
  const [dontKnowCount, setDontKnowCount] = useState(0); // 모르겠어요 사용 횟수
  const [guessingCount, setGuessingCount] = useState(0); // 찍기 감지 횟수

  const inputRef = useRef<HTMLInputElement>(null);
  const totalQuestions = SESSION_CONFIG.defaultQuestionCount; // 🆕 7문제로 변경
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100;

  // 타이머 로직
  useEffect(() => {
    if (!useTimer || gameState !== "playing" || isAnswered) return;

    if (timeLeft === 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, useTimer, gameState, isAnswered]);

  // 🆕 문제 시작 시간 기록
  useEffect(() => {
    if (currentQuestion && gameState === "playing" && !isAnswered) {
      setAnswerStartTime(Date.now());
      setGuessingDetected(false);
      setUsedDontKnow(false);
    }
  }, [currentIndex, gameState]);

  // 🆕 찍기 감지 함수
  const detectGuessing = (selectedAnswer: string): 'normal' | 'fast' | 'pattern' => {
    const answerTime = Date.now() - answerStartTime;

    // 1. 시간 기반 감지: 3초 이내 답변
    if (answerTime < SESSION_CONFIG.fastAnswerThreshold) {
      return 'fast';
    }

    // 2. 패턴 기반 감지: 최근 5문제 중 4개 이상 같은 답
    const recentAnswers = [...lastAnswerPattern.slice(-(SESSION_CONFIG.patternDetectionWindow - 1)), selectedAnswer];
    const sameAnswerCount = recentAnswers.filter(a => a === selectedAnswer).length;
    if (recentAnswers.length >= SESSION_CONFIG.patternDetectionWindow &&
        sameAnswerCount >= SESSION_CONFIG.patternThreshold) {
      return 'pattern';
    }

    return 'normal';
  };

  // 🆕 찍기 감지 시 처리
  const handleGuessingDetected = (type: 'fast' | 'pattern') => {
    setGuessingDetected(true);
    setGuessingCount(prev => prev + 1);

    toast.warning(
      type === 'fast'
        ? getRandomMessage(FEEDBACK_MESSAGES.guessing)
        : "하나씩 잘 읽어보자! 📖",
      {
        description: "천천히 다시 생각해볼까?",
        duration: 3000,
      }
    );
  };

  // 🆕 "모르겠어요" 버튼 핸들러
  const handleDontKnow = () => {
    if (isAnswered) return;

    setUsedDontKnow(true);
    setIsAnswered(true);
    setIsCorrect(false);
    setDontKnowCount(prev => prev + 1);
    setStreak(0);
    // 목숨은 유지! (찍기와 다르게 솔직하게 말했으므로)

    // 1 코인 획득
    setTotalCoins(prev => prev + 1);

    toast.success(getDontKnowMessage(), {
      description: `정답: ${currentQuestion.correctAnswer}`,
      duration: 4000,
    });

    // 정답 발음 재생
    speakWord(currentQuestion.word.word);
  };

  // 🆕 힌트 생성 함수
  const getHints = () => {
    if (!currentQuestion) return [];
    const word = currentQuestion.word;
    return [
      `이 단어는 "${word.category}" 종류야!`, // 힌트 1: 카테고리
      word.example ? `문장에서 쓰면: "${word.example}"` : `발음은 "${word.pronunciation}"야!`, // 힌트 2: 예문 또는 발음
      `정답의 첫 글자는 "${currentQuestion.correctAnswer.charAt(0)}"야!`, // 힌트 3: 첫글자
    ];
  };

  // 시간 초과
  const handleTimeout = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    setStreak(0);
    // 🆕 시간 초과도 목숨 유지 (주우에게 부담 줄이기)
    toast.info("시간이 다 됐어! ⏰", {
      description: `정답: ${currentQuestion.correctAnswer}`,
    });
    speakWord(currentQuestion.word.word);
  };

  // 퀴즈 문제 생성
  const generateQuestions = useCallback(() => {
    let wordPool = [...englishWordsData];

    // 카테고리 필터
    if (selectedCategory !== "all") {
      wordPool = wordPool.filter(w => w.category === selectedCategory);
    }

    // 난이도 필터
    if (difficulty !== "all") {
      wordPool = wordPool.filter(w => w.difficulty === difficulty);
    }

    // 충분한 단어가 없으면 전체에서
    if (wordPool.length < totalQuestions) {
      wordPool = [...englishWordsData];
    }

    // 랜덤 셔플
    const shuffled = wordPool.sort(() => Math.random() - 0.5).slice(0, totalQuestions);

    const modes: QuizMode[] = ["multiple-choice", "typing", "listening", "reverse"];

    const quizQuestions: QuizQuestion[] = shuffled.map((word, index) => {
      let questionType: QuizMode;

      if (quizMode === "mixed") {
        // 믹스 모드: 다양한 유형 섞기
        questionType = modes[index % modes.length];
      } else {
        questionType = quizMode;
      }

      // 객관식 선택지 생성
      let options: string[] | undefined;
      if (questionType === "multiple-choice" || questionType === "listening") {
        const wrongAnswers = englishWordsData
          .filter(w => w.id !== word.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.meaning);
        options = [...wrongAnswers, word.meaning].sort(() => Math.random() - 0.5);
      } else if (questionType === "reverse") {
        // 한국어 -> 영어 객관식
        const wrongAnswers = englishWordsData
          .filter(w => w.id !== word.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.word);
        options = [...wrongAnswers, word.word].sort(() => Math.random() - 0.5);
      }

      return {
        word,
        questionType,
        options,
        correctAnswer: questionType === "reverse" ? word.word : word.meaning,
      };
    });

    return quizQuestions;
  }, [quizMode, difficulty, selectedCategory, totalQuestions]);

  // 게임 시작
  const startGame = () => {
    const newQuestions = generateQuestions();
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(5); // 🆕 목숨 5개로 증가 (여유롭게)
    setTimeLeft(15);
    setTotalTime(0);
    // 🆕 새로운 상태들 리셋
    setHintLevel(0);
    setTotalCoins(0);
    setDontKnowCount(0);
    setGuessingCount(0);
    setLastAnswerPattern([]);
    setGuessingDetected(false);
    setUsedDontKnow(false);
    setGameState("playing");

    // 첫 문제가 듣기면 자동 재생
    if (newQuestions[0]?.questionType === "listening") {
      setTimeout(() => speakWord(newQuestions[0].word.word), 500);
    }
  };

  // 정답 확인
  const checkAnswer = (answer: string): boolean => {
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrect = currentQuestion.correctAnswer.toLowerCase();

    if (normalizedAnswer === normalizedCorrect) return true;

    // 타이핑 모드에서 유사 답변 허용
    if (currentQuestion.questionType === "typing" || currentQuestion.questionType === "reverse") {
      // 오타 하나 허용 (레벤슈타인 거리 1)
      if (Math.abs(normalizedAnswer.length - normalizedCorrect.length) <= 1) {
        let diff = 0;
        const shorter = normalizedAnswer.length < normalizedCorrect.length ? normalizedAnswer : normalizedCorrect;
        const longer = normalizedAnswer.length >= normalizedCorrect.length ? normalizedAnswer : normalizedCorrect;

        for (let i = 0; i < longer.length; i++) {
          if (shorter[i] !== longer[i]) diff++;
        }
        if (diff <= 1) return true;
      }
    }

    return false;
  };

  // 객관식 답 선택
  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    // 🆕 찍기 감지 (객관식만)
    const guessingType = detectGuessing(answer);
    if (guessingType !== 'normal') {
      handleGuessingDetected(guessingType);
      // 찍기 감지 시 같은 문제 유지 (답변 처리 안 함)
      return;
    }

    setUserAnswer(answer);
    setLastAnswerPattern(prev => [...prev.slice(-(SESSION_CONFIG.patternDetectionWindow - 1)), answer]);
    submitAnswer(answer);
  };

  // 주관식 제출
  const handleSubmitTyping = () => {
    if (isAnswered || !userAnswer.trim()) return;
    // 주관식은 찍기 감지 안 함 (타이핑 필요하므로)
    setLastAnswerPattern(prev => [...prev.slice(-(SESSION_CONFIG.patternDetectionWindow - 1)), userAnswer]);
    submitAnswer(userAnswer);
  };

  // 답변 제출
  const submitAnswer = (answer: string) => {
    setIsAnswered(true);
    const correct = checkAnswer(answer);
    setIsCorrect(correct);

    // 🆕 코인 계산 (난이도별)
    const difficultyCoins = {
      easy: 2,
      medium: 3,
      hard: 5,
    };
    const baseCoins = difficultyCoins[currentQuestion.word.difficulty];

    if (correct) {
      // 정답
      const basePoints = currentQuestion.word.difficulty === "easy" ? 10 :
                        currentQuestion.word.difficulty === "medium" ? 15 : 20;
      const streakBonus = Math.min(streak * 2, 10);
      const timeBonus = useTimer ? Math.floor(timeLeft / 3) : 0;
      const totalPoints = basePoints + streakBonus + timeBonus;

      // 🆕 코인 계산 (힌트 미사용 보너스)
      const hintBonus = hintLevel === 0 ? 1 : 0;
      const earnedCoins = baseCoins + hintBonus;
      setTotalCoins(prev => prev + earnedCoins);

      setScore(prev => prev + totalPoints);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, streak + 1));

      // 🆕 개선된 피드백 메시지
      const newStreak = streak + 1;
      const streakMsg = getStreakMessage(newStreak);

      if (newStreak >= 3) {
        playSound("streak");
        toast.success(getCorrectMessage(currentQuestion.word.difficulty), {
          description: streakMsg || `+${earnedCoins} 코인 🪙`,
          duration: 2500,
        });
      } else {
        playSound("correct");
        toast.success(getCorrectMessage(currentQuestion.word.difficulty), {
          description: hintBonus > 0 ? "스스로 해냈어! 🌟" : `+${earnedCoins} 코인 🪙`,
          duration: 2500,
        });
      }

      // 연속 정답 효과
      if (newStreak >= 4) {
        confetti({
          particleCount: 30 + newStreak * 5,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4"],
        });
      }
    } else {
      // 🆕 오답이지만 긍정적 피드백 + 1 코인
      playSound("wrong");
      setStreak(0);
      setTotalCoins(prev => prev + 1); // 끝까지 풀었으니 1코인
      // 목숨 감소하지 않음 (주우에게 부담 줄이기)

      toast.info(getIncorrectMessage(), {
        description: `정답: ${currentQuestion.correctAnswer} (+1 코인 🪙)`,
        duration: 3000,
      });
    }

    // 정답 발음 재생
    speakWord(currentQuestion.word.word);
  };

  // 다음 문제
  const handleNext = async () => {
    // 🆕 목숨 체크 제거 (주우에게 부담 줄이기)
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setTimeLeft(15);
      setHintLevel(0); // 🆕 힌트 레벨 리셋
      setGuessingDetected(false);
      setUsedDontKnow(false);

      // 듣기 문제면 자동 재생
      const nextQuestion = questions[currentIndex + 1];
      if (nextQuestion?.questionType === "listening") {
        setTimeout(() => speakWord(nextQuestion.word.word), 300);
      }

      // 타이핑 문제면 포커스
      setTimeout(() => {
        if (nextQuestion?.questionType === "typing" || nextQuestion?.questionType === "reverse") {
          inputRef.current?.focus();
        }
      }, 100);
    } else {
      // 게임 종료
      setGameState("result");
      playSound("complete");
      await awardPoints();

      if (correctCount >= totalQuestions * 0.7) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
        });
      }
    }
  };

  // 포인트 지급
  const awardPoints = async () => {
    try {
      const { data: profile } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();

      const currentBalance = profile?.current_points || 0;
      const scorePercent = Math.round((correctCount / totalQuestions) * 100);

      let points = 0;
      let note = "";

      if (scorePercent === 100) {
        points = 3000;
        note = "영어 퀴즈 만점 달성! 🏆";
      } else if (scorePercent >= 90) {
        points = 2500;
        note = "영어 퀴즈 마스터! ⭐";
      } else if (scorePercent >= 80) {
        points = 2000;
        note = "영어 퀴즈 고수! 💪";
      } else if (scorePercent >= 70) {
        points = 1500;
        note = "영어 퀴즈 도전자!";
      } else if (scorePercent >= 50) {
        points = 1000;
        note = "영어 퀴즈 학습중!";
      } else if (correctCount > 0) {
        points = 500;
        note = "영어 퀴즈 도전!";
      }

      // 스트릭 보너스
      if (maxStreak >= 10) {
        points += 500;
        note += ` (10연속 보너스!)`;
      } else if (maxStreak >= 5) {
        points += 200;
        note += ` (5연속 보너스!)`;
      }

      if (points > 0) {
        const newBalance = currentBalance + points;

        await supabase.from("point_transactions").insert({
          juwoo_id: 1,
          rule_id: null,
          amount: points,
          balance_after: newBalance,
          note: note,
          created_by: 1, // 시스템/관리자
        });

        await supabase
          .from("juwoo_profile")
          .update({ current_points: newBalance })
          .eq("id", 1);

        toast.success(`🎉 ${points} 포인트 획득!`);
      }
    } catch (error) {
      console.error("포인트 적립 오류:", error);
    }
  };

  // 로그인 체크
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <Card className="max-w-md w-full border-4 border-blue-400 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="text-7xl mb-6 animate-bounce">📚</div>
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-6">영어 퀴즈를 풀려면 로그인해주세요!</p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg py-6">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ====== 메뉴 화면 ======
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-4xl py-8 px-4">
          <div className="mb-6">
            <Link href="/english-learning">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/50">
                <ArrowLeft className="h-4 w-4" />
                영어 학습
              </Button>
            </Link>
          </div>

          <Card className="border-4 border-blue-400 shadow-2xl bg-white/90 backdrop-blur">
            <CardContent className="p-6 md:p-8">
              {/* 헤더 */}
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mb-4 shadow-lg animate-pulse">
                  <Brain className="h-14 w-14 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  영어 단어 퀴즈
                </h1>
                <p className="text-muted-foreground">
                  {englishWordsData.length}개의 단어로 실력을 테스트해보세요!
                </p>
              </div>

              {/* 퀴즈 모드 선택 */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  퀴즈 모드
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: "mixed", label: "믹스", icon: <Sparkles className="h-5 w-5" />, desc: "다양한 유형" },
                    { value: "multiple-choice", label: "객관식", icon: <MousePointer className="h-5 w-5" />, desc: "4지선다" },
                    { value: "typing", label: "타이핑", icon: <Keyboard className="h-5 w-5" />, desc: "직접 입력" },
                    { value: "listening", label: "듣기", icon: <Headphones className="h-5 w-5" />, desc: "발음 듣고 맞추기" },
                    { value: "reverse", label: "한→영", icon: <BookOpen className="h-5 w-5" />, desc: "영어로 답하기" },
                  ].map(mode => (
                    <button
                      key={mode.value}
                      onClick={() => setQuizMode(mode.value as QuizMode)}
                      className={`p-3 md:p-4 rounded-xl border-2 transition-all text-left ${
                        quizMode === mode.value
                          ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={quizMode === mode.value ? "text-blue-600" : "text-gray-500"}>
                          {mode.icon}
                        </span>
                        <span className="font-bold">{mode.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 난이도 선택 */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  난이도
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "all", label: "전체", color: "border-purple-300 bg-purple-50" },
                    { value: "easy", label: "쉬움", color: "border-green-300 bg-green-50" },
                    { value: "medium", label: "보통", color: "border-yellow-300 bg-yellow-50" },
                    { value: "hard", label: "어려움", color: "border-red-300 bg-red-50" },
                  ].map(d => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value as WordDifficulty | "all")}
                      className={`p-3 rounded-xl border-2 font-bold transition-all ${
                        difficulty === d.value
                          ? `${d.color} border-4 scale-105`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 카테고리 선택 */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  카테고리
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                      selectedCategory === "all"
                        ? "border-blue-500 bg-blue-100 text-blue-700"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    🌈 전체
                  </button>
                  {wordCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                        selectedCategory === cat
                          ? "border-blue-500 bg-blue-100 text-blue-700"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {categoryEmojis[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 옵션 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useTimer}
                    onChange={e => setUseTimer(e.target.checked)}
                    className="w-5 h-5 rounded accent-blue-500"
                  />
                  <Timer className="h-5 w-5 text-orange-500" />
                  <div>
                    <span className="font-medium">시간 제한 모드</span>
                    <p className="text-xs text-muted-foreground">문제당 15초 제한</p>
                  </div>
                </label>
              </div>

              {/* 게임 규칙 */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  게임 규칙
                </h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 총 {totalQuestions}문제가 출제됩니다</li>
                  <li>• ❤️ 목숨 3개로 시작! 틀리면 1개 감소</li>
                  <li>• 🔥 연속 정답 보너스 점수!</li>
                  <li>• 어려운 단어일수록 높은 점수</li>
                  <li>• 시간 제한 모드에서 빨리 맞추면 추가 점수!</li>
                </ul>
              </div>

              {/* 시작 버튼 */}
              <Button
                size="lg"
                onClick={startGame}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-xl py-6 shadow-lg"
              >
                <Zap className="h-6 w-6 mr-2" />
                퀴즈 시작하기!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ====== 결과 화면 ======
  if (gameState === "result") {
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const stars = scorePercent >= 90 ? 3 : scorePercent >= 70 ? 2 : scorePercent >= 40 ? 1 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-4xl py-8 px-4">
          <Card className="border-4 border-yellow-400 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-6 md:p-8 text-center">
              {/* 트로피 */}
              <div className="mb-6">
                <div className="inline-block p-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-bounce">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2">퀴즈 완료!</h1>
              </div>

              {/* 별점 */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3].map(i => (
                  <Star
                    key={i}
                    className={`h-14 w-14 transition-all ${
                      i <= stars
                        ? "fill-yellow-400 text-yellow-400 animate-pulse"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* 🆕 획득 코인 강조 표시 */}
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl border-2 border-yellow-300">
                <div className="text-5xl font-bold text-yellow-600 mb-1">{totalCoins} 🪙</div>
                <div className="text-sm text-yellow-700">획득 코인</div>
              </div>

              {/* 점수 표시 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-blue-700">총 점수</div>
                </div>
                <div className="p-4 bg-green-100 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{correctCount}/{totalQuestions}</div>
                  <div className="text-sm text-green-700">정답</div>
                </div>
                <div className="p-4 bg-orange-100 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600">{maxStreak}</div>
                  <div className="text-sm text-orange-700">최대 연속</div>
                </div>
                <div className="p-4 bg-purple-100 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">{scorePercent}%</div>
                  <div className="text-sm text-purple-700">정답률</div>
                </div>
              </div>

              {/* 메시지 */}
              <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-lg font-medium">
                  {scorePercent === 100 && "완벽해요! 영어 천재! 🏆"}
                  {scorePercent >= 90 && scorePercent < 100 && "대단해요! 영어 마스터! ⭐"}
                  {scorePercent >= 70 && scorePercent < 90 && "잘했어요! 영어 고수! 💪"}
                  {scorePercent >= 50 && scorePercent < 70 && "좋아요! 계속 연습해요! 📚"}
                  {scorePercent < 50 && "괜찮아요! 다시 도전해봐요! 🌟"}
                </p>
                {maxStreak >= 5 && (
                  <p className="mt-2 text-orange-600 font-medium">
                    🔥 {maxStreak}연속 정답 달성! 멋져요!
                  </p>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex gap-4 justify-center flex-wrap">
                {/* 🆕 더 풀래요 버튼 (연속 학습 유도) */}
                <Button
                  size="lg"
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold animate-pulse"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  더 풀래요! 🎯
                </Button>
                <Button
                  size="lg"
                  onClick={() => setGameState("menu")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  다시 하기
                </Button>
                <Link href="/english-flashcard">
                  <Button size="lg" variant="outline" className="font-bold">
                    <BookOpen className="h-5 w-5 mr-2" />
                    플래시카드
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="font-bold">
                    대시보드
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ====== 퀴즈 진행 화면 ======
  const getModeLabel = () => {
    switch (currentQuestion?.questionType) {
      case "multiple-choice": return "객관식";
      case "typing": return "타이핑";
      case "listening": return "듣기";
      case "reverse": return "한→영";
      default: return "";
    }
  };

  const getModeIcon = () => {
    switch (currentQuestion?.questionType) {
      case "multiple-choice": return <MousePointer className="h-4 w-4" />;
      case "typing": return <Keyboard className="h-4 w-4" />;
      case "listening": return <Headphones className="h-4 w-4" />;
      case "reverse": return <BookOpen className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="container max-w-4xl py-6 px-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGameState("menu")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            나가기
          </Button>

          <div className="flex items-center gap-2">
            {/* 🆕 목숨 5개로 변경 */}
            <div className="flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  className={`h-4 w-4 ${
                    i < lives ? "fill-red-500 text-red-500" : "fill-gray-300 text-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* 스트릭 */}
            {streak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-full animate-pulse">
                <Flame className="h-4 w-4 text-orange-600" />
                <span className="font-bold text-orange-600">{streak}</span>
              </div>
            )}

            {/* 타이머 */}
            {useTimer && (
              <div className={`px-3 py-1 rounded-full font-bold ${
                timeLeft <= 5 ? "bg-red-100 text-red-700 animate-pulse" : "bg-blue-100 text-blue-700"
              }`}>
                ⏱️ {timeLeft}s
              </div>
            )}
          </div>
        </div>

        {/* 진행률 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* 🆕 난이도 별 표시 */}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                currentQuestion.word.difficulty === "easy" ? "bg-green-100 text-green-700" :
                currentQuestion.word.difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }`}>
                {currentQuestion.word.difficulty === "easy" && "★ 기본"}
                {currentQuestion.word.difficulty === "medium" && "★★ 보통"}
                {currentQuestion.word.difficulty === "hard" && (
                  <>★★★ 도전! <span className="text-[10px]">(틀려도 OK!)</span></>
                )}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {getModeIcon()} {getModeLabel()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{currentIndex + 1} / {totalQuestions}</span>
              <span className="font-bold text-blue-600">⭐ {score}점</span>
            </div>
          </div>
          <Progress value={progress} className="h-3 bg-blue-200" />
        </div>

        {/* 문제 카드 */}
        <Card className="mb-6 border-4 border-blue-400 shadow-xl bg-white/95 backdrop-blur">
          <CardContent className="p-6 md:p-8">
            {/* 카테고리 */}
            <div className="text-center mb-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {categoryEmojis[currentQuestion.word.category as WordCategory]} {currentQuestion.word.category}
              </span>
            </div>

            {/* 문제 */}
            <div className="text-center mb-6">
              {/* 듣기 모드 */}
              {currentQuestion.questionType === "listening" && (
                <>
                  <p className="text-sm text-muted-foreground mb-4">🎧 발음을 듣고 뜻을 맞춰보세요!</p>
                  <Button
                    size="lg"
                    onClick={() => speakWord(currentQuestion.word.word)}
                    className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Volume2 className="h-8 w-8 mr-2" />
                    발음 듣기
                  </Button>
                  {isAnswered && (
                    <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                      {currentQuestion.word.word}
                    </h2>
                  )}
                </>
              )}

              {/* 객관식: 영어 -> 한국어 */}
              {currentQuestion.questionType === "multiple-choice" && (
                <>
                  <p className="text-sm text-muted-foreground mb-4">이 단어의 뜻은?</p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-blue-600">
                      {currentQuestion.word.word}
                    </h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => speakWord(currentQuestion.word.word)}
                      className="rounded-full"
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    [{currentQuestion.word.pronunciation}]
                  </p>
                </>
              )}

              {/* 타이핑: 영어 -> 한국어 입력 */}
              {currentQuestion.questionType === "typing" && (
                <>
                  <p className="text-sm text-muted-foreground mb-4">이 단어의 뜻을 입력하세요!</p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-blue-600">
                      {currentQuestion.word.word}
                    </h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => speakWord(currentQuestion.word.word)}
                      className="rounded-full"
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    [{currentQuestion.word.pronunciation}]
                  </p>
                </>
              )}

              {/* 역방향: 한국어 -> 영어 */}
              {currentQuestion.questionType === "reverse" && (
                <>
                  <p className="text-sm text-muted-foreground mb-4">이 뜻의 영어 단어를 고르세요!</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">
                    {currentQuestion.word.meaning}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    💡 힌트: {currentQuestion.word.tip}
                  </p>
                </>
              )}
            </div>

            {/* 🆕 3단계 힌트 시스템 */}
            {!isAnswered && (
              <div className="mb-4">
                {/* 힌트 표시 영역 */}
                {hintLevel > 0 && (
                  <div className="mb-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        {getHints().slice(0, hintLevel).map((hint, i) => (
                          <p key={i} className="text-yellow-800 mb-1">💡 힌트 {i + 1}: {hint}</p>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-yellow-600 mt-2">힌트를 써도 코인은 그대로야! 걱정마!</p>
                  </div>
                )}

                {/* 힌트 버튼 */}
                {hintLevel < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHintLevel(prev => Math.min(prev + 1, 3))}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    힌트 {hintLevel + 1} 보기 💡
                  </Button>
                )}
              </div>
            )}

            {/* 🆕 찍기 감지 경고 */}
            {guessingDetected && !isAnswered && (
              <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-xl">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-amber-600" />
                  <span className="text-amber-700 font-medium">
                    천천히 다시 생각해볼까? 🤔
                  </span>
                </div>
              </div>
            )}

            {/* 답변 영역 */}
            {/* 객관식 / 듣기 / 역방향 */}
            {(currentQuestion.questionType === "multiple-choice" ||
              currentQuestion.questionType === "listening" ||
              currentQuestion.questionType === "reverse") && currentQuestion.options && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = userAnswer === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  const showResult = isAnswered;

                  let btnClass = "h-16 md:h-20 text-lg md:text-xl font-bold transition-all rounded-xl";

                  if (showResult) {
                    if (isCorrectOption) {
                      btnClass += " bg-green-500 hover:bg-green-600 text-white border-4 border-green-600";
                    } else if (isSelected && !isCorrectOption) {
                      btnClass += " bg-red-500 hover:bg-red-600 text-white border-4 border-red-600";
                    } else {
                      btnClass += " opacity-50 border-2";
                    }
                  } else {
                    btnClass += " hover:bg-blue-100 border-2 border-blue-300 hover:border-blue-500";
                  }

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={btnClass}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={isAnswered}
                    >
                      {showResult && isCorrectOption && <CheckCircle className="h-5 w-5 mr-2" />}
                      {showResult && isSelected && !isCorrectOption && <XCircle className="h-5 w-5 mr-2" />}
                      {option}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* 🆕 "모르겠어요" 버튼 - 객관식/듣기/역방향 */}
            {(currentQuestion.questionType === "multiple-choice" ||
              currentQuestion.questionType === "listening" ||
              currentQuestion.questionType === "reverse") && !isAnswered && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={handleDontKnow}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50 font-medium"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  모르겠어요 🤷 (+1 코인)
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  솔직하게 말하면 1코인을 받아요!
                </p>
              </div>
            )}

            {/* 타이핑 */}
            {currentQuestion.questionType === "typing" && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="한국어로 입력하세요..."
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmitTyping()}
                    disabled={isAnswered}
                    autoFocus
                    className="text-xl text-center h-14 border-2 border-blue-300 focus:border-blue-500"
                  />
                  <Button
                    onClick={handleSubmitTyping}
                    disabled={isAnswered || !userAnswer.trim()}
                    className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold"
                  >
                    확인
                  </Button>
                </div>

                {/* 🆕 타이핑 모드 "모르겠어요" 버튼 */}
                {!isAnswered && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={handleDontKnow}
                      className="text-purple-600 border-purple-300 hover:bg-purple-50 font-medium"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      모르겠어요 🤷 (+1 코인)
                    </Button>
                  </div>
                )}

                {isAnswered && (
                  <div className={`p-4 rounded-xl ${isCorrect ? "bg-green-100" : "bg-red-100"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <span className={`font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                        {isCorrect ? "정답!" : `오답! 정답: ${currentQuestion.correctAnswer}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 정답 해설 */}
            {isAnswered && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-700">{currentQuestion.word.word} = {currentQuestion.word.meaning}</p>
                    <p className="text-sm text-gray-600 mt-1">📝 {currentQuestion.word.example}</p>
                    <p className="text-xs text-gray-500">{currentQuestion.word.exampleKorean}</p>
                  </div>
                </div>
                {currentQuestion.word.tip && (
                  <p className="text-sm text-yellow-700 mt-2">💡 {currentQuestion.word.tip}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 다음 버튼 */}
        {isAnswered && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-xl px-12 py-6"
            >
              {lives <= 0 && !isCorrect
                ? "결과 보기 🎯"
                : currentIndex < totalQuestions - 1
                ? "다음 문제 ➡️"
                : "결과 보기 🎉"}
            </Button>
          </div>
        )}

        {/* 하단 상태 바 */}
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-bold">정답: {correctCount}개</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <Award className="h-5 w-5 text-blue-500" />
            <span className="font-bold">점수: {score}점</span>
          </div>
          {maxStreak > 0 && (
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold">최대 연속: {maxStreak}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
