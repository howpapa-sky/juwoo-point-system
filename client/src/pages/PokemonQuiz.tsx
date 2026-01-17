import { useState, useEffect, useRef } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Star,
  Trophy,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Zap,
  BookOpen,
  Brain,
  Target,
  CheckCircle,
  XCircle,
  Lightbulb,
  Award,
  Timer,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabaseClient";

// 문제 타입 정의
type QuestionType = "multiple-choice" | "short-answer" | "fill-blank" | "true-false";
type Difficulty = "easy" | "medium" | "hard";

interface QuizQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  question: string;
  image?: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  options?: string[];
  hint: string;
  explanation: string;
  points: number;
}

// e북 공략집 기반 퀴즈 데이터
const allQuizData: QuizQuestion[] = [
  // ===== 쉬운 문제 (Easy) =====
  {
    id: "e1",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본 용어",
    question: "포켓몬의 전투력을 나타내는 숫자의 이름은 무엇일까요?",
    correctAnswer: "CP",
    options: ["CP", "HP", "XP", "MP"],
    hint: "Combat Power의 약자예요!",
    explanation: "CP는 Combat Power(전투력)의 약자로, 포켓몬이 얼마나 강한지를 나타내는 숫자예요.",
    points: 5,
  },
  {
    id: "e2",
    type: "multiple-choice",
    difficulty: "easy",
    category: "아이템",
    question: "포켓스탑을 돌리면 무엇을 얻을 수 있나요?",
    correctAnswer: "몬스터볼",
    options: ["몬스터볼", "포켓코인", "경험치만", "사탕만"],
    hint: "파란색 네모를 돌리면 여러 가지가 나와요!",
    explanation: "포켓스탑을 돌리면 몬스터볼, 알, 상처약 같은 아이템을 얻을 수 있어요!",
    points: 5,
  },
  {
    id: "e3",
    type: "true-false",
    difficulty: "easy",
    category: "기본 용어",
    question: "HP는 포켓몬의 체력을 나타낸다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "Health Points의 약자예요!",
    explanation: "HP는 Health Points(체력)의 약자로, 배틀에서 0이 되면 포켓몬이 기절해요.",
    points: 5,
  },
  {
    id: "e4",
    type: "multiple-choice",
    difficulty: "easy",
    category: "열매",
    question: "포켓몬을 잡으면 사탕을 2배로 주는 열매는?",
    correctAnswer: "파인열매",
    options: ["파인열매", "라즈열매", "나나열매", "금색열매"],
    hint: "모양의 열매예요!",
    explanation: "파인열매를 주고 포켓몬을 잡으면 사탕을 2배로 받을 수 있어요. 진화시킬 때 아주 좋아요!",
    points: 5,
  },
  {
    id: "e5",
    type: "short-answer",
    difficulty: "easy",
    category: "기본 용어",
    question: "포켓몬을 잡을 때 쓰는 동그란 공의 이름은?",
    correctAnswer: "몬스터볼",
    acceptableAnswers: ["몬스터볼", "몬스터 볼", "몬스타볼", "포켓볼", "볼"],
    hint: "던져서 포켓몬을 잡아요!",
    explanation: "몬스터볼을 던져서 포켓몬을 잡을 수 있어요. 포켓스탑에서 많이 얻을 수 있답니다!",
    points: 8,
  },
  {
    id: "e6",
    type: "multiple-choice",
    difficulty: "easy",
    category: "체육관",
    question: "체육관에 포켓몬을 올려두면 받을 수 있는 것은?",
    correctAnswer: "포켓코인",
    options: ["포켓코인", "사탕", "별의모래", "알"],
    hint: "이 용돈으로 멋진 아이템을 살 수 있어요!",
    explanation: "체육관에 포켓몬을 지키게 하면 하루 최대 50 포켓코인을 받을 수 있어요!",
    points: 5,
  },

  // ===== 보통 문제 (Medium) =====
  {
    id: "m1",
    type: "short-answer",
    difficulty: "medium",
    category: "경험치",
    question: "포켓몬을 잡을 때 'Excellent!'를 띄우면 얻는 경험치는 몇 XP일까요? (숫자만)",
    correctAnswer: "1000",
    acceptableAnswers: ["1000", "1,000", "1000xp", "1000 xp", "천"],
    hint: "가장 작은 원에 정확히 맞추면 받을 수 있어요!",
    explanation: "Excellent 던지기를 하면 무려 1,000 XP를 얻을 수 있어요! 꼭 연습해보세요.",
    points: 10,
  },
  {
    id: "m2",
    type: "fill-blank",
    difficulty: "medium",
    category: "경험치",
    question: "베스트 프렌드가 되면 _____XP를 한 번에 얻을 수 있다. (숫자만)",
    correctAnswer: "100000",
    acceptableAnswers: ["100000", "100,000", "10만", "십만"],
    hint: "친구와 최고 단계까지 우정을 쌓으면 받는 경험치예요!",
    explanation: "친구와 베스트 프렌드가 되면 무려 100,000 XP를 한 번에 얻을 수 있어요!",
    points: 10,
  },
  {
    id: "m3",
    type: "multiple-choice",
    difficulty: "medium",
    category: "아이템",
    question: "행복의알을 사용하면 몇 분 동안 경험치가 2배가 될까요?",
    correctAnswer: "30분",
    options: ["30분", "15분", "1시간", "10분"],
    hint: "아주 소중하게 써야 해요!",
    explanation: "행복의알을 사용하면 30분 동안 모든 경험치가 2배가 돼요!",
    points: 8,
  },
  {
    id: "m4",
    type: "short-answer",
    difficulty: "medium",
    category: "레이드",
    question: "5성 레이드에서 이기면 얻는 경험치는 최대 몇 XP? (숫자만)",
    correctAnswer: "10000",
    acceptableAnswers: ["10000", "10,000", "1만", "만"],
    hint: "다섯 별짜리 강한 보스를 이기면 받는 보상이에요!",
    explanation: "5성 레이드에서 이기면 최대 10,000 XP를 얻을 수 있어요!",
    points: 10,
  },
  {
    id: "m5",
    type: "multiple-choice",
    difficulty: "medium",
    category: "포켓몬",
    question: "메가 진화가 가능한 포켓몬이 아닌 것은?",
    correctAnswer: "피카츄",
    options: ["피카츄", "이상해꽃", "리자몽", "거북왕"],
    hint: "1세대 스타터 포켓몬들은 메가 진화가 가능해요!",
    explanation: "이상해꽃, 리자몽, 거북왕은 메가 진화가 가능하지만 피카츄는 메가 진화가 없어요.",
    points: 8,
  },
  {
    id: "m6",
    type: "true-false",
    difficulty: "medium",
    category: "개체값",
    question: "포켓몬 평가에서 별 3개짜리가 좋은 포켓몬이다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "개체값(IV)이 높을수록 별이 많아요!",
    explanation: "별 3개짜리 포켓몬은 개체값(IV)이 높아서 강한 포켓몬이에요!",
    points: 8,
  },
  {
    id: "m7",
    type: "short-answer",
    difficulty: "medium",
    category: "포켓몬",
    question: "포켓몬 강화에 필요한 모래 이름은?",
    correctAnswer: "별의모래",
    acceptableAnswers: ["별의모래", "별의 모래", "스타더스트", "모래", "별모래"],
    hint: "포켓몬을 잡거나 알을 부화시키면 얻을 수 있어요!",
    explanation: "별의모래는 포켓몬을 강화할 때 꼭 필요해요. 아껴 쓰는 게 중요합니다!",
    points: 10,
  },
  {
    id: "m8",
    type: "multiple-choice",
    difficulty: "medium",
    category: "일일 미션",
    question: "첫 포켓몬을 잡으면 받는 보너스 경험치는?",
    correctAnswer: "1,500 XP",
    options: ["1,500 XP", "500 XP", "1,000 XP", "2,000 XP"],
    hint: "매일 첫 번째 포켓몬을 잡으면 받는 보너스예요!",
    explanation: "매일 첫 포켓몬을 잡으면 1,500 XP를 받을 수 있어요!",
    points: 8,
  },
  {
    id: "m9",
    type: "fill-blank",
    difficulty: "medium",
    category: "체육관",
    question: "체육관에서 하루에 받을 수 있는 최대 포켓코인은 ___개다.",
    correctAnswer: "50",
    acceptableAnswers: ["50", "50개", "오십"],
    hint: "포켓몬을 오래 지키게 하면 받을 수 있어요!",
    explanation: "체육관에 포켓몬을 올려두면 하루 최대 50 포켓코인을 받을 수 있어요!",
    points: 10,
  },

  // ===== 어려운 문제 (Hard) =====
  {
    id: "h1",
    type: "short-answer",
    difficulty: "hard",
    category: "경험치",
    question: "구구, 뿔충이, 캐터피의 공통점은? 진화에 필요한 사탕이 적어서 뭐에 좋을까요?",
    correctAnswer: "경험치",
    acceptableAnswers: ["경험치", "xp", "XP", "레벨업", "경험치 노가다", "행복의알 진화"],
    hint: "행복의알을 켜고 한꺼번에 진화시키면 좋아요!",
    explanation: "사탕이 적게 드는 포켓몬을 모았다가 행복의알을 켜고 진화시키면 경험치를 많이 얻을 수 있어요!",
    points: 15,
  },
  {
    id: "h2",
    type: "short-answer",
    difficulty: "hard",
    category: "GO로켓단",
    question: "GO로켓단을 이기고 구한 포켓몬의 이름은? (______ 포켓몬)",
    correctAnswer: "그림자",
    acceptableAnswers: ["그림자", "그림자 포켓몬", "섀도우", "shadow"],
    hint: "검은 포켓스탑에서 만날 수 있어요!",
    explanation: "GO로켓단을 이기면 아파하는 그림자 포켓몬을 구할 수 있어요. 정화하면 더 강해진답니다!",
    points: 15,
  },
  {
    id: "h3",
    type: "multiple-choice",
    difficulty: "hard",
    category: "타입 상성",
    question: "불 타입 포켓몬이 약한 타입이 아닌 것은?",
    correctAnswer: "풀",
    options: ["풀", "물", "바위", "땅"],
    hint: "가위바위보처럼 서로 약점이 있어요!",
    explanation: "불 타입은 물, 바위, 땅 타입에 약하지만, 풀 타입에게는 오히려 강해요!",
    points: 12,
  },
  {
    id: "h4",
    type: "fill-blank",
    difficulty: "hard",
    category: "레벨업",
    question: "레벨 40이 넘으면 경험치만으로 레벨업이 안 되고 특별한 _____을(를) 깨야 한다.",
    correctAnswer: "미션",
    acceptableAnswers: ["미션", "퀘스트", "과제", "리서치", "태스크"],
    hint: "플래티넘 메달 모으기나 친구와 함께하는 것들이 있어요!",
    explanation: "레벨 40 이후에는 특별 미션을 완료해야 레벨업할 수 있어요!",
    points: 15,
  },
  {
    id: "h5",
    type: "short-answer",
    difficulty: "hard",
    category: "커뮤니티",
    question: "한 달에 한 번, 특정 포켓몬이 많이 나타나고 색다른 포켓몬을 만날 수 있는 날의 이름은?",
    correctAnswer: "커뮤니티 데이",
    acceptableAnswers: ["커뮤니티 데이", "커뮤니티데이", "커뮤데이", "커뮤니티 day", "community day"],
    hint: "색이 다른(이로치) 포켓몬을 만날 절호의 기회!",
    explanation: "커뮤니티 데이에는 특정 포켓몬이 많이 나타나고 이로치 포켓몬을 만날 확률이 높아요!",
    points: 15,
  },
  {
    id: "h6",
    type: "multiple-choice",
    difficulty: "hard",
    category: "메달",
    question: "레벨업 미션에서 모아야 하는 최고 등급의 메달은?",
    correctAnswer: "플래티넘",
    options: ["플래티넘", "골드", "실버", "브론즈"],
    hint: "가장 높은 등급의 반짝이는 메달이에요!",
    explanation: "플래티넘 메달은 특정 활동을 아주 많이 해야 얻을 수 있는 최고 등급 메달이에요!",
    points: 12,
  },
  {
    id: "h7",
    type: "short-answer",
    difficulty: "hard",
    category: "진화",
    question: "포켓몬 중에서 특별한 진화 아이템이 필요한 경우가 있어요. 이상한 사탕 외에 뭐가 필요할까요?",
    correctAnswer: "진화 아이템",
    acceptableAnswers: ["진화 아이템", "진화아이템", "아이템", "특별아이템", "진화석", "돌"],
    hint: "어떤 포켓몬은 사탕만으로 진화가 안 돼요!",
    explanation: "어떤 포켓몬은 업그레이드, 금속코트 같은 특별한 진화 아이템이 필요해요!",
    points: 15,
  },
  {
    id: "h8",
    type: "fill-blank",
    difficulty: "hard",
    category: "포켓몬",
    question: "전설의 포켓몬이나 환상의 포켓몬을 강화할 때 사용하면 좋은 것은 '이상한 _____'이다.",
    correctAnswer: "사탕",
    acceptableAnswers: ["사탕", "캔디"],
    hint: "어떤 포켓몬의 사탕으로도 변환할 수 있어요!",
    explanation: "이상한 사탕은 어떤 포켓몬의 사탕으로도 바꿀 수 있어서 전설/환상 포켓몬 강화에 좋아요!",
    points: 12,
  },
  {
    id: "h9",
    type: "short-answer",
    difficulty: "hard",
    category: "열매",
    question: "포켓몬이 몬스터볼에서 도망가지 않게 도와주는 빨간색 열매의 이름은?",
    correctAnswer: "라즈열매",
    acceptableAnswers: ["라즈열매", "라즈 열매", "라즈베리", "빨간열매"],
    hint: "모양의 열매예요!",
    explanation: "라즈열매를 주면 포켓몬이 몬스터볼에서 도망갈 확률이 줄어들어요!",
    points: 12,
  },
  {
    id: "h10",
    type: "multiple-choice",
    difficulty: "hard",
    category: "파트너",
    question: "파트너 포켓몬과 함께 할 수 있는 활동이 아닌 것은?",
    correctAnswer: "체육관 자동 배치",
    options: ["체육관 자동 배치", "함께 걷기", "사탕 얻기", "CP 올리기"],
    hint: "파트너와 함께 걸으면 좋은 것들이 많아요!",
    explanation: "파트너 포켓몬과 함께 걸으면 사탕을 얻고 친밀도가 올라 CP도 올릴 수 있어요!",
    points: 12,
  },

  // ===== 포켓몬 이미지 문제들 =====
  {
    id: "img1",
    type: "multiple-choice",
    difficulty: "easy",
    category: "포켓몬",
    question: "피카츄의 타입은 무엇일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    correctAnswer: "전기",
    options: ["전기", "불꽃", "물", "풀"],
    hint: "번개를 쏘는 포켓몬이에요!",
    explanation: "피카츄는 전기 타입 포켓몬으로 번개 공격을 해요!",
    points: 5,
  },
  {
    id: "img2",
    type: "short-answer",
    difficulty: "medium",
    category: "포켓몬",
    question: "이 포켓몬의 이름을 맞춰보세요!",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    correctAnswer: "리자몽",
    acceptableAnswers: ["리자몽", "charizard", "Charizard"],
    hint: "불꽃과 비행 타입이에요!",
    explanation: "리자몽은 파이리의 최종 진화형으로 불꽃/비행 타입이에요!",
    points: 10,
  },
  {
    id: "img3",
    type: "short-answer",
    difficulty: "medium",
    category: "포켓몬",
    question: "이 환상의 포켓몬 이름은?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png",
    correctAnswer: "뮤",
    acceptableAnswers: ["뮤", "mew", "Mew"],
    hint: "분홍색의 귀여운 환상의 포켓몬이에요!",
    explanation: "뮤는 모든 포켓몬의 유전자를 가지고 있다는 환상의 포켓몬이에요!",
    points: 10,
  },
  {
    id: "img4",
    type: "multiple-choice",
    difficulty: "hard",
    category: "포켓몬",
    question: "잉어킹이 진화하면 어떤 포켓몬이 될까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png",
    correctAnswer: "갸라도스",
    options: ["갸라도스", "라프라스", "밀로틱", "샤미드"],
    hint: "400개의 사탕이 필요한 진화예요!",
    explanation: "약해 보이는 잉어킹이 400개의 사탕으로 강력한 갸라도스로 진화해요!",
    points: 12,
  },
];

// 정답 검증 함수
const checkAnswer = (userAnswer: string, question: QuizQuestion): boolean => {
  const normalizedUser = userAnswer.trim().toLowerCase().replace(/\s+/g, "");
  const normalizedCorrect = question.correctAnswer.toLowerCase().replace(/\s+/g, "");

  if (normalizedUser === normalizedCorrect) return true;

  if (question.acceptableAnswers) {
    return question.acceptableAnswers.some(
      ans => normalizedUser === ans.toLowerCase().replace(/\s+/g, "")
    );
  }

  return false;
};

// 난이도별 문제 선택
const selectQuestions = (difficulty: Difficulty | "all", count: number): QuizQuestion[] => {
  let filtered = [...allQuizData];

  if (difficulty !== "all") {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export default function PokemonQuiz() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [gameState, setGameState] = useState<"menu" | "playing" | "result">("menu");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameTicket, setGameTicket] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [useTimer, setUseTimer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalQuestions = 10;
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100;
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

  useEffect(() => {
    if (!useTimer || gameState !== "playing" || isAnswered) return;

    if (timeLeft === 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, useTimer, gameState, isAnswered]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    toast.error("시간 초과!");
  };

  const startGame = () => {
    const selected = selectQuestions(difficulty, totalQuestions);
    setQuestions(selected);
    setCurrentIndex(0);
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setTotalScore(0);
    setCorrectCount(0);
    setShowHint(false);
    setGameTicket(0);
    setTimeLeft(30);
    setGameState("playing");
  };

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    setUserAnswer(answer);
    submitAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (isAnswered || !userAnswer.trim()) return;
    submitAnswer(userAnswer);
  };

  const submitAnswer = (answer: string) => {
    setIsAnswered(true);
    const correct = checkAnswer(answer, currentQuestion);
    setIsCorrect(correct);

    if (correct) {
      setTotalScore(prev => prev + currentQuestion.points);
      setCorrectCount(prev => prev + 1);
      toast.success(`정답! +${currentQuestion.points}점`);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4"],
      });
    } else {
      toast.error(`오답! 정답: ${currentQuestion.correctAnswer}`);
    }
  };

  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
      setTimeLeft(30);

      setTimeout(() => {
        if (questions[currentIndex + 1]?.type === "short-answer" ||
            questions[currentIndex + 1]?.type === "fill-blank") {
          inputRef.current?.focus();
        }
      }, 100);
    } else {
      setGameState("result");
      await awardPointsAndTicket();

      if (correctCount === totalQuestions) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
        });
      }
    }
  };

  const awardPointsAndTicket = async () => {
    try {
      const { data: profile } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();

      const currentBalance = profile?.current_points || 0;
      const scorePercent = Math.round((totalScore / maxScore) * 100);
      let points = 0;
      let ticketMinutes = 0;
      let note = "";

      if (scorePercent >= 90) {
        points = 2500;
        ticketMinutes = 60;
        note = "포켓몬 퀴즈 마스터!";
      } else if (scorePercent >= 75) {
        points = 2000;
        ticketMinutes = 45;
        note = "포켓몬 퀴즈 고수!";
      } else if (scorePercent >= 60) {
        points = 1500;
        ticketMinutes = 30;
        note = "포켓몬 퀴즈 도전자!";
      } else if (scorePercent >= 40) {
        points = 1000;
        ticketMinutes = 20;
        note = "포켓몬 퀴즈 학습중!";
      } else if (scorePercent >= 20) {
        points = 500;
        ticketMinutes = 10;
        note = "포켓몬 퀴즈 입문!";
      }

      setGameTicket(ticketMinutes);

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

        toast.success(`${points} 포인트 획득!`);
      }
    } catch (error) {
      console.error("포인트 적립 오류:", error);
    }
  };

  const getDifficultyConfig = (diff: Difficulty | "all") => {
    switch (diff) {
      case "easy": return { color: "from-emerald-500 to-green-500", shadow: "shadow-emerald-500/25", label: "쉬움", emoji: "" };
      case "medium": return { color: "from-amber-500 to-yellow-500", shadow: "shadow-amber-500/25", label: "보통", emoji: "" };
      case "hard": return { color: "from-rose-500 to-red-500", shadow: "shadow-rose-500/25", label: "어려움", emoji: "" };
      default: return { color: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/25", label: "전체", emoji: "" };
    }
  };

  // 로그인 체크
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl w-fit mb-4 shadow-lg shadow-amber-500/30">
              <Gamepad2 className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-black">로그인이 필요해요</CardTitle>
            <CardDescription className="text-base">퀴즈를 풀려면 로그인해주세요</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 메뉴 화면
  if (gameState === "menu") {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-16 w-48 h-48 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl" />
        </div>

        <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
          {/* 헤더 */}
          <div className="pt-2 text-center">
            <div className="inline-block p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl mb-4 shadow-lg shadow-amber-500/30">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-1">포켓몬GO 퀴즈</h1>
            <p className="text-slate-500">e북 공략집을 읽고 도전해보세요!</p>
          </div>

          {/* 난이도 선택 */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                난이도 선택
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "all", label: "전체", color: "from-violet-500 to-purple-500" },
                  { value: "easy", label: "쉬움", color: "from-emerald-500 to-green-500" },
                  { value: "medium", label: "보통", color: "from-amber-500 to-yellow-500" },
                  { value: "hard", label: "어려움", color: "from-rose-500 to-red-500" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value as Difficulty | "all")}
                    className={`p-3 rounded-xl transition-all ${
                      difficulty === opt.value
                        ? `bg-gradient-to-r ${opt.color} text-white shadow-lg scale-[1.02]`
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span className="font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 타이머 옵션 */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useTimer}
                  onChange={e => setUseTimer(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-500"
                />
                <Timer className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-slate-700">시간 제한 모드 (30초)</span>
              </label>
            </CardContent>
          </Card>

          {/* 퀴즈 안내 */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-xl flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-800 mb-2">퀴즈 안내</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• 총 10문제 (객관식, 주관식, O/X)</li>
                    <li>• 어려운 문제일수록 높은 점수</li>
                    <li>• 점수에 따라 게임 이용권 획득!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 시작 버튼 */}
          <Button
            size="lg"
            onClick={startGame}
            className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xl rounded-2xl shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all"
          >
            <Zap className="h-6 w-6 mr-2" />
            퀴즈 시작!
          </Button>

          {/* e북 링크 */}
          <Link href="/ebook-library">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl active:scale-[0.98] transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="font-medium text-slate-700">e북 공략집 읽기</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (gameState === "result") {
    const scorePercent = Math.round((totalScore / maxScore) * 100);
    const stars = scorePercent >= 90 ? 3 : scorePercent >= 60 ? 2 : scorePercent >= 30 ? 1 : 0;

    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-full blur-3xl" />
        </div>

        <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
          {/* 결과 헤더 */}
          <div className="pt-2 text-center">
            <div className="inline-block p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl mb-4 shadow-lg shadow-amber-500/30">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">퀴즈 완료!</h1>
          </div>

          {/* 별점 */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <Star
                key={i}
                className={`h-12 w-12 transition-all ${
                  i <= stars
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-200"
                }`}
              />
            ))}
          </div>

          {/* 점수 카드 */}
          <Card className="border-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/30 rounded-3xl">
            <CardContent className="p-6 text-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="relative">
                <p className="text-white/70 text-sm mb-1">총 점수</p>
                <p className="text-6xl font-black mb-2">{totalScore}</p>
                <p className="text-white/80">
                  최대 {maxScore}점 중 ({scorePercent}%)
                </p>
                <p className="text-white/70 text-sm mt-2">
                  {correctCount} / {totalQuestions} 문제 정답
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 게임 이용권 */}
          {gameTicket > 0 && (
            <Card className="border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Gamepad2 className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">게임 이용권 획득!</p>
                    <p className="text-white/90 text-3xl font-black">{gameTicket}분</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 메시지 */}
          <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg rounded-2xl">
            <CardContent className="p-4 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <p className="font-medium text-amber-800">
                {scorePercent >= 90 && "와! 포켓몬 퀴즈 마스터야!"}
                {scorePercent >= 75 && scorePercent < 90 && "대단해요! 진짜 고수네요!"}
                {scorePercent >= 60 && scorePercent < 75 && "잘했어요! 조금만 더 연습!"}
                {scorePercent >= 40 && scorePercent < 60 && "좋아요! e북을 더 읽어봐요!"}
                {scorePercent < 40 && "괜찮아요! 다시 도전해봐요!"}
              </p>
            </CardContent>
          </Card>

          {/* 버튼들 */}
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={() => setGameState("menu")}
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              다시 풀기
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/ebook-library">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold">
                  <BookOpen className="h-4 w-4 mr-2" />
                  공략집
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold">
                  홈으로
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 퀴즈 진행 화면
  const diffConfig = getDifficultyConfig(currentQuestion.difficulty);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* 상단 바 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setGameState("menu")}
            className="p-2 rounded-xl bg-white/80 shadow-md active:scale-95 transition-all"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${diffConfig.color}`}>
              {diffConfig.label}
            </span>
            {useTimer && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                timeLeft <= 10 ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
              }`}>
                {timeLeft}초
              </span>
            )}
          </div>
        </div>

        {/* 진행률 */}
        <div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-slate-600">{currentIndex + 1} / {totalQuestions}</span>
            <span className="font-bold text-amber-600">{totalScore}점</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-200" />
        </div>

        {/* 문제 카드 */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            {/* 이미지 */}
            {currentQuestion.image && (
              <div className="text-center mb-4">
                <div className="inline-block p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl">
                  <img
                    src={currentQuestion.image}
                    alt="문제 이미지"
                    className="h-28 w-28 object-contain"
                  />
                </div>
              </div>
            )}

            {/* 문제 유형 */}
            <div className="text-center mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                currentQuestion.type === "multiple-choice" ? "bg-blue-100 text-blue-700" :
                currentQuestion.type === "true-false" ? "bg-purple-100 text-purple-700" :
                "bg-emerald-100 text-emerald-700"
              }`}>
                {currentQuestion.type === "multiple-choice" && <><CheckCircle className="h-3 w-3" /> 객관식</>}
                {currentQuestion.type === "short-answer" && "주관식"}
                {currentQuestion.type === "fill-blank" && "빈칸 채우기"}
                {currentQuestion.type === "true-false" && "O/X 퀴즈"}
                <span className="ml-1 opacity-70">+{currentQuestion.points}점</span>
              </span>
            </div>

            {/* 질문 */}
            <h2 className="text-lg font-bold text-slate-800 text-center mb-4 leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* 힌트 */}
            {!isAnswered && (
              <div className="text-center mb-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-sm text-amber-600 font-medium flex items-center gap-1 mx-auto"
                >
                  <Lightbulb className="h-4 w-4" />
                  힌트 {showHint ? "숨기기" : "보기"}
                </button>
                {showHint && (
                  <p className="mt-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-xl">
                    {currentQuestion.hint}
                  </p>
                )}
              </div>
            )}

            {/* 객관식/O/X */}
            {(currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false") && (
              <div className={`grid gap-2 ${currentQuestion.type === "true-false" ? "grid-cols-2" : "grid-cols-1"}`}>
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = userAnswer === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  const showResult = isAnswered;

                  let btnClass = "p-4 rounded-xl font-bold transition-all text-left flex items-center justify-between";

                  if (showResult) {
                    if (isCorrectOption) {
                      btnClass += " bg-emerald-500 text-white";
                    } else if (isSelected && !isCorrectOption) {
                      btnClass += " bg-rose-500 text-white";
                    } else {
                      btnClass += " bg-slate-100 text-slate-400";
                    }
                  } else {
                    btnClass += " bg-slate-50 hover:bg-slate-100 text-slate-700 active:scale-[0.98]";
                  }

                  return (
                    <button
                      key={index}
                      className={btnClass}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={isAnswered}
                    >
                      <span>{option}</span>
                      {showResult && isCorrectOption && <CheckCircle className="h-5 w-5" />}
                      {showResult && isSelected && !isCorrectOption && <XCircle className="h-5 w-5" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 주관식 */}
            {(currentQuestion.type === "short-answer" || currentQuestion.type === "fill-blank") && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="정답 입력..."
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmitAnswer()}
                    disabled={isAnswered}
                    className="h-12 text-center text-lg font-medium rounded-xl border-2 border-slate-200 focus:border-amber-400"
                  />
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={isAnswered || !userAnswer.trim()}
                    className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold"
                  >
                    확인
                  </Button>
                </div>

                {isAnswered && (
                  <div className={`p-3 rounded-xl ${isCorrect ? "bg-emerald-50" : "bg-rose-50"}`}>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                      <span className={`font-bold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                        {isCorrect ? "정답!" : `오답! 정답: ${currentQuestion.correctAnswer}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 해설 */}
            {isAnswered && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 다음 버튼 */}
        {isAnswered && (
          <Button
            size="lg"
            onClick={handleNext}
            className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-lg"
          >
            {currentIndex < totalQuestions - 1 ? "다음 문제" : "결과 보기"}
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        )}

        {/* 현재 상태 */}
        <div className="flex justify-center gap-3">
          <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-md text-sm">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="font-bold">{correctCount}개 정답</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-md text-sm">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="font-bold">{totalScore}점</span>
          </div>
        </div>
      </div>
    </div>
  );
}
