// 퀴즈 관련 타입 정의 - 글로벌 대기업 수준 업그레이드

// ===== 확장된 문제 유형 =====
export type QuestionType =
  | 'multiple-choice'        // 4지선다
  | 'true-false'             // O/X
  | 'fill-blank'             // 빈칸 채우기
  | 'sequence'               // 순서 맞추기 (스토리 순서, 사건 순서)
  | 'matching'               // 짝 맞추기 (캐릭터-특징, 원인-결과)
  | 'quote-speaker'          // 누가 이 말을 했을까?
  | 'emotion-guess'          // 캐릭터 감정 맞추기
  | 'what-if'                // 만약에 ~했다면? (상상력 문제)
  | 'scene-order'            // 이 장면은 몇 번째?
  | 'character-trait'        // 캐릭터 성격/특징
  | 'moral-lesson'           // 이야기의 교훈
  | 'cause-effect'           // 원인과 결과
  | 'spot-difference'        // 틀린 부분 찾기
  | 'word-puzzle'            // 단어 퍼즐/수수께끼
  | 'visual-choice'          // 이모지/그림 보고 맞추기
  | 'sound-word'             // 의성어/의태어 맞추기
  | 'relationship'           // 관계 맞추기 (친구, 가족 등)
  | 'location-guess'         // 장소 맞추기
  | 'time-order'             // 시간 순서 맞추기
  | 'compare-contrast';      // 비교하기

export type Difficulty = 'easy' | 'medium' | 'hard' | 'boss';
export type QuizTier = 'basic' | 'intermediate' | 'master';

// ===== 특수 효과 타입 =====
export type SpecialEffect =
  | 'confetti'               // 축하 효과
  | 'fireworks'              // 불꽃놀이
  | 'stars'                  // 별 효과
  | 'rainbow'                // 무지개 효과
  | 'shake'                  // 흔들림 효과
  | 'glow'                   // 빛나는 효과
  | 'bounce'                 // 통통 튀는 효과
  | 'sparkle';               // 반짝임 효과

// ===== 캐릭터 리액션 =====
export type CharacterReaction =
  | 'happy'                  // 기쁨
  | 'excited'                // 신남
  | 'proud'                  // 자랑스러움
  | 'thinking'               // 생각 중
  | 'surprised'              // 놀람
  | 'encouraging'            // 격려
  | 'celebrating';           // 축하

// ===== 파워업 타입 =====
export type PowerUp =
  | 'fifty-fifty'            // 2개 오답 제거
  | 'extra-time'             // 추가 시간
  | 'double-points'          // 포인트 2배
  | 'skip-question'          // 문제 스킵
  | 'reveal-hint'            // 무료 힌트
  | 'second-chance';         // 재도전 기회

// ===== 확장된 힌트 시스템 =====
export interface QuizHint {
  text?: string;                   // 일반 힌트 텍스트
  pageHint?: string;               // 책 페이지 힌트
  eliminateOption?: number;        // 제거할 오답 인덱스
  characterHint?: {                // 캐릭터 힌트
    character: string;             // 캐릭터 이름
    emoji: string;                 // 캐릭터 이모지
    message: string;               // 힌트 메시지 (말풍선 형태)
  };
  visualHint?: {                   // 시각적 힌트
    emoji: string;                 // 힌트 이모지들
    description: string;           // 설명
  };
  storyRecap?: string;             // 스토리 요약 힌트
  soundHint?: string;              // 소리/의성어 힌트
}

// ===== 매칭 문제용 아이템 =====
export interface MatchingItem {
  id: string;
  left: string;                    // 왼쪽 항목 (캐릭터, 원인 등)
  right: string;                   // 오른쪽 항목 (특징, 결과 등)
  leftEmoji?: string;              // 왼쪽 이모지
  rightEmoji?: string;             // 오른쪽 이모지
}

// ===== 순서 맞추기용 아이템 =====
export interface SequenceItem {
  id: string;
  text: string;                    // 순서 항목 텍스트
  emoji?: string;                  // 이모지
  correctOrder: number;            // 정답 순서 (1부터 시작)
}

// ===== 보너스 조건 =====
export interface BonusCondition {
  type: 'speed' | 'no-hint' | 'streak' | 'perfect';
  bonusPoints: number;
  description: string;
  emoji: string;
}

// ===== 확장된 퀴즈 문제 인터페이스 =====
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  question: string;

  // 서브 질문/설명 (복합 문제용)
  subQuestion?: string;
  context?: string;                // 문제 배경 설명

  // 비주얼 요소
  questionEmoji?: string;          // 문제 이모지
  image?: string;                  // 이미지 URL
  characterImage?: string;         // 캐릭터 이미지
  sceneDescription?: string;       // 장면 설명

  // 정답 관련
  correctAnswer: string;
  acceptableAnswers?: string[];    // 허용 가능한 다른 정답들

  // 보기 옵션 (multiple-choice, visual-choice 등)
  options?: string[];
  optionEmojis?: string[];         // 각 옵션별 이모지
  optionDescriptions?: string[];   // 각 옵션별 부가 설명

  // 매칭 문제용
  matchingItems?: MatchingItem[];

  // 순서 문제용
  sequenceItems?: SequenceItem[];

  // 인용문 문제용
  quote?: string;                  // 인용문
  speaker?: string;                // 화자
  speakerOptions?: string[];       // 화자 선택지

  // 감정 문제용
  emotionOptions?: {
    emotion: string;
    emoji: string;
    description: string;
  }[];

  // 설명 및 피드백
  explanation: string;
  correctFeedback?: string;        // 정답일 때 추가 피드백
  wrongFeedback?: string;          // 오답일 때 추가 피드백
  funFact?: string;                // 재미있는 사실

  // 포인트 시스템
  points: number;
  bonusConditions?: BonusCondition[];
  timeLimit?: number;              // 시간 제한 (초)
  timeBonusPerSecond?: number;     // 초당 시간 보너스 포인트

  // e북 연동 필드
  bookId: string;
  quizTier: QuizTier;
  pageReference: number;
  pageRange?: [number, number];    // 페이지 범위 (시작, 끝)

  // 힌트 시스템
  hints: QuizHint[];
  maxHints?: number;               // 최대 힌트 수

  // 특수 효과
  correctEffect?: SpecialEffect;
  wrongEffect?: SpecialEffect;
  characterReaction?: CharacterReaction;

  // 스토리 연계
  storyMoment?: string;            // 스토리에서 이 문제와 관련된 순간
  characterInvolved?: string[];    // 관련 캐릭터들

  // 난이도 표시
  isBossQuestion?: boolean;        // 보스 문제 여부
  isSpecialQuestion?: boolean;     // 특별 문제 여부
  specialLabel?: string;           // 특별 라벨 (예: "보너스 문제!")

  // 하위 호환용 (deprecated)
  hint?: string;
}

export interface QuizSet {
  bookId: string;
  bookTitle: string;
  basic: QuizQuestion[];
  intermediate: QuizQuestion[];
  master: QuizQuestion[];
}

// ===== 퀴즈 세션 상태 =====
export interface QuizSessionState {
  currentStreak: number;           // 현재 연속 정답
  maxStreak: number;               // 최대 연속 정답
  totalCorrect: number;            // 총 정답 수
  totalWrong: number;              // 총 오답 수
  hintsUsed: number;               // 사용한 힌트 수
  bonusEarned: number;             // 획득한 보너스 포인트
  powerUpsUsed: PowerUp[];         // 사용한 파워업
  startTime: Date;                 // 시작 시간
  questionsAnswered: number;       // 답변한 문제 수
}

// ===== 포인트 계산 함수 (강화버전) =====
export const calculateFinalPoints = (
  basePoints: number,
  hintsUsed: number,
  bonusPoints: number = 0,
  streakMultiplier: number = 1
): number => {
  // 힌트 1개당 10% 감소
  const reduction = hintsUsed * 0.1;
  const hintMultiplier = Math.max(0.1, 1 - reduction);

  // 기본 포인트 계산
  const baseResult = Math.round(basePoints * hintMultiplier);

  // 연속 정답 보너스 (최대 2배)
  const streakBonus = Math.min(streakMultiplier, 2);

  // 최종 포인트
  return Math.round((baseResult * streakBonus) + bonusPoints);
};

// ===== 연속 정답 배수 계산 =====
export const getStreakMultiplier = (streak: number): number => {
  if (streak < 2) return 1;
  if (streak === 2) return 1.1;
  if (streak === 3) return 1.2;
  if (streak === 4) return 1.3;
  if (streak === 5) return 1.5;
  return Math.min(2, 1 + (streak * 0.1)); // 최대 2배
};

// ===== 퀴즈 통과 여부 확인 =====
export const isQuizPassed = (correctCount: number, totalQuestions: number): boolean => {
  const percentage = (correctCount / totalQuestions) * 100;
  return percentage >= 60;
};

// ===== 등급 계산 =====
export type QuizGrade = 'S' | 'A' | 'B' | 'C' | 'F';
export const getQuizGrade = (correctCount: number, totalQuestions: number): QuizGrade => {
  const percentage = (correctCount / totalQuestions) * 100;
  if (percentage === 100) return 'S';
  if (percentage >= 80) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 40) return 'C';
  return 'F';
};

// ===== 등급별 이모지와 메시지 =====
export const GRADE_INFO: Record<QuizGrade, { emoji: string; message: string; color: string }> = {
  'S': { emoji: '👑', message: '완벽해요! 천재야!', color: 'from-yellow-400 to-amber-500' },
  'A': { emoji: '🌟', message: '대단해요! 최고!', color: 'from-purple-400 to-pink-500' },
  'B': { emoji: '⭐', message: '잘했어요! 통과!', color: 'from-blue-400 to-cyan-500' },
  'C': { emoji: '💪', message: '조금만 더 힘내요!', color: 'from-green-400 to-emerald-500' },
  'F': { emoji: '📚', message: '다시 읽어보고 도전해요!', color: 'from-gray-400 to-gray-500' },
};

// ===== 단계별 기본 포인트 =====
export const TIER_BASE_POINTS: Record<QuizTier, number> = {
  basic: 10,
  intermediate: 15,
  master: 25,
};

// ===== 단계별 완료 보상 포인트 =====
export const TIER_COMPLETION_BONUS: Record<QuizTier, number> = {
  basic: 50,
  intermediate: 100,
  master: 200,
};

// ===== 등급별 추가 보너스 =====
export const GRADE_BONUS: Record<QuizGrade, number> = {
  'S': 100,
  'A': 50,
  'B': 25,
  'C': 0,
  'F': 0,
};

// ===== 격려 메시지 (대폭 확장) =====
export const ENCOURAGEMENT_MESSAGES = {
  correct: [
    { text: "완벽해! 🎯", effect: "confetti" as SpecialEffect },
    { text: "대단해! 똑똒! 💡", effect: "stars" as SpecialEffect },
    { text: "역시 천재야! 🧠", effect: "sparkle" as SpecialEffect },
    { text: "와! 정확해! ✨", effect: "glow" as SpecialEffect },
    { text: "멋져! 계속 가보자! 🚀", effect: "bounce" as SpecialEffect },
    { text: "굿! 진짜 잘한다! 👍", effect: "stars" as SpecialEffect },
  ],
  wrong: [
    { text: "괜찮아! 다시 도전! 💪", emoji: "🤗" },
    { text: "아깝다! 한 번 더! 🔄", emoji: "😊" },
    { text: "실수해도 OK! 배우는 거야! 📚", emoji: "🌱" },
    { text: "다음엔 꼭 맞출 수 있어! ⭐", emoji: "💫" },
    { text: "힌트를 사용해볼까? 🔍", emoji: "🤔" },
  ],
  streak: [
    { count: 2, text: "2연속 정답! 좋아! 🔥", effect: "glow" as SpecialEffect },
    { count: 3, text: "3연속! 달리고 있어! 🏃", effect: "stars" as SpecialEffect },
    { count: 4, text: "4연속!! 멈출 수 없어! 🌟", effect: "fireworks" as SpecialEffect },
    { count: 5, text: "5연속!!! 레전드야!!! 👑", effect: "confetti" as SpecialEffect },
    { count: 6, text: "6연속!!!! 미쳤다!!!! 🏆", effect: "rainbow" as SpecialEffect },
  ],
  perfect: [
    "만점이야! 완벽한 퀴즈왕! 👑✨",
    "올 퍼펙트! 천재 드래곤 마스터! 🐲💎",
    "100점! 전설의 퀴즈 챔피언! 🏆🌈",
  ],
  almostPerfect: [
    "거의 다 맞았어! 대단해! 🌟",
    "아쉽지만 정말 잘했어! ⭐",
  ],
  improvement: [
    "점점 나아지고 있어! 💪",
    "전보다 훨씬 좋아! 🚀",
    "성장하고 있어! 🌱",
  ],
};

// ===== 티어 표시 정보 =====
export const TIER_INFO: Record<QuizTier, {
  emoji: string;
  label: string;
  color: string;
  bgGradient: string;
  description: string;
}> = {
  basic: {
    emoji: '🌱',
    label: '기초 퀴즈',
    color: 'green',
    bgGradient: 'from-green-400 to-emerald-500',
    description: '기본적인 내용을 확인해요!'
  },
  intermediate: {
    emoji: '⭐',
    label: '실력 퀴즈',
    color: 'amber',
    bgGradient: 'from-amber-400 to-orange-500',
    description: '조금 더 생각이 필요해요!'
  },
  master: {
    emoji: '🏆',
    label: '마스터 퀴즈',
    color: 'purple',
    bgGradient: 'from-purple-400 to-pink-500',
    description: '진정한 마스터만 도전!'
  },
};

// ===== 문제 유형별 정보 =====
export const QUESTION_TYPE_INFO: Record<QuestionType, {
  emoji: string;
  label: string;
  description: string;
}> = {
  'multiple-choice': { emoji: '🔢', label: '4지선다', description: '4개 중 정답을 골라요!' },
  'true-false': { emoji: '⭕', label: 'O/X 퀴즈', description: '맞으면 O, 틀리면 X!' },
  'fill-blank': { emoji: '✏️', label: '빈칸 채우기', description: '빈칸에 들어갈 말을 적어요!' },
  'sequence': { emoji: '📋', label: '순서 맞추기', description: '올바른 순서로 나열해요!' },
  'matching': { emoji: '🔗', label: '짝 맞추기', description: '어울리는 짝을 연결해요!' },
  'quote-speaker': { emoji: '💬', label: '누가 말했을까?', description: '이 말을 한 캐릭터는?' },
  'emotion-guess': { emoji: '😊', label: '감정 맞추기', description: '캐릭터의 기분은 어땠을까?' },
  'what-if': { emoji: '🤔', label: '상상력 문제', description: '만약에 ~했다면?' },
  'scene-order': { emoji: '🎬', label: '장면 순서', description: '이 장면은 몇 번째?' },
  'character-trait': { emoji: '👤', label: '캐릭터 특징', description: '캐릭터는 어떤 성격일까?' },
  'moral-lesson': { emoji: '💡', label: '교훈 찾기', description: '이야기가 주는 교훈은?' },
  'cause-effect': { emoji: '➡️', label: '원인과 결과', description: '왜 그런 일이 일어났을까?' },
  'spot-difference': { emoji: '🔍', label: '다른 점 찾기', description: '이상한 부분을 찾아요!' },
  'word-puzzle': { emoji: '🧩', label: '단어 퍼즐', description: '수수께끼를 풀어요!' },
  'visual-choice': { emoji: '🖼️', label: '그림 퀴즈', description: '이모지/그림을 보고 맞춰요!' },
  'sound-word': { emoji: '🔊', label: '소리 표현', description: '어떤 소리일까?' },
  'relationship': { emoji: '👥', label: '관계 맞추기', description: '둘의 관계는?' },
  'location-guess': { emoji: '📍', label: '장소 맞추기', description: '어디에서 일어난 일일까?' },
  'time-order': { emoji: '⏰', label: '시간 순서', description: '언제 일어난 일일까?' },
  'compare-contrast': { emoji: '⚖️', label: '비교하기', description: '무엇이 다를까?' },
};

// ===== 보너스 조건 프리셋 =====
export const BONUS_PRESETS: BonusCondition[] = [
  { type: 'speed', bonusPoints: 5, description: '10초 안에 정답!', emoji: '⚡' },
  { type: 'no-hint', bonusPoints: 10, description: '힌트 없이 정답!', emoji: '🎯' },
  { type: 'streak', bonusPoints: 15, description: '3연속 정답 보너스!', emoji: '🔥' },
  { type: 'perfect', bonusPoints: 50, description: '올 퍼펙트 보너스!', emoji: '👑' },
];

// ===== 캐릭터 리액션 이모지 =====
export const CHARACTER_REACTIONS: Record<CharacterReaction, string> = {
  happy: '😄',
  excited: '🤩',
  proud: '😤',
  thinking: '🤔',
  surprised: '😲',
  encouraging: '💪',
  celebrating: '🎉',
};

// ===== 특수 효과 설정 =====
export const SPECIAL_EFFECTS: Record<SpecialEffect, {
  duration: number;
  className: string;
}> = {
  confetti: { duration: 3000, className: 'animate-confetti' },
  fireworks: { duration: 2500, className: 'animate-fireworks' },
  stars: { duration: 2000, className: 'animate-stars' },
  rainbow: { duration: 3000, className: 'animate-rainbow' },
  shake: { duration: 500, className: 'animate-shake' },
  glow: { duration: 1500, className: 'animate-glow' },
  bounce: { duration: 1000, className: 'animate-bounce' },
  sparkle: { duration: 2000, className: 'animate-sparkle' },
};
