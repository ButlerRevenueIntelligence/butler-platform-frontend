// frontend/src/pages/DealWarRoom.jsx
import React from "react";
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
  AreaChart,
  Area,
} from "recharts";

import AtlasDealIntelligencePanel from "../components/atlas/AtlasDealIntelligencePanel";

const topStats = [
  {
    label: "Weighted Pipeline",
    value: "$4.85M",
    note: "Probability-adjusted open pipeline",
  },
  {
    label: "Late-Stage Exposure",
    value: "$2.10M",
    note: "Near-term forecast concentration",
  },
  {
    label: "Win Probability",
    value: "34%",
    note: "Modeled close likelihood",
  },
  {
    label: "Deals at Risk",
    value: "5",
    note: "Need executive attention",
  },
];

const executiveSignals = [
  "Three late-stage deals represent 58% of near-term forecast concentration.",
  "Two enterprise opportunities have slipped decision dates in the last 10 days.",
  "One high-value expansion deal is blocked by procurement timing.",
  "Leadership attention should stay on blocker removal, owner accountability, and close-plan discipline.",
];

const stageCards = [
  {
    stage: "Discovery",
    deals: 6,
    value: "$1.20M",
    note: "Healthy top-of-funnel motion",
  },
  {
    stage: "Proposal",
    deals: 4,
    value: "$1.65M",
    note: "Strong commercial engagement",
  },
  {
    stage: "Negotiation",
    deals: 3,
    value: "$1.10M",
    note: "Highest forecast impact",
  },
  {
    stage: "Commit",
    deals: 2,
    value: "$740K",
    note: "Needs tight close coordination",
  },
];

const forecastTrend = [
  { period: "30D", baseline: 1200000, commit: 1420000 },
  { period: "60D", baseline: 1880000, commit: 2140000 },
  { period: "90D", baseline: 2520000, commit: 2860000 },
  { period: "120D", baseline: 3180000, commit: 3560000 },
];

const stagePressure = [
  { name: "Discovery", value: 42 },
  { name: "Proposal", value: 69 },
  { name: "Negotiation", value: 84 },
  { name: "Commit", value: 78 },
];

const dealTable = [
  {
    name: "Apex Manufacturing Expansion",
    owner: "Armon",
    stage: "Negotiation",
    value: "$620K",
    close: "42%",
    risk: "Medium",
    blocker: "Procurement approval",
  },
  {
    name: "Nova Healthcare Rollout",
    owner: "Sales Lead",
    stage: "Commit",
    value: "$410K",
    close: "58%",
    risk: "Medium",
    blocker: "Decision timing",
  },
  {
    name: "Titan Logistics Attribution Setup",
    owner: "Growth Team",
    stage: "Proposal",
    value: "$285K",
    close: "31%",
    risk: "Low",
    blocker: "Stakeholder alignment",
  },
  {
    name: "Vertex Industrial Revenue OS",
    owner: "Executive Team",
    stage: "Negotiation",
    value: "$770K",
    close: "47%",
    risk: "High",
    blocker: "Budget confirmation",
  },
];

const interventionQueue = [
  {
    title: "Reconfirm executive sponsor on Vertex Industrial",
    detail:
      "Budget approval is stalled and forecast concentration is too high to leave unaddressed.",
    tone: "high",
  },
  {
    title: "Lock a final commercial timeline for Nova Healthcare",
    detail:
      "Close confidence improves materially if legal and decision stakeholders are aligned this week.",
    tone: "medium",
  },
  {
    title: "Accelerate second-tier proposal opportunities",
    detail:
      "Pipeline diversification reduces overreliance on three near-term opportunities.",
    tone: "medium",
  },
  {
    title: "Run a close-plan review on all negotiation-stage deals",
    detail:
      "The current stage mix suggests pressure is clustering too heavily in late-stage motion.",
    tone: "high",
  },
];

const aiNotes = [
  "Forecast quality is acceptable, but too much near-term revenue depends on a narrow deal cluster.",
  "The most important move is reducing concentration risk, not simply adding more top-of-funnel volume.",
  "Commit-stage confidence will improve with clearer owner accountability and decision date discipline.",
  "War room reporting should stay focused on deal movement, blockers, executive ownership, and projected impact.",
];

const axisTick = { fill: "#9fb0d0", fontSize: 11 };

const tooltipStyle = {
  background: "rgba(7,11,24,0.98)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#fff",
  boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
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
    gridTemplateColumns: "1.25fr 0.75fr",
    gap: 16,
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
    lineHeight: 1.04,
    letterSpacing: -0.7,
    fontWeight: 900,
    color: "#ffffff",
  },
  heroText: {
    marginTop: 12,
    maxWidth: 760,
    fontSize: 15,
    lineHeight: 1.72,
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
    minHeight: 116,
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
    fontSize: 30,
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
  chartShell: {
    height: 285,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.72)",
    padding: 12,
  },
  stageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  stageCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(4,10,24,0.34)",
    minHeight: 136,
  },
  stageName: {
    fontSize: 17,
    fontWeight: 800,
    color: "#fff",
  },
  stageMeta: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 1.5,
    color: "rgba(203,213,225,0.78)",
  },
  stageValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.1,
  },
  queueList: {
    display: "grid",
    gap: 12,
  },
  queueCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(4,10,24,0.34)",
  },
  queueTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  queueTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: "#fff",
    maxWidth: "78%",
  },
  queueBody: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 1.65,
    color: "rgba(219,228,240,0.84)",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 880,
  },
  th: {
    textAlign: "left",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.9)",
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "#e5edf8",
    fontSize: 14,
    lineHeight: 1.5,
    verticalAlign: "top",
  },
  noteCards: {
    display: "grid",
    gap: 10,
  },
  noteCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(4,10,24,0.34)",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#dbe4f0",
  },
};

function moneyCompact(num) {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num}`;
}

function tonePill(tone) {
  const map = {
    high: {
      border: "1px solid rgba(239,68,68,0.22)",
      background: "rgba(239,68,68,0.12)",
      color: "#fecaca",
    },
    medium: {
      border: "1px solid rgba(245,158,11,0.22)",
      background: "rgba(245,158,11,0.12)",
      color: "#fde68a",
    },
    low: {
      border: "1px solid rgba(56,189,248,0.22)",
      background: "rgba(56,189,248,0.12)",
      color: "#bae6fd",
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
    ...(map[tone] || map.medium),
  };
}

function riskPill(risk) {
  const key = String(risk || "").toLowerCase();
  return tonePill(key === "high" ? "high" : key === "low" ? "low" : "medium");
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

export default function DealWarRoom() {
  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.hero}>
          <div style={styles.heroTop}>
            <div>
              <div style={styles.eyebrow}>Executive Command Center</div>
              <h1 style={styles.h1}>Deal War Room</h1>
              <div style={styles.heroText}>
                A focused operating view for leadership to manage late-stage deal
                movement, forecast concentration, blocker resolution, and next-best
                actions across the revenue board.
              </div>
            </div>

            <div style={styles.badgeWrap}>
              {[
                "Forecast Monitoring",
                "Deal Pressure Live",
                "Executive Review Active",
                "Close Plans In Motion",
              ].map((item) => (
                <div key={item} style={styles.badge}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          {topStats.map((item) => (
            <SmallStat
              key={item.label}
              label={item.label}
              value={item.value}
              note={item.note}
            />
          ))}
        </div>

        <div style={styles.twoCol}>
          <Section title="Executive Pressure Signals" subtitle="Board View">
            <div style={styles.summaryList}>
              {executiveSignals.map((point) => (
                <div key={point} style={styles.summaryItem}>
                  {point}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Stage Distribution" subtitle="Pipeline Mix">
            <div style={styles.stageGrid}>
              {stageCards.map((item) => (
                <div key={item.stage} style={styles.stageCard}>
                  <div style={styles.stageName}>{item.stage}</div>
                  <div style={styles.stageMeta}>{item.deals} deals</div>
                  <div style={styles.stageValue}>{item.value}</div>
                  <div style={styles.stageMeta}>{item.note}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Forecast Trend" subtitle="Modeled Outlook">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />
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
                    stroke="#93c5fd"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#93c5fd" }}
                    activeDot={{ r: 6 }}
                    animationDuration={1400}
                  />
                  <Line
                    type="monotone"
                    dataKey="commit"
                    stroke="#86efac"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#86efac" }}
                    activeDot={{ r: 6 }}
                    animationDuration={1700}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Stage Pressure" subtitle="Risk Model">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stagePressure}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <XAxis dataKey="name" tick={axisTick} stroke="#94a3b8" />
                  <YAxis tick={axisTick} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}/100`, "Pressure"]}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#facc15"
                    fill="#facc15"
                    fillOpacity={0.28}
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <AtlasDealIntelligencePanel deals={dealTable} />

        <div style={styles.twoCol}>
          <Section title="Top Active Opportunities" subtitle="Deal Board">
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Deal</th>
                    <th style={styles.th}>Owner</th>
                    <th style={styles.th}>Stage</th>
                    <th style={styles.th}>Value</th>
                    <th style={styles.th}>Close</th>
                    <th style={styles.th}>Risk</th>
                    <th style={styles.th}>Primary Blocker</th>
                  </tr>
                </thead>
                <tbody>
                  {dealTable.map((row) => (
                    <tr key={row.name}>
                      <td style={styles.td}>{row.name}</td>
                      <td style={styles.td}>{row.owner}</td>
                      <td style={styles.td}>{row.stage}</td>
                      <td style={styles.td}>{row.value}</td>
                      <td style={styles.td}>{row.close}</td>
                      <td style={styles.td}>
                        <span style={riskPill(row.risk)}>{row.risk}</span>
                      </td>
                      <td style={styles.td}>{row.blocker}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Executive Intervention Queue" subtitle="Priorities">
            <div style={styles.queueList}>
              {interventionQueue.map((item) => (
                <div key={item.title} style={styles.queueCard}>
                  <div style={styles.queueTop}>
                    <div style={styles.queueTitle}>{item.title}</div>
                    <div style={tonePill(item.tone)}>
                      {item.tone === "high" ? "Immediate" : "Priority"}
                    </div>
                  </div>
                  <div style={styles.queueBody}>{item.detail}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="AI Deal Notes" subtitle="Executive Intelligence">
            <div style={styles.noteCards}>
              {aiNotes.map((note) => (
                <div key={note} style={styles.noteCard}>
                  {note}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Stage Pressure by Category" subtitle="Board Pressure">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stagePressure}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <XAxis dataKey="name" tick={axisTick} stroke="#94a3b8" />
                  <YAxis tick={axisTick} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}/100`, "Pressure"]}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#67e8f9"
                    radius={[10, 10, 0, 0]}
                    animationDuration={1400}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}