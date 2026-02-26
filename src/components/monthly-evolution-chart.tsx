'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency } from '@/lib/format';

interface MonthlyEvolutionChartProps {
  data: { month: string; paid: number; pending: number }[];
}

export function MonthlyEvolutionChart({ data }: MonthlyEvolutionChartProps) {
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split('-');
    return {
      ...item,
      label: `${month}/${year}`,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formattedData}>
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
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Bar
          dataKey="paid"
          name="Pago"
          fill="hsl(142.1 76.2% 36.3%)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="pending"
          name="Pendente"
          fill="hsl(0 84.2% 60.2%)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
