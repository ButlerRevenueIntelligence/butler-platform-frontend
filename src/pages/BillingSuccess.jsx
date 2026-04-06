import { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function BillingSuccess() {
  const [status, setStatus] = useState("Finalizing your access...");

  useEffect(() => {
    let attempts = 0;

    function isActivated(me) {
      const billingStatus =
        me?.billing?.status ||
        me?.activeWorkspace?.billing?.status ||
        "";

      const paymentStatus =
        me?.paymentStatus ||
        me?.activeWorkspace?.paymentStatus ||
        "";

      const plan =
        me?.plan ||
        me?.activeWorkspace?.plan ||
        "";

      return (
        billingStatus === "active" ||
        paymentStatus === "paid" ||
        ["SCALE", "GROWTH", "ENTERPRISE"].includes(String(plan).toUpperCase())
      );
    }

    async function checkActivation() {
      try {
        const me = await apiGet("/me");

        if (isActivated(me)) {
          setStatus("Access activated. Redirecting...");

          // ✅ Optional onboarding check
          const onboarded = localStorage.getItem("atlas_onboarded");

          setTimeout(() => {
            if (!onboarded) {
              window.location.href = "/welcome";
            } else {
              window.location.href = "/command-center";
            }
          }, 1200);

          return;
        }

        throw new Error("Not active yet");
      } catch {
        attempts++;

        if (attempts < 6) {
          setTimeout(checkActivation, 1500);
        } else {
          setStatus("Taking longer than expected... redirecting.");

          setTimeout(() => {
            window.location.href = "/billing";
          }, 2000);
        }
      }
    }

    checkActivation();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Setting up your workspace...</h1>
        <p style={styles.sub}>{status}</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#050916",
    color: "#fff",
  },
  card: {
    padding: 40,
    borderRadius: 20,
    background: "#0b1228",
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: 900,
  },
  sub: {
    marginTop: 10,
    opacity: 0.7,
  },
};