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

  console.log('삭제할 규칙 조회 중...');
  
  for (const ruleName of rulesToDelete) {
    const { data: existing, error: selectError } = await supabase
      .from('point_rules')
      .select('*')
      .eq('rule_name', ruleName)
      .single();

    if (selectError) {
      console.log(`❌ "${ruleName}" 조회 실패:`, selectError.message);
      continue;
    }

    if (existing) {
      console.log(`찾음: ${existing.rule_name} (ID: ${existing.id}, ${existing.points > 0 ? '+' : ''}${existing.points}P)`);
      
      const { error: deleteError } = await supabase
        .from('point_rules')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.log(`❌ "${ruleName}" 삭제 실패:`, deleteError.message);
      } else {
        console.log(`✅ "${ruleName}" 삭제 완료`);
      }
    } else {
      console.log(`⚠️ "${ruleName}" 찾을 수 없음`);
    }
  }

  console.log('\n삭제 완료!');
}

deleteRules();
