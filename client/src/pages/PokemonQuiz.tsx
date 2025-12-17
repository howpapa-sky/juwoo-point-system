import { useState, useEffect, useRef } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowLeft,
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
  acceptableAnswers?: string[]; // 주관식에서 허용되는 답변들
  options?: string[]; // 객관식 선택지
  hint: string;
  explanation: string; // 정답 해설
  points: number; // 문제당 점수
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
    hint: "🍍 모양의 열매예요!",
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
    hint: "🍓 모양의 열매예요!",
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

// 정답 검증 함수 (유사 답변 허용)
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

  // 섞기
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

  // 타이머
  useEffect(() => {
    if (!useTimer || gameState !== "playing" || isAnswered) return;

    if (timeLeft === 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, useTimer, gameState, isAnswered]);

  // 시간 초과 처리
  const handleTimeout = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    toast.error("시간 초과! ⏰");
  };

  // 게임 시작
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

  // 답변 제출 (객관식)
  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    setUserAnswer(answer);
    submitAnswer(answer);
  };

  // 답변 제출 (주관식)
  const handleSubmitAnswer = () => {
    if (isAnswered || !userAnswer.trim()) return;
    submitAnswer(userAnswer);
  };

  // 답변 처리
  const submitAnswer = (answer: string) => {
    setIsAnswered(true);
    const correct = checkAnswer(answer, currentQuestion);
    setIsCorrect(correct);

    if (correct) {
      setTotalScore(prev => prev + currentQuestion.points);
      setCorrectCount(prev => prev + 1);
      toast.success(`정답이에요! +${currentQuestion.points}점 🎉`);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4"],
      });
    } else {
      toast.error(`아쉬워요! 정답은 "${currentQuestion.correctAnswer}"예요.`);
    }
  };

  // 다음 문제
  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
      setTimeLeft(30);

      // 주관식이면 자동 포커스
      setTimeout(() => {
        if (questions[currentIndex + 1]?.type === "short-answer" ||
            questions[currentIndex + 1]?.type === "fill-blank") {
          inputRef.current?.focus();
        }
      }, 100);
    } else {
      // 게임 종료
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

  // 포인트 및 게임 이용권 지급
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
        note = "🏆 포켓몬 퀴즈 마스터!";
      } else if (scorePercent >= 75) {
        points = 2000;
        ticketMinutes = 45;
        note = "⭐ 포켓몬 퀴즈 고수!";
      } else if (scorePercent >= 60) {
        points = 1500;
        ticketMinutes = 30;
        note = "👍 포켓몬 퀴즈 도전자!";
      } else if (scorePercent >= 40) {
        points = 1000;
        ticketMinutes = 20;
        note = "📚 포켓몬 퀴즈 학습중!";
      } else if (scorePercent >= 20) {
        points = 500;
        ticketMinutes = 10;
        note = "🌱 포켓몬 퀴즈 입문!";
      }

      setGameTicket(ticketMinutes);

      if (points > 0) {
        const newBalance = currentBalance + points;

        await supabase.from("point_transactions").insert({
          amount: points,
          user_id: user?.id,
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

  // 난이도 색상
  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case "easy": return "bg-green-100 text-green-700 border-green-300";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "hard": return "bg-red-100 text-red-700 border-red-300";
    }
  };

  const getDifficultyLabel = (diff: Difficulty) => {
    switch (diff) {
      case "easy": return "쉬움";
      case "medium": return "보통";
      case "hard": return "어려움";
    }
  };

  // 로그인 체크
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-red-100 to-blue-100">
        <Card className="max-w-md w-full border-4 border-yellow-400">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-4">퀴즈를 풀려면 로그인해주세요!</p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold">
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-red-100 to-blue-100">
        <div className="container max-w-4xl py-10 px-4">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                대시보드
              </Button>
            </Link>
          </div>

          <Card className="border-4 border-yellow-400 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full mb-4 animate-bounce">
                  <Brain className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2">포켓몬GO 퀴즈 마스터</h1>
                <p className="text-lg text-muted-foreground">
                  e북 공략집을 읽고 퀴즈에 도전해보세요!
                </p>
              </div>

              {/* 난이도 선택 */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  난이도 선택
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "all", label: "전체", color: "bg-purple-100 text-purple-700 border-purple-300", emoji: "🌈" },
                    { value: "easy", label: "쉬움", color: "bg-green-100 text-green-700 border-green-300", emoji: "🌱" },
                    { value: "medium", label: "보통", color: "bg-yellow-100 text-yellow-700 border-yellow-300", emoji: "⭐" },
                    { value: "hard", label: "어려움", color: "bg-red-100 text-red-700 border-red-300", emoji: "🔥" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDifficulty(opt.value as Difficulty | "all")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        difficulty === opt.value
                          ? `${opt.color} border-4 scale-105`
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <span className="text-3xl mb-2 block">{opt.emoji}</span>
                      <span className="font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 옵션 */}
              <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useTimer}
                    onChange={e => setUseTimer(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <Timer className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">시간 제한 모드 (문제당 30초)</span>
                </label>
              </div>

              {/* 안내 */}
              <div className="mb-8 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  퀴즈 안내
                </h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 총 10문제가 출제됩니다</li>
                  <li>• <strong>객관식</strong>, <strong>주관식</strong>, <strong>O/X</strong>, <strong>빈칸 채우기</strong> 문제가 있어요!</li>
                  <li>• 어려운 문제일수록 높은 점수를 얻어요</li>
                  <li>• 힌트를 사용하면 점수가 줄어들지 않아요</li>
                  <li>• 점수에 따라 게임 이용권을 받아요! 🎮</li>
                </ul>
              </div>

              {/* 시작 버튼 */}
              <Button
                size="lg"
                onClick={startGame}
                className="w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold text-xl py-6"
              >
                <Zap className="h-6 w-6 mr-2" />
                퀴즈 시작하기!
              </Button>

              {/* e북 링크 */}
              <div className="mt-6 text-center">
                <Link href="/ebook-library">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    e북 공략집 읽으러 가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (gameState === "result") {
    const scorePercent = Math.round((totalScore / maxScore) * 100);
    const stars = scorePercent >= 90 ? 3 : scorePercent >= 60 ? 2 : scorePercent >= 30 ? 1 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-red-100 to-blue-100">
        <div className="container max-w-4xl py-10 px-4">
          <Card className="border-4 border-yellow-400 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full mb-4 animate-pulse">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2">퀴즈 완료! 🎉</h1>
              </div>

              {/* 별점 */}
              <div className="flex justify-center gap-2 mb-6">
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

              {/* 점수 */}
              <div className="mb-8">
                <div className="text-7xl font-bold bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 bg-clip-text text-transparent mb-2">
                  {totalScore}점
                </div>
                <p className="text-muted-foreground text-lg">
                  최대 {maxScore}점 중 ({scorePercent}%)
                </p>
                <p className="text-muted-foreground">
                  {correctCount} / {totalQuestions} 문제 정답
                </p>
              </div>

              {/* 게임 이용권 */}
              {gameTicket > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border-4 border-green-400 animate-bounce">
                  <Gamepad2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-700 mb-2">
                    🎮 게임 이용권 획득!
                  </h2>
                  <p className="text-4xl font-bold text-green-600">{gameTicket}분</p>
                  <p className="text-sm text-green-600 mt-2">
                    포켓몬GO를 {gameTicket}분 동안 할 수 있어요!
                  </p>
                </div>
              )}

              {/* 메시지 */}
              <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl border-2 border-yellow-300">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-lg font-medium">
                  {scorePercent >= 90 && "와! 포켓몬 퀴즈 마스터야! 🏆"}
                  {scorePercent >= 75 && scorePercent < 90 && "대단해요! 진짜 포켓몬 고수네요! ⭐"}
                  {scorePercent >= 60 && scorePercent < 75 && "잘했어요! 조금만 더 공부하면 최고! 💪"}
                  {scorePercent >= 40 && scorePercent < 60 && "좋아요! e북을 더 읽으면 잘할 수 있어요! 📖"}
                  {scorePercent < 40 && "괜찮아요! 다시 도전해봐요! 🌟"}
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  size="lg"
                  onClick={() => {
                    setGameState("menu");
                  }}
                  className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  다시 풀기
                </Button>
                <Link href="/ebook-library">
                  <Button size="lg" variant="outline" className="font-bold">
                    <BookOpen className="h-5 w-5 mr-2" />
                    공략집 읽기
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="font-bold">
                    대시보드로
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 퀴즈 진행 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-red-100 to-blue-100">
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

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {getDifficultyLabel(currentQuestion.difficulty)}
            </span>
            {useTimer && (
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                timeLeft <= 10 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              }`}>
                ⏱️ {timeLeft}초
              </span>
            )}
          </div>
        </div>

        {/* 진행률 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">진행률</span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {currentIndex + 1} / {totalQuestions}
              </span>
              <span className="text-sm font-bold text-yellow-600">
                ⭐ {totalScore}점
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-3 bg-yellow-200" />
        </div>

        {/* 카테고리 & 점수 */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            📁 {currentQuestion.category}
          </span>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
            이 문제: {currentQuestion.points}점
          </span>
        </div>

        {/* 문제 카드 */}
        <Card className="mb-6 border-4 border-yellow-400 shadow-xl">
          <CardContent className="p-6 md:p-8">
            {/* 이미지 (있을 경우) */}
            {currentQuestion.image && (
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-yellow-200 to-red-200 rounded-full">
                  <img
                    src={currentQuestion.image}
                    alt="문제 이미지"
                    className="h-32 w-32 md:h-40 md:w-40 object-contain"
                  />
                </div>
              </div>
            )}

            {/* 문제 유형 아이콘 */}
            <div className="text-center mb-4">
              {currentQuestion.type === "multiple-choice" && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <CheckCircle className="h-4 w-4" /> 객관식
                </span>
              )}
              {currentQuestion.type === "short-answer" && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  ✏️ 주관식
                </span>
              )}
              {currentQuestion.type === "fill-blank" && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  📝 빈칸 채우기
                </span>
              )}
              {currentQuestion.type === "true-false" && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  ⭕ O/X 퀴즈
                </span>
              )}
            </div>

            {/* 질문 */}
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                {currentQuestion.question}
              </h2>
            </div>

            {/* 힌트 버튼 */}
            {!isAnswered && (
              <div className="text-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="text-yellow-600 border-yellow-400"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  힌트 {showHint ? "숨기기" : "보기"}
                </Button>
                {showHint && (
                  <p className="mt-2 text-yellow-700 bg-yellow-100 p-3 rounded-lg">
                    💡 {currentQuestion.hint}
                  </p>
                )}
              </div>
            )}

            {/* 답변 입력 영역 */}
            {(currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false") && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options?.map((option, index) => {
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
                    btnClass += " hover:bg-yellow-100 border-2 border-yellow-300 hover:border-yellow-500";
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

            {(currentQuestion.type === "short-answer" || currentQuestion.type === "fill-blank") && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="정답을 입력하세요..."
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmitAnswer()}
                    disabled={isAnswered}
                    className="text-xl text-center h-14 border-2 border-yellow-300 focus:border-yellow-500"
                  />
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={isAnswered || !userAnswer.trim()}
                    className="h-14 px-8 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold"
                  >
                    확인
                  </Button>
                </div>

                {isAnswered && (
                  <div className={`p-4 rounded-xl ${isCorrect ? "bg-green-100" : "bg-red-100"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <span className={`font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                        {isCorrect ? "정답이에요!" : `오답! 정답: ${currentQuestion.correctAnswer}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 해설 */}
            {isAnswered && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-700">해설: </span>
                    <span className="text-gray-700">{currentQuestion.explanation}</span>
                  </div>
                </div>
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
              className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold text-xl px-12 py-6"
            >
              {currentIndex < totalQuestions - 1 ? "다음 문제 ➡️" : "결과 보기 🎉"}
            </Button>
          </div>
        )}

        {/* 현재 상태 */}
        <div className="mt-6 flex justify-center gap-4">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold">맞은 문제: {correctCount}개</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <Award className="h-5 w-5 text-amber-500" />
            <span className="font-bold">총 점수: {totalScore}점</span>
          </div>
        </div>
      </div>
    </div>
  );
}
