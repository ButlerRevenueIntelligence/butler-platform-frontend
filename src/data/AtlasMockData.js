export const dashboardStats = {
  projectedRevenue: "$4.2M",
  forecastConfidence: "91%",
  quarterTarget: "$5M",
  pipelineCoverage: "3.4x",
  totalPipeline: "$12.6M",
  opportunities: "138",
  winRate: "36%",
  dealVelocity: "41 days",
};

export const recommendedActions = [
  {
    title: "Follow up with 3 stalled enterprise deals",
    description: "Late-stage opportunities have had no movement in 10+ days.",
  },
  {
    title: "Shift ad budget to paid search",
    description: "Paid search is outperforming LinkedIn in cost per opportunity.",
  },
  {
    title: "Re-engage logistics accounts",
    description: "Logistics segment engagement has increased this week.",
  },
];

export const alerts = [
  "Pipeline coverage below recommended level.",
  "Two enterprise deals inactive for 10 days.",
  "LinkedIn campaign efficiency dropped 23%.",
];

export const briefing =
  "Revenue pacing is slightly behind target this month due to slower enterprise deal movement. Paid search continues to generate the most efficient cost-to-opportunity ratio, while three late-stage deals represent a high concentration of forecast risk and should be reviewed this week.";

export const alerts = [
  {
    title: "Late-stage deal concentration",
    severity: "High",
    detail:
      "Three late-stage opportunities now represent a large share of near-term forecast exposure.",
  },
  {
    title: "Pipeline timing risk",
    severity: "Medium",
    detail:
      "Several active opportunities are trending beyond expected decision windows and may slip.",
  },
  {
    title: "Channel efficiency drift",
    severity: "Medium",
    detail:
      "Lower-performing campaigns are reducing overall marketing efficiency and should be reviewed.",
  },
  {
    title: "Expansion dependency",
    severity: "Low",
    detail:
      "A growing share of upside forecast depends on expansion revenue from a limited set of accounts.",
  },
];

export const briefing = `
Atlas AI Operator is currently monitoring a forecast environment with meaningful late-stage concentration risk.

Pipeline coverage remains healthy enough to support growth, but forecast pressure is building around a small number of active deals. Leadership should focus on deal progression, cleaner next-step commitments, and tighter budget allocation toward the highest-efficiency revenue channels.

Primary recommendation:
Reduce near-term forecast dependency by accelerating second-tier opportunities, forcing clearer timelines on high-value deals, and protecting spend behind the strongest-performing growth motions.
`.trim();