import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMyOrgs, apiGet } from "../api";

export default function BillingSuccess() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("Finalizing your Atlas upgrade...");

  useEffect(() => {
    let mounted = true;

    async function finalizeUpgrade() {
      const sessionId = params.get("session_id") || "";

      try {
        if (mounted) {
          setStatus("Verifying payment and syncing workspace plan...");
        }

        let synced = false;

        for (let i = 0; i < 6; i++) {
          await getMyOrgs();

          try {
            const me = await apiGet("/me");

            const freshPlan =
              me?.plan ||
              me?.organization?.plan ||
              me?.org?.plan ||
              me?.activeWorkspace?.plan ||
              "";

            if (freshPlan) {
              localStorage.setItem("active_org_plan", freshPlan);
              localStorage.setItem("org_plan", freshPlan);
              localStorage.setItem("plan", freshPlan);
            }

            localStorage.setItem("butler_user", JSON.stringify(me));
            localStorage.setItem("user", JSON.stringify(me));
          } catch (err) {
            console.error("Failed to refresh /me during billing sync:", err);
          }

          const plan =
            localStorage.getItem("active_org_plan") ||
            localStorage.getItem("org_plan") ||
            localStorage.getItem("plan") ||
            "";

          if (plan && ["SCALE", "GROWTH", "ENTERPRISE"].includes(plan)) {
            synced = true;
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        if (mounted) {
          setStatus(
            synced
              ? "Upgrade confirmed. Redirecting you into Atlas..."
              : "Payment completed. Redirecting while Atlas finishes syncing your workspace..."
          );
        }

        setTimeout(() => {
          nav("/overview", { replace: true });
        }, 1500);
      } catch (err) {
        console.error("Billing success sync failed:", err);

        if (mounted) {
          setStatus("Payment was completed. Redirecting back into Atlas...");
        }

        setTimeout(() => {
          nav("/overview", { replace: true });
        }, 1500);
      }
    }

    finalizeUpgrade();

    return () => {
      mounted = false;
    };
  }, [nav, params]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(900px 500px at 20% 10%, rgba(37,99,235,0.18), transparent 55%), radial-gradient(900px 500px at 80% 20%, rgba(124,92,255,0.16), transparent 55%), linear-gradient(180deg, #050814 0%, #070b18 100%)",
        color: "#EAF0FF",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "min(680px, 100%)",
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(135deg, rgba(124,92,255,0.12), rgba(56,189,248,0.08), rgba(255,255,255,0.02))",
          boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
          padding: 28,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(125,211,252,0.88)",
            marginBottom: 10,
          }}
        >
          Billing Success
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 40,
            lineHeight: 1.02,
            fontWeight: 1000,
            letterSpacing: -1,
          }}
        >
          Your Atlas plan is being activated
        </h1>

        <div
          style={{
            marginTop: 16,
            fontSize: 15,
            lineHeight: 1.7,
            color: "rgba(226,232,240,0.88)",
          }}
        >
          {status}
        </div>

        <div
          style={{
            marginTop: 20,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#22c55e",
              boxShadow: "0 0 10px rgba(34,197,94,0.45)",
            }}
          />
          Stripe payment received
        </div>

        {sessionId ? (
          <div
            style={{
              marginTop: 14,
              fontSize: 11,
              color: "rgba(226,232,240,0.54)",
              wordBreak: "break-all",
            }}
          >
            Session: {sessionId}
          </div>
        ) : null}
      </div>
    </div>
  );
}