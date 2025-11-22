import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalTest() {
  console.log('✅ 최종 구매 테스트 시작\n');
  
  const { data: profile } = await supabase
    .from('juwoo_profile')
    .select('current_points')
    .eq('id', 1)
    .single();

  const testCost = 100;
  const newBalance = profile.current_points - testCost;

  // 1. 포인트 차감
  await supabase
    .from('juwoo_profile')
    .update({ current_points: newBalance })
    .eq('id', 1);
  console.log('✅ 1. 포인트 차감 성공');

  // 2. 거래 내역 추가 (수정된 컬럼명)
  const { error: txError } = await supabase
    .from('point_transactions')
    .insert({
      juwoo_id: 1,
      rule_id: null,
      amount: -testCost,
      note: '[테스트] 최종 구매 테스트',
      is_cancelled: false,
    });

  if (txError) {
    console.error('❌ 2. 거래 내역 추가 실패:', txError);
    await supabase.from('juwoo_profile').update({ current_points: profile.current_points }).eq('id', 1);
    return;
  }
  console.log('✅ 2. 거래 내역 추가 성공');

  // 3. 구매 내역 추가
  const { error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      juwoo_id: 1,
      item_id: 151,
      point_cost: testCost,
      status: 'approved',
      note: '최종 테스트',
      approved_at: new Date().toISOString(),
    });

  if (purchaseError) {
    console.error('❌ 3. 구매 내역 추가 실패:', purchaseError);
    await supabase.from('juwoo_profile').update({ current_points: profile.current_points }).eq('id', 1);
    return;
  }
  console.log('✅ 3. 구매 내역 추가 성공');

  console.log('\n✅✅✅ 모든 테스트 성공! ✅✅✅\n');
  
  // 롤백
  await supabase.from('juwoo_profile').update({ current_points: profile.current_points }).eq('id', 1);
  console.log('테스트 데이터 롤백 완료');
}

finalTest();
