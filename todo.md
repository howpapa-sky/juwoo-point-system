# 주우 포인트 시스템 - 기능 확장

## Supabase 완전 전환 작업
- [x] Supabase 클라이언트 설정
- [x] 데이터베이스 스키마 생성
- [x] 모든 데이터 삽입 (포인트 규칙, 상점 아이템)
- [x] 애플리케이션 코드 Supabase 연결
- [x] 영어 단어 100개 데이터 삽입
- [x] 새로운 테이블 생성 (word_learning_progress, badges, user_badges, goals)

## Phase 1: 영어 단어 학습 기능
- [x] 영어 단어 학습 페이지 (/english)
- [x] 카테고리별 단어 목록
- [x] 플래시카드 학습 모드
- [x] 단어 퀴즈 (객관식)
- [x] 학습 진도 추적 (학습한 단어 표시)
- [x] 단어 암기 시 포인트 적립 (단어당 50포인트)
- [ ] 일일 학습 목표 (10단어)

## Phase 2: 포인트 통계 대시보드
- [x] 대시보드 페이지 개선
- [x] 포인트 타임라인 (최근 거래 내역)
- [x] 카테고리별 포인트 통계 (차트)
- [ ] 주간/월간 포인트 그래프
- [x] 총 획득/사용 포인트 요약

## Phase 3: 목표 설정 기능
- [x] 목표 설정 페이지
- [x] 상점 아이템을 목표로 설정
- [x] 목표 진행률 표시
- [ ] 목표 달성 축하 애니메이션
- [x] 여러 목표 동시 설정 가능

## Phase 4: 배지 및 업적 시스템
- [x] 배지 데이터베이스 스키마
- [x] 업적 목록 (첫 포인트, 100포인트, 1000포인트 등)
- [x] 배지 컬렉션 페이지 (/badges)
- [x] 배지 데이터 10개 삽입
- [ ] 배지 자동 획득 로직
- [ ] 배지 획득 알림
- [ ] 특별 배지 (연속 학습, 완벽한 주 등)

## Phase 5: 타이머 기능
- [ ] 타이머 페이지
- [ ] 맞춤형 타이머 설정
- [ ] 시각적 카운트다운
- [ ] 타이머 완료 시 자동 포인트 적립
- [ ] 타이머 히스토리

## Phase 6: UI/UX 개선
- [x] 애니메이션 효과 추가 (slide-up)
- [ ] 사운드 효과 (선택적)
- [x] 로딩 스켈레톤
- [x] 에러 처리 개선
- [x] 모바일 반응형 최적화
- [ ] 다크 모드 지원

## Phase 7: 부가 기능
- [ ] 프로필 아바타 설정
- [ ] 부모 대시보드
- [ ] 알림 시스템
- [ ] 주간 리포트

## 완료된 주요 기능
✅ Supabase 데이터베이스 완전 전환
✅ 영어 단어 학습 시스템 (100개 단어, 10개 카테고리)
✅ 포인트 적립 및 사용 시스템
✅ 상점 시스템 (34개 아이템)
✅ 목표 설정 기능
✅ 배지 시스템 (10개 배지)
✅ 대시보드 및 통계
✅ 관리자 패널

## 긴급 수정 사항
- [x] OAuth 로그인 오류 수정 (사용자 데이터 저장 실패)
- [x] upsertUser 함수에서 발생하는 오류 해결
- [x] snake_case/camelCase 변환 문제 해결
- [x] 로그인 후 정상 작동 확인

## GitHub 및 Netlify 배포
- [ ] 최종 체크포인트 저장
- [ ] GitHub 리포지토리 생성
- [ ] 코드 푸시
- [ ] Netlify 배포 설정
- [ ] 배포 완료 및 URL 확인

## Supabase Auth 전환
- [x] Supabase Auth 활성화 및 설정
- [ ] Google OAuth 프로바이더 설정 (Supabase Dashboard에서 수동 설정 필요)
- [ ] Manus OAuth 코드 제거 (선택 사항)
- [x] Supabase Auth 클라이언트 통합
- [x] 로그인/회원가입 UI 구현
- [x] 세션 관리 구현
- [ ] 로그인 테스트 및 검증

## Google OAuth 설정
- [x] Google Cloud Console에서 프로젝트 생성/선택
- [x] OAuth 2.0 Client ID 생성
- [x] Authorized redirect URIs 설정
- [x] Client ID/Secret을 Supabase에 입력
- [x] Google 로그인 redirect URL 수정
- [ ] Google 로그인 테스트

## 웹 기획서 작성
- [x] 프로젝트 개요 및 목적
- [x] 기술 스택 및 아키텍처
- [x] 데이터베이스 스키마 상세
- [x] API 엔드포인트 명세
- [x] 기능 명세 (페이지별)
- [x] UI/UX 디자인 가이드
- [x] 배포 및 환경 설정
- [x] 최종 기획서 완성


## 사이트 정상 작동 확인
- [x] 개발 서버 상태 확인
- [x] 로그인 기능 테스트
- [x] Home.tsx import 오류 수정
- [x] 서버 재시작
- [x] Supabase 설정 가이드 작성
- [ ] 포인트 적립 기능 테스트
- [ ] 상점 구매 기능 테스트
- [ ] 영어 학습 기능 테스트


## 회원가입/로그인 문제 해결
- [x] 로그인 성공 후 리다이렉트 문제 수정 (useEffect로 자동 리다이렉트)
- [x] 회원가입 성공 후 리다이렉트 문제 수정
- [x] 이메일 인증 템플릿 설정 (주우의 포인트 시스템) - SUPABASE_EMAIL_TEMPLATES.md 작성
- [x] 구글 로그인 오류 수정 (정상 작동 확인, redirectTo 수정)
- [x] Supabase 설정 체크리스트 작성
- [ ] 전체 인증 플로우 테스트 (사용자가 Supabase 설정 후)


## 빌드 오류 수정 및 인증 문제 해결
- [x] toLocaleString 빌드 오류 수정 (Vite 설정 최적화)
- [x] 대시보드 인증 문제 해결 (모든 페이지를 Supabase Auth로 통일)
- [x] Vite 빌드 설정 최적화
- [x] Drizzle 스키마를 MySQL에서 PostgreSQL로 변경
- [x] PostgreSQL 드라이버 설치
- [x] TypeScript 오류 모두 해결
- [ ] Supabase PostgreSQL 데이터베이스 테이블 생성
- [ ] 초기 데이터 삽입 (37개 포인트 규칙, 34개 상점 아이템, 100개 영어 단어, 10개 배지)

## 추가 기능 구현
- [ ] 포인트 적립/차감 기능 구현
- [ ] 상점 구매 기능 구현
- [ ] 영어 학습 기능 구현
- [ ] 배지 시스템 구현
- [ ] 목표 설정 기능 구현
- [ ] 통계 및 분석 기능 구현


## 개발 서버에서 모든 기능 구현
- [x] Supabase MCP를 통해 데이터베이스 테이블 생성
- [x] 초기 데이터 삽입 (37개 포인트 규칙, 34개 상점 아이템, 100개 영어 단어, 10개 배지)
- [x] tRPC 라우터 구현 (포인트 관련 API)
- [x] tRPC 라우터 구현 (상점 관련 API)
- [x] tRPC 라우터 구현 (영어 학습 관련 API)
- [x] tRPC 라우터 구현 (배지 관련 API)
- [x] Supabase 환경 변수 설정
- [x] 서버 재시작 및 정상 작동 확인
- [ ] 프론트엔드에서 실제 데이터 표시 확인
- [ ] 포인트 적립/차감 기능 테스트
- [ ] 상점 구매 기능 테스트
- [ ] 영어 학습 기능 테스트


## Dashboard toLocaleString 오류 수정
- [x] Dashboard.tsx 351번 라인 오류 확인
- [x] toLocaleString 오류 수정 (undefined 체크 추가)
- [x] 모든 페이지에서 toLocaleString 오류 일괄 수정 (7개 파일, 23개 위치)
- [x] TypeScript 오류 없음 확인
- [x] 개발 서버 정상 작동 확인


## 좌측 사이드바 및 사용자 기능 추가
- [ ] 좌측 사이드바 레이아웃 컴포넌트 제작
- [ ] 사이드바 메뉴 항목 추가 (대시보드, 포인트 관리, 포인트 상점, 영어 학습, 목표 설정, 배지, 통계)
- [ ] 로그아웃 버튼 추가
- [ ] 현재 로그인 아이디 표시
- [ ] 마이페이지 기능 추가
- [ ] 모든 페이지에 레이아웃 적용
- [ ] 반응형 디자인 (모바일 대응)


## 관리자 권한 및 데이터 마이그레이션
- [ ] yong@howlab.co.kr에 최종 관리자 권한 부여
- [ ] AppLayout에 관리자 메뉴 추가 (role 기반 조건부 표시)
- [ ] 기존 포인트 입출금 내역 데이터 가져오기
- [ ] 포인트 데이터 Supabase에 삽입
- [ ] 관리자 로그인 테스트
- [ ] 관리자 메뉴 표시 확인


## Role 권한 문제 수정
- [x] users 테이블에 yong@howlab.co.kr 계정 추가 및 admin 권한 부여
- [x] SupabaseAuthContext에서 users 테이블 role 조회 기능 추가
- [x] AppLayout에서 userRole 사용하도록 수정
- [x] PointsManage 페이지에서 userRole 사용하도록 수정
- [ ] yong@howlab.co.kr 계정으로 로그인 테스트


## GitHub 및 Netlify 연결
- [x] Git 저장소 초기화
- [x] GitHub 원격 저장소 연결 (https://github.com/howpapa-sky/juwoo-point-system)
- [x] 코드 커밋 및 푸시
- [x] Netlify 배포 설정 파일 작성 (netlify.toml)
- [ ] Netlify와 GitHub 저장소 연결 (수동 설정 필요)


## Netlify Functions로 서버 API 변환
- [x] Netlify Functions 디렉토리 생성 (netlify/functions/trpc.ts)
- [x] tRPC 서버를 Netlify Function으로 변환
- [x] server/supabaseServer.ts 생성 (Supabase 서버 클라이언트)
- [x] server/_core/context.ts - Supabase Auth로 완전히 변환
- [x] client/src/main.tsx - tRPC 요청에 Supabase Auth 토큰 추가
- [x] netlify.toml 설정 수정
- [x] GitHub 푸시 및 Netlify 재배포
- [ ] Netlify 환경 변수 설정 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] 배포된 사이트에서 API 작동 확인


## 전체 시스템 점검 및 오류 해결 (진행 중)
- [ ] GitHub-Netlify-Supabase 연결 상태 점검
- [ ] Supabase 데이터베이스 연결 문자열 확인 및 Netlify 환경 변수 추가
- [ ] Netlify 환경 변수 전체 검증
- [ ] Netlify Functions 502 오류 해결
- [ ] tRPC API 서버리스 환경 설정 수정
- [ ] Supabase 테이블 구조 검증
- [ ] 프론트엔드 코드 전체 점검
- [ ] 백엔드 코드 전체 점검
- [ ] Invalid URL 오류 수정 완료 ✅
- [ ] 전체 기능 테스트 (회원가입, 로그인, 포인트 관리 등)
- [ ] 배포 후 실제 사이트 동작 검증

## DATABASE_URL 없이 Supabase Client로 서버 연결 전환
- [x] Netlify Functions에서 Drizzle 대신 Supabase Client 사용하도록 변경
- [x] server/db.ts를 Supabase Client 기반으로 재작성
- [x] tRPC 라우터를 Supabase Client API로 변경
- [x] 모든 데이터베이스 쿼리를 Supabase Client로 마이그레이션
- [x] SupabaseAuthContext 무한 로딩 문제 해결 (타임아웃 및 에러 처리 추가)
- [x] 코드 푸시 및 Netlify 재배포
- [ ] 502 오류 해결 확인
