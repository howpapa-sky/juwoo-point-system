# Supabase 설정 가이드

## 1. 이메일 확인 비활성화 (개발 환경)

개발 단계에서는 이메일 확인을 비활성화하여 빠르게 테스트할 수 있습니다.

### 설정 방법:

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `vqxuavqpevllzzgkpudp`
3. 좌측 메뉴에서 **Authentication** → **Providers** 클릭
4. **Email** 프로바이더 클릭
5. **Confirm email** 토글을 **OFF**로 설정
6. **Save** 버튼 클릭

이제 회원가입 후 이메일 확인 없이 바로 로그인할 수 있습니다.

---

## 2. Google OAuth 설정

Google 로그인을 활성화하려면 다음 단계를 따르세요.

### 2.1 Google Cloud Console 설정

1. Google Cloud Console 접속: https://console.cloud.google.com
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Credentials** 클릭
4. **CREATE CREDENTIALS** → **OAuth 2.0 Client ID** 선택
5. Application type: **Web application** 선택
6. Name: `Juwoo Point System` (또는 원하는 이름)
7. **Authorized redirect URIs** 추가:
   ```
   https://vqxuavqpevllzzgkpudp.supabase.co/auth/v1/callback
   ```
8. **CREATE** 버튼 클릭
9. Client ID와 Client Secret 복사

### 2.2 Supabase 설정

1. Supabase 대시보드 접속
2. **Authentication** → **Providers** 클릭
3. **Google** 프로바이더 클릭
4. **Enable Sign in with Google** 토글을 **ON**으로 설정
5. Google Cloud Console에서 복사한 **Client ID**와 **Client Secret** 입력
6. **Save** 버튼 클릭

---

## 3. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 SQL을 실행하여 필요한 테이블을 생성합니다.

### 3.1 포인트 규칙 테이블

```sql
CREATE TABLE IF NOT EXISTS point_rules (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 상점 아이템 테이블

```sql
CREATE TABLE IF NOT EXISTS shop_items (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 영어 단어 테이블

```sql
CREATE TABLE IF NOT EXISTS english_words (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.4 단어 학습 진도 테이블

```sql
CREATE TABLE IF NOT EXISTS word_learning_progress (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL,
  word_id INTEGER NOT NULL REFERENCES english_words(id),
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_practiced TIMESTAMP DEFAULT NOW(),
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(juwoo_id, word_id)
);
```

### 3.5 배지 테이블

```sql
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.6 사용자 배지 테이블

```sql
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(juwoo_id, badge_id)
);
```

### 3.7 목표 테이블

```sql
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL,
  shop_item_id INTEGER NOT NULL REFERENCES shop_items(id),
  target_points INTEGER NOT NULL,
  current_points INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.8 포인트 거래 테이블

```sql
CREATE TABLE IF NOT EXISTS point_transactions (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.9 구매 내역 테이블

```sql
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  juwoo_id INTEGER NOT NULL,
  shop_item_id INTEGER NOT NULL REFERENCES shop_items(id),
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Row Level Security (RLS) 설정

보안을 위해 RLS를 활성화하고 정책을 설정합니다.

### 4.1 RLS 활성화

```sql
ALTER TABLE point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
```

### 4.2 읽기 정책 (모든 사용자)

```sql
-- 포인트 규칙: 모든 사용자 읽기 가능
CREATE POLICY "Anyone can read point_rules"
ON point_rules FOR SELECT
USING (true);

-- 상점 아이템: 모든 사용자 읽기 가능
CREATE POLICY "Anyone can read shop_items"
ON shop_items FOR SELECT
USING (true);

-- 영어 단어: 모든 사용자 읽기 가능
CREATE POLICY "Anyone can read english_words"
ON english_words FOR SELECT
USING (true);

-- 배지: 모든 사용자 읽기 가능
CREATE POLICY "Anyone can read badges"
ON badges FOR SELECT
USING (true);
```

### 4.3 쓰기 정책 (인증된 사용자)

```sql
-- 단어 학습 진도: 본인 데이터만 수정 가능
CREATE POLICY "Users can manage own word_learning_progress"
ON word_learning_progress FOR ALL
USING (juwoo_id = auth.uid()::integer);

-- 사용자 배지: 본인 데이터만 읽기 가능
CREATE POLICY "Users can read own user_badges"
ON user_badges FOR SELECT
USING (juwoo_id = auth.uid()::integer);

-- 목표: 본인 데이터만 관리 가능
CREATE POLICY "Users can manage own goals"
ON goals FOR ALL
USING (juwoo_id = auth.uid()::integer);

-- 포인트 거래: 본인 데이터만 읽기 가능
CREATE POLICY "Users can read own point_transactions"
ON point_transactions FOR SELECT
USING (juwoo_id = auth.uid()::integer);

-- 구매 내역: 본인 데이터만 읽기 가능
CREATE POLICY "Users can read own purchases"
ON purchases FOR SELECT
USING (juwoo_id = auth.uid()::integer);
```

---

## 5. 초기 데이터 삽입

### 5.1 포인트 규칙 데이터

`POINT_RULES_DATA.md` 파일의 SQL 스크립트를 실행하여 37개의 포인트 규칙을 삽입합니다.

### 5.2 상점 아이템 데이터

`SHOP_ITEMS_DATA.md` 파일의 SQL 스크립트를 실행하여 34개의 상점 아이템을 삽입합니다.

### 5.3 영어 단어 데이터

`ENGLISH_WORDS_DATA.md` 파일의 SQL 스크립트를 실행하여 100개의 영어 단어를 삽입합니다.

### 5.4 배지 데이터

`BADGES_DATA.md` 파일의 SQL 스크립트를 실행하여 10개의 배지를 삽입합니다.

---

## 6. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```env
VITE_SUPABASE_URL=https://vqxuavqpevllzzgkpudp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeHVhdnFwZXZsbHp6Z2twdWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjkyNzQsImV4cCI6MjA3ODc0NTI3NH0.HBxOjed8E0lS8QgJkBbwr7Z7Gt9PsPxEyGA0IvC1IYM
```

---

## 7. 테스트

### 7.1 회원가입 테스트

1. 로그인 페이지 접속: `/login`
2. "계정이 없으신가요? 회원가입" 클릭
3. 이메일과 비밀번호 입력
4. "회원가입" 버튼 클릭
5. (이메일 확인 비활성화 시) 바로 로그인 가능

### 7.2 로그인 테스트

1. 로그인 페이지 접속: `/login`
2. 이메일과 비밀번호 입력
3. "로그인" 버튼 클릭
4. 대시보드로 리다이렉트

### 7.3 Google 로그인 테스트

1. 로그인 페이지 접속: `/login`
2. "Google로 로그인" 버튼 클릭
3. Google 계정 선택
4. 대시보드로 리다이렉트

---

## 8. 문제 해결

### 8.1 로그인 후 리다이렉트 안됨

**원인:** Supabase Auth 콜백 URL 설정 문제

**해결:**
1. Supabase 대시보드 → **Authentication** → **URL Configuration**
2. **Site URL** 설정: `https://3000-im1trdvk0hb7ox9g5ynte-156581cf.manus-asia.computer`
3. **Redirect URLs** 추가:
   - `https://3000-im1trdvk0hb7ox9g5ynte-156581cf.manus-asia.computer/`
   - `https://3000-im1trdvk0hb7ox9g5ynte-156581cf.manus-asia.computer/dashboard`

### 8.2 이메일 확인 메일이 오지 않음

**원인:** Supabase 무료 플랜은 이메일 발송 제한이 있음

**해결:**
1. 이메일 확인 비활성화 (위 1번 참조)
2. 또는 Supabase 대시보드에서 직접 사용자 이메일 확인 처리

### 8.3 Google 로그인 실패

**원인:** Google OAuth 설정 오류

**해결:**
1. Google Cloud Console에서 Redirect URI 확인
2. Supabase Client ID/Secret 재확인
3. Google OAuth Consent Screen 설정 확인

---

## 9. 프로덕션 배포 시 주의사항

### 9.1 이메일 확인 활성화

프로덕션 환경에서는 반드시 이메일 확인을 활성화하세요.

### 9.2 환경 변수 보안

`.env` 파일을 Git에 커밋하지 마세요. `.gitignore`에 추가하세요.

### 9.3 RLS 정책 검토

모든 테이블의 RLS 정책을 검토하고 보안 취약점이 없는지 확인하세요.

### 9.4 API 키 보호

Supabase Anon Key는 클라이언트에 노출되어도 안전하지만, Service Role Key는 절대 노출하지 마세요.

---

이 가이드를 따라 Supabase를 설정하면 주우 포인트 시스템이 정상적으로 작동합니다.
