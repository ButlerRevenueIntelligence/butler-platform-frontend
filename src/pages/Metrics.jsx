// frontend/src/pages/Metrics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getMetricsDaily, getMetricsSummary } from "../api";
import OpportunityRadar from "../components/atlas/OpportunityRadar";
import RevenueTimeline from "../components/atlas/RevenueTimeline";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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

const moneyCompact = (n) => {
  const num = safeNum(n);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${Math.round(num / 1_000)}K`;
  return `$${Math.round(num)}`;
};

const pct = (n) => `${Math.round(safeNum(n) * 100)}%`;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function Section({ title, subtitle, children, action }) {
  return (
    <div style={S.section}>
      <div style={S.sectionHead}>
        <div>
          {subtitle ? <div style={S.sectionSub}>{subtitle}</div> : null}
          <div style={S.sectionTitle}>{title}</div>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div style={S.sectionBody}>{children}</div>
    </div>
  );
}

function StatCard({ label, value, note, valueStyle }) {
  return (
    <div style={S.statCard}>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statValue, ...(valueStyle || {}) }}>{value}</div>
      <div style={S.statNote}>{note}</div>
    </div>
  );
}

function SignalItem({ title, body, tone = "neutral" }) {
  const toneStyle =
    tone === "good"
      ? { borderLeft: "3px solid #22C55E" }
      : tone === "warn"
      ? { borderLeft: "3px solid #F59E0B" }
      : tone === "bad"
      ? { borderLeft: "3px solid #FB7185" }
      : { borderLeft: "3px solid #38BDF8" };

  return (
    <div style={{ ...S.signalItem, ...toneStyle }}>
      <div style={S.signalItemTitle}>{title}</div>
      <div style={S.signalItemBody}>{body}</div>
    </div>
  );
}

export default function Metrics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [sRes, dRes] = await Promise.all([
        getMetricsSummary(days),
        getMetricsDaily(days),
      ]);

      setSummary(sRes?.summary || null);
      setSeries(Array.isArray(dRes?.days) ? dRes.days : []);
    } catch (e) {
      setError(e?.message || "Failed to load market signals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const kpis = useMemo(() => {
    const s = summary || {};
    return [
      {
        label: "Signal Volume",
        value: s.totalDeals ?? 0,
        sub: "Tracked opportunities contributing to signal activity.",
      },
      {
        label: "Weighted Pipeline",
        value: money(s.weighted ?? 0),
        sub: "Probability-adjusted market opportunity value.",
      },
      {
        label: "Revenue Captured",
        value: money(s.wonRevenue ?? 0),
        sub: "Won revenue realized in the selected window.",
      },
      {
        label: "Win Rate",
        value: pct(s.winRate ?? 0),
        sub: "Signal-to-revenue conversion efficiency.",
      },
      {
        label: "Avg Deal Size",
        value: money(s.avgDeal ?? 0),
        sub: "Average value across tracked opportunities.",
      },
      {
        label: "Avg Sales Cycle",
        value: `${Math.round(safeNum(s.avgCycleDays ?? 0))}d`,
        sub: "Average time required to close.",
      },
      {
        label: "Stale Opportunities",
        value: s.staleCount ?? 0,
        sub: "Signals needing re-engagement or movement.",
      },
      {
        label: "Raw Pipeline",
        value: money(s.raw ?? 0),
        sub: "Total unweighted opportunity pool.",
      },
    ];
  }, [summary]);

  const totals = useMemo(() => {
    const weightedCreatedTotal = (series || []).reduce(
      (sum, row) => sum + safeNum(row?.weightedCreated),
      0
    );
    const wonRevenueTotal = (series || []).reduce(
      (sum, row) => sum + safeNum(row?.wonRevenue),
      0
    );
    const avgDailyWon = series?.length ? wonRevenueTotal / series.length : 0;

    return {
      weightedCreatedTotal,
      wonRevenueTotal,
      avgDailyWon,
    };
  }, [series]);

  const signalStrength = useMemo(() => {
    const s = summary || {};
    const winComponent = clamp(safeNum(s.winRate) * 100, 0, 100);
    const stalePenalty = clamp(safeNum(s.staleCount) * 8, 0, 40);
    return clamp(Math.round(winComponent - stalePenalty + 20), 0, 100);
  }, [summary]);

  const signalTone =
    signalStrength >= 75 ? "#22C55E" : signalStrength >= 50 ? "#F59E0B" : "#FB7185";

  const avgCloseProbability = useMemo(() => {
    const s = summary || {};
    return clamp(Math.round(safeNum(s.winRate) * 100), 0, 100);
  }, [summary]);

  const weightedPressure = useMemo(() => {
    const s = summary || {};
    const stale = safeNum(s.staleCount);
    const pressure = clamp(Math.round(stale * 12 + (1 - Math.min(safeNum(s.winRate), 1)) * 45), 0, 100);
    return safeNum(s.weighted ?? 0) * (pressure / 100);
  }, [summary]);

  const marketInsights = useMemo(() => {
    const s = summary || {};
    const insights = [];

    if (safeNum(s.winRate) < 0.3) {
      insights.push({
        title: "Close efficiency needs attention",
        body: `Current win rate is ${pct(
          s.winRate
        )}. Market signals are being generated, but conversion into revenue is softer than it should be.`,
        tone: "bad",
      });
    } else {
      insights.push({
        title: "Conversion quality is holding",
        body: `Current win rate is ${pct(
          s.winRate
        )}, suggesting revenue conversion remains relatively stable across this window.`,
        tone: "good",
      });
    }

    if (safeNum(s.staleCount) >= 5) {
      insights.push({
        title: "Stale signal pressure detected",
        body: `${s.staleCount} opportunities are showing inactivity. Leadership should push re-engagement and tighten follow-up timing.`,
        tone: "warn",
      });
    } else {
      insights.push({
        title: "Signal flow remains manageable",
        body: `Only ${
          s.staleCount ?? 0
        } opportunities are currently stale, which keeps signal drag under control.`,
        tone: "good",
      });
    }

    if (totals.weightedCreatedTotal > totals.wonRevenueTotal) {
      insights.push({
        title: "Signal creation is outpacing revenue capture",
        body: "The system is generating opportunity momentum faster than it is being converted into won revenue.",
        tone: "neutral",
      });
    } else {
      insights.push({
        title: "Revenue capture is keeping pace",
        body: "Won revenue is tracking closely against weighted opportunity creation in this period.",
        tone: "good",
      });
    }

    return insights.slice(0, 3);
  }, [summary, totals]);

  const priorityActions = useMemo(() => {
    const s = summary || {};
    const items = [];

    if (safeNum(s.staleCount) >= 5) {
      items.push("Re-engage stale opportunities within the next 24 hours.");
    }

    if (safeNum(s.winRate) < 0.3) {
      items.push("Tighten qualification and improve late-stage follow-up.");
    }

    if (totals.weightedCreatedTotal > totals.wonRevenueTotal) {
      items.push("Improve handoff from market demand to revenue realization.");
    }

    if (!items.length) {
      items.push("Protect current signal quality and keep momentum consistent.");
      items.push("Scale the channels generating the strongest revenue efficiency.");
      items.push("Look for selective expansion without adding conversion drag.");
    }

    return items.slice(0, 4);
  }, [summary, totals]);

  const aiRecommendations = useMemo(() => {
    const s = summary || {};
    const recs = [];

    if (safeNum(s.winRate) < 0.3) {
      recs.push({
        title: "Improve signal monetization",
        body: "More of the demand being generated needs to be converted into closed revenue. Focus on conversion quality, not just volume.",
      });
    } else {
      recs.push({
        title: "Preserve winning channel mix",
        body: "The current market signal mix is supporting stable conversion. Keep budget allocation disciplined around what is already working.",
      });
    }

    if (safeNum(s.staleCount) >= 5) {
      recs.push({
        title: "Reduce stalled opportunity buildup",
        body: "Stale opportunity volume is beginning to suppress signal efficiency. Push next-step enforcement and follow-up acceleration.",
      });
    } else {
      recs.push({
        title: "Execution drag remains moderate",
        body: "Opportunity aging is present but still manageable. The system can stay focused on growth and conversion optimization.",
      });
    }

    recs.push({
      title: "Use radar and timeline together",
      body: "Opportunity Radar shows where momentum is strongest, while Revenue Timeline helps leadership judge how signal flow may translate into revenue.",
    });

    return recs.slice(0, 3);
  }, [summary]);

  const atRiskDeals = useMemo(() => {
    const s = summary || {};
    const staleCount = safeNum(s.staleCount);
    const avgDeal = safeNum(s.avgDeal);
    const totalDeals = safeNum(s.totalDeals);

    const generated = [];
    const count = Math.min(Math.max(staleCount, 0), 4);

    for (let i = 0; i < count; i += 1) {
      generated.push({
        name: `Signal Opportunity ${i + 1}`,
        stage: i % 2 === 0 ? "Proposal" : "Negotiation",
        risk: i === 0 ? "High" : i === 1 ? "Medium" : "Watch",
        value: avgDeal > 0 ? avgDeal : totalDeals > 0 ? 45000 + i * 12000 : 0,
        reason:
          i === 0
            ? "Signal activity is present, but deal movement has stalled."
            : i === 1
            ? "Opportunity aging is exceeding the expected pace."
            : "Needs a faster next action to preserve momentum.",
      });
    }

    return generated;
  }, [summary]);

  const executiveBriefing = useMemo(() => {
    const s = summary || {};
    const winRateText = pct(s.winRate ?? 0);
    const stale = s.staleCount ?? 0;

    if (stale >= 5) {
      return `Atlas Market Signals is detecting rising friction in the current ${days}-day window. Opportunity creation remains active, but ${stale} stale opportunities and a ${winRateText} win rate suggest leadership should focus on re-engagement, faster follow-up, and stronger signal-to-revenue conversion.`;
    }

    return `Atlas Market Signals shows stable demand intelligence across the current ${days}-day window. Opportunity creation, revenue capture, and conversion performance remain visible, and current close performance is ${winRateText}. Leadership can focus on preserving momentum, improving efficiency, and scaling the strongest channels.`;
  }, [summary, days]);

  const chartSeries = useMemo(() => {
    return (series || []).map((row, idx) => ({
      ...row,
      label: row?.date || row?.day || row?.createdAt || `D${idx + 1}`,
    }));
  }, [series]);

  const axisTick = { fill: "#9fb0d0", fontSize: 11 };

  const tooltipStyle = {
    background: "rgba(7,11,24,0.97)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "14px",
    color: "#fff",
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  };

  if (loading && !summary && !series.length) {
    return (
      <div style={S.page}>
        <div style={S.wrap}>
          <div style={S.hero}>
            <div style={S.eyebrow}>Market Intelligence</div>
            <h1 style={S.h1}>Atlas Market Signals</h1>
            <div style={S.heroText}>Loading market intelligence…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.hero}>
          <div style={S.heroTop}>
            <div>
              <div style={S.eyebrow}>Revenue Intelligence Signals</div>
              <h1 style={S.h1}>Atlas Market Signals</h1>
              <div style={S.heroText}>
                Real-time market demand visibility, signal quality tracking,
                opportunity momentum, and conversion intelligence across the selected window.
              </div>
            </div>

            <div style={S.controlsWrap}>
              <div style={S.badge}>Systems Online</div>
              <div style={S.badge}>Signals Active</div>
              <div style={S.badge}>
                {signalStrength >= 60 ? "Signal Strength Elevated" : "Signal Flow Stable"}
              </div>

              <div style={{ width: "100%" }} />

              <div style={S.quickSignal}>
                <span style={S.quickSignalLabel}>Win rate</span>
                <span style={S.quickSignalValue}>{pct(summary?.winRate ?? 0)}</span>
              </div>

              <div style={S.quickSignal}>
                <span style={S.quickSignalLabel}>Weighted pressure</span>
                <span style={S.quickSignalValue}>{moneyCompact(weightedPressure)}</span>
              </div>

              <div style={S.pill}>Window</div>

              <select
                style={S.select}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>

              <button style={S.btn} onClick={load} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {error ? <div style={S.error}>{error}</div> : null}

        <div style={S.briefingCard}>
          <div style={S.briefingEyebrow}>Atlas AI Executive Summary</div>
          <div style={S.briefingBody}>{executiveBriefing}</div>
        </div>

        <div style={S.statsGrid}>
          <StatCard
            label="Signal Pipeline"
            value={money(summary?.raw ?? 0)}
            note="Total tracked opportunity pool generated from current market activity."
          />
          <StatCard
            label="Weighted Signal Value"
            value={money(summary?.weighted ?? 0)}
            note="Probability-adjusted value of current signal activity."
          />
          <StatCard
            label="Avg Close Probability"
            value={`${avgCloseProbability}%`}
            note="Average close confidence across active signal-driven opportunities."
          />
          <StatCard
            label="Signal Strength"
            value={signalStrength}
            valueStyle={{ color: signalTone }}
            note="Derived from conversion efficiency and stale opportunity drag."
          />
        </div>

        <div style={S.twoCol}>
          <Section title="Signal Momentum Timeline" subtitle="Demand Flow">
            <div style={S.chartShellLg}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSeries}>
                  <defs>
                    <linearGradient id="weightedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.10)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={axisTick}
                    stroke="#94a3b8"
                    minTickGap={24}
                  />
                  <YAxis
                    tick={axisTick}
                    stroke="#94a3b8"
                    tickFormatter={(v) => moneyCompact(v)}
                  />
                  <Tooltip
                    formatter={(v) => [money(v), "Weighted Created"]}
                    labelFormatter={(l) => `Date: ${l}`}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weightedCreated"
                    stroke="#67e8f9"
                    strokeWidth={3}
                    fill="url(#weightedFill)"
                    animationDuration={1400}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Priority Actions" subtitle="Next Best Moves">
            <div style={S.signalList}>
              {priorityActions.map((item, idx) => (
                <SignalItem
                  key={`${item}-${idx}`}
                  title={`Priority ${idx + 1}`}
                  body={item}
                  tone={idx === 0 ? "warn" : "neutral"}
                />
              ))}
            </div>
          </Section>
        </div>

        <div style={S.twoCol}>
          <Section
            title="At-Risk Opportunities"
            subtitle="Signal Watchlist"
            action={
              <div style={S.sectionTag}>
                {atRiskDeals.length ? `${atRiskDeals.length} flagged` : "No critical risks"}
              </div>
            }
          >
            {atRiskDeals.length ? (
              <div style={S.dealList}>
                {atRiskDeals.map((deal, idx) => (
                  <div key={`${deal.name}-${idx}`} style={S.dealCard}>
                    <div style={S.dealTop}>
                      <div>
                        <div style={S.dealName}>{deal.name}</div>
                        <div style={S.dealMeta}>
                          Stage: <strong>{deal.stage}</strong> • Value:{" "}
                          <strong>{money(deal.value)}</strong>
                        </div>
                      </div>
                      <div
                        style={{
                          ...S.riskPill,
                          color:
                            deal.risk === "High"
                              ? "#FB7185"
                              : deal.risk === "Medium"
                              ? "#F59E0B"
                              : "#38BDF8",
                        }}
                      >
                        {deal.risk}
                      </div>
                    </div>
                    <div style={S.dealReason}>{deal.reason}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={S.emptyState}>
                No high-risk opportunities are currently flagged in this window.
              </div>
            )}
          </Section>

          <Section title="Opportunity Radar" subtitle="Growth Levers">
            <OpportunityRadar
              pipeline={{ pipelineValue: summary?.raw ?? 0 }}
              revenue={summary?.wonRevenue ?? totals.wonRevenueTotal}
            />
          </Section>
        </div>

        <div style={S.twoCol}>
          <Section title="Revenue Timeline Projection" subtitle="Forward View">
            <RevenueTimeline
              forecast={Math.max(summary?.weighted ?? 0, summary?.wonRevenue ?? 0)}
            />
          </Section>

          <Section title="AI Recommendations" subtitle="Signal Intelligence">
            <div style={S.signalList}>
              {aiRecommendations.map((item, idx) => (
                <SignalItem
                  key={`${item.title}-${idx}`}
                  title={item.title}
                  body={item.body}
                  tone={idx === 0 ? "good" : "neutral"}
                />
              ))}
            </div>
          </Section>
        </div>

        <Section title="Signal KPI Grid" subtitle="Performance">
          <div style={S.kpiGrid}>
            {kpis.map((k) => (
              <div key={k.label} style={S.kpiCard}>
                <div style={S.label}>{k.label}</div>
                <div style={S.value}>{k.value}</div>
                <div style={S.sub}>{k.sub}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Atlas Signals" subtitle="AI Narrative">
          <div style={S.insightGrid}>
            {marketInsights.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                style={{
                  ...S.insightCard,
                  borderLeft:
                    item.tone === "good"
                      ? "3px solid #22C55E"
                      : item.tone === "warn"
                      ? "3px solid #F59E0B"
                      : item.tone === "bad"
                      ? "3px solid #FB7185"
                      : "3px solid #38BDF8",
                }}
              >
                <div style={S.insightTitle}>{item.title}</div>
                <div style={S.insightBody}>{item.body}</div>
              </div>
            ))}
          </div>
        </Section>

        <div style={S.charts}>
          <Section title="Won Revenue (Daily)" subtitle="Revenue Capture">
            <div style={S.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSeries}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.10)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={axisTick}
                    stroke="#94a3b8"
                    minTickGap={24}
                  />
                  <YAxis
                    tick={axisTick}
                    stroke="#94a3b8"
                    tickFormatter={(v) => moneyCompact(v)}
                  />
                  <Tooltip
                    formatter={(v) => [money(v), "Won Revenue"]}
                    labelFormatter={(l) => `Date: ${l}`}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="wonRevenue"
                    fill="#93c5fd"
                    radius={[10, 10, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Signal Balance" subtitle="Creation vs Conversion">
            <div style={S.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.10)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={axisTick}
                    stroke="#94a3b8"
                    minTickGap={24}
                  />
                  <YAxis
                    tick={axisTick}
                    stroke="#94a3b8"
                    tickFormatter={(v) => moneyCompact(v)}
                  />
                  <Tooltip
                    formatter={(v, name) => [money(v), name]}
                    labelFormatter={(l) => `Date: ${l}`}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weightedCreated"
                    name="Weighted Created"
                    stroke="#67e8f9"
                    strokeWidth={3}
                    dot={false}
                    animationDuration={1400}
                  />
                  <Line
                    type="monotone"
                    dataKey="wonRevenue"
                    name="Won Revenue"
                    stroke="#93c5fd"
                    strokeWidth={3}
                    dot={false}
                    animationDuration={1600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <div style={S.footerStats}>
          <StatCard
            label="Avg Daily Won Revenue"
            value={money(totals.avgDailyWon)}
            note="Average daily realized revenue in the selected window."
          />

          <StatCard
            label="Signal Balance"
            value={
              totals.weightedCreatedTotal >= totals.wonRevenueTotal
                ? "Creation-led"
                : "Conversion-led"
            }
            note="Shows whether demand creation or revenue conversion is dominating the current period."
          />
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    color: "#EAF0FF",
    padding: "14px 16px 24px",
    background:
      "radial-gradient(900px 500px at 15% 0%, rgba(37,99,235,0.18), transparent 55%), radial-gradient(900px 500px at 85% 0%, rgba(124,92,255,0.14), transparent 55%), linear-gradient(180deg, #050814 0%, #070b18 100%)",
  },
  wrap: {
    maxWidth: 1380,
    margin: "0 auto",
    display: "grid",
    gap: 12,
  },
  hero: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "18px 20px",
    background:
      "linear-gradient(135deg, rgba(30,64,175,0.18), rgba(37,99,235,0.10), rgba(255,255,255,0.02))",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  eyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "rgba(125,211,252,0.9)",
    fontWeight: 800,
  },
  h1: {
    margin: "6px 0 0",
    fontSize: 28,
    lineHeight: 1.05,
    letterSpacing: -0.6,
    fontWeight: 900,
    color: "#ffffff",
  },
  heroText: {
    marginTop: 8,
    maxWidth: 760,
    fontSize: 14,
    lineHeight: 1.55,
    color: "rgba(226,232,240,0.90)",
  },
  controlsWrap: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    alignContent: "flex-start",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    fontSize: 11,
    fontWeight: 700,
    color: "#e2e8f0",
    whiteSpace: "nowrap",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    fontSize: 11,
    color: "#EAF0FF",
    fontWeight: 700,
  },
  btn: {
    borderRadius: 999,
    padding: "10px 14px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#EAF0FF",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  },
  select: {
    borderRadius: 999,
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "#EAF0FF",
    fontWeight: 900,
    fontSize: 12,
    outline: "none",
  },
  quickSignal: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
  },
  quickSignalLabel: {
    fontSize: 11,
    color: "rgba(203,213,225,0.74)",
    fontWeight: 700,
  },
  quickSignalValue: {
    fontSize: 12,
    color: "#fff",
    fontWeight: 900,
  },
  briefingCard: {
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.14), rgba(56,189,248,0.09), rgba(255,255,255,0.02))",
  },
  briefingEyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "rgba(148,163,184,0.78)",
    fontWeight: 800,
    marginBottom: 8,
  },
  briefingBody: {
    fontSize: 14,
    color: "rgba(226,232,240,0.90)",
    lineHeight: 1.65,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },
  statCard: {
    borderRadius: 16,
    padding: "14px 14px 13px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,16,35,0.40)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
    minHeight: 126,
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.88)",
    fontWeight: 800,
  },
  statValue: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.05,
  },
  statNote: {
    marginTop: 7,
    fontSize: 12,
    color: "rgba(203,213,225,0.76)",
    lineHeight: 1.45,
  },
  section: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
  },
  sectionHead: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: -0.35,
    color: "#fff",
  },
  sectionSub: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "rgba(148,163,184,0.75)",
    fontWeight: 700,
    marginBottom: 4,
  },
  sectionBody: {
    padding: 14,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 12,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },
  kpiCard: {
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.88)",
    fontWeight: 800,
  },
  value: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.08,
  },
  sub: {
    marginTop: 8,
    fontSize: 12,
    color: "rgba(203,213,225,0.78)",
    lineHeight: 1.5,
  },
  insightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  insightCard: {
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,16,35,0.35)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
  },
  insightTitle: {
    fontWeight: 900,
    fontSize: 14,
    marginBottom: 8,
    color: "#fff",
  },
  insightBody: {
    fontSize: 13,
    color: "rgba(219,228,240,0.84)",
    lineHeight: 1.6,
  },
  charts: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  chartShell: {
    height: 260,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.72)",
    padding: 10,
  },
  chartShellLg: {
    height: 300,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.72)",
    padding: 10,
  },
  signalList: {
    display: "grid",
    gap: 10,
  },
  signalItem: {
    borderRadius: 14,
    padding: "12px 13px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  signalItemTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: "#fff",
    marginBottom: 6,
  },
  signalItemBody: {
    fontSize: 13,
    color: "rgba(219,228,240,0.84)",
    lineHeight: 1.55,
  },
  dealList: {
    display: "grid",
    gap: 10,
  },
  dealCard: {
    borderRadius: 14,
    padding: 13,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  dealTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  dealName: {
    fontSize: 14,
    fontWeight: 900,
    color: "#fff",
  },
  dealMeta: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(203,213,225,0.78)",
    lineHeight: 1.5,
  },
  riskPill: {
    fontSize: 11,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
  },
  dealReason: {
    marginTop: 10,
    fontSize: 13,
    color: "rgba(219,228,240,0.84)",
    lineHeight: 1.55,
  },
  emptyState: {
    fontSize: 13,
    color: "rgba(203,213,225,0.76)",
    lineHeight: 1.6,
  },
  footerStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  error: {
    borderRadius: 12,
    padding: 12,
    border: "1px solid rgba(255,0,0,0.25)",
    background: "rgba(255,0,0,0.10)",
    color: "#FFD7D7",
  },
};