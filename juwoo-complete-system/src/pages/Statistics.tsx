// src/pages/Statistics.tsx
// 통계 대시보드 메인 페이지

import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import { StatisticsFilterComponent } from '../components/statistics/StatisticsFilter';
import { StatisticsOverview } from '../components/statistics/StatisticsOverview';
import { PointsTrendChart } from '../components/statistics/PointsTrendChart';
import { CategoryDistribution } from '../components/statistics/CategoryDistribution';
import { UserRankingComponent } from '../components/statistics/UserRanking';
import { RecentTransactions } from '../components/statistics/RecentTransactions';
import {
  getOverviewStatistics,
  getDailyStatistics,
  getCategoryStatistics,
  getUserRanking,
  getRecentTransactions,
  subscribeToTransactions
} from '../services/statisticsService';
import type {
  StatisticsFilter,
  OverviewStatistics,
  DailyStatistics,
  CategoryStatistics,
  UserRanking,
  PointTransaction
} from '../types/statistics';

export const Statistics: React.FC = () => {
  // 필터 상태
  const [filter, setFilter] = useState<StatisticsFilter>({
    timeRange: 'week',
    type: 'all'
  });

  // 데이터 상태
  const [overviewData, setOverviewData] = useState<OverviewStatistics>({
    totalEarned: 0,
    totalSpent: 0,
    netPoints: 0,
    totalTransactions: 0,
    activeUsers: 0,
    topCategory: 'N/A'
  });
  const [dailyData, setDailyData] = useState<DailyStatistics[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStatistics[]>([]);
  const [rankingData, setRankingData] = useState<UserRanking[]>([]);
  const [transactionData, setTransactionData] = useState<PointTransaction[]>([]);

  // 로딩 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드 함수
  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, daily, category, ranking, transactions] = await Promise.all([
        getOverviewStatistics(filter),
        getDailyStatistics(filter),
        getCategoryStatistics(filter),
        getUserRanking(10),
        getRecentTransactions(20)
      ]);

      setOverviewData(overview);
      setDailyData(daily);
      setCategoryData(category);
      setRankingData(ranking);
      setTransactionData(transactions);
    } catch (err) {
      console.error('통계 데이터 로드 실패:', err);
      setError('통계 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 최근 거래만 새로고침
  const refreshTransactions = async () => {
    try {
      const transactions = await getRecentTransactions(20);
      setTransactionData(transactions);
    } catch (err) {
      console.error('거래 내역 새로고침 실패:', err);
    }
  };

  // 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    loadStatistics();
  }, [filter.timeRange, filter.type, filter.category]);

  // 실시간 거래 구독
  useEffect(() => {
    const unsubscribe = subscribeToTransactions((newTransaction) => {
      setTransactionData((prev) => [newTransaction, ...prev].slice(0, 20));
      // 새 거래 발생 시 개요 통계도 업데이트
      loadStatistics();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">통계 대시보드</h1>
              <p className="text-sm text-gray-600 mt-1">
                포인트 시스템의 전체적인 통계와 분석을 확인하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">오류 발생</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={loadStatistics}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 필터 */}
        <StatisticsFilterComponent filter={filter} onFilterChange={setFilter} />

        {/* 개요 통계 */}
        <StatisticsOverview statistics={overviewData} loading={loading} />

        {/* 포인트 추이 차트 */}
        <PointsTrendChart data={dailyData} loading={loading} />

        {/* 카테고리 분포 */}
        <CategoryDistribution data={categoryData} loading={loading} />

        {/* 하단 그리드: 랭킹 + 최근 거래 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserRankingComponent data={rankingData} loading={loading} />
          <RecentTransactions
            data={transactionData}
            loading={loading}
            onRefresh={refreshTransactions}
          />
        </div>
      </div>

      {/* 푸터 */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            © 2025 주우 포인트 시스템. 실시간으로 업데이트되는 통계를 확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
