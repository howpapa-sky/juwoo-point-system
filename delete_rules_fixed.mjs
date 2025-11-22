import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteRules() {
  const rulesToDelete = [
    '수영 30분',
    '운동 경기 참여',
    '동생 돌보기'
  ];

  console.log('삭제할 규칙 조회 중...\n');
  
  for (const ruleName of rulesToDelete) {
    const { data: existing, error: selectError } = await supabase
      .from('point_rules')
      .select('*')
      .eq('name', ruleName);

    if (selectError) {
      console.log(`❌ "${ruleName}" 조회 실패:`, selectError.message);
      continue;
    }

    if (existing && existing.length > 0) {
      const rule = existing[0];
      console.log(`찾음: ${rule.name} (ID: ${rule.id}, ${rule.point_amount > 0 ? '+' : ''}${rule.point_amount}P)`);
      
      const { error: deleteError } = await supabase
        .from('point_rules')
        .delete()
        .eq('id', rule.id);

      if (deleteError) {
        console.log(`❌ "${ruleName}" 삭제 실패:`, deleteError.message);
      } else {
        console.log(`✅ "${ruleName}" 삭제 완료\n`);
      }
    } else {
      console.log(`⚠️ "${ruleName}" 찾을 수 없음\n`);
    }
  }

  console.log('삭제 작업 완료!');
}

deleteRules();
