import React from "react";

export default function KpiTiles({ items = [] }) {
  const S = {
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 12,
      marginBottom: 16
    },
    card: {
      padding: 16,
      borderRadius: 14,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)"
    },
    label: {
      fontSize: 12,
      opacity: 0.7
    },
    value: {
      fontSize: 22,
      fontWeight: 800,
      marginTop: 6
    }
  };

  return (
    <div style={S.grid}>
      {items.map((k) => (
        <div key={k.label} style={S.card}>
          <div style={S.label}>{k.label}</div>
          <div style={S.value}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}