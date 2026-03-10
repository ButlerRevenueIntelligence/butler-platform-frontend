import React from "react";

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const money = (n) =>
  safeNum(n).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

function RiskRow({ title, stage, risk, value, reason }) {
  const color =
    risk === "High" ? "#FB7185" : risk === "Medium" ? "#F59E0B" : "#38BDF8";

  return (
    <div
      style={{
        borderRadius: 14,
        padding: 13,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "rgba(203,213,225,0.78)",
              lineHeight: 1.5,
            }}
          >
            Stage: <strong>{stage}</strong> • Value: <strong>{money(value)}</strong>
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color,
          }}
        >
          {risk}
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 13,
          color: "rgba(219,228,240,0.84)",
          lineHeight: 1.55,
        }}
      >
        {reason}
      </div>
    </div>
  );
}

export default function DealRiskDetectionAI({ deals = [] }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
      }}
    >
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "rgba(148,163,184,0.75)",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            AI Risk Monitoring
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: -0.35,
              color: "#fff",
            }}
          >
            Deal Risk Detection AI
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
            color: "#e2e8f0",
          }}
        >
          {deals.length} flagged
        </div>
      </div>

      <div style={{ padding: 14, display: "grid", gap: 10 }}>
        {deals.length ? (
          deals.map((deal, idx) => (
            <RiskRow
              key={`${deal.title || deal.name}-${idx}`}
              title={deal.title || deal.name}
              stage={deal.stage || "Negotiation"}
              risk={deal.risk || "Watch"}
              value={deal.value || 0}
              reason={deal.reason || "Atlas AI detected elevated risk signals on this opportunity."}
            />
          ))
        ) : (
          <div
            style={{
              fontSize: 13,
              color: "rgba(203,213,225,0.76)",
              lineHeight: 1.6,
            }}
          >
            No high-risk opportunities are currently flagged.
          </div>
        )}
      </div>
    </div>
  );
}