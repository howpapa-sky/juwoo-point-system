import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Trophy,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  Lightbulb,
  Award,
  Flame,
  Crown,
  Heart,
  Shield,
  Swords,
  Timer,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabaseClient";

// ============================================
// 타입 정의
// ============================================
type QuestionType = "multiple-choice" | "short-answer" | "true-false";
type Difficulty = "easy" | "medium" | "hard";
type GameState = "menu" | "playing" | "result";

interface QuizQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  question: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  options?: string[];
  hint: string;
  explanation: string;
  points: number;
  dragonEmoji?: string;
}

// ============================================
// 드래곤 빌리지 퀴즈 데이터
// ============================================
const dragonQuizData: QuizQuestion[] = [
  // ===== 쉬운 문제 (Easy) =====
  {
    id: "e1",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본",
    question: "드래곤 빌리지에서 드래곤을 부화시키려면 무엇이 필요할까요?",
    correctAnswer: "알",
    options: ["알", "마법석", "금화", "나뭇잎"],
    hint: "둥글고 예쁜 것에서 드래곤이 태어나요!",
    explanation: "드래곤은 알에서 부화해서 태어나요! 다양한 색깔과 종류의 알이 있답니다.",
    points: 5,
    dragonEmoji: "🥚",
  },
  {
    id: "e2",
    type: "multiple-choice",
    difficulty: "easy",
    category: "속성",
    question: "불 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "풀",
    options: ["풀", "물", "불", "땅"],
    hint: "불이 태울 수 있는 것을 생각해보세요!",
    explanation: "불 속성은 풀 속성에게 강해요! 🔥 > 🌿",
    points: 5,
    dragonEmoji: "🔥",
  },
  {
    id: "e3",
    type: "multiple-choice",
    difficulty: "easy",
    category: "속성",
    question: "물 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "불",
    options: ["불", "풀", "물", "전기"],
    hint: "물로 끌 수 있는 것을 생각해보세요!",
    explanation: "물 속성은 불 속성에게 강해요! 💧 > 🔥",
    points: 5,
    dragonEmoji: "💧",
  },
  {
    id: "e4",
    type: "true-false",
    difficulty: "easy",
    category: "기본",
    question: "드래곤은 레벨이 올라가면 더 강해진다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "경험치를 모으면 무엇이 될까요?",
    explanation: "맞아요! 드래곤은 레벨이 올라가면 스탯이 높아지고 더 강해져요!",
    points: 5,
    dragonEmoji: "⬆️",
  },
  {
    id: "e5",
    type: "multiple-choice",
    difficulty: "easy",
    category: "진화",
    question: "드래곤이 진화하면 어떻게 될까요?",
    correctAnswer: "더 강해진다",
    options: ["더 강해진다", "더 약해진다", "변화 없다", "사라진다"],
    hint: "진화는 성장이에요!",
    explanation: "드래곤이 진화하면 외형이 바뀌고 더 강해져요! ✨",
    points: 5,
    dragonEmoji: "✨",
  },
  {
    id: "e6",
    type: "multiple-choice",
    difficulty: "easy",
    category: "속성",
    question: "풀 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "물",
    options: ["물", "불", "풀", "바람"],
    hint: "식물이 좋아하는 것을 생각해보세요!",
    explanation: "풀 속성은 물 속성에게 강해요! 🌿 > 💧",
    points: 5,
    dragonEmoji: "🌿",
  },
  {
    id: "e7",
    type: "short-answer",
    difficulty: "easy",
    category: "기본",
    question: "드래곤이 싸우는 곳을 뭐라고 부를까요?",
    correctAnswer: "배틀",
    acceptableAnswers: ["배틀", "전투", "싸움", "대전", "아레나", "전장"],
    hint: "영어로 '싸움'을 뜻해요!",
    explanation: "드래곤들이 싸우는 것을 배틀(Battle)이라고 해요!",
    points: 8,
    dragonEmoji: "⚔️",
  },
  {
    id: "e8",
    type: "multiple-choice",
    difficulty: "easy",
    category: "희귀도",
    question: "가장 흔한 드래곤 등급은?",
    correctAnswer: "노말",
    options: ["노말", "레어", "에픽", "레전드"],
    hint: "가장 쉽게 얻을 수 있는 등급이에요!",
    explanation: "노말 등급이 가장 흔하고, 레전드로 갈수록 희귀해져요!",
    points: 5,
    dragonEmoji: "⚪",
  },

  // ===== 보통 문제 (Medium) =====
  {
    id: "m1",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "전기 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "물",
    options: ["물", "땅", "전기", "불"],
    hint: "전기가 잘 통하는 것을 생각해보세요!",
    explanation: "전기 속성은 물 속성에게 강해요! ⚡ > 💧",
    points: 8,
    dragonEmoji: "⚡",
  },
  {
    id: "m2",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "땅 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "전기",
    options: ["전기", "물", "풀", "불"],
    hint: "땅은 전기를 어떻게 할까요?",
    explanation: "땅 속성은 전기 속성에게 강해요! 땅이 전기를 흡수해요! 🏔️ > ⚡",
    points: 8,
    dragonEmoji: "🏔️",
  },
  {
    id: "m3",
    type: "multiple-choice",
    difficulty: "medium",
    category: "희귀도",
    question: "가장 희귀한 드래곤 등급은?",
    correctAnswer: "레전드",
    options: ["레전드", "에픽", "레어", "노말"],
    hint: "전설적인 드래곤이에요!",
    explanation: "레전드 등급이 가장 희귀하고 강력해요! 얻기가 매우 어렵답니다.",
    points: 8,
    dragonEmoji: "👑",
  },
  {
    id: "m4",
    type: "true-false",
    difficulty: "medium",
    category: "배틀",
    question: "배틀에서 속성 상성이 중요하다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "가위바위보처럼 유리한 속성이 있어요!",
    explanation: "맞아요! 상대에게 강한 속성의 드래곤을 사용하면 더 쉽게 이길 수 있어요!",
    points: 8,
    dragonEmoji: "🎯",
  },
  {
    id: "m5",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "빛 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "어둠",
    options: ["어둠", "빛", "불", "물"],
    hint: "빛과 어둠은 서로 반대예요!",
    explanation: "빛 속성은 어둠 속성에게 강해요! ☀️ > 🌑",
    points: 8,
    dragonEmoji: "☀️",
  },
  {
    id: "m6",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "어둠 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "빛",
    options: ["빛", "어둠", "땅", "바람"],
    hint: "빛과 어둠은 서로 반대예요!",
    explanation: "어둠 속성은 빛 속성에게 강해요! 🌑 > ☀️",
    points: 8,
    dragonEmoji: "🌑",
  },
  {
    id: "m7",
    type: "short-answer",
    difficulty: "medium",
    category: "진화",
    question: "드래곤이 더 강하게 변하는 것을 뭐라고 할까요?",
    correctAnswer: "진화",
    acceptableAnswers: ["진화", "진화하기", "이볼브", "성장"],
    hint: "포켓몬에서도 이런 걸 해요!",
    explanation: "드래곤이 진화하면 외형이 바뀌고 더 강해져요!",
    points: 10,
    dragonEmoji: "🔄",
  },
  {
    id: "m8",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "바람 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "땅",
    options: ["땅", "물", "불", "전기"],
    hint: "바람은 하늘을 날아다녀요!",
    explanation: "바람 속성은 땅 속성에게 강해요! 하늘에서 공격하면 유리하죠! 🌪️ > 🏔️",
    points: 8,
    dragonEmoji: "🌪️",
  },

  // ===== 어려운 문제 (Hard) =====
  {
    id: "h1",
    type: "multiple-choice",
    difficulty: "hard",
    category: "속성",
    question: "얼음 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "풀",
    options: ["풀", "물", "불", "얼음"],
    hint: "추우면 식물이 어떻게 될까요?",
    explanation: "얼음 속성은 풀 속성에게 강해요! 식물은 추위에 약하답니다. ❄️ > 🌿",
    points: 12,
    dragonEmoji: "❄️",
  },
  {
    id: "h2",
    type: "short-answer",
    difficulty: "hard",
    category: "특수",
    question: "두 가지 속성을 가진 드래곤을 뭐라고 할까요?",
    correctAnswer: "듀얼",
    acceptableAnswers: ["듀얼", "듀얼속성", "이중속성", "듀얼 속성", "복합속성", "하이브리드"],
    hint: "영어로 '둘'을 뜻하는 단어로 시작해요!",
    explanation: "두 가지 속성을 가진 드래곤을 듀얼 속성 드래곤이라고 해요!",
    points: 15,
    dragonEmoji: "🔀",
  },
  {
    id: "h3",
    type: "multiple-choice",
    difficulty: "hard",
    category: "배틀",
    question: "드래곤 배틀에서 가장 중요한 것은?",
    correctAnswer: "속성 상성",
    options: ["속성 상성", "레벨만", "외모", "이름"],
    hint: "가위바위보처럼 이기는 조합이 있어요!",
    explanation: "배틀에서는 속성 상성이 가장 중요해요! 유리한 속성으로 싸우면 이기기 쉬워요.",
    points: 12,
    dragonEmoji: "🏆",
  },
  {
    id: "h4",
    type: "true-false",
    difficulty: "hard",
    category: "희귀도",
    question: "레전드 드래곤은 노말 드래곤보다 무조건 강하다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "등급이 높으면 기본 능력치가 높아요!",
    explanation: "맞아요! 레전드 드래곤은 기본 스탯이 높아서 같은 레벨이면 더 강해요!",
    points: 12,
    dragonEmoji: "💎",
  },
  {
    id: "h5",
    type: "multiple-choice",
    difficulty: "hard",
    category: "특수",
    question: "드래곤의 스킬을 강화하려면 무엇이 필요할까요?",
    correctAnswer: "스킬북",
    options: ["스킬북", "알", "금화", "경험치"],
    hint: "책처럼 생긴 아이템이에요!",
    explanation: "스킬북을 사용하면 드래곤의 스킬을 강화할 수 있어요!",
    points: 12,
    dragonEmoji: "📖",
  },
  {
    id: "h6",
    type: "short-answer",
    difficulty: "hard",
    category: "특수",
    question: "모든 드래곤 중에서 가장 강력한 드래곤 종류는?",
    correctAnswer: "레전드",
    acceptableAnswers: ["레전드", "레전더리", "전설", "레전드 드래곤"],
    hint: "전설적인 드래곤이에요!",
    explanation: "레전드 드래곤이 가장 희귀하고 강력해요!",
    points: 15,
    dragonEmoji: "🐉",
  },
  {
    id: "h7",
    type: "multiple-choice",
    difficulty: "hard",
    category: "속성",
    question: "불, 물, 풀 속성의 관계는 어떤 게임과 비슷할까요?",
    correctAnswer: "가위바위보",
    options: ["가위바위보", "오목", "체스", "주사위"],
    hint: "세 가지가 서로 이기고 지는 관계예요!",
    explanation: "불 > 풀 > 물 > 불! 가위바위보처럼 서로 이기고 지는 관계예요!",
    points: 12,
    dragonEmoji: "✊",
  },
  {
    id: "h8",
    type: "multiple-choice",
    difficulty: "hard",
    category: "특수",
    question: "드래곤의 HP가 0이 되면 어떻게 될까요?",
    correctAnswer: "기절한다",
    options: ["기절한다", "진화한다", "도망간다", "더 강해진다"],
    hint: "배틀에서 지면 어떻게 될까요?",
    explanation: "HP가 0이 되면 드래곤이 기절해서 더 이상 싸울 수 없어요!",
    points: 12,
    dragonEmoji: "💫",
  },
];

// ============================================
// 효과음
// ============================================
const playSound = (type: "correct" | "wrong" | "complete" | "streak") => {
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
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.4);
        osc.start(audioContext.currentTime + i * 0.15);
        osc.stop(audioContext.currentTime + i * 0.15 + 0.4);
      });
    }
  } catch (e) {
    // Audio not supported
  }
};

// ============================================
// 애니메이션
// ============================================
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
};

// ============================================
// 메인 컴포넌트
// ============================================
export default function DragonVillageQuiz() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  // 게임 상태
  const [gameState, setGameState] = useState<GameState>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // 점수
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100 : 0;

  // 게임 시작
  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);

    // 난이도별 문제 필터링 및 섞기
    let filtered = dragonQuizData.filter(q => q.difficulty === diff);
    if (diff === "medium") {
      filtered = dragonQuizData.filter(q => q.difficulty === "easy" || q.difficulty === "medium");
    } else if (diff === "hard") {
      filtered = [...dragonQuizData];
    }

    const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 10);

    setQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(3);
    setGameState("playing");
  };

  // 정답 확인
  const checkAnswer = (answer: string): boolean => {
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrect = currentQuestion.correctAnswer.toLowerCase();

    if (normalizedAnswer === normalizedCorrect) return true;

    // 허용 답변 체크
    if (currentQuestion.acceptableAnswers) {
      return currentQuestion.acceptableAnswers.some(
        a => a.toLowerCase() === normalizedAnswer
      );
    }

    return false;
  };

  // 객관식 답 선택
  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    setUserAnswer(answer);
    submitAnswer(answer);
  };

  // 주관식 제출
  const handleSubmitTyping = () => {
    if (isAnswered || !userAnswer.trim()) return;
    submitAnswer(userAnswer);
  };

  // 답변 제출
  const submitAnswer = (answer: string) => {
    setIsAnswered(true);
    const correct = checkAnswer(answer);
    setIsCorrect(correct);

    if (correct) {
      const basePoints = currentQuestion.points;
      const streakBonus = Math.min(streak * 2, 10);
      const hintPenalty = showHint ? Math.floor(basePoints * 0.3) : 0;
      const totalPoints = Math.max(basePoints + streakBonus - hintPenalty, 1);

      setScore(prev => prev + totalPoints);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, streak + 1));

      if (streak >= 2) {
        playSound("streak");
        confetti({
          particleCount: 30 + streak * 5,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#9B59B6"],
        });
        toast.success(`🔥 ${streak + 1}연속 정답! +${totalPoints}점`);
      } else {
        playSound("correct");
        toast.success(`정답! +${totalPoints}점`);
      }
    } else {
      playSound("wrong");
      setStreak(0);
      setLives(prev => prev - 1);
      toast.error(`틀렸어요! 정답: ${currentQuestion.correctAnswer}`);
    }
  };

  // 다음 문제
  const handleNext = async () => {
    if (lives <= 0 && !isCorrect) {
      endGame();
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      endGame();
    }
  };

  // 게임 종료
  const endGame = async () => {
    setGameState("result");
    playSound("complete");

    if (correctCount >= totalQuestions * 0.8) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#9B59B6", "#3498DB", "#E74C3C", "#2ECC71", "#F39C12"],
      });
    }

    // 포인트 지급
    await awardPoints();
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
        note = "드래곤 빌리지 퀴즈 만점! 🐉🏆";
      } else if (scorePercent >= 90) {
        points = 2500;
        note = "드래곤 빌리지 마스터! 🐉⭐";
      } else if (scorePercent >= 80) {
        points = 2000;
        note = "드래곤 빌리지 고수! 🐉💪";
      } else if (scorePercent >= 70) {
        points = 1500;
        note = "드래곤 빌리지 도전자! 🐉";
      } else if (scorePercent >= 50) {
        points = 1000;
        note = "드래곤 빌리지 학습중!";
      } else if (correctCount > 0) {
        points = 500;
        note = "드래곤 빌리지 도전!";
      }

      if (maxStreak >= 5) {
        points += 300;
        note += ` (${maxStreak}연속 보너스!)`;
      }

      if (points > 0) {
        const newBalance = currentBalance + points;

        await supabase.from("point_transactions").insert({
          juwoo_id: 1,
          rule_id: null,
          amount: points,
          balance_after: newBalance,
          note: note,
          created_by: 1,
        });

        await supabase
          .from("juwoo_profile")
          .update({ current_points: newBalance })
          .eq("id", 1);

        toast.success(`🎉 ${points.toLocaleString()} 포인트 획득!`);
      }
    } catch (error) {
      console.error("포인트 적립 오류:", error);
    }
  };

  // ============================================
  // 로그인 체크
  // ============================================
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full border-4 border-purple-400 shadow-2xl">
            <CardContent className="p-8 text-center">
              <motion.div
                className="text-7xl mb-6"
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🐉
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
              <p className="text-muted-foreground mb-6">드래곤 빌리지 퀴즈를 풀려면 로그인해주세요!</p>
              <a href={getLoginUrl()}>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg py-6">
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
  // 메인 메뉴
  // ============================================
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
        <div className="container max-w-4xl py-8 px-4">
          <motion.div
            className="mb-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/50">
                <ArrowLeft className="h-4 w-4" />
                돌아가기
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-4 border-purple-400 shadow-2xl bg-white/90 backdrop-blur">
              <CardContent className="p-6 md:p-8">
                {/* 헤더 */}
                <div className="text-center mb-8">
                  <motion.div
                    className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <span className="text-5xl">🐉</span>
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    드래곤 빌리지 퀴즈
                  </h1>
                  <p className="text-muted-foreground">
                    드래곤 빌리지 마스터가 되어보세요!
                  </p>
                </div>

                {/* 난이도 선택 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 text-center">🎯 난이도 선택</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startGame("easy")}
                      className="p-6 rounded-xl border-4 border-green-400 bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-lg transition-all"
                    >
                      <div className="text-4xl mb-2">🌱</div>
                      <div className="font-bold text-xl text-green-700">쉬움</div>
                      <p className="text-sm text-green-600 mt-1">드래곤 입문자</p>
                      <div className="mt-2 flex justify-center gap-1">
                        <Star className="h-4 w-4 fill-green-400 text-green-400" />
                        <Star className="h-4 w-4 text-gray-300" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startGame("medium")}
                      className="p-6 rounded-xl border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-100 hover:shadow-lg transition-all"
                    >
                      <div className="text-4xl mb-2">🔥</div>
                      <div className="font-bold text-xl text-yellow-700">보통</div>
                      <p className="text-sm text-yellow-600 mt-1">드래곤 조련사</p>
                      <div className="mt-2 flex justify-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startGame("hard")}
                      className="p-6 rounded-xl border-4 border-red-400 bg-gradient-to-br from-red-50 to-pink-100 hover:shadow-lg transition-all"
                    >
                      <div className="text-4xl mb-2">👑</div>
                      <div className="font-bold text-xl text-red-700">어려움</div>
                      <p className="text-sm text-red-600 mt-1">드래곤 마스터</p>
                      <div className="mt-2 flex justify-center gap-1">
                        <Star className="h-4 w-4 fill-red-400 text-red-400" />
                        <Star className="h-4 w-4 fill-red-400 text-red-400" />
                        <Star className="h-4 w-4 fill-red-400 text-red-400" />
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* 게임 규칙 */}
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    게임 규칙
                  </h3>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• 총 10문제가 출제됩니다</li>
                    <li>• ❤️ 목숨 3개! 틀리면 1개 감소</li>
                    <li>• 🔥 연속 정답 보너스 점수!</li>
                    <li>• 💡 힌트를 사용하면 점수가 30% 감소해요</li>
                    <li>• 🏆 높은 점수로 포인트를 얻으세요!</li>
                  </ul>
                </div>

                {/* 속성 상성표 */}
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border-2 border-orange-200">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Swords className="h-5 w-5 text-orange-600" />
                    속성 상성 힌트
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">🔥 불 → 🌿 풀</div>
                    <div className="flex items-center gap-1">💧 물 → 🔥 불</div>
                    <div className="flex items-center gap-1">🌿 풀 → 💧 물</div>
                    <div className="flex items-center gap-1">⚡ 전기 → 💧 물</div>
                    <div className="flex items-center gap-1">🏔️ 땅 → ⚡ 전기</div>
                    <div className="flex items-center gap-1">🌪️ 바람 → 🏔️ 땅</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // 결과 화면
  // ============================================
  if (gameState === "result") {
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const stars = scorePercent >= 90 ? 3 : scorePercent >= 70 ? 2 : scorePercent >= 40 ? 1 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
        <div className="container max-w-4xl py-8 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-4 border-yellow-400 shadow-2xl bg-white/95 backdrop-blur">
              <CardContent className="p-6 md:p-8 text-center">
                {/* 트로피 */}
                <motion.div
                  className="mb-6"
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <motion.div
                    className="inline-block p-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Trophy className="h-16 w-16 text-white" />
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2">
                    퀴즈 완료! 🐉
                  </h1>
                </motion.div>

                {/* 별점 */}
                <div className="flex justify-center gap-3 mb-6">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.2, type: "spring" }}
                    >
                      <Star
                        className={`h-14 w-14 ${
                          i <= stars
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* 점수 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-purple-100 rounded-xl"
                  >
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-2xl font-bold text-purple-600">{score}</div>
                    <div className="text-sm text-purple-700">총 점수</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-green-100 rounded-xl"
                  >
                    <div className="text-2xl mb-1">✅</div>
                    <div className="text-2xl font-bold text-green-600">{correctCount}/{totalQuestions}</div>
                    <div className="text-sm text-green-700">정답</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-orange-100 rounded-xl"
                  >
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-2xl font-bold text-orange-600">{maxStreak}</div>
                    <div className="text-sm text-orange-700">최대 연속</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-pink-100 rounded-xl"
                  >
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-2xl font-bold text-pink-600">{scorePercent}%</div>
                    <div className="text-sm text-pink-700">정답률</div>
                  </motion.div>
                </div>

                {/* 메시지 */}
                <motion.div
                  className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-lg font-medium">
                    {scorePercent === 100 && "완벽해요! 드래곤 마스터! 🐉👑"}
                    {scorePercent >= 90 && scorePercent < 100 && "대단해요! 드래곤 조련사! 🐉⭐"}
                    {scorePercent >= 70 && scorePercent < 90 && "잘했어요! 드래곤 트레이너! 🐉💪"}
                    {scorePercent >= 50 && scorePercent < 70 && "좋아요! 계속 연습해요! 🐉📚"}
                    {scorePercent < 50 && "괜찮아요! 다시 도전해봐요! 🐉🌟"}
                  </p>
                </motion.div>

                {/* 버튼 */}
                <div className="flex gap-4 justify-center flex-wrap">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      onClick={() => setGameState("menu")}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      다시 하기
                    </Button>
                  </motion.div>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="font-bold">
                      대시보드
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
  // 퀴즈 진행 화면
  // ============================================
  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">로딩중...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      <div className="container max-w-4xl py-6 px-4">
        {/* 헤더 */}
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Button variant="ghost" size="sm" onClick={() => setGameState("menu")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            나가기
          </Button>

          <div className="flex items-center gap-2">
            {/* 목숨 */}
            <div className="flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`h-5 w-5 ${
                    i < lives ? "fill-red-500 text-red-500" : "fill-gray-300 text-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* 스트릭 */}
            <AnimatePresence>
              {streak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-full"
                >
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="font-bold text-orange-600">{streak}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 진행률 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                currentQuestion.difficulty === "easy" ? "bg-green-100 text-green-700" :
                currentQuestion.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {currentQuestion.difficulty === "easy" ? "쉬움" :
                 currentQuestion.difficulty === "medium" ? "보통" : "어려움"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {currentQuestion.category}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{currentIndex + 1} / {totalQuestions}</span>
              <span className="font-bold text-purple-600">⭐ {score}점</span>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* 문제 카드 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="mb-6 border-4 border-purple-400 shadow-xl bg-white/95 backdrop-blur">
              <CardContent className="p-6 md:p-8">
                {/* 드래곤 이모지 */}
                <div className="text-center mb-4">
                  <motion.span
                    className="text-5xl inline-block"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    {currentQuestion.dragonEmoji || "🐉"}
                  </motion.span>
                </div>

                {/* 문제 */}
                <div className="text-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                    {currentQuestion.question}
                  </h2>

                  {/* 힌트 버튼 */}
                  {!showHint && !isAnswered && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHint(true)}
                      className="text-yellow-600 border-yellow-400"
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      힌트 보기 (-30%)
                    </Button>
                  )}

                  {/* 힌트 표시 */}
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <p className="text-yellow-700">💡 {currentQuestion.hint}</p>
                    </motion.div>
                  )}
                </div>

                {/* 답변 영역 - 객관식 */}
                {(currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false") &&
                  currentQuestion.options && (
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = userAnswer === option;
                      const isCorrectOption = option === currentQuestion.correctAnswer;
                      const showResult = isAnswered;

                      return (
                        <motion.div
                          key={index}
                          variants={buttonVariants}
                          whileHover={!isAnswered ? "hover" : undefined}
                          whileTap={!isAnswered ? "tap" : undefined}
                        >
                          <Button
                            variant="outline"
                            className={`w-full h-16 text-lg font-bold transition-all rounded-xl ${
                              showResult
                                ? isCorrectOption
                                  ? "bg-green-500 hover:bg-green-600 text-white border-4 border-green-600"
                                  : isSelected && !isCorrectOption
                                  ? "bg-red-500 hover:bg-red-600 text-white border-4 border-red-600"
                                  : "opacity-50 border-2"
                                : "hover:bg-purple-100 border-2 border-purple-300 hover:border-purple-500"
                            }`}
                            onClick={() => handleSelectAnswer(option)}
                            disabled={isAnswered}
                          >
                            {showResult && isCorrectOption && <CheckCircle className="h-5 w-5 mr-2" />}
                            {showResult && isSelected && !isCorrectOption && <XCircle className="h-5 w-5 mr-2" />}
                            {option}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* 답변 영역 - 주관식 */}
                {(currentQuestion.type === "short-answer" || currentQuestion.type === "fill-blank") && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="정답을 입력하세요..."
                        value={userAnswer}
                        onChange={e => setUserAnswer(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSubmitTyping()}
                        disabled={isAnswered}
                        autoFocus
                        className="text-xl text-center h-14 border-2 border-purple-300 focus:border-purple-500"
                      />
                      <Button
                        onClick={handleSubmitTyping}
                        disabled={isAnswered || !userAnswer.trim()}
                        className="h-14 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                      >
                        확인
                      </Button>
                    </div>

                    {isAnswered && (
                      <motion.div
                        className={`p-4 rounded-xl ${isCorrect ? "bg-green-100" : "bg-red-100"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                          <span className={`font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                            {isCorrect ? "정답!" : `오답! 정답: ${currentQuestion.correctAnswer}`}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* 정답 해설 */}
                {isAnswered && (
                  <motion.div
                    className="mt-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-bold text-purple-700">해설</p>
                        <p className="text-sm text-gray-600 mt-1">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* 다음 버튼 */}
        {isAnswered && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl px-12 py-6"
              >
                {lives <= 0 && !isCorrect
                  ? "결과 보기 🎯"
                  : currentIndex < totalQuestions - 1
                  ? "다음 문제 ➡️"
                  : "결과 보기 🎉"}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* 하단 상태 바 */}
        <motion.div
          className="mt-6 flex justify-center gap-4 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-bold">정답: {correctCount}개</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <Award className="h-5 w-5 text-purple-500" />
            <span className="font-bold">점수: {score}점</span>
          </div>
          {maxStreak > 0 && (
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold">최대 연속: {maxStreak}</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
