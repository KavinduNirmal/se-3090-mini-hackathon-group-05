'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ImpactTrendPoint } from '@/lib/server/admin';

function shortMonth(month: string) {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

interface TrendChartProps {
  data: ImpactTrendPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
          <defs>
            <linearGradient id="trendKg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15803d" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#15803d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="var(--muted-foreground)"
            tickFormatter={shortMonth}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="var(--muted-foreground)"
          />
          <Tooltip
            cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--foreground)',
              fontSize: 12,
              boxShadow: '0 8px 24px rgba(2, 6, 23, 0.12)',
            }}
            labelStyle={{ fontWeight: 700, color: 'var(--foreground)' }}
            labelFormatter={(month) => shortMonth(String(month))}
            formatter={(value, name) => {
              if (name === 'kg') return [`${Number(value ?? 0).toLocaleString()} kg`, 'Rescued'];
              if (name === 'meals') return [`${Number(value ?? 0).toLocaleString()}`, 'Meals'];
              if (name === 'rescues') return [`${Number(value ?? 0).toLocaleString()}`, 'Rescues'];
              return [String(value), String(name)];
            }}
          />
          <Area
            type="monotone"
            dataKey="kg"
            stroke="#15803d"
            strokeWidth={2.5}
            fill="url(#trendKg)"
            dot={{ r: 3, fill: '#15803d', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
