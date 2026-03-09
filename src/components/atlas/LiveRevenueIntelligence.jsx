import React, { useMemo } from "react";

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

function getGreeting(name = "Team") {
  const hour = new Date().getHours();
  const prefix = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${prefix}, ${name}.`;
}

function buildSignals({ kpis, deals = [], channelChart = [], overviewSignals = [] }) {
  const items = [];

  if (safeNum(kpis?.wow) !== 0 && kpis?.wow != null) {
    items.push({
      type: kpis.wow >= 0 ? "positive" : "warning",
      title: "Revenue Momentum Update",
      body:
        kpis.wow >= 0
          ? `Revenue momentum is up ${Math.abs(kpis.wow).toFixed(1)}% week over week.`
          : `Revenue momentum is down ${Math.abs(kpis.wow).toFixed(1)}% week over week.`,
    });
  }

  if (safeNum(kpis?.coverage) > 0) {
    items.push({
      type: safeNum(kpis.coverage) >= 4 ? "positive" : safeNum(kpis.coverage) >= 2 ? "watch" : "warning",
      title: "Pipeline Coverage Signal",
      body:
        safeNum(kpis.coverage) >= 4
          ? `Pipeline coverage is strong at ${kpis.coverage.toFixed(1)}x and is helping protect forecast stability.`
          : safeNum(kpis.coverage) >= 2
          ? `Pipeline coverage is ${kpis.coverage.toFixed(1)}x. Atlas recommends increasing quality pipeline to move toward elite coverage.`
          : `Pipeline coverage is only ${kpis.coverage.toFixed(1)}x. Revenue protection is at risk without more pipeline creation.`,
    });
  }

  const negotiationDeals = deals.filter((d) =>
    String(d?.stage || d?.status || "").toLowerCase().includes("neg")
  );
  if (negotiationDeals.length) {
    const topDeal = negotiationDeals
      .slice()
      .sort(
        (a, b) =>
          safeNum(b?.amount ?? b?.value ?? b?.pipelineValue) -
          safeNum(a?.amount ?? a?.value ?? a?.pipelineValue)
      )[0];

    items.push({
      type: "watch",
      title: "Deal Risk Alert",
      body: `${
        topDeal?.name || topDeal?.title || "A late-stage opportunity"
      } is one of ${negotiationDeals.length} negotiation-stage deals currently influencing near-term forecast.`,
    });
  }

  if (channelChart.length) {
    const topChannel = channelChart[0];
    items.push({
      type: "positive",
      title: "Growth Signal",
      body: `${topChannel.channel} is currently leading attributed revenue with ${money(
        topChannel.revenue
      )} in tracked impact.`,
    });
  }

  if (safeNum(kpis?.cac) > 0) {
    items.push({
      type: safeNum(kpis.cac) <= 500 ? "positive" : "warning",
      title: "Efficiency Signal",
      body:
        safeNum(kpis.cac) <= 500
          ? `Customer acquisition cost is under control at ${money(kpis.cac)}.`
          : `Customer acquisition cost is elevated at ${money(
              kpis.cac
            )}. Atlas recommends tightening channel allocation.`,
    });
  }

  overviewSignals.slice(0, 2).forEach((signal, idx) => {
    items.push({
      type: idx === 0 ? "positive" : "watch",
      title: idx === 0 ? "Atlas Signal" : "Executive Watchlist",
      body: signal,
    });
  });

  return items.slice(0, 6);
}

function toneStyles(type) {
  if (type === "positive") {
    return {
      border: "1px solid rgba(34,197,94,0.22)",
      background: "linear-gradient(180deg, rgba(34,197,94,0.10), rgba(255,255,255,0.02))",
      badgeBg: "rgba(34,197,94,0.14)",
      badgeColor: "#86efac",
    };
  }

  if (type === "warning") {
    return {
      border: "1px solid rgba(251,113,133,0.22)",
      background: "linear-gradient(180deg, rgba(251,113,133,0.10), rgba(255,255,255,0.02))",
      badgeBg: "rgba(251,113,133,0.14)",
      badgeColor: "#fda4af",
    };
  }

  return {
    border: "1px solid rgba(245,158,11,0.22)",
    background: "linear-gradient(180deg, rgba(245,158,11,0.10), rgba(255,255,255,0.02))",
    badgeBg: "rgba(245,158,11,0.14)",
    badgeColor: "#fcd34d",
  };
}

export default function LiveRevenueIntelligence({
  name = "Team",
  kpis,
  deals = [],
  channelChart = [],
  overviewSignals = [],
  lastUpdatedLabel = "",
}) {
  const feed = useMemo(
    () => buildSignals({ kpis, deals, channelChart, overviewSignals }),
    [kpis, deals, channelChart, overviewSignals]
  );

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(135deg, rgba(124,92,255,0.16), rgba(56,189,248,0.10), rgba(255,255,255,0.03))",
        padding: 18,
        boxShadow: "0 14px 34px rgba(0,0,0,0.22)",
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
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "rgba(125,211,252,0.92)",
            }}
          >
            Atlas Live Revenue Intelligence
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -0.4,
            }}
          >
            {getGreeting(name)}
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
            Atlas detected {feed.length} revenue signals since your last review and surfaced the
            most important items leadership should pay attention to right now.
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
          Live Intelligence
          {lastUpdatedLabel ? <span style={{ opacity: 0.72 }}>• {lastUpdatedLabel}</span> : null}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {feed.map((item, idx) => {
          const tone = toneStyles(item.type);

          return (
            <div
              key={`${item.title}-${idx}`}
              style={{
                borderRadius: 16,
                padding: 14,
                ...tone,
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
                {item.title}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "#eaf2ff",
                }}
              >
                {item.body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}