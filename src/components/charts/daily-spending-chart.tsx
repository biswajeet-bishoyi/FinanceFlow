"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type DailyData = {
  day: string; // e.g. "Mon"
  amount: number; // in minor units
  isToday: boolean;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const amount = data.amount / 100;
    return (
      <div className="bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg shadow-lg flex flex-col gap-1 items-center">
        <span className="font-label-caps text-label-caps opacity-80">{data.day}</span>
        <span className="font-currency-sm text-currency-sm font-bold">₹{amount.toFixed(2)}</span>
      </div>
    );
  }
  return null;
};

export function DailySpendingChart({ data }: { data: DailyData[] }) {
  const maxAmount = Math.max(...data.map(d => d.amount));

  return (
    <div className="w-full h-32 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-outline)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            dy={10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isToday ? "var(--color-primary)" : "var(--color-chart-muted)"}
                className={entry.isToday ? "shadow-md" : "hover:opacity-80 transition-opacity cursor-pointer"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
