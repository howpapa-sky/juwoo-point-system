// ============================================
// 퀴즈 문제 출제 엔진 (SRS + 스마트 오답 생성)
// ============================================
import {
  englishWordsData,
  type EnglishWord,
  type WordCategory,
  type WordDifficulty,
} from '@/data/englishWordsData';
import type { QuizMode } from './quizConstants';
import { SESSION_CONFIG, ADAPTIVE_PATTERN } from './quizConstants';

export interface QuizQuestion {
  word: EnglishWord;
  questionType: QuizMode;
  options?: string[];
  correctAnswer: string;
  scrambledLetters?: string[];
  imageOptions?: string[];
  isIntroCard?: boolean;
  isBonusRound?: boolean;
}

// 단어별 이모지 매핑 (그림 맞추기용)
export const wordEmojiMap: Record<string, string> = {
  cat: '🐱', dog: '🐕', bird: '🐦', fish: '🐟', cow: '🐄',
  pig: '🐷', duck: '🦆', hen: '🐔', horse: '🐴', sheep: '🐑',
  rabbit: '🐰', frog: '🐸', bear: '🐻', lion: '🦁', tiger: '🐯',
  monkey: '🐒', elephant: '🐘', mouse: '🐭', snake: '🐍', turtle: '🐢',
  whale: '🐋', dolphin: '🐬', penguin: '🐧', owl: '🦉', bee: '🐝',
  ant: '🐜', butterfly: '🦋', snail: '🐌', shark: '🦈', crab: '🦀',
  octopus: '🐙', fox: '🦊', deer: '🦌', gorilla: '🦍', zebra: '🦓',
  giraffe: '🦒', kangaroo: '🦘', koala: '🐨', panda: '🐼', hamster: '🐹',
  wolf: '🐺', bat: '🦇', eagle: '🦅', parrot: '🦜', swan: '🦢',
  peacock: '🦚', flamingo: '🦩', hedgehog: '🦔', squirrel: '🐿️', camel: '🐫',
  hippo: '🦛', rhino: '🦏', seal: '🦭', otter: '🦦', raccoon: '🦝',
  bread: '🍞', rice: '🍚', egg: '🥚', milk: '🥛', water: '💧',
  pizza: '🍕', cake: '🎂', cookie: '🍪', candy: '🍬', chocolate: '🍫',
  cheese: '🧀', soup: '🍲', salad: '🥗', sandwich: '🥪',
  hamburger: '🍔', spaghetti: '🍝', sushi: '🍣',
  apple: '🍎', banana: '🍌', orange: '🍊', grape: '🍇', lemon: '🍋',
  strawberry: '🍓', watermelon: '🍉', peach: '🍑', cherry: '🍒', pineapple: '🍍',
  mango: '🥭', coconut: '🥥', kiwi: '🥝', avocado: '🥑', pear: '🍐',
  one: '1️⃣', two: '2️⃣', three: '3️⃣', four: '4️⃣', five: '5️⃣',
  six: '6️⃣', seven: '7️⃣', eight: '8️⃣', nine: '9️⃣', ten: '🔟',
  red: '🔴', blue: '🔵', yellow: '🟡', green: '🟢',
  purple: '🟣', pink: '🩷', white: '⚪', black: '⚫', brown: '🟤',
  rainbow: '🌈',
  mom: '👩', dad: '👨', baby: '👶', family: '👨‍👩‍👧',
  brother: '👦', sister: '👧', grandma: '👵', grandpa: '👴',
};

// 카테고리별 이모지 그룹
const getCategoryEmojis = (category: string): string[] => {
  const emojisByCategory: Record<string, string[]> = {
    '동물': ['🐱', '🐕', '🐦', '🐟', '🐄', '🐷', '🦆', '🐔', '🐴', '🐑', '🐰', '🐸', '🐻', '🦁', '🐯', '🐒', '🐘', '🐭', '🐍', '🐢'],
    '음식': ['🍞', '🍚', '🥚', '🥛', '🍕', '🎂', '🍪', '🍬', '🍫', '🧀', '🍲', '🥗', '🥪', '🍔', '🍝', '🍣'],
    '과일': ['🍎', '🍌', '🍊', '🍇', '🍋', '🍓', '🍉', '🍑', '🍒', '🍍', '🥭', '🥥', '🥝', '🥑'],
    '숫자': ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
    '색깔': ['🔴', '🔵', '🟡', '🟢', '🟠', '🟣', '🩷', '⚪', '⚫', '🟤', '🌈'],
    '가족': ['👩', '👨', '👶', '👨‍👩‍👧', '👦', '👧', '👵', '👴', '🧒', '👪'],
  };
  return emojisByCategory[category] ?? [];
};

// 배열 섞기
const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// 스마트 오답 생성
export const generateSmartDistractors = (
  word: EnglishWord,
  field: 'meaning' | 'word',
): string[] => {
  const pool = englishWordsData.filter(w => w.id !== word.id);
  const sameCatDiff = pool.filter(w => w.category === word.category && w.difficulty === word.difficulty);
  const sameCat = pool.filter(w => w.category === word.category);
  const sameDiff = pool.filter(w => w.difficulty === word.difficulty);

  const used = new Set<number>();
  const result: string[] = [];

  const addFrom = (source: EnglishWord[]) => {
    const shuffled = shuffleArray(source);
    for (const w of shuffled) {
      if (result.length >= 2) break;
      if (used.has(w.id)) continue;
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

  // 폴백: 풀이 부족할 때 아무 단어에서라도 가져오기
  if (result.length < 2) {
    const fallback = englishWordsData
      .filter(w => w.id !== word.id && !result.includes(w[field]))
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 - result.length)
      .map(w => w[field]);
    result.push(...fallback);
  }

  return result;
};

// 이모지 옵션 생성
export const getImageOptions = (word: string, category?: string): string[] => {
  const lower = word.toLowerCase();
  const correctEmoji = wordEmojiMap[lower];

  if (!correctEmoji) {
    return shuffleArray(['❓', '🎯', '💫']);
  }

  const categoryPool = category ? getCategoryEmojis(category) : [];
  const wrongEmojis = categoryPool
    .filter(e => e !== correctEmoji)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  if (wrongEmojis.length < 2) {
    const allEmojis = Object.values(wordEmojiMap);
    const unique = Array.from(new Set(allEmojis)).filter(e => e !== correctEmoji && !wrongEmojis.includes(e));
    wrongEmojis.push(...unique.sort(() => Math.random() - 0.5).slice(0, 2 - wrongEmojis.length));
  }

  return shuffleArray([correctEmoji, ...wrongEmojis]);
};

// 문제 유형 결정 (숙련도 기반)
export const getQuestionTypeForMastery = (masteryLevel: number): QuizMode => {
  if (masteryLevel <= 1) {
    return shuffleArray(['multiple-choice', 'listening', 'picture-match'] as QuizMode[])[0];
  }
  if (masteryLevel === 2) {
    return shuffleArray(['matching', 'fill-blank', 'multiple-choice'] as QuizMode[])[0];
  }
  return shuffleArray(['typing', 'reverse', 'word-scramble'] as QuizMode[])[0];
};

// 문제 생성
export const generateQuestions = (
  mode: QuizMode,
  difficulty: WordDifficulty | 'all',
  category: WordCategory | 'all',
  count?: number,
): QuizQuestion[] => {
  let wordPool = [...englishWordsData];

  if (category !== 'all') {
    wordPool = wordPool.filter(w => w.category === category);
  }
  if (difficulty !== 'all') {
    wordPool = wordPool.filter(w => w.difficulty === difficulty);
  }
  if (wordPool.length < 10) {
    wordPool = [...englishWordsData];
  }

  const totalCount = count ?? (mode === 'speed-round' || mode === 'survival' ? 50 : SESSION_CONFIG.defaultQuestionCount);
  const shuffled = shuffleArray(wordPool).slice(0, totalCount);
  const modes: QuizMode[] = ['multiple-choice', 'typing', 'listening', 'reverse', 'matching', 'fill-blank'];

  return shuffled.map((word, index) => {
    let questionType: QuizMode = mode;

    if (mode === 'mixed') {
      questionType = modes[index % modes.length];
    } else if (mode === 'speed-round' || mode === 'time-attack' || mode === 'survival' || mode === 'boss-battle') {
      questionType = 'multiple-choice';
    }

    let options: string[] | undefined;
    let scrambledLetters: string[] | undefined;
    let imageOptions: string[] | undefined;

    if (['multiple-choice', 'listening', 'fill-blank', 'typing', 'picture-match'].includes(questionType) ||
        ['speed-round', 'time-attack', 'survival', 'boss-battle'].includes(mode)) {
      const wrongAnswers = generateSmartDistractors(word, 'meaning');
      options = shuffleArray([...wrongAnswers, word.meaning]);
    } else if (questionType === 'reverse') {
      const wrongAnswers = generateSmartDistractors(word, 'word');
      options = shuffleArray([...wrongAnswers, word.word]);
    } else if (questionType === 'word-scramble' || mode === 'word-scramble') {
      scrambledLetters = shuffleArray(word.word.split(''));
      questionType = 'word-scramble';
    }

    return {
      word,
      questionType: mode === 'word-scramble' ? 'word-scramble' : questionType,
      options,
      correctAnswer: questionType === 'reverse' ? word.word : word.meaning,
      scrambledLetters,
      imageOptions,
    };
  });
};

// 정답 체크 (오타 허용)
export const checkAnswer = (
  answer: string,
  correctAnswer: string,
  questionType: QuizMode,
): boolean => {
  const normalizedAnswer = answer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.toLowerCase();
  if (normalizedAnswer === normalizedCorrect) return true;

  if (questionType === 'typing' || questionType === 'reverse') {
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

// 난이도에 따른 적응형 패턴 인덱스
export const getAdaptiveDifficulty = (index: number): string => {
  return ADAPTIVE_PATTERN[index % ADAPTIVE_PATTERN.length];
};

// XP 계산
export const calculateXPRequired = (level: number): number =>
  Math.floor(100 * Math.pow(1.3, level - 1));

// 별점 계산
export const calculateStarRating = (correctCount: number, totalQuestions: number): number => {
  const percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  if (percent >= 90) return 3;
  if (percent >= 70) return 2;
  if (percent >= 40) return 1;
  return 0;
};
