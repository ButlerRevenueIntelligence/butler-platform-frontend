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

function buildTimeline({ metrics = [], deals = [], channelChart = [], kpis }) {
  const items = [];

  if (Array.isArray(metrics) && metrics.length >= 2) {
    const latest = metrics[metrics.length - 1];
    const prev = metrics[metrics.length - 2];

    const revenueDelta = safeNum(latest?.revenue) - safeNum(prev?.revenue);
    if (revenueDelta !== 0) {
      items.push({
        type: revenueDelta > 0 ? "positive" : "warning",
        title: revenueDelta > 0 ? "Revenue increased" : "Revenue softened",
        meta: latest?.x || "Latest period",
        body:
          revenueDelta > 0
            ? `Tracked revenue increased by ${moneyCompact(revenueDelta)} compared with the previous period.`
            : `Tracked revenue declined by ${moneyCompact(Math.abs(revenueDelta))} compared with the previous period.`,
      });
    }

    const leadsDelta = safeNum(latest?.leads) - safeNum(prev?.leads);
    if (leadsDelta !== 0) {
      items.push({
        type: leadsDelta > 0 ? "positive" : "watch",
        title: leadsDelta > 0 ? "Lead volume moved up" : "Lead volume slowed",
        meta: latest?.x || "Latest period",
        body:
          leadsDelta > 0
            ? `Lead creation increased by ${leadsDelta} in the latest tracked period.`
            : `Lead creation decreased by ${Math.abs(leadsDelta)} in the latest tracked period.`,
      });
    }
  }

  const negotiationDeals = deals.filter((d) =>
    normalizeStage(d?.stage || d?.status) === "Negotiation"
  );

  if (negotiationDeals.length) {
    const totalNegotiationValue = negotiationDeals.reduce(
      (sum, d) => sum + safeNum(d?.amount ?? d?.value ?? d?.pipelineValue),
      0
    );

    items.push({
      type: "watch",
      title: "Late-stage deal concentration",
      meta: "Deal movement",
      body: `${negotiationDeals.length} deals are currently in negotiation representing ${moneyCompact(
        totalNegotiationValue
      )} of near-term pipeline influence.`,
    });
  }

  if (Array.isArray(channelChart) && channelChart.length) {
    const topChannel = channelChart[0];
    items.push({
      type: "positive",
      title: "Top channel signal",
      meta: "Growth activity",
      body: `${topChannel.channel} is leading attributed revenue with ${moneyCompact(
        topChannel.revenue
      )} in tracked contribution.`,
    });
  }

  if (safeNum(kpis?.coverage) > 0) {
    items.push({
      type: safeNum(kpis.coverage) >= 4 ? "positive" : safeNum(kpis.coverage) >= 2 ? "watch" : "warning",
      title: "Coverage update",
      meta: "Forecast protection",
      body:
        safeNum(kpis.coverage) >= 4
          ? `Pipeline coverage is strong at ${kpis.coverage.toFixed(1)}x.`
          : safeNum(kpis.coverage) >= 2
          ? `Pipeline coverage is ${kpis.coverage.toFixed(1)}x and still has room to improve.`
          : `Pipeline coverage is only ${kpis.coverage.toFixed(1)}x and needs immediate attention.`,
    });
  }

  return items.slice(0, 6);
}

function toneStyle(type) {
  if (type === "positive") {
    return {
      line: "#22c55e",
      badgeBg: "rgba(34,197,94,0.14)",
      badgeColor: "#86efac",
      cardBg: "rgba(34,197,94,0.05)",
      border: "1px solid rgba(34,197,94,0.16)",
    };
  }

  if (type === "warning") {
    return {
      line: "#ef4444",
      badgeBg: "rgba(239,68,68,0.14)",
      badgeColor: "#fca5a5",
      cardBg: "rgba(239,68,68,0.05)",
      border: "1px solid rgba(239,68,68,0.16)",
    };
  }

  return {
    line: "#f59e0b",
    badgeBg: "rgba(245,158,11,0.14)",
    badgeColor: "#fde68a",
    cardBg: "rgba(245,158,11,0.05)",
    border: "1px solid rgba(245,158,11,0.16)",
  };
}

export default function AtlasRevenueTimeline({
  metrics = [],
  deals = [],
  channelChart = [],
  kpis,
}) {
  const timeline = useMemo(
    () => buildTimeline({ metrics, deals, channelChart, kpis }),
    [metrics, deals, channelChart, kpis]
  );

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(135deg, rgba(124,92,255,0.10), rgba(56,189,248,0.06), rgba(255,255,255,0.02))",
        padding: 18,
        boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: 1.1,
          textTransform: "uppercase",
          color: "rgba(196,181,253,0.92)",
          marginBottom: 14,
        }}
      >
        Atlas Revenue Timeline
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {timeline.map((item, idx) => {
          const tone = toneStyle(item.type);

          return (
            <div
              key={`${item.title}-${idx}`}
              style={{
                display: "grid",
                gridTemplateColumns: "18px 1fr",
                gap: 12,
                alignItems: "stretch",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 3,
                    borderRadius: 999,
                    background: tone.line,
                    boxShadow: `0 0 10px ${tone.line}`,
                  }}
                />
              </div>

              <div
                style={{
                  borderRadius: 16,
                  padding: 14,
                  background: tone.cardBg,
                  border: tone.border,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "5px 9px",
                      borderRadius: 999,
                      background: tone.badgeBg,
                      color: tone.badgeColor,
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.meta}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: "#dbe7f5",
                  }}
                >
                  {item.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}