# Project TODO

## GitHub 푸시 및 배포 문제 해결 (진행 중)
- [ ] 모든 변경 사항 Git에 커밋
- [ ] GitHub에 푸시
- [ ] Netlify 자동 배포 확인
- [ ] 배포된 사이트 테스트
- [ ] Supabase 데이터 확인

## 완료된 작업
- [x] Supabase Auth 인증 문제 해결
- [x] SupabaseAuthContext 완전 재작성
- [x] AppLayout 중첩 a 태그 수정
- [x] Signup 페이지 생성
- [x] Supabase 데이터 삽입 스크립트 작성
- [x] 포인트 규칙 37개 삽입 성공
- [x] 상점 아이템 41개 삽입 성공
- [x] 영어 단어 100개 삽입 성공


## 포인트 관리 페이지 오류 수정
- [x] 오류 원인 파악 (userRole 체크 문제)
- [x] PointsManage.tsx 코드 분석
- [x] 관리자 권한 체크 제거
- [x] GitHub 푸시 (da6d7e0)
- [ ] Netlify 배포 확인 (진행 중)
- [ ] 스마트폰에서 테스트

## 포인트 관리 페이지 404 오류 해결
- [ ] App.tsx 라우팅 확인
- [ ] 라우트 경로 수정
- [ ] GitHub 푸시
- [ ] Netlify 배포 확인
- [ ] 스마트폰에서 테스트

## 관리자 권한 부여 및 거래 취소 기능 추가
- [x] yong@howlab.co.kr 계정에 admin 권한 부여 (Supabase)
- [x] Transactions 페이지에 취소 버튼 추가
- [x] 취소 시 포인트 자동 복원 로직 구현
- [x] Supabase에 is_cancelled 컴럼 추가
- [x] GitHub 푸시 (1f27462)
- [ ] Netlify 배포 확인 (진행 중)
- [ ] 기능 테스트

## 관리자 메뉴 표시 문제 수정
- [x] SupabaseAuthContext에서 users 테이블 role 조회 추가
- [x] userRole 상태 업데이트
- [x] GitHub 푸시 (da35205)
- [ ] Netlify 배포 확인 (진행 중)
- [ ] 관리자 메뉴 표시 확인

## 관리자 패널 기능 구현
- [x] 사용자 관리 기능 (목록 조회, 역할 변경)
- [x] 포인트 통계 기능 (전체 현황, 최다 적립/차감 규칙 TOP 5)
- [x] 시스템 로그 기능 (최근 거래 내역 10건)
- [x] GitHub 푸시 (8e1670b)
- [ ] Netlify 배포 확인 (진행 중)
- [ ] 기능 테스트

## 포인트 상점 재구성 및 수기 입력 기능
- [x] Supabase에서 기존 shop_items 모두 삭제
- [ ] 새 아이템 3개 추가 (포켓몬고, 테블릿, 가오레) - 스키마 문제로 보류
- [x] Shop.tsx에 수기 입력 기능 추가 (항목명, 금액)
- [x] 카테고리 필터 간소화 (전체, 게임)
- [x] GitHub 푸시 (459cbe4)
- [ ] Netlify 배포 확인 (진행 중)
- [ ] 기능 테스트

## shop_items 3개 아이템 추가
- [ ] Supabase에 포켓몬고 10분 (3000P) 추가
- [ ] Supabase에 테블릿 10분 (3000P) 추가
- [ ] Supabase에 포켓몬 가오레 1판 (1500P) 추가

## shop_items 추가 완료
- [x] Supabase에 포켓몬고 10분 (3000P) 추가
- [x] Supabase에 테블릿 10분 (3000P) 추가
- [x] Supabase에 포켓몬 가오레 1판 (1500P) 추가


## 수기 입력 구매 오류 수정
- [ ] purchases 테이블 item_id 컬럼 nullable 확인
- [ ] item_id null 허용하도록 수정
- [ ] 수기 입력 구매 테스트

## 수기 입력 오류 수정 완료
- [x] item_id NOT NULL 제약 조건 문제 확인
- [x] 임시 shop_item 생성 방식으로 변경
- [x] GitHub 푸시 (1054cd4)
- [ ] Netlify 배포 확인
- [ ] 수기 입력 구매 테스트


## 포인트 규칙 3개 삭제
- [ ] Supabase에서 "수영 30분" 삭제
- [ ] Supabase에서 "운동 경기 참여" 삭제
- [ ] Supabase에서 "동생 돌보기" 삭제


## 포인트 상점 자동 승인 기능
- [ ] Shop.tsx에서 구매 시 바로 포인트 차감 로직 추가
- [ ] transactions 테이블에 거래 내역 자동 추가
- [ ] juwoo_profile current_points 업데이트
- [ ] GitHub 푸시
- [ ] Netlify 배포 확인
- [ ] 구매 테스트

## 포인트 상점 자동 승인 완료
- [x] Shop.tsx에서 구매 시 바로 포인트 차감 로직 추가
- [x] transactions 테이블에 거래 내역 자동 추가
- [x] juwoo_profile current_points 업데이트
- [x] purchases status를 'approved'로 저장
- [x] GitHub 푸시 (a048f72)
- [ ] Netlify 배포 확인
- [ ] 구매 테스트


## 포인트 상점 구매 오류 수정
- [x] 오류 원인 파악 (transactions → point_transactions, 컴럼명 불일치)
- [x] 수정 및 테스트 완료
- [x] GitHub 푸시 (f7d79d1)
- [ ] Netlify 배포 확인 (진행 중)
- [ ] 실제 구매 테스트


## 포인트 관리 페이지 기능 추가
- [x] 우측 상단에 현재 포인트 표시
- [x] 수기 포인트 추가/차감 다이얼로그 구현
- [x] 포인트 변경 시 juwoo_profile 업데이트
- [x] point_transactions 테이블에 거래 내역 추가
- [x] 변경 후 포인트 미리보기 기능
- [x] GitHub 푸시 (962a7f4)
- [ ] Netlify 배포 확인 (진행 중)
- [ ] 기능 테스트


## 포인트 관리 페이지 디자인 개선
- [x] 레이아웃 정리 및 간격 조정
- [x] 카드 디자인 개선 (그림자, 호버 효과, 보더 2px)
- [x] 색상 시스템 통일 (그라디언트 적용)
- [x] 아이콘 및 타이포그래피 개선 (Sparkles 아이콘 추가)
- [x] 반응형 디자인 개선 (sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- [x] 현재 포인트 카드 디자인 고급화 (그라디언트 보더)
- [x] 규칙 카드 hover 효과 강화
- [x] GitHub 푸시 (c3133a7)
- [ ] Netlify 배포 확인 (진행 중)
- [ ] 디자인 확인


## 영어 학습 기능 개발 (7살 주우용)
### Phase 1: 데이터베이스 설계
- [x] english_words 테이블 생성 (단어, 뜻, 이미지, 발음, 주제)
- [x] english_learning_progress 테이블 생성 (학습 진행률)
- [x] english_quiz_results 테이블 생성 (퀴즈 결과)
- [ ] 샘플 단어 데이터 추가 (Supabase 캐시 문제로 보류)

### Phase 2: 플래시카드 학습
- [x] FlashCard.tsx 페이지 생성
- [x] 카드 뒤집기 애니메이션 (3D flip)
- [x] 클릭 인터랙션 (아는 단어/모르는 단어 버튼)
- [x] 음성 재생 기능 (Web Speech API)
- [x] 진행률 표시 (Progress bar)
- [x] 학습 완료 화면 (통계 표시)
- [x] App.tsx에 라우트 추가

### Phase 3: 퀴즈
- [x] EnglishQuiz.tsx 페이지 생성
- [x] 4지선다형 퀴즈 (10문제)
- [x] 정답/오답 애니메이션 (축하 confetti 효과)
- [x] 점수 계산 및 별점 표시 (3별 시스템)
- [x] 음성 재생 기능
- [x] 결과 화면 (점수, 별점, 메시지)
- [x] App.tsx에 라우트 추가
- [x] canvas-confetti 패키지 설치

### Phase 4: 학습 통계
- [x] 기존 EnglishLearning.tsx 활용
- [x] 통계 페이지는 기존 페이### Phase 5: 포인트 연동
- [x] 플래시카드 학습 완료 시 +500P 적립
- [x] 퀴즈 만점 (100점) 시 +1000P 적립
- [x] 퀴즈 70점 이상 시 +500P 적립
- [x] 네비게이션 메뉴에 영어 학습 이미 있음### Phase 6: 배포
- [ ] GitHub 푸시
- [ ] Netlify 배포 확인
- [ ] 기능 테스트
