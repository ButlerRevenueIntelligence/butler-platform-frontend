// frontend/src/components/UpgradeBanner.jsx
import React from "react";
import { getPlan } from "../utils/perms";

function prettyPlan(plan) {
  const normalized = String(plan || "").toUpperCase().trim();
  if (normalized === "SCALE") return "CORE";
  if (normalized === "GROWTH") return "GROWTH";
  if (normalized === "ENTERPRISE") return "ENTERPRISE";
  return normalized || "CORE";
}

export default function UpgradeBanner({ missingPerm }) {
  const plan = getPlan();

  const wrap = {
    border: "1px solid rgba(245,158,11,0.35)",
    background: "rgba(245,158,11,0.10)",
    padding: 14,
    borderRadius: 14,
    color: "#EAF0FF",
  };

  const btn = {
    marginTop: 10,
    borderRadius: 999,
    padding: "10px 14px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "#EAF0FF",
    fontWeight: 900,
    cursor: "pointer",
  };

  return (
    <div style={wrap}>
      <div style={{ fontWeight: 900, fontSize: 14 }}>
        Upgrade required
      </div>

      <div style={{ marginTop: 6, opacity: 0.9, fontSize: 13 }}>
        Your current plan (<b>{prettyPlan(plan)}</b>) does not include:{" "}
        <b>{missingPerm}</b>
      </div>

      <div style={{ marginTop: 6, opacity: 0.85, fontSize: 12 }}>
        Upgrade to unlock this module instantly for your workspace.
      </div>

      <button
        style={btn}
        onClick={() => {
          window.location.href = "/pricing";
        }}
      >
        Upgrade Plan
      </button>
    </div>
  );
}