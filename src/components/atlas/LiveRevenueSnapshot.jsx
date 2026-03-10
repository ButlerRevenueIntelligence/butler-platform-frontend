import React from "react";

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const moneyCompact = (n) => {
  const num = safeNum(n);
  const abs = Math.abs(num);

  if (abs >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${Math.round(num / 1_000)}K`;
  return `$${Math.round(num)}`;
};

function Metric({ label, value, accent }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "rgba(148,163,184,0.88)",
          fontWeight: 800,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 26,
          fontWeight: 900,
          color: accent || "#fff",
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function LiveRevenueSnapshot({
  projectedRevenue = 0,
  pipelineValue = 0,
  dealsAtRisk = 0,
  activeOpportunities = 0,
  forecastConfidence = 91,
}) {
  return (
    <div
      style={{
        borderRadius: 22,
        padding: 18,
        border: "1px solid rgba(96,165,250,0.18)",
        background:
          "linear-gradient(135deg, rgba(18,41,90,0.62), rgba(8,15,34,0.92))",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.24), 0 0 0 1px rgba(59,130,246,0.04)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "auto -80px -100px auto",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(37,99,235,0.14)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "rgba(125,211,252,0.9)",
          fontWeight: 800,
        }}
      >
        Executive Intelligence
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 28,
          lineHeight: 1.05,
          letterSpacing: -0.6,
          fontWeight: 900,
          color: "#ffffff",
        }}
      >
        Live Revenue Snapshot
      </div>

      <div
        style={{
          marginTop: 8,
          maxWidth: 860,
          fontSize: 14,
          lineHeight: 1.6,
          color: "rgba(226,232,240,0.90)",
        }}
      >
        A real-time executive summary of the company’s current revenue position,
        pipeline health, and forecast quality.
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <Metric label="Projected Revenue (90 Days)" value={moneyCompact(projectedRevenue)} accent="#67e8f9" />
        <Metric label="Pipeline Value" value={moneyCompact(pipelineValue)} accent="#93c5fd" />
        <Metric label="Deals At Risk" value={safeNum(dealsAtRisk)} accent="#FB7185" />
        <Metric label="Active Opportunities" value={safeNum(activeOpportunities)} accent="#EAF0FF" />
        <Metric label="Forecast Confidence" value={`${Math.round(safeNum(forecastConfidence))}%`} accent="#22C55E" />
      </div>

      <div
        style={{
          marginTop: 16,
          borderRadius: 16,
          padding: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "rgba(148,163,184,0.88)",
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Atlas AI Insight
        </div>

        <div
          style={{
            fontSize: 14,
            color: "rgba(226,232,240,0.92)",
            lineHeight: 1.65,
          }}
        >
          Atlas AI analysis of your pipeline and market signals suggests the current
          revenue trajectory is stable, with opportunities to increase growth by
          prioritizing high-value deals and reducing pipeline leakage.
        </div>
      </div>
    </div>
  );
}