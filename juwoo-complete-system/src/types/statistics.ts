// src/types/statistics.ts
// 통계 시스템을 위한 타입 정의

export interface User {
  id: string;
  name: string;
  email: string;
  total_points: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earn' | 'spend' | 'adjust';
  category?: string;
  description?: string;
  created_at: string;
}

export interface PointCategory {
  id: string;
  name: string;
  type: 'earn' | 'spend';
  color: string;
  icon?: string;
  created_at: string;
}

// 통계 데이터 타입
export interface DailyStatistics {
  date: string;
  earned: number;
  spent: number;
  net: number;
}

export interface CategoryStatistics {
  category: string;
  total_amount: number;
  transaction_count: number;
  type: 'earn' | 'spend';
}

export interface UserRanking {
  user_id: string;
  user_name: string;
  total_points: number;
  rank: number;
}

export interface OverviewStatistics {
  totalEarned: number;
  totalSpent: number;
  netPoints: number;
  totalTransactions: number;
  activeUsers: number;
  topCategory: string;
}

// 필터 타입
export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface StatisticsFilter {
  timeRange: TimeRange;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: 'earn' | 'spend' | 'all';
}

// 차트 데이터 타입
export interface ChartDataPoint {
  date: string;
  earned: number;
  spent: number;
  net: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}
