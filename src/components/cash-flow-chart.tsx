'use client';

import { formatCurrency } from '@/lib/format';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface CashFlowChartProps {
  data: {
    month: string;
    income: number;
    expense: number;
    balance: number;
    isFuture: boolean;
  }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split('-');
    return {
      ...item,
      label: `${month}/${year}`,
    };
  });

  // Calculate cumulative balance
  let cumulative = 0;
  const dataWithCumulative = formattedData.map((item) => {
    cumulative += item.balance;
    return { ...item, cumulative };
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={dataWithCumulative}>
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
          formatter={(value, name) => {
            const labels: Record<string, string> = {
              income: 'Receita',
              expense: 'Despesa',
              cumulative: 'Saldo Acumulado',
            };
            return [
              formatCurrency(Number(value)),
              labels[name as string] ?? name,
            ];
          }}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Bar
          dataKey="income"
          name="income"
          fill="hsl(142.1 76.2% 36.3%)"
          radius={[4, 4, 0, 0]}
          opacity={0.9}
        />
        <Bar
          dataKey="expense"
          name="expense"
          fill="hsl(0 84.2% 60.2%)"
          radius={[4, 4, 0, 0]}
          opacity={0.9}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          name="cumulative"
          stroke="hsl(221.2 83.2% 53.3%)"
          strokeWidth={2}
          dot={{ fill: 'hsl(221.2 83.2% 53.3%)', r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
