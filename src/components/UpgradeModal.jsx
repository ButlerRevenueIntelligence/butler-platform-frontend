import React from "react";
import { createPortal } from "react-dom";
import { getPlan } from "../utils/perms";
import { createCheckoutSession, getActiveOrgId } from "../api";

function normalizePlan(plan) {
  return String(plan || "").toUpperCase().trim();
}

function prettyPlan(plan) {
  const normalized = normalizePlan(plan);
  if (normalized === "SCALE") return "Atlas Core";
  if (normalized === "GROWTH") return "Atlas Growth";
  if (normalized === "ENTERPRISE") return "Atlas Enterprise";
  return normalized || "Atlas Core";
}

function planPrice(plan) {
  const normalized = normalizePlan(plan);
  if (normalized === "SCALE") return "$197/mo";
  if (normalized === "GROWTH") return "$997/mo";
  if (normalized === "ENTERPRISE") return "$3,500/mo";
  return "";
}

// Stripe CHECKOUT needs price_ IDs, not prod_ IDs.
const PRICE_MAP = {
  SCALE: "price_1TC9EyKmVYjJJZfS0ung29G2",
  GROWTH: "price_1TC9FwKmVYjJJZfSAgSN5oK8",
  ENTERPRISE: "price_1TC9GUKmVYjJJZfS8E3rxQoG",
};

function recommendedFromCurrent(currentPlan, requiredPlan) {
  const current = normalizePlan(currentPlan);
  const required = normalizePlan(requiredPlan);

  if (required === "ENTERPRISE") {
    return "ENTERPRISE";
  }

  if (current === "SCALE") {
    return "GROWTH";
  }

  if (current === "GROWTH") {
    return "ENTERPRISE";
  }

  return required || "GROWTH";
}

function featureBullets(feature, requiredPlan) {
  const plan = normalizePlan(requiredPlan);

  if (plan === "ENTERPRISE") {
    return [
      "Advanced executive controls and premium forecasting depth",
      "Higher-level exports, reporting, and strategic visibility",
      "Expanded intelligence and decision support for leadership teams",
      "Built for serious scale and multi-layer revenue operations",
    ];
  }

  return [
    "Full AI-powered analysis across your revenue system",
    "Forecast simulation and predictive revenue visibility",
    "Deeper opportunity intelligence and pipeline insights",
    "Faster visibility into where revenue is leaking",
  ];
}

export default function UpgradeModal({
  open,
  onClose,
  requiredPlan = "GROWTH",
  feature = "this feature",
  headline,
  subtext,
}) {
  const currentPlan = getPlan();
  const recommendedPlan = recommendedFromCurrent(currentPlan, requiredPlan);
  const bullets = featureBullets(feature, recommendedPlan);

  async function handleUpgrade() {
    try {
      const orgId = getActiveOrgId();

      const user =
        JSON.parse(localStorage.getItem("butler_user") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null") ||
        {};

      const email = user?.email || "";
      const priceId = PRICE_MAP[recommendedPlan];

      if (!orgId) {
        alert("No active workspace found.");
        return;
      }

      if (!priceId || !String(priceId).startsWith("price_")) {
        alert("Stripe price ID is not configured yet.");
        return;
      }

      const res = await createCheckoutSession({
        orgId,
        email,
        priceId,
      });

      if (res?.url) {
        window.location.href = res.url;
        return;
      }

      alert("Upgrade checkout could not be started.");
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert(err?.message || "Upgrade failed. Try again.");
    }
  }

  if (!open) return null;

  const currentPlanLabel = prettyPlan(currentPlan);
  const currentPlanPrice = planPrice(currentPlan);
  const recommendedLabel = prettyPlan(recommendedPlan);
  const recommendedPrice = planPrice(recommendedPlan);

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(3,7,18,0.74)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(720px, 100%)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(124,92,255,0.14), rgba(255,255,255,0.03))",
          boxShadow: "0 24px 80px rgba(0,0,0,0.42)",
          color: "#EAF0FF",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(125,211,252,0.88)",
              marginBottom: 8,
            }}
          >
            Upgrade Opportunity
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 1000,
              lineHeight: 1.02,
              letterSpacing: -0.8,
            }}
          >
            {headline || `Unlock ${feature}`}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 15,
              lineHeight: 1.7,
              color: "rgba(226,232,240,0.88)",
            }}
          >
            {subtext ||
              `Your current plan does not include ${feature}. Upgrade now to unlock deeper revenue intelligence and a more powerful Atlas experience.`}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <div
              style={{
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(148,163,184,0.82)",
                }}
              >
                Current Plan
              </div>

              <div style={{ marginTop: 10, fontSize: 24, fontWeight: 1000 }}>
                {currentPlanLabel}
              </div>

              <div style={{ marginTop: 6, fontSize: 15, opacity: 0.9 }}>
                {currentPlanPrice}
              </div>

              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "rgba(226,232,240,0.78)",
                }}
              >
                You have access to the essentials, but this feature is locked on your current tier.
              </div>
            </div>

            <div
              style={{
                borderRadius: 18,
                border: "1px solid rgba(56,189,248,0.28)",
                background:
                  "linear-gradient(180deg, rgba(37,99,235,0.18), rgba(14,165,233,0.10))",
                padding: 16,
                position: "relative",
                boxShadow: "0 12px 30px rgba(37,99,235,0.16)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.10em",
                }}
              >
                RECOMMENDED
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(191,219,254,0.92)",
                }}
              >
                Upgrade To
              </div>

              <div style={{ marginTop: 10, fontSize: 24, fontWeight: 1000 }}>
                {recommendedLabel}
              </div>

              <div style={{ marginTop: 6, fontSize: 15, opacity: 0.96 }}>
                {recommendedPrice}
              </div>

              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "rgba(226,232,240,0.86)",
                }}
              >
                This is the best next step to unlock {feature} and expand what Atlas can do for your team.
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gap: 10,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              padding: 16,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 14 }}>
              What unlocks when you upgrade
            </div>

            {bullets.map((item) => (
              <div
                key={item}
                style={{
                  fontSize: 13,
                  opacity: 0.92,
                  lineHeight: 1.55,
                }}
              >
                • {item}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleUpgrade}
              style={{
                borderRadius: 999,
                padding: "12px 18px",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "linear-gradient(90deg, #2563eb, #38bdf8)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Upgrade to {recommendedLabel}
            </button>

            <button
              onClick={onClose}
              style={{
                borderRadius: 999,
                padding: "12px 18px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "#EAF0FF",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}