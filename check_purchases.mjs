import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPurchases() {
  console.log('purchases 테이블 샘플 조회...');
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .limit(1);

  if (error) {
    console.error('조회 오류:', error);
  } else {
    console.log('샘플 데이터:', data);
    if (data && data.length > 0) {
      console.log('\n컬럼 목록:', Object.keys(data[0]));
    }
  }

  console.log('\nitem_id null로 삽입 테스트...');
  const { data: insertData, error: insertError } = await supabase
    .from('purchases')
    .insert({
      juwoo_id: 1,
      item_id: null,
      point_cost: 100,
      status: 'pending',
      note: '테스트',
    })
    .select();

  if (insertError) {
    console.error('삽입 오류:', insertError);
  } else {
    console.log('✅ 삽입 성공:', insertData);
    
    // 테스트 데이터 삭제
    if (insertData && insertData.length > 0) {
      await supabase
        .from('purchases')
        .delete()
        .eq('id', insertData[0].id);
      console.log('테스트 데이터 삭제 완료');
    }
  }
}

checkPurchases();
