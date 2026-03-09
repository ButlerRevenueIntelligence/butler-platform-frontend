import React from "react";
import MetricCard from "../components/atlas/MetricCard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import AtlasBenchmarks from "../components/atlas/AtlasBenchmarks";

<AtlasBenchmarks />

const executiveSignals = [
  {
    title: "Board-ready reporting",
    body: "Summaries built around revenue, risk, and decisions.",
  },
  {
    title: "Executive narrative",
    body: "Translate raw platform data into strategic reporting.",
  },
  {
    title: "Revenue-linked analysis",
    body: "Tie sales, marketing, pipeline, and forecast together.",
  },
];

const reportTypes = [
  {
    title: "Board Report",
    description:
      "High-level reporting focused on revenue trend, forecast confidence, risk concentration, and strategic action.",
    meta: "Best for board meetings and investor updates",
  },
  {
    title: "Revenue Summary",
    description:
      "A concise snapshot of pipeline coverage, current momentum, and modeled executive outlook.",
    meta: "Best for weekly and monthly revenue reviews",
  },
  {
    title: "Sales Review",
    description:
      "Deal movement, stage pressure, close readiness, and execution risks across the revenue board.",
    meta: "Best for sales leadership and forecast calls",
  },
  {
    title: "Marketing Impact",
    description:
      "Channel performance tied directly to opportunity creation, efficiency, and revenue contribution.",
    meta: "Best for growth and channel reporting",
  },
];

const aiInsights = [
  "Leadership reporting should lead with trend direction, risk concentration, and the decisions required next.",
  "Revenue summaries are strongest when they stay tight around forecast confidence, coverage, and momentum.",
  "Sales reviews should emphasize stage friction, blocker ownership, and next-step accountability.",
  "Marketing reporting should show pipeline and revenue influence, not just activity volume.",
];

const briefingSections = [
  "Revenue performance and direction",
  "Forecast confidence and stability",
  "Pipeline health and stage pressure",
  "Top risks impacting near-term outcomes",
  "Leadership priorities and next actions",
];

const trendData = [
  { month: "Jan", revenue: 420000, pipeline: 1800000 },
  { month: "Feb", revenue: 465000, pipeline: 2100000 },
  { month: "Mar", revenue: 510000, pipeline: 2350000 },
  { month: "Apr", revenue: 545000, pipeline: 2480000 },
  { month: "May", revenue: 590000, pipeline: 2720000 },
  { month: "Jun", revenue: 640000, pipeline: 3010000 },
];

const reportValueData = [
  { name: "Board", value: 92 },
  { name: "Revenue", value: 86 },
  { name: "Sales", value: 81 },
  { name: "Marketing", value: 78 },
];

const summaryStats = [
  { label: "Reports Ready", value: "4", subtext: "Prepared for export", accent: "sky" },
  { label: "Forecast Confidence", value: "78%", subtext: "Modeled executive outlook", accent: "emerald" },
  { label: "Revenue Stability", value: "82/100", subtext: "Current operating confidence", accent: "violet" },
  { label: "Board Readiness", value: "High", subtext: "Leadership briefing quality", accent: "amber" },
];

const moneyCompact = (num) => {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num}`;
};

const axisTick = { fill: "#9fb0d0", fontSize: 11 };

const tooltipStyle = {
  background: "rgba(7,11,24,0.96)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "14px",
  color: "#fff",
};

const styles = {
  page: {
    minHeight: "100vh",
    color: "#fff",
  },
  wrap: {
    maxWidth: 1380,
    margin: "0 auto",
    display: "grid",
    gap: 16,
  },
  hero: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(30,64,175,0.18), rgba(37,99,235,0.12), rgba(255,255,255,0.025))",
    boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
  },
  heroTop: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 18,
    alignItems: "start",
  },
  eyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    color: "rgba(125,211,252,0.9)",
    fontWeight: 700,
  },
  h1: {
    margin: "8px 0 0",
    fontSize: 34,
    lineHeight: 1.05,
    letterSpacing: -0.8,
    fontWeight: 900,
    color: "#ffffff",
  },
  heroText: {
    marginTop: 12,
    maxWidth: 760,
    fontSize: 15,
    lineHeight: 1.75,
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
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    fontSize: 11,
    fontWeight: 700,
    color: "#e2e8f0",
    whiteSpace: "nowrap",
  },
  signalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  signalCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,255,255,0.032)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
  },
  signalTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
  },
  signalBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 1.65,
    color: "rgba(203,213,225,0.78)",
  },
  statsWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 18,
    padding: "2px 4px 0",
    alignItems: "end",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 16,
  },
  section: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
    boxShadow: "0 12px 26px rgba(0,0,0,0.14)",
  },
  sectionHead: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: -0.4,
    color: "#fff",
  },
  sectionSub: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "rgba(148,163,184,0.75)",
    fontWeight: 700,
    marginBottom: 4,
  },
  sectionBody: {
    padding: 16,
  },
  chartShell: {
    height: 280,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.72)",
    padding: 12,
  },
  insightStack: {
    display: "grid",
    gap: 10,
  },
  insightItem: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(4,10,24,0.34)",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 14,
    lineHeight: 1.65,
    color: "#dbe4f0",
  },
  reportGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  reportCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "rgba(4,10,24,0.34)",
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
  },
  reportBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 1.7,
    color: "rgba(219,228,240,0.84)",
  },
  reportMeta: {
    marginTop: 8,
    fontSize: 12,
    color: "rgba(148,163,184,0.82)",
  },
  buttonRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
  },
  primaryBtn: {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    background: "#fff",
    color: "#000",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
  },
  secondaryBtn: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 12,
    padding: "10px 14px",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  bulletStack: {
    display: "grid",
    gap: 10,
  },
  bulletRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(4,10,24,0.34)",
    borderRadius: 14,
    padding: "13px 14px",
  },
  bulletDot: {
    width: 24,
    height: 24,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(56,189,248,0.15)",
    color: "#7dd3fc",
    fontWeight: 800,
    fontSize: 12,
    flexShrink: 0,
    marginTop: 2,
  },
  useCaseGrid: {
    display: "grid",
    gap: 10,
  },
  useCaseCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
    background: "rgba(4,10,24,0.34)",
  },
  useCaseTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: "#fff",
  },
  useCaseBody: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 1.7,
    color: "rgba(219,228,240,0.84)",
  },
};

function Section({ title, subtitle, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHead}>
        {subtitle ? <div style={styles.sectionSub}>{subtitle}</div> : null}
        <div style={styles.sectionTitle}>{title}</div>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function InsightStack({ items = [] }) {
  return (
    <div style={styles.insightStack}>
      {items.map((item) => (
        <div key={item} style={styles.insightItem}>
          {item}
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.hero}>
          <div style={styles.heroTop}>
            <div>
              <div style={styles.eyebrow}>Reporting Layer</div>
              <h1 style={styles.h1}>Reports & Executive Briefings</h1>
              <div style={styles.heroText}>
                Atlas transforms platform intelligence into leadership-ready reporting.
                Prepare board reports, revenue summaries, sales reviews, and marketing
                impact narratives with a cleaner executive view.
              </div>
            </div>

            <div style={styles.badgeWrap}>
              {[
                "Reporting Active",
                "Executive Briefing Ready",
                "Atlas AI Summarizing",
              ].map((item) => (
                <div key={item} style={styles.badge}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.signalGrid}>
          {executiveSignals.map((item) => (
            <div key={item.title} style={styles.signalCard}>
              <div style={styles.signalTitle}>{item.title}</div>
              <div style={styles.signalBody}>{item.body}</div>
            </div>
          ))}
        </div>

        <div style={styles.statsWrap}>
          {summaryStats.map((stat) => (
            <MetricCard
              key={stat.label}
              title={stat.label}
              value={stat.value}
              subtext={stat.subtext}
              accent={stat.accent}
            />
          ))}
        </div>

        <div style={styles.twoCol}>
          <Section title="Revenue & Pipeline Snapshot" subtitle="Performance Trend">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="month" tick={axisTick} stroke="#94a3b8" />
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
                    dataKey="revenue"
                    stroke="#86efac"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#86efac" }}
                    activeDot={{ r: 6 }}
                    animationDuration={1400}
                  />
                  <Line
                    type="monotone"
                    dataKey="pipeline"
                    stroke="#67e8f9"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#67e8f9" }}
                    activeDot={{ r: 6 }}
                    animationDuration={1700}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Atlas AI Reporting Insights" subtitle="Executive Guidance">
            <InsightStack items={aiInsights} />
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Generate Reports" subtitle="Output Library">
            <div style={styles.reportGrid}>
              {reportTypes.map((report) => (
                <div key={report.title} style={styles.reportCard}>
                  <div style={styles.reportTitle}>{report.title}</div>
                  <div style={styles.reportBody}>{report.description}</div>
                  <div style={styles.reportMeta}>{report.meta}</div>

                  <div style={styles.buttonRow}>
                    <button style={styles.primaryBtn}>Generate</button>
                    <button style={styles.secondaryBtn}>Preview</button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Report Type Value" subtitle="Strategic Score">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportValueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={axisTick} stroke="#94a3b8" />
                  <YAxis tick={axisTick} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}/100`, "Strategic Value"]}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#93c5fd"
                    radius={[10, 10, 0, 0]}
                    animationDuration={1400}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Executive Briefing Structure" subtitle="Recommended Sections">
            <div style={styles.bulletStack}>
              {briefingSections.map((item, idx) => (
                <div key={item} style={styles.bulletRow}>
                  <div style={styles.bulletDot}>{idx + 1}</div>
                  <div style={{ color: "#e5edf8", fontSize: 15, lineHeight: 1.6 }}>
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Recommended Reporting Use Cases" subtitle="Where To Use">
            <div style={styles.useCaseGrid}>
              <div style={styles.useCaseCard}>
                <div style={styles.useCaseTitle}>Board & Investor Meetings</div>
                <div style={styles.useCaseBody}>
                  Lead with performance direction, strategic risk, and the decisions leadership needs to make next.
                </div>
              </div>

              <div style={styles.useCaseCard}>
                <div style={styles.useCaseTitle}>Weekly Revenue Reviews</div>
                <div style={styles.useCaseBody}>
                  Keep reporting focused on pipeline coverage, close confidence, deal movement, and execution pressure.
                </div>
              </div>

              <div style={styles.useCaseCard}>
                <div style={styles.useCaseTitle}>Growth & Channel Reviews</div>
                <div style={styles.useCaseBody}>
                  Show which initiatives are influencing opportunity creation, efficiency, and closed revenue outcomes.
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}