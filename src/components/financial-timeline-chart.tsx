'use client';

import { formatCurrency } from '@/lib/format';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TimelineDataPoint {
  month: string;
  paid: number;
  pending: number;
}

interface FinancialTimelineChartProps {
  data: TimelineDataPoint[];
}

export function FinancialTimelineChart({ data }: FinancialTimelineChartProps) {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let cumulative = 0;
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split('-');
    const total = item.paid + item.pending;
    cumulative += total;
    const isFuture = item.month > currentMonthKey;
    const isCurrent = item.month === currentMonthKey;

    return {
      ...item,
      label: `${month}/${year}`,
      total,
      cumulative,
      isFuture,
      isCurrent,
    };
  });

  // Find the index of the current month for the reference line
  const currentIndex = formattedData.findIndex((d) => d.isCurrent);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="label"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          formatter={(value, name) => {
            const labels: Record<string, string> = {
              paid: 'Pago',
              pending: 'Pendente',
              cumulative: 'Acumulado',
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
        <Legend
          formatter={(value: string) =>
            value === 'paid'
              ? 'Pago'
              : value === 'pending'
                ? 'Pendente'
                : 'Acumulado'
          }
        />
        {currentIndex >= 0 && (
          <ReferenceLine
            x={formattedData[currentIndex].label}
            stroke="hsl(var(--foreground))"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
            yAxisId="left"
            label={{
              value: 'Hoje',
              position: 'top',
              fontSize: 11,
              fill: 'hsl(var(--muted-foreground))',
            }}
          />
        )}
        <Bar
          yAxisId="left"
          dataKey="paid"
          name="paid"
          stackId="expenses"
          radius={[0, 0, 0, 0]}
        >
          {formattedData.map((entry, index) => (
            <Cell
              key={`paid-${index}`}
              fill="hsl(142.1 76.2% 36.3%)"
              fillOpacity={entry.isFuture ? 0.35 : 1}
            />
          ))}
        </Bar>
        <Bar
          yAxisId="left"
          dataKey="pending"
          name="pending"
          stackId="expenses"
          radius={[4, 4, 0, 0]}
        >
          {formattedData.map((entry, index) => (
            <Cell
              key={`pending-${index}`}
              fill="hsl(0 84.2% 60.2%)"
              fillOpacity={entry.isFuture ? 0.35 : 1}
            />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulative"
          name="cumulative"
          stroke="hsl(221.2 83.2% 53.3%)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
