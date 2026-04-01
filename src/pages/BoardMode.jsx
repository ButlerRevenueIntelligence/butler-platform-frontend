import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OpportunityRadar from "../components/atlas/OpportunityRadar";
import RevenueTimeline from "../components/atlas/RevenueTimeline";
import { getDashboard } from "../api";

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

function EmptyState({ text }) {
  return (
    <div
      style={{
        minHeight: 180,
        border: "1px dashed rgba(255,255,255,0.12)",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        color: "rgba(226,232,240,0.78)",
        fontSize: 14,
        lineHeight: 1.6,
        textAlign: "center",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {text}
    </div>
  );
}

export default function BoardMode() {
  const nav = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setLoadError("");
        const res = await getDashboard();
        if (!mounted) return;
        setDashboard(res || null);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setLoadError(err?.message || "Failed to load Board Mode");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const workspaceMode = String(dashboard?.workspaceMode || "demo").toLowerCase();
  const isDemo = workspaceMode === "demo";
  const orgName = dashboard?.activeWorkspace?.name || "Workspace";

  const summary = dashboard?.summary || {};
  const revenue30 = safeNum(summary.revenue);
  const forecast90 = safeNum(summary.forecast90d);
  const pipelineValue = safeNum(summary.pipelineValue);
  const cac = safeNum(summary.cac);
  const revenueScore = safeNum(summary.revenueHealth);
  const openDeals = safeNum(summary.openDeals);
  const wonDeals = safeNum(summary.wonDeals);
  const lostDeals = safeNum(summary.lostDeals);

  const hasLiveData =
    revenue30 > 0 || forecast90 > 0 || pipelineValue > 0 || openDeals > 0;

  const boardKpis = useMemo(() => {
    if (isDemo) {
      return {
        revenue30: 1280000,
        forecast90: 3200000,
        pipelineValue: 4860000,
        cac: 740,
        coverage: 3.8,
        confidence: 81,
        revenueScore: 84,
      };
    }

    const coverage =
      revenue30 > 0 ? Number((pipelineValue / revenue30).toFixed(1)) : 0;

    const confidence =
      revenue30 > 0 || pipelineValue > 0
        ? Math.max(35, Math.min(95, revenueScore))
        : 0;

    return {
      revenue30,
      forecast90,
      pipelineValue,
      cac,
      coverage,
      confidence,
      revenueScore,
    };
  }, [isDemo, revenue30, forecast90, pipelineValue, cac, revenueScore]);

  const boardStats = useMemo(() => {
    if (isDemo) {
      return [
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
      ];
    }

    if (!hasLiveData) {
      return [
        {
          label: "Revenue Score",
          value: "0 / 100",
          note: "No live revenue health score yet.",
        },
        {
          label: "Forecast",
          value: "$0",
          note: "No live forecast available yet.",
        },
        {
          label: "Confidence",
          value: "0%",
          note: "Waiting for live pipeline and forecast inputs.",
        },
        {
          label: "Primary Risk",
          value: "No Live Inputs",
          note: "Board Mode is active but the workspace does not have enough data yet.",
        },
      ];
    }

    const primaryRisk =
      boardKpis.coverage < 2.5
        ? "Coverage Risk"
        : lostDeals > wonDeals && lostDeals > 0
        ? "Deal Loss Pressure"
        : "Execution Timing";

    const riskNote =
      primaryRisk === "Coverage Risk"
        ? "Pipeline coverage needs reinforcement to support forecast confidence."
        : primaryRisk === "Deal Loss Pressure"
        ? "Recent loss pressure is weakening board confidence."
        : "Leadership should protect timing on the highest-value opportunities.";

    return [
      {
        label: "Revenue Score",
        value: `${boardKpis.revenueScore} / 100`,
        note: "Overall health of the live revenue engine.",
      },
      {
        label: "Forecast",
        value: moneyCompact(boardKpis.forecast90),
        note: "Projected next-quarter revenue.",
      },
      {
        label: "Confidence",
        value: `${boardKpis.confidence}%`,
        note: "Live confidence based on pipeline and momentum.",
      },
      {
        label: "Primary Risk",
        value: primaryRisk,
        note: riskNote,
      },
    ];
  }, [isDemo, hasLiveData, boardKpis, lostDeals, wonDeals]);

  const boardRisks = useMemo(() => {
    if (isDemo) {
      return [
        "Three active late-stage deals represent a disproportionate share of forecast exposure.",
        "Pipeline coverage is improving, but still below elite protection levels.",
        "Some marketing budget remains allocated to lower-efficiency channels.",
      ];
    }

    if (!hasLiveData) {
      return [
        "No live revenue and pipeline inputs are currently available for board-grade risk reporting.",
        "Forecast quality cannot be assessed until opportunities and revenue data are flowing.",
        "This live workspace is no longer using hardcoded board-mode demo risks.",
      ];
    }

    const risks = [];

    if (boardKpis.coverage < 2.5) {
      risks.push(
        `Pipeline coverage is currently ${boardKpis.coverage}x, which may not fully support forecast protection.`
      );
    }

    if (lostDeals > wonDeals && lostDeals > 0) {
      risks.push(
        `Lost deals (${lostDeals}) are currently outpacing won deals (${wonDeals}), weakening execution confidence.`
      );
    }

    if (openDeals > 0) {
      risks.push(
        `${openDeals} open opportunities are carrying near-term board-level forecast pressure.`
      );
    }

    if (!risks.length) {
      risks.push(
        "No critical board-level risks are elevated right now based on live workspace data."
      );
    }

    return risks;
  }, [isDemo, hasLiveData, boardKpis.coverage, lostDeals, wonDeals, openDeals]);

  const boardActions = useMemo(() => {
    if (isDemo) {
      return [
        "Protect the top two late-stage opportunities with executive oversight.",
        "Shift more budget toward the strongest revenue-producing channels.",
        "Increase qualified mid-stage pipeline to reduce concentration risk.",
      ];
    }

    if (!hasLiveData) {
      return [
        "Connect CRM and forecast inputs so Atlas can generate live board-level recommendations.",
        "Populate the workspace with active opportunities and revenue movement.",
        "Use live data ingestion before relying on Board Mode for executive reviews.",
      ];
    }

    return [
      boardKpis.coverage < 2.5
        ? "Increase qualified mid-stage pipeline to improve board confidence."
        : "Protect pipeline momentum and preserve current coverage strength.",
      openDeals > 0
        ? "Apply executive oversight to the highest-value open opportunities."
        : "Create new qualified opportunities to reactivate board-level momentum.",
      lostDeals > wonDeals && lostDeals > 0
        ? "Audit recent losses and tighten execution against preventable slippage."
        : "Maintain clean decision timelines across the live opportunity set.",
    ];
  }, [isDemo, hasLiveData, boardKpis.coverage, openDeals, lostDeals, wonDeals]);

  const boardNarrative = useMemo(() => {
    if (isDemo) {
      return "Atlas indicates the revenue engine is in a strong but still vulnerable position. Forecast quality is improving, pipeline remains workable, and executive action should stay focused on protecting late-stage revenue while strengthening overall coverage.";
    }

    if (!hasLiveData) {
      return `Atlas Board Mode is active for ${orgName}, but there is not enough live revenue and pipeline data yet to generate a true executive board briefing. Once opportunities, revenue, and forecasts are flowing into the workspace, this narrative will convert into a live strategic summary.`;
    }

    return `Atlas indicates that ${orgName} is operating with ${moneyCompact(
      boardKpis.pipelineValue
    )} in pipeline, ${moneyCompact(boardKpis.forecast90)} in projected forecast, and a revenue score of ${
      boardKpis.revenueScore
    } / 100. Board attention should remain focused on forecast quality, opportunity execution, and protecting near-term revenue confidence.`;
  }, [isDemo, hasLiveData, orgName, boardKpis]);

  const protectedRevenue = useMemo(() => {
    if (isDemo) return 2400000;
    return Math.round(boardKpis.forecast90 * 0.75);
  }, [isDemo, boardKpis.forecast90]);

  const growthUpside = useMemo(() => {
    if (isDemo) return 680000;
    return Math.round(Math.max(0, boardKpis.pipelineValue - boardKpis.forecast90) * 0.4);
  }, [isDemo, boardKpis.pipelineValue, boardKpis.forecast90]);

  const revenueAtRisk = useMemo(() => {
    if (isDemo) return 420000;
    return Math.round(Math.max(0, boardKpis.forecast90 * (1 - boardKpis.confidence / 100)));
  }, [isDemo, boardKpis.forecast90, boardKpis.confidence]);

  if (loading) {
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
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 900,
                color: "#fff",
              }}
            >
              Loading Board Mode...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
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
              borderRadius: 14,
              padding: 16,
              border: "1px solid rgba(255,120,120,0.35)",
              background: "rgba(255,0,0,0.10)",
              color: "#FFD7D7",
              fontSize: 14,
            }}
          >
            {loadError}
          </div>
        </div>
      </div>
    );
  }

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
                and high-level revenue decision making for <b>{orgName}</b>.
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
            {isDemo || hasLiveData ? (
              <OpportunityRadar
                pipeline={{ pipelineValue: boardKpis.pipelineValue }}
                revenue={boardKpis.revenue30}
              />
            ) : (
              <EmptyState text="No live opportunity data yet for board-level strategic opportunity analysis." />
            )}
          </Section>

          <Section title="Revenue Projection Timeline">
            {isDemo || hasLiveData ? (
              <RevenueTimeline forecast={boardKpis.forecast90} />
            ) : (
              <EmptyState text="No live forecast timeline yet for board-level projection analysis." />
            )}
          </Section>
        </div>

        <Section title="Board Snapshot">
          {isDemo || hasLiveData ? (
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
                  {moneyCompact(protectedRevenue)}
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
                  {moneyCompact(growthUpside)}
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
                  {moneyCompact(revenueAtRisk)}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState text="No live board snapshot available yet. Connect live revenue, forecast, and opportunity data to activate Board Mode." />
          )}
        </Section>
      </div>
    </div>
  );
}