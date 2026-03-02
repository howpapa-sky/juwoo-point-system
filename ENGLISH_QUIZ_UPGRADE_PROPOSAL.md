# 영어 단어 퀴즈 듀오링고급 퀄리티 업그레이드 — 100% 의뢰서

**작성일**: 2026-03-02
**대상 시스템**: 주우포인트 영어 단어 퀴즈 (`/english-quiz`)
**목표**: 듀오링고·글로벌 에듀테크 수준의 학습 퀄리티 달성
**핵심 원칙**: 주우(8세)의 K-WISC-V / JTCI 인지·기질 프로파일에 100% 맞춤 설계

---

## 제1부: 현재 시스템 분석

### 1.1 현재 영어 퀴즈 현황

| 항목 | 현재 상태 |
|------|-----------|
| **파일** | `client/src/pages/EnglishQuiz.tsx` (2,025줄 단일 파일) |
| **단어 수** | 1,000개 이상 (`englishWordsData.ts`) |
| **카테고리** | 25개 (동물, 과일, 색깔, 숫자, 가족, 음식, 자연, 탈것, 신체, 감정, 날씨, 포켓몬, 동사, 학교, 장소, 반대말, 시간, 일상표현, 옷, 집, 스포츠, 직업, 악기, 형용사, 문장) |
| **난이도** | 4단계 (easy, medium, hard, expert) |
| **게임 모드** | 11가지 (객관식, 타이핑, 듣기, 한→영, 그림맞추기, 철자퍼즐, 스피드, 타임어택, 보스배틀, 서바이벌, 믹스) |
| **테마** | 6종 (기본, 포켓몬, 바다, 숲, 캔디, 우주) |
| **배지** | 13종 |
| **XP/레벨** | 기하급수 XP 시스템 존재 |
| **사운드** | Web Audio API 효과음 + SpeechSynthesis TTS |
| **애니메이션** | Framer Motion + canvas-confetti |
| **피드백** | `feedbackMessages.ts` (적응형 패턴, 찍기 감지, 연속 정답 보너스) |

### 1.2 듀오링고 대비 핵심 격차 (Critical Gap Analysis)

#### 격차 1: 교육 과학 부재
| 듀오링고 | 현재 시스템 | 영향도 |
|----------|-----------|--------|
| SRS(간격 반복) 알고리즘 | 없음 — 랜덤 출제 | **치명적** — 학습 효과 50% 이하 |
| 새 단어 사전 소개 후 테스트 | 없음 — 바로 퀴즈 | **치명적** — 불안 유발 |
| 오답 자동 재출제 | 없음 | **높음** — 약점 보강 불가 |
| 단어 숙련도 DB 기록 | 없음 — 메모리만 | **높음** — 진행률 유실 |
| 문장 빈칸 채우기 | 없음 | **중간** — 문맥 학습 불가 |
| 짝 맞추기 (매칭) | 없음 | **중간** — 학습 유형 부족 |

#### 격차 2: 주우 맞춤 UX 위반
| 문제 | 위치 | 주우 영향 |
|------|------|----------|
| `toast.error()` 빨간 토스트 | Line 589, 841 | 예기불안(HA 67%) 자극 |
| ❤️ 빨간 하트 목숨 3개 | Line 1589-1594 | 빨간색 = 위험 신호 |
| 타이머 5초 이하 빨간색 | Line 1619 | 시간 압박 + 빨간색 이중 자극 |
| "어려움" 난이도 빨간색 | Line 1243, 1683 | 도전을 위험으로 인식 |
| 보스 HP 바 빨간색 | Line 1650 | 전투=위험=불안 |
| `lives <= 0` 즉시 게임오버 | Line 855 | 3번 틀리면 강제 종료 → 회피 전략 강화 |
| "시간 초과!", "틀렸어요!" | Line 589, 841 | 부정 표현 → 자존감 저하 |

#### 격차 3: 구조적 문제
| 문제 | 현재 | 개선안 |
|------|------|--------|
| 2,025줄 단일 파일 | 유지보수 불가 | 30+ 모듈로 분리 |
| 캐릭터/세계관 없음 | 자기초월(ST) 98%에 미스매치 | "영단이" 캐릭터 도입 |
| 포인트 1회만 지급 | `like("note","영어 퀴즈%")` 전체 기간 | 일일 제한으로 변경 |

---

## 제2부: 주우 인지·기질 프로파일 기반 설계 원칙

### 2.1 K-WISC-V 인지 프로파일

| 지표 | 점수 | 백분위 | 설계 시사점 |
|------|------|--------|------------|
| 언어이해(VCI) | 111 | 상위 23% | **최대 강점** — 텍스트·음성 학습 우선, 어휘력 기반 접근 |
| 시공간(VSI) | 64 | 하위 1% | **최대 약점** — 한 화면 한 과제, 공간 배치 단순화, 드래그 최소화 |
| 유동추론(FRI) | - | - | 패턴 인식 문제 유형 적합 |
| 작업기억(WMI) | - | - | 한 번에 4개 이하 선택지, 정보량 제한 |
| 처리속도(PSI) | 81 | 하위 11% | 시간 압박 **기본 OFF**, 느린 TTS 제공, 큰 터치 타겟 |

### 2.2 JTCI 기질 프로파일

| 기질 차원 | 백분위 | 해석 | 영어 퀴즈 설계 반영 |
|-----------|--------|------|---------------------|
| 자극추구(NS) | 73% | 새로운 것에 강한 흥미 | 매 세션 다른 게임 모드 믹스, 랜덤 요소 풍부, 보상 다양화 |
| 위험회피(HA) | 67% | 예기불안 높음, 실패 두려움 | 빨간색 금지→주황색, "게임오버" 삭제, 힌트 상시 제공, 오답도 격려 |
| 사회적 민감성(RD) | 15% | 칭찬에 둔감 | 리더보드 불필요, 자기 성장 피드백 중심, 단순 칭찬보다 구체적 피드백 |
| 인내력(P) | - | - | 세션 길이 10-12문제로 적정화, 쉬운 문제 먼저 |
| 자율성(SD) | 27% | 어려우면 회피 | 힌트 버튼 상시 표시, "모르겠어요" 버튼 유지, 도움 요청=용기 |
| 연대감(CO) | - | - | 캐릭터와 함께 학습하는 내러티브 |
| 자기초월(ST) | 98% | 상상력·몰입 극대 | **"영단이" 캐릭터** 세계관 필수, 스토리 내러티브, 성장 메타포 |

### 2.3 UX 기본 규칙 (모든 화면 적용)

```
1. 빨간색 사용 완전 금지 → 오답=주황색(#FF9600), 경고=amber
2. "실패", "게임오버", "틀렸어요" 표현 금지 → "아쉬워요", "다음에 더 잘할 수 있어"
3. 한 화면에 하나의 과제만 (VSI 64)
4. 최소 폰트 16px, 최소 터치 타겟 48px (PSI 81)
5. 시간 압박 기본 OFF (스피드/타임어택 모드는 선택적)
6. 힌트 항상 표시, 사용해도 부분 점수 (SD 27%)
7. 모든 완료에 축하 메시지 (60% 미만이어도)
8. 오답 시 반드시 정답 보여주기 + 발음 재생
```

---

## 제3부: 개편 상세 설계

### 3.1 피드백 배너 시스템 (듀오링고 핵심)

**현재**: `toast.success()`/`toast.error()` 작은 토스트 → 사라짐
**개선**: 화면 하단에서 올라오는 전체 너비 배너 (듀오링고 동일)

#### 정답 배너
```
┌───────────────────────────────────────────┐
│  ✅ 정답이에요!                             │
│  🤖 영단이: "오! 대박이다!"                  │
│  🔊 apple [애플] = 사과                     │
│  📝 "I eat an apple every day."            │
│     (나는 매일 사과를 먹어요.)               │
│                              [다음 ➡️]      │
└───────────────────────────────────────────┘
배경색: #58CC02 (초록)
```

#### 오답 배너
```
┌───────────────────────────────────────────┐
│  💡 아쉬워요!                               │
│  🤖 영단이: "괜찮아, 같이 다시 해보자!"       │
│  🔊 정답은 apple [애플] = 사과               │
│  📝 "I eat an apple every day."            │
│     (나는 매일 사과를 먹어요.)               │
│                              [다음 ➡️]      │
└───────────────────────────────────────────┘
배경색: #FF9600 (주황, 빨간색 아님!)
```

### 3.2 하트 → 별점 시스템

**현재**: ❤️❤️❤️ → 3번 틀리면 게임오버
**개선**: 별점 시스템 (게임오버 없음)

```
세션 완료 시:
⭐⭐⭐  — 90% 이상 정답
⭐⭐☆  — 70% 이상 정답
⭐☆☆  — 40% 이상 정답
☆☆☆  — 40% 미만 (그래도 "끝까지 했어요! 대단해!")

"다시 도전하면 별을 더 받을 수 있어요!" ← 재도전 유도
```

### 3.3 세션 플로우 (듀오링고식)

```
[1] 영단이 인사
    "주우야! 오늘은 동물 단어를 배울 거야! 준비됐어?"

[2] 워밍업 (2문제)
    이전에 배운 쉬운 단어 복습 → 성공 경험으로 시작

[3] 새 단어 소개 (IntroCard)
    새 단어 2-3개를 먼저 보여줌 → 학습 후 테스트 (불안 제거)

[4] 본 학습 (10-12문제)
    유형 자동 혼합: 객관식 → 듣기 → 매칭 → 빈칸 → 철자...
    난이도: 쉬움→쉬움→보통→쉬움→어려움→쉬움 (적응형 패턴)

[5] 보너스 라운드 (최대 3문제)
    세션 중 틀린 단어를 다른 유형으로 재출제
    "보너스 라운드! 🌟" (벌칙이 아닌 기회)

[6] 세션 완료
    별점 + 배운 단어 요약 + XP 획득 + 영단이 마무리 인사
```

### 3.4 새 문제 유형

#### A. 새 단어 소개 카드 (IntroCard) — 학습 전 필수
```
┌─────────────────────────────────┐
│         🌟 새로운 단어!          │
│                                 │
│         🔊  apple               │
│         [애플]                   │
│         🍎 사과                  │
│                                 │
│  "I eat an apple every day."    │
│  (나는 매일 사과를 먹어요.)       │
│                                 │
│      💡 팁: 빨간 과일이에요!      │
│                                 │
│        [ 알겠어요! ✓ ]           │
└─────────────────────────────────┘
```
- 평가 없음 (불안 자극 제로)
- 발음 자동 재생 + 탭으로 반복 재생
- 이모지 + 한국어 뜻 + 예문 + 팁

#### B. 매칭 퀴즈 (MatchingQuiz) — 듀오링고 대표 유형
```
왼쪽 (영어)    오른쪽 (한글)
┌─────┐       ┌─────┐
│ cat │       │ 강아지│
└─────┘       └─────┘
┌─────┐       ┌─────┐
│ dog │       │ 새   │
└─────┘       └─────┘
┌─────┐       ┌─────┐
│ bird│       │ 물고기│
└─────┘       └─────┘
┌─────┐       ┌─────┐
│ fish│       │ 고양이│
└─────┘       └─────┘

→ 탭으로 선택 → 짝 맞으면 초록+사라짐 애니메이션
```
- 같은 카테고리에서 4-5쌍 추출
- 드래그 아닌 **탭** 방식 (VSI 64 → 공간 지각 약점 고려)
- 시간 측정은 선택사항 (기본 OFF)

#### C. 문장 빈칸 채우기 (FillBlankQuiz)
```
"I have a pet _____ ."
(나는 반려 _____ 가 있어요.)

🐶 dog    🍎 apple    🚗 car    📚 book
```
- 기존 `englishWordsData.ts`의 `example`/`exampleKorean` 필드에서 자동 생성
- 한글 번역 항상 함께 표시 (VCI 111 강점 활용)
- 문맥 속에서 단어 의미 파악

### 3.5 오답 재출제 "보너스 라운드"

```typescript
// 세션 중 틀린 단어 큐
wrongWords: EnglishWord[] = [];

// 본 문제 10-12개 완료 후
if (wrongWords.length > 0) {
  // "보너스 라운드! 🌟 다시 도전해볼까?"
  // 최대 3문제, 원래와 다른 유형으로 출제
  // 예: 객관식에서 틀린 단어 → 매칭으로 재출제
  // 정답 시: "이제 알겠다! 💪" 특별 메시지
}
```

### 3.6 캐릭터 "영단이" 반응 시스템

**왜 필요한가**: 주우의 자기초월(ST) 98%는 상상력·몰입이 극대화된 기질. 캐릭터와 함께 학습하는 내러티브가 동기부여의 핵심.

**디자인**: 🤖 로봇 이모지 + 말풍선 (복잡한 일러스트 불필요, VSI 64 고려)

**반응 대사 예시**:

| 상황 | 대사 (랜덤) |
|------|------------|
| 세션 시작 | "주우야, 오늘은 어떤 단어를 배울까?" / "준비됐어? 출발!" |
| 정답 | "오! 대박이다!" / "역시 주우야!" / "천재다~!" |
| 오답 | "괜찮아, 같이 다시 해보자!" / "아깝다! 거의 맞았어!" |
| 콤보 3+ | "우와~ 콤보다! 멈추지 마!" / "연속 정답! 대단해!" |
| 힌트 사용 | "힌트 쓰는 것도 실력이야!" / "좋은 전략이야!" |
| "모르겠어요" | "정직한 게 최고야! 같이 알아보자!" |
| 오답 복습 성공 | "이제 완벽해! 기억할 수 있을 거야!" |
| 세션 완료 | "오늘도 고생했어! 내일 또 만나!" |

### 3.7 힌트 시스템 개선

**현재**: 힌트 없음 (객관식은 4지선다 그대로)
**개선**:

| 힌트 종류 | 동작 | 감점 |
|-----------|------|------|
| 50/50 | 오답 2개 제거 (2지선다) | -0% (감점 없음!) |
| 첫 글자 | 정답 첫 글자 표시 | -0% |
| 발음 재생 | TTS 발음 재생 | -0% |
| 느린 발음 🐢 | TTS 0.5배속 재생 | -0% |

**핵심**: 힌트 사용은 감점 없음. "힌트 쓰는 것도 실력!" (SD 27% — 회피 전략 완화)

### 3.8 소리/효과 시스템

| 이벤트 | 소리 | 현재 | 개선 |
|--------|------|------|------|
| 정답 | 밝은 "딩~!" (C-E-G) | ✅ 있음 | 유지 |
| 오답 | 부드러운 "퐁" | ⚠️ 경고음 | 부드럽게 변경 |
| 콤보 3+ | 피치 상승 팡파레 | ✅ 있음 | 유지 |
| 세션 완료 | 축하 팡파레 | ✅ 있음 | 유지 |
| 레벨업 | 짧은 축하곡 | ✅ 있음 | 유지 |
| 버튼 클릭 | 짧은 "틱" | ✅ 있음 | 유지 |
| 보스 등장 | 드라마틱 효과 | ✅ 있음 | 유지 |

### 3.9 학습 설정 화면

```
⚙️ 학습 설정
├── 🔊 효과음: [켜기/끄기]
├── 🐢 느린 발음: [켜기/끄기]  ← 기본 켜기
├── ⏱️ 시간제한: [켜기/끄기]   ← 기본 끄기
├── 💡 힌트: [켜기/끄기]       ← 기본 켜기
├── 📝 문제 수: [5/10/15/20]  ← 기본 10
└── 🔤 글자 크기: [보통/크게]  ← 기본 크게
```

---

## 제4부: 학습 과학 시스템

### 4.1 단어 숙련도 시스템 (SRS 기반)

#### 숙련도 레벨

| 레벨 | 아이콘 | 이름 | 조건 | 복습 간격 |
|------|--------|------|------|----------|
| 0 | 🌱 | 씨앗 | 처음 본 단어 | 같은 세션 |
| 1 | 🌿 | 새싹 | 1회 정답 | 1일 후 |
| 2 | 🌳 | 나무 | 3회 연속 정답 | 3일 후 |
| 3 | 🌟 | 마스터 | 5회 연속, 다른 날에도 정답 | 7일 후 |
| 4 | 👑 | 전설 | 7일간 유지 | 14일 후 |

**핵심 규칙**:
- 틀리면 **1단계만** 하락 (0으로 초기화 금지 — 좌절감 방지)
- "아쉬워요! 나무→새싹으로 돌아갔어요. 다시 키울 수 있어!" (성장 메타포)

#### 문제 출제 알고리즘

```
세션 구성 (10문제 기준):
├── 복습 대상 (4문제, 40%) — next_review <= 오늘인 단어
├── 새 단어 (2문제, 20%) — mastery_level = 0인 단어
└── 강화 (4문제, 40%) — mastery_level 1-2인 단어

유형 매칭:
├── 숙련도 0-1 → IntroCard → 객관식 → 듣기
├── 숙련도 2 → 매칭 → 빈칸 채우기
└── 숙련도 3-4 → 타이핑 → 한→영 → 철자 퍼즐
```

### 4.2 XP + 레벨 시스템

기존 XP 시스템 유지 + 레벨 칭호 추가:

| 레벨 | 칭호 | 필요 총 XP |
|------|------|-----------|
| 1 | 영어 새싹 🌱 | 0 |
| 2 | 단어 탐험가 🔍 | 100 |
| 3 | 영어 모험가 🗺️ | 300 |
| 4 | 단어 사냥꾼 🏹 | 600 |
| 5 | 영어 마법사 🧙 | 1,000 |
| 6 | 단어 영웅 🦸 | 1,500 |
| 7 | 영어 전설 👑 | 2,100 |

XP 보너스:

| 행동 | XP |
|------|-----|
| 세션 완료 | +50 |
| 전 문제 정답 | +30 |
| 콤보 5연속 | +20 |
| 힌트 미사용 | +10 |
| 오답 복습 클리어 | +15 |
| 새 단어 마스터 | +25 |

### 4.3 연속 학습일 (스트릭)

- 하루 1세션 완료 시 스트릭 유지
- 스트릭 잃어도: "다시 시작하자! 💪" (부정적 메시지 금지)
- 스트릭 동결(Freeze): 포인트 상점에서 구매 가능

### 4.4 배지 시스템 확장

기존 13개 + 신규 8개:

| 배지 | 이름 | 조건 |
|------|------|------|
| 🌟 | 첫 걸음 | 첫 퀴즈 완료 |
| 🔥 | 불꽃 시작 | 3일 연속 학습 |
| 💯 | 완벽주의자 | 올 클리어 1회 |
| 🎯 | 10연속 | 10문제 연속 정답 |
| 📚 | 단어 수집가 | 50단어 마스터(Lv.3+) |
| 🏆 | 100단어 | 100단어 마스터 |
| 🌍 | 카테고리 정복 | 한 카테고리 전체 마스터 |
| 🐉 | 보스 사냥꾼 | 보스 배틀 5회 클리어 |

---

## 제5부: 데이터베이스 설계

### 5.1 신규 테이블

#### word_mastery (단어별 학습 기록)
```sql
CREATE TABLE word_mastery (
    id SERIAL PRIMARY KEY,
    juwoo_id INTEGER NOT NULL DEFAULT 1,
    word_id INTEGER NOT NULL,              -- englishWordsData.ts의 id
    mastery_level INTEGER DEFAULT 0,       -- 0:씨앗 1:새싹 2:나무 3:마스터 4:전설
    correct_streak INTEGER DEFAULT 0,      -- 현재 연속 정답 수
    total_attempts INTEGER DEFAULT 0,      -- 총 시도 횟수
    total_correct INTEGER DEFAULT 0,       -- 총 정답 횟수
    last_seen TIMESTAMPTZ,                 -- 마지막 학습 시각
    next_review TIMESTAMPTZ,               -- 다음 복습 예정 시각 (SRS)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(juwoo_id, word_id)
);

CREATE INDEX idx_word_mastery_review ON word_mastery(juwoo_id, next_review);
CREATE INDEX idx_word_mastery_level ON word_mastery(juwoo_id, mastery_level);
```

#### quiz_sessions (세션 기록)
```sql
CREATE TABLE quiz_sessions (
    id SERIAL PRIMARY KEY,
    juwoo_id INTEGER NOT NULL DEFAULT 1,
    session_type VARCHAR(50),              -- mixed, multiple-choice, boss-battle 등
    category VARCHAR(50),                  -- 동물, 과일 등 (null=전체)
    difficulty VARCHAR(20),                -- easy, medium, hard, expert, all
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    star_rating INTEGER DEFAULT 0,         -- 0-3
    streak_maintained BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_quiz_sessions_date ON quiz_sessions(juwoo_id, started_at);
```

#### daily_streak (일별 스트릭)
```sql
CREATE TABLE daily_streak (
    id SERIAL PRIMARY KEY,
    juwoo_id INTEGER NOT NULL DEFAULT 1,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    streak_frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(juwoo_id, date)
);
```

#### RLS 정책
```sql
ALTER TABLE word_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streak ENABLE ROW LEVEL SECURITY;

CREATE POLICY "word_mastery_all" ON word_mastery FOR ALL USING (true);
CREATE POLICY "quiz_sessions_all" ON quiz_sessions FOR ALL USING (true);
CREATE POLICY "daily_streak_all" ON daily_streak FOR ALL USING (true);
```

### 5.2 기존 테이블과의 관계

| 테이블 | 용도 | 충돌 여부 |
|--------|------|----------|
| `english_words` | DB에 존재하나 프론트 미사용 | 충돌 없음 |
| `english_learning_progress` | 단어 학습(WordLearning.tsx) 전용 | 충돌 없음 |
| `ebook_quiz_progress` | e북 퀴즈 전용 | 충돌 없음 |
| `quiz_attempt_history` | e북 퀴즈 전용 | 충돌 없음 |
| `point_transactions` | 포인트 적립에 사용 (기존 패턴 유지) | `balance_after` 필수 |
| `juwoo_profile` | 포인트 잔액 업데이트 (기존 패턴 유지) | 그대로 사용 |

---

## 제6부: 파일 구조 및 구현 순서

### 6.1 파일 구조

```
client/src/
├── pages/
│   └── EnglishQuiz.tsx              ← 리팩토링 (2025줄→~200줄)
├── components/quiz/                  ← NEW 디렉토리
│   ├── QuizSessionManager.tsx        ← 세션 플로우 오케스트레이터
│   ├── QuizMenu.tsx                  ← 메뉴 (테마/모드/난이도)
│   ├── QuizQuestion.tsx              ← 공통 문제 프레임
│   ├── QuizFeedbackBanner.tsx        ← 듀오링고식 피드백 배너
│   ├── QuizResult.tsx                ← 세션 완료 화면
│   ├── QuizSettings.tsx              ← 학습 설정
│   ├── CharacterBuddy.tsx            ← "영단이" 캐릭터
│   ├── types/                        ← 문제 유형별 컴포넌트
│   │   ├── IntroCard.tsx             ← 새 단어 소개 (NEW)
│   │   ├── MultipleChoice.tsx        ← 객관식 (개선)
│   │   ├── ListeningQuiz.tsx         ← 듣기 (개선)
│   │   ├── MatchingQuiz.tsx          ← 매칭 짝맞추기 (NEW)
│   │   ├── FillBlankQuiz.tsx         ← 빈칸 채우기 (NEW)
│   │   ├── SpellingQuiz.tsx          ← 철자 배열 (개선)
│   │   ├── ReverseQuiz.tsx           ← 한→영
│   │   ├── SpeedRound.tsx            ← 스피드
│   │   ├── BossBattle.tsx            ← 보스 배틀
│   │   └── SurvivalMode.tsx          ← 서바이벌
│   └── shared/                       ← 공유 UI 컴포넌트
│       ├── QuizProgressBar.tsx       ← 프로그레스 바
│       ├── ComboCounter.tsx          ← 콤보 카운터
│       ├── XPAnimation.tsx           ← XP 플로팅
│       └── EnergyBar.tsx             ← 에너지/별점 바
├── hooks/
│   ├── useQuizSession.ts             ← 세션 상태 관리 (NEW)
│   ├── useWordProgress.ts            ← 단어 숙련도 + SRS (NEW)
│   ├── useDailyStreak.ts             ← 연속 학습일 (NEW)
│   └── useQuizSound.ts              ← 사운드 훅 (NEW)
├── lib/
│   ├── quizEngine.ts                 ← 출제 알고리즘 (NEW)
│   ├── quizConstants.ts              ← 상수 중앙 관리 (NEW)
│   └── quizAnimations.ts             ← 애니메이션 variants (NEW)
├── constants/
│   └── feedbackMessages.ts           ← 확장 (영단이 대사)
└── data/
    ├── englishWordsData.ts           ← 기존 유지 (1000+)
    └── sentenceData.ts               ← 빈칸 채우기 문장 (NEW)

프로젝트 루트:
└── supabase-word-progress-schema.sql  ← DB 스키마 (NEW)
```

### 6.2 수정/생성 파일 목록 (총 33개)

**수정 3개**:
1. `client/src/pages/EnglishQuiz.tsx` — 모놀리스→오케스트레이터
2. `client/src/constants/feedbackMessages.ts` — 영단이 대사 추가
3. `client/src/pages/EnglishLearning.tsx` — 스트릭/레벨 표시

**신규 30개**:
4~33. (위 파일 구조 참조)

### 6.3 구현 순서

| 단계 | 작업 | 의존성 |
|------|------|--------|
| Step 1 | SQL 스키마 작성 | 없음 |
| Step 2 | 상수/유틸 분리 (`quizConstants`, `quizAnimations`, `quizEngine`) | 없음 |
| Step 3 | 훅 생성 (`useQuizSound`, `useQuizSession`, `useWordProgress`, `useDailyStreak`) | Step 1, 2 |
| Step 4 | 공유 컴포넌트 (`FeedbackBanner`, `ProgressBar`, `ComboCounter`, `XPAnimation`, `EnergyBar`, `CharacterBuddy`) | Step 2, 3 |
| Step 5 | 문제 유형 컴포넌트 (10종) | Step 2, 3, 4 |
| Step 6 | 세션/메뉴/결과 컴포넌트 | Step 3, 4, 5 |
| Step 7 | 메인 페이지 리팩토링 | Step 6 |
| Step 8 | 데이터 추가 (`sentenceData`, `feedbackMessages` 확장) | Step 5 |
| Step 9 | 빌드 확인 (`npx tsc --noEmit && pnpm build`) | Step 7, 8 |

### 6.4 재사용할 기존 코드

| 자산 | 위치 | 재사용 |
|------|------|--------|
| 1000+ 영어 단어 | `englishWordsData.ts` | 그대로 |
| 피드백 메시지 | `feedbackMessages.ts` | 확장 |
| 애니메이션 variants | `EnglishQuiz.tsx:192-229` | 분리 후 공유 |
| Web Audio 효과음 | `EnglishQuiz.tsx:234~` | 훅으로 분리 |
| TTS `speakWord()` | `EnglishQuiz.tsx:317~` | 훅으로 분리 |
| 6종 테마 | `EnglishQuiz.tsx:101-150` | 유지 |
| 13종 배지 | `EnglishQuiz.tsx:157-170` | 확장 |
| 스마트 오답 생성 | `EnglishQuiz.tsx:445-482` | `quizEngine.ts`로 이동 |
| wordEmojiMap 180개 | `EnglishQuiz.tsx:333-398` | 유지 |
| confetti | `canvas-confetti` | 별3개 시에만 |

---

## 제7부: 색상 팔레트

### 퀴즈 전용 색상

| 용도 | 색상 | HEX | 비고 |
|------|------|-----|------|
| 정답 | 초록 | `#58CC02` | 듀오링고 동일 |
| 오답 | 주황 | `#FF9600` | **빨간색 대신!** |
| 메인 | 보라 | `#7B61FF` | 현재 테마 유지 |
| 콤보/보너스 | 금색 | `#FFC800` | |
| 숙련도 0 씨앗 | 연두 | `#A0D468` | |
| 숙련도 1 새싹 | 초록 | `#58CC02` | |
| 숙련도 2 나무 | 진녹 | `#2B9A00` | |
| 숙련도 3 마스터 | 금색 | `#FFC800` | |
| 숙련도 4 전설 | 주황 | `#FF9600` | |
| 비활성 | 회색 | `#E5E5E5` | |

### 금지 색상
- `red-*` (빨간 계열) — 오답, 타이머, 난이도, HP 바 등 **모든 곳에서 금지**
- `toast.error()` — 사용 금지, `toast()` 또는 커스텀 배너 사용

---

## 제8부: 품질 체크리스트

### 교육 효과
- [ ] 새 단어는 퀴즈 전 IntroCard로 먼저 학습
- [ ] 틀린 단어는 세션 내 "보너스 라운드"에서 다른 유형으로 재출제
- [ ] 단어 숙련도가 `word_mastery` 테이블에 기록
- [ ] SRS 기반 간격 반복 복습 스케줄링
- [ ] 쉬운 문제→어려운 문제 적응형 패턴

### 주우 맞춤 UX (K-WISC-V / JTCI)
- [ ] 빨간색 어디에도 없음 → 주황색(`#FF9600`)
- [ ] "게임오버", "실패", "틀렸어요" 텍스트 없음
- [ ] 오답 시 정답을 반드시 보여줌 + 발음 재생
- [ ] 한 화면에 하나의 과제만 (VSI 64)
- [ ] 시간 압박 기본 OFF (PSI 81)
- [ ] 힌트 상시 표시, 사용해도 감점 없음 (SD 27%)
- [ ] 모든 완료에 축하 메시지 (HA 67%)
- [ ] 영단이 캐릭터 반응 (ST 98%)
- [ ] 최소 터치 타겟 48px, 최소 폰트 16px

### 기술 품질
- [ ] TypeScript 타입 에러 없음 (`npx tsc --noEmit`)
- [ ] 프로덕션 빌드 성공 (`pnpm build`)
- [ ] 애니메이션 300ms 이하
- [ ] 발음 재생 즉각적
- [ ] `balance_after` 필수 포함 (포인트 적립)
- [ ] 기존 기능(상점, 투자, e북 퀴즈 등) 영향 없음

### 코드 품질
- [ ] `EnglishQuiz.tsx` 2025줄 → ~200줄 (모듈 분리)
- [ ] SQL 스키마 파일 프로젝트 루트에 존재
- [ ] RLS 정책 포함
- [ ] Supabase 쿼리 후 error 체크
- [ ] `??` 연산자 사용 (`||` 대신, 0값 보호)
