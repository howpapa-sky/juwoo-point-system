// src/components/statistics/RecentTransactions.tsx
// 최근 포인트 거래 내역을 실시간으로 보여주는 컴포넌트

import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import type { PointTransaction } from '../../types/statistics';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RecentTransactionsProps {
  data: PointTransaction[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  data,
  loading = false,
  onRefresh
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'earn' ? (
      <TrendingUp className="w-5 h-5 text-green-600" />
    ) : (
      <TrendingDown className="w-5 h-5 text-red-600" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'earn'
      ? 'text-green-600 bg-green-50'
      : 'text-red-600 bg-red-50';
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'M월 d일 HH:mm', { locale: ko });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">최근 거래</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="새로고침"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          최근 거래 내역이 없습니다
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {data.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              {/* 타입 아이콘 */}
              <div className={`flex-shrink-0 p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                {getTransactionIcon(transaction.type)}
              </div>

              {/* 거래 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {transaction.category || '기타'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {transaction.description || '설명 없음'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatRelativeTime(transaction.created_at)}
                    </p>
                  </div>

                  {/* 포인트 금액 */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xl font-bold ${
                      transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earn' ? '+' : '-'}
                      {transaction.amount.toLocaleString()}
                      <span className="text-sm font-normal ml-1">P</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 더보기 버튼 (옵션) */}
      {data.length >= 20 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            더 보기
          </button>
        </div>
      )}
    </div>
  );
};
