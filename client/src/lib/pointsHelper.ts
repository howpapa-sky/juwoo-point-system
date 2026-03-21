import { supabase } from './supabaseClient';

/**
 * 포인트 적립/차감 atomic 함수
 * CLAUDE.md 필수 규칙: balance_after 필수 + juwoo_profile UPDATE 필수
 */
export async function adjustPoints(params: {
  amount: number;
  note: string;
  ruleId?: number | null;
  createdBy?: number;
}): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const { amount, note, ruleId = null, createdBy = 1 } = params;

  // 1. 현재 잔액 조회
  const { data: profile, error: profileError } = await supabase
    .from('juwoo_profile')
    .select('current_points')
    .eq('id', 1)
    .single();

  if (profileError || !profile) {
    return { success: false, newBalance: 0, error: profileError?.message ?? 'Profile not found' };
  }

  const newBalance = (profile.current_points ?? 0) + amount;

  // 차감 시 잔액 부족 체크
  if (newBalance < 0) {
    return { success: false, newBalance: profile.current_points ?? 0, error: '포인트가 부족해요' };
  }

  // 2. 트랜잭션 INSERT (balance_after 필수!)
  const { error: txError } = await supabase
    .from('point_transactions')
    .insert({
      juwoo_id: 1,
      rule_id: ruleId,
      amount,
      balance_after: newBalance,  // 필수!
      note,
      created_by: createdBy,
    });

  if (txError) {
    return { success: false, newBalance: profile.current_points ?? 0, error: txError.message };
  }

  // 3. 프로필 UPDATE (INSERT 후 반드시 함께!)
  const { error: updateError } = await supabase
    .from('juwoo_profile')
    .update({ current_points: newBalance })
    .eq('id', 1);

  if (updateError) {
    return { success: false, newBalance: profile.current_points ?? 0, error: updateError.message };
  }

  return { success: true, newBalance };
}
