// ============================================
// 영어학습 공유 상수
// ============================================

// SRS 박스별 복습 간격 (일)
export const SRS_REVIEW_INTERVALS: Record<number, number> = {
  1: 0,   // 즉시 (같은 세션)
  2: 1,   // 1일 후
  3: 3,   // 3일 후
  4: 7,   // 7일 후
  5: 14,  // 14일 후
};

// SRS 박스별 메타포
export const SRS_BOX_META: Record<number, { icon: string; label: string; description: string }> = {
  1: { icon: '🌱', label: '씨앗', description: '방금 심었어요!' },
  2: { icon: '🌿', label: '새싹', description: '자라고 있어요!' },
  3: { icon: '🌳', label: '나무', description: '튼튼해지고 있어요!' },
  4: { icon: '🌸', label: '꽃', description: '꽃이 피었어요!' },
  5: { icon: '⭐', label: '별', description: '마스터! 완벽해요!' },
};

// 하루 최대 복습 단어 수
export const MAX_DAILY_REVIEW = 15;
// 새 단어 학습 수 (세션당)
export const NEW_WORDS_PER_SESSION = 5;

// 난이도 타입
export type Difficulty = 'easy' | 'medium' | 'hard';

// 찍기 감지 임계값
export const GUESSING_TIME_THRESHOLD_MS = 3000;
export const GUESSING_REPEAT_THRESHOLD = 4;

// XP 획득 테이블
export const XP_TABLE = {
  quiz_correct_easy: 5,
  quiz_correct_medium: 8,
  quiz_correct_hard: 12,
  quiz_attempt_wrong: 2,
  quiz_dont_know: 2,
  pronunciation_excellent: 10,
  pronunciation_good: 6,
  pronunciation_tried: 3,
  story_completed: 15,
  daily_review_completed: 10,
  streak_3days: 20,
  streak_7days: 50,
  new_word_learned: 3,
  word_mastered: 10,
} as const;

// 레벨 시스템
export interface EnglishLevel {
  level: number;
  title: string;
  requiredXP: number;
  reward: string;
  rewardPoints: number;
}

export const LEVELS: EnglishLevel[] = [
  { level: 1,  title: '영어 탐험가 🌱',       requiredXP: 0,     reward: '탐험가 배지',            rewardPoints: 0 },
  { level: 2,  title: '단어 수집가 📝',       requiredXP: 50,    reward: '50 포인트',              rewardPoints: 50 },
  { level: 3,  title: '문장 만들기 🔤',       requiredXP: 120,   reward: '문장 배지',              rewardPoints: 0 },
  { level: 4,  title: '듣기 연습생 👂',       requiredXP: 200,   reward: '100 포인트',             rewardPoints: 100 },
  { level: 5,  title: '발음 연습생 🎤',       requiredXP: 300,   reward: '200 포인트',             rewardPoints: 200 },
  { level: 6,  title: '영어 친구 🤝',         requiredXP: 420,   reward: '150 포인트',             rewardPoints: 150 },
  { level: 7,  title: '단어 농부 🌾',         requiredXP: 560,   reward: '200 포인트',             rewardPoints: 200 },
  { level: 8,  title: '이야기 친구 📖',       requiredXP: 720,   reward: '250 포인트',             rewardPoints: 250 },
  { level: 9,  title: '영어 용사 ⚔️',         requiredXP: 900,   reward: '300 포인트',             rewardPoints: 300 },
  { level: 10, title: '영어 챔피언 🏆',       requiredXP: 1100,  reward: '500 포인트 + 챔피언 배지', rewardPoints: 500 },
  { level: 11, title: '지식 탐험가 🔭',       requiredXP: 1320,  reward: '300 포인트',             rewardPoints: 300 },
  { level: 12, title: '단어 마법사 🪄',       requiredXP: 1560,  reward: '350 포인트',             rewardPoints: 350 },
  { level: 13, title: '문장 조합가 🧩',       requiredXP: 1820,  reward: '400 포인트',             rewardPoints: 400 },
  { level: 14, title: '발음 달인 🎵',         requiredXP: 2100,  reward: '450 포인트',             rewardPoints: 450 },
  { level: 15, title: '스토리 마스터 📚',     requiredXP: 2400,  reward: '1000 포인트',            rewardPoints: 1000 },
  { level: 16, title: '영어 학자 🎓',         requiredXP: 2720,  reward: '500 포인트',             rewardPoints: 500 },
  { level: 17, title: '언어 여행자 ✈️',       requiredXP: 3060,  reward: '550 포인트',             rewardPoints: 550 },
  { level: 18, title: '영어 박사 🧑‍🔬',       requiredXP: 3420,  reward: '600 포인트',             rewardPoints: 600 },
  { level: 19, title: '단어 왕 👑',           requiredXP: 3800,  reward: '700 포인트',             rewardPoints: 700 },
  { level: 20, title: '영어 히어로 🦸',       requiredXP: 4200,  reward: '히어로 배지 + 특별 보상',  rewardPoints: 1500 },
];

// 레벨 구하기
export function getLevelFromXP(totalXP: number): EnglishLevel {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXP >= lvl.requiredXP) {
      current = lvl;
    } else {
      break;
    }
  }
  return current;
}

// 다음 레벨까지 진행률
export function getLevelProgress(totalXP: number): { current: EnglishLevel; next: EnglishLevel | null; progress: number } {
  const current = getLevelFromXP(totalXP);
  const currentIdx = LEVELS.indexOf(current);
  const next = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;
  if (!next) return { current, next: null, progress: 1 };
  const xpInLevel = totalXP - current.requiredXP;
  const xpNeeded = next.requiredXP - current.requiredXP;
  const progress = xpNeeded === 0 ? 1 : Math.min(1, xpInLevel / xpNeeded);
  return { current, next, progress };
}

// 피드백 메시지 (긍정적 표현만)
export const CORRECT_MESSAGES = [
  '정답! 대단해! 🎉',
  '맞았어! 잘했어! ⭐',
  '완벽해! 멋져! 🌟',
  '와! 정확해! 👏',
  '훌륭해! 최고야! 🏆',
];

export const WRONG_MESSAGES = [
  '아깝다! 거의 맞았어! 💪',
  '괜찮아! 다음에 꼭 맞출 거야! 🌱',
  '좋은 시도야! 한 번 더 해보자! 🔄',
  '실수는 배움의 시작이야! 📚',
  '다시 해보면 분명 맞출 수 있어! ✨',
];

export const DONT_KNOW_MESSAGES = [
  '모르겠다고 말할 수 있는 건 용기야! 🦁',
  '솔직하게 말해줘서 고마워! 💎',
  '모르는 건 당연해! 이제 알게 됐어! 🌱',
  '정직한 주우! 대단해! ⭐',
  '이제 이 단어를 기억할 수 있을 거야! 🧠',
];

export const GUESSING_MESSAGES = [
  '천천히 읽어보자! 시간은 충분해 ⏰',
  '잠깐! 문제를 한 번 더 읽어볼까? 📖',
  '서두르지 않아도 돼! 천천히 생각해보자 🤔',
];

export const PRONUNCIATION_FEEDBACK = {
  excellent: [
    '와! 완벽한 발음이야! 🌟',
    '원어민 같은 발음! 대단해! 🎉',
    '너무 잘했어! 이 단어 마스터! ⭐',
  ],
  good: [
    '거의 다 됐어! 아주 잘하고 있어 👏',
    '좋아! 한 번만 더 하면 완벽할 거야!',
    '잘했어! 조금만 더 또렷하게 해보자',
  ],
  tryAgain: [
    '좋은 시도야! 한 번 더 들어보고 해보자 💪',
    '용기 있게 말했네! 다시 한 번 천천히 해보자',
    '괜찮아! 발음은 연습할수록 좋아져 🌱',
  ],
} as const;

// 결과 화면용 격려 메시지
export function getResultMessage(correctRate: number): string {
  if (correctRate >= 0.9) return '와! 거의 다 맞았어! 천재야! 🌟';
  if (correctRate >= 0.7) return '정말 잘했어! 대단해! 🎉';
  if (correctRate >= 0.5) return '좋아! 많이 배웠어! 💪';
  return '열심히 도전했어! 멋져! 🌱';
}

// 랜덤 메시지 선택 헬퍼
export function randomMessage(messages: readonly string[]): string {
  if (messages.length === 0) return '';
  return messages[Math.floor(Math.random() * messages.length)];
}
