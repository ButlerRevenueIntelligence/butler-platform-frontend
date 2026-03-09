import React from "react";

export default function ExecutiveBriefing({ text }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 800,
            color: "rgba(226,232,240,0.84)",
          }}
        >
          Executive Summary
        </div>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#dbeafe",
            border: "1px solid rgba(96,165,250,0.22)",
            background: "rgba(59,130,246,0.12)",
          }}
        >
          AI Briefing
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 16,
            lineHeight: 1.75,
            color: "#e5edf8",
          }}
        >
          {text}
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <button
            style={{
              border: "none",
              borderRadius: 12,
              padding: "10px 14px",
              background: "#ffffff",
              color: "#000",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Generate Board Report
          </button>

          <button
            style={{
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 12,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Run AI Analysis
          </button>

          <button
            style={{
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 12,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Simulate Forecast
          </button>
        </div>
      </div>
    </div>
  );
}