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

function buildActionCenter({ deals = [], channelChart = [], kpis, metrics = [] }) {
  const activeDeals = deals.filter((d) => {
    const stage = normalizeStage(d?.stage || d?.status);
    return stage !== "Closed Won" && stage !== "Closed Lost";
  });

  const highestRiskDeal = activeDeals
    .filter((d) => safeNum(d?.probability) < 45 || normalizeStage(d?.stage || d?.status) === "Follow-Up")
    .sort(
      (a, b) =>
        safeNum(b?.amount ?? b?.value ?? b?.pipelineValue) -
        safeNum(a?.amount ?? a?.value ?? a?.pipelineValue)
    )[0];

  const bestGrowthChannel = (channelChart || [])
    .filter((c) => safeNum(c?.revenue) > safeNum(c?.spend))
    .sort((a, b) => safeNum(b?.revenue) - safeNum(a?.revenue))[0];

  const biggestLateStageDeal = activeDeals
    .filter((d) => normalizeStage(d?.stage || d?.status) === "Negotiation")
    .sort(
      (a, b) =>
        safeNum(b?.amount ?? b?.value ?? b?.pipelineValue) -
        safeNum(a?.amount ?? a?.value ?? a?.pipelineValue)
    )[0];

  const lastMetric = metrics?.length ? metrics[metrics.length - 1] : null;
  const prevMetric = metrics?.length > 1 ? metrics[metrics.length - 2] : null;
  const revenueDelta = lastMetric && prevMetric
    ? safeNum(lastMetric?.revenue) - safeNum(prevMetric?.revenue)
    : 0;

  const actions = [];

  if (highestRiskDeal) {
    actions.push({
      title: "Protect highest-risk revenue",
      priority: "Immediate",
      tone: "bad",
      body: `${highestRiskDeal?.name || highestRiskDeal?.title || "A deal"} is showing elevated slip risk and represents ${moneyCompact(
        highestRiskDeal?.amount ?? highestRiskDeal?.value ?? highestRiskDeal?.pipelineValue
      )} in pipeline value.`,
      action: "Re-engage the buyer, confirm decision timing, and assign executive oversight.",
    });
  }

  if (bestGrowthChannel) {
    actions.push({
      title: "Scale best-performing revenue motion",
      priority: "High",
      tone: "good",
      body: `${bestGrowthChannel.channel} is currently the strongest attributed growth motion with ${moneyCompact(
        bestGrowthChannel.revenue
      )} in tracked revenue impact.`,
      action: "Reallocate budget toward this channel while protecting conversion efficiency.",
    });
  }

  if (safeNum(kpis?.coverage) < 2) {
    actions.push({
      title: "Stabilize pipeline coverage",
      priority: "Immediate",
      tone: "warn",
      body: `Pipeline coverage is only ${safeNum(kpis?.coverage).toFixed(1)}x, which leaves forecast protection too thin.`,
      action: "Increase qualified pipeline generation and accelerate proposal-stage movement.",
    });
  } else if (safeNum(kpis?.coverage) < 4) {
    actions.push({
      title: "Improve forecast protection",
      priority: "High",
      tone: "warn",
      body: `Coverage is ${safeNum(kpis?.coverage).toFixed(1)}x and still below elite level.`,
      action: "Push more opportunities into active pipeline to improve forecast resilience.",
    });
  }

  if (biggestLateStageDeal) {
    actions.push({
      title: "Advance late-stage close plan",
      priority: "High",
      tone: "watch",
      body: `${biggestLateStageDeal?.name || biggestLateStageDeal?.title || "A late-stage deal"} is one of the most important near-term revenue drivers.`,
      action: "Confirm close plan, stakeholders, commercial blockers, and final decision date.",
    });
  }

  if (revenueDelta < 0) {
    actions.push({
      title: "Address momentum slowdown",
      priority: "Medium",
      tone: "bad",
      body: `Tracked revenue softened by ${moneyCompact(Math.abs(revenueDelta))} in the most recent period.`,
      action: "Review deal progression and channel efficiency to prevent forecast drag from compounding.",
    });
  }

  if (!actions.length) {
    actions.push({
      title: "Maintain current revenue posture",
      priority: "Stable",
      tone: "good",
      body: "Atlas is not seeing an immediate executive escalation issue right now.",
      action: "Continue protecting close discipline and monitor growth signals for upside.",
    });
  }

  return actions.slice(0, 5);
}

function toneStyles(tone) {
  if (tone === "bad") {
    return {
      border: "1px solid rgba(239,68,68,0.20)",
      background: "linear-gradient(180deg, rgba(239,68,68,0.08), rgba(255,255,255,0.02))",
      badgeBg: "rgba(239,68,68,0.14)",
      badgeColor: "#fca5a5",
    };
  }

  if (tone === "warn") {
    return {
      border: "1px solid rgba(245,158,11,0.20)",
      background: "linear-gradient(180deg, rgba(245,158,11,0.08), rgba(255,255,255,0.02))",
      badgeBg: "rgba(245,158,11,0.14)",
      badgeColor: "#fde68a",
    };
  }

  if (tone === "watch") {
    return {
      border: "1px solid rgba(56,189,248,0.20)",
      background: "linear-gradient(180deg, rgba(56,189,248,0.08), rgba(255,255,255,0.02))",
      badgeBg: "rgba(56,189,248,0.14)",
      badgeColor: "#bae6fd",
    };
  }

  return {
    border: "1px solid rgba(34,197,94,0.20)",
    background: "linear-gradient(180deg, rgba(34,197,94,0.08), rgba(255,255,255,0.02))",
    badgeBg: "rgba(34,197,94,0.14)",
    badgeColor: "#86efac",
  };
}

export default function AtlasExecActionCenter({
  deals = [],
  channelChart = [],
  kpis,
  metrics = [],
}) {
  const actions = useMemo(
    () => buildActionCenter({ deals, channelChart, kpis, metrics }),
    [deals, channelChart, kpis, metrics]
  );

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(135deg, rgba(124,92,255,0.10), rgba(37,99,235,0.08), rgba(255,255,255,0.02))",
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
              color: "rgba(196,181,253,0.92)",
            }}
          >
            Atlas Exec Action Center
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -0.4,
            }}
          >
            Leadership priorities for today
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.65,
              color: "rgba(226,232,240,0.86)",
              maxWidth: 800,
            }}
          >
            Atlas surfaces the most important actions leadership should take next
            to protect revenue, improve forecast strength, and unlock growth.
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
            fontSize: 12,
            color: "#e2e8f0",
            whiteSpace: "nowrap",
          }}
        >
          {actions.length} Active Priorities
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {actions.map((item, idx) => {
          const tone = toneStyles(item.tone);

          return (
            <div
              key={`${item.title}-${idx}`}
              style={{
                borderRadius: 16,
                padding: 14,
                border: tone.border,
                background: tone.background,
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
                    fontSize: 16,
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
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {item.priority}
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

              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: "#fff",
                }}
              >
                <strong>Recommended move:</strong> {item.action}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}