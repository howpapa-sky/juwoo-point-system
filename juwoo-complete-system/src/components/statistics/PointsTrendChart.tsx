// src/components/statistics/PointsTrendChart.tsx
// 시간별 포인트 적립/사용 추이를 보여주는 차트

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { DailyStatistics } from '../../types/statistics';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PointsTrendChartProps {
  data: DailyStatistics[];
  loading?: boolean;
}

export const PointsTrendChart: React.FC<PointsTrendChartProps> = ({
  data,
  loading = false
}) => {
  // 데이터를 차트에 맞게 변환
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'M/d', { locale: ko })
  })).reverse(); // 오래된 날짜부터 표시

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}P
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">포인트 추이</h3>
        </div>
        <div className="h-80 flex items-center justify-center text-gray-500">
          데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">포인트 추이</h3>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          <Area
            type="monotone"
            dataKey="earned"
            fill="#10b981"
            fillOpacity={0.1}
            stroke="none"
          />
          <Area
            type="monotone"
            dataKey="spent"
            fill="#ef4444"
            fillOpacity={0.1}
            stroke="none"
          />
          
          <Line
            type="monotone"
            dataKey="earned"
            stroke="#10b981"
            strokeWidth={2}
            name="적립"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="spent"
            stroke="#ef4444"
            strokeWidth={2}
            name="사용"
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="순 포인트"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
