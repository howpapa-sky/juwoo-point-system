# 📋 주우 놀이시스템 - 노코드 어드민 CMS 개발 의뢰서

**작성일**: 2025년 1월 17일  
**프로젝트**: 주우 놀이시스템 (juwoo-point-system)  
**버전**: v3.0 - Enterprise Admin CMS  
**참조 벤치마크**: Notion, Airtable, Strapi, Contentful, Shopify Admin

---

## 📌 Executive Summary

### 프로젝트 목표
**"코드 한 줄 없이, 클릭만으로 모든 콘텐츠를 관리할 수 있는 세계적 수준의 어드민 시스템 구축"**

### 핵심 가치

| 원칙 | 설명 |
|------|------|
| 🎯 **Zero Code** | 관리자가 개발자 없이 직접 콘텐츠 CRUD 가능 |
| 🚀 **Instant Deploy** | 수정 즉시 실서비스 반영 |
| 🛡️ **Fool-Proof** | 실수 방지 + 롤백 기능 |
| 📊 **Data-Driven** | 실시간 대시보드 + 분석 |
| 🎨 **Delightful UX** | 직관적이고 즐거운 인터페이스 |

### 현재 vs 목표

| 항목 | 현재 상태 | 목표 상태 |
|------|----------|----------|
| 포인트 규칙 | .md 파일 + SQL 직접 수정 | 🖱️ 클릭으로 추가/수정/삭제 |
| 상점 아이템 | .md 파일 + SQL 직접 수정 | 🖱️ 드래그&드롭 정렬 |
| 영어 단어 | .md 파일 + SQL 직접 수정 | 📤 엑셀 업로드 지원 |
| e북 콘텐츠 | booksData.ts 코드 수정 | 📝 WYSIWYG 에디터 |
| 퀴즈 문제 | PokemonQuiz.tsx 코드 수정 | 🎯 퀴즈 빌더 UI |
| 배지 | SQL 직접 수정 | 🏅 비주얼 배지 에디터 |
| 통계 | 기본 통계만 | 📈 실시간 대시보드 |

---

## 📌 1. 관리 기능 목록

### 1.1 포인트 규칙 관리

**현재**: POINT_RULES_DATA.md 파일 편집 → SQL 실행
**목표**: 어드민 UI에서 직접 관리

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 규칙 목록 조회 | 카테고리별 필터, 검색, 정렬 | P0 |
| 규칙 추가 | 폼으로 새 규칙 생성 | P0 |
| 규칙 수정 | 인라인 편집 또는 모달 | P0 |
| 규칙 삭제 | 소프트 삭제 (비활성화) | P0 |
| 활성/비활성 토글 | 스위치로 즉시 토글 | P0 |
| 드래그 정렬 | 표시 순서 변경 | P1 |
| 일괄 편집 | 선택한 규칙 일괄 수정 | P1 |
| 복제 | 기존 규칙 복사 | P2 |

**UI 핵심 요소**:
- 카테고리 탭 (생활습관, 운동건강, 학습독서, 예의태도, 집안일, 부정행동)
- 포인트 양수(+초록)/음수(-빨강) 색상 구분
- 이모지 아이콘 선택기
- 하루 제한 횟수 설정

---

### 1.2 상점 아이템 관리

**현재**: SHOP_ITEMS_DATA.md 파일 편집 → SQL 실행
**목표**: 어드민 UI에서 직접 관리

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 아이템 목록 | 카드 뷰 / 테이블 뷰 전환 | P0 |
| 아이템 추가 | 이미지 업로드 포함 | P0 |
| 아이템 수정 | 실시간 미리보기 | P0 |
| 아이템 삭제 | 구매 이력 있으면 경고 | P0 |
| 재고 관리 | 한정판 아이템 수량 관리 | P1 |
| 카테고리 관리 | 카테고리 CRUD | P1 |
| 가격 일괄 조정 | 10% 인상/인하 등 | P2 |
| 시즌 아이템 | 기간 한정 아이템 | P2 |

**UI 핵심 요소**:
- 카드 뷰 (이미지 + 정보)
- 이미지/이모지 업로드
- 판매 상태 배지 (판매중/품절/비공개)
- 기간 설정 달력

---

### 1.3 e북 콘텐츠 관리

**현재**: booksData.ts 코드 직접 수정
**목표**: WYSIWYG 에디터로 관리

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| e북 목록 | 상태별 필터 (초안/발행/비공개) | P0 |
| e북 생성 | WYSIWYG 에디터 | P0 |
| 페이지 관리 | 드래그로 순서 변경 | P0 |
| 미리보기 | 실제 리더 화면으로 미리보기 | P0 |
| 버전 관리 | 수정 이력 + 롤백 | P1 |
| 퀴즈 연동 | e북에 퀴즈 연결 | P1 |
| 이미지 삽입 | 페이지에 이미지 추가 | P2 |
| 템플릿 | 공략집/동화 템플릿 | P2 |

**UI 핵심 요소**:
- 좌측: 페이지 목록 (썸네일)
- 우측: 페이지 에디터
- 툴바: 볼드, 이모지, 이미지, 링크
- 상태 배지: 초안/발행됨/비공개
- 자동 저장 표시

---

### 1.4 퀴즈 관리

**현재**: PokemonQuiz.tsx 코드 직접 수정
**목표**: 퀴즈 빌더 UI로 관리

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 퀴즈 목록 | e북별, 난이도별 필터 | P0 |
| 퀴즈 생성 | 비주얼 퀴즈 빌더 | P0 |
| 문제 유형 지원 | 객관식, O/X, 주관식, 빈칸채우기 | P0 |
| e북 연동 | 퀴즈-e북 페이지 연결 | P0 |
| 힌트 관리 | 다단계 힌트 설정 | P1 |
| 미리보기 | 실제 퀴즈 화면으로 테스트 | P1 |
| 문제 복제 | 기존 문제 복사 | P2 |
| 일괄 가져오기 | 엑셀/CSV 업로드 | P2 |

**UI 핵심 요소**:
- 문제 유형 선택 버튼 (객관식/O/X/주관식/빈칸)
- 보기 추가/삭제/정답 체크
- 힌트 1/2/3 입력란 + 페이지 연결
- 포인트 설정 (기본 10점)
- 미리보기 모달

---

### 1.5 영어 단어 관리

**현재**: ENGLISH_WORDS_DATA.md + SQL
**목표**: 테이블 UI + 엑셀 업로드

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 단어 목록 | 카테고리별, 난이도별 필터 | P0 |
| 단어 추가 | 인라인 추가 | P0 |
| 단어 수정/삭제 | 인라인 편집 | P0 |
| 엑셀 업로드 | 대량 등록 | P1 |
| 엑셀 다운로드 | 백업/편집용 | P1 |
| 카테고리 관리 | 동적 카테고리 | P1 |
| 예문 자동 생성 | AI로 예문 생성 (선택) | P2 |
| 이미지 연결 | 단어 이미지 추가 | P2 |

**UI 핵심 요소**:
- 데이터 테이블 (정렬, 필터, 페이지네이션)
- 인라인 편집 (더블클릭)
- 엑셀 업로드 드래그&드롭
- 템플릿 다운로드 버튼

---

### 1.6 배지 관리

**현재**: BADGES_DATA.md + SQL
**목표**: 비주얼 배지 에디터

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 배지 목록 | 카테고리별 분류 | P0 |
| 배지 생성 | 이미지/이모지 + 조건 설정 | P0 |
| 배지 수정/삭제 | 획득자 있으면 경고 | P0 |
| 조건 빌더 | 복잡한 조건 설정 UI | P1 |
| 배지 미리보기 | 실제 표시 형태 확인 | P2 |
| 수동 부여 | 특정 사용자에게 직접 부여 | P2 |

**조건 타입**:
- 포인트 달성 (X점 이상)
- e북 완독 (X권 이상)
- 퀴즈 점수 (X점 이상)
- 연속 달성 (X일 연속)
- 특별 조건 (수동 부여)

---

## 📌 2. 대시보드 & 분석

### 2.1 메인 대시보드

| 위젯 | 설명 |
|------|------|
| 현재 포인트 | 주우의 현재 잔액 |
| 오늘 적립/차감 | 오늘 변동 내역 요약 |
| 주간 트렌드 차트 | 7일간 포인트 추이 |
| TOP 활동 | 이번 주 가장 많이 한 활동 |
| 최근 활동 | 최신 10개 거래 내역 |
| 알림 | 미처리 항목, 배지 획득 가능 등 |
| 빠른 작업 | 자주 쓰는 작업 바로가기 |

### 2.2 분석 리포트

| 리포트 | 설명 |
|--------|------|
| 포인트 분석 | 기간별 적립/차감 추이, 카테고리별 비율 |
| 학습 분석 | e북 완독률, 퀴즈 정답률, 단어 학습 진도 |
| 성취 분석 | 획득 배지, 목표 달성률, 연속 기록 |
| 맞춤 리포트 | 날짜 범위 선택 + PDF 다운로드 |

---

## 📌 3. 데이터베이스 스키마 변경

### 3.1 기존 테이블 확장

```sql
-- point_rules 확장
ALTER TABLE point_rules 
ADD COLUMN IF NOT EXISTS icon VARCHAR(10),
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_limit INTEGER,
ADD COLUMN IF NOT EXISTS created_by INTEGER,
ADD COLUMN IF NOT EXISTS last_modified_by INTEGER;

-- shop_items 확장
ALTER TABLE shop_items
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER,
ADD COLUMN IF NOT EXISTS max_per_user INTEGER,
ADD COLUMN IF NOT EXISTS available_from TIMESTAMP,
ADD COLUMN IF NOT EXISTS available_until TIMESTAMP;
```

### 3.2 신규 테이블

```sql
-- e북 테이블 (DB 저장)
CREATE TABLE IF NOT EXISTS ebooks (
  id SERIAL PRIMARY KEY,
  book_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) DEFAULT '아빠',
  cover_emoji VARCHAR(10),
  cover_image_url TEXT,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  estimated_read_time INTEGER,
  status VARCHAR(20) DEFAULT 'draft',
  has_quiz BOOLEAN DEFAULT false,
  completion_points INTEGER DEFAULT 500,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

-- e북 페이지 테이블
CREATE TABLE IF NOT EXISTS ebook_pages (
  id SERIAL PRIMARY KEY,
  ebook_id INTEGER REFERENCES ebooks(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  UNIQUE(ebook_id, page_number)
);

-- 퀴즈 문제 테이블 (DB 저장)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  question_code VARCHAR(50) UNIQUE NOT NULL,
  ebook_id INTEGER REFERENCES ebooks(id),
  question_type VARCHAR(20) NOT NULL,
  quiz_tier VARCHAR(20) NOT NULL,
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  correct_answer TEXT NOT NULL,
  acceptable_answers TEXT[],
  options JSONB,
  hints JSONB NOT NULL DEFAULT '[]',
  page_reference INTEGER,
  base_points INTEGER NOT NULL DEFAULT 10,
  explanation TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 활동 로그 테이블
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 백업 히스토리 테이블
CREATE TABLE IF NOT EXISTS backup_history (
  id SERIAL PRIMARY KEY,
  backup_type VARCHAR(20) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT
);
```

---

## 📌 4. UI/UX 설계

### 4.1 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 주우 놀이시스템 어드민              🔔  👤 관리자 ▼    │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  📊 대시보드  │           [ 메인 콘텐츠 영역 ]               │
│              │                                              │
│  📋 포인트    │                                              │
│    └ 규칙 관리│                                              │
│    └ 내역    │                                              │
│              │                                              │
│  🛒 상점     │                                              │
│    └ 아이템  │                                              │
│    └ 구매내역│                                              │
│              │                                              │
│  📚 콘텐츠   │                                              │
│    └ e북    │                                              │
│    └ 퀴즈   │                                              │
│    └ 영어단어│                                              │
│              │                                              │
│  🏅 배지     │                                              │
│              │                                              │
│  👤 사용자   │                                              │
│              │                                              │
│  📈 분석     │                                              │
│              │                                              │
│  ⚙️ 설정     │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 4.2 공통 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| DataTable | 정렬, 필터, 페이지네이션, 인라인 편집 |
| FormModal | 추가/수정 폼 모달 |
| ConfirmDialog | 삭제 등 확인 다이얼로그 |
| ImageUploader | 이미지 업로드 (드래그&드롭) |
| EmojiPicker | 이모지 선택기 |
| RichTextEditor | WYSIWYG 에디터 |
| StatCard | 통계 카드 |
| ChartWidget | 차트 위젯 |

### 4.3 색상 테마

| 요소 | 색상 |
|------|------|
| Primary | Amber/Orange 그라데이션 |
| Success (적립) | Green-500 |
| Danger (차감) | Red-500 |
| Info | Blue-500 |
| Background | Gray-50/100 |

---

## 📌 5. 기술 스택

| 레이어 | 기술 |
|--------|------|
| UI 컴포넌트 | shadcn/ui + Tailwind CSS |
| 상태 관리 | TanStack Query (React Query) |
| 폼 관리 | React Hook Form + Zod |
| 테이블 | TanStack Table |
| 드래그&드롭 | dnd-kit |
| 리치 에디터 | TipTap |
| 차트 | Recharts |
| 엑셀 처리 | xlsx (SheetJS) |
| 파일 저장 | Supabase Storage |

---

## 📌 6. 개발 우선순위

### Phase 1: 기반 (1주)
- 어드민 레이아웃 (사이드바, 헤더)
- 라우팅 설정
- 공통 컴포넌트 (DataTable, FormModal)
- 권한 체크

### Phase 2: 포인트 관리 (1주)
- 포인트 규칙 CRUD
- 드래그 정렬
- 일괄 편집

### Phase 3: 상점 관리 (1주)
- 상점 아이템 CRUD
- 이미지 업로드
- 카드/테이블 뷰

### Phase 4: e북 관리 (2주)
- e북 목록/상세
- WYSIWYG 에디터
- 페이지 관리
- 발행 플로우

### Phase 5: 퀴즈 관리 (1주)
- 퀴즈 빌더
- e북 연동
- 힌트 설정

### Phase 6: 기타 관리 (1주)
- 영어 단어 관리 + 엑셀
- 배지 관리

### Phase 7: 대시보드 (1주)
- 메인 대시보드
- 차트 위젯
- 분석 리포트

### Phase 8: 시스템 (1주)
- 백업/복원
- 활동 로그
- 시스템 설정

**총 예상 기간: 10주**

---

## 📌 7. 테스트 체크리스트

### 기능 테스트
- [ ] 포인트 규칙 CRUD
- [ ] 상점 아이템 CRUD
- [ ] e북 생성/수정/발행
- [ ] 퀴즈 생성/e북 연동
- [ ] 영어 단어 엑셀 업로드
- [ ] 배지 조건 설정
- [ ] 백업/복원

### UX 테스트
- [ ] 모든 폼 검증 메시지
- [ ] 로딩 상태 (스켈레톤)
- [ ] 성공/실패 토스트
- [ ] 삭제 확인 다이얼로그
- [ ] 모바일 반응형

### 보안 테스트
- [ ] 관리자 권한 검증
- [ ] API 인증

---

## 📌 8. 참고 문서

- `CLAUDE.md` - 프로젝트 가이드
- `EBOOK_QUIZ_SYSTEM_SPEC.md` - e북-퀴즈 연동
- `SUPABASE_DATABASE_SETUP.sql` - DB 스키마
- `POINT_RULES_DATA.md` - 포인트 규칙 데이터
- `SHOP_ITEMS_DATA.md` - 상점 아이템 데이터
- `ENGLISH_WORDS_DATA.md` - 영어 단어 데이터
- `BADGES_DATA.md` - 배지 데이터

---

**"코드 없이, 클릭만으로, 세상 모든 콘텐츠를 관리한다."**
