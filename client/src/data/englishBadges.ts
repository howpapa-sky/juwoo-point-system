// 영어학습 배지 정의

export interface EnglishBadgeDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'learning' | 'attitude' | 'skill' | 'streak';
}

export const ENGLISH_BADGES: EnglishBadgeDef[] = [
  // 학습량 배지
  { id: 'first-word', name: '첫 단어', icon: '🌱', description: '첫 번째 영어 단어 학습', category: 'learning' },
  { id: 'ten-words', name: '단어 10개', icon: '📗', description: '10개 단어 학습 완료', category: 'learning' },
  { id: 'twenty-five-words', name: '단어 25개', icon: '📕', description: '25개 단어 학습 완료', category: 'learning' },
  { id: 'fifty-words', name: '단어 50개', icon: '📘', description: '50개 단어 학습 완료', category: 'learning' },
  { id: 'hundred-words', name: '단어 100개', icon: '📙', description: '100개 단어 학습 완료', category: 'learning' },
  { id: 'first-unit', name: '첫 유닛 완료', icon: '🎓', description: '첫 번째 학습 유닛 완료', category: 'learning' },
  { id: 'five-units', name: '유닛 5개 완료', icon: '🏅', description: '5개 유닛 학습 완료', category: 'learning' },

  // 학습 태도 배지 (주우 특화)
  { id: 'brave-learner', name: '용감한 학습자', icon: '🦁', description: '"모르겠어요" 10회 사용', category: 'attitude' },
  { id: 'super-brave', name: '초용감한 학습자', icon: '🦸', description: '"모르겠어요" 50회 사용', category: 'attitude' },
  { id: 'honest-player', name: '정직한 플레이어', icon: '💎', description: '찍기 0회로 퀴즈 완료 5회', category: 'attitude' },
  { id: 'hint-master', name: '복습 활용 마스터', icon: '💡', description: '복습 세션 20회 이상 완료', category: 'attitude' },
  { id: 'challenge-seeker', name: '도전을 즐기는 사람', icon: '🎯', description: 'hard 난이도 문제 정답 30회', category: 'attitude' },
  { id: 'try-again-hero', name: '다시 도전 히어로', icon: '🔄', description: '오답 후 재시도 성공 10회', category: 'attitude' },
  { id: 'patient-learner', name: '꼼꼼한 학습자', icon: '🐢', description: '"모르겠어요" 후 정답 학습 20회', category: 'attitude' },

  // 스킬 배지
  { id: 'good-ear', name: '좋은 귀', icon: '👂', description: '듣기 퀴즈 정답률 80%+ (20문제)', category: 'skill' },
  { id: 'good-voice', name: '좋은 목소리', icon: '🎤', description: '발음 점수 80+ 10회', category: 'skill' },
  { id: 'story-lover', name: '이야기 사랑꾼', icon: '📚', description: '스토리 3편 완독', category: 'skill' },
  { id: 'story-master', name: '스토리 마스터', icon: '📖', description: '스토리 6편 완독', category: 'skill' },
  { id: 'spelling-star', name: '스펠링 스타', icon: '✍️', description: '타이핑 퀴즈 정답률 80%+ (20문제)', category: 'skill' },
  { id: 'garden-keeper', name: '정원 관리사', icon: '🌻', description: '단어 정원에 꽃(Box4) 10개', category: 'skill' },
  { id: 'star-collector', name: '별 수집가', icon: '⭐', description: '단어 정원에 별(Box5) 10개', category: 'skill' },

  // 꾸준함 배지
  { id: 'streak-3', name: '3일 연속!', icon: '🔥', description: '3일 연속 학습', category: 'streak' },
  { id: 'streak-7', name: '일주일 연속!', icon: '⚡', description: '7일 연속 학습', category: 'streak' },
  { id: 'streak-14', name: '2주 연속!', icon: '💫', description: '14일 연속 학습', category: 'streak' },
  { id: 'streak-30', name: '한 달 연속!', icon: '🌟', description: '30일 연속 학습', category: 'streak' },
  { id: 'first-review', name: '첫 복습', icon: '🚿', description: '첫 번째 복습 세션 완료', category: 'streak' },
  { id: 'review-master', name: '복습 마스터', icon: '🏆', description: '복습 세션 30회 완료', category: 'streak' },
];

// 카테고리별 필터
export function getBadgesByCategory(category: EnglishBadgeDef['category']): EnglishBadgeDef[] {
  return ENGLISH_BADGES.filter((b) => b.category === category);
}

// ID로 배지 찾기
export function getBadgeById(badgeId: string): EnglishBadgeDef | undefined {
  return ENGLISH_BADGES.find((b) => b.id === badgeId);
}
