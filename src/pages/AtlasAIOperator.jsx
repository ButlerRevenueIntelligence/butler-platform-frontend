import React, { useMemo, useState } from "react";
import { askAtlas } from "../api";
import RevenueRiskAlerts from "../components/atlas/RevenueRiskAlerts";
import RecommendedActions from "../components/atlas/RecommendedActions";
import { alerts, briefing } from "../data/AtlasMockData";
import ExecutiveBriefing from "../components/atlas/ExecutiveBriefing";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const forecastTrend = [
  { period: "30D", baseline: 640000, projected: 710000 },
  { period: "60D", baseline: 1180000, projected: 1320000 },
  { period: "90D", baseline: 1760000, projected: 2010000 },
  { period: "120D", baseline: 2290000, projected: 2620000 },
];

const riskBreakdown = [
  { name: "Pipeline", value: 82 },
  { name: "Forecast", value: 74 },
  { name: "Accounts", value: 61 },
  { name: "Channels", value: 57 },
];

const operatorMix = [
  { label: "Forecast", value: 34 },
  { label: "Pipeline", value: 28 },
  { label: "Growth", value: 22 },
  { label: "Expansion", value: 16 },
];

const operatorFeed = [
  {
    title: "Forecast Pressure",
    body: "Three active deals currently represent a disproportionate share of near-term forecast exposure.",
  },
  {
    title: "Growth Opportunity",
    body: "Organic and paid search signals continue to show stronger revenue efficiency than lower-converting awareness campaigns.",
  },
  {
    title: "Pipeline Risk",
    body: "Late-stage deal timing remains one of the biggest threats to forecast stability this cycle.",
  },
  {
    title: "Expansion Signal",
    body: "Top accounts are showing stronger engagement patterns, increasing cross-sell and upsell potential.",
  },
];

const strategicPrompts = [
  "What is the highest-risk forecast scenario right now?",
  "Which accounts should leadership prioritize this week?",
  "What deals are most likely to slip and why?",
  "Where should we shift budget to improve revenue efficiency?",
];

const operatorMoves = [
  {
    title: "Reduce forecast dependency",
    description:
      "Accelerate second-tier pipeline opportunities to reduce near-term dependence on a small group of late-stage deals.",
  },
  {
    title: "Escalate high-value accounts",
    description:
      "Direct leadership attention toward expansion-ready accounts showing stronger engagement and buying momentum.",
  },
  {
    title: "Tighten weak channel allocation",
    description:
      "Move budget away from lower-efficiency activity and protect spend behind the best-performing revenue motions.",
  },
  {
    title: "Force cleaner decision timelines",
    description:
      "Push the sales team to establish explicit next-step timing on late-stage opportunities at risk of slipping.",
  },
];

const pieColors = ["#67e8f9", "#93c5fd", "#86efac", "#facc15"];
const axisTick = { fill: "#94a3b8", fontSize: 11 };

const tooltipStyle = {
  background: "rgba(7,11,24,0.98)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#fff",
  boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
};

const moneyCompact = (num) => {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num}`;
};

const styles = {
  page: {
    minHeight: "100vh",
    color: "#fff",
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
    color: "rgba(125,211,252,0.88)",
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
  badgeWrap: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },
  statCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "14px 14px 13px",
    minHeight: 126,
    background: "rgba(255,255,255,0.032)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
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
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
    gap: 12,
  },
  section: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
    boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
  },
  sectionHead: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  sectionBody: { padding: 14 },
  summaryList: { display: "grid", gap: 8 },
  summaryItem: {
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(4,10,24,0.34)",
    borderRadius: 14,
    padding: "12px 13px",
    fontSize: 13,
    lineHeight: 1.55,
    color: "#dbe4f0",
  },
  chartShell: {
    height: 260,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.72)",
    padding: 10,
  },
  promptGrid: { display: "grid", gap: 10 },
  feedGrid: { display: "grid", gap: 10 },
  feedCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 13,
    background: "rgba(4,10,24,0.34)",
  },
  feedTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#fff",
  },
  feedBody: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 1.55,
    color: "#dbe4f0",
  },
  askPanel: {
    display: "grid",
    gap: 12,
  },
  askInputWrap: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.45)",
    padding: 12,
  },
  askTextarea: {
    width: "100%",
    minHeight: 110,
    resize: "vertical",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    padding: 14,
    fontSize: 14,
    lineHeight: 1.6,
    outline: "none",
    boxSizing: "border-box",
  },
  askActionRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 12,
  },
  askButton: {
    border: "1px solid rgba(56,189,248,0.35)",
    background: "linear-gradient(135deg, rgba(37,99,235,0.28), rgba(56,189,248,0.16))",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },
  askButtonSecondary: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "#dbe4f0",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  askMuted: {
    fontSize: 12,
    color: "rgba(203,213,225,0.72)",
  },
  askResponse: {
    border: "1px solid rgba(56,189,248,0.20)",
    borderRadius: 16,
    padding: 14,
    background:
      "linear-gradient(135deg, rgba(56,189,248,0.10), rgba(255,255,255,0.025))",
  },
  askResponseTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: "#bfefff",
    marginBottom: 8,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  askResponseBody: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#e7f1fb",
    whiteSpace: "pre-wrap",
  },
  askPromptButton: {
    width: "100%",
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "13px 14px",
    background: "rgba(4,10,24,0.34)",
    color: "#dbe4f0",
    fontSize: 13,
    lineHeight: 1.55,
    cursor: "pointer",
  },
};

function Section({ title, subtitle, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHead}>
        <div>
          {subtitle ? <div style={styles.sectionSub}>{subtitle}</div> : null}
          <div style={styles.sectionTitle}>{title}</div>
        </div>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function SmallStat({ label, value, note }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      {note ? <div style={styles.statNote}>{note}</div> : null}
    </div>
  );
}

export default function AtlasAIOperator() {
  const [question, setQuestion] = useState("");
  const [atlasResponse, setAtlasResponse] = useState("");
  const [asking, setAsking] = useState(false);

  const liveRevenue30 = useMemo(() => forecastTrend[2]?.baseline || 1760000, []);
  const livePipelineValue = useMemo(() => 4860000, []);

  const liveCoverage = useMemo(() => {
    if (!liveRevenue30) return 0;
    return Number((livePipelineValue / liveRevenue30).toFixed(1));
  }, [livePipelineValue, liveRevenue30]);

  const liveRiskLevel = useMemo(() => {
    const highest = Math.max(...riskBreakdown.map((item) => item.value));
    if (highest >= 80) return "High";
    if (highest >= 60) return "Moderate";
    return "Controlled";
  }, []);

  const summaryStats = useMemo(
    () => [
      { label: "Forecast Confidence", value: "78%", note: "Current modeled outlook" },
      {
        label: "Active Risk Alerts",
        value: String(alerts.length),
        note: "Requiring leadership review",
      },
      {
        label: "Recommended Actions",
        value: String(operatorMoves.length),
        note: "Priority operator moves",
      },
      { label: "Operator Mode", value: "Live", note: "Monitoring in real time" },
    ],
    []
  );

  const summaryPoints = useMemo(
    () => [
      `Pipeline coverage is currently holding around ${liveCoverage}x, which keeps the operator focused on forecast quality and stage progression.`,
      `${liveRiskLevel} risk is concentrated across forecast and pipeline categories, with leadership attention needed on late-stage execution.`,
      "Paid and organic performance still support upside when allocation stays disciplined.",
      "Atlas Operator should be used as a decision system, not just a reporting screen.",
    ],
    [liveCoverage, liveRiskLevel]
  );

  const operatorMetrics = useMemo(
    () => ({
      coverage: liveCoverage,
      revenue30: liveRevenue30,
      pipelineValue: livePipelineValue,
      forecastConfidence: 78,
      riskLevel: liveRiskLevel,
      activeRiskAlerts: alerts.length,
      recommendedActions: operatorMoves.length,
    }),
    [liveCoverage, liveRevenue30, livePipelineValue, liveRiskLevel]
  );

  async function handleAsk(customQuestion) {
    const finalQuestion = (customQuestion ?? question).trim();
    if (!finalQuestion || asking) return;

    try {
      setAsking(true);
      setAtlasResponse("");

      const res = await askAtlas(finalQuestion, operatorMetrics);

      setAtlasResponse(
        res?.answer ||
          res?.response ||
          "Atlas could not generate a response right now. Please try again."
      );
      setQuestion(finalQuestion);
    } catch (err) {
      console.error(err);
      setAtlasResponse(
        "Atlas ran into an issue while analyzing your request. Please try again."
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.hero}>
          <div style={styles.heroTop}>
            <div>
              <div style={styles.eyebrow}>Revenue Intelligence Copilot</div>
              <h1 style={styles.h1}>Atlas AI Operator</h1>
              <div style={styles.heroText}>
                Atlas AI Operator turns revenue signals into decisions. It monitors
                forecast risk, surfaces execution pressure, and recommends what
                leadership should act on next.
              </div>
            </div>

            <div style={styles.badgeWrap}>
              {["Operator Live", "Monitoring Forecast", "Atlas AI Active"].map((item) => (
                <div key={item} style={styles.badge}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          {summaryStats.map((item) => (
            <SmallStat
              key={item.label}
              label={item.label}
              value={item.value}
              note={item.note}
            />
          ))}
        </div>

        <div style={styles.twoCol}>
          <Section title="Forecast Trend" subtitle="Modeled Outlook">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastTrend}
                  margin={{ top: 6, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="period" tick={axisTick} stroke="#94a3b8" />
                  <YAxis
                    tick={axisTick}
                    stroke="#94a3b8"
                    tickFormatter={(v) => moneyCompact(v)}
                  />
                  <Tooltip
                    formatter={(value, name) => [moneyCompact(value), name]}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name="Baseline"
                    stroke="#93c5fd"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#93c5fd", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1400}
                    animationEasing="ease-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    name="Projected"
                    stroke="#86efac"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#86efac", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1700}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Operator Signal Distribution" subtitle="Signal Mix">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={operatorMix}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={82}
                    innerRadius={48}
                    paddingAngle={3}
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {operatorMix.map((entry, index) => (
                      <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Signal Share"]}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Risk Severity by Category" subtitle="Risk Model">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskBreakdown}
                  margin={{ top: 6, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={axisTick} stroke="#94a3b8" />
                  <YAxis tick={axisTick} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}/100`, "Severity"]}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#facc15"
                    radius={[10, 10, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Revenue Risk Alerts" subtitle="Flags">
            <RevenueRiskAlerts alerts={alerts} />
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Executive Briefing" subtitle="Narrative">
            <ExecutiveBriefing text={briefing} />
          </Section>

          <Section title="Operator Feed" subtitle="Live Notes">
            <div style={styles.feedGrid}>
              {operatorFeed.map((item) => (
                <div key={item.title} style={styles.feedCard}>
                  <div style={styles.feedTitle}>{item.title}</div>
                  <div style={styles.feedBody}>{item.body}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Next Best Operator Moves" subtitle="Priorities">
            <RecommendedActions actions={operatorMoves} />
          </Section>

          <Section title="Ask Atlas" subtitle="Copilot">
            <div style={styles.askPanel}>
              <div style={styles.askInputWrap}>
                <textarea
                  style={styles.askTextarea}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask Atlas why revenue is down, which deals are at risk, where to shift budget, or what leadership should prioritize next..."
                />

                <div style={styles.askActionRow}>
                  <button
                    style={styles.askButton}
                    onClick={() => handleAsk()}
                    disabled={asking}
                  >
                    {asking ? "Analyzing..." : "Ask Atlas"}
                  </button>

                  <button
                    style={styles.askButtonSecondary}
                    onClick={() => {
                      setQuestion("");
                      setAtlasResponse("");
                    }}
                    disabled={asking}
                  >
                    Clear
                  </button>

                  <div style={styles.askMuted}>
                    Atlas uses current operator metrics to generate an executive answer.
                  </div>
                </div>
              </div>

              {atlasResponse ? (
                <div style={styles.askResponse}>
                  <div style={styles.askResponseTitle}>Atlas Response</div>
                  <div style={styles.askResponseBody}>{atlasResponse}</div>
                </div>
              ) : null}
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Executive Summary" subtitle="Overview">
            <div style={styles.summaryList}>
              {summaryPoints.map((point) => (
                <div key={point} style={styles.summaryItem}>
                  {point}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Strategic Prompt Library" subtitle="Questions">
            <div style={styles.promptGrid}>
              {strategicPrompts.map((prompt) => (
                <button
                  key={prompt}
                  style={styles.askPromptButton}
                  onClick={() => {
                    setQuestion(prompt);
                    handleAsk(prompt);
                  }}
                  disabled={asking}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}