import React from "react";
import RecommendedActions from "../components/atlas/RecommendedActions";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const summaryStats = [
  { label: "Marketing Pipeline", value: "$3.2M", note: "Sourced demand" },
  { label: "Sales Pipeline", value: "$2.6M", note: "Active revenue motion" },
  { label: "Partner Pipeline", value: "$1.6M", note: "Referral-driven opportunities" },
  { label: "Top Channel", value: "Paid Search", note: "Best efficiency right now" },
];

const summaryPoints = [
  "Paid Search remains the strongest qualified pipeline driver.",
  "SEO is producing efficient downstream results and deserves expansion.",
  "LinkedIn awareness spend is underperforming against conversion goals.",
  "Partner referrals continue to close with stronger quality than volume channels.",
];

const funnelCards = [
  { label: "Visitors", value: "18,400" },
  { label: "Leads", value: "1,240" },
  { label: "Opportunities", value: "96" },
  { label: "Deals", value: "22" },
  { label: "Revenue", value: "$412,000" },
];

const trendData = [
  { month: "Jan", spend: 18000, revenue: 142000 },
  { month: "Feb", spend: 22000, revenue: 176000 },
  { month: "Mar", spend: 20500, revenue: 168000 },
  { month: "Apr", spend: 26000, revenue: 218000 },
  { month: "May", spend: 24000, revenue: 232000 },
  { month: "Jun", spend: 28000, revenue: 274000 },
];

const channelData = [
  { name: "Paid Search", pipeline: 1340000 },
  { name: "SEO", pipeline: 920000 },
  { name: "LinkedIn Ads", pipeline: 610000 },
  { name: "Partner Referrals", pipeline: 330000 },
];

const attributionData = [
  { label: "Paid Search", value: 41 },
  { label: "SEO", value: 28 },
  { label: "LinkedIn Ads", value: 19 },
  { label: "Partner Referrals", value: 12 },
];

const channelRows = [
  {
    name: "Paid Search",
    pipeline: "$1.34M",
    conversion: "11.8%",
    cpl: "$76",
    won: "$142K",
    tone: "High",
  },
  {
    name: "SEO",
    pipeline: "$920K",
    conversion: "9.6%",
    cpl: "$58",
    won: "$118K",
    tone: "Strong",
  },
  {
    name: "LinkedIn Ads",
    pipeline: "$610K",
    conversion: "4.2%",
    cpl: "$132",
    won: "$61K",
    tone: "Weak",
  },
  {
    name: "Partner Referrals",
    pipeline: "$330K",
    conversion: "15.1%",
    cpl: "$34",
    won: "$91K",
    tone: "Elite",
  },
];

const actions = [
  {
    title: "Increase paid search spend",
    description: "The strongest volume and efficiency balance is still coming from paid search.",
  },
  {
    title: "Expand SEO content coverage",
    description: "SEO quality is strong enough to justify more commercial and bottom-funnel content.",
  },
  {
    title: "Reduce low-efficiency awareness spend",
    description: "LinkedIn should be tightened until conversion economics improve.",
  },
];

const pieColors = ["#67e8f9", "#93c5fd", "#facc15", "#4ade80"];
const axisTick = { fill: "#9fb0d0", fontSize: 11 };

const tooltipStyle = {
  background: "rgba(7,11,24,0.97)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  color: "#fff",
  boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
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
  },
  wrap: {
    maxWidth: 1380,
    margin: "0 auto",
    display: "grid",
    gap: 14,
  },
  hero: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(30,64,175,0.18), rgba(37,99,235,0.11), rgba(255,255,255,0.02))",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
  },
  heroTop: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 16,
    alignItems: "center",
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
    lineHeight: 1.04,
    letterSpacing: -0.7,
    fontWeight: 900,
    color: "#ffffff",
  },
  heroText: {
    marginTop: 12,
    maxWidth: 740,
    fontSize: 15,
    lineHeight: 1.7,
    color: "rgba(226,232,240,0.9)",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  statCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 15,
    background: "rgba(255,255,255,0.032)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    minHeight: 110,
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "rgba(148,163,184,0.88)",
    fontWeight: 700,
  },
  statValue: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.05,
  },
  statNote: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 1.45,
    color: "rgba(203,213,225,0.76)",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.12fr 0.88fr",
    gap: 14,
  },
  section: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
  },
  sectionHead: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: -0.35,
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
  summaryList: {
    display: "grid",
    gap: 10,
  },
  summaryItem: {
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(4,10,24,0.34)",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#dbe4f0",
  },
  funnelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 10,
  },
  funnelCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(4,10,24,0.34)",
    minWidth: 0,
  },
  chartShell: {
    height: 285,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.72)",
    padding: 12,
  },
  chartShellSmall: {
    height: 265,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.72)",
    padding: 12,
  },
  campaignGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginTop: 12,
  },
  channelList: {
    display: "grid",
    gap: 12,
  },
  channelCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(4,10,24,0.34)",
  },
  channelTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  channelName: {
    fontSize: 17,
    fontWeight: 800,
    color: "#fff",
  },
  channelMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(203,213,225,0.75)",
  },
  channelStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginTop: 12,
  },
  mini: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(255,255,255,0.03)",
  },
  miniLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "rgba(148,163,184,0.86)",
    fontWeight: 700,
  },
  miniValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: 800,
    color: "#fff",
  },
  attributionLayout: {
    display: "grid",
    gridTemplateColumns: "0.92fr 1.08fr",
    gap: 14,
    alignItems: "stretch",
  },
  attributionList: {
    display: "grid",
    gap: 10,
  },
};

function toneStyle(tone) {
  const map = {
    High: {
      border: "1px solid rgba(16,185,129,0.22)",
      background: "rgba(16,185,129,0.12)",
      color: "#bbf7d0",
    },
    Strong: {
      border: "1px solid rgba(56,189,248,0.22)",
      background: "rgba(56,189,248,0.12)",
      color: "#bae6fd",
    },
    Weak: {
      border: "1px solid rgba(245,158,11,0.22)",
      background: "rgba(245,158,11,0.12)",
      color: "#fde68a",
    },
    Elite: {
      border: "1px solid rgba(168,85,247,0.22)",
      background: "rgba(168,85,247,0.12)",
      color: "#e9d5ff",
    },
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
    ...(map[tone] || map.Strong),
  };
}

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

function SmallStat({ label, value, note }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      {note ? <div style={styles.statNote}>{note}</div> : null}
    </div>
  );
}

export default function GrowthEngine() {
  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.hero}>
          <div style={styles.heroTop}>
            <div>
              <div style={styles.eyebrow}>Growth Performance</div>
              <h1 style={styles.h1}>Growth Engine</h1>
              <div style={styles.heroText}>
                A focused operating view of how paid, organic, and partner channels
                are converting activity into qualified pipeline and closed revenue.
              </div>
            </div>

            <div style={styles.badgeWrap}>
              {[
                "Revenue Engine Active",
                "Attribution Synced",
                "Forecast Watching",
                "AI Monitoring",
              ].map((item) => (
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
          <Section title="Executive Summary" subtitle="Overview">
            <div style={styles.summaryList}>
              {summaryPoints.map((point) => (
                <div key={point} style={styles.summaryItem}>
                  {point}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Funnel Snapshot" subtitle="Demand Flow">
            <div style={styles.funnelGrid}>
              {funnelCards.map((item) => (
                <div key={item.label} style={styles.funnelCard}>
                  <div style={styles.statLabel}>{item.label}</div>
                  <div style={{ ...styles.statValue, fontSize: 23 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Spend vs Revenue Trend" subtitle="Momentum">
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
                    dataKey="spend"
                    stroke="#93c5fd"
                    strokeWidth={3}
                    dot={false}
                    animationDuration={1400}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#c4fbff"
                    strokeWidth={4}
                    dot={false}
                    animationDuration={1700}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Active Campaign" subtitle="Campaign Intelligence">
            <div style={styles.channelCard}>
              <div style={styles.statLabel}>Primary Motion</div>
              <div style={{ ...styles.sectionTitle, marginTop: 8, fontSize: 26 }}>
                Manufacturing Lead Generation
              </div>

              <div style={styles.campaignGrid}>
                <SmallStat label="Spend" value="$14,200" note="" />
                <SmallStat label="Leads" value="186" note="" />
                <SmallStat label="Opportunities" value="19" note="" />
                <SmallStat label="Closed Revenue" value="$412,000" note="" />
              </div>
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Pipeline by Channel" subtitle="Contribution">
            <div style={styles.chartShellSmall}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={axisTick} stroke="#94a3b8" />
                  <YAxis
                    tick={axisTick}
                    stroke="#94a3b8"
                    tickFormatter={(v) => moneyCompact(v)}
                  />
                  <Tooltip
                    formatter={(value) => [moneyCompact(value), "Pipeline"]}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="pipeline"
                    fill="#bffcff"
                    radius={[12, 12, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Marketing Attribution" subtitle="Channel Share">
            <div style={styles.attributionLayout}>
              <div style={styles.chartShellSmall}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attributionData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={48}
                      paddingAngle={2}
                      animationDuration={1500}
                    >
                      {attributionData.map((entry, index) => (
                        <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Attribution"]}
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.attributionList}>
                {attributionData.map((row) => (
                  <div
                    key={row.label}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      padding: 14,
                      background: "rgba(4,10,24,0.34)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <div style={{ fontSize: 14, color: "#dbe4f0", fontWeight: 700 }}>
                        {row.label}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>
                        {row.value}%
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        height: 8,
                        background: "#1e293b",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${row.value}%`,
                          background: "linear-gradient(90deg, #38bdf8, #6366f1)",
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Channel Performance Radar" subtitle="Efficiency">
            <div style={styles.channelList}>
              {channelRows.map((row) => (
                <div key={row.name} style={styles.channelCard}>
                  <div style={styles.channelTop}>
                    <div>
                      <div style={styles.channelName}>{row.name}</div>
                      <div style={styles.channelMeta}>Pipeline {row.pipeline}</div>
                    </div>
                    <div style={toneStyle(row.tone)}>{row.tone}</div>
                  </div>

                  <div style={styles.channelStats}>
                    <div style={styles.mini}>
                      <div style={styles.miniLabel}>Conversion</div>
                      <div style={styles.miniValue}>{row.conversion}</div>
                    </div>
                    <div style={styles.mini}>
                      <div style={styles.miniLabel}>CPL</div>
                      <div style={styles.miniValue}>{row.cpl}</div>
                    </div>
                    <div style={styles.mini}>
                      <div style={styles.miniLabel}>Won Revenue</div>
                      <div style={styles.miniValue}>{row.won}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Recommended Actions" subtitle="Priorities">
            <RecommendedActions actions={actions} />
          </Section>
        </div>
      </div>
    </div>
  );
}