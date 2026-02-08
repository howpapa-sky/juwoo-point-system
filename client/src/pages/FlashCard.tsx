import { useState, useEffect, useCallback, useMemo } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowLeft, Volume2, Check, X, RotateCcw, Trophy, Star,
  Zap, Heart, Sparkles, Target, BookOpen, Shuffle,
  ChevronRight, ChevronLeft, Music, Eye, EyeOff,
  Flame, Crown, Medal, Gift, Play, Pause, Settings,
  Lightbulb, Brain, Rocket, PartyPopper
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { englishWordsData, type EnglishWord, type WordCategory, type WordDifficulty } from "@/data/englishWordsData";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useBadges } from "@/hooks/useBadges.js";

// ============================================
// 🎯 타입 정의
// ============================================
type LearningMode = "classic" | "matching" | "spelling" | "listening";
type GamePhase = "setup" | "learning" | "result";

interface MatchCard {
  id: string;
  content: string;
  type: "word" | "meaning";
  wordId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

interface LearningStats {
  totalCards: number;
  knownCards: number;
  unknownCards: number;
  streak: number;
  maxStreak: number;
  xp: number;
  stars: number;
  perfectRounds: number;
}

// ============================================
// 🎨 카테고리 테마 설정
// ============================================
const categoryThemes: Record<WordCategory, {
  bg: string;
  border: string;
  icon: string;
  gradient: string;
}> = {
  "동물": { bg: "from-amber-100 to-orange-100", border: "border-amber-400", icon: "🐾", gradient: "from-amber-500 to-orange-500" },
  "과일": { bg: "from-red-100 to-pink-100", border: "border-red-400", icon: "🍎", gradient: "from-red-500 to-pink-500" },
  "색깔": { bg: "from-rainbow-100 to-purple-100", border: "border-purple-400", icon: "🌈", gradient: "from-purple-500 to-pink-500" },
  "숫자": { bg: "from-blue-100 to-cyan-100", border: "border-blue-400", icon: "🔢", gradient: "from-blue-500 to-cyan-500" },
  "가족": { bg: "from-pink-100 to-rose-100", border: "border-pink-400", icon: "👨‍👩‍👧", gradient: "from-pink-500 to-rose-500" },
  "음식": { bg: "from-yellow-100 to-amber-100", border: "border-yellow-400", icon: "🍔", gradient: "from-yellow-500 to-amber-500" },
  "자연": { bg: "from-green-100 to-emerald-100", border: "border-green-400", icon: "🌳", gradient: "from-green-500 to-emerald-500" },
  "탈것": { bg: "from-slate-100 to-gray-100", border: "border-slate-400", icon: "🚗", gradient: "from-slate-500 to-gray-500" },
  "신체": { bg: "from-rose-100 to-pink-100", border: "border-rose-400", icon: "🖐️", gradient: "from-rose-500 to-pink-500" },
  "감정": { bg: "from-yellow-100 to-orange-100", border: "border-yellow-400", icon: "😊", gradient: "from-yellow-500 to-orange-500" },
  "날씨": { bg: "from-sky-100 to-blue-100", border: "border-sky-400", icon: "☀️", gradient: "from-sky-500 to-blue-500" },
  "포켓몬": { bg: "from-yellow-100 to-red-100", border: "border-yellow-400", icon: "⚡", gradient: "from-yellow-500 to-red-500" },
  "동사": { bg: "from-indigo-100 to-violet-100", border: "border-indigo-400", icon: "🏃", gradient: "from-indigo-500 to-violet-500" },
  "학교": { bg: "from-blue-100 to-indigo-100", border: "border-blue-400", icon: "🏫", gradient: "from-blue-500 to-indigo-500" },
  "장소": { bg: "from-teal-100 to-cyan-100", border: "border-teal-400", icon: "📍", gradient: "from-teal-500 to-cyan-500" },
  "반대말": { bg: "from-purple-100 to-fuchsia-100", border: "border-purple-400", icon: "↔️", gradient: "from-purple-500 to-fuchsia-500" },
  "시간": { bg: "from-orange-100 to-amber-100", border: "border-orange-400", icon: "⏰", gradient: "from-orange-500 to-amber-500" },
  "일상표현": { bg: "from-lime-100 to-green-100", border: "border-lime-400", icon: "💬", gradient: "from-lime-500 to-green-500" },
  "옷": { bg: "from-fuchsia-100 to-pink-100", border: "border-fuchsia-400", icon: "👕", gradient: "from-fuchsia-500 to-pink-500" },
  "집": { bg: "from-amber-100 to-yellow-100", border: "border-amber-400", icon: "🏠", gradient: "from-amber-500 to-yellow-500" },
  "스포츠": { bg: "from-green-100 to-teal-100", border: "border-green-400", icon: "⚽", gradient: "from-green-500 to-teal-500" },
  "직업": { bg: "from-cyan-100 to-blue-100", border: "border-cyan-400", icon: "👨‍🔬", gradient: "from-cyan-500 to-blue-500" },
  "악기": { bg: "from-violet-100 to-purple-100", border: "border-violet-400", icon: "🎸", gradient: "from-violet-500 to-purple-500" },
  "형용사": { bg: "from-emerald-100 to-teal-100", border: "border-emerald-400", icon: "✨", gradient: "from-emerald-500 to-teal-500" },
  "문장": { bg: "from-blue-100 to-purple-100", border: "border-blue-400", icon: "📝", gradient: "from-blue-500 to-purple-500" },
};

// ============================================
// 🎮 난이도 설정
// ============================================
const difficultyConfig: Record<WordDifficulty, {
  label: string;
  color: string;
  bgColor: string;
  stars: number;
  xpMultiplier: number;
}> = {
  easy: { label: "쉬움", color: "text-green-600", bgColor: "bg-green-100", stars: 1, xpMultiplier: 1 },
  medium: { label: "보통", color: "text-yellow-600", bgColor: "bg-yellow-100", stars: 2, xpMultiplier: 1.5 },
  hard: { label: "어려움", color: "text-orange-600", bgColor: "bg-orange-100", stars: 3, xpMultiplier: 2 },
  expert: { label: "전문가", color: "text-red-600", bgColor: "bg-red-100", stars: 4, xpMultiplier: 3 },
};

// ============================================
// 🎉 파티클 효과
// ============================================
const fireConfetti = (type: "success" | "perfect" | "levelup") => {
  const configs = {
    success: {
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#10b981', '#14b8a6'],
    },
    perfect: {
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d'],
    },
    levelup: {
      particleCount: 150,
      spread: 180,
      startVelocity: 45,
      origin: { y: 0.5 },
      colors: ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
    },
  };
  confetti(configs[type]);
};

// ============================================
// 🔊 음성 재생 함수
// ============================================
const speakWord = (text: string, rate: number = 0.75) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
};

// ============================================
// 🎊 격려 메시지
// ============================================
const encouragements = {
  correct: [
    "대단해! 🌟", "완벽해! ⭐", "멋져요! 🎉", "천재야! 🧠",
    "굉장해! 🚀", "최고야! 👑", "잘했어! 💪", "브라보! 🎊"
  ],
  streak: [
    "불꽃 연속 정답! 🔥", "연속 성공! ⚡", "멈출 수 없어! 💫",
    "완전 집중! 🎯", "레전드! 🏆"
  ],
  wrong: [
    "괜찮아, 다시 해보자! 💪", "실수해도 돼! 🌈",
    "다음엔 맞출 수 있어! ⭐", "포기하지 마! 🔥"
  ],
};

const getRandomMessage = (type: "correct" | "streak" | "wrong") => {
  const messages = encouragements[type];
  return messages[Math.floor(Math.random() * messages.length)];
};

// ============================================
// 📊 레벨 시스템
// ============================================
const calculateLevel = (xp: number): { level: number; progress: number; nextXp: number } => {
  const levels = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 20000];
  let level = 1;
  for (let i = 1; i < levels.length; i++) {
    if (xp >= levels[i]) level = i + 1;
    else break;
  }
  const currentLevelXp = levels[level - 1] || 0;
  const nextLevelXp = levels[level] || levels[levels.length - 1];
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return { level, progress: Math.min(progress, 100), nextXp: nextLevelXp };
};

const levelTitles = [
  "영어 새싹 🌱", "영어 꼬마 🐣", "영어 친구 🤝", "영어 탐험가 🧭",
  "영어 모험가 ⚔️", "영어 마법사 🪄", "영어 영웅 🦸", "영어 챔피언 🏆",
  "영어 마스터 👑", "영어 레전드 🌟", "영어 신 ✨"
];

// ============================================
// 🎴 메인 컴포넌트
// ============================================
export default function FlashCard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  // 배지 시스템
  const { checkAndAwardBadges } = useBadges();

  // 게임 상태
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [mode, setMode] = useState<LearningMode>("classic");
  const [selectedCategories, setSelectedCategories] = useState<WordCategory[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<WordDifficulty | "all">("all");
  const [cardCount, setCardCount] = useState(10);

  // 학습 상태
  const [words, setWords] = useState<EnglishWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<number[]>([]);
  const [unknownWords, setUnknownWords] = useState<number[]>([]);

  // 게이미피케이션
  const [stats, setStats] = useState<LearningStats>({
    totalCards: 0,
    knownCards: 0,
    unknownCards: 0,
    streak: 0,
    maxStreak: 0,
    xp: 0,
    stars: 0,
    perfectRounds: 0,
  });
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [floatingXp, setFloatingXp] = useState<{ amount: number; id: number } | null>(null);

  // 매칭 게임
  const [matchCards, setMatchCards] = useState<MatchCard[]>([]);
  const [selectedMatchCards, setSelectedMatchCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [matchMoves, setMatchMoves] = useState(0);

  // 스펠링 게임
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingHint, setSpellingHint] = useState(0);
  const [showSpellingAnswer, setShowSpellingAnswer] = useState(false);

  // 클래식 퀴즈 모드 (4지선다)
  const [classicOptions, setClassicOptions] = useState<EnglishWord[]>([]);
  const [selectedClassicAnswer, setSelectedClassicAnswer] = useState<number | null>(null);
  const [isClassicAnswered, setIsClassicAnswered] = useState(false);

  // 듣기 게임
  const [listeningOptions, setListeningOptions] = useState<EnglishWord[]>([]);
  const [selectedListeningAnswer, setSelectedListeningAnswer] = useState<number | null>(null);
  const [isListeningAnswered, setIsListeningAnswered] = useState(false);

  // ============================================
  // 📚 단어 필터링 및 셔플
  // ============================================
  const filteredWords = useMemo(() => {
    let filtered = englishWordsData;

    // 카테고리 필터
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(w => selectedCategories.includes(w.category));
    }

    // 난이도 필터 (8세 영유 2년차 기준: easy, medium 위주)
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(w => w.difficulty === selectedDifficulty);
    } else {
      // 기본: easy 60%, medium 30%, hard 10%
      const easy = filtered.filter(w => w.difficulty === "easy");
      const medium = filtered.filter(w => w.difficulty === "medium");
      const hard = filtered.filter(w => w.difficulty === "hard");

      const easyCount = Math.ceil(cardCount * 0.6);
      const mediumCount = Math.ceil(cardCount * 0.3);
      const hardCount = cardCount - easyCount - mediumCount;

      filtered = [
        ...shuffleArray(easy).slice(0, easyCount),
        ...shuffleArray(medium).slice(0, mediumCount),
        ...shuffleArray(hard).slice(0, hardCount),
      ];
    }

    return filtered;
  }, [selectedCategories, selectedDifficulty, cardCount]);

  const availableCategories = useMemo(() => {
    const categories = new Set(englishWordsData.map(w => w.category));
    return Array.from(categories) as WordCategory[];
  }, []);

  // ============================================
  // 🎮 게임 시작
  // ============================================
  const startGame = () => {
    const shuffled = shuffleArray(filteredWords).slice(0, cardCount);
    if (shuffled.length === 0) {
      toast.error("선택한 조건에 맞는 단어가 없어요!");
      return;
    }

    setWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownWords([]);
    setUnknownWords([]);
    setStats({
      totalCards: shuffled.length,
      knownCards: 0,
      unknownCards: 0,
      streak: 0,
      maxStreak: 0,
      xp: 0,
      stars: 0,
      perfectRounds: 0,
    });

    if (mode === "classic") {
      // 전체 단어 풀에서 오답 보기 생성용으로 사용
      initClassicQuiz(shuffled[0], englishWordsData);
    } else if (mode === "matching") {
      initMatchingGame(shuffled.slice(0, Math.min(6, shuffled.length)));
    } else if (mode === "listening") {
      initListeningGame(shuffled[0], shuffled);
    }

    setPhase("learning");
  };

  // ============================================
  // 🃏 클래식 모드 핸들러
  // ============================================
  const currentWord = words[currentIndex];

  // 클래식 모드: 4지선다 옵션 생성
  const initClassicQuiz = useCallback((correctWord: EnglishWord, allWords: EnglishWord[]) => {
    // 같은 카테고리에서 오답 후보를 먼저 찾고, 부족하면 다른 카테고리에서 보충
    const sameCatWords = allWords.filter(w => w.id !== correctWord.id && w.category === correctWord.category);
    const otherWords = allWords.filter(w => w.id !== correctWord.id && w.category !== correctWord.category);

    const distractors: EnglishWord[] = [];
    const shuffledSameCat = shuffleArray(sameCatWords);
    const shuffledOther = shuffleArray(otherWords);

    // 같은 카테고리에서 먼저 채우기
    for (const w of shuffledSameCat) {
      if (distractors.length >= 3) break;
      if (!distractors.find(d => d.meaning === w.meaning)) distractors.push(w);
    }
    // 부족하면 다른 카테고리에서 보충
    for (const w of shuffledOther) {
      if (distractors.length >= 3) break;
      if (!distractors.find(d => d.meaning === w.meaning) && w.meaning !== correctWord.meaning) distractors.push(w);
    }

    const options = shuffleArray([correctWord, ...distractors]);
    setClassicOptions(options);
    setSelectedClassicAnswer(null);
    setIsClassicAnswered(false);
  }, []);

  const handleClassicAnswer = async (wordId: number) => {
    if (isClassicAnswered || !currentWord) return;

    setSelectedClassicAnswer(wordId);
    setIsClassicAnswered(true);

    const isCorrect = wordId === currentWord.id;

    if (isCorrect) {
      const xpGain = Math.floor(10 * difficultyConfig[currentWord.difficulty].xpMultiplier);
      const newStreak = stats.streak + 1;
      const starsGain = difficultyConfig[currentWord.difficulty].stars;

      setKnownWords(prev => [...prev, currentWord.id]);
      setStats(prev => ({
        ...prev,
        knownCards: prev.knownCards + 1,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        xp: prev.xp + xpGain,
        stars: prev.stars + starsGain,
      }));

      saveLearningProgress(currentWord.id, true);

      setFloatingXp({ amount: xpGain, id: Date.now() });
      setTimeout(() => setFloatingXp(null), 1000);

      if (newStreak >= 3 && newStreak % 3 === 0) {
        setShowStreakAnimation(true);
        fireConfetti("success");
        toast.success(getRandomMessage("streak"));
        setTimeout(() => setShowStreakAnimation(false), 1500);
      } else {
        toast.success(getRandomMessage("correct"));
      }

      speakWord(currentWord.word);
      setTimeout(() => nextCard(), 1500);
    } else {
      setUnknownWords(prev => [...prev, currentWord.id]);
      setStats(prev => ({
        ...prev,
        unknownCards: prev.unknownCards + 1,
        streak: 0,
      }));

      saveLearningProgress(currentWord.id, false);
      toast(getRandomMessage("wrong"), { icon: "💪" });

      // 오답 시 정답 확인 후 좀 더 오래 보여주기
      setTimeout(() => nextCard(), 2500);
    }
  };

  // 학습 기록 저장
  const saveLearningProgress = async (wordId: number, isCorrect: boolean) => {
    try {
      // 기존 진행률 확인
      const { data: existing } = await supabase
        .from('english_learning_progress')
        .select('*')
        .eq('juwoo_id', 1)
        .eq('word_id', wordId)
        .single();

      if (existing) {
        // 기존 기록 업데이트
        await supabase
          .from('english_learning_progress')
          .update({
            review_count: existing.review_count + 1,
            correct_count: existing.correct_count + (isCorrect ? 1 : 0),
            mastery_level: isCorrect ? Math.min(5, existing.mastery_level + 1) : Math.max(0, existing.mastery_level - 1),
            last_reviewed_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // 새 기록 생성
        await supabase
          .from('english_learning_progress')
          .insert({
            juwoo_id: 1,
            word_id: wordId,
            review_count: 1,
            correct_count: isCorrect ? 1 : 0,
            mastery_level: isCorrect ? 1 : 0,
            last_reviewed_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('학습 기록 저장 실패:', error);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setSpellingInput("");
    setSpellingHint(0);
    setShowSpellingAnswer(false);
    setSelectedListeningAnswer(null);
    setIsListeningAnswered(false);
    setSelectedClassicAnswer(null);
    setIsClassicAnswered(false);

    if (currentIndex < words.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (mode === "classic") {
        initClassicQuiz(words[nextIndex], englishWordsData);
      } else if (mode === "listening") {
        initListeningGame(words[nextIndex], words);
      }
    } else {
      finishGame();
    }
  };

  // ============================================
  // 🔗 매칭 게임
  // ============================================
  const initMatchingGame = (gameWords: EnglishWord[]) => {
    const cards: MatchCard[] = [];

    gameWords.forEach((word, idx) => {
      cards.push({
        id: `word-${idx}`,
        content: word.word,
        type: "word",
        wordId: word.id,
        isFlipped: false,
        isMatched: false,
      });
      cards.push({
        id: `meaning-${idx}`,
        content: word.meaning,
        type: "meaning",
        wordId: word.id,
        isFlipped: false,
        isMatched: false,
      });
    });

    setMatchCards(shuffleArray(cards));
    setSelectedMatchCards([]);
    setMatchedPairs([]);
    setMatchMoves(0);
  };

  const handleMatchCardClick = (cardId: string) => {
    const card = matchCards.find(c => c.id === cardId);
    if (!card || card.isMatched || selectedMatchCards.includes(cardId)) return;
    if (selectedMatchCards.length >= 2) return;

    const newSelected = [...selectedMatchCards, cardId];
    setSelectedMatchCards(newSelected);

    // 카드 뒤집기 애니메이션용
    setMatchCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newSelected.length === 2) {
      setMatchMoves(prev => prev + 1);

      const [first, second] = newSelected.map(id => matchCards.find(c => c.id === id)!);

      if (first.wordId === second.wordId && first.type !== second.type) {
        // 매치 성공!
        setTimeout(() => {
          setMatchCards(prev => prev.map(c =>
            c.wordId === first.wordId ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(prev => [...prev, first.wordId]);
          setSelectedMatchCards([]);

          const xpGain = 15;
          setStats(prev => ({
            ...prev,
            xp: prev.xp + xpGain,
            stars: prev.stars + 2,
            streak: prev.streak + 1,
          }));

          fireConfetti("success");
          toast.success("매칭 성공! 🎯");

          // 단어 발음
          const word = words.find(w => w.id === first.wordId);
          if (word) speakWord(word.word);
        }, 500);
      } else {
        // 매치 실패
        setTimeout(() => {
          setMatchCards(prev => prev.map(c =>
            newSelected.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setSelectedMatchCards([]);
          setStats(prev => ({ ...prev, streak: 0 }));
        }, 1000);
      }
    }
  };

  // 매칭 게임 완료 체크
  useEffect(() => {
    if (mode === "matching" && matchCards.length > 0) {
      if (matchCards.every(c => c.isMatched)) {
        setTimeout(() => finishGame(), 1000);
      }
    }
  }, [matchCards, mode]);

  // ============================================
  // ✏️ 스펠링 게임
  // ============================================
  const getSpellingHintText = () => {
    if (!currentWord) return "";
    const word = currentWord.word;
    if (spellingHint === 0) return "_".repeat(word.length).split("").join(" ");
    return word.split("").map((char, i) => i < spellingHint ? char : "_").join(" ");
  };

  const handleSpellingSubmit = () => {
    if (!currentWord) return;

    const isCorrect = spellingInput.toLowerCase().trim() === currentWord.word.toLowerCase();

    if (isCorrect) {
      const baseXp = 20;
      const hintPenalty = spellingHint * 3;
      const xpGain = Math.max(5, baseXp - hintPenalty);

      setStats(prev => ({
        ...prev,
        knownCards: prev.knownCards + 1,
        xp: prev.xp + xpGain,
        stars: prev.stars + (spellingHint === 0 ? 5 : 3),
        streak: prev.streak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
      }));

      fireConfetti("success");
      toast.success(`정답! +${xpGain} XP 🎉`);
      speakWord(currentWord.word);

      setTimeout(() => nextCard(), 1500);
    } else {
      setShowSpellingAnswer(true);
      setStats(prev => ({
        ...prev,
        unknownCards: prev.unknownCards + 1,
        streak: 0,
      }));
      toast.error("다음에 다시 도전해봐! 💪");
    }
  };

  const handleSpellingHint = () => {
    if (!currentWord) return;
    if (spellingHint < currentWord.word.length) {
      setSpellingHint(prev => prev + 1);
      toast("힌트를 사용했어요! 💡", { icon: "💡" });
    }
  };

  // ============================================
  // 🎧 듣기 게임
  // ============================================
  const initListeningGame = (correctWord: EnglishWord, allWords: EnglishWord[]) => {
    const otherWords = allWords.filter(w => w.id !== correctWord.id);
    const wrongOptions = shuffleArray(otherWords).slice(0, 3);
    const options = shuffleArray([correctWord, ...wrongOptions]);
    setListeningOptions(options);
    setSelectedListeningAnswer(null);
    setIsListeningAnswered(false);
  };

  const handleListeningAnswer = (wordId: number) => {
    if (isListeningAnswered || !currentWord) return;

    setSelectedListeningAnswer(wordId);
    setIsListeningAnswered(true);

    const isCorrect = wordId === currentWord.id;

    if (isCorrect) {
      const xpGain = 15;
      setStats(prev => ({
        ...prev,
        knownCards: prev.knownCards + 1,
        xp: prev.xp + xpGain,
        stars: prev.stars + 3,
        streak: prev.streak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
      }));

      fireConfetti("success");
      toast.success("정답! 귀가 좋아요! 👂✨");
    } else {
      setStats(prev => ({
        ...prev,
        unknownCards: prev.unknownCards + 1,
        streak: 0,
      }));
      toast.error(`정답은 "${currentWord.meaning}"이었어요!`);
    }

    setTimeout(() => nextCard(), 2000);
  };

  const playCurrentWord = () => {
    if (currentWord) {
      speakWord(currentWord.word, 0.7);
    }
  };

  // ============================================
  // 🏁 게임 종료
  // ============================================
  const finishGame = async () => {
    const accuracy = stats.totalCards > 0
      ? Math.round((stats.knownCards / stats.totalCards) * 100)
      : 0;

    const isPerfect = accuracy === 100;

    if (isPerfect) {
      setStats(prev => ({ ...prev, perfectRounds: prev.perfectRounds + 1 }));
      fireConfetti("perfect");
    } else {
      fireConfetti("success");
    }

    // 포인트 적립
    const basePoints = 500;
    const bonusPoints = Math.floor(stats.xp / 2);
    const totalPoints = basePoints + bonusPoints;

    await awardPoints(totalPoints, isPerfect);

    // 배지 체크 (학습 완료 후)
    setTimeout(() => {
      checkAndAwardBadges();
    }, 1000);

    setPhase("result");
  };

  // ============================================
  // 💰 포인트 적립
  // ============================================
  const awardPoints = async (points: number, isPerfect: boolean) => {
    try {
      const { data: profile } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      const currentBalance = profile?.current_points || 0;
      const newBalance = currentBalance + points;

      await supabase.from('point_transactions').insert({
        juwoo_id: 1,
        rule_id: null,
        amount: points,
        balance_after: newBalance,
        note: `플래시카드 학습 완료 (${mode} 모드)${isPerfect ? ' - 퍼펙트!' : ''}`,
        created_by: 1,
      });

      await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      toast.success(`🎉 ${points} 포인트 획득!`);
    } catch (error) {
      console.error('포인트 적립 오류:', error);
    }
  };

  // ============================================
  // 🔀 유틸리티
  // ============================================
  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // ============================================
  // 🔐 인증 체크
  // ============================================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="max-w-md w-full border-2 border-purple-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold mb-4">로그인이 필요해요!</h2>
              <p className="text-muted-foreground mb-6">
                재미있는 영어 학습을 하려면<br />먼저 로그인해주세요!
              </p>
              <a href={getLoginUrl()}>
                <Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
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
  // 🎯 설정 화면
  // ============================================
  if (phase === "setup") {
    const levelInfo = calculateLevel(stats.xp);

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950">
        <div className="container max-w-4xl py-6 px-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/english-learning">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                돌아가기
              </Button>
            </Link>
          </div>

          {/* 타이틀 */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold mb-4">
              <Sparkles className="h-4 w-4" />
              세계 최고의 플래시카드
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
              플래시카드 학습 🃏
            </h1>
            <p className="text-lg text-muted-foreground">
              재미있게 영어 단어를 배워봐요!
            </p>
          </motion.div>

          {/* 학습 모드 선택 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6 border-2 border-purple-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  학습 모드 선택
                </h2>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "classic" as LearningMode, icon: <Target className="h-8 w-8" />, label: "뜻 맞추기", desc: "4지선다 퀴즈", color: "from-blue-500 to-cyan-500" },
                    { id: "matching" as LearningMode, icon: <Shuffle className="h-8 w-8" />, label: "매칭 게임", desc: "짝 맞추기", color: "from-green-500 to-emerald-500" },
                    { id: "spelling" as LearningMode, icon: <Brain className="h-8 w-8" />, label: "스펠링", desc: "철자 맞추기", color: "from-orange-500 to-amber-500" },
                    { id: "listening" as LearningMode, icon: <Music className="h-8 w-8" />, label: "듣기", desc: "귀로 배우기", color: "from-purple-500 to-pink-500" },
                  ].map((m) => (
                    <motion.button
                      key={m.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode(m.id)}
                      className={`p-4 rounded-xl border-3 transition-all ${
                        mode === m.id
                          ? `border-purple-500 bg-gradient-to-br ${m.color} text-white shadow-lg`
                          : "border-gray-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <div className={`mb-2 ${mode === m.id ? "text-white" : "text-gray-600"}`}>
                        {m.icon}
                      </div>
                      <div className="font-bold text-sm">{m.label}</div>
                      <div className={`text-xs ${mode === m.id ? "text-white/80" : "text-gray-400"}`}>
                        {m.desc}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 카테고리 선택 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6 border-2 border-purple-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  카테고리 선택
                  <span className="text-sm font-normal opacity-80">
                    (선택 안하면 전체)
                  </span>
                </h2>
              </div>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => {
                    const theme = categoryThemes[cat];
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <motion.button
                        key={cat}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategories(prev => prev.filter(c => c !== cat));
                          } else {
                            setSelectedCategories(prev => [...prev, cat]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                          isSelected
                            ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md`
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {theme.icon} {cat}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 난이도 & 카드 수 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-4 mb-6"
          >
            {/* 난이도 */}
            <Card className="border-2 border-purple-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  난이도
                </h2>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "all" as const, label: "자동 추천", stars: "🌟", desc: "맞춤 난이도" },
                    { id: "easy" as WordDifficulty, label: "쉬움", stars: "⭐", desc: "기초 단어" },
                    { id: "medium" as WordDifficulty, label: "보통", stars: "⭐⭐", desc: "도전해보자" },
                    { id: "hard" as WordDifficulty, label: "어려움", stars: "⭐⭐⭐", desc: "실력 UP" },
                  ].map((d) => (
                    <motion.button
                      key={d.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDifficulty(d.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedDifficulty === d.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="font-bold text-sm">{d.label}</div>
                      <div className="text-xs text-gray-500">{d.stars} {d.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 카드 수 */}
            <Card className="border-2 border-purple-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  카드 개수
                </h2>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <motion.button
                      key={count}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCardCount(count)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        cardCount === count
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="font-black text-2xl text-center">{count}</div>
                      <div className="text-xs text-gray-500 text-center">장</div>
                    </motion.button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground text-center">
                  선택 가능: {filteredWords.length}개 단어
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 시작 버튼 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              onClick={startGame}
              disabled={filteredWords.length === 0}
              className="w-full h-16 text-xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 shadow-xl"
            >
              <Rocket className="h-6 w-6 mr-2" />
              학습 시작! 🚀
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // 📊 결과 화면
  // ============================================
  if (phase === "result") {
    const accuracy = stats.totalCards > 0
      ? Math.round((stats.knownCards / stats.totalCards) * 100)
      : 0;
    const levelInfo = calculateLevel(stats.xp);
    const isPerfect = accuracy === 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950">
        <div className="container max-w-4xl py-6 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <Card className="border-4 border-yellow-400 shadow-2xl overflow-hidden">
              {/* 헤더 */}
              <div className={`p-6 text-center ${isPerfect ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                <motion.div
                  animate={{
                    rotate: isPerfect ? [0, -10, 10, -10, 10, 0] : 0,
                    scale: isPerfect ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.5, repeat: isPerfect ? Infinity : 0, repeatDelay: 2 }}
                >
                  <div className="text-8xl mb-2">
                    {isPerfect ? "👑" : accuracy >= 80 ? "🏆" : accuracy >= 60 ? "🎉" : "💪"}
                  </div>
                </motion.div>
                <h1 className="text-4xl font-black text-white mb-2">
                  {isPerfect ? "퍼펙트!!" : "학습 완료!"}
                </h1>
                <p className="text-white/90 text-lg">
                  {isPerfect
                    ? "모든 단어를 맞췄어요! 천재야! 🌟"
                    : accuracy >= 80
                    ? "아주 잘했어요! 대단해! 🎊"
                    : accuracy >= 60
                    ? "잘했어요! 조금만 더 연습하면 완벽해요! 💫"
                    : "좋아요! 계속 연습하면 더 잘할 수 있어요! 🔥"}
                </p>
              </div>

              <CardContent className="p-6">
                {/* 점수 카드들 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-xl border-2 border-green-300 text-center"
                  >
                    <Check className="h-8 w-8 text-green-600 mx-auto mb-1" />
                    <div className="text-3xl font-black text-green-600">{stats.knownCards}</div>
                    <div className="text-sm text-green-700">맞힌 단어</div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-xl border-2 border-blue-300 text-center"
                  >
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-1" />
                    <div className="text-3xl font-black text-blue-600">{accuracy}%</div>
                    <div className="text-sm text-blue-700">정확도</div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-100 to-amber-100 p-4 rounded-xl border-2 border-orange-300 text-center"
                  >
                    <Flame className="h-8 w-8 text-orange-600 mx-auto mb-1" />
                    <div className="text-3xl font-black text-orange-600">{stats.maxStreak}</div>
                    <div className="text-sm text-orange-700">최대 연속</div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-300 text-center"
                  >
                    <Zap className="h-8 w-8 text-purple-600 mx-auto mb-1" />
                    <div className="text-3xl font-black text-purple-600">+{stats.xp}</div>
                    <div className="text-sm text-purple-700">XP 획득</div>
                  </motion.div>
                </div>

                {/* 별 획득 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="bg-gradient-to-r from-yellow-100 to-amber-100 p-4 rounded-xl border-2 border-yellow-300 mb-6 text-center"
                >
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: i < Math.min(5, Math.ceil(stats.stars / 5)) ? 1 : 0.3,
                          scale: 1
                        }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                      >
                        <Star
                          className={`h-10 w-10 ${i < Math.min(5, Math.ceil(stats.stars / 5)) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-lg font-bold text-yellow-700">
                    ⭐ {stats.stars}개 별 획득!
                  </div>
                </motion.div>

                {/* 버튼들 */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    onClick={() => {
                      setPhase("setup");
                      setStats({
                        totalCards: 0, knownCards: 0, unknownCards: 0,
                        streak: 0, maxStreak: 0, xp: 0, stars: 0, perfectRounds: 0
                      });
                    }}
                    className="h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    다시 학습하기
                  </Button>
                  <Link href="/english-quiz">
                    <Button size="lg" variant="outline" className="w-full h-14 border-2">
                      <Brain className="h-5 w-5 mr-2" />
                      퀴즈 도전
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
  // 🎮 학습 화면
  // ============================================
  const progress = ((knownWords.length + unknownWords.length) / words.length) * 100;
  const theme = currentWord ? categoryThemes[currentWord.category] : categoryThemes["동물"];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} dark:from-gray-900 dark:to-gray-800 transition-colors duration-500`}>
      <div className="container max-w-4xl py-4 px-4">
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPhase("setup")}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            설정
          </Button>

          {/* 스탯 바 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 bg-white/80 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-bold text-orange-600">{stats.streak}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-white/80 rounded-full">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-bold text-yellow-600">{stats.stars}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-white/80 rounded-full">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="font-bold text-purple-600">{stats.xp}</span>
            </div>
          </div>
        </div>

        {/* 진행률 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1 text-sm">
            <span className="font-medium">
              {mode === "matching"
                ? `${matchedPairs.length} / ${matchCards.length / 2} 짝`
                : `${currentIndex + 1} / ${words.length}`}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* 스트릭 애니메이션 */}
        <AnimatePresence>
          {showStreakAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-6xl font-black text-orange-500 drop-shadow-lg">
                🔥 {stats.streak} 연속! 🔥
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 플로팅 XP */}
        <AnimatePresence>
          {floatingXp && (
            <motion.div
              key={floatingXp.id}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -50, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-1/3 left-1/2 transform -translate-x-1/2 text-2xl font-black text-purple-600 z-50 pointer-events-none"
            >
              +{floatingXp.amount} XP
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== 클래식 모드 (4지선다 퀴즈) ===== */}
        {mode === "classic" && currentWord && (
          <motion.div
            key={currentIndex}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* 영어 단어 카드 */}
            <Card className={`border-4 ${theme.border} shadow-xl mb-6 overflow-hidden`}>
              <div className={`bg-gradient-to-r ${theme.gradient} p-3 flex items-center justify-between`}>
                <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
                  {theme.icon} {currentWord.category}
                </Badge>
                <Badge className="bg-white/20 text-white border-0 text-sm">
                  {difficultyConfig[currentWord.difficulty].label} {"⭐".repeat(difficultyConfig[currentWord.difficulty].stars)}
                </Badge>
              </div>
              <CardContent className="flex flex-col items-center justify-center p-6 py-8">
                <p className="text-sm text-muted-foreground mb-2">이 단어의 뜻은? 🤔</p>
                <motion.h2
                  className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentWord.word}
                </motion.h2>

                <Button
                  size="sm"
                  onClick={() => speakWord(currentWord.word)}
                  className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white shadow-lg`}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  발음 듣기 🔊
                </Button>
              </CardContent>
            </Card>

            {/* 4지선다 보기 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {classicOptions.map((option, idx) => {
                const isCorrect = option.id === currentWord.id;
                const isSelected = selectedClassicAnswer === option.id;
                const optionLabels = ["①", "②", "③", "④"];

                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={{ scale: isClassicAnswered ? 1 : 1.03 }}
                    whileTap={{ scale: isClassicAnswered ? 1 : 0.97 }}
                  >
                    <Button
                      onClick={() => handleClassicAnswer(option.id)}
                      disabled={isClassicAnswered}
                      variant="outline"
                      className={`w-full h-20 text-xl font-bold border-3 transition-all ${
                        isClassicAnswered
                          ? isCorrect
                            ? "bg-green-100 border-green-500 text-green-700 shadow-lg"
                            : isSelected
                            ? "bg-red-100 border-red-500 text-red-700"
                            : "opacity-40"
                          : "hover:border-purple-400 hover:bg-purple-50 bg-white"
                      }`}
                    >
                      <span className="mr-2 text-sm opacity-70">{optionLabels[idx]}</span>
                      {option.meaning}
                      {isClassicAnswered && isCorrect && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2"
                        >
                          ✅
                        </motion.span>
                      )}
                      {isClassicAnswered && isSelected && !isCorrect && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2"
                        >
                          ❌
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* 정답 후 추가 정보 표시 */}
            <AnimatePresence>
              {isClassicAnswered && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Card className={`border-2 ${selectedClassicAnswer === currentWord.id ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'} mb-4`}>
                    <CardContent className="p-4 text-center">
                      <p className="text-lg font-bold mb-1">
                        {currentWord.word} = {currentWord.meaning}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        {currentWord.pronunciation}
                      </p>
                      {currentWord.tip && (
                        <p className="text-sm text-yellow-700 flex items-center justify-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          {currentWord.tip}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 italic">
                        "{currentWord.example}" - {currentWord.exampleKorean}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===== 매칭 모드 ===== */}
        {mode === "matching" && (
          <div>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-1">짝을 찾아봐요! 🎯</h2>
              <p className="text-muted-foreground">영어와 뜻을 연결하세요</p>
              <Badge variant="outline" className="mt-2">
                시도 횟수: {matchMoves}
              </Badge>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {matchCards.map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                  whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
                >
                  <Card
                    onClick={() => handleMatchCardClick(card.id)}
                    className={`h-24 md:h-28 cursor-pointer transition-all border-3 ${
                      card.isMatched
                        ? "bg-green-100 border-green-400 opacity-60"
                        : selectedMatchCards.includes(card.id)
                        ? "bg-purple-100 border-purple-500 shadow-lg"
                        : "bg-white border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <CardContent className="flex items-center justify-center h-full p-2">
                      {card.isFlipped || card.isMatched ? (
                        <span className={`font-bold text-center ${
                          card.type === "word" ? "text-blue-600 text-lg md:text-xl" : "text-purple-600 text-base md:text-lg"
                        }`}>
                          {card.content}
                        </span>
                      ) : (
                        <span className="text-4xl">❓</span>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ===== 스펠링 모드 ===== */}
        {mode === "spelling" && currentWord && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`border-4 ${theme.border} shadow-xl mb-6`}>
              <CardContent className="p-6 text-center">
                <Badge className={`mb-4 bg-gradient-to-r ${theme.gradient} text-white border-0`}>
                  {theme.icon} {currentWord.category}
                </Badge>

                <h2 className="text-4xl md:text-5xl font-black mb-2 text-gray-800">
                  {currentWord.meaning}
                </h2>

                <Button
                  variant="ghost"
                  onClick={() => speakWord(currentWord.word)}
                  className="mb-4"
                >
                  <Volume2 className="h-5 w-5 mr-2" />
                  발음 듣기
                </Button>

                {/* 힌트 표시 */}
                <div className="text-3xl font-mono tracking-[0.5em] mb-4 text-gray-400">
                  {getSpellingHintText()}
                </div>

                {/* 입력 필드 */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={spellingInput}
                    onChange={(e) => setSpellingInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSpellingSubmit()}
                    placeholder="영어 단어를 입력하세요"
                    className="flex-1 px-4 py-3 text-xl border-2 rounded-xl focus:border-purple-500 focus:outline-none text-center"
                    disabled={showSpellingAnswer}
                  />
                </div>

                {showSpellingAnswer && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 mb-4"
                  >
                    <p className="text-blue-800">
                      정답: <span className="font-bold text-2xl">{currentWord.word}</span>
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleSpellingHint}
                    variant="outline"
                    disabled={spellingHint >= currentWord.word.length || showSpellingAnswer}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    힌트 ({spellingHint}/{currentWord.word.length})
                  </Button>

                  {!showSpellingAnswer ? (
                    <Button
                      onClick={handleSpellingSubmit}
                      className={`bg-gradient-to-r ${theme.gradient}`}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      확인
                    </Button>
                  ) : (
                    <Button onClick={nextCard}>
                      다음 <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ===== 듣기 모드 ===== */}
        {mode === "listening" && currentWord && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-4 border-purple-300 shadow-xl mb-6">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">👂</div>
                <h2 className="text-2xl font-bold mb-4">무슨 단어일까요?</h2>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={playCurrentWord}
                    className="mb-6 h-20 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Volume2 className="h-8 w-8 mr-2" />
                    <span className="text-xl">다시 듣기 🔊</span>
                  </Button>
                </motion.div>

                <div className="grid grid-cols-2 gap-3">
                  {listeningOptions.map((option, idx) => {
                    const isCorrect = option.id === currentWord.id;
                    const isSelected = selectedListeningAnswer === option.id;

                    return (
                      <motion.div
                        key={option.id}
                        whileHover={{ scale: isListeningAnswered ? 1 : 1.03 }}
                        whileTap={{ scale: isListeningAnswered ? 1 : 0.97 }}
                      >
                        <Button
                          onClick={() => handleListeningAnswer(option.id)}
                          disabled={isListeningAnswered}
                          variant="outline"
                          className={`w-full h-20 text-xl border-3 ${
                            isListeningAnswered
                              ? isCorrect
                                ? "bg-green-100 border-green-500 text-green-700"
                                : isSelected
                                ? "bg-red-100 border-red-500 text-red-700"
                                : "opacity-50"
                              : "hover:border-purple-400 hover:bg-purple-50"
                          }`}
                        >
                          {option.meaning}
                          {isListeningAnswered && isCorrect && " ✓"}
                          {isListeningAnswered && isSelected && !isCorrect && " ✗"}
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
