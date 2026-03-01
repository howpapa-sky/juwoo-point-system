# CLAUDE.md - 주우 포인트 시스템

## 필수 작업 규칙
- **작업 시작 전 반드시 이 파일(CLAUDE.md)을 전부 읽고 규칙을 숙지할 것**
- 디자인 원칙, DB 패턴, 커밋 컨벤션 등을 반드시 준수
- 기존 코드 수정 전 해당 파일을 먼저 읽을 것

## 프로젝트 개요
8세 어린이(주우)를 위한 포인트 보상 시스템. 좋은 행동에 포인트를 적립하고, 포인트로 게임 시간이나 보상을 구매할 수 있음. 투자/저축 개념 학습 시스템 포함.

## 기술 스택
- **프론트엔드**: React 19 + TypeScript + Vite
- **스타일링**: Tailwind CSS 4 + shadcn/ui
- **백엔드/DB**: Supabase (PostgreSQL + Auth)
- **ORM**: Drizzle ORM
- **배포**: Netlify

## 빠른 시작
```bash
pnpm install    # 의존성 설치
pnpm dev        # 개발 서버 (http://localhost:5173)
pnpm build      # 프로덕션 빌드
```

## 프로젝트 구조
```
client/src/
├── pages/           # 페이지 컴포넌트 (29개)
├── components/      # UI 컴포넌트 (shadcn/ui)
├── contexts/        # React Context (인증, 테마)
├── hooks/           # 커스텀 훅
├── lib/             # 유틸리티 (supabaseClient.ts)
└── data/            # 정적 데이터

drizzle/
├── schema.ts        # DB 스키마 정의
└── *.sql            # 마이그레이션 파일
```

## 주요 페이지
| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | Home.tsx | 메인 홈 |
| `/dashboard` | Dashboard.tsx | 대시보드 |
| `/points-manage` | PointsManage.tsx | 포인트 적립/차감 |
| `/shop` | Shop.tsx | 포인트 상점 |
| `/english-learning` | EnglishLearning.tsx | 영어 학습 허브 |
| `/word-learning` | WordLearning.tsx | 단어 학습 |
| `/english-quiz` | EnglishQuiz.tsx | 영어 퀴즈 |
| `/pokemon-quiz` | PokemonQuiz.tsx | 포켓몬 퀴즈 |
| `/ebook-library` | EbookLibrary.tsx | e북 도서관 |
| `/ebook-reader/:bookId` | EbookReader.tsx | e북 리더 |
| `/ebook-quiz/:bookId` | EbookQuiz.tsx | e북 전용 퀴즈 |
| `/transactions` | Transactions.tsx | 거래 내역 |
| `/wallet` | MyWallet.tsx | 내 지갑 (메인 허브) |
| `/savings` | Savings.tsx | 금고 (저축 + 이자) |
| `/seed-farm` | SeedFarm.tsx | 씨앗밭 (투자) |
| `/goal-saving` | GoalSaving.tsx | 목표 저축 |
| `/invest-report` | InvestReport.tsx | 투자 리포트 |
| `/seed-album` | SeedAlbum.tsx | 씨앗 도감 |

## 데이터베이스 테이블
- `juwoo_profile` - 주우 프로필 (current_points)
- `point_rules` - 포인트 규칙 (37개)
- `point_transactions` - 포인트 거래 내역
- `shop_items` - 상점 아이템
- `purchases` - 구매 내역
- `english_words` - 영어 단어 (100개)
- `english_learning_progress` - 학습 진행률
- `goals` - 목표 설정
- `ebook_progress` - e북 읽기 진행률
- `ebook_quiz_progress` - e북 퀴즈 진행률
- `quiz_attempt_history` - 퀴즈 시도 기록
- `savings_account` - 저축 계좌
- `interest_history` - 이자 기록
- `seeds` - 투자 씨앗
- `saving_goals` - 목표 저축
- `goal_deposits` - 목표 입금 기록

## 포인트 거래 INSERT 패턴
```typescript
// balance_after 컬럼 필수! (NOT NULL)
await supabase.from('point_transactions').insert({
  juwoo_id: 1,
  rule_id: null,
  amount: points,        // 양수: 적립, 음수: 차감
  balance_after: newBalance, // 거래 후 잔액 (필수!)
  note: '설명',
  created_by: 1,
});
```

## 주요 규칙
1. **balance_after 필수** - point_transactions INSERT 시 반드시 포함
2. **포인트 업데이트** - point_transactions INSERT 후 juwoo_profile UPDATE 필요
3. **인증** - SupabaseAuthContext 사용
4. **라우팅** - wouter 사용

## 환경 변수
```
VITE_SUPABASE_URL=<supabase-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## e북 퀴즈 시스템 (NEW)
### 플로우
1. e북 완독 → 기초 퀴즈 잠금 해제
2. 기초 퀴즈 60% 이상 → 실력 퀴즈 해금
3. 실력 퀴즈 60% 이상 → 마스터 퀴즈 해금

### 힌트 시스템
- 힌트 1개당 포인트 10% 감소
- 최대 9개까지 사용 가능 (최소 1점 보장)
- 힌트 종류: 텍스트 힌트, 책 페이지 힌트, 오답 제거

### 관련 파일
- `client/src/pages/EbookQuiz.tsx` - 퀴즈 페이지
- `client/src/data/quizData/` - 퀴즈 데이터
- `client/src/hooks/useEbookProgress.ts` - e북 진행률 훅
- `client/src/hooks/useQuizProgress.ts` - 퀴즈 진행률 훅

## 투자 시스템 리뉴얼 (2026.03~)

### 배경
기존 포인트 시스템이 "적립 → 소비" 단일 루프였음.
투자/저축 개념을 아이가 체험할 수 있도록 전면 리뉴얼.
전문가 심리 분석(K-WISC-V, JTCI 기반)을 반영하여 2차 리디자인 완료.

### 핵심 구조 변경
- 포인트를 벌면 3가지 선택지: 쓰기(소비), 모으기(저축), 심기(투자)
- 저축: 주간 이자 3%, 매주 일요일 자동 계산
- 투자: 씨앗 메타포. 기본 3종 + 숨겨진 3종
- 목표 저축: 비싼 아이템을 위한 장기 저축
- 묶음 심기: 여러 씨앗을 한번에 분산 투자

### 투자 시스템 상수
- 공유 상수 파일: `client/src/lib/investmentConstants.ts`
- 이자율, 성장 기간, 최소 보장, 최대 배수, 날씨 시스템 등 중앙 관리

### 신규 페이지
- MyWallet.tsx — 메인 허브 (지갑 잔액 + 3분기)
- Savings.tsx — 금고 (저축 + 이자 + 시간여행 복리 시각화)
- SeedFarm.tsx — 씨앗밭 (투자 + 날씨 + 묶음 심기)
- GoalSaving.tsx — 목표 저축
- InvestReport.tsx — 주간 리포트 + 반사실적 사고
- SeedAlbum.tsx — 씨앗 도감 (수집 + 해금)

### 신규 DB 테이블
- savings_account — 저축 계좌
- interest_history — 이자 기록
- seeds — 투자 씨앗
- saving_goals — 목표 저축
- goal_deposits — 목표 입금 기록

### 디자인 원칙
- 소비=주황, 저축=파랑, 투자=초록
- 손실 표시에 빨간색 사용 금지 (불안 유발) → 회색 사용
- "실패", "잃었다" 표현 금지 → "아쉬웠어요", "적게 열렸어요"
- 시각적 복잡도 최소화 (주우의 시공간 처리 약점 고려)
- 큰 글씨(최소 16px), 큰 버튼(터치 타겟 48px+)
- 날씨 시스템: 손실의 외부 귀인 → 예기불안 감소
- 내러티브/스토리: 성장 스토리 스니펫, 수확 스토리 메시지
- 반사실적 사고: "만약에..." 형태로 긍정적 마무리

### 투자 확률 분포 (전문가 분석 기반 리밸런싱 완료)
**기본 씨앗:**
- 해바라기: 110% 확정, 3일 성장
- 나무: 85~140% (기대값 ~112%, 최소 85%), 7일 성장
- 클로버: 30~250% (기대값 ~145%, 최소 30%), 14일 성장

**숨겨진 씨앗:**
- 장미(🌹): 100~180%, 7일, 해금조건=총 투자 500코인
- 대나무(🎋): 105~125%, 5일, 해금조건=3종 동시재배 5회
- 무지개(🌈): 50~300%, 10일, 해금조건=총 수익 100코인

### 날씨 시스템 (5일 주기, 결정론적)
- ☀️ 맑음: 나무/클로버에 소폭 보너스
- ⛅ 흐림: 보너스 없음
- 🌧️ 비: 나무 +5%, 클로버 -3%
- 💨 바람: 나무 -2%, 클로버 +5%
- 해바라기는 날씨 영향 없음 (확정 수익 보장)

### 주의사항
- 기존 포인트/상점/학습 기능은 모두 유지
- 이자/수확 자동화는 크론잡 또는 앱 실행 시 체크로 구현
- 상점 구매 시 기회비용 표시 (해바라기/금고 대안 제시)

## 커밋 컨벤션
- `feat:` 새 기능
- `fix:` 버그 수정
- `docs:` 문서
- `refactor:` 리팩토링
