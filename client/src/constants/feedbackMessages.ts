// 피드백 메시지 상수 - 주우의 심리적 특성을 고려한 메시지
// 핵심: 틀려도 괜찮다, 모르면 물어보면 된다

export const FEEDBACK_MESSAGES = {
  correct: {
    easy: [
      "정답이야! 👏",
      "맞았어! ⭐",
      "잘했어! 😊",
      "멋지다! 🎵",
      "좋아! 💚",
    ],
    medium: [
      "대단해! 🎉",
      "멋져! ✨",
      "훌륭해! 🌟",
      "정말 잘했어! 🎊",
      "실력이 느는구나! 💪",
    ],
    hard: [
      "와! 천재야! 🏆",
      "어려운 걸 맞추다니! 👑",
      "최고야! 🎯",
      "진짜 대단해! 🌈",
      "도전 성공! 🚀",
    ],
  },
  incorrect: [
    "괜찮아! 다음에 맞추자 💪",
    "도전했네! 그게 중요해 🌱",
    "아쉽지만 끝까지 생각했어! 👍",
    "틀려도 괜찮아! 배우는 거야 📚",
    "다음엔 꼭 맞출 수 있어! 🌟",
    "실수는 성장의 기회야! 🌱",
    "포기하지 않은 게 최고야! 💪",
  ],
  dontKnow: [
    "모른다고 말하는 것도 용기야! 👏",
    "정직하게 말해줘서 고마워! 😊",
    "다음엔 맞출 수 있을 거야! 💪",
    "이제 정답을 알았으니 기억하자! 📝",
    "솔직한 게 최고야! ⭐",
  ],
  guessing: [
    "천천히 다시 생각해볼까? 🤔",
    "하나씩 잘 읽어보자! 📖",
    "급하지 않아, 천천히! 🐢",
    "모르면 '모르겠어요' 버튼을 눌러도 돼! 💡",
    "생각할 시간은 충분해! ⏰",
  ],
  streak: {
    3: "연속 3정답! 🔥",
    4: "4연속! 대단해! 🔥🔥",
    5: "5연속! 불타오른다! 🔥🔥🔥",
    7: "7연속! 퀴즈 마스터! 👑",
    10: "10연속! 전설이야! 🏆✨",
  },
  encouragement: {
    afterManyWrong: [
      "괜찮아! 쉬운 문제로 다시 시작하자 💚",
      "조금 쉬었다 하자! 휴식도 중요해 ☕",
      "어려운 문제가 많았어. 잘하고 있어! 🌟",
    ],
    sessionEnd: {
      great: "오늘 정말 잘했어! 다음에 또 하자! 🎉",
      good: "좋았어! 조금씩 실력이 늘고 있어! 💪",
      okay: "끝까지 했구나! 그게 제일 중요해! 👏",
    },
  },
  hint: {
    level1: "힌트 1 💡",
    level2: "힌트 2 💡💡",
    level3: "힌트 3 💡💡💡",
    noPoints: "힌트를 써도 점수는 그대로야! 걱정마!",
  },
  challenge: {
    label: "도전 문제! 틀려도 OK!",
    encourage: "어려운 문제야! 도전해보자! 🚀",
  },
};

// 랜덤 메시지 선택 함수
export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

// 난이도별 정답 메시지
export const getCorrectMessage = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  return getRandomMessage(FEEDBACK_MESSAGES.correct[difficulty]);
};

// 오답 메시지
export const getIncorrectMessage = (): string => {
  return getRandomMessage(FEEDBACK_MESSAGES.incorrect);
};

// 모르겠어요 메시지
export const getDontKnowMessage = (): string => {
  return getRandomMessage(FEEDBACK_MESSAGES.dontKnow);
};

// 찍기 감지 메시지
export const getGuessingMessage = (): string => {
  return getRandomMessage(FEEDBACK_MESSAGES.guessing);
};

// 연속 정답 메시지
export const getStreakMessage = (streak: number): string | null => {
  const thresholds = [10, 7, 5, 4, 3] as const;
  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return FEEDBACK_MESSAGES.streak[threshold];
    }
  }
  return null;
};

// 코인 계산 함수 (보상 시스템)
export interface CoinResult {
  coins: number;
  message: string;
  bonusMessage?: string;
}

export const calculateCoins = (
  isCorrect: boolean,
  difficulty: 'easy' | 'medium' | 'hard',
  usedHints: number,
  wasGuessing: boolean,
  usedDontKnow: boolean,
  streak: number
): CoinResult => {
  // 찍기 감지 시 0점
  if (wasGuessing) {
    return {
      coins: 0,
      message: getGuessingMessage(),
    };
  }

  // "모르겠어요" 사용 시
  if (usedDontKnow) {
    return {
      coins: 1,
      message: getDontKnowMessage(),
    };
  }

  // 오답이지만 끝까지 풀었을 때
  if (!isCorrect) {
    return {
      coins: 1,
      message: getIncorrectMessage(),
    };
  }

  // 정답인 경우 - 난이도별 기본 코인
  const baseCoins: Record<'easy' | 'medium' | 'hard', number> = {
    easy: 2,
    medium: 3,
    hard: 5,
  };

  let coins = baseCoins[difficulty];
  let bonusMessage: string | undefined;

  // 힌트 미사용 보너스
  if (usedHints === 0) {
    coins += 1;
    bonusMessage = "스스로 해냈어! +1 보너스 🌟";
  }

  // 연속 정답 보너스
  if (streak >= 3 && streak % 3 === 0) {
    coins += 2;
    const streakMsg = getStreakMessage(streak);
    if (streakMsg) {
      bonusMessage = bonusMessage ? `${bonusMessage} / ${streakMsg}` : streakMsg;
    }
  }

  return {
    coins,
    message: getCorrectMessage(difficulty),
    bonusMessage,
  };
};

// 난이도 설정
export const DIFFICULTY_CONFIG = {
  easy: {
    stars: 1,
    label: '기본',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
  },
  medium: {
    stars: 2,
    label: '보통',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
  },
  hard: {
    stars: 3,
    label: '도전!',
    color: 'from-red-400 to-pink-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    isChallenge: true,
    challengeLabel: '틀려도 OK!',
  },
};

// 세션 설정
export const SESSION_CONFIG = {
  defaultQuestionCount: 7,
  additionalQuestionCount: 7,
  fastAnswerThreshold: 3000, // 3초 이내 = 찍기 의심
  patternDetectionWindow: 5, // 최근 5문제 중
  patternThreshold: 4, // 4개 이상 같은 답 = 패턴 감지
};

// 적응형 문제 순서 패턴
// 쉬움 → 쉬움 → 어려움 → 쉬움 → 보통 → 쉬움 (반복)
export const ADAPTIVE_PATTERN = ['easy', 'easy', 'hard', 'easy', 'medium', 'easy'] as const;

// 연속 오답 시 회복 쉬운 문제 개수
export const RECOVERY_EASY_COUNT = 3;
export const CONSECUTIVE_WRONG_THRESHOLD = 2;
