# Project TODO

## 최근 완료 (2024-12)
- [x] **balance_after 컬럼 제거** - 실제 DB 스키마에 맞춤 (11개 파일)
  - Transactions.tsx, Dashboard.tsx, PokemonQuiz.tsx, EbookReader.tsx
  - PointsManage.tsx (2곳), EnglishQuiz.tsx, FlashCard.tsx
  - Shop.tsx (2곳), VoiceLearning.tsx, WordLearning.tsx
- [x] **WordLearning.tsx 학습 진행률 연동** - english_learning_progress 테이블 연동

## 완료된 작업

### 기본 시스템
- [x] Supabase Auth 인증 문제 해결
- [x] SupabaseAuthContext 완전 재작성
- [x] AppLayout 중첩 a 태그 수정
- [x] Signup 페이지 생성
- [x] 포인트 규칙 37개 삽입 성공
- [x] 상점 아이템 41개 삽입 성공
- [x] 영어 단어 100개 삽입 성공

### 포인트 관리 기능
- [x] 관리자 권한 체크 제거
- [x] yong@howlab.co.kr 계정에 admin 권한 부여
- [x] Transactions 페이지에 취소 버튼 추가
- [x] 취소 시 포인트 자동 복원 로직 구현
- [x] 관리자 패널 기능 구현 (사용자 관리, 통계, 로그)
- [x] 수기 포인트 추가/차감 기능

### 포인트 상점
- [x] 상점 아이템 3개 추가 (포켓몬고, 테블릿, 가오레)
- [x] Shop.tsx에 수기 입력 기능 추가
- [x] 자동 승인 기능 구현

### 영어 학습 기능
- [x] english_words 테이블 (100개 단어)
- [x] english_learning_progress 테이블
- [x] FlashCard.tsx (3D flip 애니메이션, +500P)
- [x] EnglishQuiz.tsx (4지선다형 퀴즈, 점수별 보상)
- [x] WordLearning.tsx (텍스트 입력 학습, +300P)
- [x] VoiceLearning.tsx (음성 인식 학습, +500P)
- [x] LearningStats.tsx (통계 대시보드)

### 포켓몬 퀴즈
- [x] PokemonQuiz.tsx 구현
- [x] 영유 2년차 졸업반 수준으로 난이도 업그레이드

### 배포
- [x] Netlify 빌드 오류 해결
- [x] GitHub 연동 및 자동 배포 설정
