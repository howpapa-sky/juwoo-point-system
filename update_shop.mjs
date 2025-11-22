import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateShop() {
  console.log('새 아이템 추가 중...');
  const newItems = [
    {
      name: '포켓몬고 10분',
      description: '포켓몬고 10분 플레이',
      price: 3000,
      category: '게임',
    },
    {
      name: '테블릿 10분',
      description: '테블릿 10분 사용',
      price: 3000,
      category: '게임',
    },
    {
      name: '포켓몬 가오레 1판',
      description: '포켓몬 가오레 1판 플레이',
      price: 1500,
      category: '게임',
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
      console.log(`  - ${item.name}: ${item.price.toLocaleString()}P`);
    });
  }
}

updateShop();
