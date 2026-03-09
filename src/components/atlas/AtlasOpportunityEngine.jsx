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

function buildOpportunities({ deals = [], channelChart = [], kpis }) {
  const items = [];

  const activeDeals = deals.filter((d) => {
    const stage = normalizeStage(d?.stage || d?.status);
    return stage !== "Closed Won" && stage !== "Closed Lost";
  });

  const midStageDeals = activeDeals.filter((d) => {
    const stage = normalizeStage(d?.stage || d?.status);
    return stage === "Proposal" || stage === "Follow-Up";
  });

  if (midStageDeals.length) {
    const topMid = midStageDeals
      .slice()
      .sort(
        (a, b) =>
          safeNum(b?.amount ?? b?.value ?? b?.pipelineValue) -
          safeNum(a?.amount ?? a?.value ?? a?.pipelineValue)
      )[0];

    const expansionValue = safeNum(topMid?.amount ?? topMid?.value ?? topMid?.pipelineValue) * 0.18;

    items.push({
      title: topMid?.name || topMid?.title || "Mid-stage expansion opportunity",
      type: "Expansion Potential",
      amount: expansionValue,
      body: `This opportunity is sitting in ${
        normalizeStage(topMid?.stage || topMid?.status)
      } and could unlock additional revenue with stronger executive follow-through.`,
    });
  }

  const strongChannels = channelChart.filter(
    (c) => safeNum(c?.revenue) > safeNum(c?.spend) && safeNum(c?.revenue) > 0
  );

  if (strongChannels.length) {
    const topChannel = strongChannels
      .slice()
      .sort((a, b) => safeNum(b?.revenue) - safeNum(a?.revenue))[0];

    items.push({
      title: `${topChannel.channel} budget expansion`,
      type: "Growth Opportunity",
      amount: safeNum(topChannel?.revenue) * 0.12,
      body: `${topChannel.channel} is outperforming other tracked motions and may justify more budget allocation to capture incremental revenue.`,
    });
  }

  if (safeNum(kpis?.coverage) >= 2 && safeNum(kpis?.coverage) < 4) {
    items.push({
      title: "Coverage lift opportunity",
      type: "Pipeline Opportunity",
      amount: safeNum(kpis?.revenue30) * 0.2,
      body: "Pipeline coverage is workable but still below elite level. Increasing qualified pipeline could materially improve forecast strength.",
    });
  }

  if (!items.length) {
    items.push({
      title: "Stable revenue position",
      type: "Opportunity Watch",
      amount: 0,
      body: "Atlas is not seeing an obvious breakout growth signal right now. Continue monitoring account movement, channel efficiency, and pipeline acceleration.",
    });
  }

  return items.slice(0, 3);
}

function toneStyle() {
  return {
    border: "1px solid rgba(34,197,94,0.22)",
    background: "linear-gradient(180deg, rgba(34,197,94,0.08), rgba(255,255,255,0.02))",
    badgeBg: "rgba(34,197,94,0.14)",
    badgeColor: "#86efac",
  };
}

export default function AtlasOpportunityEngine({ deals = [], channelChart = [], kpis }) {
  const opportunities = useMemo(
    () => buildOpportunities({ deals, channelChart, kpis }),
    [deals, channelChart, kpis]
  );

  const totalUpside = opportunities.reduce((sum, item) => sum + safeNum(item.amount), 0);
  const tone = toneStyle();

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.06), rgba(255,255,255,0.02))",
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
              color: "rgba(134,239,172,0.92)",
            }}
          >
            Atlas Opportunity Engine
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 30,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -0.4,
            }}
          >
            {moneyCompact(totalUpside)}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.65,
              color: "rgba(226,232,240,0.86)",
              maxWidth: 820,
            }}
          >
            Atlas estimates this is the current visible upside available from stronger account movement,
            better channel allocation, and improved pipeline acceleration.
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
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#22c55e",
              boxShadow: "0 0 10px rgba(34,197,94,0.5)",
            }}
          />
          Growth Signals Active
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {opportunities.map((item, idx) => (
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
              {item.type}
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 16,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.35,
              }}
            >
              {item.title}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 22,
                fontWeight: 900,
                color: "#86efac",
              }}
            >
              {item.amount > 0 ? moneyCompact(item.amount) : "Watch"}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                lineHeight: 1.6,
                color: "#dbe7f5",
              }}
            >
              {item.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}