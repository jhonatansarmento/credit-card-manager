'use client';

import { formatCurrency } from '@/lib/format';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryDonutChartProps {
  data: {
    categoryName: string;
    emoji: string;
    color: string;
    totalAmount: number;
  }[];
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const chartData = data.map((item) => ({
    name: `${item.emoji} ${item.categoryName}`,
    value: item.totalAmount,
    color: item.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
