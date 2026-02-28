'use client';

import { formatCurrency } from '@/lib/format';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ProjectionChartProps {
  data: { month: string; pending: number; cumulative: number }[];
}

export function ProjectionChart({ data }: ProjectionChartProps) {
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split('-');
    return {
      ...item,
      label: `${month}/${year}`,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="label"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(Number(value)),
            name === 'pending' ? 'No Mês' : 'Acumulado',
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Area
          type="monotone"
          dataKey="pending"
          name="pending"
          stroke="hsl(0 84.2% 60.2%)"
          fill="hsl(0 84.2% 60.2% / 0.2)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          name="cumulative"
          stroke="hsl(221.2 83.2% 53.3%)"
          fill="hsl(221.2 83.2% 53.3% / 0.2)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
