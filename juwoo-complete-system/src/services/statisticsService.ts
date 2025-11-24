// src/services/statisticsService.ts
// Supabase를 사용한 통계 데이터 조회 서비스

import { supabase } from '../lib/supabase';
import type {
  DailyStatistics,
  CategoryStatistics,
  UserRanking,
  OverviewStatistics,
  PointTransaction,
  StatisticsFilter
} from '../types/statistics';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

/**
 * 날짜 범위를 계산하는 헬퍼 함수
 */
export function getDateRange(timeRange: StatisticsFilter['timeRange']): { startDate: Date; endDate: Date } {
  const endDate = endOfDay(new Date());
  let startDate: Date;

  switch (timeRange) {
    case 'today':
      startDate = startOfDay(new Date());
      break;
    case 'week':
      startDate = startOfDay(subDays(new Date(), 7));
      break;
    case 'month':
      startDate = startOfDay(subDays(new Date(), 30));
      break;
    case 'year':
      startDate = startOfDay(subDays(new Date(), 365));
      break;
    default:
      startDate = startOfDay(subDays(new Date(), 7));
  }

  return { startDate, endDate };
}

/**
 * 개요 통계 데이터 조회
 */
export async function getOverviewStatistics(filter: StatisticsFilter): Promise<OverviewStatistics> {
  const { startDate, endDate } = filter.startDate && filter.endDate 
    ? { startDate: filter.startDate, endDate: filter.endDate }
    : getDateRange(filter.timeRange);

  // 포인트 거래 데이터 조회
  const { data: transactions, error } = await supabase
    .from('point_transactions')
    .select('amount, type, category')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error) throw error;

  const totalEarned = transactions
    ?.filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalSpent = transactions
    ?.filter(t => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  // 활성 사용자 수
  const { count: activeUsers } = await supabase
    .from('point_transactions')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // 상위 카테고리
  const categoryStats = transactions?.reduce((acc, t) => {
    if (t.category) {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const topCategory = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

  return {
    totalEarned,
    totalSpent,
    netPoints: totalEarned - totalSpent,
    totalTransactions: transactions?.length || 0,
    activeUsers: activeUsers || 0,
    topCategory
  };
}

/**
 * 일별 포인트 추이 데이터 조회
 */
export async function getDailyStatistics(filter: StatisticsFilter): Promise<DailyStatistics[]> {
  const { startDate, endDate } = filter.startDate && filter.endDate 
    ? { startDate: filter.startDate, endDate: filter.endDate }
    : getDateRange(filter.timeRange);

  const { data, error } = await supabase
    .rpc('get_points_statistics', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });

  if (error) throw error;

  return (data || []).map(item => ({
    date: item.date,
    earned: item.earned,
    spent: item.spent,
    net: item.net
  }));
}

/**
 * 카테고리별 통계 조회
 */
export async function getCategoryStatistics(filter: StatisticsFilter): Promise<CategoryStatistics[]> {
  const { startDate, endDate } = filter.startDate && filter.endDate 
    ? { startDate: filter.startDate, endDate: filter.endDate }
    : getDateRange(filter.timeRange);

  const { data, error } = await supabase
    .rpc('get_category_statistics', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });

  if (error) throw error;

  return data || [];
}

/**
 * 사용자 랭킹 조회
 */
export async function getUserRanking(limit: number = 10): Promise<UserRanking[]> {
  const { data, error } = await supabase
    .rpc('get_user_ranking', { limit_count: limit });

  if (error) throw error;

  return data || [];
}

/**
 * 최근 거래 내역 조회
 */
export async function getRecentTransactions(limit: number = 20): Promise<PointTransaction[]> {
  const { data, error } = await supabase
    .from('point_transactions')
    .select(`
      *,
      users (
        name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

/**
 * 실시간 통계 구독 (Supabase Realtime 사용)
 */
export function subscribeToTransactions(callback: (transaction: PointTransaction) => void) {
  const channel = supabase
    .channel('point_transactions_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'point_transactions'
      },
      (payload) => {
        callback(payload.new as PointTransaction);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * 사용자별 통계 조회
 */
export async function getUserStatistics(userId: string, filter: StatisticsFilter) {
  const { startDate, endDate } = filter.startDate && filter.endDate 
    ? { startDate: filter.startDate, endDate: filter.endDate }
    : getDateRange(filter.timeRange);

  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  const earned = data?.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.amount, 0) || 0;
  const spent = data?.filter(t => t.type === 'spend').reduce((sum, t) => sum + t.amount, 0) || 0;

  return {
    transactions: data || [],
    earned,
    spent,
    net: earned - spent
  };
}
