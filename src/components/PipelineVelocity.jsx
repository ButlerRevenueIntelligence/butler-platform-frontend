import React from "react";

export default function PipelineVelocity({ pipeline }) {
  const deals = pipeline?.deals || [];

  const avgDeal =
    deals.length > 0
      ? deals.reduce((a, d) => a + (Number(d.amount) || 0), 0) / deals.length
      : 0;

  return (
    <div style={{
      background:"rgba(10,16,35,0.55)",
      border:"1px solid rgba(255,255,255,0.08)",
      borderRadius:18,
      padding:18
    }}>
      <h3>Pipeline Velocity</h3>

      <div style={{marginTop:10,lineHeight:1.7}}>
        <div>Total Deals: {deals.length}</div>

        <div>
          Average Deal Size: <strong>${Math.round(avgDeal).toLocaleString()}</strong>
        </div>

        <div style={{opacity:.8}}>
          Faster pipeline velocity increases revenue predictability.
        </div>
      </div>
    </div>
  );
}