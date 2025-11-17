# 주우 포인트 시스템 웹 기획서

**작성일:** 2025년 11월 17일  
**작성자:** Manus AI  
**버전:** 1.0

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택 및 아키텍처](#2-기술-스택-및-아키텍처)
3. [데이터베이스 설계](#3-데이터베이스-설계)
4. [API 명세](#4-api-명세)
5. [기능 명세](#5-기능-명세)
6. [UI/UX 디자인 가이드](#6-uiux-디자인-가이드)
7. [환경 설정 및 배포](#7-환경-설정-및-배포)
8. [개발 가이드](#8-개발-가이드)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목적

주우 포인트 시스템은 7세 어린이 "주우"를 위한 행동 관리 및 보상 시스템입니다. 좋은 행동(숙제, 운동, 독서 등)을 하면 포인트를 획득하고, 나쁜 행동(거짓말, 떼쓰기 등)을 하면 포인트를 차감합니다. 모은 포인트로 상점에서 원하는 보상(게임 시간, 장난감, 간식 등)을 구매할 수 있습니다.

### 1.2 핵심 기능

이 시스템은 다음과 같은 핵심 기능을 제공합니다:

**포인트 관리 시스템**은 37개의 사전 정의된 포인트 규칙(생활습관 8개, 운동건강 7개, 학습독서 5개, 예의태도 5개, 집안일 4개, 부정적행동 8개)을 통해 행동에 따라 포인트를 적립하거나 차감합니다. 모든 거래 내역은 데이터베이스에 기록되어 추적 가능합니다.

**상점 시스템**은 34개의 보상 아이템(게임시간 7개, 장난감 5개, 간식음식 7개, 특별활동 8개, 특권 7개)을 제공하며, 각 아이템은 고유한 포인트 가격과 설명을 가지고 있습니다. 구매 내역은 별도로 관리됩니다.

**영어 단어 학습 시스템**은 10개 카테고리(동물, 색깔, 음식, 가족, 숫자, 신체, 학교, 날씨, 동사, 형용사)에 걸쳐 100개의 영어 단어를 제공합니다. 플래시카드 모드와 객관식 퀴즈 모드를 지원하며, 정답 시 자동으로 50포인트를 적립합니다. 학습 진도는 개별적으로 추적됩니다.

**목표 설정 기능**은 사용자가 특정 상점 아이템을 목표로 설정하고 진행률을 추적할 수 있게 합니다. 여러 목표를 동시에 관리할 수 있으며, 목표 달성 여부를 시각적으로 표시합니다.

**배지 및 업적 시스템**은 10개의 다양한 배지(첫 포인트, 100포인트, 1000포인트, 첫 구매, 10번 구매, 첫 영어 단어, 50개 단어, 연속 7일, 연속 30일, 모든 카테고리 완료)를 통해 성취감을 제공합니다.

**대시보드 및 통계**는 현재 포인트 잔액, 최근 거래 내역, 구매 이력, 목표 진행률, 획득한 배지 등을 한눈에 볼 수 있는 종합 대시보드를 제공합니다.

### 1.3 사용자 시나리오

**시나리오 1: 포인트 적립**  
주우가 아침에 일찍 일어나서 부모님이 "일찍 일어나기 (+30포인트)" 버튼을 클릭합니다. 시스템은 주우의 포인트를 30포인트 증가시키고, 거래 내역에 기록합니다. 주우는 대시보드에서 증가한 포인트를 확인할 수 있습니다.

**시나리오 2: 상점에서 구매**  
주우가 100포인트를 모아서 "게임 30분 (+100포인트)" 아이템을 구매합니다. 시스템은 포인트를 차감하고 구매 내역에 기록합니다. 부모님은 구매 알림을 받고 보상을 제공합니다.

**시나리오 3: 영어 단어 학습**  
주우가 영어 학습 페이지에 접속하여 "동물" 카테고리를 선택합니다. 플래시카드 모드로 10개의 단어를 학습한 후, 퀴즈 모드로 전환하여 문제를 풉니다. 정답을 맞추면 자동으로 50포인트가 적립되고, 학습 진도가 업데이트됩니다.

**시나리오 4: 목표 설정**  
주우가 "레고 세트 구매 (500포인트)" 아이템을 목표로 설정합니다. 시스템은 현재 포인트(100포인트)와 목표 포인트(500포인트)를 비교하여 진행률(20%)을 표시합니다. 주우는 목표 달성을 위해 더 열심히 포인트를 모읍니다.

### 1.4 대상 사용자

**주 사용자 (Primary User):** 7세 어린이 "주우"  
주우는 직관적인 UI를 통해 자신의 포인트를 확인하고, 상점에서 보상을 선택하며, 영어 단어를 학습합니다. 큰 버튼, 밝은 색상, 이모지를 활용한 친근한 디자인이 필요합니다.

**부 사용자 (Secondary User):** 부모님  
부모님은 주우의 행동을 관찰하고 포인트를 적립/차감하는 관리자 역할을 합니다. 대시보드를 통해 주우의 활동을 모니터링하고, 구매 내역을 확인합니다.

### 1.5 성공 지표

이 프로젝트의 성공은 다음 지표로 측정됩니다:

**사용자 참여도**는 주우가 매일 시스템에 접속하여 포인트를 확인하고, 영어 단어를 학습하며, 목표를 설정하는 빈도로 측정됩니다. 목표는 주 5회 이상 접속입니다.

**행동 개선**은 긍정적 행동(포인트 적립)의 증가와 부정적 행동(포인트 차감)의 감소로 측정됩니다. 월별 비교를 통해 개선 추이를 확인합니다.

**학습 효과**는 영어 단어 학습 완료율과 정답률로 측정됩니다. 목표는 100개 단어 중 80% 이상 학습 완료입니다.

**시스템 안정성**은 로그인 성공률, API 응답 시간, 오류 발생 빈도로 측정됩니다. 목표는 99% 이상의 가용성입니다.

---

## 2. 기술 스택 및 아키텍처

### 2.1 기술 스택

이 프로젝트는 최신 웹 기술을 활용한 풀스택 애플리케이션입니다. 다음 표는 각 계층별 사용된 기술을 정리한 것입니다.

| 계층 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **프론트엔드** | React | 19.0.0 | UI 컴포넌트 및 상태 관리 |
| | TypeScript | 5.x | 타입 안전성 및 개발 생산성 |
| | Vite | 5.x | 빠른 개발 서버 및 빌드 도구 |
| | Tailwind CSS | 4.x | 유틸리티 기반 스타일링 |
| | shadcn/ui | latest | 재사용 가능한 UI 컴포넌트 라이브러리 |
| | Wouter | latest | 경량 라우팅 라이브러리 |
| | Lucide React | latest | 아이콘 라이브러리 |
| **백엔드** | Node.js | 22.x | 서버 런타임 |
| | Express | 4.x | 웹 프레임워크 |
| | tRPC | 11.x | 타입 안전한 API 통신 |
| | Superjson | latest | Date 등 복잡한 타입 직렬화 |
| **데이터베이스** | Supabase | latest | PostgreSQL 기반 BaaS |
| | Drizzle ORM | latest | 타입 안전한 ORM |
| **인증** | Supabase Auth | latest | 이메일/Google OAuth 인증 |
| **배포** | Manus Platform | latest | 개발 및 프로덕션 환경 |

### 2.2 아키텍처 개요

이 시스템은 **클라이언트-서버 아키텍처**를 따르며, tRPC를 통해 타입 안전한 통신을 보장합니다.

**프론트엔드 (Client)**는 React 19와 TypeScript로 구축되어 있으며, Vite를 통해 빠른 개발 환경을 제공합니다. Tailwind CSS와 shadcn/ui를 활용하여 일관된 디자인 시스템을 구축했습니다. Wouter를 사용한 클라이언트 사이드 라우팅으로 SPA(Single Page Application) 경험을 제공합니다.

**백엔드 (Server)**는 Node.js와 Express를 기반으로 하며, tRPC를 통해 타입 안전한 API를 제공합니다. 모든 API 엔드포인트는 `/api/trpc` 경로 아래에 위치하며, Superjson을 사용하여 복잡한 타입(Date, BigInt 등)을 자동으로 직렬화합니다.

**데이터베이스 (Database)**는 Supabase PostgreSQL을 사용하며, Drizzle ORM을 통해 타입 안전한 쿼리를 작성합니다. 모든 테이블은 snake_case 네이밍을 따르며, TypeScript 코드에서는 camelCase로 변환하여 사용합니다.

**인증 (Authentication)**은 Supabase Auth를 사용하여 이메일/비밀번호 로그인과 Google OAuth를 지원합니다. 세션은 자동으로 관리되며, 클라이언트에서 `useSupabaseAuth` 훅을 통해 현재 사용자 정보에 접근할 수 있습니다.

### 2.3 프로젝트 구조

프로젝트는 다음과 같은 디렉토리 구조를 가지고 있습니다:

```
juwoo-point-system/
├── client/                    # 프론트엔드 코드
│   ├── public/               # 정적 파일
│   └── src/
│       ├── components/       # 재사용 가능한 UI 컴포넌트
│       │   └── ui/          # shadcn/ui 컴포넌트
│       ├── contexts/         # React Context (인증 등)
│       ├── hooks/            # 커스텀 React 훅
│       ├── lib/              # 유틸리티 및 설정
│       │   ├── supabaseClient.ts  # Supabase 클라이언트
│       │   └── trpc.ts       # tRPC 클라이언트
│       ├── pages/            # 페이지 컴포넌트
│       ├── App.tsx           # 라우팅 설정
│       ├── main.tsx          # 앱 진입점
│       └── index.css         # 글로벌 스타일
├── server/                    # 백엔드 코드
│   ├── _core/                # 프레임워크 코어 (수정 금지)
│   ├── db.ts                 # 데이터베이스 쿼리 함수
│   └── routers.ts            # tRPC 라우터 정의
├── drizzle/                   # 데이터베이스 스키마
│   └── schema.ts             # Drizzle 스키마 정의
├── shared/                    # 공유 타입 및 상수
│   └── const.ts              # 앱 상수
├── package.json              # 의존성 관리
└── tsconfig.json             # TypeScript 설정
```

### 2.4 데이터 흐름

사용자가 "포인트 적립" 버튼을 클릭하면 다음과 같은 데이터 흐름이 발생합니다:

1. **사용자 액션**: 사용자가 프론트엔드에서 "일찍 일어나기 (+30포인트)" 버튼을 클릭합니다.

2. **tRPC Mutation 호출**: 프론트엔드에서 `trpc.points.addTransaction.useMutation()`을 호출하여 서버에 요청을 전송합니다.

3. **서버 처리**: 서버의 `routers.ts`에서 `addTransaction` 프로시저가 실행됩니다. 입력 데이터의 유효성을 검사하고, `db.ts`의 `addPointTransaction` 함수를 호출합니다.

4. **데이터베이스 쿼리**: `addPointTransaction` 함수는 Supabase에 다음 작업을 수행합니다:
   - `point_transactions` 테이블에 새 거래 기록 삽입
   - `juwoo_profile` 테이블의 포인트 잔액 업데이트

5. **응답 반환**: 서버는 업데이트된 포인트 잔액과 거래 내역을 클라이언트에 반환합니다.

6. **UI 업데이트**: 프론트엔드는 받은 데이터로 UI를 업데이트하고, 사용자에게 성공 메시지를 표시합니다.

이 과정에서 tRPC는 타입 안전성을 보장하며, Superjson은 Date 객체를 자동으로 직렬화/역직렬화합니다.

---

## 3. 데이터베이스 설계

### 3.1 데이터베이스 개요

이 시스템은 Supabase PostgreSQL을 사용하며, 총 11개의 테이블로 구성되어 있습니다. 모든 테이블은 snake_case 네이밍 규칙을 따르며, 기본 키는 `id` (auto-increment integer)를 사용합니다. 타임스탬프 필드는 `created_at`과 `updated_at`으로 통일되어 있습니다.

### 3.2 ERD (Entity Relationship Diagram)

주요 테이블 간의 관계는 다음과 같습니다:

```
users (Supabase Auth)
  └─ 1:1 ─ juwoo_profile
              ├─ 1:N ─ point_transactions
              ├─ 1:N ─ purchases
              ├─ 1:N ─ word_learning_progress
              ├─ 1:N ─ user_badges
              └─ 1:N ─ goals

point_rules (독립 테이블)
  └─ 1:N ─ point_transactions

shop_items (독립 테이블)
  ├─ 1:N ─ purchases
  └─ 1:N ─ goals

english_words (독립 테이블)
  └─ 1:N ─ word_learning_progress

badges (독립 테이블)
  └─ 1:N ─ user_badges
```

### 3.3 테이블 상세 명세

#### 3.3.1 users (사용자)

Supabase Auth가 자동으로 관리하는 테이블입니다. 직접 수정하지 않습니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | uuid | PRIMARY KEY | Supabase Auth 사용자 ID |
| email | varchar | UNIQUE | 이메일 주소 |
| created_at | timestamp | NOT NULL | 계정 생성 시각 |

#### 3.3.2 juwoo_profile (주우 프로필)

주우의 기본 정보와 포인트 잔액을 저장합니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 프로필 ID |
| user_id | uuid | FOREIGN KEY (users.id), UNIQUE | Supabase Auth 사용자 ID |
| name | varchar(100) | NOT NULL | 이름 (예: "주우") |
| age | integer | NOT NULL | 나이 (예: 7) |
| points | integer | NOT NULL, DEFAULT 0 | 현재 포인트 잔액 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 프로필 생성 시각 |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | 마지막 업데이트 시각 |

**인덱스:**
- `idx_juwoo_profile_user_id` ON `user_id`

**비즈니스 로직:**
- `points`는 음수가 될 수 없습니다 (CHECK 제약 조건 권장)
- 포인트 변경 시 `updated_at`이 자동으로 갱신됩니다

#### 3.3.3 point_rules (포인트 규칙)

포인트 적립/차감 규칙을 정의합니다. 총 37개의 규칙이 사전 정의되어 있습니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 규칙 ID |
| category | varchar(50) | NOT NULL | 카테고리 (생활습관, 운동건강, 학습독서, 예의태도, 집안일, 부정적행동) |
| name | varchar(100) | NOT NULL | 규칙 이름 (예: "일찍 일어나기") |
| points | integer | NOT NULL | 포인트 값 (양수: 적립, 음수: 차감) |
| description | text | | 상세 설명 |
| icon | varchar(10) | | 이모지 아이콘 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 규칙 생성 시각 |

**인덱스:**
- `idx_point_rules_category` ON `category`

**샘플 데이터:**

| id | category | name | points | icon |
|----|----------|------|--------|------|
| 1 | 생활습관 | 일찍 일어나기 | 30 | ⏰ |
| 2 | 생활습관 | 스스로 양치하기 | 20 | 🪥 |
| 15 | 부정적행동 | 거짓말하기 | -50 | 🤥 |
| 16 | 부정적행동 | 떼쓰기 | -30 | 😭 |

#### 3.3.4 point_transactions (포인트 거래 내역)

모든 포인트 적립/차감 내역을 기록합니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 거래 ID |
| juwoo_id | integer | FOREIGN KEY (juwoo_profile.id), NOT NULL | 주우 프로필 ID |
| rule_id | integer | FOREIGN KEY (point_rules.id), NOT NULL | 포인트 규칙 ID |
| points | integer | NOT NULL | 적립/차감된 포인트 |
| balance_after | integer | NOT NULL | 거래 후 포인트 잔액 |
| note | text | | 추가 메모 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 거래 시각 |

**인덱스:**
- `idx_point_transactions_juwoo_id` ON `juwoo_id`
- `idx_point_transactions_created_at` ON `created_at DESC`

**비즈니스 로직:**
- 거래 발생 시 `juwoo_profile.points`가 자동으로 업데이트됩니다
- `balance_after`는 거래 후 잔액을 기록하여 데이터 무결성을 검증할 수 있습니다

#### 3.3.5 shop_items (상점 아이템)

포인트로 구매할 수 있는 보상 아이템을 정의합니다. 총 34개의 아이템이 사전 정의되어 있습니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 아이템 ID |
| category | varchar(50) | NOT NULL | 카테고리 (게임시간, 장난감, 간식음식, 특별활동, 특권) |
| name | varchar(100) | NOT NULL | 아이템 이름 (예: "게임 30분") |
| price | integer | NOT NULL | 필요 포인트 |
| description | text | | 상세 설명 |
| icon | varchar(10) | | 이모지 아이콘 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 아이템 생성 시각 |

**인덱스:**
- `idx_shop_items_category` ON `category`
- `idx_shop_items_price` ON `price`

**샘플 데이터:**

| id | category | name | price | icon |
|----|----------|------|-------|------|
| 1 | 게임시간 | 게임 30분 | 100 | 🎮 |
| 2 | 게임시간 | 게임 1시간 | 180 | 🎮 |
| 8 | 장난감 | 레고 세트 | 500 | 🧱 |
| 15 | 간식음식 | 아이스크림 | 80 | 🍦 |

#### 3.3.6 purchases (구매 내역)

상점에서 아이템을 구매한 내역을 기록합니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 구매 ID |
| juwoo_id | integer | FOREIGN KEY (juwoo_profile.id), NOT NULL | 주우 프로필 ID |
| item_id | integer | FOREIGN KEY (shop_items.id), NOT NULL | 구매한 아이템 ID |
| price | integer | NOT NULL | 구매 시점의 가격 |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | 상태 (pending, completed, cancelled) |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 구매 시각 |

**인덱스:**
- `idx_purchases_juwoo_id` ON `juwoo_id`
- `idx_purchases_created_at` ON `created_at DESC`
- `idx_purchases_status` ON `status`

**비즈니스 로직:**
- 구매 시 `juwoo_profile.points`에서 `price`만큼 차감됩니다
- `status`가 'completed'로 변경되면 부모님이 보상을 제공한 것으로 간주합니다

#### 3.3.7 english_words (영어 단어)

영어 학습에 사용되는 단어 목록입니다. 총 100개의 단어가 사전 정의되어 있습니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 단어 ID |
| category | varchar(50) | NOT NULL | 카테고리 (동물, 색깔, 음식, 가족, 숫자, 신체, 학교, 날씨, 동사, 형용사) |
| english | varchar(100) | NOT NULL | 영어 단어 |
| korean | varchar(100) | NOT NULL | 한글 뜻 |
| difficulty | integer | NOT NULL, DEFAULT 1 | 난이도 (1-5) |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 단어 추가 시각 |

**인덱스:**
- `idx_english_words_category` ON `category`
- `idx_english_words_difficulty` ON `difficulty`

**샘플 데이터:**

| id | category | english | korean | difficulty |
|----|----------|---------|--------|------------|
| 1 | 동물 | dog | 개 | 1 |
| 2 | 동물 | cat | 고양이 | 1 |
| 11 | 색깔 | red | 빨강 | 1 |
| 21 | 음식 | apple | 사과 | 1 |

#### 3.3.8 word_learning_progress (단어 학습 진도)

사용자의 영어 단어 학습 진도를 추적합니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 진도 ID |
| juwoo_id | integer | FOREIGN KEY (juwoo_profile.id), NOT NULL | 주우 프로필 ID |
| word_id | integer | FOREIGN KEY (english_words.id), NOT NULL | 단어 ID |
| correct_count | integer | NOT NULL, DEFAULT 0 | 정답 횟수 |
| incorrect_count | integer | NOT NULL, DEFAULT 0 | 오답 횟수 |
| last_studied_at | timestamp | | 마지막 학습 시각 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 진도 생성 시각 |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | 마지막 업데이트 시각 |

**인덱스:**
- `idx_word_learning_progress_juwoo_word` ON `(juwoo_id, word_id)` (UNIQUE)
- `idx_word_learning_progress_last_studied` ON `last_studied_at DESC`

**비즈니스 로직:**
- 퀴즈에서 정답을 맞추면 `correct_count`가 증가하고 50포인트를 적립합니다
- 오답 시 `incorrect_count`가 증가하지만 포인트는 차감되지 않습니다

#### 3.3.9 badges (배지)

획득 가능한 배지 목록을 정의합니다. 총 10개의 배지가 사전 정의되어 있습니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 배지 ID |
| name | varchar(100) | NOT NULL | 배지 이름 (예: "첫 포인트") |
| description | text | NOT NULL | 배지 설명 |
| icon | varchar(10) | | 이모지 아이콘 |
| condition_type | varchar(50) | NOT NULL | 조건 유형 (points, purchases, words, streak) |
| condition_value | integer | NOT NULL | 조건 값 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 배지 생성 시각 |

**인덱스:**
- `idx_badges_condition_type` ON `condition_type`

**샘플 데이터:**

| id | name | description | icon | condition_type | condition_value |
|----|------|-------------|------|----------------|-----------------|
| 1 | 첫 포인트 | 첫 포인트를 획득했어요! | 🌟 | points | 1 |
| 2 | 100포인트 | 100포인트를 모았어요! | ⭐ | points | 100 |
| 4 | 첫 구매 | 첫 상점 구매를 했어요! | 🛒 | purchases | 1 |
| 6 | 첫 영어 단어 | 첫 영어 단어를 배웠어요! | 📚 | words | 1 |
| 8 | 연속 7일 | 7일 연속 접속했어요! | 🔥 | streak | 7 |

#### 3.3.10 user_badges (사용자 배지)

사용자가 획득한 배지를 기록합니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 사용자 배지 ID |
| juwoo_id | integer | FOREIGN KEY (juwoo_profile.id), NOT NULL | 주우 프로필 ID |
| badge_id | integer | FOREIGN KEY (badges.id), NOT NULL | 배지 ID |
| earned_at | timestamp | NOT NULL, DEFAULT NOW() | 획득 시각 |

**인덱스:**
- `idx_user_badges_juwoo_badge` ON `(juwoo_id, badge_id)` (UNIQUE)
- `idx_user_badges_earned_at` ON `earned_at DESC`

**비즈니스 로직:**
- 배지는 한 번만 획득할 수 있습니다 (UNIQUE 제약 조건)
- 배지 획득 시 축하 메시지를 표시합니다

#### 3.3.11 goals (목표)

사용자가 설정한 목표를 관리합니다.

| 필드명 | 타입 | 제약 조건 | 설명 |
|--------|------|-----------|------|
| id | integer | PRIMARY KEY, AUTO_INCREMENT | 목표 ID |
| juwoo_id | integer | FOREIGN KEY (juwoo_profile.id), NOT NULL | 주우 프로필 ID |
| item_id | integer | FOREIGN KEY (shop_items.id), NOT NULL | 목표 아이템 ID |
| target_points | integer | NOT NULL | 목표 포인트 |
| is_completed | boolean | NOT NULL, DEFAULT false | 완료 여부 |
| completed_at | timestamp | | 완료 시각 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 목표 생성 시각 |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | 마지막 업데이트 시각 |

**인덱스:**
- `idx_goals_juwoo_id` ON `juwoo_id`
- `idx_goals_is_completed` ON `is_completed`

**비즈니스 로직:**
- 현재 포인트가 `target_points`에 도달하면 `is_completed`가 true로 변경됩니다
- 완료된 목표는 목록에서 별도로 표시됩니다

### 3.4 데이터베이스 초기화 스크립트

다음 SQL 스크립트를 실행하여 모든 테이블을 생성할 수 있습니다:

```sql
-- juwoo_profile 테이블
CREATE TABLE juwoo_profile (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_juwoo_profile_user_id ON juwoo_profile(user_id);

-- point_rules 테이블
CREATE TABLE point_rules (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_point_rules_category ON point_rules(category);

-- point_transactions 테이블
CREATE TABLE point_transactions (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL REFERENCES juwoo_profile(id),
  rule_id INTEGER NOT NULL REFERENCES point_rules(id),
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_juwoo_id ON point_transactions(juwoo_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- shop_items 테이블
CREATE TABLE shop_items (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  description TEXT,
  icon VARCHAR(10),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shop_items_category ON shop_items(category);
CREATE INDEX idx_shop_items_price ON shop_items(price);

-- purchases 테이블
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL REFERENCES juwoo_profile(id),
  item_id INTEGER NOT NULL REFERENCES shop_items(id),
  price INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchases_juwoo_id ON purchases(juwoo_id);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX idx_purchases_status ON purchases(status);

-- english_words 테이블
CREATE TABLE english_words (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  english VARCHAR(100) NOT NULL,
  korean VARCHAR(100) NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_english_words_category ON english_words(category);
CREATE INDEX idx_english_words_difficulty ON english_words(difficulty);

-- word_learning_progress 테이블
CREATE TABLE word_learning_progress (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL REFERENCES juwoo_profile(id),
  word_id INTEGER NOT NULL REFERENCES english_words(id),
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  last_studied_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(juwoo_id, word_id)
);

CREATE INDEX idx_word_learning_progress_last_studied ON word_learning_progress(last_studied_at DESC);

-- badges 테이블
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10),
  condition_type VARCHAR(50) NOT NULL,
  condition_value INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_badges_condition_type ON badges(condition_type);

-- user_badges 테이블
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL REFERENCES juwoo_profile(id),
  badge_id INTEGER NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(juwoo_id, badge_id)
);

CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- goals 테이블
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL REFERENCES juwoo_profile(id),
  item_id INTEGER NOT NULL REFERENCES shop_items(id),
  target_points INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goals_juwoo_id ON goals(juwoo_id);
CREATE INDEX idx_goals_is_completed ON goals(is_completed);
```

---

## 4. API 명세

### 4.1 API 개요

이 시스템은 tRPC를 사용하여 타입 안전한 API를 제공합니다. 모든 API 엔드포인트는 `/api/trpc` 경로 아래에 위치하며, HTTP POST 요청을 통해 호출됩니다. tRPC는 자동으로 타입을 추론하므로, 별도의 API 문서 없이도 TypeScript의 자동 완성 기능을 통해 API를 사용할 수 있습니다.

### 4.2 인증 (Authentication)

#### 4.2.1 현재 사용자 정보 조회

**엔드포인트:** `auth.me`  
**타입:** Query  
**인증:** 불필요

**설명:** 현재 로그인한 사용자의 정보를 반환합니다. 로그인하지 않은 경우 `null`을 반환합니다.

**응답:**
```typescript
{
  id: string;           // Supabase Auth 사용자 ID
  email: string;        // 이메일 주소
  user_metadata: {      // 사용자 메타데이터
    name?: string;
    avatar_url?: string;
  };
}
```

**프론트엔드 사용 예시:**
```typescript
const { data: user, isLoading } = trpc.auth.me.useQuery();

if (isLoading) return <div>로딩 중...</div>;
if (!user) return <div>로그인이 필요합니다</div>;

return <div>안녕하세요, {user.email}님!</div>;
```

#### 4.2.2 로그아웃

**엔드포인트:** `auth.logout`  
**타입:** Mutation  
**인증:** 불필요

**설명:** 현재 세션을 종료하고 로그아웃합니다.

**응답:**
```typescript
{
  success: true
}
```

**프론트엔드 사용 예시:**
```typescript
const logoutMutation = trpc.auth.logout.useMutation();

const handleLogout = async () => {
  await logoutMutation.mutateAsync();
  // 로그인 페이지로 리다이렉트
  window.location.href = '/login';
};
```

### 4.3 주우 프로필 (Juwoo Profile)

#### 4.3.1 주우 프로필 조회

**엔드포인트:** `juwoo.getProfile`  
**타입:** Query  
**인증:** 필요

**설명:** 현재 로그인한 사용자의 주우 프로필을 반환합니다.

**응답:**
```typescript
{
  id: number;
  userId: string;
  name: string;
  age: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**프론트엔드 사용 예시:**
```typescript
const { data: profile } = trpc.juwoo.getProfile.useQuery();

return (
  <div>
    <h1>{profile?.name}님의 포인트: {profile?.points}</h1>
  </div>
);
```

#### 4.3.2 주우 포인트 잔액 조회

**엔드포인트:** `juwoo.getPointBalance`  
**타입:** Query  
**인증:** 필요

**설명:** 현재 주우의 포인트 잔액만 반환합니다.

**응답:**
```typescript
{
  points: number;
}
```

### 4.4 포인트 관리 (Points)

#### 4.4.1 포인트 규칙 목록 조회

**엔드포인트:** `points.getRules`  
**타입:** Query  
**인증:** 불필요

**설명:** 모든 포인트 규칙을 카테고리별로 반환합니다.

**입력:**
```typescript
{
  category?: string;  // 선택적: 특정 카테고리만 필터링
}
```

**응답:**
```typescript
[
  {
    id: number;
    category: string;
    name: string;
    points: number;
    description: string | null;
    icon: string | null;
    createdAt: Date;
  }
]
```

**프론트엔드 사용 예시:**
```typescript
const { data: rules } = trpc.points.getRules.useQuery({ category: '생활습관' });

return (
  <div>
    {rules?.map(rule => (
      <button key={rule.id} onClick={() => handleAddPoints(rule.id)}>
        {rule.icon} {rule.name} ({rule.points > 0 ? '+' : ''}{rule.points}포인트)
      </button>
    ))}
  </div>
);
```

#### 4.4.2 포인트 거래 추가

**엔드포인트:** `points.addTransaction`  
**타입:** Mutation  
**인증:** 필요

**설명:** 새로운 포인트 거래를 추가하고 주우의 포인트 잔액을 업데이트합니다.

**입력:**
```typescript
{
  ruleId: number;     // 포인트 규칙 ID
  note?: string;      // 선택적: 추가 메모
}
```

**응답:**
```typescript
{
  id: number;
  juwooId: number;
  ruleId: number;
  points: number;
  balanceAfter: number;
  note: string | null;
  createdAt: Date;
}
```

**프론트엔드 사용 예시:**
```typescript
const addTransactionMutation = trpc.points.addTransaction.useMutation({
  onSuccess: () => {
    // 포인트 잔액 다시 불러오기
    trpc.useUtils().juwoo.getPointBalance.invalidate();
    toast.success('포인트가 적립되었습니다!');
  },
});

const handleAddPoints = (ruleId: number) => {
  addTransactionMutation.mutate({ ruleId });
};
```

#### 4.4.3 포인트 거래 내역 조회

**엔드포인트:** `points.getTransactions`  
**타입:** Query  
**인증:** 필요

**설명:** 주우의 포인트 거래 내역을 최신순으로 반환합니다.

**입력:**
```typescript
{
  limit?: number;     // 선택적: 반환할 개수 (기본값: 10)
  offset?: number;    // 선택적: 건너뛸 개수 (기본값: 0)
}
```

**응답:**
```typescript
[
  {
    id: number;
    juwooId: number;
    ruleId: number;
    points: number;
    balanceAfter: number;
    note: string | null;
    createdAt: Date;
    rule: {
      id: number;
      name: string;
      category: string;
      icon: string | null;
    };
  }
]
```

### 4.5 상점 (Shop)

#### 4.5.1 상점 아이템 목록 조회

**엔드포인트:** `shop.getItems`  
**타입:** Query  
**인증:** 불필요

**설명:** 모든 상점 아이템을 카테고리별로 반환합니다.

**입력:**
```typescript
{
  category?: string;  // 선택적: 특정 카테고리만 필터링
}
```

**응답:**
```typescript
[
  {
    id: number;
    category: string;
    name: string;
    price: number;
    description: string | null;
    icon: string | null;
    createdAt: Date;
  }
]
```

#### 4.5.2 아이템 구매

**엔드포인트:** `shop.purchaseItem`  
**타입:** Mutation  
**인증:** 필요

**설명:** 상점 아이템을 구매하고 포인트를 차감합니다.

**입력:**
```typescript
{
  itemId: number;     // 구매할 아이템 ID
}
```

**응답:**
```typescript
{
  id: number;
  juwooId: number;
  itemId: number;
  price: number;
  status: string;
  createdAt: Date;
}
```

**에러:**
- 포인트가 부족한 경우: `INSUFFICIENT_POINTS`
- 아이템이 존재하지 않는 경우: `ITEM_NOT_FOUND`

**프론트엔드 사용 예시:**
```typescript
const purchaseMutation = trpc.shop.purchaseItem.useMutation({
  onSuccess: () => {
    trpc.useUtils().juwoo.getPointBalance.invalidate();
    toast.success('구매가 완료되었습니다!');
  },
  onError: (error) => {
    if (error.message === 'INSUFFICIENT_POINTS') {
      toast.error('포인트가 부족합니다!');
    }
  },
});

const handlePurchase = (itemId: number) => {
  purchaseMutation.mutate({ itemId });
};
```

#### 4.5.3 구매 내역 조회

**엔드포인트:** `shop.getPurchases`  
**타입:** Query  
**인증:** 필요

**설명:** 주우의 구매 내역을 최신순으로 반환합니다.

**입력:**
```typescript
{
  limit?: number;     // 선택적: 반환할 개수 (기본값: 10)
  offset?: number;    // 선택적: 건너뛸 개수 (기본값: 0)
}
```

**응답:**
```typescript
[
  {
    id: number;
    juwooId: number;
    itemId: number;
    price: number;
    status: string;
    createdAt: Date;
    item: {
      id: number;
      name: string;
      category: string;
      icon: string | null;
    };
  }
]
```

### 4.6 영어 학습 (English Learning)

#### 4.6.1 영어 단어 목록 조회

**엔드포인트:** `english.getWords`  
**타입:** Query  
**인증:** 불필요

**설명:** 모든 영어 단어를 카테고리별로 반환합니다.

**입력:**
```typescript
{
  category?: string;  // 선택적: 특정 카테고리만 필터링
}
```

**응답:**
```typescript
[
  {
    id: number;
    category: string;
    english: string;
    korean: string;
    difficulty: number;
    createdAt: Date;
  }
]
```

#### 4.6.2 단어 학습 진도 조회

**엔드포인트:** `english.getProgress`  
**타입:** Query  
**인증:** 필요

**설명:** 주우의 영어 단어 학습 진도를 반환합니다.

**응답:**
```typescript
[
  {
    id: number;
    juwooId: number;
    wordId: number;
    correctCount: number;
    incorrectCount: number;
    lastStudiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    word: {
      id: number;
      english: string;
      korean: string;
      category: string;
    };
  }
]
```

#### 4.6.3 퀴즈 정답 제출

**엔드포인트:** `english.submitAnswer`  
**타입:** Mutation  
**인증:** 필요

**설명:** 퀴즈 정답을 제출하고 학습 진도를 업데이트합니다. 정답인 경우 50포인트를 적립합니다.

**입력:**
```typescript
{
  wordId: number;     // 단어 ID
  isCorrect: boolean; // 정답 여부
}
```

**응답:**
```typescript
{
  success: boolean;
  pointsEarned: number;  // 정답인 경우 50, 오답인 경우 0
  progress: {
    correctCount: number;
    incorrectCount: number;
  };
}
```

**프론트엔드 사용 예시:**
```typescript
const submitAnswerMutation = trpc.english.submitAnswer.useMutation({
  onSuccess: (data) => {
    if (data.pointsEarned > 0) {
      toast.success(`정답입니다! ${data.pointsEarned}포인트를 획득했습니다!`);
    } else {
      toast.error('오답입니다. 다시 시도해보세요!');
    }
  },
});

const handleSubmit = (wordId: number, isCorrect: boolean) => {
  submitAnswerMutation.mutate({ wordId, isCorrect });
};
```

### 4.7 목표 (Goals)

#### 4.7.1 목표 목록 조회

**엔드포인트:** `goals.getGoals`  
**타입:** Query  
**인증:** 필요

**설명:** 주우의 모든 목표를 반환합니다.

**응답:**
```typescript
[
  {
    id: number;
    juwooId: number;
    itemId: number;
    targetPoints: number;
    isCompleted: boolean;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    item: {
      id: number;
      name: string;
      price: number;
      category: string;
      icon: string | null;
    };
    progress: number;  // 0-100 사이의 진행률
  }
]
```

#### 4.7.2 목표 추가

**엔드포인트:** `goals.addGoal`  
**타입:** Mutation  
**인증:** 필요

**설명:** 새로운 목표를 추가합니다.

**입력:**
```typescript
{
  itemId: number;     // 목표로 설정할 상점 아이템 ID
}
```

**응답:**
```typescript
{
  id: number;
  juwooId: number;
  itemId: number;
  targetPoints: number;
  isCompleted: boolean;
  createdAt: Date;
}
```

#### 4.7.3 목표 삭제

**엔드포인트:** `goals.deleteGoal`  
**타입:** Mutation  
**인증:** 필요

**설명:** 목표를 삭제합니다.

**입력:**
```typescript
{
  goalId: number;     // 삭제할 목표 ID
}
```

**응답:**
```typescript
{
  success: boolean;
}
```

### 4.8 배지 (Badges)

#### 4.8.1 모든 배지 조회

**엔드포인트:** `badges.getAllBadges`  
**타입:** Query  
**인증:** 불필요

**설명:** 모든 배지 목록을 반환합니다.

**응답:**
```typescript
[
  {
    id: number;
    name: string;
    description: string;
    icon: string | null;
    conditionType: string;
    conditionValue: number;
    createdAt: Date;
  }
]
```

#### 4.8.2 사용자 배지 조회

**엔드포인트:** `badges.getUserBadges`  
**타입:** Query  
**인증:** 필요

**설명:** 주우가 획득한 배지 목록을 반환합니다.

**응답:**
```typescript
[
  {
    id: number;
    juwooId: number;
    badgeId: number;
    earnedAt: Date;
    badge: {
      id: number;
      name: string;
      description: string;
      icon: string | null;
    };
  }
]
```

### 4.9 대시보드 (Dashboard)

#### 4.9.1 대시보드 통계 조회

**엔드포인트:** `dashboard.getStats`  
**타입:** Query  
**인증:** 필요

**설명:** 대시보드에 표시할 종합 통계를 반환합니다.

**응답:**
```typescript
{
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  totalPurchases: number;
  totalWordsLearned: number;
  badgesEarned: number;
  recentTransactions: Array<{
    id: number;
    points: number;
    createdAt: Date;
    rule: {
      name: string;
      icon: string | null;
    };
  }>;
  recentPurchases: Array<{
    id: number;
    price: number;
    createdAt: Date;
    item: {
      name: string;
      icon: string | null;
    };
  }>;
}
```

---

## 5. 기능 명세

### 5.1 페이지 구조

이 시스템은 다음과 같은 페이지로 구성되어 있습니다:

| 경로 | 페이지명 | 인증 필요 | 설명 |
|------|----------|-----------|------|
| `/` | 홈 | 아니오 | 시스템 소개 및 주요 기능 안내 |
| `/login` | 로그인 | 아니오 | 이메일/Google 로그인 |
| `/dashboard` | 대시보드 | 예 | 종합 통계 및 최근 활동 |
| `/points` | 포인트 적립 | 예 | 포인트 규칙 목록 및 적립 |
| `/shop` | 상점 | 예 | 보상 아이템 목록 및 구매 |
| `/english` | 영어 학습 | 예 | 영어 단어 학습 및 퀴즈 |
| `/goals` | 목표 설정 | 예 | 목표 관리 및 진행률 추적 |
| `/badges` | 배지 | 예 | 획득한 배지 및 미획득 배지 |

### 5.2 홈 페이지 (`/`)

**목적:** 시스템을 처음 방문한 사용자에게 주요 기능을 소개하고 로그인을 유도합니다.

**주요 요소:**

**헤더 섹션**은 큰 별 아이콘(⭐)과 함께 "주우의 포인트 시스템" 제목을 표시합니다. 부제목으로 "좋은 행동으로 포인트를 모으고, 원하는 것을 얻어보세요!"를 추가합니다.

**기능 소개 섹션**은 6개의 카드로 주요 기능을 설명합니다:
- ✨ 숙제를 일찍 끝내면 포인트 적립
- 🏃 운동을 하면 포인트 적립
- 📚 책을 읽으면 포인트 적립
- 🎓 영어 단어를 배우면 포인트 적립
- 🎮 포인트로 게임 시간 구매
- 🎁 포인트로 장난감 구매

**로그인 버튼**은 화면 하단에 크게 배치하여 "로그인하고 시작하기" 텍스트를 표시합니다. 클릭 시 `/login` 페이지로 이동합니다.

**디자인 가이드:**
- 배경: 그라데이션 (핑크-보라-블루)
- 카드: 흰색 배경, 둥근 모서리, 그림자 효과
- 폰트: 큰 크기, 굵은 글씨, 밝은 색상
- 이모지: 각 기능마다 관련 이모지 사용

### 5.3 로그인 페이지 (`/login`)

**목적:** 사용자가 이메일/비밀번호 또는 Google 계정으로 로그인할 수 있도록 합니다.

**주요 요소:**

**로그인 카드**는 화면 중앙에 위치하며 다음 요소를 포함합니다:
- 제목: "⭐ 주우의 포인트 시스템 ⭐"
- 부제목: "로그인하여 시작하기" 또는 "새 계정 만들기"

**Google 로그인 버튼**은 Google 로고와 함께 "Google로 로그인" 텍스트를 표시합니다. 클릭 시 `signInWithGoogle()` 함수를 호출하여 Google OAuth 흐름을 시작합니다.

**구분선**은 "또는" 텍스트와 함께 수평선을 표시하여 Google 로그인과 이메일 로그인을 구분합니다.

**이메일 로그인 폼**은 다음 입력 필드를 포함합니다:
- 이메일 입력 필드 (type="email", required)
- 비밀번호 입력 필드 (type="password", required)
- 로그인/회원가입 버튼

**회원가입 전환 링크**는 "계정이 없으신가요? 회원가입" 또는 "이미 계정이 있으신가요? 로그인" 텍스트를 표시하여 로그인과 회원가입 모드를 전환합니다.

**동작:**
1. Google 로그인: `signInWithGoogle()` 호출 → Google OAuth 페이지로 리다이렉트 → 인증 완료 후 홈 페이지(`/`)로 리다이렉트
2. 이메일 로그인: `signInWithEmail(email, password)` 호출 → 성공 시 홈 페이지로 리다이렉트
3. 이메일 회원가입: `signUpWithEmail(email, password)` 호출 → 이메일 확인 메시지 표시

**에러 처리:**
- 잘못된 이메일/비밀번호: "이메일 또는 비밀번호가 잘못되었습니다" 토스트 메시지
- Google 로그인 실패: "Google 로그인에 실패했습니다" 토스트 메시지
- 네트워크 오류: "네트워크 오류가 발생했습니다" 토스트 메시지

### 5.4 대시보드 페이지 (`/dashboard`)

**목적:** 주우의 현재 상태와 최근 활동을 한눈에 보여줍니다.

**주요 요소:**

**헤더 섹션**은 "안녕하세요, 주우님!" 인사말과 함께 현재 포인트 잔액을 큰 숫자로 표시합니다. 예: "현재 포인트: 350"

**통계 카드**는 4개의 카드로 주요 통계를 표시합니다:
- 총 획득 포인트: 1,250
- 총 사용 포인트: 900
- 총 구매 횟수: 12
- 배지 획득: 5/10

**최근 활동 섹션**은 두 개의 탭으로 구성됩니다:
- 포인트 내역: 최근 10개의 포인트 거래 내역을 시간 역순으로 표시
  - 각 항목: 아이콘, 규칙 이름, 포인트, 시간
  - 예: "⏰ 일찍 일어나기 +30 2시간 전"
- 구매 내역: 최근 10개의 구매 내역을 시간 역순으로 표시
  - 각 항목: 아이콘, 아이템 이름, 가격, 시간
  - 예: "🎮 게임 30분 -100 1일 전"

**빠른 액션 버튼**은 주요 기능으로 빠르게 이동할 수 있는 버튼을 제공합니다:
- "포인트 적립하기" → `/points`
- "상점 가기" → `/shop`
- "영어 공부하기" → `/english`

**디자인 가이드:**
- 레이아웃: 그리드 시스템 (2열 또는 3열)
- 카드: 흰색 배경, 둥근 모서리, 그림자 효과
- 포인트 숫자: 큰 크기, 굵은 글씨, 강조 색상
- 아이콘: 각 항목마다 관련 이모지 사용

### 5.5 포인트 적립 페이지 (`/points`)

**목적:** 주우가 좋은 행동을 했을 때 포인트를 적립하거나, 나쁜 행동을 했을 때 포인트를 차감합니다.

**주요 요소:**

**헤더 섹션**은 "포인트 적립하기" 제목과 함께 현재 포인트 잔액을 표시합니다.

**카테고리 탭**은 6개의 탭으로 포인트 규칙을 카테고리별로 분류합니다:
- 생활습관 (8개 규칙)
- 운동건강 (7개 규칙)
- 학습독서 (5개 규칙)
- 예의태도 (5개 규칙)
- 집안일 (4개 규칙)
- 부정적행동 (8개 규칙)

**포인트 규칙 버튼**은 각 카테고리 내에서 규칙을 버튼으로 표시합니다:
- 아이콘: 규칙에 맞는 이모지
- 규칙 이름: 예) "일찍 일어나기"
- 포인트: 예) "+30" (초록색) 또는 "-50" (빨간색)
- 클릭 시: 확인 다이얼로그 표시 → 확인 시 포인트 적립/차감

**확인 다이얼로그**는 다음 내용을 표시합니다:
- 제목: "포인트를 적립하시겠습니까?"
- 내용: "일찍 일어나기 +30포인트"
- 버튼: "취소", "확인"

**동작:**
1. 사용자가 규칙 버튼 클릭
2. 확인 다이얼로그 표시
3. 확인 버튼 클릭 시 `trpc.points.addTransaction.useMutation()` 호출
4. 성공 시:
   - 포인트 잔액 업데이트
   - "포인트가 적립되었습니다!" 토스트 메시지
   - 최근 거래 내역에 추가
5. 실패 시:
   - 에러 메시지 표시

**디자인 가이드:**
- 버튼: 큰 크기, 둥근 모서리, 그림자 효과
- 긍정적 행동: 초록색 계열
- 부정적 행동: 빨간색 계열
- 레이아웃: 그리드 시스템 (2-3열)

### 5.6 상점 페이지 (`/shop`)

**목적:** 주우가 모은 포인트로 원하는 보상을 구매할 수 있도록 합니다.

**주요 요소:**

**헤더 섹션**은 "포인트 상점" 제목과 함께 현재 포인트 잔액을 표시합니다.

**카테고리 탭**은 5개의 탭으로 상점 아이템을 카테고리별로 분류합니다:
- 게임시간 (7개 아이템)
- 장난감 (5개 아이템)
- 간식음식 (7개 아이템)
- 특별활동 (8개 아이템)
- 특권 (7개 아이템)

**아이템 카드**는 각 아이템을 카드 형태로 표시합니다:
- 아이콘: 아이템에 맞는 이모지
- 아이템 이름: 예) "게임 30분"
- 가격: 예) "100포인트"
- 설명: 간단한 설명 (선택적)
- 구매 버튼: "구매하기"

**구매 확인 다이얼로그**는 다음 내용을 표시합니다:
- 제목: "구매하시겠습니까?"
- 내용: "게임 30분 (100포인트)"
- 잔액 확인: "구매 후 잔액: 250포인트"
- 버튼: "취소", "구매"

**동작:**
1. 사용자가 구매 버튼 클릭
2. 포인트 부족 시: "포인트가 부족합니다!" 토스트 메시지
3. 포인트 충분 시: 구매 확인 다이얼로그 표시
4. 구매 버튼 클릭 시 `trpc.shop.purchaseItem.useMutation()` 호출
5. 성공 시:
   - 포인트 차감
   - "구매가 완료되었습니다!" 토스트 메시지
   - 구매 내역에 추가
6. 실패 시:
   - 에러 메시지 표시

**디자인 가이드:**
- 카드: 흰색 배경, 둥근 모서리, 그림자 효과
- 가격: 큰 크기, 굵은 글씨, 강조 색상
- 구매 가능: 초록색 버튼
- 구매 불가능: 회색 버튼 (비활성화)
- 레이아웃: 그리드 시스템 (2-3열)

### 5.7 영어 학습 페이지 (`/english`)

**목적:** 주우가 영어 단어를 학습하고 퀴즈를 풀어 포인트를 획득할 수 있도록 합니다.

**주요 요소:**

**헤더 섹션**은 "영어 공부하기" 제목과 함께 학습 진도를 표시합니다. 예: "학습 완료: 25/100 단어"

**카테고리 선택**은 10개의 카테고리 버튼을 표시합니다:
- 동물, 색깔, 음식, 가족, 숫자, 신체, 학교, 날씨, 동사, 형용사

**학습 모드 선택**은 두 개의 버튼을 표시합니다:
- 플래시카드: 단어를 보고 뜻을 확인
- 퀴즈: 4지선다 문제 풀기

**플래시카드 모드:**
1. 카드 앞면: 영어 단어 (예: "dog")
2. 카드 뒤집기: 클릭 시 한글 뜻 표시 (예: "개")
3. 다음 버튼: 다음 단어로 이동
4. 이전 버튼: 이전 단어로 이동
5. 진행률 표시: "3/10"

**퀴즈 모드:**
1. 문제: 영어 단어 표시 (예: "dog")
2. 선택지: 4개의 한글 뜻 버튼 (예: "개", "고양이", "새", "물고기")
3. 정답 선택 시:
   - 초록색으로 강조
   - "정답입니다! +50포인트" 토스트 메시지
   - `trpc.english.submitAnswer.useMutation()` 호출
   - 포인트 자동 적립
4. 오답 선택 시:
   - 빨간색으로 강조
   - 정답을 초록색으로 표시
   - "오답입니다. 정답은 '개'입니다" 토스트 메시지
5. 다음 문제 버튼: 다음 단어로 이동

**동작:**
1. 카테고리 선택 시 해당 카테고리의 단어 목록 로드
2. 학습 모드 선택 시 첫 번째 단어 표시
3. 퀴즈 정답 제출 시:
   - 학습 진도 업데이트
   - 정답인 경우 50포인트 적립
   - 포인트 잔액 업데이트

**디자인 가이드:**
- 카드: 큰 크기, 둥근 모서리, 그림자 효과
- 영어 단어: 매우 큰 크기, 굵은 글씨
- 한글 뜻: 중간 크기
- 선택지 버튼: 큰 크기, 명확한 구분
- 정답: 초록색 배경
- 오답: 빨간색 배경

### 5.8 목표 설정 페이지 (`/goals`)

**목적:** 주우가 원하는 상점 아이템을 목표로 설정하고 진행률을 추적할 수 있도록 합니다.

**주요 요소:**

**헤더 섹션**은 "목표 설정" 제목과 함께 현재 포인트 잔액을 표시합니다.

**현재 목표 섹션**은 설정된 목표를 카드 형태로 표시합니다:
- 아이템 아이콘 및 이름
- 목표 포인트: 예) "500포인트"
- 현재 포인트: 예) "250포인트"
- 진행률 바: 시각적으로 진행률 표시 (예: 50%)
- 남은 포인트: 예) "250포인트 더 필요"
- 삭제 버튼: 목표 삭제

**새 목표 추가 버튼**은 "+" 아이콘과 함께 "새 목표 추가" 텍스트를 표시합니다. 클릭 시 상점 아이템 선택 다이얼로그를 표시합니다.

**상점 아이템 선택 다이얼로그**는 모든 상점 아이템을 목록으로 표시합니다:
- 각 아이템: 아이콘, 이름, 가격
- 선택 버튼: "목표로 설정"

**동작:**
1. 새 목표 추가 버튼 클릭
2. 상점 아이템 선택 다이얼로그 표시
3. 아이템 선택 시 `trpc.goals.addGoal.useMutation()` 호출
4. 성공 시:
   - 목표 목록에 추가
   - "목표가 설정되었습니다!" 토스트 메시지
5. 목표 삭제 시 `trpc.goals.deleteGoal.useMutation()` 호출

**디자인 가이드:**
- 진행률 바: 초록색 (진행), 회색 (미진행)
- 완료된 목표: 금색 테두리, 축하 아이콘
- 레이아웃: 그리드 시스템 (2열)

### 5.9 배지 페이지 (`/badges`)

**목적:** 주우가 획득한 배지와 미획득 배지를 확인할 수 있도록 합니다.

**주요 요소:**

**헤더 섹션**은 "배지 컬렉션" 제목과 함께 획득한 배지 개수를 표시합니다. 예: "5/10 배지 획득"

**배지 그리드**는 모든 배지를 카드 형태로 표시합니다:
- 획득한 배지:
  - 컬러 아이콘
  - 배지 이름
  - 배지 설명
  - 획득 날짜
- 미획득 배지:
  - 회색 아이콘
  - 배지 이름
  - 획득 조건
  - 잠금 아이콘

**배지 상세 다이얼로그**는 배지 클릭 시 다음 내용을 표시합니다:
- 큰 아이콘
- 배지 이름
- 배지 설명
- 획득 조건 또는 획득 날짜
- 닫기 버튼

**동작:**
1. 페이지 로드 시 모든 배지와 사용자 배지 로드
2. 배지 클릭 시 상세 다이얼로그 표시
3. 배지 획득 시 (자동):
   - 축하 애니메이션 표시
   - "새 배지를 획득했습니다!" 토스트 메시지

**디자인 가이드:**
- 획득한 배지: 밝은 색상, 그림자 효과
- 미획득 배지: 회색 필터, 반투명
- 레이아웃: 그리드 시스템 (3-4열)
- 애니메이션: 획득 시 반짝이는 효과

---

## 6. UI/UX 디자인 가이드

### 6.1 디자인 철학

이 시스템의 디자인은 7세 어린이를 위한 것이므로, 다음 원칙을 따릅니다:

**직관성 (Intuitive):** 복잡한 설명 없이도 버튼의 기능을 이해할 수 있어야 합니다. 큰 아이콘과 명확한 텍스트를 사용합니다.

**친근함 (Friendly):** 밝은 색상, 둥근 모서리, 이모지를 활용하여 친근한 느낌을 줍니다.

**피드백 (Feedback):** 모든 액션에 대해 즉각적인 피드백을 제공합니다. 토스트 메시지, 애니메이션, 소리 효과 등을 활용합니다.

**성취감 (Achievement):** 포인트 적립, 배지 획득, 목표 달성 등 성취감을 느낄 수 있는 요소를 강조합니다.

### 6.2 색상 팔레트

이 시스템은 밝고 활기찬 색상을 사용합니다:

| 색상 | Hex Code | 용도 |
|------|----------|------|
| 주 색상 (Primary) | `#6366f1` (인디고) | 버튼, 링크, 강조 |
| 보조 색상 (Secondary) | `#ec4899` (핑크) | 배지, 특별 요소 |
| 성공 (Success) | `#10b981` (초록) | 포인트 적립, 정답 |
| 경고 (Warning) | `#f59e0b` (주황) | 주의 메시지 |
| 오류 (Error) | `#ef4444` (빨강) | 포인트 차감, 오답 |
| 배경 (Background) | `#f9fafb` (밝은 회색) | 페이지 배경 |
| 카드 (Card) | `#ffffff` (흰색) | 카드 배경 |
| 텍스트 (Text) | `#111827` (진한 회색) | 본문 텍스트 |
| 보조 텍스트 (Muted) | `#6b7280` (회색) | 부가 정보 |

### 6.3 타이포그래피

**폰트 패밀리:** 시스템 기본 폰트 (San Francisco, Segoe UI, Roboto 등)를 사용하여 빠른 로딩과 일관성을 보장합니다.

**폰트 크기:**
- 제목 (Heading 1): 36px, 굵게
- 부제목 (Heading 2): 24px, 굵게
- 본문 (Body): 16px, 보통
- 작은 텍스트 (Small): 14px, 보통
- 버튼 텍스트: 18px, 굵게

**행간 (Line Height):**
- 제목: 1.2
- 본문: 1.5

### 6.4 컴포넌트 스타일

**버튼:**
- 크기: 최소 44px 높이 (터치 친화적)
- 모서리: 8px 둥근 모서리
- 그림자: `0 2px 4px rgba(0, 0, 0, 0.1)`
- 호버 효과: 약간 어두워짐
- 클릭 효과: 약간 작아짐 (scale: 0.98)

**카드:**
- 배경: 흰색
- 모서리: 12px 둥근 모서리
- 그림자: `0 4px 6px rgba(0, 0, 0, 0.1)`
- 패딩: 16px
- 호버 효과: 그림자 강화

**입력 필드:**
- 높이: 44px
- 모서리: 8px 둥근 모서리
- 테두리: 1px 회색
- 포커스: 파란색 테두리

**아이콘:**
- 크기: 24px (일반), 48px (큰 아이콘)
- 스타일: 이모지 또는 Lucide React 아이콘

### 6.5 레이아웃

**컨테이너:**
- 최대 너비: 1200px
- 중앙 정렬
- 좌우 패딩: 16px (모바일), 24px (데스크톱)

**그리드 시스템:**
- 모바일: 1열
- 태블릿: 2열
- 데스크톱: 3-4열
- 간격: 16px

**여백:**
- 섹션 간: 48px
- 요소 간: 16px
- 카드 내부: 16px

### 6.6 애니메이션

**페이지 전환:**
- 페이드 인/아웃
- 지속 시간: 200ms

**버튼 클릭:**
- 스케일 다운 (0.98)
- 지속 시간: 100ms

**토스트 메시지:**
- 슬라이드 인 (아래에서 위로)
- 지속 시간: 300ms
- 자동 사라짐: 3초 후

**배지 획득:**
- 반짝이는 효과
- 스케일 업 (1.2)
- 지속 시간: 500ms

### 6.7 반응형 디자인

**브레이크포인트:**
- 모바일: 0-640px
- 태블릿: 641-1024px
- 데스크톱: 1025px 이상

**모바일 최적화:**
- 큰 버튼 (최소 44px 높이)
- 간단한 네비게이션
- 세로 스크롤 우선
- 터치 제스처 지원

**태블릿 최적화:**
- 2열 그리드
- 사이드바 네비게이션 (선택적)
- 가로/세로 모드 지원

**데스크톱 최적화:**
- 3-4열 그리드
- 고정 사이드바 (선택적)
- 마우스 호버 효과

### 6.8 접근성 (Accessibility)

**키보드 네비게이션:**
- Tab 키로 모든 인터랙티브 요소 접근 가능
- Enter 키로 버튼 클릭
- Esc 키로 다이얼로그 닫기

**색상 대비:**
- WCAG AA 기준 준수 (4.5:1 이상)
- 텍스트와 배경 간 충분한 대비

**대체 텍스트:**
- 모든 이미지에 alt 속성 추가
- 아이콘에 aria-label 추가

**포커스 표시:**
- 포커스된 요소에 명확한 테두리 표시
- 파란색 테두리 (2px)

---

## 7. 환경 설정 및 배포

### 7.1 개발 환경 설정

**필수 소프트웨어:**
- Node.js 22.x 이상
- pnpm 9.x 이상
- Git

**프로젝트 클론:**
```bash
git clone https://github.com/howpapa-sky/juwoo-point-system.git
cd juwoo-point-system
```

**의존성 설치:**
```bash
pnpm install
```

**환경 변수 설정:**

`.env` 파일을 프로젝트 루트에 생성하고 다음 변수를 설정합니다:

```env
# Supabase
VITE_SUPABASE_URL=https://vqxuavqpevllzzgkpudp.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 데이터베이스 (서버용)
DATABASE_URL=postgresql://postgres:password@db.vqxuavqpevllzzgkpudp.supabase.co:5432/postgres

# 앱 설정
VITE_APP_TITLE=주우의 포인트 시스템
VITE_APP_LOGO=⭐
```

**데이터베이스 초기화:**

Supabase Dashboard에서 SQL Editor를 열고 섹션 3.4의 SQL 스크립트를 실행합니다.

**개발 서버 실행:**
```bash
pnpm dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

### 7.2 Supabase 설정

**1. Supabase 프로젝트 생성:**
- https://supabase.com 접속
- "New Project" 클릭
- 프로젝트 이름: `juwoo_point`
- 데이터베이스 비밀번호 설정
- 리전 선택: Asia Pacific (Seoul)

**2. API 키 확인:**
- Project Settings → API
- `anon` key 복사하여 `.env`의 `VITE_SUPABASE_ANON_KEY`에 입력
- `service_role` key는 서버에서만 사용 (보안 주의)

**3. 데이터베이스 연결 문자열:**
- Project Settings → Database
- Connection string 복사하여 `.env`의 `DATABASE_URL`에 입력

**4. Google OAuth 설정:**
- Authentication → Providers → Google
- "Enable Sign in with Google" 활성화
- Google Cloud Console에서 OAuth 2.0 Client ID 생성
- Client ID와 Client Secret 입력
- Authorized redirect URIs에 Supabase Callback URL 추가:
  ```
  https://vqxuavqpevllzzgkpudp.supabase.co/auth/v1/callback
  ```

### 7.3 배포

**Manus Platform 배포:**

이 프로젝트는 Manus Platform에서 개발되었으므로, 다음 단계로 배포할 수 있습니다:

1. Management UI에서 "Publish" 버튼 클릭
2. 배포 설정 확인
3. 배포 완료 후 공개 URL 확인

**Vercel 배포 (대안):**

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 배포
vercel

# 환경 변수 설정
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add DATABASE_URL

# 프로덕션 배포
vercel --prod
```

**환경 변수 설정 (프로덕션):**

배포 플랫폼의 환경 변수 설정에서 `.env` 파일의 모든 변수를 추가합니다.

### 7.4 데이터 초기화

**포인트 규칙 데이터 삽입:**

`scripts/insert_point_rules.sh` 스크립트를 실행하여 37개의 포인트 규칙을 삽입합니다:

```bash
bash scripts/insert_point_rules.sh
```

**상점 아이템 데이터 삽입:**

`scripts/insert_shop_items.sh` 스크립트를 실행하여 34개의 상점 아이템을 삽입합니다:

```bash
bash scripts/insert_shop_items.sh
```

**영어 단어 데이터 삽입:**

`scripts/insert-english-words.sh` 스크립트를 실행하여 100개의 영어 단어를 삽입합니다:

```bash
bash scripts/insert-english-words.sh
```

**배지 데이터 삽입:**

Supabase Dashboard의 SQL Editor에서 다음 SQL을 실행합니다:

```sql
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
('첫 포인트', '첫 포인트를 획득했어요!', '🌟', 'points', 1),
('100포인트', '100포인트를 모았어요!', '⭐', 'points', 100),
('1000포인트', '1000포인트를 모았어요!', '💫', 'points', 1000),
('첫 구매', '첫 상점 구매를 했어요!', '🛒', 'purchases', 1),
('10번 구매', '10번 구매를 했어요!', '🎁', 'purchases', 10),
('첫 영어 단어', '첫 영어 단어를 배웠어요!', '📚', 'words', 1),
('50개 단어', '50개 단어를 배웠어요!', '📖', 'words', 50),
('연속 7일', '7일 연속 접속했어요!', '🔥', 'streak', 7),
('연속 30일', '30일 연속 접속했어요!', '🏆', 'streak', 30),
('모든 카테고리', '모든 카테고리를 완료했어요!', '👑', 'categories', 10);
```

### 7.5 모니터링 및 유지보수

**로그 확인:**

Supabase Dashboard에서 로그를 확인할 수 있습니다:
- Database → Logs
- API → Logs

**데이터베이스 백업:**

Supabase는 자동으로 데이터베이스를 백업합니다. 수동 백업이 필요한 경우:
- Database → Backups
- "Create Backup" 클릭

**성능 모니터링:**

Supabase Dashboard에서 성능 지표를 확인할 수 있습니다:
- Database → Performance
- API → Performance

**오류 추적:**

프론트엔드 오류는 브라우저 콘솔에서 확인할 수 있습니다. 프로덕션 환경에서는 Sentry 등의 오류 추적 도구를 사용하는 것을 권장합니다.

---

## 8. 개발 가이드

### 8.1 코드 구조

**프론트엔드 (Client):**

프론트엔드는 React 19와 TypeScript로 작성되어 있으며, 다음과 같은 구조를 따릅니다:

```typescript
// 페이지 컴포넌트 예시 (client/src/pages/Dashboard.tsx)
import { trpc } from '@/lib/trpc';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function Dashboard() {
  const { user } = useSupabaseAuth();
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  if (isLoading) return <div>로딩 중...</div>;
  if (!stats) return <div>데이터를 불러올 수 없습니다</div>;

  return (
    <div>
      <h1>대시보드</h1>
      <p>현재 포인트: {stats.currentPoints}</p>
      {/* ... */}
    </div>
  );
}
```

**백엔드 (Server):**

백엔드는 tRPC를 사용하여 타입 안전한 API를 제공합니다:

```typescript
// 라우터 정의 (server/routers.ts)
import { router, publicProcedure, protectedProcedure } from './_core/trpc';
import { z } from 'zod';
import * as db from './db';

export const appRouter = router({
  points: router({
    getRules: publicProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(async ({ input }) => {
        return await db.getPointRules(input.category);
      }),
    
    addTransaction: protectedProcedure
      .input(z.object({
        ruleId: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const juwooId = ctx.user.id;
        return await db.addPointTransaction(juwooId, input.ruleId, input.note);
      }),
  }),
});
```

**데이터베이스 쿼리 (server/db.ts):**

데이터베이스 쿼리는 Supabase 클라이언트를 사용합니다:

```typescript
// 데이터베이스 쿼리 함수 (server/db.ts)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getPointRules(category?: string) {
  let query = supabase.from('point_rules').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // snake_case를 camelCase로 변환
  return data.map(row => ({
    id: row.id,
    category: row.category,
    name: row.name,
    points: row.points,
    description: row.description,
    icon: row.icon,
    createdAt: new Date(row.created_at),
  }));
}
```

### 8.2 새로운 기능 추가하기

**1. 데이터베이스 스키마 추가:**

`drizzle/schema.ts`에 새 테이블 정의를 추가합니다:

```typescript
export const newFeature = mysqlTable("new_feature", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

Supabase Dashboard에서 SQL을 실행하여 테이블을 생성합니다.

**2. 데이터베이스 쿼리 함수 추가:**

`server/db.ts`에 새 쿼리 함수를 추가합니다:

```typescript
export async function getNewFeature() {
  const { data, error } = await supabase
    .from('new_feature')
    .select('*');
  
  if (error) throw error;
  return data;
}
```

**3. tRPC 라우터 추가:**

`server/routers.ts`에 새 라우터를 추가합니다:

```typescript
export const appRouter = router({
  // ... 기존 라우터
  newFeature: router({
    getAll: publicProcedure.query(async () => {
      return await db.getNewFeature();
    }),
  }),
});
```

**4. 프론트엔드 페이지 추가:**

`client/src/pages/NewFeature.tsx`에 새 페이지를 생성합니다:

```typescript
import { trpc } from '@/lib/trpc';

export default function NewFeature() {
  const { data, isLoading } = trpc.newFeature.getAll.useQuery();

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div>
      <h1>새 기능</h1>
      {/* ... */}
    </div>
  );
}
```

**5. 라우트 추가:**

`client/src/App.tsx`에 새 라우트를 추가합니다:

```typescript
<Route path="/new-feature" component={NewFeature} />
```

### 8.3 테스트

**단위 테스트 (Vitest):**

```bash
pnpm test
```

**E2E 테스트 (Playwright):**

```bash
pnpm test:e2e
```

**테스트 작성 예시:**

```typescript
// server/routers.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('Points Router', () => {
  it('should return all point rules', async () => {
    const caller = appRouter.createCaller({});
    const rules = await caller.points.getRules({});
    
    expect(rules).toBeInstanceOf(Array);
    expect(rules.length).toBeGreaterThan(0);
  });
});
```

### 8.4 코드 스타일

**ESLint 설정:**

프로젝트는 ESLint를 사용하여 코드 스타일을 강제합니다:

```bash
pnpm lint
```

**Prettier 설정:**

코드 포맷팅은 Prettier를 사용합니다:

```bash
pnpm format
```

**커밋 메시지 규칙:**

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경 (포맷팅)
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 설정 변경
```

### 8.5 문제 해결

**일반적인 문제:**

**문제 1: Supabase 연결 오류**
- 원인: 잘못된 API 키 또는 URL
- 해결: `.env` 파일의 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`를 확인

**문제 2: tRPC 타입 오류**
- 원인: 서버와 클라이언트 간 타입 불일치
- 해결: `pnpm build`를 실행하여 타입을 재생성

**문제 3: Google OAuth 403 오류**
- 원인: Authorized redirect URIs 설정 오류
- 해결: Google Cloud Console에서 Redirect URI를 확인

**문제 4: 데이터베이스 연결 오류**
- 원인: 잘못된 DATABASE_URL 또는 방화벽 설정
- 해결: Supabase Dashboard에서 연결 문자열을 확인하고, IP 화이트리스트를 설정

**디버깅 팁:**

- 브라우저 개발자 도구의 Network 탭에서 API 요청 확인
- Supabase Dashboard의 Logs에서 데이터베이스 쿼리 확인
- `console.log`를 사용하여 변수 값 출력
- React DevTools를 사용하여 컴포넌트 상태 확인

---

## 9. 참고 자료

### 9.1 기술 문서

- [React 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [tRPC 공식 문서](https://trpc.io/)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [shadcn/ui 공식 문서](https://ui.shadcn.com/)

### 9.2 관련 프로젝트

- [Manus Platform](https://manus.im/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Wouter](https://github.com/molefrog/wouter)

### 9.3 커뮤니티

- [Supabase Discord](https://discord.supabase.com/)
- [tRPC Discord](https://trpc.io/discord)
- [React Discord](https://discord.gg/react)

---

## 10. 라이선스 및 저작권

이 프로젝트는 개인 프로젝트로 제작되었으며, 상업적 사용을 금지합니다. 교육 목적으로만 사용할 수 있습니다.

**작성자:** Manus AI  
**프로젝트 소유자:** howpapa-sky  
**GitHub 리포지토리:** https://github.com/howpapa-sky/juwoo-point-system

---

## 11. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-17 | 초기 버전 작성 |

---

**문서 끝**

이 기획서는 주우 포인트 시스템의 모든 사양을 상세하게 문서화한 것입니다. 다른 개발자가 이 문서를 참고하여 동일한 시스템을 구현할 수 있습니다. 추가 질문이나 수정 사항이 있으면 언제든지 문의하세요.


---

## 3. 데이터베이스 스키마

### 3.1 Supabase PostgreSQL 테이블 구조

#### users (사용자)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_signed_in TIMESTAMP DEFAULT NOW()
);
```

**필드 설명:**
- `id`: 자동 증가 기본 키
- `open_id`: Supabase Auth의 사용자 고유 ID
- `name`: 사용자 이름
- `email`: 이메일 주소
- `login_method`: 로그인 방법 (email, google 등)
- `role`: 사용자 역할 (user, admin)
- `created_at`: 계정 생성 시간
- `updated_at`: 마지막 업데이트 시간
- `last_signed_in`: 마지막 로그인 시간

---

#### juwoo_profile (주우 프로필)
```sql
CREATE TABLE juwoo_profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**필드 설명:**
- `id`: 프로필 ID (기본값: 1)
- `name`: 주우의 이름
- `age`: 나이
- `total_points`: 누적 포인트
- `created_at`: 프로필 생성 시간
- `updated_at`: 마지막 업데이트 시간

**초기 데이터:**
```sql
INSERT INTO juwoo_profile (id, name, age, total_points) 
VALUES (1, '주우', 7, 0);
```

---

#### point_rules (포인트 규칙)
```sql
CREATE TABLE point_rules (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  action VARCHAR(200) NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_point_rules_category ON point_rules(category);
```

**필드 설명:**
- `id`: 규칙 ID
- `category`: 카테고리 (생활습관, 운동건강, 학습독서, 예의태도, 집안일, 부정적행동)
- `action`: 행동 설명
- `points`: 적립/차감 포인트 (양수: 적립, 음수: 차감)
- `description`: 상세 설명
- `created_at`: 규칙 생성 시간

**카테고리별 규칙 개수:**
- 생활습관: 8개
- 운동건강: 7개
- 학습독서: 5개
- 예의태도: 5개
- 집안일: 4개
- 부정적행동: 8개 (음수 포인트)

---

#### shop_items (상점 아이템)
```sql
CREATE TABLE shop_items (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  points_required INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shop_items_category ON shop_items(category);
CREATE INDEX idx_shop_items_available ON shop_items(available);
```

**필드 설명:**
- `id`: 아이템 ID
- `category`: 카테고리 (게임시간, 장난감, 간식음식, 특별활동, 특권)
- `name`: 아이템 이름
- `points_required`: 필요 포인트
- `description`: 상세 설명
- `image_url`: 이미지 URL (선택)
- `available`: 구매 가능 여부
- `created_at`: 아이템 생성 시간

**카테고리별 아이템 개수:**
- 게임시간: 7개
- 장난감: 5개
- 간식음식: 7개
- 특별활동: 8개
- 특권: 7개

---

#### point_transactions (포인트 거래 내역)
```sql
CREATE TABLE point_transactions (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER REFERENCES juwoo_profile(id),
  rule_id INTEGER REFERENCES point_rules(id),
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_juwoo ON point_transactions(juwoo_id);
CREATE INDEX idx_point_transactions_date ON point_transactions(created_at DESC);
```

**필드 설명:**
- `id`: 거래 ID
- `juwoo_id`: 주우 프로필 ID (외래 키)
- `rule_id`: 포인트 규칙 ID (외래 키)
- `points`: 적립/차감된 포인트
- `balance_after`: 거래 후 잔액
- `note`: 메모
- `created_at`: 거래 시간

---

#### purchases (구매 내역)
```sql
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER REFERENCES juwoo_profile(id),
  item_id INTEGER REFERENCES shop_items(id),
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  purchased_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_purchases_juwoo ON purchases(juwoo_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_date ON purchases(purchased_at DESC);
```

**필드 설명:**
- `id`: 구매 ID
- `juwoo_id`: 주우 프로필 ID (외래 키)
- `item_id`: 상점 아이템 ID (외래 키)
- `points_spent`: 사용한 포인트
- `status`: 구매 상태 (pending, approved, rejected, completed)
- `purchased_at`: 구매 요청 시간
- `completed_at`: 완료 시간

---

#### english_words (영어 단어)
```sql
CREATE TABLE english_words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  meaning VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_english_words_category ON english_words(category);
CREATE INDEX idx_english_words_difficulty ON english_words(difficulty);
```

**필드 설명:**
- `id`: 단어 ID
- `word`: 영어 단어
- `meaning`: 한글 뜻
- `category`: 카테고리 (동물, 색깔, 음식, 가족, 숫자, 신체, 학교, 날씨, 동사, 형용사)
- `difficulty`: 난이도 (1-5)
- `created_at`: 단어 생성 시간

**카테고리별 단어 개수:** 각 10개 (총 100개)

---

#### word_learning_progress (단어 학습 진도)
```sql
CREATE TABLE word_learning_progress (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER REFERENCES juwoo_profile(id),
  word_id INTEGER REFERENCES english_words(id),
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_practiced TIMESTAMP,
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(juwoo_id, word_id)
);

CREATE INDEX idx_word_progress_juwoo ON word_learning_progress(juwoo_id);
CREATE INDEX idx_word_progress_mastered ON word_learning_progress(mastered);
```

**필드 설명:**
- `id`: 진도 ID
- `juwoo_id`: 주우 프로필 ID (외래 키)
- `word_id`: 단어 ID (외래 키)
- `correct_count`: 정답 횟수
- `incorrect_count`: 오답 횟수
- `last_practiced`: 마지막 학습 시간
- `mastered`: 마스터 여부 (정답 3회 이상)
- `created_at`: 진도 생성 시간

---

#### badges (배지/업적)
```sql
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  condition_type VARCHAR(50) NOT NULL,
  condition_value INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**필드 설명:**
- `id`: 배지 ID
- `name`: 배지 이름
- `description`: 배지 설명
- `icon`: 아이콘 이름 (lucide-react 아이콘)
- `condition_type`: 조건 타입 (points, words, streak 등)
- `condition_value`: 조건 값
- `created_at`: 배지 생성 시간

**배지 목록 (10개):**
1. 첫 포인트 (조건: 1포인트 이상)
2. 100포인트 달성
3. 500포인트 달성
4. 1000포인트 달성
5. 첫 영어 단어 학습
6. 10개 단어 마스터
7. 50개 단어 마스터
8. 100개 단어 마스터
9. 7일 연속 학습
10. 첫 상점 구매

---

#### user_badges (획득한 배지)
```sql
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER REFERENCES juwoo_profile(id),
  badge_id INTEGER REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(juwoo_id, badge_id)
);

CREATE INDEX idx_user_badges_juwoo ON user_badges(juwoo_id);
CREATE INDEX idx_user_badges_date ON user_badges(earned_at DESC);
```

**필드 설명:**
- `id`: 획득 ID
- `juwoo_id`: 주우 프로필 ID (외래 키)
- `badge_id`: 배지 ID (외래 키)
- `earned_at`: 획득 시간

---

#### goals (목표)
```sql
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER REFERENCES juwoo_profile(id),
  item_id INTEGER REFERENCES shop_items(id),
  target_points INTEGER NOT NULL,
  current_progress INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_goals_juwoo ON goals(juwoo_id);
CREATE INDEX idx_goals_status ON goals(status);
```

**필드 설명:**
- `id`: 목표 ID
- `juwoo_id`: 주우 프로필 ID (외래 키)
- `item_id`: 목표 아이템 ID (외래 키)
- `target_points`: 목표 포인트
- `current_progress`: 현재 진행률 (포인트)
- `status`: 목표 상태 (active, completed, cancelled)
- `created_at`: 목표 생성 시간
- `completed_at`: 완료 시간

---

### 3.2 데이터베이스 관계도

```
users (인증)
  ↓
juwoo_profile (프로필)
  ├── point_transactions (포인트 내역) → point_rules
  ├── purchases (구매 내역) → shop_items
  ├── word_learning_progress (학습 진도) → english_words
  ├── user_badges (획득 배지) → badges
  └── goals (목표) → shop_items
```

---

### 3.3 데이터베이스 제약 조건

1. **외래 키 제약:**
   - 모든 외래 키는 `ON DELETE CASCADE` 또는 `ON DELETE SET NULL` 설정
   - 주요 데이터 삭제 시 관련 데이터 자동 처리

2. **고유 제약:**
   - `users.open_id`: 중복 불가
   - `word_learning_progress(juwoo_id, word_id)`: 중복 불가
   - `user_badges(juwoo_id, badge_id)`: 중복 불가

3. **체크 제약:**
   - `users.role`: 'user' 또는 'admin'만 허용
   - `purchases.status`: 'pending', 'approved', 'rejected', 'completed'만 허용
   - `goals.status`: 'active', 'completed', 'cancelled'만 허용
   - `english_words.difficulty`: 1-5 범위

4. **기본값:**
   - 모든 `created_at`: 현재 시간
   - `juwoo_profile.total_points`: 0
   - `shop_items.available`: true
   - `purchases.status`: 'pending'
   - `goals.status`: 'active'

