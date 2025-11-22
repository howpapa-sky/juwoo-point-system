import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('오류:', error);
  } else {
    console.log('샘플 데이터:', data);
    if (data && data.length > 0) {
      console.log('\n컬럼 목록:', Object.keys(data[0]));
    }
  }
}

checkSchema();
