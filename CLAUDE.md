# CLAUDE.md - 주우 포인트 시스템

## 프로젝트 개요
7세 어린이(주우)를 위한 포인트 보상 시스템. 좋은 행동에 포인트를 적립하고, 포인트로 게임 시간이나 보상을 구매할 수 있음.

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
├── pages/           # 페이지 컴포넌트 (24개)
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
| `/ebook-quiz/:bookId` | EbookQuiz.tsx | e북 전용 퀴즈 (NEW) |
| `/transactions` | Transactions.tsx | 거래 내역 |

## 데이터베이스 테이블
- `juwoo_profile` - 주우 프로필 (current_points)
- `point_rules` - 포인트 규칙 (37개)
- `point_transactions` - 포인트 거래 내역
- `shop_items` - 상점 아이템
- `purchases` - 구매 내역
- `english_words` - 영어 단어 (100개)
- `english_learning_progress` - 학습 진행률
- `goals` - 목표 설정
- `ebook_progress` - e북 읽기 진행률 (NEW)
- `ebook_quiz_progress` - e북 퀴즈 진행률 (NEW)
- `quiz_attempt_history` - 퀴즈 시도 기록 (NEW)

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

## 커밋 컨벤션
- `feat:` 새 기능
- `fix:` 버그 수정
- `docs:` 문서
- `refactor:` 리팩토링
