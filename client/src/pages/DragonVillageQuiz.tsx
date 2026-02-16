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
  {
    id: "e9",
    type: "multiple-choice",
    difficulty: "easy",
    category: "속성",
    question: "전기 속성 드래곤의 색깔은 보통 무슨 색일까요?",
    correctAnswer: "노란색",
    options: ["노란색", "빨간색", "파란색", "초록색"],
    hint: "번개의 색깔을 생각해보세요!",
    explanation: "전기 속성 드래곤은 번개처럼 노란색인 경우가 많아요! ⚡",
    points: 5,
    dragonEmoji: "⚡",
  },
  {
    id: "e10",
    type: "true-false",
    difficulty: "easy",
    category: "기본",
    question: "드래곤은 날개가 있으면 하늘을 날 수 있다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "새처럼 날개가 있으면 뭘 할 수 있을까요?",
    explanation: "맞아요! 날개가 있는 드래곤은 하늘을 날 수 있어요! 멋지죠?",
    points: 5,
    dragonEmoji: "🪽",
  },
  {
    id: "e11",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본",
    question: "드래곤 알을 부화시키려면 무엇을 줘야 할까요?",
    correctAnswer: "따뜻한 온기",
    options: ["따뜻한 온기", "찬물", "모래", "바람"],
    hint: "병아리 알도 이걸 줘야 태어나요!",
    explanation: "드래곤 알은 따뜻하게 해줘야 부화해요! 엄마 드래곤이 알을 품어주듯이요.",
    points: 5,
    dragonEmoji: "🥚",
  },
  {
    id: "e12",
    type: "multiple-choice",
    difficulty: "easy",
    category: "음식",
    question: "불 속성 드래곤이 좋아하는 음식은?",
    correctAnswer: "매운 고추",
    options: ["매운 고추", "아이스크림", "물고기", "풀잎"],
    hint: "불처럼 뜨거운 맛이 나는 음식이에요!",
    explanation: "불 속성 드래곤은 매운 음식을 좋아해요! 불을 뿜을 수 있으니까요! 🌶️",
    points: 5,
    dragonEmoji: "🌶️",
  },
  {
    id: "e13",
    type: "short-answer",
    difficulty: "easy",
    category: "기본",
    question: "드래곤이 입에서 불을 뿜는 것을 뭐라고 할까요?",
    correctAnswer: "브레스",
    acceptableAnswers: ["브레스", "불 뿜기", "화염", "불", "파이어 브레스", "화염 브레스"],
    hint: "영어로 '숨'을 뜻하는 단어예요!",
    explanation: "드래곤이 입에서 불을 뿜는 것을 브레스(Breath)라고 해요!",
    points: 8,
    dragonEmoji: "🔥",
  },
  {
    id: "e14",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본",
    question: "아기 드래곤이 처음 태어났을 때 레벨은?",
    correctAnswer: "1레벨",
    options: ["1레벨", "10레벨", "50레벨", "100레벨"],
    hint: "처음 시작할 때는 가장 낮은 숫자부터 시작해요!",
    explanation: "아기 드래곤은 1레벨부터 시작해서 열심히 키워야 강해져요!",
    points: 5,
    dragonEmoji: "🐣",
  },
  {
    id: "e15",
    type: "true-false",
    difficulty: "easy",
    category: "기본",
    question: "물 속성 드래곤은 물속에서 숨을 쉴 수 있다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "물고기처럼 물에서 살 수 있을까요?",
    explanation: "맞아요! 물 속성 드래곤은 물속에서 자유롭게 숨 쉬며 살 수 있어요!",
    points: 5,
    dragonEmoji: "💧",
  },
  {
    id: "e16",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본",
    question: "드래곤 빌리지에서 드래곤을 치료하는 곳은?",
    correctAnswer: "치료소",
    options: ["치료소", "상점", "경기장", "학교"],
    hint: "아픈 드래곤을 낫게 해주는 곳이에요!",
    explanation: "다친 드래곤은 치료소에서 건강하게 회복할 수 있어요!",
    points: 5,
    dragonEmoji: "🏥",
  },
  {
    id: "e17",
    type: "multiple-choice",
    difficulty: "easy",
    category: "속성",
    question: "얼음 속성 드래곤이 사는 곳은?",
    correctAnswer: "눈 덮인 산",
    options: ["눈 덮인 산", "화산", "바다 밑", "숲속"],
    hint: "춥고 하얀 곳을 좋아해요!",
    explanation: "얼음 속성 드래곤은 눈과 얼음이 많은 추운 산에서 살아요! ❄️",
    points: 5,
    dragonEmoji: "❄️",
  },
  {
    id: "e18",
    type: "true-false",
    difficulty: "easy",
    category: "음식",
    question: "드래곤은 밥을 먹지 않아도 강해질 수 있다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "우리도 밥을 먹어야 힘이 나죠?",
    explanation: "틀려요! 드래곤도 음식을 먹어야 건강하고 강해질 수 있어요!",
    points: 5,
    dragonEmoji: "🍖",
  },
  {
    id: "e19",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본",
    question: "드래곤의 몸에서 가장 단단한 부분은?",
    correctAnswer: "비늘",
    options: ["비늘", "꼬리", "날개", "눈"],
    hint: "물고기에게도 있는 것이에요!",
    explanation: "드래곤의 비늘은 갑옷처럼 단단해서 드래곤을 보호해줘요!",
    points: 5,
    dragonEmoji: "🛡️",
  },
  {
    id: "e20",
    type: "multiple-choice",
    difficulty: "easy",
    category: "속성",
    question: "풀 속성 드래곤이 사는 곳은?",
    correctAnswer: "깊은 숲속",
    options: ["깊은 숲속", "화산", "바다", "사막"],
    hint: "나무와 풀이 많은 곳이에요!",
    explanation: "풀 속성 드래곤은 나무와 꽃이 많은 깊은 숲속에서 살아요! 🌿",
    points: 5,
    dragonEmoji: "🌲",
  },
  {
    id: "e21",
    type: "short-answer",
    difficulty: "easy",
    category: "기본",
    question: "드래곤의 머리 위에 있는 뾰족한 것을 뭐라고 할까요?",
    correctAnswer: "뿔",
    acceptableAnswers: ["뿔", "뿔이", "혼", "각"],
    hint: "소에게도 있는 것이에요!",
    explanation: "드래곤 머리에 있는 뾰족한 것은 뿔이에요! 멋진 장식이기도 하죠.",
    points: 8,
    dragonEmoji: "🦕",
  },
  {
    id: "e22",
    type: "multiple-choice",
    difficulty: "easy",
    category: "속성",
    question: "불 속성 드래곤이 사는 곳은?",
    correctAnswer: "화산",
    options: ["화산", "바다", "숲속", "얼음 동굴"],
    hint: "뜨겁고 용암이 나오는 곳이에요!",
    explanation: "불 속성 드래곤은 뜨거운 화산 근처에서 살아요! 🌋",
    points: 5,
    dragonEmoji: "🌋",
  },
  {
    id: "e23",
    type: "true-false",
    difficulty: "easy",
    category: "기본",
    question: "모든 드래곤은 불을 뿜을 수 있다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "물 속성 드래곤도 불을 뿜을까요?",
    explanation: "틀려요! 속성에 따라 다른 것을 뿜어요. 물 드래곤은 물을, 얼음 드래곤은 얼음을 뿜어요!",
    points: 5,
    dragonEmoji: "🐉",
  },
  {
    id: "e24",
    type: "multiple-choice",
    difficulty: "easy",
    category: "음식",
    question: "물 속성 드래곤이 좋아하는 음식은?",
    correctAnswer: "신선한 물고기",
    options: ["신선한 물고기", "매운 고추", "돌멩이", "나뭇잎"],
    hint: "바다에서 사는 맛있는 것이에요!",
    explanation: "물 속성 드래곤은 물에서 잡은 신선한 물고기를 좋아해요! 🐟",
    points: 5,
    dragonEmoji: "🐟",
  },
  {
    id: "e25",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본",
    question: "드래곤 빌리지에서 물건을 살 수 있는 곳은?",
    correctAnswer: "상점",
    options: ["상점", "치료소", "알 부화장", "경기장"],
    hint: "돈을 내고 물건을 사는 곳이에요!",
    explanation: "상점에서 드래곤에게 필요한 여러 가지 물건을 살 수 있어요!",
    points: 5,
    dragonEmoji: "🏪",
  },
  {
    id: "e26",
    type: "true-false",
    difficulty: "easy",
    category: "속성",
    question: "바람 속성 드래곤은 빠르게 날 수 있다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "바람처럼 빠를까요, 느릴까요?",
    explanation: "맞아요! 바람 속성 드래곤은 바람을 타고 아주 빠르게 날 수 있어요! 🌪️",
    points: 5,
    dragonEmoji: "🌪️",
  },
  {
    id: "e27",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본",
    question: "드래곤끼리 친해지려면 무엇을 해야 할까요?",
    correctAnswer: "함께 놀아주기",
    options: ["함께 놀아주기", "싸우기", "무시하기", "잠자기"],
    hint: "친구와 사이좋게 지내려면 뭘 하면 좋을까요?",
    explanation: "드래곤도 함께 놀아주면 친밀도가 올라가요! 친구처럼요!",
    points: 5,
    dragonEmoji: "🤝",
  },
  {
    id: "e28",
    type: "short-answer",
    difficulty: "easy",
    category: "속성",
    question: "번개를 뿜는 드래곤은 무슨 속성일까요?",
    correctAnswer: "전기",
    acceptableAnswers: ["전기", "전기 속성", "번개", "라이트닝", "썬더"],
    hint: "번쩍번쩍! 전구에도 이것이 필요해요!",
    explanation: "번개를 뿜는 드래곤은 전기 속성이에요! ⚡",
    points: 8,
    dragonEmoji: "⚡",
  },
  {
    id: "e29",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본",
    question: "드래곤의 크기가 커지려면 무엇을 해야 할까요?",
    correctAnswer: "레벨을 올린다",
    options: ["레벨을 올린다", "잠을 잔다", "노래를 부른다", "도망간다"],
    hint: "경험치를 모아서 하는 것이에요!",
    explanation: "드래곤은 레벨이 올라가면 점점 더 크고 강해져요!",
    points: 5,
    dragonEmoji: "📈",
  },
  {
    id: "e30",
    type: "true-false",
    difficulty: "easy",
    category: "기본",
    question: "어둠 속성 드래곤은 낮보다 밤에 더 강하다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "어둠은 밤에 어떻게 될까요?",
    explanation: "맞아요! 어둠 속성 드래곤은 밤이 되면 힘이 더 강해져요! 🌙",
    points: 5,
    dragonEmoji: "🌙",
  },
  {
    id: "e31",
    type: "multiple-choice",
    difficulty: "easy",
    category: "음식",
    question: "풀 속성 드래곤이 좋아하는 음식은?",
    correctAnswer: "달콤한 열매",
    options: ["달콤한 열매", "불고기", "생선", "돌멩이"],
    hint: "나무에서 열리는 맛있는 것이에요!",
    explanation: "풀 속성 드래곤은 나무에서 열리는 달콤한 열매를 좋아해요! 🍎",
    points: 5,
    dragonEmoji: "🍎",
  },
  {
    id: "e32",
    type: "multiple-choice",
    difficulty: "easy",
    category: "기본",
    question: "드래곤이 잠을 자는 곳은?",
    correctAnswer: "둥지",
    options: ["둥지", "학교", "상점", "경기장"],
    hint: "새도 여기서 잠을 자요!",
    explanation: "드래곤은 편안한 둥지에서 잠을 자면서 에너지를 회복해요!",
    points: 5,
    dragonEmoji: "🪺",
  },
  {
    id: "e33",
    type: "multiple-choice",
    difficulty: "easy",
    category: "속성",
    question: "독 속성 드래곤의 공격을 맞으면 어떻게 될까요?",
    correctAnswer: "중독 상태가 된다",
    options: ["중독 상태가 된다", "얼어붙는다", "잠이 온다", "배가 고파진다"],
    hint: "독에 맞으면 몸이 어떻게 될까요?",
    explanation: "독 속성 드래곤의 공격을 맞으면 중독이 되어 계속 피해를 받아요! ☠️",
    points: 5,
    dragonEmoji: "☠️",
  },
  {
    id: "e34",
    type: "true-false",
    difficulty: "easy",
    category: "기본",
    question: "빛 속성 드래곤은 어두운 곳을 밝힐 수 있다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "전등처럼 빛을 낼 수 있을까요?",
    explanation: "맞아요! 빛 속성 드래곤은 몸에서 빛을 내서 어두운 곳을 환하게 밝힐 수 있어요! ☀️",
    points: 5,
    dragonEmoji: "💡",
  },
  {
    id: "e35",
    type: "short-answer",
    difficulty: "easy",
    category: "기본",
    question: "드래곤이 하늘을 날 때 사용하는 신체 부위는?",
    correctAnswer: "날개",
    acceptableAnswers: ["날개", "날개들", "양 날개", "두 날개"],
    hint: "새도 이것으로 하늘을 날아요!",
    explanation: "드래곤은 커다란 날개를 펼쳐서 하늘을 자유롭게 날아다녀요!",
    points: 8,
    dragonEmoji: "🦅",
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
  {
    id: "m9",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성조합",
    question: "불 + 물 속성을 합치면 어떤 속성 드래곤이 태어날까요?",
    correctAnswer: "증기",
    options: ["증기", "얼음", "풀", "전기"],
    hint: "뜨거운 물에서 나오는 김을 생각해보세요!",
    explanation: "불과 물이 만나면 증기(스팀)가 돼요! 증기 드래곤은 뜨거운 김을 뿜어요!",
    points: 8,
    dragonEmoji: "♨️",
  },
  {
    id: "m10",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성조합",
    question: "불 + 땅 속성을 합치면 어떤 속성 드래곤이 태어날까요?",
    correctAnswer: "용암",
    options: ["용암", "얼음", "바람", "물"],
    hint: "화산에서 흘러나오는 뜨거운 것이에요!",
    explanation: "불과 땅이 만나면 용암 드래곤이 태어나요! 마그마처럼 뜨거워요! 🌋",
    points: 8,
    dragonEmoji: "🌋",
  },
  {
    id: "m11",
    type: "multiple-choice",
    difficulty: "medium",
    category: "진화",
    question: "드래곤이 진화하려면 보통 몇 단계를 거칠까요?",
    correctAnswer: "3단계",
    options: ["3단계", "1단계", "5단계", "10단계"],
    hint: "아기 → 어른 → 최종! 손가락으로 세어보세요!",
    explanation: "보통 드래곤은 아기 → 성장 → 최종 진화의 3단계를 거쳐요!",
    points: 8,
    dragonEmoji: "🔄",
  },
  {
    id: "m12",
    type: "true-false",
    difficulty: "medium",
    category: "배틀",
    question: "배틀에서 레벨이 높은 드래곤이 항상 이긴다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "속성 상성도 중요하다고 했죠?",
    explanation: "틀려요! 레벨이 낮아도 속성 상성이 유리하면 이길 수 있어요! 전략이 중요해요!",
    points: 8,
    dragonEmoji: "🧠",
  },
  {
    id: "m13",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "독 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "풀",
    options: ["풀", "강철", "불", "물"],
    hint: "독약을 뿌리면 식물이 어떻게 될까요?",
    explanation: "독 속성은 풀 속성에게 강해요! 독이 식물을 시들게 해요! ☠️ > 🌿",
    points: 8,
    dragonEmoji: "☠️",
  },
  {
    id: "m14",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "강철 속성 드래곤이 강한 상대 속성은?",
    correctAnswer: "얼음",
    options: ["얼음", "불", "물", "전기"],
    hint: "단단한 금속은 차가운 것을 깨뜨릴 수 있어요!",
    explanation: "강철 속성은 얼음 속성에게 강해요! 단단한 강철로 얼음을 부숴요! 🔩 > ❄️",
    points: 8,
    dragonEmoji: "🔩",
  },
  {
    id: "m15",
    type: "short-answer",
    difficulty: "medium",
    category: "배틀",
    question: "여러 명이 함께 강한 드래곤을 잡는 것을 뭐라고 할까요?",
    correctAnswer: "레이드",
    acceptableAnswers: ["레이드", "레이드 배틀", "공동전투", "함께싸우기", "협동전투"],
    hint: "영어로 '습격'이라는 뜻이에요!",
    explanation: "여러 명이 모여서 강한 보스 드래곤을 잡는 것을 레이드라고 해요!",
    points: 10,
    dragonEmoji: "👥",
  },
  {
    id: "m16",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성조합",
    question: "얼음 + 바람 속성을 합치면 어떤 속성 드래곤이 태어날까요?",
    correctAnswer: "눈보라",
    options: ["눈보라", "비", "천둥", "안개"],
    hint: "겨울에 바람이 세게 불면서 눈이 오면?",
    explanation: "얼음과 바람이 만나면 눈보라 드래곤이 태어나요! 차가운 눈바람을 일으켜요!",
    points: 8,
    dragonEmoji: "🌨️",
  },
  {
    id: "m17",
    type: "multiple-choice",
    difficulty: "medium",
    category: "진화",
    question: "드래곤을 진화시키려면 레벨 외에 무엇이 더 필요할까요?",
    correctAnswer: "진화석",
    options: ["진화석", "골드만", "다른 드래곤", "물약"],
    hint: "특별한 돌이 필요해요!",
    explanation: "드래곤을 진화시키려면 레벨도 올리고 진화석도 모아야 해요!",
    points: 8,
    dragonEmoji: "💎",
  },
  {
    id: "m18",
    type: "true-false",
    difficulty: "medium",
    category: "기본",
    question: "같은 속성의 드래곤끼리 교배하면 같은 속성 아기가 태어난다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "빨간색 + 빨간색 = ?",
    explanation: "맞아요! 같은 속성끼리 교배하면 같은 속성의 아기 드래곤이 태어나요!",
    points: 8,
    dragonEmoji: "🥚",
  },
  {
    id: "m19",
    type: "multiple-choice",
    difficulty: "medium",
    category: "아이템",
    question: "드래곤의 체력(HP)을 회복하는 아이템은?",
    correctAnswer: "회복 물약",
    options: ["회복 물약", "공격 부적", "방어 갑옷", "스피드 신발"],
    hint: "아플 때 먹는 약을 생각해보세요!",
    explanation: "회복 물약을 사용하면 드래곤의 체력을 회복할 수 있어요!",
    points: 8,
    dragonEmoji: "🧪",
  },
  {
    id: "m20",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성조합",
    question: "전기 + 물 속성을 합치면 어떤 속성 드래곤이 태어날까요?",
    correctAnswer: "폭풍",
    options: ["폭풍", "무지개", "얼음", "풀"],
    hint: "비가 오면서 번개가 치면?",
    explanation: "전기와 물이 만나면 폭풍 드래곤이 태어나요! 천둥번개를 동반한 비를 내려요! ⛈️",
    points: 8,
    dragonEmoji: "⛈️",
  },
  {
    id: "m21",
    type: "short-answer",
    difficulty: "medium",
    category: "배틀",
    question: "배틀에서 드래곤이 사용하는 특별한 공격을 뭐라고 할까요?",
    correctAnswer: "스킬",
    acceptableAnswers: ["스킬", "기술", "스킬 공격", "특수 공격", "필살기"],
    hint: "영어로 '기술'이라는 뜻이에요!",
    explanation: "드래곤의 특별한 공격을 스킬이라고 해요! 속성에 따라 다양한 스킬이 있답니다.",
    points: 10,
    dragonEmoji: "💥",
  },
  {
    id: "m22",
    type: "multiple-choice",
    difficulty: "medium",
    category: "희귀도",
    question: "드래곤 등급 순서가 맞는 것은?",
    correctAnswer: "노말 → 레어 → 에픽 → 레전드",
    options: ["노말 → 레어 → 에픽 → 레전드", "레어 → 노말 → 에픽 → 레전드", "노말 → 에픽 → 레어 → 레전드", "레전드 → 에픽 → 레어 → 노말"],
    hint: "가장 흔한 것부터 가장 희귀한 것 순서예요!",
    explanation: "드래곤 등급은 노말 → 레어 → 에픽 → 레전드 순서로 점점 희귀해져요!",
    points: 8,
    dragonEmoji: "📊",
  },
  {
    id: "m23",
    type: "multiple-choice",
    difficulty: "medium",
    category: "배틀",
    question: "배틀에서 드래곤을 최대 몇 마리까지 팀에 넣을 수 있을까요?",
    correctAnswer: "3마리",
    options: ["3마리", "1마리", "5마리", "10마리"],
    hint: "너무 많으면 안 되고, 너무 적으면 약해요!",
    explanation: "보통 배틀에서는 3마리의 드래곤으로 팀을 구성해요!",
    points: 8,
    dragonEmoji: "🐲",
  },
  {
    id: "m24",
    type: "true-false",
    difficulty: "medium",
    category: "아이템",
    question: "장비를 착용하면 드래곤이 더 강해진다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "기사가 갑옷을 입으면 어떻게 될까요?",
    explanation: "맞아요! 무기, 갑옷 같은 장비를 착용하면 드래곤의 능력치가 올라가요!",
    points: 8,
    dragonEmoji: "⚔️",
  },
  {
    id: "m25",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "얼음 속성 드래곤이 약한 상대 속성은?",
    correctAnswer: "불",
    options: ["불", "물", "풀", "바람"],
    hint: "얼음을 녹이는 것이 뭘까요?",
    explanation: "얼음 속성은 불 속성에게 약해요! 뜨거운 불이 얼음을 녹여요! 🔥 > ❄️",
    points: 8,
    dragonEmoji: "❄️",
  },
  {
    id: "m26",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성조합",
    question: "빛 + 어둠 속성을 합치면 어떤 속성 드래곤이 태어날까요?",
    correctAnswer: "혼돈",
    options: ["혼돈", "무지개", "중립", "투명"],
    hint: "빛과 어둠이 동시에 있으면 세상이 어떻게 될까요?",
    explanation: "빛과 어둠이 만나면 혼돈(카오스) 드래곤이 태어나요! 매우 강력하답니다!",
    points: 10,
    dragonEmoji: "🌀",
  },
  {
    id: "m27",
    type: "short-answer",
    difficulty: "medium",
    category: "기본",
    question: "드래곤 빌리지에서 같이 모험하는 친구들의 모임을 뭐라고 할까요?",
    correctAnswer: "길드",
    acceptableAnswers: ["길드", "클랜", "팀", "동맹", "파티"],
    hint: "온라인 게임에서 같이 노는 그룹을 뭐라고 할까요?",
    explanation: "드래곤 빌리지에서 친구들과 함께 모험하는 모임을 길드라고 해요!",
    points: 10,
    dragonEmoji: "🏰",
  },
  {
    id: "m28",
    type: "multiple-choice",
    difficulty: "medium",
    category: "배틀",
    question: "배틀에서 먼저 공격하는 드래곤은 어떤 능력치가 높을까요?",
    correctAnswer: "속도",
    options: ["속도", "공격력", "방어력", "체력"],
    hint: "빠른 드래곤이 먼저 움직여요!",
    explanation: "속도가 높은 드래곤이 배틀에서 먼저 공격할 수 있어요! 속도는 매우 중요해요!",
    points: 8,
    dragonEmoji: "💨",
  },
  {
    id: "m29",
    type: "true-false",
    difficulty: "medium",
    category: "진화",
    question: "진화한 드래곤은 다시 이전 모습으로 돌아갈 수 없다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "나비가 다시 애벌레로 돌아갈 수 있을까요?",
    explanation: "맞아요! 한 번 진화한 드래곤은 이전 모습으로 돌아갈 수 없어요!",
    points: 8,
    dragonEmoji: "🦋",
  },
  {
    id: "m30",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "땅 속성 드래곤이 약한 상대 속성은?",
    correctAnswer: "풀",
    options: ["풀", "불", "전기", "바람"],
    hint: "땅에서 자라는 것이 뭘까요?",
    explanation: "땅 속성은 풀 속성에게 약해요! 풀이 땅을 뚫고 자라니까요! 🌿 > 🏔️",
    points: 8,
    dragonEmoji: "🏔️",
  },
  {
    id: "m31",
    type: "multiple-choice",
    difficulty: "medium",
    category: "아이템",
    question: "드래곤의 공격력을 높이는 장비는?",
    correctAnswer: "공격 발톱",
    options: ["공격 발톱", "방어 갑옷", "속도 날개", "회복 목걸이"],
    hint: "드래곤이 발로 공격할 때 사용하는 것이에요!",
    explanation: "공격 발톱을 장착하면 드래곤의 공격력이 올라가요!",
    points: 8,
    dragonEmoji: "🦅",
  },
  {
    id: "m32",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성조합",
    question: "풀 + 독 속성을 합치면 어떤 속성 드래곤이 태어날까요?",
    correctAnswer: "독꽃",
    options: ["독꽃", "숲", "바다", "화산"],
    hint: "독을 가진 예쁜 식물을 생각해보세요!",
    explanation: "풀과 독이 만나면 독꽃 드래곤이 태어나요! 아름답지만 위험한 독꽃을 사용해요!",
    points: 8,
    dragonEmoji: "🌺",
  },
  {
    id: "m33",
    type: "true-false",
    difficulty: "medium",
    category: "배틀",
    question: "방어력이 높은 드래곤은 받는 피해가 적다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "갑옷을 입으면 덜 아프겠죠?",
    explanation: "맞아요! 방어력이 높으면 상대의 공격을 받아도 피해가 적어요!",
    points: 8,
    dragonEmoji: "🛡️",
  },
  {
    id: "m34",
    type: "multiple-choice",
    difficulty: "medium",
    category: "기본",
    question: "드래곤 빌리지에서 드래곤을 교배하는 곳은?",
    correctAnswer: "교배소",
    options: ["교배소", "상점", "경기장", "학교"],
    hint: "두 드래곤을 만나게 해서 알을 얻는 곳이에요!",
    explanation: "교배소에서 두 드래곤을 만나게 하면 새로운 알을 얻을 수 있어요!",
    points: 8,
    dragonEmoji: "💕",
  },
  {
    id: "m35",
    type: "short-answer",
    difficulty: "medium",
    category: "배틀",
    question: "드래곤의 공격력, 방어력, 속도 같은 것들을 뭐라고 할까요?",
    correctAnswer: "스탯",
    acceptableAnswers: ["스탯", "능력치", "스테이터스", "능력", "스텟"],
    hint: "영어로 '통계'라는 뜻이에요!",
    explanation: "드래곤의 공격력, 방어력, 속도 같은 수치를 스탯(능력치)이라고 해요!",
    points: 10,
    dragonEmoji: "📊",
  },
  {
    id: "m36",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성",
    question: "전기 속성 드래곤이 약한 상대 속성은?",
    correctAnswer: "땅",
    options: ["땅", "물", "바람", "풀"],
    hint: "전기를 땅에 흘리면 어떻게 될까요?",
    explanation: "전기 속성은 땅 속성에게 약해요! 땅이 전기를 흡수해버려요! 🏔️ > ⚡",
    points: 8,
    dragonEmoji: "⚡",
  },
  {
    id: "m37",
    type: "multiple-choice",
    difficulty: "medium",
    category: "속성조합",
    question: "불 + 바람 속성을 합치면 어떤 속성 드래곤이 태어날까요?",
    correctAnswer: "화염폭풍",
    options: ["화염폭풍", "눈보라", "안개", "무지개"],
    hint: "불에 바람이 불면 불이 더 세지겠죠?",
    explanation: "불과 바람이 만나면 화염폭풍 드래곤이 태어나요! 불 폭풍을 일으켜요! 🔥🌪️",
    points: 8,
    dragonEmoji: "🔥",
  },
  {
    id: "m38",
    type: "true-false",
    difficulty: "medium",
    category: "진화",
    question: "모든 드래곤은 진화할 수 있다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "레전드 드래곤은 이미 최강인데 더 진화할까요?",
    explanation: "틀려요! 일부 특별한 드래곤은 진화하지 않아요. 이미 완성된 형태인 드래곤도 있답니다!",
    points: 8,
    dragonEmoji: "🐉",
  },
  {
    id: "m39",
    type: "multiple-choice",
    difficulty: "medium",
    category: "아이템",
    question: "드래곤의 속도를 높이는 장비는?",
    correctAnswer: "속도 날개",
    options: ["속도 날개", "공격 발톱", "방어 갑옷", "회복 목걸이"],
    hint: "빨리 날고 싶으면 뭘 달면 좋을까요?",
    explanation: "속도 날개를 장착하면 드래곤이 더 빠르게 움직일 수 있어요!",
    points: 8,
    dragonEmoji: "💨",
  },
  {
    id: "m40",
    type: "short-answer",
    difficulty: "medium",
    category: "기본",
    question: "드래곤을 키우면서 먹이를 주고 돌보는 것을 뭐라고 할까요?",
    correctAnswer: "육성",
    acceptableAnswers: ["육성", "육성하기", "키우기", "양육", "사육", "돌보기"],
    hint: "아이를 키우는 것처럼 드래곤을 키우는 것이에요!",
    explanation: "드래곤에게 먹이를 주고 돌봐주면서 키우는 것을 육성이라고 해요!",
    points: 10,
    dragonEmoji: "🍼",
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
  {
    id: "h9",
    type: "multiple-choice",
    difficulty: "hard",
    category: "속성조합",
    question: "불 + 얼음 속성의 듀얼 드래곤은 어떤 특별한 능력이 있을까요?",
    correctAnswer: "온도를 자유롭게 조절한다",
    options: ["온도를 자유롭게 조절한다", "물만 뿜는다", "바람만 뿜는다", "돌을 던진다"],
    hint: "뜨거운 것과 차가운 것을 둘 다 쓸 수 있다면?",
    explanation: "불+얼음 듀얼 드래곤은 뜨거운 불과 차가운 얼음 둘 다 사용할 수 있어서 온도를 자유롭게 조절해요!",
    points: 12,
    dragonEmoji: "🔥❄️",
  },
  {
    id: "h10",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전략",
    question: "상대가 불 속성 드래곤을 내보냈을 때, 가장 좋은 전략은?",
    correctAnswer: "물 속성 드래곤으로 교체한다",
    options: ["물 속성 드래곤으로 교체한다", "풀 속성 드래곤으로 교체한다", "불 속성 드래곤으로 싸운다", "그냥 도망간다"],
    hint: "속성 상성을 생각해보세요! 불에게 강한 것은?",
    explanation: "불 속성에게는 물 속성이 유리해요! 상성을 활용하는 것이 최고의 전략이에요!",
    points: 12,
    dragonEmoji: "🧠",
  },
  {
    id: "h11",
    type: "short-answer",
    difficulty: "hard",
    category: "전설",
    question: "드래곤 빌리지의 세계를 만들었다고 전해지는 전설의 드래곤 종류는?",
    correctAnswer: "창조",
    acceptableAnswers: ["창조", "창조 드래곤", "창세 드래곤", "시조", "시조 드래곤", "태초"],
    hint: "세상을 만든 드래곤이에요! '만들다'와 비슷한 말이에요.",
    explanation: "드래곤 빌리지의 전설에 따르면, 창조 드래곤이 이 세계를 만들었다고 해요!",
    points: 15,
    dragonEmoji: "🌍",
  },
  {
    id: "h12",
    type: "multiple-choice",
    difficulty: "hard",
    category: "배틀",
    question: "드래곤 배틀에서 '크리티컬 히트'란 무엇일까요?",
    correctAnswer: "보통보다 더 강한 공격",
    options: ["보통보다 더 강한 공격", "공격을 빗나가는 것", "방어하는 것", "도망가는 것"],
    hint: "영어로 '치명적인 타격'이라는 뜻이에요!",
    explanation: "크리티컬 히트는 운이 좋아서 보통보다 더 큰 피해를 주는 강력한 공격이에요!",
    points: 12,
    dragonEmoji: "💥",
  },
  {
    id: "h13",
    type: "true-false",
    difficulty: "hard",
    category: "속성",
    question: "듀얼 속성 드래곤은 약점도 2개가 된다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "속성이 2개면 각 속성의 약점도 있겠죠?",
    explanation: "맞아요! 듀얼 속성 드래곤은 두 속성의 장점도 있지만, 약점도 2개가 될 수 있어요!",
    points: 12,
    dragonEmoji: "🔀",
  },
  {
    id: "h14",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전략",
    question: "배틀에서 3마리 드래곤 팀을 구성할 때 가장 좋은 방법은?",
    correctAnswer: "다양한 속성으로 구성한다",
    options: ["다양한 속성으로 구성한다", "같은 속성으로만 구성한다", "가장 예쁜 것만 고른다", "가장 작은 것만 고른다"],
    hint: "여러 상대에게 대응하려면 어떻게 해야 할까요?",
    explanation: "다양한 속성으로 팀을 구성하면 어떤 상대가 와도 대응할 수 있어요! 이게 최고의 전략이에요!",
    points: 12,
    dragonEmoji: "🎯",
  },
  {
    id: "h15",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전설",
    question: "전설에 따르면 가장 오래된 드래곤은 어디에 살고 있을까요?",
    correctAnswer: "하늘 위 구름 궁전",
    options: ["하늘 위 구름 궁전", "바다 밑", "화산 속", "숲 속 동굴"],
    hint: "가장 높은 곳에 사는 전설의 존재예요!",
    explanation: "가장 오래된 전설의 드래곤은 하늘 높은 곳의 구름 궁전에 산다고 해요! 아무도 쉽게 만날 수 없답니다.",
    points: 12,
    dragonEmoji: "☁️",
  },
  {
    id: "h16",
    type: "short-answer",
    difficulty: "hard",
    category: "배틀",
    question: "배틀에서 상대의 공격을 피하는 것을 뭐라고 할까요?",
    correctAnswer: "회피",
    acceptableAnswers: ["회피", "회피하기", "피하기", "닷지", "도지", "이베이전"],
    hint: "공이 날아올 때 몸을 옆으로 빼는 것처럼요!",
    explanation: "상대의 공격을 피하는 것을 회피라고 해요! 속도가 빠르면 회피율도 높아져요!",
    points: 15,
    dragonEmoji: "💨",
  },
  {
    id: "h17",
    type: "multiple-choice",
    difficulty: "hard",
    category: "속성",
    question: "강철 속성 드래곤이 약한 상대 속성은?",
    correctAnswer: "불",
    options: ["불", "얼음", "바람", "풀"],
    hint: "강철을 녹이려면 무엇이 필요할까요?",
    explanation: "강철 속성은 불 속성에게 약해요! 뜨거운 불이 강철을 녹일 수 있어요! 🔥 > 🔩",
    points: 12,
    dragonEmoji: "🔩",
  },
  {
    id: "h18",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전략",
    question: "레이드 배틀에서 보스 드래곤을 잡으려면 가장 중요한 것은?",
    correctAnswer: "팀원들과 협동하기",
    options: ["팀원들과 협동하기", "혼자서 싸우기", "도망가기", "잠자기"],
    hint: "혼자서는 강한 보스를 이길 수 없어요!",
    explanation: "레이드 배틀에서는 팀원들과 협동하는 것이 가장 중요해요! 함께하면 강한 보스도 이길 수 있어요!",
    points: 12,
    dragonEmoji: "🤝",
  },
  {
    id: "h19",
    type: "true-false",
    difficulty: "hard",
    category: "전략",
    question: "배틀에서 방어만 계속하면 절대 지지 않는다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "공격을 안 하면 이길 수 있을까요?",
    explanation: "틀려요! 방어만 하면 상대를 이길 수 없어요. 적절한 때에 공격도 해야 이길 수 있답니다!",
    points: 12,
    dragonEmoji: "🛡️",
  },
  {
    id: "h20",
    type: "multiple-choice",
    difficulty: "hard",
    category: "속성조합",
    question: "물 + 풀 속성의 듀얼 드래곤은 어떤 환경에서 가장 강할까요?",
    correctAnswer: "늪지대",
    options: ["늪지대", "사막", "화산", "빙하"],
    hint: "물과 풀이 함께 있는 습한 곳을 생각해보세요!",
    explanation: "물+풀 듀얼 드래곤은 물과 식물이 함께 있는 늪지대에서 가장 강해요!",
    points: 12,
    dragonEmoji: "🌿💧",
  },
  {
    id: "h21",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전설",
    question: "전설의 드래곤들을 모두 모으면 어떤 일이 일어난다고 할까요?",
    correctAnswer: "소원을 이루어준다",
    options: ["소원을 이루어준다", "세상이 멸망한다", "아무 일도 없다", "드래곤이 사라진다"],
    hint: "여러 마리의 전설의 드래곤이 모이면 특별한 일이 생겨요!",
    explanation: "전설에 따르면, 모든 전설의 드래곤을 모으면 한 가지 소원을 이루어준다고 해요!",
    points: 15,
    dragonEmoji: "⭐",
  },
  {
    id: "h22",
    type: "short-answer",
    difficulty: "hard",
    category: "배틀",
    question: "배틀에서 드래곤의 체력, 공격력, 방어력, 속도를 합쳐서 부르는 말은?",
    correctAnswer: "전투력",
    acceptableAnswers: ["전투력", "CP", "컴뱃파워", "총 스탯", "총스탯", "전투 능력"],
    hint: "드래곤이 얼마나 강한지 한 숫자로 나타내요!",
    explanation: "드래곤의 모든 능력치를 합친 것을 전투력이라고 해요! 전투력이 높을수록 강한 드래곤이에요!",
    points: 15,
    dragonEmoji: "💪",
  },
  {
    id: "h23",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전략",
    question: "상대 드래곤의 속성을 모를 때 가장 안전한 선택은?",
    correctAnswer: "노말 속성 드래곤을 내보낸다",
    options: ["노말 속성 드래곤을 내보낸다", "불 속성 드래곤을 내보낸다", "그냥 포기한다", "무조건 공격한다"],
    hint: "약점이 적은 속성을 생각해보세요!",
    explanation: "노말 속성은 특별히 약한 속성이 적어서, 상대를 모를 때 안전한 선택이에요!",
    points: 12,
    dragonEmoji: "⚪",
  },
  {
    id: "h24",
    type: "true-false",
    difficulty: "hard",
    category: "교배",
    question: "서로 다른 속성의 드래곤을 교배하면 듀얼 속성 드래곤이 태어날 수 있다. (O/X)",
    correctAnswer: "O",
    options: ["O", "X"],
    hint: "불 드래곤 + 물 드래곤 = ?",
    explanation: "맞아요! 서로 다른 속성의 드래곤을 교배하면 두 속성을 모두 가진 듀얼 드래곤이 태어날 수 있어요!",
    points: 12,
    dragonEmoji: "🥚",
  },
  {
    id: "h25",
    type: "multiple-choice",
    difficulty: "hard",
    category: "속성",
    question: "독 속성 드래곤이 약한 상대 속성은?",
    correctAnswer: "강철",
    options: ["강철", "풀", "물", "바람"],
    hint: "독이 통하지 않는 단단한 것을 생각해보세요!",
    explanation: "독 속성은 강철 속성에게 약해요! 금속은 독에 영향을 받지 않거든요!",
    points: 12,
    dragonEmoji: "☠️",
  },
  {
    id: "h26",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전략",
    question: "배틀에서 드래곤의 스킬을 쓰려면 무엇이 필요할까요?",
    correctAnswer: "마나(MP)",
    options: ["마나(MP)", "금화", "경험치", "레벨"],
    hint: "마법을 사용하는 에너지를 생각해보세요!",
    explanation: "스킬을 사용하려면 마나(MP)가 필요해요! 마나가 없으면 스킬을 쓸 수 없답니다.",
    points: 12,
    dragonEmoji: "🔮",
  },
  {
    id: "h27",
    type: "short-answer",
    difficulty: "hard",
    category: "전설",
    question: "동양 전설에서 드래곤(용)이 물과 비를 다스린다고 하는데, 이런 드래곤을 뭐라고 할까요?",
    correctAnswer: "수룡",
    acceptableAnswers: ["수룡", "물 드래곤", "워터 드래곤", "해룡", "용왕", "비의 용"],
    hint: "물을 뜻하는 한자 '수(水)'를 사용해요!",
    explanation: "동양 전설에서 물과 비를 다스리는 용을 수룡이라고 해요! 바다와 강을 지배한답니다.",
    points: 15,
    dragonEmoji: "🌊",
  },
  {
    id: "h28",
    type: "multiple-choice",
    difficulty: "hard",
    category: "속성조합",
    question: "전기 + 강철 속성의 듀얼 드래곤은 어떤 특별한 능력이 있을까요?",
    correctAnswer: "자기장을 만든다",
    options: ["자기장을 만든다", "물을 끓인다", "나무를 키운다", "바람을 일으킨다"],
    hint: "자석은 전기와 금속으로 만들어져요!",
    explanation: "전기+강철 듀얼 드래곤은 강력한 자기장을 만들어서 금속을 끌어당기거나 밀어낼 수 있어요!",
    points: 12,
    dragonEmoji: "🧲",
  },
  {
    id: "h29",
    type: "true-false",
    difficulty: "hard",
    category: "교배",
    question: "교배로 태어나는 드래곤의 속성은 항상 부모와 같다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "가끔 특별한 돌연변이가 나올 수도 있어요!",
    explanation: "틀려요! 교배로 태어나는 드래곤은 부모와 다른 새로운 속성이 나올 수도 있어요! 이것을 돌연변이라고 해요!",
    points: 12,
    dragonEmoji: "🧬",
  },
  {
    id: "h30",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전략",
    question: "드래곤 배틀에서 '버프'란 무엇일까요?",
    correctAnswer: "드래곤의 능력을 일시적으로 높이는 것",
    options: ["드래곤의 능력을 일시적으로 높이는 것", "드래곤을 잠재우는 것", "드래곤을 치료하는 것", "드래곤을 진화시키는 것"],
    hint: "드래곤이 잠깐 동안 더 강해지는 것이에요!",
    explanation: "버프는 드래곤의 공격력, 방어력 같은 능력을 잠깐 동안 높여주는 것이에요!",
    points: 12,
    dragonEmoji: "⬆️",
  },
  {
    id: "h31",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전략",
    question: "'디버프'는 무엇일까요?",
    correctAnswer: "상대 드래곤의 능력을 낮추는 것",
    options: ["상대 드래곤의 능력을 낮추는 것", "내 드래곤을 강화하는 것", "도망가는 것", "잠자는 것"],
    hint: "버프의 반대예요! 상대를 약하게 만드는 것!",
    explanation: "디버프는 상대 드래곤의 능력을 일시적으로 낮추는 것이에요! 버프의 반대말이에요!",
    points: 12,
    dragonEmoji: "⬇️",
  },
  {
    id: "h32",
    type: "short-answer",
    difficulty: "hard",
    category: "전략",
    question: "배틀에서 유리한 속성으로 공격하는 것을 뭐라고 할까요?",
    correctAnswer: "상성",
    acceptableAnswers: ["상성", "속성 상성", "타입 상성", "유리한 속성", "속성 유리"],
    hint: "가위바위보처럼 이기는 관계를 뜻하는 말이에요!",
    explanation: "배틀에서 유리한 속성으로 공격하는 것을 상성이라고 해요! 상성을 잘 활용하면 배틀의 달인!",
    points: 15,
    dragonEmoji: "🎯",
  },
  {
    id: "h33",
    type: "multiple-choice",
    difficulty: "hard",
    category: "전설",
    question: "서양 전설에서 드래곤이 지키고 있는 것은 무엇일까요?",
    correctAnswer: "보물",
    options: ["보물", "음식", "물", "신발"],
    hint: "반짝반짝 빛나는 금화와 보석이에요!",
    explanation: "서양 전설에서 드래곤은 동굴 속 보물을 지키는 수호자로 나와요! 금화와 보석으로 가득한 보물이죠!",
    points: 12,
    dragonEmoji: "💰",
  },
  {
    id: "h34",
    type: "true-false",
    difficulty: "hard",
    category: "전략",
    question: "같은 스킬을 연속으로 쓰면 더 강해진다. (O/X)",
    correctAnswer: "X",
    options: ["O", "X"],
    hint: "같은 공격만 계속하면 상대가 대비할 수 있어요!",
    explanation: "틀려요! 같은 스킬만 계속 쓰면 효과가 떨어져요. 다양한 스킬을 번갈아 쓰는 것이 좋아요!",
    points: 12,
    dragonEmoji: "🔄",
  },
  {
    id: "h35",
    type: "multiple-choice",
    difficulty: "hard",
    category: "속성조합",
    question: "빛 + 불 속성의 듀얼 드래곤은 어떤 이름이 어울릴까요?",
    correctAnswer: "태양 드래곤",
    options: ["태양 드래곤", "달 드래곤", "별 드래곤", "구름 드래곤"],
    hint: "하늘에서 빛나면서 뜨거운 것은?",
    explanation: "빛과 불이 합쳐지면 태양처럼 밝고 뜨거운 태양 드래곤이에요! ☀️🔥",
    points: 12,
    dragonEmoji: "☀️",
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

    const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 10).map(q => ({
      ...q,
      options: q.options ? [...q.options].sort(() => Math.random() - 0.5) : q.options,
    }));

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className={`w-full h-auto min-h-16 py-3 px-4 text-base font-bold transition-all rounded-xl flex items-center gap-3 ${
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
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              showResult && isCorrectOption
                                ? "bg-green-600 text-white"
                                : showResult && isSelected && !isCorrectOption
                                ? "bg-red-600 text-white"
                                : "bg-purple-100 text-purple-700"
                            }`}>
                              {index + 1}
                            </span>
                            {showResult && isCorrectOption && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
                            {showResult && isSelected && !isCorrectOption && <XCircle className="h-5 w-5 flex-shrink-0" />}
                            <span className="flex-1 text-left">{option}</span>
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
