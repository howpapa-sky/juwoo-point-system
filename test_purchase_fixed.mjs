import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPurchase() {
  console.log('1. 현재 포인트 조회...');
  const { data: profile, error: profileError } = await supabase
    .from('juwoo_profile')
    .select('current_points')
    .eq('id', 1)
    .single();

  if (profileError) {
    console.error('❌ 포인트 조회 실패:', profileError);
    return;
  }

  console.log(`현재 포인트: ${profile.current_points.toLocaleString()}P\n`);

  const testCost = 100;
  const newBalance = profile.current_points - testCost;

  console.log('2. 포인트 차감 테스트...');
  const { error: updateError } = await supabase
    .from('juwoo_profile')
    .update({ current_points: newBalance })
    .eq('id', 1);

  if (updateError) {
    console.error('❌ 포인트 차감 실패:', updateError);
    return;
  }
  console.log('✅ 포인트 차감 성공\n');

  console.log('3. 거래 내역 추가 테스트 (point_transactions)...');
  const { error: transactionError } = await supabase
    .from('point_transactions')
    .insert({
      juwoo_id: 1,
      rule_id: null,
      point_amount: -testCost,
      balance_after: newBalance,
      description: '[테스트] 구매 테스트',
      is_cancelled: false,
    });

  if (transactionError) {
    console.error('❌ 거래 내역 추가 실패:', transactionError);
    
    // 롤백
    await supabase
      .from('juwoo_profile')
      .update({ current_points: profile.current_points })
      .eq('id', 1);
    console.log('포인트 롤백 완료');
    return;
  }
  console.log('✅ 거래 내역 추가 성공\n');

  console.log('4. 구매 내역 추가 테스트...');
  const { error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      juwoo_id: 1,
      item_id: 151,
      point_cost: testCost,
      status: 'approved',
      note: '테스트 구매',
      approved_at: new Date().toISOString(),
    });

  if (purchaseError) {
    console.error('❌ 구매 내역 추가 실패:', purchaseError);
    
    // 롤백
    await supabase
      .from('juwoo_profile')
      .update({ current_points: profile.current_points })
      .eq('id', 1);
    console.log('포인트 롤백 완료');
    return;
  }
  console.log('✅ 구매 내역 추가 성공\n');

  console.log('✅ 모든 테스트 성공!');
  console.log(`최종 포인트: ${newBalance.toLocaleString()}P`);
  
  // 테스트 데이터 정리
  console.log('\n테스트 데이터 롤백 중...');
  await supabase
    .from('juwoo_profile')
    .update({ current_points: profile.current_points })
    .eq('id', 1);
  console.log('롤백 완료');
}

testPurchase();
