// ============================================
// 영어 퀴즈 상수 중앙 관리
// ============================================

// 색상 팔레트 (빨간색 완전 금지!)
export const QUIZ_COLORS = {
  correct: '#58CC02',
  incorrect: '#FF9600',    // 빨간색 대신 주황색!
  primary: '#7B61FF',
  comboGold: '#FFC800',
  seed: '#A0D468',
  sprout: '#58CC02',
  tree: '#2B9A00',
  star: '#FFC800',
  crown: '#FF9600',
  disabled: '#E5E5E5',
} as const;

// 숙련도 레벨
export const MASTERY_LEVELS = [
  { level: 0, icon: '🌱', name: '씨앗', reviewDays: 0 },
  { level: 1, icon: '🌿', name: '새싹', reviewDays: 1 },
  { level: 2, icon: '🌳', name: '나무', reviewDays: 3 },
  { level: 3, icon: '🌟', name: '마스터', reviewDays: 7 },
  { level: 4, icon: '👑', name: '전설', reviewDays: 14 },
] as const;

// XP 레벨 칭호
export const LEVEL_TITLES = [
  { level: 1, title: '영어 새싹', icon: '🌱', requiredXP: 0 },
  { level: 2, title: '단어 탐험가', icon: '🔍', requiredXP: 100 },
  { level: 3, title: '영어 모험가', icon: '🗺️', requiredXP: 300 },
  { level: 4, title: '단어 사냥꾼', icon: '🏹', requiredXP: 600 },
  { level: 5, title: '영어 마법사', icon: '🧙', requiredXP: 1000 },
  { level: 6, title: '단어 영웅', icon: '🦸', requiredXP: 1500 },
  { level: 7, title: '영어 전설', icon: '👑', requiredXP: 2100 },
] as const;

// XP 보너스
export const XP_BONUS = {
  sessionComplete: 50,
  perfectScore: 30,
  combo5: 20,
  noHints: 10,
  bonusRoundClear: 15,
  newWordMaster: 25,
} as const;

// 세션 설정
export const SESSION_CONFIG = {
  defaultQuestionCount: 10,
  warmupCount: 2,
  maxBonusRound: 3,
  questionMix: {
    review: 0.4,    // 40% 복습 대상
    newWord: 0.2,   // 20% 새 단어
    reinforce: 0.4, // 40% 강화
  },
} as const;

// 적응형 난이도 패턴 (쉬움→쉬움→보통→쉬움→어려움→쉬움)
export const ADAPTIVE_PATTERN = ['easy', 'easy', 'medium', 'easy', 'hard', 'easy'] as const;

// 연속 오답 시 회복 설정
export const RECOVERY_CONFIG = {
  consecutiveWrongThreshold: 2,
  recoveryEasyCount: 3,
} as const;

// 찍기 감지
export const GUESSING_CONFIG = {
  fastAnswerThreshold: 3000, // 3초 이내
  patternWindow: 5,
  patternThreshold: 4,
} as const;

// 테마 시스템
export const QUIZ_THEMES = {
  default: {
    name: '기본', icon: '🌈',
    primary: 'from-blue-500 to-purple-500',
    secondary: 'from-blue-100 via-purple-100 to-pink-100',
    card: 'border-blue-400', accent: 'blue',
  },
  pokemon: {
    name: '포켓몬', icon: '⚡',
    primary: 'from-yellow-400 to-orange-500',
    secondary: 'from-yellow-100 via-orange-100 to-orange-100',
    card: 'border-yellow-400', accent: 'yellow',
  },
  ocean: {
    name: '바다', icon: '🌊',
    primary: 'from-cyan-500 to-blue-500',
    secondary: 'from-cyan-100 via-blue-100 to-indigo-100',
    card: 'border-cyan-400', accent: 'cyan',
  },
  forest: {
    name: '숲', icon: '🌲',
    primary: 'from-green-500 to-emerald-500',
    secondary: 'from-green-100 via-emerald-100 to-teal-100',
    card: 'border-green-400', accent: 'green',
  },
  candy: {
    name: '캔디', icon: '🍬',
    primary: 'from-pink-500 to-rose-500',
    secondary: 'from-pink-100 via-rose-100 to-fuchsia-100',
    card: 'border-pink-400', accent: 'pink',
  },
  space: {
    name: '우주', icon: '🚀',
    primary: 'from-violet-500 to-purple-600',
    secondary: 'from-violet-100 via-purple-100 to-indigo-100',
    card: 'border-violet-400', accent: 'violet',
  },
} as const;

export type ThemeKey = keyof typeof QUIZ_THEMES;

// 게임 모드 정의
export type QuizMode =
  | 'multiple-choice' | 'typing' | 'listening' | 'reverse' | 'mixed'
  | 'picture-match' | 'word-scramble' | 'matching' | 'fill-blank'
  | 'speed-round' | 'time-attack' | 'boss-battle' | 'survival';

export type GameState = 'menu' | 'playing' | 'result';

export type SessionPhase = 'greeting' | 'warmup' | 'intro-card' | 'main' | 'bonus-round' | 'complete';

// 배지
export interface Badge {
  id: string;
  name: string;
  icon: string;
  condition: string;
  earned: boolean;
}

export const ALL_BADGES: Badge[] = [
  { id: 'first_quiz', name: '첫 걸음', icon: '🌟', condition: '첫 퀴즈 완료', earned: false },
  { id: 'perfect_10', name: '완벽주의자', icon: '💯', condition: '10문제 전문 정답', earned: false },
  { id: 'streak_5', name: '달리기 시작', icon: '🏃', condition: '5연속 정답', earned: false },
  { id: 'streak_10', name: '멈출 수 없어', icon: '🔥', condition: '10연속 정답', earned: false },
  { id: 'streak_20', name: '전설의 시작', icon: '⚡', condition: '20연속 정답', earned: false },
  { id: 'speed_demon', name: '번개 손', icon: '⚡', condition: '스피드 라운드 20개', earned: false },
  { id: 'survivor', name: '서바이버', icon: '🏅', condition: '서바이벌 20문제', earned: false },
  { id: 'boss_slayer', name: '보스 슬레이어', icon: '🗡️', condition: '보스 배틀 승리', earned: false },
  { id: 'level_10', name: '초보 졸업', icon: '🎓', condition: '레벨 10 달성', earned: false },
  { id: 'level_25', name: '중급자', icon: '📚', condition: '레벨 25 달성', earned: false },
  { id: 'animal_master', name: '동물 박사', icon: '🦁', condition: '동물 50단어 마스터', earned: false },
  { id: 'word_collector', name: '단어 수집가', icon: '📖', condition: '50단어 마스터', earned: false },
  { id: 'fire_start', name: '불꽃 시작', icon: '🔥', condition: '3일 연속 학습', earned: false },
  { id: 'target_10', name: '10연속', icon: '🎯', condition: '10문제 연속 정답', earned: false },
  { id: 'word_100', name: '100단어', icon: '🏆', condition: '100단어 마스터', earned: false },
  { id: 'category_king', name: '카테고리 정복', icon: '🌍', condition: '한 카테고리 전체 마스터', earned: false },
  { id: 'boss_hunter', name: '보스 사냥꾼', icon: '🐉', condition: '보스 배틀 5회 클리어', earned: false },
];

// 보스 정의
export const BOSSES = [
  { name: '피카츄', emoji: '⚡' },
  { name: '파이리', emoji: '🔥' },
  { name: '꼬부기', emoji: '💧' },
  { name: '이상해씨', emoji: '🌿' },
  { name: '뮤츠', emoji: '👾' },
] as const;

// 포인트 지급 기준
export const POINT_REWARDS = {
  perfect: 3000,
  over90: 2500,
  over80: 2000,
  over70: 1500,
  over50: 1000,
  participation: 500,
  bossKill: 5000,
  speedPerCorrect: 100,
  survivalPerCorrect: 150,
  streakBonus10: 500,
  streakBonus5: 200,
} as const;
