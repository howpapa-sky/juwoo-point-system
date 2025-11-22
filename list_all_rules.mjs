import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllRules() {
  const { data, error } = await supabase
    .from('point_rules')
    .select('*')
    .order('id');

  if (error) {
    console.error('조회 오류:', error);
  } else {
    console.log(`총 ${data.length}개 규칙:\n`);
    data.forEach((rule, index) => {
      console.log(`${index + 1}. [ID:${rule.id}] ${rule.name} (${rule.point_amount > 0 ? '+' : ''}${rule.point_amount}P) - ${rule.category}`);
    });
  }
}

listAllRules();
