"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

type CategoryData = {
  name: string;
  amount: number;
  color: string;
};

export function CategoryDonutChart({ data, totalSpent }: { data: CategoryData[], totalSpent: number }) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const amount = payload[0].value / 100;
      return (
        <div className="bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
          <span className="font-body-sm text-body-sm font-medium">{payload[0].name}</span>
          <span className="font-currency-sm text-currency-sm">₹{amount.toFixed(2)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-body-sm text-body-sm text-on-surface-variant">Total</span>
        <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
          ₹{(totalSpent / 100).toFixed(0)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={2}
            dataKey="amount"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
