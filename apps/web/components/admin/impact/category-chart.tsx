'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ImpactCategoryStat } from '@/lib/server/admin';

const PALETTE = ['#15803d', '#d97706', '#84cc16', '#0f766e', '#e11d48'];

interface CategoryChartProps {
  data: ImpactCategoryStat[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="var(--muted-foreground)"
          />
          <YAxis
            type="category"
            dataKey="category"
            width={130}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="var(--muted-foreground)"
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--foreground)',
              fontSize: 12,
              boxShadow: '0 8px 24px rgba(2, 6, 23, 0.12)',
            }}
            labelStyle={{ fontWeight: 700, color: 'var(--foreground)' }}
            formatter={(value) => [`${Number(value ?? 0).toLocaleString()} kg`, 'Rescued']}
          />
          <Bar dataKey="kg" radius={[0, 8, 8, 0]} maxBarSize={22}>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
