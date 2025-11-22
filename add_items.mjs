import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addItems() {
  console.log('기존 아이템 확인 중...');
  const { data: existing, error: selectError } = await supabase
    .from('shop_items')
    .select('*')
    .limit(1);

  if (selectError) {
    console.error('조회 오류:', selectError);
    return;
  }

  console.log('기존 아이템 샘플:', existing);
  console.log('\n컬럼 목록:', existing && existing.length > 0 ? Object.keys(existing[0]) : '없음');

  console.log('\n새 아이템 추가 시도...');
  const newItems = [
    {
      name: '포켓몬고 10분',
      description: '포켓몬고 10분 플레이',
      point_cost: 3000,
      category: '게임',
      is_available: true,
    },
    {
      name: '테블릿 10분',
      description: '테블릿 10분 사용',
      point_cost: 3000,
      category: '게임',
      is_available: true,
    },
    {
      name: '포켓몬 가오레 1판',
      description: '포켓몬 가오레 1판 플레이',
      point_cost: 1500,
      category: '게임',
      is_available: true,
    },
  ];

  const { data, error: insertError } = await supabase
    .from('shop_items')
    .insert(newItems)
    .select();

  if (insertError) {
    console.error('추가 오류:', insertError);
  } else {
    console.log('✅ 새 아이템 추가 완료:', data.length, '개');
    data.forEach(item => {
      console.log(`  - ${item.name}: ${item.point_cost.toLocaleString()}P`);
    });
  }
}

addItems();
