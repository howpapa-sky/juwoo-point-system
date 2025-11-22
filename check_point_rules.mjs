import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('point_rules 테이블 샘플 조회...');
  const { data, error } = await supabase
    .from('point_rules')
    .select('*')
    .limit(3);

  if (error) {
    console.error('조회 오류:', error);
  } else {
    console.log('샘플 데이터:', data);
    if (data && data.length > 0) {
      console.log('\n컬럼 목록:', Object.keys(data[0]));
    }
  }
}

checkSchema();
