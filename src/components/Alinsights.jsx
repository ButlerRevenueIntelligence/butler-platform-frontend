import React from "react";

export default function AiInsights({ insights = [] }) {
  const S = {
    card: {
      padding: 16,
      borderRadius: 14,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)"
    },
    title: {
      fontWeight: 900,
      marginBottom: 10
    },
    item: {
      marginBottom: 8,
      fontSize: 13,
      opacity: 0.9
    }
  };

  return (
    <div style={S.card}>
      <div style={S.title}>AI Insights</div>
      {insights.map((i, idx) => (
        <div key={idx} style={S.item}>
          • {i}
        </div>
      ))}
    </div>
  );
}