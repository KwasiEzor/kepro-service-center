import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  data: Array<{ name: string; total: number }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-brand-red)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-brand-red)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary)" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
            tickFormatter={(value) => `€${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-bg-secondary)', 
              borderColor: 'var(--color-border-primary)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            itemStyle={{ color: 'var(--color-brand-red)' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--color-brand-red)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTotal)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
