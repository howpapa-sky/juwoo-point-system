// 영어 학습 포인트 헬퍼 — 일일 상한 관리
import { supabase } from './supabaseClient';
import { adjustPoints } from './pointsHelper';

// 포인트 상한 설정
const DAILY_CAPS: Record<string, number> = {
  learn: 600,       // 만나기: 200pt × 3회
  practice: 1500,   // 연습: 300~500pt × 3~5회
  review: 400,      // 복습: 200pt × 2회
  mistake_goal: 100, // 실수 목표 달성: 100pt × 1회
};

// 오늘 특정 카테고리에서 적립한 포인트 합계 조회
async function getTodayEarned(category: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('point_transactions')
    .select('amount')
    .eq('juwoo_id', 1)
    .gte('created_at', today.toISOString())
    .like('note', `%[영어-${category}]%`)
    .gt('amount', 0);

  if (error) {
    console.error('포인트 조회 에러:', error);
    return 0;
  }

  return (data ?? []).reduce((sum, row) => sum + (row.amount ?? 0), 0);
}

// 상한 체크 후 포인트 적립
export async function awardLearningPoints(params: {
  category: 'learn' | 'practice' | 'review' | 'mistake_goal' | 'mistake_friend_master';
  basePoints: number;
  note: string;
}): Promise<{ awarded: number; capped: boolean }> {
  const { category, basePoints, note } = params;

  // 실수 친구 마스터는 제한 없음
  if (category === 'mistake_friend_master') {
    const result = await adjustPoints({
      amount: basePoints,
      note: `[영어-${category}] ${note}`,
    });
    return { awarded: result.success ? basePoints : 0, capped: false };
  }

  const cap = DAILY_CAPS[category] ?? Infinity;
  const todayEarned = await getTodayEarned(category);
  const remaining = Math.max(0, cap - todayEarned);

  if (remaining <= 0) {
    return { awarded: 0, capped: true };
  }

  const actualPoints = Math.min(basePoints, remaining);

  const result = await adjustPoints({
    amount: actualPoints,
    note: `[영어-${category}] ${note}`,
  });

  return {
    awarded: result.success ? actualPoints : 0,
    capped: actualPoints < basePoints,
  };
}

// 별 기반 포인트 계산
export function getStarPoints(stars: number): number {
  if (stars >= 3) return 500;
  if (stars >= 2) return 400;
  return 300;
}

// 별 계산 (정답률 기반)
export function calculateStars(correct: number, total: number): number {
  if (total === 0) return 0;
  const rate = correct / total;
  if (rate >= 0.8) return 3;
  if (rate >= 0.6) return 2;
  return 1;
}
