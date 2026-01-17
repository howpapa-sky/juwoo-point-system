// 퀴즈 관련 타입 정의

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuizTier = 'basic' | 'intermediate' | 'master';

export interface QuizHint {
  text: string;                    // 일반 힌트 텍스트
  pageHint?: string;               // 책 페이지 힌트 (예: "3페이지에서 찾아봐!")
  eliminateOption?: number;        // 제거할 오답 인덱스 (0~3, 4지선다용)
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  question: string;
  image?: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  options?: string[];
  explanation: string;
  points: number;

  // e북 연동 필드
  bookId: string;                  // 연결된 e북 ID
  quizTier: QuizTier;              // 퀴즈 단계
  pageReference: number;           // 정답이 있는 e북 페이지 번호 (1부터 시작)

  // 힌트 시스템
  hints: QuizHint[];

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

// 포인트 계산 함수
export const calculateFinalPoints = (basePoints: number, hintsUsed: number): number => {
  // 힌트 1개당 10% 감소
  const reduction = hintsUsed * 0.1;

  // 최대 90% 감소 (최소 10% = 1점 이상 보장)
  const finalMultiplier = Math.max(0.1, 1 - reduction);

  // 반올림하여 정수로 반환
  return Math.round(basePoints * finalMultiplier);
};

// 퀴즈 통과 여부 확인
export const isQuizPassed = (correctCount: number, totalQuestions: number): boolean => {
  const percentage = (correctCount / totalQuestions) * 100;
  return percentage >= 60;  // 60% 이상 정답 시 통과
};

// 단계별 기본 포인트
export const TIER_BASE_POINTS: Record<QuizTier, number> = {
  basic: 10,
  intermediate: 15,
  master: 20,
};

// 단계별 완료 보상 포인트
export const TIER_COMPLETION_BONUS: Record<QuizTier, number> = {
  basic: 50,
  intermediate: 100,
  master: 200,
};

// 격려 메시지
export const ENCOURAGEMENT_MESSAGES = {
  correct: [
    "대단해! 정답이야!",
    "와! 똑똑한데?",
    "멋져! 계속 가보자!",
    "역시 주우야!",
    "완벽해!",
  ],
  wrong: [
    "괜찮아! 다시 해보자!",
    "아쉬워! 다음엔 맞출 수 있어!",
    "책에서 다시 확인해볼까?",
    "실수해도 괜찮아, 배우는 거야!",
    "힌트를 볼까?",
  ],
  streak: [
    "2연속 정답!",
    "3연속! 대단해!",
    "4연속!! 천재야?",
    "5연속!!! 완벽해!!!",
  ],
};

// 티어 표시 정보
export const TIER_INFO: Record<QuizTier, { emoji: string; label: string; color: string }> = {
  basic: { emoji: '🌱', label: '기초 퀴즈', color: 'green' },
  intermediate: { emoji: '⭐', label: '실력 퀴즈', color: 'amber' },
  master: { emoji: '🏆', label: '마스터 퀴즈', color: 'purple' },
};
