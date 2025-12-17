import { supabase } from "./supabaseClient";

/**
 * 포인트 거래 서비스
 * 모든 포인트 관련 작업을 처리하는 유틸리티
 */

interface AddPointsResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

/**
 * 현재 포인트 잔액 조회
 */
export async function getCurrentBalance(): Promise<number> {
  const { data, error } = await supabase
    .from("juwoo_profile")
    .select("current_points")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("잔액 조회 오류:", error);
    return 0;
  }

  return data?.current_points || 0;
}

/**
 * 포인트 추가/차감
 * @param amount - 양수면 적립, 음수면 차감
 * @param userId - 로그인한 사용자 ID (Supabase auth user id)
 */
export async function addPoints(
  amount: number,
  userId: string | undefined
): Promise<AddPointsResult> {
  try {
    // 1. user_id가 없으면 에러
    if (!userId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // 2. 현재 잔액 조회
    const currentBalance = await getCurrentBalance();
    const newBalance = currentBalance + amount;

    // 3. 거래 내역 추가
    const { error: txError } = await supabase
      .from("point_transactions")
      .insert({
        amount: amount,
        user_id: userId,
      });

    if (txError) {
      console.error("거래 추가 오류:", txError);
      return {
        success: false,
        error: txError.message,
      };
    }

    // 4. 잔액 업데이트
    const { error: updateError } = await supabase
      .from("juwoo_profile")
      .update({ current_points: newBalance })
      .eq("id", 1);

    if (updateError) {
      console.error("잔액 업데이트 오류:", updateError);
      return {
        success: false,
        error: updateError.message,
      };
    }

    return {
      success: true,
      newBalance,
    };
  } catch (error: any) {
    console.error("포인트 처리 오류:", error);
    return {
      success: false,
      error: error.message || "알 수 없는 오류",
    };
  }
}

/**
 * 최근 거래 내역 조회
 * @param limit - 조회할 개수
 */
export async function getRecentTransactions(limit: number = 10) {
  const { data, error } = await supabase
    .from("point_transactions")
    .select("id, amount, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("거래 내역 조회 오류:", error);
    return [];
  }

  return data || [];
}
