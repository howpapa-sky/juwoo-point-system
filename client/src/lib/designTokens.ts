// 주우 앱 전용 디자인 토큰
export const COLORS = {
  success: '#4CAF50',      // 정답, 적립, 투자
  incorrect: '#FF9600',    // 오답, 소비 (빨간색 절대 금지)
  saving: '#2196F3',       // 저축, 금고
  loss: '#9E9E9E',         // 손실 (빨간색 절대 금지)
  background: '#F8F9FA',   // 앱 전체 배경
  cardBg: '#FFFFFF',       // 카드 배경
  cardBorder: '#E5E7EB',   // 카드 테두리
  text: '#212121',
  textSecondary: '#757575',
  primary: '#6366F1',      // 탐험기지 메인 컬러
  accent: '#8B5CF6',
  // 카드 좌측 액센트 바
  accentRoutine: '#6366F1',  // 루틴
  accentLearn: '#8B5CF6',    // 학습
  accentInvest: '#10B981',   // 투자
  accentWorry: '#F59E0B',    // 걱정상자 (따뜻한 노랑)
} as const;

export const ANIMATION = {
  buttonTap: { scale: 0.95, transition: { duration: 0.1 } },
  pageTransition: { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -100, opacity: 0 }, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  countUp: { duration: 0.8 },
  countDown: { duration: 1.2 },  // 차감은 더 천천히
  confetti: { particleCount: 50, spread: 60 },
  shake: { x: [-3, 3, -3, 0], transition: { duration: 0.3 } },
} as const;

export const LAYOUT = {
  minFontSize: 16,        // px
  minTouchTarget: 48,     // px
  maxChoices: 3,          // 최대 선택지
  sessionLength: 15,      // 분 (세션 길이)
} as const;

// 세계관 라벨 매핑
export const WORLDVIEW = {
  points: '탐험 에너지',
  routine: '기지 전력 충전',
  reading: '새로운 행성 발견',
  english: '우주어 해독',
  invest: '씨앗 농장',
  exercise: '탐험대원 체력 훈련',
  shop: '탐험 보급소',
  badge: '탐험 훈장',
  streak: '연속 탐험',
} as const;

// 금지 표현 → 대체 표현
export const FORBIDDEN_WORDS: Record<string, string> = {
  '실패': '아쉬웠어요',
  '틀렸어요': '다시 해보자!',
  '게임오버': '오늘은 여기까지!',
  '잃었다': '적게 열렸어요',
  '벌점': '에너지 소모',
};
