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
  Users,
  User,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabaseClient";
import {
  FEEDBACK_MESSAGES,
  getRandomMessage,
  getCorrectMessage,
  getIncorrectMessage,
  getDontKnowMessage,
  getGuessingMessage,
  getStreakMessage,
  calculateCoins,
  DIFFICULTY_CONFIG,
  SESSION_CONFIG,
  ADAPTIVE_PATTERN,
  RECOVERY_EASY_COUNT,
  CONSECUTIVE_WRONG_THRESHOLD,
} from "@/constants/feedbackMessages";

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

  // ===== 친구 시스템 문제들 (fs = friend system) =====
  {
    id: "fs1",
    type: "multiple-choice",
    difficulty: "easy",
    category: "친구 시스템",
    question: "포켓몬GO에서 친구를 추가할 때 필요한 것은?",
    correctAnswer: "트레이너 코드",
    options: ["트레이너 코드", "포켓코인", "별의모래", "몬스터볼"],
    hint: "12자리 숫자로 된 나만의 특별한 번호예요!",
    explanation: "트레이너 코드는 12자리 숫자로 된 고유 번호로, 이걸 교환하면 친구가 될 수 있어요!",
    points: 5,
  },
  {
    id: "fs2",
    type: "fill-blank",
    difficulty: "easy",
    category: "친구 시스템",
    question: "친구와 ___일 동안 매일 교류하면 베스트 프렌드가 된다.",
    correctAnswer: "90",
    acceptableAnswers: ["90", "90일", "구십"],
    hint: "거의 3달 동안 꾸준히 해야 해요!",
    explanation: "매일 교류하면 90일 후에 베스트 프렌드가 될 수 있어요!",
    points: 5,
  },
  {
    id: "fs3",
    type: "multiple-choice",
    difficulty: "easy",
    category: "친구 시스템",
    question: "하루에 친구에게 보낼 수 있는 최대 선물 개수는?",
    correctAnswer: "100개",
    options: ["100개", "50개", "20개", "10개"],
    hint: "꽤 많이 보낼 수 있어요!",
    explanation: "하루에 최대 100개의 선물을 친구들에게 보낼 수 있어요!",
    points: 5,
  },
  {
    id: "fs4",
    type: "short-answer",
    difficulty: "medium",
    category: "친구 시스템",
    question: "베스트 프렌드가 되면 받는 경험치는 몇 XP일까요? (숫자만)",
    correctAnswer: "100000",
    acceptableAnswers: ["100000", "100,000", "10만", "십만"],
    hint: "엄청나게 많은 경험치를 한 번에 받아요!",
    explanation: "베스트 프렌드 달성 시 무려 100,000 XP를 받을 수 있어요! 행복의알을 쓰면 200,000 XP!",
    points: 10,
  },
  {
    id: "fs5",
    type: "multiple-choice",
    difficulty: "medium",
    category: "친구 시스템",
    question: "친구에게 받은 선물에서 나오는 특별한 알의 거리는?",
    correctAnswer: "7km",
    options: ["7km", "2km", "5km", "10km"],
    hint: "일반 포켓스탑에서는 나오지 않는 특별한 알이에요!",
    explanation: "선물에서 나오는 7km 알에서는 알로라, 갈라르 포켓몬 같은 특별한 포켓몬이 부화해요!",
    points: 8,
  },
  {
    id: "fs6",
    type: "true-false",
    difficulty: "easy",
    category: "친구 시스템",
    question: "우정 레벨이 높으면 레이드 배틀에서 공격력이 올라간다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "친구와 함께하면 더 강해져요!",
    explanation: "베스트 프렌드와 함께 레이드하면 공격력이 10%나 올라가요!",
    points: 5,
  },
  {
    id: "fs7",
    type: "fill-blank",
    difficulty: "medium",
    category: "친구 시스템",
    question: "베스트 프렌드와 레이드 배틀을 하면 공격력이 ___% 올라간다.",
    correctAnswer: "10",
    acceptableAnswers: ["10", "10%", "십"],
    hint: "꽤 큰 보너스예요!",
    explanation: "베스트 프렌드와 함께 레이드하면 공격력이 10% 증가해요!",
    points: 10,
  },
  {
    id: "fs8",
    type: "multiple-choice",
    difficulty: "medium",
    category: "친구 시스템",
    question: "포켓몬 교환이 가능한 최소 우정 레벨은?",
    correctAnswer: "훌륭한 친구",
    options: ["훌륭한 친구", "좋은 친구", "울트라 프렌드", "베스트 프렌드"],
    hint: "7일 교류하면 달성하는 레벨이에요!",
    explanation: "훌륭한 친구(7일 교류)가 되어야 포켓몬 교환을 할 수 있어요!",
    points: 8,
  },
  {
    id: "fs9",
    type: "short-answer",
    difficulty: "hard",
    category: "친구 시스템",
    question: "교환하면 가끔 배경이 반짝이는 특별한 포켓몬이 되는데, 이걸 뭐라고 부를까요?",
    correctAnswer: "럭키 포켓몬",
    acceptableAnswers: ["럭키 포켓몬", "럭키", "행운 포켓몬", "럭키포켓몬"],
    hint: "강화 비용이 50% 할인되는 특별한 포켓몬이에요!",
    explanation: "럭키 포켓몬은 강화 비용이 반으로 줄고 최소 별 2개 이상의 개체값이 보장돼요!",
    points: 12,
  },
  {
    id: "fs10",
    type: "multiple-choice",
    difficulty: "hard",
    category: "친구 시스템",
    question: "베스트 프렌드끼리 교류하면 가끔 발생하는 특별한 상태는?",
    correctAnswer: "럭키 프렌드",
    options: ["럭키 프렌드", "슈퍼 프렌드", "골든 프렌드", "스페셜 프렌드"],
    hint: "다음 교환이 100% 럭키가 되는 상태예요!",
    explanation: "럭키 프렌드가 되면 다음 교환에서 무조건 럭키 포켓몬이 돼요!",
    points: 12,
  },
  {
    id: "fs11",
    type: "fill-blank",
    difficulty: "hard",
    category: "친구 시스템",
    question: "좋은 친구와 새로운 전설 포켓몬을 교환하려면 별의모래 ___개가 필요하다.",
    correctAnswer: "1000000",
    acceptableAnswers: ["1000000", "1,000,000", "백만", "100만"],
    hint: "엄청나게 많은 별의모래가 필요해요!",
    explanation: "좋은 친구 단계에서 새로운 전설 포켓몬 교환은 무려 1,000,000 별의모래가 필요해요! 베스트 프렌드면 40,000으로 줄어요.",
    points: 15,
  },
  {
    id: "fs12",
    type: "multiple-choice",
    difficulty: "medium",
    category: "친구 시스템",
    question: "울트라 프렌드가 되려면 며칠 동안 교류해야 할까요?",
    correctAnswer: "30일",
    options: ["30일", "7일", "14일", "60일"],
    hint: "약 한 달 정도 걸려요!",
    explanation: "울트라 프렌드는 30일 동안 매일 교류하면 달성할 수 있어요!",
    points: 8,
  },
  {
    id: "fs13",
    type: "true-false",
    difficulty: "medium",
    category: "친구 시스템",
    question: "하루에 여러 번 선물을 주고받으면 우정 레벨이 여러 번 올라간다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "하루에 우정은 몇 번 올라갈까요?",
    explanation: "하루에 여러 번 교류해도 우정은 딱 1번만 올라가요! 그래서 매일 꾸준히 하는 게 중요해요.",
    points: 8,
  },
  {
    id: "fs14",
    type: "short-answer",
    difficulty: "easy",
    category: "친구 시스템",
    question: "친구와 함께 레이드 배틀, 체육관 배틀, 선물 교환 등을 하는 것을 뭐라고 할까요?",
    correctAnswer: "교류",
    acceptableAnswers: ["교류", "교류하기", "인터랙션", "interaction"],
    hint: "친구 사이를 더 끈끈하게 만드는 활동이에요!",
    explanation: "교류는 친구와 함께 하는 모든 활동을 말해요. 매일 교류하면 우정 레벨이 올라가요!",
    points: 5,
  },
  {
    id: "fs15",
    type: "multiple-choice",
    difficulty: "hard",
    category: "친구 시스템",
    question: "럭키 포켓몬의 강화 비용은 일반 포켓몬의 몇 %일까요?",
    correctAnswer: "50%",
    options: ["50%", "75%", "25%", "30%"],
    hint: "반값 할인이에요!",
    explanation: "럭키 포켓몬은 강화할 때 별의모래가 50%만 들어서 절약할 수 있어요!",
    points: 12,
  },

  // ===== GO 배틀 리그 퀴즈 (15문제) =====
  {
    id: "gbl1",
    type: "multiple-choice",
    difficulty: "easy",
    category: "GO 배틀 리그",
    question: "GO 배틀 리그에서 한 팀에 포켓몬은 몇 마리가 필요할까요?",
    correctAnswer: "3마리",
    options: ["3마리", "5마리", "6마리", "4마리"],
    hint: "레이드보다 적은 수예요!",
    explanation: "GO 배틀 리그는 포켓몬 3마리로 팀을 구성해서 싸워요!",
    points: 5,
  },
  {
    id: "gbl2",
    type: "multiple-choice",
    difficulty: "easy",
    category: "GO 배틀 리그",
    question: "그레이트 리그의 CP 제한은 얼마일까요?",
    correctAnswer: "1500 이하",
    options: ["1500 이하", "2500 이하", "제한 없음", "1000 이하"],
    hint: "가장 인기 있는 리그예요!",
    explanation: "그레이트 리그는 CP 1500 이하 포켓몬만 참가할 수 있어요!",
    points: 5,
  },
  {
    id: "gbl3",
    type: "multiple-choice",
    difficulty: "easy",
    category: "GO 배틀 리그",
    question: "배틀에서 사용할 수 있는 실드는 몇 개일까요?",
    correctAnswer: "2개",
    options: ["2개", "3개", "1개", "무제한"],
    hint: "아껴서 써야 해요!",
    explanation: "배틀에서 실드는 2개만 사용할 수 있어서 신중하게 써야 해요!",
    points: 5,
  },
  {
    id: "gbl4",
    type: "true-false",
    difficulty: "easy",
    category: "GO 배틀 리그",
    question: "울트라 리그의 CP 제한은 2500이다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "그레이트 리그보다 높아요!",
    explanation: "울트라 리그는 CP 2500 이하 포켓몬만 참가할 수 있어요!",
    points: 5,
  },
  {
    id: "gbl5",
    type: "multiple-choice",
    difficulty: "medium",
    category: "GO 배틀 리그",
    question: "마스터 리그의 CP 제한은 어떻게 될까요?",
    correctAnswer: "제한 없음",
    options: ["제한 없음", "3000 이하", "3500 이하", "4000 이하"],
    hint: "최강의 포켓몬들이 싸우는 리그예요!",
    explanation: "마스터 리그는 CP 제한이 없어서 가장 강한 포켓몬들이 참가해요!",
    points: 8,
  },
  {
    id: "gbl6",
    type: "fill-blank",
    difficulty: "medium",
    category: "GO 배틀 리그",
    question: "빠른 기술로 에너지를 모아서 사용하는 강력한 기술을 ___ 기술이라고 한다.",
    correctAnswer: "차지",
    acceptableAnswers: ["차지", "차지기술", "charged", "스페셜"],
    hint: "에너지가 차면 쓸 수 있어요!",
    explanation: "차지 기술은 빠른 기술로 에너지를 모아서 사용하는 강력한 공격이에요!",
    points: 10,
  },
  {
    id: "gbl7",
    type: "multiple-choice",
    difficulty: "medium",
    category: "GO 배틀 리그",
    question: "그레이트 리그에서 가장 인기 있는 포켓몬 중 하나인 물/페어리 타입 포켓몬은?",
    correctAnswer: "마릴리",
    options: ["마릴리", "갸라도스", "라프라스", "밀로틱"],
    hint: "파란색 통통한 포켓몬이에요!",
    explanation: "마릴리는 그레이트 리그 최강 포켓몬 중 하나로, 튼튼하고 드래곤도 잡을 수 있어요!",
    points: 8,
  },
  {
    id: "gbl8",
    type: "true-false",
    difficulty: "medium",
    category: "GO 배틀 리그",
    question: "배틀 중 포켓몬을 교체하면 바로 다시 교체할 수 있다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "교체 후에는 대기 시간이 있어요!",
    explanation: "포켓몬을 교체하면 약 1분 동안 다시 교체할 수 없어요. 신중하게 교체해야 해요!",
    points: 8,
  },
  {
    id: "gbl9",
    type: "multiple-choice",
    difficulty: "medium",
    category: "GO 배틀 리그",
    question: "배틀 리그에서 5판 중 3승을 하면 받는 특별한 보상은?",
    correctAnswer: "포켓몬 만남",
    options: ["포켓몬 만남", "레이드 패스", "향로", "행복의알"],
    hint: "전설 포켓몬도 만날 수 있어요!",
    explanation: "5판 중 3승을 하면 특별한 포켓몬을 만날 수 있어요. 전설 포켓몬도 나올 수 있어요!",
    points: 8,
  },
  {
    id: "gbl10",
    type: "short-answer",
    difficulty: "hard",
    category: "GO 배틀 리그",
    question: "배틀 리그에서 가장 높은 랭크의 이름은 무엇일까요?",
    correctAnswer: "레전드",
    acceptableAnswers: ["레전드", "legend", "전설"],
    hint: "영어로 '전설'이라는 뜻이에요!",
    explanation: "레전드(Legend)는 배틀 리그 최고 랭크로, 레이팅 3000점 이상이어야 해요!",
    points: 12,
  },
  {
    id: "gbl11",
    type: "fill-blank",
    difficulty: "hard",
    category: "GO 배틀 리그",
    question: "레전드 랭크가 되려면 레이팅이 ___점 이상이어야 한다.",
    correctAnswer: "3000",
    acceptableAnswers: ["3000", "3,000", "삼천"],
    hint: "꽤 높은 점수예요!",
    explanation: "레전드 랭크는 레이팅 3000점 이상의 최고 실력자만 달성할 수 있어요!",
    points: 12,
  },
  {
    id: "gbl12",
    type: "multiple-choice",
    difficulty: "hard",
    category: "GO 배틀 리그",
    question: "배틀 중 상대의 차지 기술을 막을 수 있는 것은?",
    correctAnswer: "실드",
    options: ["실드", "상처약", "열매", "몬스터볼"],
    hint: "방어막이에요!",
    explanation: "실드를 사용하면 상대의 차지 기술 데미지를 거의 막을 수 있어요!",
    points: 10,
  },
  {
    id: "gbl13",
    type: "multiple-choice",
    difficulty: "medium",
    category: "GO 배틀 리그",
    question: "그레이트 리그에서 강철 타입으로 유명한 전설 포켓몬은?",
    correctAnswer: "레지스틸",
    options: ["레지스틸", "메타그로스", "하사무", "루카리오"],
    hint: "레지 시리즈 중 하나예요!",
    explanation: "레지스틸은 그레이트 리그 최고의 탱커로, 엄청나게 튼튼해요!",
    points: 8,
  },
  {
    id: "gbl14",
    type: "true-false",
    difficulty: "easy",
    category: "GO 배틀 리그",
    question: "배틀 리그는 집에서도 할 수 있다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "어디서든 배틀 가능해요!",
    explanation: "GO 배틀 리그는 인터넷만 되면 어디서든 할 수 있어요! 비 오는 날에도 OK!",
    points: 5,
  },
  {
    id: "gbl15",
    type: "short-answer",
    difficulty: "hard",
    category: "GO 배틀 리그",
    question: "배틀에서 약한 기술로 상대 실드를 유도하는 전략을 뭐라고 할까요?",
    correctAnswer: "베이팅",
    acceptableAnswers: ["베이팅", "baiting", "실드베이팅", "실드 베이팅"],
    hint: "낚시처럼 유인하는 거예요!",
    explanation: "베이팅은 약한 차지 기술로 상대 실드를 쓰게 만들고, 나중에 강한 기술로 공격하는 전략이에요!",
    points: 15,
  },

  // ===== 이벤트 & 커뮤니티 데이 퀴즈 (15문제) =====
  {
    id: "evt1",
    type: "multiple-choice",
    difficulty: "easy",
    category: "이벤트",
    question: "커뮤니티 데이는 보통 한 달에 몇 번 열릴까요?",
    correctAnswer: "1번",
    options: ["1번", "2번", "매주", "3번"],
    hint: "한 달에 한 번 특별한 날이에요!",
    explanation: "커뮤니티 데이는 보통 매달 셋째 주 토요일에 한 번 열려요!",
    points: 5,
  },
  {
    id: "evt2",
    type: "multiple-choice",
    difficulty: "easy",
    category: "이벤트",
    question: "커뮤니티 데이는 보통 몇 시간 동안 진행될까요?",
    correctAnswer: "3시간",
    options: ["3시간", "1시간", "6시간", "24시간"],
    hint: "오후에 집중해서 플레이해요!",
    explanation: "커뮤니티 데이는 보통 오후 2시부터 5시까지 3시간 동안 진행돼요!",
    points: 5,
  },
  {
    id: "evt3",
    type: "true-false",
    difficulty: "easy",
    category: "이벤트",
    question: "커뮤니티 데이에만 배울 수 있는 특별한 기술이 있다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "이 날 진화시키면 특별해요!",
    explanation: "커뮤니티 데이에 진화시키면 평소에 배울 수 없는 특별한 기술을 배울 수 있어요!",
    points: 5,
  },
  {
    id: "evt4",
    type: "multiple-choice",
    difficulty: "easy",
    category: "이벤트",
    question: "스팟라이트 아워는 매주 무슨 요일에 열릴까요?",
    correctAnswer: "화요일",
    options: ["화요일", "월요일", "수요일", "금요일"],
    hint: "레이드 아워 전날이에요!",
    explanation: "스팟라이트 아워는 매주 화요일 저녁 6시에 1시간 동안 진행돼요!",
    points: 5,
  },
  {
    id: "evt5",
    type: "multiple-choice",
    difficulty: "easy",
    category: "이벤트",
    question: "레이드 아워는 매주 무슨 요일에 열릴까요?",
    correctAnswer: "수요일",
    options: ["수요일", "화요일", "목요일", "토요일"],
    hint: "모든 체육관에 5성 레이드가 열려요!",
    explanation: "레이드 아워는 매주 수요일 저녁 6시에 1시간 동안 진행돼요!",
    points: 5,
  },
  {
    id: "evt6",
    type: "fill-blank",
    difficulty: "medium",
    category: "이벤트",
    question: "스팟라이트 아워와 레이드 아워는 각각 _시간 동안 진행된다.",
    correctAnswer: "1",
    acceptableAnswers: ["1", "1시간", "한"],
    hint: "짧지만 강렬해요!",
    explanation: "스팟라이트 아워와 레이드 아워는 각각 1시간 동안만 진행되니 놓치지 마세요!",
    points: 10,
  },
  {
    id: "evt7",
    type: "multiple-choice",
    difficulty: "medium",
    category: "이벤트",
    question: "커뮤니티 데이에 색이 다른 포켓몬이 나올 확률은 평소의 약 몇 배일까요?",
    correctAnswer: "25배",
    options: ["25배", "10배", "5배", "50배"],
    hint: "엄청 많이 올라가요!",
    explanation: "커뮤니티 데이에는 색이 다른 포켓몬 확률이 약 25배나 높아져요!",
    points: 10,
  },
  {
    id: "evt8",
    type: "true-false",
    difficulty: "medium",
    category: "이벤트",
    question: "커뮤니티 데이가 끝난 후에도 특별 기술을 배울 수 있다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "시간이 중요해요!",
    explanation: "커뮤니티 데이 특별 기술은 이벤트 시간 안에 진화해야만 배울 수 있어요! 끝나면 못 배워요.",
    points: 8,
  },
  {
    id: "evt9",
    type: "multiple-choice",
    difficulty: "medium",
    category: "이벤트",
    question: "할로윈 이벤트 때 주로 많이 나오는 타입은?",
    correctAnswer: "고스트 타입",
    options: ["고스트 타입", "물 타입", "불 타입", "풀 타입"],
    hint: "유령의 계절이에요!",
    explanation: "할로윈 이벤트에는 고스트 타입과 악 타입 포켓몬이 많이 나와요!",
    points: 8,
  },
  {
    id: "evt10",
    type: "short-answer",
    difficulty: "medium",
    category: "이벤트",
    question: "경험치 2배 이벤트 때 행복의알을 쓰면 경험치가 몇 배가 될까요?",
    correctAnswer: "4",
    acceptableAnswers: ["4", "4배", "네배", "4배로"],
    hint: "2배 + 2배 = ?",
    explanation: "경험치 2배 이벤트에 행복의알(2배)을 쓰면 총 4배의 경험치를 받을 수 있어요!",
    points: 10,
  },
  {
    id: "evt11",
    type: "multiple-choice",
    difficulty: "hard",
    category: "이벤트",
    question: "1년 중 포켓몬GO에서 가장 큰 이벤트는?",
    correctAnswer: "GO Fest",
    options: ["GO Fest", "커뮤니티 데이", "할로윈", "크리스마스"],
    hint: "전 세계가 함께 참여하는 축제예요!",
    explanation: "GO Fest는 1년 중 가장 큰 이벤트로, 전 세계 트레이너들이 함께 참여해요!",
    points: 12,
  },
  {
    id: "evt12",
    type: "fill-blank",
    difficulty: "hard",
    category: "이벤트",
    question: "사탕 2배 이벤트에 파인열매를 쓰면 사탕을 총 _배 받을 수 있다.",
    correctAnswer: "4",
    acceptableAnswers: ["4", "4배", "네", "네배"],
    hint: "2배 × 2배 = ?",
    explanation: "사탕 2배 이벤트에 파인열매(2배)를 쓰면 총 4배의 사탕을 받을 수 있어요!",
    points: 12,
  },
  {
    id: "evt13",
    type: "multiple-choice",
    difficulty: "medium",
    category: "이벤트",
    question: "커뮤니티 데이 준비로 가장 중요한 것은?",
    correctAnswer: "몬스터볼 많이 모으기",
    options: ["몬스터볼 많이 모으기", "포켓코인 모으기", "체육관 점령하기", "친구 삭제하기"],
    hint: "포켓몬을 많이 잡아야 해요!",
    explanation: "커뮤니티 데이에는 포켓몬을 엄청 많이 잡아야 해서 몬스터볼이 최소 200개 이상 필요해요!",
    points: 8,
  },
  {
    id: "evt14",
    type: "true-false",
    difficulty: "easy",
    category: "이벤트",
    question: "이벤트 정보는 포켓몬GO 앱의 '오늘 소식'에서 확인할 수 있다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "앱 안에 뉴스 버튼이 있어요!",
    explanation: "포켓몬GO 앱의 '오늘 소식' 버튼을 누르면 최신 이벤트 정보를 확인할 수 있어요!",
    points: 5,
  },
  {
    id: "evt15",
    type: "short-answer",
    difficulty: "hard",
    category: "이벤트",
    question: "레이드 아워에는 모든 체육관에 몇 성 레이드가 열릴까요?",
    correctAnswer: "5",
    acceptableAnswers: ["5", "5성", "오", "다섯"],
    hint: "전설의 포켓몬을 잡을 수 있어요!",
    explanation: "레이드 아워에는 모든 체육관에 5성 레이드가 열려서 전설 포켓몬을 잡을 수 있어요!",
    points: 12,
  },

  // ===== 로켓단 퀴즈 (15문제) =====
  {
    id: "rkt1",
    type: "multiple-choice",
    difficulty: "easy",
    category: "로켓단",
    question: "로켓단이 점령한 포켓스탑의 색깔은?",
    correctAnswer: "검은색",
    options: ["검은색", "빨간색", "보라색", "초록색"],
    hint: "어둡고 무서운 색이에요!",
    explanation: "로켓단이 점령한 포켓스탑은 검은색으로 변하고 흔들려요!",
    points: 5,
  },
  {
    id: "rkt2",
    type: "multiple-choice",
    difficulty: "easy",
    category: "로켓단",
    question: "로켓단을 이기면 잡을 수 있는 특별한 포켓몬의 이름은?",
    correctAnswer: "그림자 포켓몬",
    options: ["그림자 포켓몬", "전설 포켓몬", "색다른 포켓몬", "메가 포켓몬"],
    hint: "눈이 빨갛게 빛나요!",
    explanation: "로켓단을 이기면 그림자 포켓몬을 잡을 기회가 생겨요!",
    points: 5,
  },
  {
    id: "rkt3",
    type: "true-false",
    difficulty: "easy",
    category: "로켓단",
    question: "로켓단 조무래기는 대사로 어떤 타입인지 힌트를 준다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "\"불꽃을 보여주마!\" 같은 말이에요!",
    explanation: "조무래기의 대사를 보면 어떤 타입 포켓몬을 쓰는지 알 수 있어요!",
    points: 5,
  },
  {
    id: "rkt4",
    type: "fill-blank",
    difficulty: "medium",
    category: "로켓단",
    question: "로켓단 간부를 찾으려면 조무래기 _명을 이겨서 신비한 부품을 모아야 한다.",
    correctAnswer: "6",
    acceptableAnswers: ["6", "6명", "여섯"],
    hint: "부품 6개가 필요해요!",
    explanation: "조무래기 6명을 이기면 신비한 부품 6개를 모아 로켓단 레이더를 만들 수 있어요!",
    points: 10,
  },
  {
    id: "rkt5",
    type: "multiple-choice",
    difficulty: "medium",
    category: "로켓단",
    question: "로켓단 간부가 아닌 사람은?",
    correctAnswer: "비주기",
    options: ["비주기", "클리프", "시에라", "알로"],
    hint: "보스는 간부가 아니에요!",
    explanation: "클리프, 시에라, 알로가 간부이고, 비주기는 로켓단의 보스예요!",
    points: 8,
  },
  {
    id: "rkt6",
    type: "short-answer",
    difficulty: "medium",
    category: "로켓단",
    question: "로켓단의 최종 보스 이름은?",
    correctAnswer: "비주기",
    acceptableAnswers: ["비주기", "giovanni", "지오바니"],
    hint: "간부들의 두목이에요!",
    explanation: "비주기(Giovanni)는 로켓단의 보스로, 그림자 전설 포켓몬을 가지고 있어요!",
    points: 10,
  },
  {
    id: "rkt7",
    type: "multiple-choice",
    difficulty: "medium",
    category: "로켓단",
    question: "그림자 포켓몬의 공격력은 일반 포켓몬보다 몇 % 높을까요?",
    correctAnswer: "20%",
    options: ["20%", "10%", "30%", "50%"],
    hint: "꽤 큰 보너스예요!",
    explanation: "그림자 포켓몬은 공격력이 20% 높아서 레이드에서 아주 강해요!",
    points: 8,
  },
  {
    id: "rkt8",
    type: "true-false",
    difficulty: "medium",
    category: "로켓단",
    question: "그림자 포켓몬을 정화하면 공격력 20% 보너스가 사라진다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "정화하면 더 이상 그림자가 아니에요!",
    explanation: "정화하면 그림자 상태가 해제되어 공격력 20% 보너스가 사라져요. 그래서 정화 안 하는 게 좋을 때가 많아요!",
    points: 8,
  },
  {
    id: "rkt9",
    type: "multiple-choice",
    difficulty: "hard",
    category: "로켓단",
    question: "그림자 포켓몬이 기본으로 가지고 있는 약한 기술의 이름은?",
    correctAnswer: "악의파동",
    options: ["악의파동", "되돌리기", "그림자공격", "어둠의힘"],
    hint: "이 기술은 거의 쓸모없어요!",
    explanation: "그림자 포켓몬은 기본으로 '악의파동'이라는 약한 기술을 가지고 있어요. 이벤트 때 바꿀 수 있어요!",
    points: 12,
  },
  {
    id: "rkt10",
    type: "short-answer",
    difficulty: "hard",
    category: "로켓단",
    question: "그림자 포켓몬을 정화하면 배우는 기술의 이름은?",
    correctAnswer: "되돌리기",
    acceptableAnswers: ["되돌리기", "리턴", "return"],
    hint: "정화된 포켓몬만 배울 수 있어요!",
    explanation: "정화하면 '되돌리기'라는 기술을 배워요. 하지만 정화하면 공격력 보너스가 사라져요!",
    points: 12,
  },
  {
    id: "rkt11",
    type: "multiple-choice",
    difficulty: "easy",
    category: "로켓단",
    question: "로켓단 기구는 몇 시간마다 새로 등장할까요?",
    correctAnswer: "6시간",
    options: ["6시간", "3시간", "12시간", "1시간"],
    hint: "하루에 4번 정도 볼 수 있어요!",
    explanation: "로켓단 기구는 6시간마다 새로 등장해서 하루에 4번 정도 만날 수 있어요!",
    points: 5,
  },
  {
    id: "rkt12",
    type: "fill-blank",
    difficulty: "hard",
    category: "로켓단",
    question: "그림자 포켓몬은 공격력이 20% 높지만, 방어력은 __% 낮다.",
    correctAnswer: "20",
    acceptableAnswers: ["20", "20%", "이십"],
    hint: "공격력과 같은 비율이에요!",
    explanation: "그림자 포켓몬은 공격력 +20%, 방어력 -20%예요. 그래도 공격력 보너스가 더 좋아요!",
    points: 12,
  },
  {
    id: "rkt13",
    type: "multiple-choice",
    difficulty: "medium",
    category: "로켓단",
    question: "간부전에서 가장 중요한 전략은?",
    correctAnswer: "상대 실드 먼저 털기",
    options: ["상대 실드 먼저 털기", "무조건 강한 포켓몬 쓰기", "계속 교체하기", "실드 안 쓰기"],
    hint: "빠른 차지기술로 실드를 유도해요!",
    explanation: "간부전에서는 빠른 차지기술로 상대 실드를 먼저 털고, 그다음에 강한 기술을 써요!",
    points: 8,
  },
  {
    id: "rkt14",
    type: "true-false",
    difficulty: "hard",
    category: "로켓단",
    question: "그림자 포켓몬의 악의파동은 아무 때나 TM으로 바꿀 수 있다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "특별한 때만 가능해요!",
    explanation: "악의파동은 로켓단 이벤트 기간에만 TM으로 바꿀 수 있어요! 평소에는 못 바꿔요.",
    points: 12,
  },
  {
    id: "rkt15",
    type: "multiple-choice",
    difficulty: "hard",
    category: "로켓단",
    question: "비주기를 만나려면 필요한 특별한 아이템은?",
    correctAnswer: "슈퍼 로켓단 레이더",
    options: ["슈퍼 로켓단 레이더", "로켓단 레이더", "신비한 부품", "프리미엄 패스"],
    hint: "특별 리서치에서 받을 수 있어요!",
    explanation: "슈퍼 로켓단 레이더는 특별 리서치를 완료하면 받을 수 있고, 이걸로 비주기를 찾을 수 있어요!",
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

  // 🆕 새로운 상태들 - 주우 맞춤 개선
  const [hintLevel, setHintLevel] = useState(0); // 0~3단계 힌트
  const [answerStartTime, setAnswerStartTime] = useState<number>(0); // 문제 시작 시간
  const [consecutiveFastAnswers, setConsecutiveFastAnswers] = useState(0); // 연속 빠른 답변
  const [lastAnswerPattern, setLastAnswerPattern] = useState<string[]>([]); // 최근 답변 패턴
  const [guessingDetected, setGuessingDetected] = useState(false); // 찍기 감지됨
  const [usedDontKnow, setUsedDontKnow] = useState(false); // 모르겠어요 사용
  const [streak, setStreak] = useState(0); // 연속 정답
  const [consecutiveWrong, setConsecutiveWrong] = useState(0); // 연속 오답
  const [totalCoins, setTotalCoins] = useState(0); // 획득 코인
  const [dontKnowCount, setDontKnowCount] = useState(0); // 모르겠어요 사용 횟수
  const [guessingCount, setGuessingCount] = useState(0); // 찍기 감지 횟수
  const [gameMode, setGameMode] = useState<"solo" | "coop">("solo"); // 게임 모드

  const totalQuestions = SESSION_CONFIG.defaultQuestionCount; // 7문제로 변경
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100;
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

  // 🆕 문제 시작 시간 기록
  useEffect(() => {
    if (currentQuestion && gameState === "playing" && !isAnswered) {
      setAnswerStartTime(Date.now());
      setGuessingDetected(false);
      setUsedDontKnow(false);
    }
  }, [currentIndex, gameState]);

  useEffect(() => {
    if (!useTimer || gameState !== "playing" || isAnswered) return;

    if (timeLeft === 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, useTimer, gameState, isAnswered]);

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

    // 1 코인 획득
    setTotalCoins(prev => prev + 1);

    toast.success(getDontKnowMessage(), {
      description: `정답: ${currentQuestion.correctAnswer}`,
      duration: 4000,
    });
  };

  // 🆕 적응형 문제 선택 함수
  const selectAdaptiveQuestions = (diff: Difficulty | "all", count: number): QuizQuestion[] => {
    const easy = allQuizData.filter(q => q.difficulty === 'easy');
    const medium = allQuizData.filter(q => q.difficulty === 'medium');
    const hard = allQuizData.filter(q => q.difficulty === 'hard');

    const shuffleArray = <T,>(arr: T[]): T[] => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // 특정 난이도 선택 시 해당 난이도만
    if (diff !== 'all') {
      const pool = allQuizData.filter(q => q.difficulty === diff);
      return shuffleArray(pool).slice(0, count);
    }

    // 적응형 패턴: 쉬움 → 쉬움 → 어려움 → 쉬움 → 보통 → 쉬움
    const result: QuizQuestion[] = [];
    const usedIds = new Set<string>();

    const getRandomFromPool = (pool: QuizQuestion[]): QuizQuestion | null => {
      const available = pool.filter(q => !usedIds.has(q.id));
      if (available.length === 0) return null;
      const q = available[Math.floor(Math.random() * available.length)];
      usedIds.add(q.id);
      return q;
    };

    for (let i = 0; i < count; i++) {
      const patternDiff = ADAPTIVE_PATTERN[i % ADAPTIVE_PATTERN.length];
      const pool = patternDiff === 'easy' ? easy : patternDiff === 'medium' ? medium : hard;
      const question = getRandomFromPool(pool);
      if (question) {
        result.push(question);
      } else {
        // 해당 난이도가 부족하면 다른 난이도에서
        const fallback = getRandomFromPool(easy) || getRandomFromPool(medium) || getRandomFromPool(hard);
        if (fallback) result.push(fallback);
      }
    }

    return result;
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    setStreak(0);
    toast.error("시간 초과!");
  };

  const startGame = () => {
    const selected = selectAdaptiveQuestions(difficulty, totalQuestions).map(q => ({
      ...q,
      options: q.options ? [...q.options].sort(() => Math.random() - 0.5) : q.options,
    }));
    setQuestions(selected);
    setCurrentIndex(0);
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setTotalScore(0);
    setCorrectCount(0);
    setShowHint(false);
    setHintLevel(0);
    setGameTicket(0);
    setTimeLeft(30);
    setStreak(0);
    setConsecutiveWrong(0);
    setTotalCoins(0);
    setDontKnowCount(0);
    setGuessingCount(0);
    setLastAnswerPattern([]);
    setGuessingDetected(false);
    setUsedDontKnow(false);
    setGameState("playing");
  };

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    // 🆕 찍기 감지
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

  const handleSubmitAnswer = () => {
    if (isAnswered || !userAnswer.trim()) return;

    // 주관식은 찍기 감지 안 함 (타이핑 필요하므로)
    setLastAnswerPattern(prev => [...prev.slice(-(SESSION_CONFIG.patternDetectionWindow - 1)), userAnswer]);
    submitAnswer(userAnswer);
  };

  const submitAnswer = (answer: string) => {
    setIsAnswered(true);
    const correct = checkAnswer(answer, currentQuestion);
    setIsCorrect(correct);

    // 🆕 코인 계산
    const coinResult = calculateCoins(
      correct,
      currentQuestion.difficulty,
      hintLevel,
      guessingDetected,
      usedDontKnow,
      streak + (correct ? 1 : 0)
    );

    setTotalCoins(prev => prev + coinResult.coins);

    if (correct) {
      setTotalScore(prev => prev + currentQuestion.points);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      setConsecutiveWrong(0);

      // 연속 정답 보너스 메시지
      const newStreak = streak + 1;
      const streakMsg = getStreakMessage(newStreak);

      toast.success(getCorrectMessage(currentQuestion.difficulty), {
        description: coinResult.bonusMessage || `+${coinResult.coins} 코인 🪙`,
        duration: 2500,
      });

      if (streakMsg && newStreak >= 3) {
        setTimeout(() => {
          toast.success(streakMsg, { duration: 2000 });
        }, 500);
      }

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4"],
      });
    } else {
      // 🆕 오답이지만 긍정적 피드백 + 1 코인
      setStreak(0);
      setConsecutiveWrong(prev => prev + 1);

      toast.info(getIncorrectMessage(), {
        description: `정답: ${currentQuestion.correctAnswer} (+1 코인 🪙)`,
        duration: 3000,
      });

      // 연속 오답 시 격려 메시지
      if (consecutiveWrong + 1 >= CONSECUTIVE_WRONG_THRESHOLD) {
        setTimeout(() => {
          toast.info(getRandomMessage(FEEDBACK_MESSAGES.encouragement.afterManyWrong), {
            duration: 3000,
          });
        }, 1000);
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
      setHintLevel(0); // 🆕 힌트 레벨 리셋
      setTimeLeft(30);
      setGuessingDetected(false);
      setUsedDontKnow(false);

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
      case "easy": return {
        color: "from-emerald-500 to-green-500",
        shadow: "shadow-emerald-500/25",
        label: "기본",
        emoji: "",
        stars: 1,
        isChallenge: false,
      };
      case "medium": return {
        color: "from-amber-500 to-yellow-500",
        shadow: "shadow-amber-500/25",
        label: "보통",
        emoji: "",
        stars: 2,
        isChallenge: false,
      };
      case "hard": return {
        color: "from-rose-500 to-red-500",
        shadow: "shadow-rose-500/25",
        label: "도전!",
        emoji: "",
        stars: 3,
        isChallenge: true,
        challengeLabel: "틀려도 OK!",
      };
      default: return {
        color: "from-violet-500 to-purple-500",
        shadow: "shadow-violet-500/25",
        label: "전체",
        emoji: "",
        stars: 0,
        isChallenge: false,
      };
    }
  };

  // 🆕 난이도 배지 컴포넌트
  const DifficultyBadge = ({ diff }: { diff: Difficulty }) => {
    const config = getDifficultyConfig(diff);
    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${config.color} text-white text-sm font-bold shadow-lg ${config.shadow}`}>
        {Array.from({ length: config.stars }).map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-current" />
        ))}
        <span className="ml-1">{config.label}</span>
        {config.isChallenge && (
          <span className="ml-1 text-xs bg-white/20 px-1.5 rounded">
            {config.challengeLabel}
          </span>
        )}
      </div>
    );
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

          {/* 🆕 코인 획득 */}
          <Card className="border-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-500/25 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl text-3xl">
                  🪙
                </div>
                <div>
                  <p className="font-bold text-lg">획득 코인</p>
                  <p className="text-white/90 text-3xl font-black">{totalCoins} 코인</p>
                </div>
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

          {/* 🆕 학습 통계 */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-black text-blue-600">{dontKnowCount}</p>
                  <p className="text-xs text-slate-600">"모르겠어요"</p>
                  <p className="text-xs text-slate-400">(용기있게!)</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-600">{streak > 0 ? streak : "-"}</p>
                  <p className="text-xs text-slate-600">최고 연속</p>
                  <p className="text-xs text-slate-400">정답</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-green-600">{correctCount}</p>
                  <p className="text-xs text-slate-600">맞춘 문제</p>
                  <p className="text-xs text-slate-400">/{totalQuestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
              onClick={startGame}
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              다시 풀기
            </Button>

            {/* 🆕 더 풀래요 버튼 */}
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const additionalQuestions = selectAdaptiveQuestions(difficulty, SESSION_CONFIG.additionalQuestionCount);
                setQuestions(prev => [...prev, ...additionalQuestions]);
                setCurrentIndex(totalQuestions);
                setIsAnswered(false);
                setGameState("playing");
              }}
              className="w-full h-12 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold rounded-2xl"
            >
              <Zap className="h-5 w-5 mr-2" />
              더 풀래요! (+{SESSION_CONFIG.additionalQuestionCount}문제)
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/ebook-library">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold">
                  <BookOpen className="h-4 w-4 mr-2" />
                  공략집
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full h-12 rounded-xl font-medium text-slate-600">
                  오늘은 여기까지!
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

            {/* 🆕 3단계 힌트 시스템 */}
            {!isAnswered && (
              <div className="text-center mb-4">
                <button
                  onClick={() => setHintLevel(prev => Math.min(prev + 1, 3))}
                  disabled={hintLevel >= 3}
                  className={`text-sm font-medium flex items-center gap-1 mx-auto px-4 py-2 rounded-xl transition-all ${
                    hintLevel >= 3
                      ? "text-slate-400 bg-slate-100"
                      : "text-amber-600 bg-amber-50 hover:bg-amber-100 active:scale-95"
                  }`}
                >
                  <Lightbulb className="h-4 w-4" />
                  힌트 {hintLevel}/3 {hintLevel < 3 ? "(터치하면 힌트가 나와!)" : "(다 봤어!)"}
                </button>
                <p className="text-xs text-slate-500 mt-1">
                  힌트를 써도 점수는 그대로야! 걱정마!
                </p>

                {hintLevel > 0 && (
                  <div className="mt-3 space-y-2">
                    {hintLevel >= 1 && (
                      <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                        💡 힌트 1: {currentQuestion.hint}
                      </div>
                    )}
                    {hintLevel >= 2 && currentQuestion.explanation && (
                      <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                        💡 힌트 2: {currentQuestion.explanation.slice(0, 50)}...
                      </div>
                    )}
                    {hintLevel >= 3 && (
                      <div className="text-sm text-purple-700 bg-purple-50 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                        💡 힌트 3: 정답은 "{currentQuestion.correctAnswer.charAt(0)}..."로 시작해!
                      </div>
                    )}
                  </div>
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

                {/* 🆕 모르겠어요 버튼 */}
                {!isAnswered && (
                  <button
                    onClick={handleDontKnow}
                    className="w-full p-4 mt-3 rounded-xl font-bold transition-all border-2 border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="h-5 w-5" />
                    모르겠어요 (정답 보기)
                  </button>
                )}

                {/* 🆕 찍기 감지 안내 */}
                {guessingDetected && !isAnswered && (
                  <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-8 w-8 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-amber-800">천천히 다시 생각해볼까? 🤔</p>
                        <p className="text-sm text-amber-600 mt-1">
                          틀려도 괜찮아! 끝까지 생각하는 게 중요해
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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

                {/* 🆕 모르겠어요 버튼 (주관식) */}
                {!isAnswered && (
                  <button
                    onClick={handleDontKnow}
                    className="w-full p-3 rounded-xl font-bold transition-all border-2 border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="h-5 w-5" />
                    모르겠어요 (정답 보기)
                  </button>
                )}

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
