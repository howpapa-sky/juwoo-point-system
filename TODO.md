# TODO — 주우 포인트 시스템

## 투자 시스템 리뉴얼

### Phase 1 — 핵심
- [x] DB 스키마 추가 (savings_account, interest_history, seeds, saving_goals, goal_deposits)
- [x] MyWallet.tsx 생성 (메인 허브)
- [x] Savings.tsx 생성 (금고 + 이자)
- [x] 네비게이션 구조 변경
- [ ] 기존 Shop.tsx에 "목표 모으기" 버튼 추가
- [x] 기존 Transactions.tsx에 신규 카테고리 추가

### Phase 2 — 투자
- [x] SeedFarm.tsx 생성 (3종 씨앗)
- [x] 씨앗 심기 플로우 (선택→금액→일기)
- [x] 수확 결과 화면 + 애니메이션
- [x] 투자 일기 기능
- [ ] 이자 자동 계산 로직 (크론잡 또는 앱 실행 시 체크)
- [ ] 수확 자동 체크 로직 (크론잡 또는 앱 실행 시 체크)

### Phase 3 — 보완
- [x] GoalSaving.tsx 생성
- [x] InvestReport.tsx 생성 (주간/월간)
- [x] 홈 대시보드 위젯 추가
- [ ] 알림 시스템
- [ ] 코인 이동 애니메이션
