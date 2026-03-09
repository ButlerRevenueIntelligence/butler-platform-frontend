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
  if (s.includes("follow")) return "Follow-Up";
  if (s.includes("neg")) return "Negotiation";
  if (s.includes("prop")) return "Proposal";
  if (s.includes("disc")) return "Discovery";
  if (s.includes("won")) return "Closed Won";
  if (s.includes("lost")) return "Closed Lost";
  return stage || "Unknown";
}

function buildLeakSignals({ deals = [], kpis, channelChart = [] }) {
  let leakAmount = 0;
  const items = [];

  const activeDeals = deals.filter((d) => {
    const stage = normalizeStage(d?.stage || d?.status);
    return stage !== "Closed Won" && stage !== "Closed Lost";
  });

  const lateStageDeals = activeDeals.filter((d) => {
    const stage = normalizeStage(d?.stage || d?.status);
    return stage === "Negotiation" || stage === "Proposal";
  });

  if (lateStageDeals.length) {
    const lateStageLeak = lateStageDeals.reduce((sum, d) => {
      const amount = safeNum(d?.amount ?? d?.value ?? d?.pipelineValue);
      return sum + amount * 0.12;
    }, 0);

    leakAmount += lateStageLeak;

    items.push({
      title: "Late-stage deal drag",
      body: `${lateStageDeals.length} proposal or negotiation-stage deals are creating forecast exposure.`,
      amount: lateStageLeak,
      tone: "warn",
    });
  }

  const lowConfidenceDeals = activeDeals.filter(
    (d) => safeNum(d?.probability) > 0 && safeNum(d?.probability) < 40
  );

  if (lowConfidenceDeals.length) {
    const lowConfidenceLeak = lowConfidenceDeals.reduce((sum, d) => {
      const amount = safeNum(d?.amount ?? d?.value ?? d?.pipelineValue);
      return sum + amount * 0.08;
    }, 0);

    leakAmount += lowConfidenceLeak;

    items.push({
      title: "Low-confidence pipeline",
      body: `${lowConfidenceDeals.length} active deals are below 40% confidence and may be overstating expected revenue.`,
      amount: lowConfidenceLeak,
      tone: "bad",
    });
  }

  if (Array.isArray(channelChart) && channelChart.length) {
    const weakChannels = channelChart.filter(
      (c) => safeNum(c?.spend) > 0 && safeNum(c?.revenue) < safeNum(c?.spend)
    );

    if (weakChannels.length) {
      const channelLeak = weakChannels.reduce((sum, c) => {
        return sum + Math.max(0, safeNum(c?.spend) - safeNum(c?.revenue));
      }, 0);

      leakAmount += channelLeak;

      items.push({
        title: "Channel waste detected",
        body: `${weakChannels.length} channel${weakChannels.length > 1 ? "s are" : " is"} spending more than ${weakChannels.length > 1 ? "they are" : "it is"} returning.`,
        amount: channelLeak,
        tone: "bad",
      });
    }
  }

  if (safeNum(kpis?.coverage) < 2) {
    const coverageLeak = safeNum(kpis?.revenue30) * 0.15;
    leakAmount += coverageLeak;

    items.push({
      title: "Coverage risk",
      body: `Pipeline coverage is below 2.0x, increasing near-term revenue vulnerability.`,
      amount: coverageLeak,
      tone: "warn",
    });
  }

  if (!items.length) {
    items.push({
      title: "Revenue leakage controlled",
      body: "Atlas is not detecting major leakage patterns right now. Continue protecting pipeline movement and efficiency.",
      amount: 0,
      tone: "good",
    });
  }

  return {
    leakAmount,
    items: items.slice(0, 4),
  };
}

function toneStyles(tone) {
  if (tone === "bad") {
    return {
      border: "1px solid rgba(239,68,68,0.22)",
      background: "rgba(239,68,68,0.08)",
      color: "#fca5a5",
    };
  }

  if (tone === "warn") {
    return {
      border: "1px solid rgba(245,158,11,0.22)",
      background: "rgba(245,158,11,0.08)",
      color: "#fde68a",
    };
  }

  return {
    border: "1px solid rgba(34,197,94,0.22)",
    background: "rgba(34,197,94,0.08)",
    color: "#86efac",
  };
}

export default function AtlasRevenueLeakDetector({ deals = [], kpis, channelChart = [] }) {
  const leakData = useMemo(
    () => buildLeakSignals({ deals, kpis, channelChart }),
    [deals, kpis, channelChart]
  );

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(245,158,11,0.08), rgba(255,255,255,0.02))",
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
              color: "rgba(253,224,71,0.92)",
            }}
          >
            Atlas Revenue Leak Detector
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
            {moneyCompact(leakData.leakAmount)}
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
            Atlas estimates this is the current revenue value at risk from weak coverage,
            deal drag, low-confidence pipeline, or underperforming channels.
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
              background: leakData.leakAmount > 0 ? "#f59e0b" : "#22c55e",
              boxShadow:
                leakData.leakAmount > 0
                  ? "0 0 10px rgba(245,158,11,0.5)"
                  : "0 0 10px rgba(34,197,94,0.5)",
            }}
          />
          {leakData.leakAmount > 0 ? "Leakage Detected" : "Leakage Controlled"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {leakData.items.map((item, idx) => {
          const tone = toneStyles(item.tone);

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
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: tone.color,
                  }}
                >
                  {item.amount > 0 ? moneyCompact(item.amount) : "Stable"}
                </div>
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
          );
        })}
      </div>
    </div>
  );
}