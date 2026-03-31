import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";

function calcDaysLeft(date) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function TrialBanner() {
  const [trial, setTrial] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const me = await apiGet("/me");

        const t =
          me?.trial ||
          me?.organization?.trial ||
          me?.org?.trial ||
          null;

        if (mounted) {
          setTrial(t);
        }
      } catch (e) {
        console.error(e);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const trialStatus = String(trial?.status || "").toLowerCase();

  if (!trial || (trialStatus !== "trialing" && trialStatus !== "expired")) {
    return null;
  }

  const daysLeft = calcDaysLeft(trial?.endsAt);
  const isExpired = trialStatus === "expired" || (daysLeft != null && daysLeft <= 0);
  const urgent = !isExpired && daysLeft != null && daysLeft <= 2;

  return (
    <div
      style={{
        width: "100%",
        padding: "10px 16px",
        background: isExpired
          ? "linear-gradient(90deg, #dc2626, #ef4444)"
          : urgent
          ? "linear-gradient(90deg, #ef4444, #f97316)"
          : "linear-gradient(90deg, #2563eb, #38bdf8)",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "0.03em",
        flexWrap: "wrap",
      }}
    >
      <div>
        {isExpired
          ? "Your Atlas Growth trial has expired. Upgrade now to restore full access."
          : `Your Atlas Growth trial ends in ${daysLeft} day${
              daysLeft === 1 ? "" : "s"
            }`}
      </div>

      <button
        onClick={() => nav("/billing")}
        style={{
          borderRadius: 999,
          padding: "6px 12px",
          background: "rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "#fff",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        {isExpired ? "Restore Access" : "Upgrade Now"}
      </button>
    </div>
  );
}