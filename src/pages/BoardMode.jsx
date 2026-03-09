import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import OpportunityRadar from "../components/atlas/OpportunityRadar";
import RevenueTimeline from "../components/atlas/RevenueTimeline";

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

function StatCard({ label, value, note }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: "16px 16px 14px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        minHeight: 150,
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "rgba(148,163,184,0.82)",
          fontWeight: 800,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 28,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: -0.4,
          lineHeight: 1.02,
        }}
      >
        {value}
      </div>

      {note ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: "rgba(203,213,225,0.76)",
            lineHeight: 1.55,
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: 16,
          fontWeight: 900,
          color: "#fff",
        }}
      >
        {title}
      </div>

      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

export default function BoardMode() {
  const nav = useNavigate();

  const boardKpis = useMemo(
    () => ({
      revenue30: 1280000,
      forecast90: 3200000,
      pipelineValue: 4860000,
      cac: 740,
      coverage: 3.8,
      confidence: 81,
      revenueScore: 84,
    }),
    []
  );

  const boardStats = useMemo(
    () => [
      {
        label: "Revenue Score",
        value: `${boardKpis.revenueScore} / 100`,
        note: "Overall health of the revenue engine.",
      },
      {
        label: "Forecast",
        value: moneyCompact(boardKpis.forecast90),
        note: "Projected next-quarter revenue.",
      },
      {
        label: "Confidence",
        value: `${boardKpis.confidence}%`,
        note: "Model confidence based on current pipeline and momentum.",
      },
      {
        label: "Primary Risk",
        value: "Deal Concentration",
        note: "Too much near-term forecast depends on a narrow late-stage cluster.",
      },
    ],
    [boardKpis]
  );

  const boardRisks = [
    "Three active late-stage deals represent a disproportionate share of forecast exposure.",
    "Pipeline coverage is improving, but still below elite protection levels.",
    "Some marketing budget remains allocated to lower-efficiency channels.",
  ];

  const boardActions = [
    "Protect the top two late-stage opportunities with executive oversight.",
    "Shift more budget toward the strongest revenue-producing channels.",
    "Increase qualified mid-stage pipeline to reduce concentration risk.",
  ];

  const boardNarrative =
    "Atlas indicates the revenue engine is in a strong but still vulnerable position. Forecast quality is improving, pipeline remains workable, and executive action should stay focused on protecting late-stage revenue while strengthening overall coverage.";

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#fff",
        padding: "14px 16px 24px",
        background:
          "radial-gradient(900px 500px at 15% 0%, rgba(37,99,235,0.18), transparent 55%), radial-gradient(900px 500px at 85% 0%, rgba(124,92,255,0.14), transparent 55%), linear-gradient(180deg, #050814 0%, #070b18 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          display: "grid",
          gap: 12,
        }}
      >
        <div
          style={{
            borderRadius: 20,
            padding: "18px 20px",
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(135deg, rgba(30,64,175,0.18), rgba(37,99,235,0.10), rgba(255,255,255,0.02))",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "rgba(125,211,252,0.9)",
                  fontWeight: 800,
                }}
              >
                Atlas Board Mode
              </div>

              <h1
                style={{
                  margin: "6px 0 0",
                  fontSize: 26,
                  lineHeight: 1.05,
                  letterSpacing: -0.6,
                  fontWeight: 900,
                  color: "#fff",
                }}
              >
                Executive Board Briefing
              </h1>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "rgba(226,232,240,0.88)",
                  maxWidth: 860,
                }}
              >
                A clean strategic view for leadership, board discussions, investor updates,
                and high-level revenue decision making.
              </div>
            </div>

            <button
              onClick={() => nav("/overview")}
              style={{
                borderRadius: 14,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Exit Board Mode
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {boardStats.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              note={item.note}
            />
          ))}
        </div>

        <Section title="Board Narrative">
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "#e5edf8",
              maxWidth: 1080,
            }}
          >
            {boardNarrative}
          </div>
        </Section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Section title="Top Strategic Risks">
            <div style={{ display: "grid", gap: 10 }}>
              {boardRisks.map((risk) => (
                <div
                  key={risk}
                  style={{
                    borderRadius: 14,
                    padding: "12px 13px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#dbe4f0",
                  }}
                >
                  {risk}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Top Executive Actions">
            <div style={{ display: "grid", gap: 10 }}>
              {boardActions.map((action) => (
                <div
                  key={action}
                  style={{
                    borderRadius: 14,
                    padding: "12px 13px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#dbe4f0",
                  }}
                >
                  {action}
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Section title="Strategic Opportunities">
            <OpportunityRadar
              pipeline={{ pipelineValue: boardKpis.pipelineValue }}
              revenue={boardKpis.revenue30}
            />
          </Section>

          <Section title="Revenue Projection Timeline">
            <RevenueTimeline forecast={boardKpis.forecast90} />
          </Section>
        </div>

        <Section title="Board Snapshot">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(148,163,184,0.8)",
                  fontWeight: 800,
                }}
              >
                Revenue Protected
              </div>
              <div style={{ marginTop: 10, fontSize: 24, fontWeight: 900 }}>
                {moneyCompact(2400000)}
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
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(148,163,184,0.8)",
                  fontWeight: 800,
                }}
              >
                Growth Upside
              </div>
              <div style={{ marginTop: 10, fontSize: 24, fontWeight: 900 }}>
                {moneyCompact(680000)}
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
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(148,163,184,0.8)",
                  fontWeight: 800,
                }}
              >
                Revenue at Risk
              </div>
              <div style={{ marginTop: 10, fontSize: 24, fontWeight: 900 }}>
                {moneyCompact(420000)}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}