// src/components/statistics/UserRanking.tsx
// 사용자별 포인트 랭킹을 보여주는 컴포넌트

import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import type { UserRanking } from '../../types/statistics';

interface UserRankingProps {
  data: UserRanking[];
  loading?: boolean;
}

export const UserRankingComponent: React.FC<UserRankingProps> = ({
  data,
  loading = false
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center font-bold text-gray-500">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 2:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 3:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">사용자 랭킹</h3>
        </div>
        <div className="py-12 text-center text-gray-500">
          랭킹 데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">사용자 랭킹 TOP 10</h3>
      </div>

      <div className="space-y-3">
        {data.map((user) => (
          <div
            key={user.user_id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
              user.rank <= 3 ? getRankBadgeColor(user.rank) : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {/* 순위 아이콘 */}
            <div className="flex-shrink-0">
              {getRankIcon(user.rank)}
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 truncate">
                  {user.user_name}
                </p>
                {user.rank <= 3 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                  </span>
                )}
              </div>
            </div>

            {/* 포인트 */}
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {user.total_points.toLocaleString()}
                <span className="text-sm font-normal text-gray-500 ml-1">P</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 통계 요약 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">평균 포인트</p>
            <p className="text-lg font-bold text-gray-900">
              {Math.round(data.reduce((sum, u) => sum + u.total_points, 0) / data.length).toLocaleString()}P
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">최고 포인트</p>
            <p className="text-lg font-bold text-yellow-600">
              {data[0]?.total_points.toLocaleString() || 0}P
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">최저 포인트</p>
            <p className="text-lg font-bold text-gray-600">
              {data[data.length - 1]?.total_points.toLocaleString() || 0}P
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
