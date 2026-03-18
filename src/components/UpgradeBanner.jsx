import React from "react";
import { useNavigate } from "react-router-dom";
import { getPlan } from "../utils/perms";

export default function UpgradeBanner({ missingPerm, requiredPlan }) {
  const plan = getPlan();
  const nav = useNavigate();

  return (
    <div
      style={{
        border: "1px solid rgba(245,158,11,0.35)",
        background: "rgba(245,158,11,0.10)",
        padding: 16,
        borderRadius: 16,
        color: "#EAF0FF",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 15 }}>
        🔒 Unlock Revenue Intelligence
      </div>

      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
        You're currently on <b>{plan}</b>
      </div>

      <div style={{ marginTop: 6, fontSize: 13 }}>
        Upgrade to <b>{requiredPlan}</b> to unlock:
      </div>

      <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 12, opacity: 0.9 }}>
        <li>Full AI-powered insights</li>
        <li>Revenue forecasting</li>
        <li>Advanced deal intelligence</li>
        <li>Real-time optimization signals</li>
      </ul>

      <button
        onClick={() => nav("/billing")}
        style={{
          marginTop: 12,
          borderRadius: 999,
          padding: "10px 16px",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "linear-gradient(90deg, #2563eb, #38bdf8)",
          color: "#fff",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Upgrade Now
      </button>
    </div>
  );
}