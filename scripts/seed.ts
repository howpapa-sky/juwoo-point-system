import { drizzle } from "drizzle-orm/mysql2";
import { pointRules, shopItems } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🌱 Seeding database...");

  // Point Rules - Positive behaviors
  const positiveRules = [
    // 생활습관
    { name: "9시 30분 전에 취침", description: "일찍 자는 습관", category: "생활습관" as const, pointAmount: 1000 },
    { name: "8시 전에 숙제 완료", description: "숙제를 제시간에 완료", category: "생활습관" as const, pointAmount: 1000 },
    { name: "아침에 스스로 일어나기", description: "알람 듣고 혼자 일어나기", category: "생활습관" as const, pointAmount: 800 },
    { name: "양치질 하루 3번 완료", description: "아침, 점심, 저녁 양치", category: "생활습관" as const, pointAmount: 500 },
    { name: "정리정돈 스스로 하기", description: "방 정리, 책상 정리", category: "생활습관" as const, pointAmount: 700 },
    { name: "식사 시 편식하지 않기", description: "골고루 먹기", category: "생활습관" as const, pointAmount: 600 },
    { name: "옷 스스로 입기", description: "혼자서 옷 입기", category: "생활습관" as const, pointAmount: 400 },

    // 운동건강
    { name: "러닝 1km 완주", description: "1km 달리기", category: "운동건강" as const, pointAmount: 1000 },
    { name: "자전거 타기 30분", description: "자전거 운동", category: "운동건강" as const, pointAmount: 800 },
    { name: "줄넘기 100개", description: "줄넘기 운동", category: "운동건강" as const, pointAmount: 500 },
    { name: "수영 30분", description: "수영장에서 수영", category: "운동건강" as const, pointAmount: 1200 },
    { name: "스트레칭 10분", description: "몸 풀기 운동", category: "운동건강" as const, pointAmount: 300 },

    // 학습독서
    { name: "책 한 권 읽기", description: "책 완독하기", category: "학습독서" as const, pointAmount: 1500 },
    { name: "숙제 완벽하게 완료", description: "숙제 100점 받기", category: "학습독서" as const, pointAmount: 1200 },
    { name: "새로운 단어 10개 배우기", description: "어휘력 향상", category: "학습독서" as const, pointAmount: 800 },
    { name: "수학 문제 10개 풀기", description: "수학 공부", category: "학습독서" as const, pointAmount: 1000 },
    { name: "영어 단어 20개 암기", description: "영어 공부", category: "학습독서" as const, pointAmount: 1000 },

    // 예의태도
    { name: "부모님께 인사 잘하기", description: "아침, 저녁 인사", category: "예의태도" as const, pointAmount: 500 },
    { name: "동생/친구와 사이좋게 놀기", description: "싸우지 않고 놀기", category: "예의태도" as const, pointAmount: 700 },
    { name: "어른 말씀 잘 듣기", description: "말 잘 듣기", category: "예의태도" as const, pointAmount: 600 },
    { name: "고맙습니다/미안합니다 말하기", description: "예의바른 말", category: "예의태도" as const, pointAmount: 400 },
    { name: "자발적으로 심부름하기", description: "스스로 도와주기", category: "예의태도" as const, pointAmount: 1000 },

    // 집안일
    { name: "설거지 돕기", description: "설거지 도와주기", category: "집안일" as const, pointAmount: 800 },
    { name: "청소기 돌리기", description: "청소 도와주기", category: "집안일" as const, pointAmount: 1000 },
    { name: "빨래 개기 돕기", description: "빨래 정리 돕기", category: "집안일" as const, pointAmount: 700 },
    { name: "쓰레기 버리기", description: "쓰레기 버리기", category: "집안일" as const, pointAmount: 500 },
    { name: "동생 돌보기", description: "동생 챙겨주기", category: "집안일" as const, pointAmount: 1200 },
  ];

  // Point Rules - Negative behaviors
  const negativeRules = [
    // 거짓말태도
    { name: "거짓말 하기", description: "거짓말은 나쁜 행동", category: "거짓말태도" as const, pointAmount: -30000 },
    { name: "부모님께 대들기", description: "말대꾸하기", category: "거짓말태도" as const, pointAmount: -10000 },
    { name: "동생/친구 때리기", description: "폭력 사용", category: "거짓말태도" as const, pointAmount: -15000 },
    { name: "욕설/나쁜 말 사용", description: "나쁜 말하기", category: "거짓말태도" as const, pointAmount: -5000 },
    { name: "물건 던지기", description: "화내며 물건 던지기", category: "거짓말태도" as const, pointAmount: -8000 },

    // 시간약속
    { name: "등원 1분 지각", description: "유치원/학교 늦기", category: "시간약속" as const, pointAmount: -1000 },
    { name: "취침 시간 10분 초과", description: "늦게 자기", category: "시간약속" as const, pointAmount: -500 },
    { name: "숙제 시간 지키지 않기", description: "숙제 늦게 하기", category: "시간약속" as const, pointAmount: -1500 },
    { name: "약속 시간 어기기", description: "약속 안 지키기", category: "시간약속" as const, pointAmount: -2000 },

    // 생활미준수
    { name: "양치질 안하기", description: "양치 안하기", category: "생활미준수" as const, pointAmount: -1000 },
    { name: "정리정돈 안하기", description: "방 어지럽히기", category: "생활미준수" as const, pointAmount: -800 },
    { name: "편식하기", description: "음식 가리기", category: "생활미준수" as const, pointAmount: -700 },
    { name: "게임/TV 시간 초과", description: "너무 오래 보기", category: "생활미준수" as const, pointAmount: -2000 },
    { name: "숙제 안하기", description: "숙제 안하기", category: "생활미준수" as const, pointAmount: -3000 },

    // 물건관리
    { name: "장난감 망가뜨리기", description: "장난감 고의로 부수기", category: "물건관리" as const, pointAmount: -5000 },
    { name: "책 찢기/낙서", description: "책 망가뜨리기", category: "물건관리" as const, pointAmount: -4000 },
    { name: "옷 더럽히기 (고의)", description: "일부러 옷 더럽히기", category: "물건관리" as const, pointAmount: -2000 },
  ];

  console.log("📝 Inserting point rules...");
  await db.insert(pointRules).values([...positiveRules, ...negativeRules]);

  // Shop Items
  const items = [
    // 게임시간
    { name: "포켓몬고 10분", description: "포켓몬고 게임 10분", category: "게임시간" as const, pointCost: 3000 },
    { name: "가오레 1판", description: "가오레 게임 1판", category: "게임시간" as const, pointCost: 1500 },
    { name: "닌텐도 스위치 30분", description: "스위치 게임 30분", category: "게임시간" as const, pointCost: 5000 },
    { name: "태블릿 게임 20분", description: "태블릿 게임 20분", category: "게임시간" as const, pointCost: 4000 },
    { name: "TV 시청 30분", description: "TV 보기 30분", category: "게임시간" as const, pointCost: 2000 },

    // 장난감
    { name: "작은 장난감", description: "1만원 상당 장난감", category: "장난감" as const, pointCost: 10000 },
    { name: "중간 장난감", description: "3만원 상당 장난감", category: "장난감" as const, pointCost: 30000 },
    { name: "큰 장난감", description: "5만원 상당 장난감", category: "장난감" as const, pointCost: 50000 },
    { name: "레고 세트", description: "2만원 상당 레고", category: "장난감" as const, pointCost: 20000 },
    { name: "피규어 1개", description: "피규어 한 개", category: "장난감" as const, pointCost: 8000 },

    // 간식음식
    { name: "아이스크림", description: "아이스크림 1개", category: "간식음식" as const, pointCost: 1500 },
    { name: "과자 1봉지", description: "좋아하는 과자", category: "간식음식" as const, pointCost: 1000 },
    { name: "초콜릿", description: "초콜릿 1개", category: "간식음식" as const, pointCost: 800 },
    { name: "패스트푸드 세트", description: "햄버거 세트", category: "간식음식" as const, pointCost: 8000 },
    { name: "피자 1판", description: "피자 한 판", category: "간식음식" as const, pointCost: 15000 },

    // 특별활동
    { name: "놀이공원 방문", description: "놀이공원 가기", category: "특별활동" as const, pointCost: 30000 },
    { name: "영화관 관람", description: "영화 보러가기", category: "특별활동" as const, pointCost: 10000 },
    { name: "키즈카페 2시간", description: "키즈카페 놀기", category: "특별활동" as const, pointCost: 12000 },
    { name: "수영장 방문", description: "수영장 가기", category: "특별활동" as const, pointCost: 8000 },
    { name: "친구 집 놀러가기", description: "친구네 놀러가기", category: "특별활동" as const, pointCost: 5000 },

    // 특권
    { name: "숙제 1일 면제권", description: "숙제 하루 안해도 됨", category: "특권" as const, pointCost: 15000 },
    { name: "취침 시간 30분 연장", description: "30분 더 늦게 자기", category: "특권" as const, pointCost: 5000 },
    { name: "주말 늦잠 자기", description: "주말에 늦게 일어나기", category: "특권" as const, pointCost: 3000 },
    { name: "좋아하는 메뉴 선택권", description: "저녁 메뉴 정하기", category: "특권" as const, pointCost: 4000 },
    { name: "부모님과 특별한 시간", description: "부모님과 1시간 놀기", category: "특권" as const, pointCost: 10000 },
  ];

  console.log("🛍️ Inserting shop items...");
  await db.insert(shopItems).values(items);

  console.log("✅ Seeding completed!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
