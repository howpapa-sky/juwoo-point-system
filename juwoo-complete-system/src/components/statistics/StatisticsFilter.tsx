// src/components/statistics/StatisticsFilter.tsx
// 통계 기간 및 필터를 선택하는 컴포넌트

import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import type { StatisticsFilter, TimeRange } from '../../types/statistics';

interface StatisticsFilterProps {
  filter: StatisticsFilter;
  onFilterChange: (filter: StatisticsFilter) => void;
}

export const StatisticsFilterComponent: React.FC<StatisticsFilterProps> = ({
  filter,
  onFilterChange
}) => {
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'today', label: '오늘' },
    { value: 'week', label: '지난 7일' },
    { value: 'month', label: '지난 30일' },
    { value: 'year', label: '지난 1년' }
  ];

  const typeOptions = [
    { value: 'all', label: '전체' },
    { value: 'earn', label: '적립' },
    { value: 'spend', label: '사용' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">필터</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 기간 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            기간
          </label>
          <select
            value={filter.timeRange}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                timeRange: e.target.value as TimeRange
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 타입 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            타입
          </label>
          <select
            value={filter.type || 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                type: e.target.value === 'all' ? undefined : (e.target.value as 'earn' | 'spend')
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 새로고침 버튼 */}
        <div className="flex items-end">
          <button
            onClick={() => onFilterChange({ ...filter })}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
};
