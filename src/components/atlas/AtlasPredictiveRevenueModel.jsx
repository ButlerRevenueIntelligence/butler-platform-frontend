import React, { useMemo } from "react";

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const moneyCompact = (num) => {
  const n = safeNum(num);
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

function normalizeStage(stage) {
  const s = String(stage || "").toLowerCase();
  if (s.includes("disc")) return "Discovery";
  if (s.includes("prop")) return "Proposal";
  if (s.includes("follow")) return "Follow-Up";
  if (s.includes("neg")) return "Negotiation";
  if (s.includes("won")) return "Closed Won";
  if (s.includes("lost")) return "Closed Lost";
  return stage || "Unknown";
}

function computeModel({ deals = [], metrics = [], kpis }) {
  const activeDeals = deals.filter((d) => {
    const stage = normalizeStage(d?.stage || d?.status);
    return stage !== "Closed Won" && stage !== "Closed Lost";
  });

  const weightedPipeline = activeDeals.reduce((sum, d) => {
    const amount = safeNum(d?.amount ?? d?.value ?? d?.pipelineValue);
    const prob = safeNum(d?.probability) / 100 || 0.35;
    return sum + amount * prob;
  }, 0);

  const negotiationValue = activeDeals
    .filter((d) => normalizeStage(d?.stage || d?.status) === "Negotiation")
    .reduce((sum, d) => sum + safeNum(d?.amount ?? d?.value ?? d?.pipelineValue), 0);

  const proposalValue = activeDeals
    .filter((d) => normalizeStage(d?.stage || d?.status) === "Proposal")
    .reduce((sum, d) => sum + safeNum(d?.amount ?? d?.value ?? d?.pipelineValue), 0);

  const avgRecentRevenue =
    Array.isArray(metrics) && metrics.length
      ? metrics.reduce((sum, m) => sum + safeNum(m?.revenue), 0) / metrics.length
      : safeNum(kpis?.revenue30) / 30 || 0;

  const baselineQuarterRevenue = avgRecentRevenue * 90;
  const projectedRevenue = Math.round(baselineQuarterRevenue * 0.45 + weightedPipeline * 0.55);

  let confidence = 72;
  let primaryRisk = "Pipeline volatility";
  let guidance = "Protect late-stage deal movement and continue strengthening coverage.";

  const coverage = safeNum(kpis?.coverage);
  if (coverage >= 4) confidence += 12;
  else if (coverage >= 2) confidence += 6;
  else confidence -= 10;

  if (negotiationValue > projectedRevenue * 0.4) {
    primaryRisk = "Deal concentration";
    guidance = "Too much forecast depends on a narrow late-stage cluster. Diversify the near-term pipeline.";
    confidence -= 8;
  } else if (proposalValue > negotiationValue) {
    primaryRisk = "Stage progression friction";
    guidance = "Large proposal-stage volume needs tighter progression into negotiation and commit.";
    confidence -= 4;
  } else if (coverage >= 4) {
    primaryRisk = "Manageable execution risk";
    guidance = "Forecast protection is solid. Focus on closing discipline and keeping momentum consistent.";
  }

  confidence = Math.max(48, Math.min(93, Math.round(confidence)));

  const upsideCase = Math.round(projectedRevenue * 1.12);
  const downsideCase = Math.round(projectedRevenue * 0.88);

  return {
    projectedRevenue,
    confidence,
    primaryRisk,
    guidance,
    weightedPipeline,
    upsideCase,
    downsideCase,
  };
}

function confidenceTone(confidence) {
  if (confidence >= 85) return { color: "#86efac", bg: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.22)" };
  if (confidence >= 70) return { color: "#fde68a", bg: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.22)" };
  return { color: "#fca5a5", bg: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.22)" };
}

export default function AtlasPredictiveRevenueModel({ deals = [], metrics = [], kpis }) {
  const model = useMemo(() => computeModel({ deals, metrics, kpis }), [deals, metrics, kpis]);
  const tone = confidenceTone(model.confidence);

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(135deg, rgba(56,189,248,0.10), rgba(124,92,255,0.08), rgba(255,255,255,0.02))",
        padding: 18,
        boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1.1,
              textTransform: "uppercase",
              color: "rgba(125,211,252,0.92)",
            }}
          >
            Atlas Predictive Revenue Model
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 32,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -0.4,
            }}
          >
            {moneyCompact(model.projectedRevenue)}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.65,
              color: "rgba(226,232,240,0.86)",
              maxWidth: 780,
            }}
          >
            Atlas estimates this as the likely next-quarter revenue outcome based on recent
            revenue movement, weighted pipeline, stage mix, and forecast protection.
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: 999,
            background: tone.bg,
            border: tone.border,
            color: tone.color,
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          Confidence: {model.confidence}%
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <div
          style={{
            borderRadius: 16,
            padding: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(148,163,184,0.82)" }}>
            Weighted Pipeline
          </div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "#fff" }}>
            {moneyCompact(model.weightedPipeline)}
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            padding: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(148,163,184,0.82)" }}>
            Upside Case
          </div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "#86efac" }}>
            {moneyCompact(model.upsideCase)}
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            padding: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(148,163,184,0.82)" }}>
            Downside Case
          </div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "#fca5a5" }}>
            {moneyCompact(model.downsideCase)}
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            padding: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(148,163,184,0.82)" }}>
            Primary Risk
          </div>
          <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            {model.primaryRisk}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
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
            color: "rgba(148,163,184,0.82)",
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Atlas Guidance
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#dbe7f5",
          }}
        >
          {model.guidance}
        </div>
      </div>
    </div>
  );
}