# Netlify 배포 사이트 오류 목록

## 우선순위 1: 치명적 오류 (사이트 작동 불가)

### 1. tRPC API 502 Bad Gateway 오류
- **증상**: 대시보드 접속 시 모든 API 호출이 502 오류 반환
- **영향**: 데이터를 전혀 불러올 수 없음
- **원인**: Netlify Functions가 제대로 배포되지 않았거나 tRPC 서버 오류
- **해결 방법**: 
  - netlify.toml의 functions 경로 확인
  - Netlify Functions 코드 수정
  - 서버리스 환경에 맞게 tRPC 설정 조정

### 2. /dashboard 직접 접속 시 "Invalid URL" 오류
- **증상**: TypeError: Failed to construct 'URL': Invalid URL
- **영향**: 대시보드 URL을 직접 입력하면 앱이 크래시
- **원인**: 환경 변수나 URL 생성 로직 오류
- **해결 방법**: 
  - URL 생성 코드 검토
  - 환경 변수 확인

## 우선순위 2: 중요 오류

### 3. Supabase 회원가입 401 오류 (이미 해결됨)
- **상태**: ✅ 해결됨
- **결과**: 회원가입 정상 작동 확인

## 우선순위 3: 경고

### 4. 406 Not Acceptable 오류
- **증상**: 일부 리소스 로딩 시 406 오류
- **영향**: 특정 기능 작동 불가 가능성
- **해결 방법**: 추후 조사 필요

## 다음 단계

1. Netlify Functions 설정 수정
2. tRPC 서버리스 환경 설정 검증
3. URL 생성 로직 수정
4. 재배포 및 테스트
