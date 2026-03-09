import React from "react";

export default function RevenueLeakDetector({ pipeline }) {
  const deals = pipeline?.deals || [];

  const stalled = deals.filter(d => d.stage === "Proposal");

  const lostRevenue = stalled.reduce(
    (sum, d) => sum + (Number(d.amount) || 0),
    0
  );

  return (
    <div style={{
      background:"rgba(10,16,35,0.55)",
      border:"1px solid rgba(255,255,255,0.08)",
      borderRadius:18,
      padding:18
    }}>
      <h3>Revenue Leak Detector</h3>

      {lostRevenue > 0 ? (
        <div style={{marginTop:10,lineHeight:1.7}}>
          <div>
            Potential revenue leak detected in proposal stage.
          </div>

          <div>
            Estimated at risk: <strong>${lostRevenue.toLocaleString()}</strong>
          </div>

          <div style={{opacity:.8}}>
            Recommendation: Follow up with stalled proposals to accelerate deal closure.
          </div>
        </div>
      ) : (
        <div style={{opacity:.7,marginTop:10}}>
          No revenue leaks detected.
        </div>
      )}
    </div>
  );
}