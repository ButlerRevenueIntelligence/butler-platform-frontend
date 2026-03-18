import React, { useMemo, useState } from "react";
import { createPortalSession, createCheckoutSession, getActiveOrgId } from "../api";
import { getPlan } from "../utils/perms";

function prettyPlan(plan) {
  const p = String(plan || "").toUpperCase();
  if (p === "SCALE") return "Atlas Core";
  if (p === "GROWTH") return "Atlas Growth";
  if (p === "ENTERPRISE") return "Atlas Enterprise";
  return "Atlas Core";
}

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const orgId = getActiveOrgId();
  const plan = getPlan();

  const pricing = useMemo(
    () => ({
      SCALE: { label: "Atlas Core", price: "$197/mo" },
      GROWTH: { label: "Atlas Growth", price: "$997/mo" },
      ENTERPRISE: { label: "Atlas Enterprise", price: "$3,500/mo" },
    }),
    []
  );

  async function goToPortal() {
    try {
      setLoading(true);
      setErr("");

      const res = await createPortalSession({ orgId });
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (e) {
      setErr(e?.message || "Failed to open billing portal.");
    } finally {
      setLoading(false);
    }
  }

  async function upgrade(planKey) {
    try {
      setLoading(true);
      setErr("");

      const priceMap = {
        SCALE: "REPLACE_CORE_PRICE_ID",
        GROWTH: "REPLACE_GROWTH_PRICE_ID",
        ENTERPRISE: "REPLACE_ENTERPRISE_PRICE_ID",
      };

      const priceId = priceMap[planKey];
      if (!priceId) {
        throw new Error("Missing Stripe price ID.");
      }

      const user =
        JSON.parse(localStorage.getItem("butler_user") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null") ||
        {};

      const email = user?.email || "";

      const res = await createCheckoutSession({
        orgId,
        email,
        priceId,
      });

      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (e) {
      setErr(e?.message || "Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ color: "#EAF0FF", display: "grid", gap: 16 }}>
      <div
        style={{
          borderRadius: 18,
          padding: 18,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>BILLING</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 32 }}>Manage Your Atlas Plan</h1>
        <div style={{ marginTop: 10, opacity: 0.85 }}>
          Current plan: <strong>{prettyPlan(plan)}</strong>
        </div>

        <button
          onClick={goToPortal}
          disabled={loading}
          style={{
            marginTop: 14,
            borderRadius: 999,
            padding: "10px 14px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.08)",
            color: "#EAF0FF",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Manage Billing"}
        </button>

        {err ? <div style={{ marginTop: 12, color: "#fca5a5" }}>{err}</div> : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        {Object.entries(pricing).map(([key, item]) => (
          <div
            key={key}
            style={{
              borderRadius: 18,
              padding: 18,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 20 }}>{item.label}</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 1000 }}>{item.price}</div>
            <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
              {key === "SCALE" && "Core visibility and entry-level access."}
              {key === "GROWTH" && "Your main revenue intelligence operating plan."}
              {key === "ENTERPRISE" && "Advanced deployment for serious growth teams."}
            </div>

            <button
              onClick={() => upgrade(key)}
              disabled={loading || plan === key}
              style={{
                marginTop: 16,
                borderRadius: 999,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: plan === key ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.08)",
                color: "#EAF0FF",
                fontWeight: 900,
                cursor: plan === key ? "default" : "pointer",
              }}
            >
              {plan === key ? "Current Plan" : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}