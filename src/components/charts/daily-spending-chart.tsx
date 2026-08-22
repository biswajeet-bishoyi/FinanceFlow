"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type DailyData = {
  day: string; // e.g. "Mon"
  amount: number; // in minor units
  isToday: boolean;
};

export function DailySpendingChart({ data }: { data: DailyData[] }) {
  const maxAmount = Math.max(...data.map(d => d.amount));
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const amount = payload[0].value / 100;
      return (
        <div className="bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg shadow-lg font-currency-sm text-currency-sm">
          ${amount.toFixed(2)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-32 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#76777d', fontSize: 10, fontFamily: 'JetBrains Mono' }} // outline color and label-caps
            dy={10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isToday ? "#000000" : "#e5eeff"} // primary vs surface-container
                className={entry.isToday ? "shadow-md" : "hover:fill-[#bec6e0] transition-colors cursor-pointer"} // primary-fixed-dim on hover
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
