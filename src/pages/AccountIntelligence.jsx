import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
} from "recharts";

import AtlasAccountExpansionSignals from "../components/atlas/AtlasAccountExpansionSignals";

const topStats = [
  { label: "Top Opportunity Accounts", value: "3", note: "Highest-priority targets" },
  { label: "Highest Engagement", value: "84", note: "Current peak score" },
  { label: "Best Expansion Signal", value: "71%", note: "Strongest account fit" },
  { label: "Revenue Potential", value: "$545K", note: "Near-term account upside" },
];

const summaryPoints = [
  "Manufacturing accounts are producing the highest revenue potential right now.",
  "Healthcare accounts show strong engagement and mid-range expansion probability.",
  "Apex Manufacturing is currently the strongest near-term expansion target.",
  "Multi-stakeholder engagement is rising across top accounts.",
];

const opportunityRadar = [
  "Apex Manufacturing should move into an executive expansion motion immediately.",
  "Nova Healthcare Systems has budget movement, but stakeholder alignment still needs work.",
  "Titan Logistics Group remains promising, but account maturity trails the top two targets.",
  "Revenue quality improves when account scoring is paired with buying-signal monitoring.",
];

const accounts = [
  {
    name: "Apex Manufacturing",
    engagement: 84,
    expansion: 71,
    industry: "Manufacturing",
    revenuePotential: 220000,
    revenueLabel: "$220K",
    buyingSignal: "Hiring growth team",
    priority: "High Priority",
    tone: "High",
  },
  {
    name: "Nova Healthcare Systems",
    engagement: 77,
    expansion: 64,
    industry: "Healthcare",
    revenuePotential: 180000,
    revenueLabel: "$180K",
    buyingSignal: "Budget activity detected",
    priority: "Expansion Watch",
    tone: "Strong",
  },
  {
    name: "Titan Logistics Group",
    engagement: 69,
    expansion: 58,
    industry: "Logistics",
    revenuePotential: 145000,
    revenueLabel: "$145K",
    buyingSignal: "Stakeholder re-engagement",
    priority: "Watchlist",
    tone: "Watch",
  },
];

const nextMoves = [
  "Prioritize executive outreach on Apex Manufacturing this week.",
  "Map budget authority and internal buying roles for Nova Healthcare Systems.",
  "Reinforce logistics messaging around operational efficiency and revenue visibility.",
  "Create account-specific next-step plans for the top three opportunities.",
];

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
    lineHeight: 1.7,
    color: "rgba(226,232,240,0.9)",
  },
  badgeWrap: {
    marginTop: 14,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
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
    minHeight: 108,
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
    gridTemplateColumns: "1.08fr 0.92fr",
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
    height: 280,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.72)",
    padding: 12,
  },
  accountList: {
    display: "grid",
    gap: 12,
  },
  accountCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(4,10,24,0.34)",
  },
  accountTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  accountName: {
    fontSize: 17,
    fontWeight: 800,
    color: "#fff",
  },
  accountMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(203,213,225,0.78)",
  },
  accountGrid: {
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
  tableWrap: {
    overflowX: "auto",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.34)",
  },
  table: {
    width: "100%",
    minWidth: 760,
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.82)",
    padding: "13px 15px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  td: {
    padding: "14px 15px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 14,
    color: "#dbe4f0",
    verticalAlign: "top",
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
    Watch: {
      border: "1px solid rgba(245,158,11,0.22)",
      background: "rgba(245,158,11,0.12)",
      color: "#fde68a",
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

export default function AccountIntelligence() {
  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.hero}>
          <div style={styles.eyebrow}>Prioritize the Right Accounts</div>
          <h1 style={styles.h1}>Account Intelligence</h1>
          <div style={styles.heroText}>
            Atlas identifies which accounts have the best combination of engagement,
            expansion probability, and revenue upside so leadership can focus on the
            right growth opportunities.
          </div>

          <div style={styles.badgeWrap}>
            {[
              "Opportunity Radar Active",
              "Expansion Signals Synced",
              "Atlas AI Monitoring",
            ].map((item) => (
              <div key={item} style={styles.badge}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <AtlasAccountExpansionSignals clients={accounts} />

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
          <Section title="Executive Summary" subtitle="Overview">
            <div style={styles.summaryList}>
              {summaryPoints.map((point) => (
                <div key={point} style={styles.summaryItem}>
                  {point}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Opportunity Radar" subtitle="Signals">
            <div style={styles.summaryList}>
              {opportunityRadar.map((point) => (
                <div key={point} style={styles.summaryItem}>
                  {point}
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Revenue Potential by Account" subtitle="Upside">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accounts} barCategoryGap={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={axisTick} stroke="#94a3b8" />
                  <YAxis
                    tick={axisTick}
                    stroke="#94a3b8"
                    tickFormatter={(v) => moneyCompact(v)}
                  />
                  <Tooltip
                    formatter={(value) => [moneyCompact(value), "Revenue Potential"]}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="revenuePotential"
                    fill="#bffcff"
                    radius={[12, 12, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Engagement vs Expansion" subtitle="Positioning">
            <div style={styles.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 12, bottom: 6, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    type="number"
                    dataKey="engagement"
                    name="Engagement"
                    stroke="#94a3b8"
                    tick={axisTick}
                    domain={[50, 100]}
                  />
                  <YAxis
                    type="number"
                    dataKey="expansion"
                    name="Expansion"
                    stroke="#94a3b8"
                    tick={axisTick}
                    unit="%"
                    domain={[40, 100]}
                  />
                  <ZAxis type="number" dataKey="revenuePotential" range={[140, 420]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value, name) => {
                      if (name === "revenuePotential") {
                        return [moneyCompact(value), "Revenue Potential"];
                      }
                      if (name === "expansion") {
                        return [`${value}%`, "Expansion"];
                      }
                      return [value, name];
                    }}
                    labelFormatter={() => ""}
                    contentStyle={tooltipStyle}
                  />
                  <Scatter
                    name="Accounts"
                    data={accounts}
                    fill="#bffcff"
                    animationDuration={1500}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Top Opportunity Accounts" subtitle="Accounts">
            <div style={styles.accountList}>
              {accounts.map((acct) => (
                <div key={acct.name} style={styles.accountCard}>
                  <div style={styles.accountTop}>
                    <div>
                      <div style={styles.accountName}>{acct.name}</div>
                      <div style={styles.accountMeta}>
                        {acct.industry} • {acct.buyingSignal}
                      </div>
                    </div>
                    <div style={toneStyle(acct.tone)}>{acct.priority}</div>
                  </div>

                  <div style={styles.accountGrid}>
                    <div style={styles.mini}>
                      <div style={styles.miniLabel}>Engagement</div>
                      <div style={styles.miniValue}>{acct.engagement}</div>
                    </div>
                    <div style={styles.mini}>
                      <div style={styles.miniLabel}>Expansion</div>
                      <div style={styles.miniValue}>{acct.expansion}%</div>
                    </div>
                    <div style={styles.mini}>
                      <div style={styles.miniLabel}>Revenue Potential</div>
                      <div style={styles.miniValue}>{acct.revenueLabel}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Account Table" subtitle="Detail">
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Account</th>
                    <th style={styles.th}>Industry</th>
                    <th style={styles.th}>Engagement</th>
                    <th style={styles.th}>Expansion</th>
                    <th style={styles.th}>Potential</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acct, idx) => (
                    <tr key={acct.name}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 800, color: "#fff" }}>{acct.name}</div>
                        <div style={{ marginTop: 6, color: "rgba(203,213,225,0.72)" }}>
                          {acct.buyingSignal}
                        </div>
                      </td>
                      <td style={styles.td}>{acct.industry}</td>
                      <td style={styles.td}>{acct.engagement}</td>
                      <td style={styles.td}>{acct.expansion}%</td>
                      <td
                        style={{
                          ...styles.td,
                          borderBottom:
                            idx === accounts.length - 1
                              ? "none"
                              : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {acct.revenueLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        <Section title="Next Best Account Moves" subtitle="Priorities">
          <div style={styles.summaryList}>
            {nextMoves.map((move) => (
              <div key={move} style={styles.summaryItem}>
                {move}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}