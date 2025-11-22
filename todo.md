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
- [ ] 오류 원인 파악 (Supabase 권한 또는 컬럼 문제)
- [ ] 수정 및 테스트
- [ ] GitHub 푸시
- [ ] Netlify 배포 확인
