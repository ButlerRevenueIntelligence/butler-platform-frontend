import React, { useEffect, useMemo, useState } from "react";
import {
  apiGet,
  createPortalSession,
  createCheckoutSession,
  getActiveOrgId,
} from "../api";
import { getPlan } from "../utils/perms";

function normalizePlan(plan) {
  return String(plan || "").toUpperCase().trim();
}

function prettyPlan(plan) {
  const p = normalizePlan(plan);
  if (p === "SCALE") return "Atlas Core";
  if (p === "GROWTH") return "Atlas Growth";
  if (p === "ENTERPRISE") return "Atlas Enterprise";
  return "Atlas Core";
}

function prettyBillingStatus(status) {
  const s = String(status || "").toLowerCase().trim();
  if (s === "active") return "Active";
  if (s === "trialing") return "Trialing";
  if (s === "past_due") return "Past Due";
  if (s === "canceled") return "Canceled";
  if (s === "paid") return "Paid";
  if (s === "pending") return "Pending";
  if (s === "expired") return "Expired";
  if (s === "converted") return "Converted";
  if (s === "inactive") return "Inactive";
  if (s === "suspended") return "Suspended";
  return s ? s.replace(/_/g, " ") : "Unknown";
}

function statusTone(status) {
  const s = String(status || "").toLowerCase().trim();
  if (s === "active" || s === "paid" || s === "trialing" || s === "converted") {
    return "#22C55E";
  }
  if (s === "past_due" || s === "pending") return "#F59E0B";
  if (s === "canceled" || s === "suspended" || s === "expired" || s === "inactive") {
    return "#FB7185";
  }
  return "#A3A3A3";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function calcDaysLeft(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [err, setErr] = useState("");

  const [billingSummary, setBillingSummary] = useState({
    plan: getPlan(),
    billingStatus: "",
    paymentStatus: "",
    currentPeriodEnd: "",
    accessStatus: "",
    orgName: "",
    trialStatus: "none",
    trialStartedAt: "",
    trialEndsAt: "",
    workspaceActive: false,
  });

  const orgId = getActiveOrgId();
  const plan = normalizePlan(billingSummary.plan || getPlan());

  const pricing = useMemo(
    () => ({
      SCALE: {
        label: "Atlas Core",
        price: "$197/mo",
        desc: "Core visibility and foundational platform access.",
        badge: "Entry plan",
      },
      GROWTH: {
        label: "Atlas Growth",
        price: "$997/mo",
        desc: "Forecasting, AI analysis, reporting, and revenue intelligence for growth teams.",
        badge: "Most popular",
      },
      ENTERPRISE: {
        label: "Atlas Enterprise",
        price: "$3,500/mo",
        desc: "Advanced deployment for teams needing full-scale revenue intelligence and executive visibility.",
        badge: "Scale-ready",
      },
    }),
    []
  );

  useEffect(() => {
    let mounted = true;

    async function loadBillingSummary() {
      try {
        setLoadingSummary(true);
        setErr("");

        const me = await apiGet("/me");

        const nextPlan =
          me?.plan ||
          me?.organization?.plan ||
          me?.org?.plan ||
          me?.activeWorkspace?.plan ||
          getPlan();

        const nextBillingStatus =
          me?.billing?.status ||
          me?.organization?.billing?.status ||
          me?.org?.billing?.status ||
          me?.activeWorkspace?.billing?.status ||
          "";

        const nextPaymentStatus =
          me?.paymentStatus ||
          me?.organization?.paymentStatus ||
          me?.org?.paymentStatus ||
          "";

        const nextCurrentPeriodEnd =
          me?.billing?.currentPeriodEnd ||
          me?.organization?.billing?.currentPeriodEnd ||
          me?.org?.billing?.currentPeriodEnd ||
          me?.activeWorkspace?.billing?.currentPeriodEnd ||
          "";

        const nextAccessStatus =
          me?.accessStatus ||
          me?.organization?.accessStatus ||
          me?.org?.accessStatus ||
          me?.activeWorkspace?.status ||
          "";

        const nextOrgName =
          me?.activeWorkspace?.name ||
          me?.organization?.name ||
          me?.org?.name ||
          "";

        const nextTrialStatus =
          me?.trial?.status ||
          me?.organization?.trial?.status ||
          me?.org?.trial?.status ||
          me?.activeWorkspace?.trial?.status ||
          "none";

        const nextTrialStartedAt =
          me?.trial?.startedAt ||
          me?.organization?.trial?.startedAt ||
          me?.org?.trial?.startedAt ||
          me?.activeWorkspace?.trial?.startedAt ||
          "";

        const nextTrialEndsAt =
          me?.trial?.endsAt ||
          me?.organization?.trial?.endsAt ||
          me?.org?.trial?.endsAt ||
          me?.activeWorkspace?.trial?.endsAt ||
          "";

        const nextWorkspaceActive = Boolean(me?.workspaceActive);

        if (!mounted) return;

        if (nextPlan) {
          localStorage.setItem("active_org_plan", String(nextPlan).toUpperCase());
          localStorage.setItem("org_plan", String(nextPlan).toUpperCase());
          localStorage.setItem("plan", String(nextPlan).toUpperCase());
        }

        setBillingSummary({
          plan: nextPlan,
          billingStatus: nextBillingStatus,
          paymentStatus: nextPaymentStatus,
          currentPeriodEnd: nextCurrentPeriodEnd,
          accessStatus: nextAccessStatus,
          orgName: nextOrgName,
          trialStatus: nextTrialStatus,
          trialStartedAt: nextTrialStartedAt,
          trialEndsAt: nextTrialEndsAt,
          workspaceActive: nextWorkspaceActive,
        });
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load billing details.");
      } finally {
        if (mounted) {
          setLoadingSummary(false);
        }
      }
    }

    loadBillingSummary();

    return () => {
      mounted = false;
    };
  }, []);

  async function goToPortal() {
    try {
      setLoading(true);
      setErr("");

      const res = await createPortalSession({ orgId });
      if (res?.url) {
        window.location.href = res.url;
        return;
      }

      throw new Error("Billing portal URL was not returned.");
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
        SCALE: "price_1TC9EyKmVYjJJZfS0ung29G2",
        GROWTH: "price_1TC9FwKmVYjJJZfSAgSN5oK8",
        ENTERPRISE: "price_1TC9GUKmVYjJJZfS8E3rxQoG",
      };

      const priceId = priceMap[planKey];
      if (!priceId || !String(priceId).startsWith("price_")) {
        throw new Error(`Missing Stripe price ID for ${planKey}.`);
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
        plan: planKey,
      });

      if (res?.url) {
        window.location.href = res.url;
        return;
      }

      throw new Error("Checkout session was not returned.");
    } catch (e) {
      setErr(e?.message || "Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  const currentBillingTone = statusTone(
    billingSummary.billingStatus ||
      billingSummary.paymentStatus ||
      billingSummary.accessStatus ||
      billingSummary.trialStatus
  );

  const trialStatus = String(billingSummary.trialStatus || "").toLowerCase();
  const billingStatus = String(billingSummary.billingStatus || "").toLowerCase();
  const paymentStatus = String(billingSummary.paymentStatus || "").toLowerCase();

  const isTrialing = trialStatus === "trialing";
  const isTrialExpired = trialStatus === "expired";
  const isConverted = trialStatus === "converted";
  const isPaid =
    billingStatus === "active" ||
    paymentStatus === "paid" ||
    billingStatus === "paid";
  const daysLeft = calcDaysLeft(billingSummary.trialEndsAt);

  const showRestoreAccess = isTrialExpired && !isPaid;
  const showUpgradeButtons = !isPaid;
  const currentPeriodLabel = isTrialing || isTrialExpired
    ? formatDate(billingSummary.trialEndsAt)
    : formatDate(billingSummary.currentPeriodEnd);

  return (
    <div style={{ color: "#EAF0FF", display: "grid", gap: 16 }}>
      <div
        style={{
          borderRadius: 18,
          padding: 18,
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(124,92,255,0.10), rgba(255,255,255,0.03))",
          boxShadow: "0 12px 34px rgba(0,0,0,0.20)",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.72, fontWeight: 900 }}>BILLING</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 32 }}>Manage Your Atlas Plan</h1>

        <div style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.65, fontSize: 14 }}>
          {loadingSummary
            ? "Loading workspace billing details..."
            : `Workspace: ${billingSummary.orgName || "Active Workspace"} • Current plan: ${prettyPlan(plan)}`}
        </div>

        {isTrialing ? (
          <div
            style={{
              marginTop: 16,
              borderRadius: 16,
              padding: 14,
              border: "1px solid rgba(56,189,248,0.25)",
              background: "rgba(56,189,248,0.10)",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 15 }}>
              7-Day Trial Active
            </div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9, lineHeight: 1.55 }}>
              {daysLeft != null && daysLeft >= 0
                ? `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"} on ${formatDate(
                    billingSummary.trialEndsAt
                  )}.`
                : `Your free trial is active until ${formatDate(billingSummary.trialEndsAt)}.`}
            </div>
          </div>
        ) : null}

        {isTrialExpired ? (
          <div
            style={{
              marginTop: 16,
              borderRadius: 16,
              padding: 14,
              border: "1px solid rgba(251,113,133,0.28)",
              background: "rgba(251,113,133,0.10)",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 15 }}>
              Your free trial has expired
            </div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.92, lineHeight: 1.55 }}>
              Upgrade now to restore access to Atlas AI, forecasting, reporting,
              and revenue intelligence features.
            </div>
          </div>
        ) : null}

        {isConverted || isPaid ? (
          <div
            style={{
              marginTop: 16,
              borderRadius: 16,
              padding: 14,
              border: "1px solid rgba(34,197,94,0.28)",
              background: "rgba(34,197,94,0.10)",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 15 }}>
              Paid subscription active
            </div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.92, lineHeight: 1.55 }}>
              Your workspace has active paid access. Atlas remains available without trial restrictions.
            </div>
          </div>
        ) : null}

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <div
            style={{
              borderRadius: 16,
              padding: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.72, fontWeight: 800 }}>CURRENT PLAN</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 1000 }}>
              {prettyPlan(plan)}
            </div>
          </div>

          <div
            style={{
              borderRadius: 16,
              padding: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.72, fontWeight: 800 }}>BILLING STATUS</div>
            <div
              style={{
                marginTop: 8,
                fontSize: 22,
                fontWeight: 1000,
                color: currentBillingTone,
              }}
            >
              {prettyBillingStatus(billingSummary.billingStatus || billingSummary.trialStatus)}
            </div>
          </div>

          <div
            style={{
              borderRadius: 16,
              padding: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.72, fontWeight: 800 }}>PAYMENT STATUS</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 1000 }}>
              {prettyBillingStatus(billingSummary.paymentStatus)}
            </div>
          </div>

          <div
            style={{
              borderRadius: 16,
              padding: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.72, fontWeight: 800 }}>
              RENEWS / PERIOD END
            </div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 1000 }}>
              {currentPeriodLabel}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          {showRestoreAccess ? (
            <button
              onClick={() => upgrade("GROWTH")}
              disabled={loading}
              style={{
                borderRadius: 999,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "linear-gradient(90deg, #2563eb, #38bdf8)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {loading ? "Loading..." : "Upgrade to Restore Access"}
            </button>
          ) : null}

          <button
            onClick={goToPortal}
            disabled={loading}
            style={{
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
        </div>

        {err ? <div style={{ marginTop: 12, color: "#fca5a5" }}>{err}</div> : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        {Object.entries(pricing).map(([key, item]) => {
          const isCurrent = plan === key && !showRestoreAccess;
          const isPopular = key === "GROWTH";

          return (
            <div
              key={key}
              style={{
                borderRadius: 18,
                padding: 18,
                border: isPopular
                  ? "1px solid rgba(56,189,248,0.30)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: isPopular
                  ? "linear-gradient(180deg, rgba(37,99,235,0.16), rgba(14,165,233,0.08))"
                  : "rgba(255,255,255,0.03)",
                boxShadow: isPopular ? "0 12px 28px rgba(37,99,235,0.16)" : "none",
                position: "relative",
              }}
            >
              {item.badge ? (
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.10em",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {item.badge}
                </div>
              ) : null}

              <div style={{ fontWeight: 900, fontSize: 20 }}>{item.label}</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 1000 }}>{item.price}</div>
              <div style={{ marginTop: 8, opacity: 0.84, fontSize: 13, lineHeight: 1.55 }}>
                {item.desc}
              </div>

              <button
                onClick={() => upgrade(key)}
                disabled={loading || isCurrent || !showUpgradeButtons}
                style={{
                  marginTop: 16,
                  borderRadius: 999,
                  padding: "10px 14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: isCurrent
                    ? "rgba(34,197,94,0.18)"
                    : "rgba(255,255,255,0.08)",
                  color: "#EAF0FF",
                  fontWeight: 900,
                  cursor: isCurrent || !showUpgradeButtons ? "default" : "pointer",
                  opacity: !showUpgradeButtons && !showRestoreAccess ? 0.7 : 1,
                }}
              >
                {isCurrent ? "Current Plan" : `Choose ${item.label}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}