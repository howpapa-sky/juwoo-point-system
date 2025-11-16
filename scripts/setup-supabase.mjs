import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqxuavqpevllzzgkpudp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeHVhdnFwZXZsbHp6Z2twdWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjQwOTMsImV4cCI6MjA0NzMwMDA5M30.ZcCNXYFPLDZkHdT7Bh9Vy9DxW7xkBvOxdOEOTtJCzfE';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase 스키마 및 데이터 설정 시작...');

// 스키마 생성은 Supabase Dashboard SQL Editor에서 수동으로 실행해야 합니다
// 여기서는 데이터만 삽입합니다

async function setupData() {
  try {
    // 주우 프로필 생성
    console.log('주우 프로필 생성 중...');
    const { data: profile, error: profileError } = await supabase
      .from('juwoo_profile')
      .upsert({ id: 1, name: '주우', age: 7, current_points: 0 })
      .select();
    
    if (profileError) {
      console.error('프로필 생성 오류:', profileError);
    } else {
      console.log('✓ 주우 프로필 생성 완료');
    }

    // 포인트 규칙 삽입
    console.log('포인트 규칙 삽입 중...');
    const pointRules = [
      // 생활습관
      { name: '일찍 자기 (9시 전)', description: '9시 전에 잠자리에 들기', category: '생활습관', point_amount: 1000, is_active: true },
      { name: '일찍 일어나기 (7시 전)', description: '7시 전에 일어나기', category: '생활습관', point_amount: 1000, is_active: true },
      { name: '아침 운동 10분', description: '아침에 운동하기', category: '생활습관', point_amount: 800, is_active: true },
      { name: '방 정리정돈', description: '방을 깨끗이 정리', category: '생활습관', point_amount: 500, is_active: true },
      { name: '양치질 3번', description: '하루 3번 양치질', category: '생활습관', point_amount: 300, is_active: true },
      { name: '세수 스스로', description: '혼자서 세수하기', category: '생활습관', point_amount: 200, is_active: true },
      { name: '옷 개기', description: '옷을 깔끔하게 개기', category: '생활습관', point_amount: 400, is_active: true },
      { name: '신발 정리', description: '신발을 제자리에', category: '생활습관', point_amount: 300, is_active: true },
      
      // 운동건강
      { name: '운동 1시간', description: '운동 1시간 하기', category: '운동건강', point_amount: 2000, is_active: true },
      { name: '수영 30분', description: '수영 30분', category: '운동건강', point_amount: 1200, is_active: true },
      { name: '자전거 타기 30분', description: '자전거 30분', category: '운동건강', point_amount: 800, is_active: true },
      { name: '축구 1시간', description: '축구 연습 1시간', category: '운동건강', point_amount: 1500, is_active: true },
      { name: '농구 1시간', description: '농구 연습 1시간', category: '운동건강', point_amount: 1500, is_active: true },
      { name: '줄넘기 100개', description: '줄넘기 100개', category: '운동건강', point_amount: 500, is_active: true },
      { name: '스트레칭 10분', description: '스트레칭 10분', category: '운동건강', point_amount: 300, is_active: true },
      
      // 학습독서
      { name: '숙제 완료', description: '학교 숙제 완료', category: '학습독서', point_amount: 1500, is_active: true },
      { name: '책 읽기 30분', description: '책 30분 읽기', category: '학습독서', point_amount: 1000, is_active: true },
      { name: '수학 문제 10개', description: '수학 문제 풀기', category: '학습독서', point_amount: 800, is_active: true },
      { name: '일기 쓰기', description: '하루 일기 작성', category: '학습독서', point_amount: 600, is_active: true },
      { name: '독서 30분', description: '책 읽기 30분', category: '학습독서', point_amount: 500, is_active: true },
      
      // 예의태도
      { name: '부모님 도와주기', description: '집안일 도와주기', category: '예의태도', point_amount: 1000, is_active: true },
      { name: '어른께 인사', description: '어른께 인사하기', category: '예의태도', point_amount: 300, is_active: true },
      { name: '동생 돌보기', description: '동생 챙겨주기', category: '예의태도', point_amount: 800, is_active: true },
      { name: '친구 도와주기', description: '친구 도움 주기', category: '예의태도', point_amount: 600, is_active: true },
      { name: '감사 인사', description: '감사합니다 말하기', category: '예의태도', point_amount: 200, is_active: true },
      
      // 집안일
      { name: '설거지 돕기', description: '설거지 도와주기', category: '집안일', point_amount: 800, is_active: true },
      { name: '쓰레기 버리기', description: '쓰레기 분리수거', category: '집안일', point_amount: 500, is_active: true },
      { name: '청소 돕기', description: '집안 청소 돕기', category: '집안일', point_amount: 700, is_active: true },
      { name: '빨래 개기', description: '빨래 개는 것 돕기', category: '집안일', point_amount: 600, is_active: true },
      
      // 부정적 행동
      { name: '거짓말', description: '거짓말을 함', category: '부정적행동', point_amount: -5000, is_active: true },
      { name: '욕설', description: '나쁜 말 사용', category: '부정적행동', point_amount: -5000, is_active: true },
      { name: '형제 싸움', description: '형제와 싸움', category: '부정적행동', point_amount: -3000, is_active: true },
      { name: '물건 망가뜨림', description: '물건을 고의로 파손', category: '부정적행동', point_amount: -10000, is_active: true },
      { name: '약속 어김', description: '약속을 지키지 않음', category: '부정적행동', point_amount: -2000, is_active: true },
      { name: '숙제 안함', description: '숙제를 하지 않음', category: '부정적행동', point_amount: -5000, is_active: true },
      { name: '방 정리 안함', description: '방을 정리하지 않음', category: '부정적행동', point_amount: -1000, is_active: true },
      { name: '지각', description: '약속 시간에 늦음', category: '부정적행동', point_amount: -1000, is_active: true },
    ];

    const { data: rules, error: rulesError } = await supabase
      .from('point_rules')
      .upsert(pointRules, { onConflict: 'name' })
      .select();
    
    if (rulesError) {
      console.error('포인트 규칙 삽입 오류:', rulesError);
    } else {
      console.log(`✓ ${pointRules.length}개 포인트 규칙 삽입 완료`);
    }

    // 상점 아이템 삽입
    console.log('상점 아이템 삽입 중...');
    const shopItems = [
      // 게임시간
      { name: '포켓몬고 10분', description: '포켓몬고 게임 10분', category: '게임시간', point_cost: 3000, is_available: true },
      { name: '가오레 1판', description: '가오레 게임 1판', category: '게임시간', point_cost: 1500, is_available: true },
      { name: '닌텐도 스위치 30분', description: '스위치 게임 30분', category: '게임시간', point_cost: 5000, is_available: true },
      { name: '태블릿 30분', description: '태블릿 사용 30분', category: '게임시간', point_cost: 4000, is_available: true },
      { name: '유튜브 시청 30분', description: '유튜브 30분', category: '게임시간', point_cost: 3000, is_available: true },
      { name: '로블록스 30분', description: '로블록스 게임 30분', category: '게임시간', point_cost: 4000, is_available: true },
      { name: '마인크래프트 30분', description: '마인크래프트 30분', category: '게임시간', point_cost: 4000, is_available: true },
      
      // 장난감
      { name: '작은 장난감', description: '작은 장난감 구매', category: '장난감', point_cost: 10000, is_available: true },
      { name: '피규어 1개', description: '피규어 구매', category: '장난감', point_cost: 15000, is_available: true },
      { name: '보드게임', description: '보드게임 구매', category: '장난감', point_cost: 25000, is_available: true },
      { name: 'RC카', description: 'RC카 구매', category: '장난감', point_cost: 30000, is_available: true },
      { name: '레고 세트', description: '레고 세트 구매', category: '장난감', point_cost: 50000, is_available: true },
      
      // 간식음식
      { name: '아이스크림', description: '아이스크림 1개', category: '간식음식', point_cost: 1500, is_available: true },
      { name: '과자 1봉지', description: '과자 구매', category: '간식음식', point_cost: 2000, is_available: true },
      { name: '사탕 10개', description: '사탕 10개', category: '간식음식', point_cost: 1000, is_available: true },
      { name: '초콜릿', description: '초콜릿 1개', category: '간식음식', point_cost: 2000, is_available: true },
      { name: '떡볶이', description: '떡볶이 먹기', category: '간식음식', point_cost: 5000, is_available: true },
      { name: '피자', description: '피자 한 판', category: '간식음식', point_cost: 15000, is_available: true },
      { name: '치킨', description: '치킨 한 마리', category: '간식음식', point_cost: 20000, is_available: true },
      
      // 특별활동
      { name: '놀이공원', description: '놀이공원 방문', category: '특별활동', point_cost: 30000, is_available: true },
      { name: '수족관', description: '수족관 방문', category: '특별활동', point_cost: 15000, is_available: true },
      { name: '박물관', description: '박물관 방문', category: '특별활동', point_cost: 10000, is_available: true },
      { name: '과학관', description: '과학관 방문', category: '특별활동', point_cost: 10000, is_available: true },
      { name: '동물원', description: '동물원 방문', category: '특별활동', point_cost: 15000, is_available: true },
      { name: '영화관', description: '영화 관람', category: '특별활동', point_cost: 12000, is_available: true },
      { name: '키즈카페', description: '키즈카페 방문', category: '특별활동', point_cost: 10000, is_available: true },
      { name: '워터파크', description: '워터파크 방문', category: '특별활동', point_cost: 35000, is_available: true },
      
      // 특권
      { name: '취침시간 30분 연장', description: '30분 더 깨어있기', category: '특권', point_cost: 5000, is_available: true },
      { name: '간식 무제한 1일', description: '하루 간식 자유', category: '특권', point_cost: 20000, is_available: true },
      { name: 'TV 시청 1시간 추가', description: 'TV 1시간 더 보기', category: '특권', point_cost: 6000, is_available: true },
      { name: '친구 초대권', description: '친구 집에 초대', category: '특권', point_cost: 10000, is_available: true },
      { name: '외식 메뉴 선택권', description: '외식 메뉴 결정', category: '특권', point_cost: 8000, is_available: true },
      { name: '주말 아침 늦잠', description: '주말 아침 늦게 일어나기', category: '특권', point_cost: 3000, is_available: true },
      { name: '용돈 5000원', description: '용돈 5000원', category: '특권', point_cost: 5000, is_available: true },
    ];

    const { data: items, error: itemsError } = await supabase
      .from('shop_items')
      .upsert(shopItems, { onConflict: 'name' })
      .select();
    
    if (itemsError) {
      console.error('상점 아이템 삽입 오류:', itemsError);
    } else {
      console.log(`✓ ${shopItems.length}개 상점 아이템 삽입 완료`);
    }

    console.log('\n✅ Supabase 데이터 설정 완료!');
    console.log(`- 포인트 규칙: ${pointRules.length}개`);
    console.log(`- 상점 아이템: ${shopItems.length}개`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

setupData();
