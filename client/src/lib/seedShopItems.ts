import { supabase } from './supabaseClient';

const SHOP_SEED_KEY = 'juwoo-shop-items-seeded-v2';

const shopItemsToSeed = [
  // 게임 (Gaming)
  { name: "닌텐도 스위치 게임 10분", description: "스위치로 원하는 게임 10분!", category: "게임", point_cost: 500 },
  { name: "닌텐도 스위치 게임 30분", description: "스위치로 원하는 게임 30분!", category: "게임", point_cost: 1200 },
  { name: "닌텐도 스위치 게임 1시간", description: "스위치로 원하는 게임 1시간!", category: "게임", point_cost: 2000 },
  { name: "모바일 게임 10분", description: "핸드폰 게임 10분", category: "게임", point_cost: 300 },
  { name: "모바일 게임 30분", description: "핸드폰 게임 30분", category: "게임", point_cost: 800 },
  { name: "보드게임 함께하기", description: "온 가족이 함께 보드게임!", category: "게임", point_cost: 1500 },

  // 특권 (Privileges)
  { name: "잠자기 30분 늦추기", description: "오늘은 30분 더 놀아도 돼!", category: "특권", point_cost: 2000 },
  { name: "저녁 메뉴 선택권", description: "오늘 저녁은 내가 정한다!", category: "특권", point_cost: 1500 },
  { name: "하루 숙제 면제권", description: "하루 숙제를 안 해도 OK!", category: "특권", point_cost: 3000 },
  { name: "TV 프로그램 선택권", description: "오늘 TV 채널은 내가 골라!", category: "특권", point_cost: 1000 },
  { name: "주말 늦잠 자기", description: "주말에 마음껏 늦잠!", category: "특권", point_cost: 1500 },
  { name: "심부름 면제권", description: "오늘 하루 심부름 안 해도 돼!", category: "특권", point_cost: 2500 },

  // 이용권 (Passes)
  { name: "유튜브 시청 10분", description: "유튜브 영상 10분 시청", category: "이용권", point_cost: 300 },
  { name: "유튜브 시청 30분", description: "유튜브 영상 30분 시청", category: "이용권", point_cost: 700 },
  { name: "태블릿 사용 30분", description: "태블릿으로 원하는 것 30분", category: "이용권", point_cost: 800 },
  { name: "영화 보기 (집에서)", description: "집에서 원하는 영화 한 편!", category: "이용권", point_cost: 1500 },
  { name: "음악 듣기 30분", description: "좋아하는 음악 30분!", category: "이용권", point_cost: 500 },

  // 간식 (Snacks)
  { name: "아이스크림", description: "맛있는 아이스크림 하나!", category: "간식", point_cost: 1000 },
  { name: "초콜릿", description: "달콤한 초콜릿!", category: "간식", point_cost: 500 },
  { name: "젤리", description: "쫄깃한 젤리!", category: "간식", point_cost: 400 },
  { name: "과자 1봉지", description: "좋아하는 과자 1봉지!", category: "간식", point_cost: 500 },
  { name: "음료수 1잔", description: "시원한 음료수!", category: "간식", point_cost: 300 },
  { name: "쿠키", description: "바삭한 쿠키!", category: "간식", point_cost: 400 },
  { name: "팝콘 만들기", description: "영화랑 함께 팝콘!", category: "간식", point_cost: 600 },
  { name: "케이크 한 조각", description: "달콤한 케이크!", category: "간식", point_cost: 800 },

  // 장난감 (Toys)
  { name: "포켓몬 카드팩", description: "포켓몬 카드 1팩!", category: "장난감", point_cost: 3000 },
  { name: "작은 레고 세트", description: "미니 레고 세트!", category: "장난감", point_cost: 5000 },
  { name: "미니 피규어", description: "작은 피규어 하나!", category: "장난감", point_cost: 2000 },
  { name: "스티커 세트", description: "귀여운 스티커 모음!", category: "장난감", point_cost: 800 },
  { name: "색칠공부 세트", description: "색칠놀이 세트!", category: "장난감", point_cost: 1200 },
  { name: "퍼즐", description: "재미있는 퍼즐!", category: "장난감", point_cost: 1500 },

  // 외출 (Outing)
  { name: "키즈카페 1시간", description: "키즈카페에서 신나게!", category: "외출", point_cost: 5000 },
  { name: "놀이공원 방문", description: "놀이공원에서 하루!", category: "외출", point_cost: 10000 },
  { name: "영화관 가기", description: "영화관에서 영화보기!", category: "외출", point_cost: 5000 },
  { name: "공원 놀이", description: "공원에서 자유롭게!", category: "외출", point_cost: 1500 },
  { name: "수영장 가기", description: "수영장에서 물놀이!", category: "외출", point_cost: 4000 },
  { name: "자전거 타기", description: "밖에서 자전거 타기!", category: "외출", point_cost: 1000 },

  // 선물 (Gift)
  { name: "작은 선물 (3,000원 이하)", description: "작은 선물 하나!", category: "선물", point_cost: 3000 },
  { name: "중간 선물 (5,000원 이하)", description: "적당한 선물 하나!", category: "선물", point_cost: 5000 },
  { name: "큰 선물 (10,000원 이하)", description: "큰 선물!", category: "선물", point_cost: 10000 },
  { name: "특별 선물 (20,000원 이하)", description: "정말 특별한 선물!", category: "선물", point_cost: 20000 },

  // 전자기기 (Electronics)
  { name: "유튜브 프리미엄 하루", description: "하루 종일 유튜브!", category: "전자기기", point_cost: 2000 },
  { name: "넷플릭스 영화 1편", description: "넷플릭스에서 영화!", category: "전자기기", point_cost: 1500 },
  { name: "음악 스트리밍 하루", description: "하루 종일 음악!", category: "전자기기", point_cost: 1000 },
];

export async function seedShopItems(): Promise<void> {
  if (localStorage.getItem(SHOP_SEED_KEY)) return;

  try {
    // Fetch existing items to avoid duplicates
    const { data: existingItems } = await supabase
      .from('shop_items')
      .select('name');

    const existingNames = new Set((existingItems || []).map((i: { name: string }) => i.name));

    const newItems = shopItemsToSeed
      .filter(item => !existingNames.has(item.name))
      .map(item => ({
        ...item,
        is_available: true,
      }));

    if (newItems.length > 0) {
      const { error } = await supabase
        .from('shop_items')
        .insert(newItems);

      if (error) throw error;
    }

    localStorage.setItem(SHOP_SEED_KEY, 'true');
  } catch (error) {
    console.error('Error seeding shop items:', error);
  }
}
