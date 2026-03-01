import { useState, useEffect, useRef, useCallback } from "react";
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
  Image,
  Shuffle,
  Link2,
  Clock,
  Swords,
  Shield,
  Gift,
  TrendingUp,
  Medal,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabaseClient";
import {
  englishWordsData,
  wordCategories,
  categoryEmojis,
  type EnglishWord,
  type WordCategory,
  type WordDifficulty,
} from "@/data/englishWordsData";

// ============================================
// 타입 정의
// ============================================
type QuizMode =
  | "multiple-choice" | "typing" | "listening" | "reverse" | "mixed"
  | "picture-match" | "word-scramble" | "word-connect" | "speed-round"
  | "time-attack" | "boss-battle" | "survival";

type GameState = "menu" | "mode-select" | "playing" | "result" | "stats";

interface QuizQuestion {
  word: EnglishWord;
  questionType: QuizMode;
  options?: string[];
  correctAnswer: string;
  scrambledLetters?: string[];
  imageOptions?: string[];
}

interface UserProgress {
  level: number;
  currentXP: number;
  totalXP: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  condition: string;
  earned: boolean;
}

interface DailyMission {
  id: string;
  name: string;
  goal: number;
  current: number;
  reward: number;
  icon: string;
  completed: boolean;
}

// ============================================
// 테마 시스템
// ============================================
const themes = {
  default: {
    name: "기본",
    icon: "🌈",
    primary: "from-blue-500 to-purple-500",
    secondary: "from-blue-100 via-purple-100 to-pink-100",
    card: "border-blue-400",
    accent: "blue",
  },
  pokemon: {
    name: "포켓몬",
    icon: "⚡",
    primary: "from-yellow-400 to-orange-500",
    secondary: "from-yellow-100 via-orange-100 to-red-100",
    card: "border-yellow-400",
    accent: "yellow",
  },
  ocean: {
    name: "바다",
    icon: "🌊",
    primary: "from-cyan-500 to-blue-500",
    secondary: "from-cyan-100 via-blue-100 to-indigo-100",
    card: "border-cyan-400",
    accent: "cyan",
  },
  forest: {
    name: "숲",
    icon: "🌲",
    primary: "from-green-500 to-emerald-500",
    secondary: "from-green-100 via-emerald-100 to-teal-100",
    card: "border-green-400",
    accent: "green",
  },
  candy: {
    name: "캔디",
    icon: "🍬",
    primary: "from-pink-500 to-rose-500",
    secondary: "from-pink-100 via-rose-100 to-red-100",
    card: "border-pink-400",
    accent: "pink",
  },
  space: {
    name: "우주",
    icon: "🚀",
    primary: "from-violet-500 to-purple-600",
    secondary: "from-violet-100 via-purple-100 to-indigo-100",
    card: "border-violet-400",
    accent: "violet",
  },
};

type ThemeKey = keyof typeof themes;

// ============================================
// 배지 정의
// ============================================
const allBadges: Badge[] = [
  { id: "first_quiz", name: "첫 걸음", icon: "👶", condition: "첫 퀴즈 완료", earned: false },
  { id: "perfect_10", name: "완벽주의자", icon: "💯", condition: "10문제 전문 정답", earned: false },
  { id: "streak_5", name: "달리기 시작", icon: "🏃", condition: "5연속 정답", earned: false },
  { id: "streak_10", name: "멈출 수 없어", icon: "🔥", condition: "10연속 정답", earned: false },
  { id: "streak_20", name: "전설의 시작", icon: "⚡", condition: "20연속 정답", earned: false },
  { id: "speed_demon", name: "번개 손", icon: "⚡", condition: "스피드 라운드 20개", earned: false },
  { id: "survivor", name: "서바이버", icon: "🏅", condition: "서바이벌 20문제", earned: false },
  { id: "boss_slayer", name: "보스 슬레이어", icon: "🗡️", condition: "보스 배틀 승리", earned: false },
  { id: "level_10", name: "초보 졸업", icon: "🎓", condition: "레벨 10 달성", earned: false },
  { id: "level_25", name: "중급자", icon: "📚", condition: "레벨 25 달성", earned: false },
  { id: "animal_master", name: "동물 박사", icon: "🦁", condition: "동물 50단어 마스터", earned: false },
  { id: "word_collector", name: "단어 수집가", icon: "📖", condition: "100단어 학습", earned: false },
];

// ============================================
// 게임 모드 정의
// ============================================
const gameModes = [
  { id: "mixed", name: "믹스", icon: <Sparkles className="h-6 w-6" />, desc: "다양한 유형 섞기", color: "purple" },
  { id: "multiple-choice", name: "객관식", icon: <MousePointer className="h-6 w-6" />, desc: "4지선다", color: "blue" },
  { id: "typing", name: "타이핑", icon: <Keyboard className="h-6 w-6" />, desc: "직접 입력", color: "green" },
  { id: "listening", name: "듣기", icon: <Headphones className="h-6 w-6" />, desc: "발음 듣고 맞추기", color: "pink" },
  { id: "reverse", name: "한→영", icon: <BookOpen className="h-6 w-6" />, desc: "영어로 답하기", color: "orange" },
  { id: "picture-match", name: "그림 맞추기", icon: <Image className="h-6 w-6" />, desc: "이모지 매칭", color: "cyan", isNew: true },
  { id: "word-scramble", name: "철자 퍼즐", icon: <Shuffle className="h-6 w-6" />, desc: "섞인 글자 배열", color: "yellow", isNew: true },
  { id: "speed-round", name: "스피드", icon: <Clock className="h-6 w-6" />, desc: "30초 도전", color: "red", isNew: true },
  { id: "time-attack", name: "타임어택", icon: <Timer className="h-6 w-6" />, desc: "최단 시간 도전", color: "amber", isNew: true },
  { id: "boss-battle", name: "보스 배틀", icon: <Swords className="h-6 w-6" />, desc: "포켓몬 보스전", color: "violet", isNew: true },
  { id: "survival", name: "서바이벌", icon: <Shield className="h-6 w-6" />, desc: "틀리면 탈락", color: "slate", isNew: true },
];

// ============================================
// 애니메이션 variants
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

const correctVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 0.5 }
  }
};

const wrongVariants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

const streakVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1, rotate: 0,
    transition: { type: "spring", stiffness: 500, damping: 15 }
  }
};

// ============================================
// 효과음 시스템
// ============================================
const playSound = (type: "correct" | "wrong" | "complete" | "streak" | "levelup" | "click" | "boss") => {
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
    } else if (type === "levelup") {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.25, audioContext.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.12 + 0.3);
        osc.start(audioContext.currentTime + i * 0.12);
        osc.stop(audioContext.currentTime + i * 0.12 + 0.3);
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
    } else if (type === "boss") {
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === "click") {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    }
  } catch (e) {
    // Audio not supported
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

// XP 계산
const calculateXPRequired = (level: number) => Math.floor(100 * Math.pow(1.3, level - 1));

// ============================================
// 단어별 이모지 매핑 (그림 맞추기용)
// ============================================
const wordEmojiMap: Record<string, string> = {
  // 동물
  cat: "🐱", dog: "🐕", bird: "🐦", fish: "🐟", cow: "🐄",
  pig: "🐷", duck: "🦆", hen: "🐔", horse: "🐴", sheep: "🐑",
  rabbit: "🐰", frog: "🐸", bear: "🐻", lion: "🦁", tiger: "🐯",
  monkey: "🐒", elephant: "🐘", mouse: "🐭", snake: "🐍", turtle: "🐢",
  whale: "🐋", dolphin: "🐬", penguin: "🐧", owl: "🦉", bee: "🐝",
  ant: "🐜", butterfly: "🦋", snail: "🐌", shark: "🦈", crab: "🦀",
  octopus: "🐙", fox: "🦊", deer: "🦌", gorilla: "🦍", zebra: "🦓",
  giraffe: "🦒", kangaroo: "🦘", koala: "🐨", panda: "🐼", hamster: "🐹",
  wolf: "🐺", bat: "🦇", eagle: "🦅", parrot: "🦜", swan: "🦢",
  peacock: "🦚", flamingo: "🦩", hedgehog: "🦔", squirrel: "🐿️", camel: "🐫",
  hippo: "🦛", rhino: "🦏", seal: "🦭", otter: "🦦", raccoon: "🦝",
  skunk: "🦨", lobster: "🦞", shrimp: "🦐", jellyfish: "🪼", rooster: "🐓",
  chick: "🐤", goat: "🐐", ram: "🐏", ox: "🐂", bug: "🐛",
  worm: "🪱", scorpion: "🦂", spider: "🕷️", caterpillar: "🐛", cricket: "🦗",
  mosquito: "🦟", fly: "🪰", ladybug: "🐞", dragonfly: "🪰", starfish: "⭐",
  dinosaur: "🦕", crocodile: "🐊", lizard: "🦎", chameleon: "🦎", salamander: "🦎",
  // 음식
  bread: "🍞", rice: "🍚", egg: "🥚", milk: "🥛", water: "💧",
  pizza: "🍕", cake: "🎂", cookie: "🍪", candy: "🍬", chocolate: "🍫",
  cheese: "🧀", butter: "🧈", soup: "🍲", salad: "🥗", sandwich: "🥪",
  hamburger: "🍔", hotdog: "🌭", spaghetti: "🍝", noodle: "🍜", sushi: "🍣",
  taco: "🌮", burrito: "🌯", dumpling: "🥟", pancake: "🥞", waffle: "🧇",
  donut: "🍩", pie: "🥧", popcorn: "🍿", pretzel: "🥨", bagel: "🥯",
  croissant: "🥐", muffin: "🧁", pudding: "🍮", honey: "🍯", jam: "🫙",
  ketchup: "🥫", salt: "🧂", pepper: "🌶️", garlic: "🧄", onion: "🧅",
  potato: "🥔", carrot: "🥕", corn: "🌽", tomato: "🍅", broccoli: "🥦",
  mushroom: "🍄", cucumber: "🥒", lettuce: "🥬", peanut: "🥜", chestnut: "🌰",
  meat: "🥩", chicken: "🍗", bacon: "🥓", steak: "🥩",
  icecream: "🍦", popsicle: "🍦", cupcake: "🧁", brownie: "🍫", cereal: "🥣",
  yogurt: "🥛", juice: "🧃", tea: "🍵", coffee: "☕", lemonade: "🍋",
  // 과일
  apple: "🍎", banana: "🍌", orange: "🍊", grape: "🍇", lemon: "🍋",
  strawberry: "🍓", watermelon: "🍉", peach: "🍑", cherry: "🍒", pineapple: "🍍",
  mango: "🥭", coconut: "🥥", kiwi: "🥝", blueberry: "🫐", avocado: "🥑",
  pear: "🍐", plum: "🍑", melon: "🍈", fig: "🫒", lime: "🍈",
  pomegranate: "🫐", cranberry: "🫐", raspberry: "🫐", blackberry: "🫐", papaya: "🍈",
  guava: "🍈", passionfruit: "🍈", dragonfruit: "🍈", lychee: "🍈", persimmon: "🍊",
  tangerine: "🍊", grapefruit: "🍊", apricot: "🍑", nectarine: "🍑", date: "🫒",
  cantaloupe: "🍈", honeydew: "🍈", jackfruit: "🍈",
  starfruit: "⭐", mulberry: "🫐", gooseberry: "🫐", boysenberry: "🫐", currant: "🫐",
  // 숫자
  one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣", five: "5️⃣",
  six: "6️⃣", seven: "7️⃣", eight: "8️⃣", nine: "9️⃣", ten: "🔟",
  zero: "0️⃣", hundred: "💯", eleven: "1️⃣", twelve: "2️⃣", thirteen: "3️⃣",
  fourteen: "4️⃣", fifteen: "5️⃣", sixteen: "6️⃣", seventeen: "7️⃣", eighteen: "8️⃣",
  nineteen: "9️⃣", twenty: "2️⃣", thirty: "3️⃣", forty: "4️⃣", fifty: "5️⃣",
  first: "🥇", second: "🥈", third: "🥉", last: "🏁", half: "½",
  double: "✌️", triple: "🤟", quarter: "¼", pair: "👫", dozen: "📦",
  million: "🔢", billion: "🔢", thousand: "🔢", once: "☝️", twice: "✌️",
  // 색깔
  red: "🔴", blue: "🔵", yellow: "🟡", green: "🟢", orange: "🟠",
  purple: "🟣", pink: "🩷", white: "⚪", black: "⚫", brown: "🟤",
  gray: "🩶", gold: "🥇", silver: "🥈", rainbow: "🌈", sky: "🔵",
  navy: "🔵", beige: "🟤", ivory: "⚪", coral: "🩷", crimson: "🔴",
  scarlet: "🔴", emerald: "🟢", turquoise: "🔵", violet: "🟣", indigo: "🟣",
  magenta: "🩷", teal: "🟢", maroon: "🟤", olive: "🟢", tan: "🟤",
  // 가족
  mom: "👩", dad: "👨", baby: "👶", family: "👨‍👩‍👧", mother: "👩",
  father: "👨", brother: "👦", sister: "👧", grandma: "👵", grandpa: "👴",
  son: "👦", daughter: "👧", uncle: "👨", aunt: "👩", cousin: "🧒",
  nephew: "👦", niece: "👧", husband: "👨", wife: "👩", parent: "👪",
  child: "🧒", kid: "🧒", twin: "👯", toddler: "🧒", teenager: "🧑",
  adult: "🧑", elder: "🧓", ancestor: "👴", relative: "👨‍👩‍👦", neighbor: "🏠",
};

// 카테고리별 이모지 그룹 (오답 생성용)
const getCategoryEmojis = (category: string): string[] => {
  const emojisByCategory: Record<string, string[]> = {
    "동물": ["🐱", "🐕", "🐦", "🐟", "🐄", "🐷", "🦆", "🐔", "🐴", "🐑", "🐰", "🐸", "🐻", "🦁", "🐯", "🐒", "🐘", "🐭", "🐍", "🐢", "🐋", "🐬", "🐧", "🦉", "🐝", "🐜", "🦋", "🐌", "🦈", "🦀"],
    "음식": ["🍞", "🍚", "🥚", "🥛", "💧", "🍕", "🎂", "🍪", "🍬", "🍫", "🧀", "🍲", "🥗", "🥪", "🍔", "🌭", "🍝", "🍜", "🍣", "🌮", "🥟", "🥞", "🍩", "🍿", "🥐", "🧁", "🍮", "🍯", "☕", "🍵"],
    "과일": ["🍎", "🍌", "🍊", "🍇", "🍋", "🍓", "🍉", "🍑", "🍒", "🍍", "🥭", "🥥", "🥝", "🫐", "🥑", "🍐", "🍈", "🫒", "🍅"],
    "숫자": ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "0️⃣", "💯", "🥇", "🥈", "🥉", "🏁"],
    "색깔": ["🔴", "🔵", "🟡", "🟢", "🟠", "🟣", "🩷", "⚪", "⚫", "🟤", "🩶", "🌈"],
    "가족": ["👩", "👨", "👶", "👨‍👩‍👧", "👦", "👧", "👵", "👴", "🧒", "👪", "🧑", "🧓", "🏠"],
  };
  return emojisByCategory[category] ?? [];
};

// 이모지 옵션 생성 (스마트 버전)
const getImageOptions = (word: string, category?: string): string[] => {
  const lower = word.toLowerCase();
  const correctEmoji = wordEmojiMap[lower];

  if (!correctEmoji) {
    const defaults = ["❓", "🎯", "💫", "🌟"];
    return defaults.sort(() => Math.random() - 0.5);
  }

  // 같은 카테고리에서 오답 이모지 선택
  const categoryPool = category ? getCategoryEmojis(category) : [];
  const wrongEmojis = categoryPool
    .filter(e => e !== correctEmoji)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // 부족하면 다른 카테고리에서 채움
  if (wrongEmojis.length < 3) {
    const allEmojis = Object.values(wordEmojiMap);
    const unique = [...new Set(allEmojis)].filter(e => e !== correctEmoji && !wrongEmojis.includes(e));
    wrongEmojis.push(...unique.sort(() => Math.random() - 0.5).slice(0, 3 - wrongEmojis.length));
  }

  return [correctEmoji, ...wrongEmojis].sort(() => Math.random() - 0.5);
};

// ============================================
// 스마트 오답 생성 함수
// ============================================
const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const generateSmartDistractors = (
  word: EnglishWord,
  field: "meaning" | "word"
): string[] => {
  const pool = englishWordsData.filter(w => w.id !== word.id);

  // 1순위: 같은 카테고리 + 같은 난이도
  const sameCatDiff = pool.filter(
    w => w.category === word.category && w.difficulty === word.difficulty
  );
  // 2순위: 같은 카테고리
  const sameCat = pool.filter(w => w.category === word.category);
  // 3순위: 같은 난이도
  const sameDiff = pool.filter(w => w.difficulty === word.difficulty);

  const used = new Set<number>();
  const result: string[] = [];

  const addFrom = (source: EnglishWord[]) => {
    const shuffled = shuffleArray(source);
    for (const w of shuffled) {
      if (result.length >= 3) break;
      if (used.has(w.id)) continue;
      // 중복 답안 방지
      if (result.includes(w[field])) continue;
      if (w[field] === word[field]) continue;
      used.add(w.id);
      result.push(w[field]);
    }
  };

  addFrom(sameCatDiff);
  addFrom(sameCat);
  addFrom(sameDiff);
  addFrom(pool);

  return result;
};

// ============================================
// 메인 컴포넌트
// ============================================
export default function EnglishQuiz() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  // 게임 상태
  const [gameState, setGameState] = useState<GameState>("menu");
  const [quizMode, setQuizMode] = useState<QuizMode>("mixed");
  const [difficulty, setDifficulty] = useState<WordDifficulty | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | "all">("all");
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("default");

  // 퀴즈 진행
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);

  // 점수 및 상태
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(1);

  // 타이머
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // XP 및 레벨
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
  });
  const [earnedXP, setEarnedXP] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // 보스 배틀
  const [bossHP, setBossHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [bossName, setBossName] = useState("피카츄");
  const [bossEmoji, setBossEmoji] = useState("⚡");

  // 배지 & 미션
  const [badges, setBadges] = useState<Badge[]>(allBadges);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([
    { id: "daily_10", name: "오늘의 시작", goal: 10, current: 0, reward: 20, icon: "🎯", completed: false },
    { id: "daily_streak3", name: "연속 도전", goal: 3, current: 0, reward: 15, icon: "🔥", completed: false },
    { id: "daily_perfect", name: "완벽주의", goal: 1, current: 0, reward: 50, icon: "💯", completed: false },
  ]);

  // 스피드 라운드
  const [speedCount, setSpeedCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const totalQuestions = quizMode === "speed-round" ? 999 : quizMode === "survival" ? 999 : 15;
  const currentQuestion = questions[currentIndex];
  const progress = quizMode === "speed-round" || quizMode === "survival"
    ? 100
    : ((currentIndex + (isAnswered ? 1 : 0)) / Math.min(totalQuestions, questions.length)) * 100;
  const theme = themes[currentTheme];

  // 타이머 로직
  useEffect(() => {
    if (!isTimerActive || gameState !== "playing" || isAnswered) return;

    if (timeLeft <= 0) {
      if (quizMode === "speed-round") {
        // 스피드 라운드 종료
        setGameState("result");
        playSound("complete");
        return;
      } else if (quizMode === "time-attack") {
        // 타임어택: 시간 초과 = 오답
        handleTimeout();
        return;
      }
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isTimerActive, gameState, isAnswered, quizMode]);

  // 시간 초과
  const handleTimeout = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    setStreak(0);
    setCombo(1);
    if (quizMode !== "speed-round") {
      setLives(prev => prev - 1);
    }
    playSound("wrong");
    toast.error("시간 초과! ⏰");
  };

  // 퀴즈 문제 생성
  const generateQuestions = useCallback(() => {
    let wordPool = [...englishWordsData];

    if (selectedCategory !== "all") {
      wordPool = wordPool.filter(w => w.category === selectedCategory);
    }
    if (difficulty !== "all") {
      wordPool = wordPool.filter(w => w.difficulty === difficulty);
    }
    if (wordPool.length < 15) {
      wordPool = [...englishWordsData];
    }

    const count = quizMode === "speed-round" || quizMode === "survival" ? 50 : 15;
    const shuffled = wordPool.sort(() => Math.random() - 0.5).slice(0, count);

    const modes: QuizMode[] = ["multiple-choice", "typing", "listening", "reverse"];

    const quizQuestions: QuizQuestion[] = shuffled.map((word, index) => {
      let questionType: QuizMode = quizMode;

      if (quizMode === "mixed") {
        questionType = modes[index % modes.length];
      } else if (quizMode === "speed-round" || quizMode === "time-attack" || quizMode === "survival" || quizMode === "boss-battle") {
        questionType = "multiple-choice";
      }

      let options: string[] | undefined;
      let scrambledLetters: string[] | undefined;
      let imageOptions: string[] | undefined;

      if (questionType === "multiple-choice" || questionType === "listening" ||
          quizMode === "speed-round" || quizMode === "time-attack" ||
          quizMode === "survival" || quizMode === "boss-battle") {
        const wrongAnswers = generateSmartDistractors(word, "meaning");
        options = [...wrongAnswers, word.meaning].sort(() => Math.random() - 0.5);
      } else if (questionType === "reverse") {
        const wrongAnswers = generateSmartDistractors(word, "word");
        options = [...wrongAnswers, word.word].sort(() => Math.random() - 0.5);
      } else if (questionType === "picture-match" || quizMode === "picture-match") {
        imageOptions = getImageOptions(word.word, word.category);
      } else if (questionType === "word-scramble" || quizMode === "word-scramble") {
        scrambledLetters = word.word.split("").sort(() => Math.random() - 0.5);
      }

      return {
        word,
        questionType: quizMode === "picture-match" ? "picture-match" :
                      quizMode === "word-scramble" ? "word-scramble" : questionType,
        options,
        correctAnswer: questionType === "reverse" ? word.word : word.meaning,
        scrambledLetters,
        imageOptions,
      };
    });

    return quizQuestions;
  }, [quizMode, difficulty, selectedCategory]);

  // 게임 시작
  const startGame = (mode?: QuizMode) => {
    if (mode) setQuizMode(mode);
    const actualMode = mode || quizMode;

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
    setCombo(1);
    setEarnedXP(0);
    setSelectedLetters([]);
    setSpeedCount(0);

    // 모드별 설정
    if (actualMode === "speed-round") {
      setTimeLeft(30);
      setIsTimerActive(true);
      setLives(999);
    } else if (actualMode === "time-attack") {
      setTimeLeft(60);
      setIsTimerActive(true);
      setLives(3);
    } else if (actualMode === "survival") {
      setLives(1);
      setIsTimerActive(false);
      setTimeLeft(0);
    } else if (actualMode === "boss-battle") {
      setBossHP(100);
      setPlayerHP(100);
      const bosses = [
        { name: "피카츄", emoji: "⚡" },
        { name: "파이리", emoji: "🔥" },
        { name: "꼬부기", emoji: "💧" },
        { name: "이상해씨", emoji: "🌿" },
        { name: "뮤츠", emoji: "👾" },
      ];
      const boss = bosses[Math.floor(Math.random() * bosses.length)];
      setBossName(boss.name);
      setBossEmoji(boss.emoji);
      setLives(999);
      setIsTimerActive(false);
    } else {
      setLives(3);
      setIsTimerActive(false);
      setTimeLeft(15);
    }

    setGameState("playing");
    playSound("click");

    if (newQuestions[0]?.questionType === "listening") {
      setTimeout(() => speakWord(newQuestions[0].word.word), 500);
    }
  };

  // 정답 확인
  const checkAnswer = (answer: string): boolean => {
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrect = currentQuestion.correctAnswer.toLowerCase();
    if (normalizedAnswer === normalizedCorrect) return true;

    // 타이핑 모드 오타 허용
    if (currentQuestion.questionType === "typing" || currentQuestion.questionType === "reverse") {
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

  // 철자 퍼즐 글자 선택
  const handleLetterSelect = (index: number) => {
    if (isAnswered) return;
    if (selectedLetters.includes(index)) {
      setSelectedLetters(selectedLetters.filter(i => i !== index));
    } else {
      setSelectedLetters([...selectedLetters, index]);
    }
    playSound("click");
  };

  // 철자 퍼즐 제출
  const submitScramble = () => {
    if (!currentQuestion.scrambledLetters) return;
    const answer = selectedLetters.map(i => currentQuestion.scrambledLetters![i]).join("");
    if (answer.toLowerCase() === currentQuestion.word.word.toLowerCase()) {
      submitAnswer(currentQuestion.word.meaning);
    } else {
      submitAnswer("wrong");
    }
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

    const baseXP = { easy: 10, medium: 15, hard: 25, expert: 40 };
    let xpGained = baseXP[currentQuestion.word.difficulty as keyof typeof baseXP] || 10;

    if (correct) {
      // 정답 처리
      const basePoints = currentQuestion.word.difficulty === "easy" ? 10 :
                        currentQuestion.word.difficulty === "medium" ? 15 :
                        currentQuestion.word.difficulty === "hard" ? 25 : 40;

      const streakBonus = Math.min(streak * 3, 30);
      const comboMultiplier = Math.min(combo, 5);
      const totalPoints = Math.floor((basePoints + streakBonus) * comboMultiplier);

      setScore(prev => prev + totalPoints);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, streak + 1));
      setCombo(prev => Math.min(prev + 0.2, 5));

      // XP 보너스
      if (streak >= 10) xpGained *= 2;
      else if (streak >= 5) xpGained *= 1.5;
      else if (streak >= 3) xpGained *= 1.2;

      setEarnedXP(prev => prev + Math.floor(xpGained));

      // 보스 배틀 데미지
      if (quizMode === "boss-battle") {
        const damage = 15 + Math.floor(streak * 2);
        setBossHP(prev => Math.max(0, prev - damage));
        playSound("boss");
      }

      // 스피드 라운드 카운트
      if (quizMode === "speed-round") {
        setSpeedCount(prev => prev + 1);
      }

      // 효과음 & 이펙트
      if (streak >= 4) {
        playSound("streak");
        confetti({
          particleCount: 30 + streak * 5,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4"],
        });
        toast.success(`🔥 ${streak + 1}연속! +${totalPoints}점 (x${comboMultiplier.toFixed(1)})`);
      } else {
        playSound("correct");
        toast.success(`정답! +${totalPoints}점`);
      }
    } else {
      // 오답 처리
      playSound("wrong");
      setStreak(0);
      setCombo(1);

      if (quizMode === "boss-battle") {
        const damage = 20;
        setPlayerHP(prev => Math.max(0, prev - damage));
      } else if (quizMode !== "speed-round") {
        setLives(prev => prev - 1);
      }

      toast.error(`틀렸어요! 정답: ${currentQuestion.correctAnswer}`);
    }

    speakWord(currentQuestion.word.word);

    // 스피드 라운드/서바이벌 자동 진행
    if (quizMode === "speed-round") {
      setTimeout(() => handleNext(), 500);
    }
  };

  // 다음 문제
  const handleNext = async () => {
    // 게임 오버 체크
    if (lives <= 0 || (quizMode === "boss-battle" && playerHP <= 0)) {
      endGame();
      return;
    }

    // 보스 처치
    if (quizMode === "boss-battle" && bossHP <= 0) {
      toast.success(`🎉 ${bossName}을(를) 물리쳤다!`);
      endGame();
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setSelectedLetters([]);

      if (quizMode === "time-attack") {
        setTimeLeft(prev => prev + (isCorrect ? 3 : -5)); // 정답 +3초, 오답 -5초
      }

      const nextQuestion = questions[currentIndex + 1];
      if (nextQuestion?.questionType === "listening") {
        setTimeout(() => speakWord(nextQuestion.word.word), 300);
      }

      setTimeout(() => {
        if (nextQuestion?.questionType === "typing") {
          inputRef.current?.focus();
        }
      }, 100);
    } else {
      endGame();
    }
  };

  // 게임 종료
  const endGame = async () => {
    setGameState("result");
    setIsTimerActive(false);
    playSound("complete");

    // XP 적용 및 레벨업 체크
    const newTotalXP = userProgress.totalXP + earnedXP;
    let newLevel = userProgress.level;
    let newCurrentXP = userProgress.currentXP + earnedXP;

    while (newCurrentXP >= calculateXPRequired(newLevel)) {
      newCurrentXP -= calculateXPRequired(newLevel);
      newLevel++;
      setShowLevelUp(true);
      playSound("levelup");
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
      });
    }

    setUserProgress({
      level: newLevel,
      currentXP: newCurrentXP,
      totalXP: newTotalXP,
    });

    // 배지 체크
    checkBadges();

    // 포인트 지급
    await awardPoints();

    if (correctCount >= (quizMode === "speed-round" ? speedCount : questions.length) * 0.9) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    }
  };

  // 배지 체크
  const checkBadges = () => {
    const newBadges = [...badges];
    let earned: Badge | null = null;

    // 첫 퀴즈
    if (!newBadges.find(b => b.id === "first_quiz")?.earned) {
      const badge = newBadges.find(b => b.id === "first_quiz");
      if (badge) {
        badge.earned = true;
        earned = badge;
      }
    }

    // 스트릭 배지
    if (maxStreak >= 5 && !newBadges.find(b => b.id === "streak_5")?.earned) {
      const badge = newBadges.find(b => b.id === "streak_5");
      if (badge) { badge.earned = true; earned = badge; }
    }
    if (maxStreak >= 10 && !newBadges.find(b => b.id === "streak_10")?.earned) {
      const badge = newBadges.find(b => b.id === "streak_10");
      if (badge) { badge.earned = true; earned = badge; }
    }

    // 완벽 클리어
    if (correctCount === questions.length && questions.length >= 10) {
      const badge = newBadges.find(b => b.id === "perfect_10");
      if (badge && !badge.earned) { badge.earned = true; earned = badge; }
    }

    // 보스 슬레이어
    if (quizMode === "boss-battle" && bossHP <= 0) {
      const badge = newBadges.find(b => b.id === "boss_slayer");
      if (badge && !badge.earned) { badge.earned = true; earned = badge; }
    }

    if (earned) {
      setNewBadge(earned);
      setTimeout(() => setNewBadge(null), 3000);
    }

    setBadges(newBadges);
  };

  // 포인트 지급
  const awardPoints = async () => {
    try {
      // 중복 포인트 방지: 이미 영어 퀴즈로 포인트를 받았는지 확인
      const { data: existing } = await supabase
        .from("point_transactions")
        .select("id")
        .eq("juwoo_id", 1)
        .like("note", "영어 퀴즈%")
        .limit(1);

      // 보스/스피드/서바이벌 모드도 체크
      const { data: existingSpecial } = await supabase
        .from("point_transactions")
        .select("id")
        .eq("juwoo_id", 1)
        .or("note.like.보스 %,note.like.스피드 라운드%,note.like.서바이벌%")
        .limit(1);

      if ((existing && existing.length > 0) || (existingSpecial && existingSpecial.length > 0)) {
        toast.info("이미 포인트를 받았어요! 📚");
        return;
      }

      const { data: profile } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();

      const currentBalance = profile?.current_points ?? 0;
      const totalQ = quizMode === "speed-round" ? speedCount : questions.length;
      const scorePercent = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

      let points = 0;
      let note = "";

      if (quizMode === "boss-battle" && bossHP <= 0) {
        points = 5000;
        note = `영어 퀴즈 보스 ${bossName} 처치! 🗡️`;
      } else if (quizMode === "speed-round") {
        points = speedCount * 100;
        note = `영어 퀴즈 스피드 라운드 ${speedCount}개 정답! ⚡`;
      } else if (quizMode === "survival" && correctCount >= 20) {
        points = correctCount * 150;
        note = `영어 퀴즈 서바이벌 ${correctCount}문제 클리어! 🏅`;
      } else if (scorePercent === 100) {
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
      if (import.meta.env.DEV) console.error("포인트 적립 오류:", error);
    }
  };

  // ============================================
  // 로그인 체크
  // ============================================
  if (authLoading || !isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme.secondary}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
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
  // 메인 메뉴
  // ============================================
  if (gameState === "menu") {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.secondary}`}>
        <div className="container max-w-4xl py-8 px-4">
          <motion.div
            className="mb-6"
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

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`border-4 ${theme.card} shadow-2xl bg-white/90 backdrop-blur`}>
              <CardContent className="p-6 md:p-8">
                {/* 헤더 */}
                <div className="text-center mb-8">
                  <motion.div
                    className={`inline-block p-4 bg-gradient-to-br ${theme.primary} rounded-full mb-4 shadow-lg`}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Brain className="h-14 w-14 text-white" />
                  </motion.div>
                  <h1 className={`text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    🎮 영어 단어 퀴즈
                  </h1>
                  <p className="text-muted-foreground">
                    {englishWordsData.length}개의 단어로 실력을 테스트해보세요!
                  </p>

                  {/* 레벨 표시 */}
                  <motion.div
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <span className="font-bold text-yellow-700">Lv.{userProgress.level}</span>
                    <div className="w-20 h-2 bg-yellow-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-yellow-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(userProgress.currentXP / calculateXPRequired(userProgress.level)) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* 테마 선택 */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    테마 선택
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(themes).map(([key, t]) => (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setCurrentTheme(key as ThemeKey); playSound("click"); }}
                        className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                          currentTheme === key
                            ? `bg-gradient-to-r ${t.primary} text-white border-transparent`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {t.icon} {t.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 게임 모드 버튼 */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-blue-600" />
                    게임 모드
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {gameModes.map((mode, i) => (
                      <motion.button
                        key={mode.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startGame(mode.id as QuizMode)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left bg-white hover:shadow-lg ${
                          mode.isNew ? "border-yellow-400" : "border-gray-200"
                        }`}
                      >
                        {mode.isNew && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                            NEW
                          </span>
                        )}
                        <div className={`text-${mode.color}-500 mb-2`}>{mode.icon}</div>
                        <div className="font-bold">{mode.name}</div>
                        <p className="text-xs text-muted-foreground">{mode.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 난이도 선택 */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    난이도
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: "all", label: "전체", color: "purple" },
                      { value: "easy", label: "쉬움", color: "green" },
                      { value: "medium", label: "보통", color: "yellow" },
                      { value: "hard", label: "어려움", color: "red" },
                      { value: "expert", label: "전문가", color: "violet" },
                    ].map(d => (
                      <motion.button
                        key={d.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setDifficulty(d.value as WordDifficulty | "all"); playSound("click"); }}
                        className={`p-3 rounded-xl border-2 font-bold transition-all ${
                          difficulty === d.value
                            ? `bg-${d.color}-100 border-${d.color}-400 text-${d.color}-700`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {d.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 카테고리 선택 */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    카테고리
                  </h3>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedCategory("all"); playSound("click"); }}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                        selectedCategory === "all"
                          ? `bg-gradient-to-r ${theme.primary} text-white border-transparent`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      🌈 전체
                    </motion.button>
                    {wordCategories.map(cat => (
                      <motion.button
                        key={cat}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedCategory(cat); playSound("click"); }}
                        className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                          selectedCategory === cat
                            ? `bg-gradient-to-r ${theme.primary} text-white border-transparent`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {categoryEmojis[cat]} {cat}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 일일 미션 */}
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    오늘의 미션
                  </h3>
                  <div className="space-y-2">
                    {dailyMissions.map(mission => (
                      <div key={mission.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{mission.icon}</span>
                          <span className={mission.completed ? "line-through text-gray-400" : ""}>
                            {mission.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-amber-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${Math.min(100, (mission.current / mission.goal) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-amber-700">+{mission.reward}P</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 획득 배지 */}
                <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Medal className="h-5 w-5 text-violet-600" />
                    획득 배지
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {badges.filter(b => b.earned).length === 0 ? (
                      <p className="text-sm text-gray-500">아직 획득한 배지가 없어요. 퀴즈를 풀어보세요!</p>
                    ) : (
                      badges.filter(b => b.earned).map(badge => (
                        <motion.div
                          key={badge.id}
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          className="text-2xl cursor-pointer"
                          title={`${badge.name}: ${badge.condition}`}
                        >
                          {badge.icon}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* 빠른 시작 */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    onClick={() => startGame()}
                    className={`w-full bg-gradient-to-r ${theme.primary} hover:opacity-90 text-white font-bold text-xl py-6 shadow-lg`}
                  >
                    <Zap className="h-6 w-6 mr-2" />
                    빠른 시작 (믹스 모드)
                  </Button>
                </motion.div>
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
    const totalQ = quizMode === "speed-round" ? speedCount || 1 : questions.length;
    const scorePercent = Math.round((correctCount / totalQ) * 100);
    const stars = scorePercent >= 90 ? 3 : scorePercent >= 70 ? 2 : scorePercent >= 40 ? 1 : 0;

    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.secondary}`}>
        <div className="container max-w-4xl py-8 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
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
                    {quizMode === "boss-battle" && bossHP <= 0
                      ? `${bossName} 처치! 🗡️`
                      : quizMode === "speed-round"
                      ? `${speedCount}개 정답!`
                      : "퀴즈 완료!"}
                  </h1>
                </motion.div>

                {/* 레벨업 알림 */}
                <AnimatePresence>
                  {showLevelUp && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-white"
                    >
                      <Crown className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-xl font-bold">🎉 레벨 업! Lv.{userProgress.level}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 새 배지 알림 */}
                <AnimatePresence>
                  {newBadge && (
                    <motion.div
                      initial={{ scale: 0, y: -50 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, y: 50 }}
                      className="mb-4 p-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl text-white"
                    >
                      <p className="text-3xl mb-2">{newBadge.icon}</p>
                      <p className="font-bold">새 배지 획득: {newBadge.name}!</p>
                    </motion.div>
                  )}
                </AnimatePresence>

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

                {/* 점수 표시 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "총 점수", value: score.toLocaleString(), color: "blue", icon: "⭐" },
                    { label: "정답", value: `${correctCount}/${totalQ}`, color: "green", icon: "✅" },
                    { label: "최대 연속", value: maxStreak, color: "orange", icon: "🔥" },
                    { label: "획득 XP", value: `+${earnedXP}`, color: "purple", icon: "✨" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`p-4 bg-${stat.color}-100 rounded-xl`}
                    >
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                      <div className={`text-sm text-${stat.color}-700`}>{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* 레벨 진행바 */}
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Lv.{userProgress.level}</span>
                    <span className="text-sm text-gray-600">
                      {userProgress.currentXP} / {calculateXPRequired(userProgress.level)} XP
                    </span>
                  </div>
                  <div className="w-full h-4 bg-yellow-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(userProgress.currentXP / calculateXPRequired(userProgress.level)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* 메시지 */}
                <motion.div
                  className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-medium">
                    {scorePercent === 100 && "완벽해요! 영어 천재! 🏆"}
                    {scorePercent >= 90 && scorePercent < 100 && "대단해요! 영어 마스터! ⭐"}
                    {scorePercent >= 70 && scorePercent < 90 && "잘했어요! 영어 고수! 💪"}
                    {scorePercent >= 50 && scorePercent < 70 && "좋아요! 계속 연습해요! 📚"}
                    {scorePercent < 50 && "괜찮아요! 다시 도전해봐요! 🌟"}
                  </p>
                </motion.div>

                {/* 버튼 */}
                <div className="flex gap-4 justify-center flex-wrap">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      onClick={() => setGameState("menu")}
                      className={`bg-gradient-to-r ${theme.primary} text-white font-bold`}
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

  const getModeLabel = () => {
    const labels: Record<string, string> = {
      "multiple-choice": "객관식",
      "typing": "타이핑",
      "listening": "듣기",
      "reverse": "한→영",
      "picture-match": "그림 맞추기",
      "word-scramble": "철자 퍼즐",
      "speed-round": "스피드",
      "time-attack": "타임어택",
      "boss-battle": "보스 배틀",
      "survival": "서바이벌",
    };
    return labels[currentQuestion.questionType] || labels[quizMode] || "";
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.secondary}`}>
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
            {/* 목숨 (서바이벌/일반 모드) */}
            {quizMode !== "speed-round" && quizMode !== "boss-battle" && (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full">
                {[...Array(Math.min(lives, 3))].map((_, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* 스트릭 */}
            <AnimatePresence>
              {streak > 0 && (
                <motion.div
                  variants={streakVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-full"
                >
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="font-bold text-orange-600">{streak}</span>
                  {combo > 1 && <span className="text-xs text-orange-500">x{combo.toFixed(1)}</span>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 타이머 */}
            {(quizMode === "speed-round" || quizMode === "time-attack") && (
              <motion.div
                className={`px-3 py-1 rounded-full font-bold ${
                  timeLeft <= 5 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}
                animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                ⏱️ {timeLeft}s
              </motion.div>
            )}

            {/* 스피드 라운드 카운트 */}
            {quizMode === "speed-round" && (
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                ✓ {speedCount}
              </div>
            )}
          </div>
        </motion.div>

        {/* 보스 배틀 HP 바 */}
        {quizMode === "boss-battle" && (
          <motion.div
            className="mb-4 p-4 bg-white/80 rounded-xl shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* 보스 HP */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-red-600">{bossEmoji} {bossName}</span>
                <span className="text-sm">{bossHP}/100 HP</span>
              </div>
              <div className="w-full h-4 bg-red-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600"
                  animate={{ width: `${bossHP}%` }}
                  transition={{ type: "spring" }}
                />
              </div>
            </div>
            {/* 플레이어 HP */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-600">🧒 주우</span>
                <span className="text-sm">{playerHP}/100 HP</span>
              </div>
              <div className="w-full h-4 bg-blue-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  animate={{ width: `${playerHP}%` }}
                  transition={{ type: "spring" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 진행률 */}
        {quizMode !== "speed-round" && quizMode !== "survival" && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  currentQuestion.word.difficulty === "easy" ? "bg-green-100 text-green-700" :
                  currentQuestion.word.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                  currentQuestion.word.difficulty === "hard" ? "bg-red-100 text-red-700" :
                  "bg-violet-100 text-violet-700"
                }`}>
                  {currentQuestion.word.difficulty === "easy" ? "쉬움" :
                   currentQuestion.word.difficulty === "medium" ? "보통" :
                   currentQuestion.word.difficulty === "hard" ? "어려움" : "전문가"}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {getModeLabel()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{currentIndex + 1} / {questions.length}</span>
                <span className="font-bold text-blue-600">⭐ {score}점</span>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        {/* 문제 카드 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className={`mb-6 border-4 ${theme.card} shadow-xl bg-white/95 backdrop-blur`}>
              <CardContent className="p-6 md:p-8">
                {/* 카테고리 */}
                <div className="text-center mb-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {categoryEmojis[currentQuestion.word.category as WordCategory]} {currentQuestion.word.category}
                  </span>
                </div>

                {/* 문제 영역 */}
                <div className="text-center mb-6">
                  {/* 객관식 / 보스배틀 / 스피드 / 타임어택 / 서바이벌 */}
                  {(currentQuestion.questionType === "multiple-choice" ||
                    quizMode === "boss-battle" || quizMode === "speed-round" ||
                    quizMode === "time-attack" || quizMode === "survival") && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">이 단어의 뜻은?</p>
                      <motion.div
                        className="flex items-center justify-center gap-3 mb-4"
                        variants={isAnswered ? (isCorrect ? correctVariants : wrongVariants) : {}}
                        initial="initial"
                        animate={isAnswered ? "animate" : "initial"}
                      >
                        <h2 className="text-4xl md:text-5xl font-bold text-blue-600">
                          {currentQuestion.word.word}
                        </h2>
                        <Button variant="outline" size="icon" onClick={() => speakWord(currentQuestion.word.word)} className="rounded-full">
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      </motion.div>
                      <p className="text-sm text-muted-foreground">[{currentQuestion.word.pronunciation}]</p>
                    </>
                  )}

                  {/* 듣기 모드 */}
                  {currentQuestion.questionType === "listening" && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">🎧 발음을 듣고 뜻을 맞춰보세요!</p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="lg"
                          onClick={() => speakWord(currentQuestion.word.word)}
                          className={`mb-4 bg-gradient-to-r ${theme.primary}`}
                        >
                          <Volume2 className="h-8 w-8 mr-2" />
                          발음 듣기
                        </Button>
                      </motion.div>
                      {isAnswered && (
                        <motion.h2
                          className="text-4xl md:text-5xl font-bold text-blue-600 mb-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {currentQuestion.word.word}
                        </motion.h2>
                      )}
                    </>
                  )}

                  {/* 타이핑 모드 */}
                  {currentQuestion.questionType === "typing" && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">이 단어의 뜻을 입력하세요!</p>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-blue-600">{currentQuestion.word.word}</h2>
                        <Button variant="outline" size="icon" onClick={() => speakWord(currentQuestion.word.word)} className="rounded-full">
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">[{currentQuestion.word.pronunciation}]</p>
                    </>
                  )}

                  {/* 역방향 모드 */}
                  {currentQuestion.questionType === "reverse" && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">이 뜻의 영어 단어를 고르세요!</p>
                      <h2 className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">{currentQuestion.word.meaning}</h2>
                      <p className="text-sm text-muted-foreground">💡 힌트: {currentQuestion.word.tip}</p>
                    </>
                  )}

                  {/* 그림 맞추기 모드 */}
                  {currentQuestion.questionType === "picture-match" && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">🖼️ 단어에 맞는 그림을 고르세요!</p>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-blue-600">{currentQuestion.word.word}</h2>
                        <Button variant="outline" size="icon" onClick={() => speakWord(currentQuestion.word.word)} className="rounded-full">
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </>
                  )}

                  {/* 철자 퍼즐 모드 */}
                  {currentQuestion.questionType === "word-scramble" && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">🧩 글자를 순서대로 클릭해서 단어를 만드세요!</p>
                      <h2 className="text-2xl font-bold text-purple-600 mb-4">{currentQuestion.word.meaning}</h2>

                      {/* 선택된 글자 */}
                      <div className="flex justify-center gap-2 mb-4 min-h-[60px]">
                        {selectedLetters.map((letterIndex, i) => (
                          <motion.div
                            key={`selected-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white text-2xl font-bold rounded-lg"
                          >
                            {currentQuestion.scrambledLetters![letterIndex]}
                          </motion.div>
                        ))}
                      </div>

                      {/* 섞인 글자 */}
                      <div className="flex justify-center gap-2 flex-wrap">
                        {currentQuestion.scrambledLetters?.map((letter, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLetterSelect(i)}
                            disabled={isAnswered || selectedLetters.includes(i)}
                            className={`w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all ${
                              selectedLetters.includes(i)
                                ? "bg-gray-200 border-gray-300 text-gray-400"
                                : "bg-white border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                            }`}
                          >
                            {letter}
                          </motion.button>
                        ))}
                      </div>

                      {/* 제출 버튼 */}
                      {!isAnswered && (
                        <div className="mt-4 flex justify-center gap-2">
                          <Button variant="outline" onClick={() => setSelectedLetters([])}>
                            초기화
                          </Button>
                          <Button
                            onClick={submitScramble}
                            disabled={selectedLetters.length !== currentQuestion.scrambledLetters?.length}
                            className={`bg-gradient-to-r ${theme.primary} text-white`}
                          >
                            확인
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 답변 영역 - 객관식 */}
                {(currentQuestion.questionType === "multiple-choice" ||
                  currentQuestion.questionType === "listening" ||
                  currentQuestion.questionType === "reverse" ||
                  quizMode === "boss-battle" || quizMode === "speed-round" ||
                  quizMode === "time-attack" || quizMode === "survival") &&
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
                            className={`w-full h-16 md:h-20 text-lg md:text-xl font-bold transition-all rounded-xl ${
                              showResult
                                ? isCorrectOption
                                  ? "bg-green-500 hover:bg-green-600 text-white border-4 border-green-600"
                                  : isSelected && !isCorrectOption
                                  ? "bg-slate-400 hover:bg-slate-500 text-white border-4 border-slate-500"
                                  : "opacity-50 border-2"
                                : "hover:bg-blue-100 border-2 border-blue-300 hover:border-blue-500"
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

                {/* 답변 영역 - 타이핑 */}
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
                        className={`h-14 px-8 bg-gradient-to-r ${theme.primary} text-white font-bold`}
                      >
                        확인
                      </Button>
                    </div>

                    {isAnswered && (
                      <motion.div
                        className={`p-4 rounded-xl ${isCorrect ? "bg-green-100" : "bg-slate-100"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isCorrect ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-slate-500" />}
                          <span className={`font-bold ${isCorrect ? "text-green-700" : "text-slate-600"}`}>
                            {isCorrect ? "정답!" : `아쉬워요! 정답: ${currentQuestion.correctAnswer}`}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* 정답 해설 */}
                {isAnswered && (
                  <motion.div
                    className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
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
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* 다음 버튼 */}
        {isAnswered && quizMode !== "speed-round" && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={handleNext}
                className={`bg-gradient-to-r ${theme.primary} text-white font-bold text-xl px-12 py-6`}
              >
                {(lives <= 0 && !isCorrect) || (quizMode === "boss-battle" && (playerHP <= 0 || bossHP <= 0))
                  ? "결과 보기 🎯"
                  : currentIndex < questions.length - 1
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
          transition={{ delay: 0.3 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
}
