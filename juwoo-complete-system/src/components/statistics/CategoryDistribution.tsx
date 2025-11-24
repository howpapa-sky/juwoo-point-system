// src/components/statistics/CategoryDistribution.tsx
// 카테고리별 포인트 분포를 보여주는 파이 차트

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { CategoryStatistics } from '../../types/statistics';

interface CategoryDistributionProps {
  data: CategoryStatistics[];
  loading?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({
  data,
  loading = false
}) => {
  const earnData = data
    .filter(item => item.type === 'earn')
    .map((item, index) => ({
      name: item.category,
      value: item.total_amount,
      count: item.transaction_count,
      color: COLORS[index % COLORS.length]
    }));

  const spendData = data
    .filter(item => item.type === 'spend')
    .map((item, index) => ({
      name: item.category,
      value: item.total_amount,
      count: item.transaction_count,
      color: COLORS[index % COLORS.length]
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">
            포인트: {data.value.toLocaleString()}P
          </p>
          <p className="text-sm text-gray-600">
            거래 수: {data.count.toLocaleString()}건
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / entry.payload.reduce((sum: number, item: any) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* 적립 카테고리 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieChartIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">적립 카테고리</h3>
        </div>

        {earnData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            데이터가 없습니다
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={earnData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {earnData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>

            {/* 상세 목록 */}
            <div className="mt-4 space-y-2">
              {earnData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {item.value.toLocaleString()}P
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 사용 카테고리 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieChartIcon className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">사용 카테고리</h3>
        </div>

        {spendData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            데이터가 없습니다
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>

            {/* 상세 목록 */}
            <div className="mt-4 space-y-2">
              {spendData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {item.value.toLocaleString()}P
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
