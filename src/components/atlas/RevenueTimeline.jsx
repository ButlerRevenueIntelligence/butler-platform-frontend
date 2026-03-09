import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const moneyCompact = (n) => {
  const num = Number(n || 0);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num}`;
};

export default function RevenueTimeline({ forecast }) {

  const data = useMemo(() => {

    const base = forecast || 0;

    return [
      { month: "Now", revenue: base * 0.3 },
      { month: "30d", revenue: base * 0.45 },
      { month: "60d", revenue: base * 0.7 },
      { month: "90d", revenue: base },
      { month: "120d", revenue: base * 1.2 },
      { month: "180d", revenue: base * 1.5 }
    ];

  }, [forecast]);

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="month" stroke="#9fb0d0" />
          <YAxis stroke="#9fb0d0" tickFormatter={moneyCompact} />
          <Tooltip formatter={(v)=>moneyCompact(v)} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#38BDF8"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}