import React, { useMemo } from "react";

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function OpportunityRadar({ pipeline, revenue }) {

  const opportunities = useMemo(() => {

    const pipelineValue = pipeline?.pipelineValue || 0;
    const rev = revenue || 0;

    const items = [];

    if (pipelineValue > 0) {
      items.push({
        title: "Pipeline Conversion Lift",
        impact: money(pipelineValue * 0.05),
        desc: "Improving close rate by 5% unlocks additional revenue without increasing spend."
      });
    }

    if (rev > 0) {
      items.push({
        title: "Marketing Efficiency Recovery",
        impact: money(rev * 0.1),
        desc: "Reducing wasted spend by 10% increases margin and reinvestment potential."
      });
    }

    if (pipelineValue < rev * 2) {
      items.push({
        title: "Pipeline Expansion Needed",
        impact: money(rev * 3),
        desc: "Pipeline coverage below 3x suggests expansion opportunities in lead generation."
      });
    }

    return items;

  }, [pipeline, revenue]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {opportunities.map((o, i) => (
        <div key={i} style={{
          padding: 14,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)"
        }}>
          <div style={{ fontWeight: 900 }}>{o.title}</div>
          <div style={{ marginTop: 6 }}>{o.desc}</div>
          <div style={{ marginTop: 6, fontWeight: 900, color:"#38BDF8" }}>
            Potential Value: {o.impact}
          </div>
        </div>
      ))}
    </div>
  );
}