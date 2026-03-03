// frontend/src/components/RevenueChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({ data = [] }) {
  return (
    <div style={card()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Revenue trend (30 days)</h3>
        <span style={{ opacity: 0.8, fontSize: 12 }}>Revenue • Spend</span>
      </div>

      <div style={{ height: 260, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeOpacity={0.15} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="spend" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function card() {
  return {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
  };
}
