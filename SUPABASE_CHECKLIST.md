# Supabase 설정 체크리스트

사이트가 정상적으로 작동하려면 Supabase 대시보드에서 다음 설정을 완료해야 합니다.

## ✅ 필수 설정

### 1. 이메일 확인 비활성화 (개발 환경)

**목적:** 회원가입 후 이메일 인증 없이 바로 로그인할 수 있도록 설정

**설정 방법:**
1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `vqxuavqpevllzzgkpudp`
3. 좌측 메뉴 **Authentication** → **Providers** 클릭
4. **Email** 프로바이더 클릭
5. **Confirm email** 토글을 **OFF**로 설정
6. **Save** 버튼 클릭

**상태:** ⬜ 미완료

---

### 2. Site URL 설정

**목적:** 로그인 후 올바른 URL로 리다이렉트되도록 설정

**설정 방법:**
1. Supabase 대시보드 → **Authentication** → **URL Configuration**
2. **Site URL** 설정:
   ```
   https://3000-im1trdvk0hb7ox9g5ynte-156581cf.manus-asia.computer
   ```
3. **Redirect URLs** 추가:
   ```
   https://3000-im1trdvk0hb7ox9g5ynte-156581cf.manus-asia.computer/**
   ```
4. **Save** 버튼 클릭

**상태:** ⬜ 미완료

---

### 3. Google OAuth 설정 (선택사항)

**목적:** Google 계정으로 로그인할 수 있도록 설정

**설정 방법:**

#### 3.1 Google Cloud Console 설정

1. Google Cloud Console 접속: https://console.cloud.google.com
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Credentials** 클릭
4. **CREATE CREDENTIALS** → **OAuth 2.0 Client ID** 선택
5. Application type: **Web application** 선택
6. Name: `Juwoo Point System`
7. **Authorized redirect URIs** 추가:
   ```
   https://vqxuavqpevllzzgkpudp.supabase.co/auth/v1/callback
   ```
8. **CREATE** 버튼 클릭
9. **Client ID**와 **Client Secret** 복사

#### 3.2 Supabase 설정

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Google** 프로바이더 클릭
3. **Enable Sign in with Google** 토글을 **ON**으로 설정
4. Google Cloud Console에서 복사한 **Client ID**와 **Client Secret** 입력
5. **Save** 버튼 클릭

**상태:** ⬜ 미완료 (선택사항)

---

## ✅ 데이터베이스 설정

### 4. 테이블 생성

**목적:** 포인트 시스템에 필요한 데이터베이스 테이블 생성

**설정 방법:**
1. Supabase 대시보드 → **SQL Editor**
2. `SUPABASE_SETUP_GUIDE.md` 파일의 3번 섹션에 있는 SQL 스크립트 실행
3. 다음 테이블이 생성되어야 함:
   - `point_rules` (포인트 규칙)
   - `shop_items` (상점 아이템)
   - `english_words` (영어 단어)
   - `word_learning_progress` (단어 학습 진도)
   - `badges` (배지)
   - `user_badges` (사용자 배지)
   - `goals` (목표)
   - `point_transactions` (포인트 거래)
   - `purchases` (구매 내역)

**상태:** ⬜ 미완료

---

### 5. Row Level Security (RLS) 설정

**목적:** 데이터 보안을 위한 접근 권한 설정

**설정 방법:**
1. Supabase 대시보드 → **SQL Editor**
2. `SUPABASE_SETUP_GUIDE.md` 파일의 4번 섹션에 있는 SQL 스크립트 실행
3. 모든 테이블에 RLS 정책이 적용되어야 함

**상태:** ⬜ 미완료

---

### 6. 초기 데이터 삽입

**목적:** 포인트 규칙, 상점 아이템, 영어 단어, 배지 데이터 삽입

**설정 방법:**
1. Supabase 대시보드 → **SQL Editor**
2. 다음 파일의 SQL 스크립트를 순서대로 실행:
   - `POINT_RULES_DATA.md` (37개 포인트 규칙)
   - `SHOP_ITEMS_DATA.md` (34개 상점 아이템)
   - `ENGLISH_WORDS_DATA.md` (100개 영어 단어)
   - `BADGES_DATA.md` (10개 배지)

**상태:** ⬜ 미완료

---

## ✅ 이메일 템플릿 설정 (선택사항)

### 7. 이메일 템플릿 커스터마이징

**목적:** 사용자에게 전송되는 이메일을 브랜드에 맞게 커스터마이징

**설정 방법:**
1. Supabase 대시보드 → **Authentication** → **Email Templates**
2. `SUPABASE_EMAIL_TEMPLATES.md` 파일의 템플릿을 참고하여 수정
3. 다음 템플릿을 수정할 수 있음:
   - Confirm Signup (회원가입 이메일 인증)
   - Magic Link (매직 링크 로그인)
   - Reset Password (비밀번호 재설정)
   - Change Email Address (이메일 주소 변경)
   - Invite User (사용자 초대)

**상태:** ⬜ 미완료 (선택사항)

---

## 🧪 테스트

모든 설정을 완료한 후 다음 항목을 테스트하세요:

### 회원가입 테스트
- [ ] 이메일/비밀번호로 회원가입
- [ ] 회원가입 후 자동 로그인 확인
- [ ] 대시보드로 리다이렉트 확인

### 로그인 테스트
- [ ] 이메일/비밀번호로 로그인
- [ ] 로그인 후 대시보드로 리다이렉트 확인

### Google 로그인 테스트 (설정한 경우)
- [ ] Google 계정으로 로그인
- [ ] 로그인 후 대시보드로 리다이렉트 확인

### 데이터베이스 테스트
- [ ] 포인트 규칙 데이터 조회
- [ ] 상점 아이템 데이터 조회
- [ ] 영어 단어 데이터 조회
- [ ] 배지 데이터 조회

---

## 📝 참고 문서

- `SUPABASE_SETUP_GUIDE.md` - 상세한 Supabase 설정 가이드
- `SUPABASE_EMAIL_TEMPLATES.md` - 이메일 템플릿 커스터마이징 가이드
- `POINT_RULES_DATA.md` - 포인트 규칙 데이터 및 SQL 스크립트
- `SHOP_ITEMS_DATA.md` - 상점 아이템 데이터 및 SQL 스크립트
- `ENGLISH_WORDS_DATA.md` - 영어 단어 데이터 및 SQL 스크립트
- `BADGES_DATA.md` - 배지 데이터 및 SQL 스크립트

---

## ⚠️ 주의사항

### 개발 환경
- 이메일 확인을 비활성화하면 테스트가 편리하지만, 보안이 약해집니다.
- 개발 단계에서만 사용하고, 프로덕션 환경에서는 반드시 활성화하세요.

### 프로덕션 환경
- 이메일 확인을 활성화하세요.
- SMTP 설정을 커스터마이징하여 전문적인 이메일을 발송하세요.
- RLS 정책을 철저히 검토하여 데이터 보안을 강화하세요.
- 환경 변수를 안전하게 관리하세요 (`.env` 파일을 Git에 커밋하지 마세요).

---

이 체크리스트를 따라 Supabase를 설정하면 주우 포인트 시스템이 정상적으로 작동합니다.
