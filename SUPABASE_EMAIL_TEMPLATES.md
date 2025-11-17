# Supabase 이메일 템플릿 설정 가이드

## 이메일 인증 템플릿 설정

Supabase 대시보드에서 이메일 템플릿을 커스터마이징할 수 있습니다.

### 설정 방법

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `vqxuavqpevllzzgkpudp`
3. 좌측 메뉴에서 **Authentication** → **Email Templates** 클릭
4. 원하는 템플릿 선택 (Confirm signup, Invite user, Magic Link, Change Email Address, Reset Password)
5. 템플릿 내용 수정
6. **Save** 버튼 클릭

---

## 1. Confirm Signup (회원가입 이메일 인증)

### Subject (제목)
```
⭐ 주우의 포인트 시스템 - 이메일 인증
```

### Body (본문)
```html
<h2>⭐ 주우의 포인트 시스템에 오신 것을 환영합니다! ⭐</h2>

<p>안녕하세요!</p>

<p><strong>주우의 포인트 시스템</strong>에 가입해 주셔서 감사합니다.</p>

<p>좋은 행동으로 포인트를 모으고, 원하는 것을 얻을 수 있는 재미있는 시스템입니다!</p>

<p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">이메일 인증하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p style="color: #666; font-size: 14px;">{{ .ConfirmationURL }}</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p style="color: #999; font-size: 12px;">
이 이메일은 주우의 포인트 시스템에서 자동으로 발송되었습니다.<br>
본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.
</p>
```

---

## 2. Magic Link (매직 링크 로그인)

### Subject (제목)
```
⭐ 주우의 포인트 시스템 - 로그인 링크
```

### Body (본문)
```html
<h2>⭐ 주우의 포인트 시스템 로그인 ⭐</h2>

<p>안녕하세요!</p>

<p>아래 버튼을 클릭하여 <strong>주우의 포인트 시스템</strong>에 로그인하세요:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">로그인하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p style="color: #666; font-size: 14px;">{{ .ConfirmationURL }}</p>

<p style="color: #E53E3E; font-weight: bold;">⚠️ 이 링크는 1시간 동안만 유효합니다.</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p style="color: #999; font-size: 12px;">
이 이메일은 주우의 포인트 시스템에서 자동으로 발송되었습니다.<br>
본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.
</p>
```

---

## 3. Reset Password (비밀번호 재설정)

### Subject (제목)
```
⭐ 주우의 포인트 시스템 - 비밀번호 재설정
```

### Body (본문)
```html
<h2>⭐ 비밀번호 재설정 요청 ⭐</h2>

<p>안녕하세요!</p>

<p><strong>주우의 포인트 시스템</strong> 계정의 비밀번호 재설정을 요청하셨습니다.</p>

<p>아래 버튼을 클릭하여 새로운 비밀번호를 설정하세요:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">비밀번호 재설정하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p style="color: #666; font-size: 14px;">{{ .ConfirmationURL }}</p>

<p style="color: #E53E3E; font-weight: bold;">⚠️ 이 링크는 1시간 동안만 유효합니다.</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p style="color: #999; font-size: 12px;">
이 이메일은 주우의 포인트 시스템에서 자동으로 발송되었습니다.<br>
본인이 요청하지 않은 경우 이 이메일을 무시하고 비밀번호를 변경하지 마세요.
</p>
```

---

## 4. Change Email Address (이메일 주소 변경)

### Subject (제목)
```
⭐ 주우의 포인트 시스템 - 이메일 주소 변경 확인
```

### Body (본문)
```html
<h2>⭐ 이메일 주소 변경 확인 ⭐</h2>

<p>안녕하세요!</p>

<p><strong>주우의 포인트 시스템</strong> 계정의 이메일 주소 변경을 요청하셨습니다.</p>

<p>아래 버튼을 클릭하여 새로운 이메일 주소를 확인해주세요:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">이메일 주소 확인하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p style="color: #666; font-size: 14px;">{{ .ConfirmationURL }}</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p style="color: #999; font-size: 12px;">
이 이메일은 주우의 포인트 시스템에서 자동으로 발송되었습니다.<br>
본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.
</p>
```

---

## 5. Invite User (사용자 초대)

### Subject (제목)
```
⭐ 주우의 포인트 시스템 초대장
```

### Body (본문)
```html
<h2>⭐ 주우의 포인트 시스템에 초대합니다! ⭐</h2>

<p>안녕하세요!</p>

<p><strong>주우의 포인트 시스템</strong>에 초대되었습니다.</p>

<p>좋은 행동으로 포인트를 모으고, 원하는 것을 얻을 수 있는 재미있는 시스템입니다!</p>

<p>아래 버튼을 클릭하여 계정을 활성화하고 시작하세요:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">계정 활성화하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p style="color: #666; font-size: 14px;">{{ .ConfirmationURL }}</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p style="color: #999; font-size: 12px;">
이 이메일은 주우의 포인트 시스템에서 자동으로 발송되었습니다.
</p>
```

---

## 템플릿 변수

Supabase 이메일 템플릿에서 사용할 수 있는 변수:

- `{{ .ConfirmationURL }}` - 인증/확인 링크
- `{{ .Token }}` - 인증 토큰
- `{{ .TokenHash }}` - 토큰 해시
- `{{ .SiteURL }}` - 사이트 URL
- `{{ .Email }}` - 사용자 이메일

---

## 추가 설정

### SMTP 설정 (선택사항)

Supabase 무료 플랜은 기본 SMTP를 사용하지만, 프로덕션 환경에서는 커스텀 SMTP를 설정하는 것이 좋습니다.

1. **Authentication** → **Settings** → **SMTP Settings**
2. SMTP 서버 정보 입력 (Gmail, SendGrid, AWS SES 등)
3. **Save** 버튼 클릭

### 발신자 이름 변경

1. **Authentication** → **Settings** → **SMTP Settings**
2. **Sender name** 필드에 `주우의 포인트 시스템` 입력
3. **Sender email** 필드에 원하는 이메일 주소 입력 (예: `noreply@juwoo-points.com`)
4. **Save** 버튼 클릭

---

## 테스트

이메일 템플릿을 수정한 후 반드시 테스트하세요:

1. 회원가입 테스트
2. 비밀번호 재설정 테스트
3. 이메일 주소 변경 테스트

이메일이 스팸 폴더로 가지 않도록 SPF, DKIM, DMARC 레코드를 설정하는 것이 좋습니다.

---

이 가이드를 따라 Supabase 이메일 템플릿을 설정하면 사용자에게 전문적이고 브랜드에 맞는 이메일을 보낼 수 있습니다.
