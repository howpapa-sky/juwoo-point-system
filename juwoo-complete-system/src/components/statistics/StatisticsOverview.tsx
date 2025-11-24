// src/components/statistics/StatisticsOverview.tsx
// 주요 통계 지표를 보여주는 카드 컴포넌트

import React from 'react';
import { TrendingUp, TrendingDown, Users, Activity, Award, DollarSign } from 'lucide-react';
import type { OverviewStatistics } from '../../types/statistics';

interface StatisticsOverviewProps {
  statistics: OverviewStatistics;
  loading?: boolean;
}

export const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({
  statistics,
  loading = false
}) => {
  const cards = [
    {
      title: '총 적립',
      value: statistics.totalEarned.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      suffix: 'P'
    },
    {
      title: '총 사용',
      value: statistics.totalSpent.toLocaleString(),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      suffix: 'P'
    },
    {
      title: '순 포인트',
      value: statistics.netPoints.toLocaleString(),
      icon: DollarSign,
      color: statistics.netPoints >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: statistics.netPoints >= 0 ? 'bg-blue-50' : 'bg-red-50',
      suffix: 'P'
    },
    {
      title: '총 거래',
      value: statistics.totalTransactions.toLocaleString(),
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      suffix: '건'
    },
    {
      title: '활성 사용자',
      value: statistics.activeUsers.toLocaleString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      suffix: '명'
    },
    {
      title: '인기 카테고리',
      value: statistics.topCategory,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      suffix: ''
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {card.value}
                  {card.suffix && (
                    <span className="text-lg font-normal text-gray-500 ml-1">
                      {card.suffix}
                    </span>
                  )}
                </p>
              </div>
              <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
