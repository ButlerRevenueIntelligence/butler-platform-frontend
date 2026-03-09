import React from "react";

export default function ExecutiveBriefing({ kpis }) {
  if (!kpis) return null;

  const growth =
    kpis.wow == null
      ? "Revenue momentum is stable."
      : kpis.wow >= 0
      ? `Revenue increased ${Math.abs(kpis.wow).toFixed(1)}% week-over-week.`
      : `Revenue declined ${Math.abs(kpis.wow).toFixed(1)}% week-over-week.`;

  return (
    <div style={{
      background:"rgba(10,16,35,0.55)",
      border:"1px solid rgba(255,255,255,0.08)",
      borderRadius:18,
      padding:18
    }}>
      <h3 style={{marginBottom:10}}>Executive Revenue Briefing</h3>

      <div style={{lineHeight:1.7,fontSize:14,opacity:.9}}>
        <div>{growth}</div>

        <div>
          Pipeline coverage currently sits at <strong>{kpis.coverage.toFixed(1)}x</strong>.
        </div>

        <div>
          Atlas projects <strong>${Math.round(kpis.forecast90).toLocaleString()}</strong>
          in revenue over the next 90 days.
        </div>

        <div>
          Customer acquisition cost averages <strong>${Math.round(kpis.cac)}</strong>.
        </div>
      </div>
    </div>
  );
}