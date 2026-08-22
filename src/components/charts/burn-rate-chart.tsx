"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";

type BurnRateData = {
  day: number;
  date: string;
  idealBalance: number;
  actualBalance: number;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const ideal = payload[0]?.value / 100;
    const actual = payload[1]?.value / 100;
    return (
      <div className="bg-surface-container-highest p-3 rounded-xl shadow-lg border border-surface-container-high">
        <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">DAY {label}</p>
        <div className="flex justify-between gap-4 font-body-sm text-body-sm mb-1">
          <span className="text-secondary font-medium">Target</span>
          <span>₹{ideal?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between gap-4 font-body-sm text-body-sm">
          <span className="text-primary font-medium">Actual</span>
          <span className={actual < ideal ? 'text-error font-bold' : ''}>₹{actual?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function BurnRateChart({ data }: { data: BurnRateData[] }) {

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#76777d', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
            minTickGap={20}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#76777d', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(val) => `₹${Math.round(val / 100)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Area type="stepAfter" dataKey="actualBalance" stroke="transparent" fill="url(#colorActual)" />
          <Line type="monotone" dataKey="idealBalance" stroke="#006c49" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
          <Line type="stepAfter" dataKey="actualBalance" stroke="#000000" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#000000", stroke: "#fff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
