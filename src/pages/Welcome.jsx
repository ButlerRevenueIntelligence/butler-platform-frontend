import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");

  const workspaceName = useMemo(() => {
    return (
      localStorage.getItem("activeOrgName") ||
      localStorage.getItem("butler_active_org_name") ||
      localStorage.getItem("active_org_name") ||
      "your workspace"
    );
  }, []);

  const S = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      color: "#EAF0FF",
      background:
        "radial-gradient(1200px 700px at 15% 15%, rgba(124,92,255,0.22), transparent 60%), radial-gradient(1000px 650px at 85% 30%, rgba(56,189,248,0.18), transparent 60%), linear-gradient(180deg, rgba(5,8,18,1) 0%, rgba(7,12,28,1) 55%, rgba(5,8,18,1) 100%)",
    },
    card: {
      width: "100%",
      maxWidth: 760,
      padding: 28,
      borderRadius: 22,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
    },
    title: {
      fontSize: 34,
      fontWeight: 900,
      marginBottom: 10,
    },
    sub: {
      opacity: 0.88,
      fontSize: 15,
      lineHeight: 1.7,
      marginBottom: 24,
    },
    btn: {
      marginTop: 18,
      padding: "12px 18px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "linear-gradient(90deg, #2563eb, #38bdf8)",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
    },
    secondaryBtn: {
      marginTop: 18,
      marginLeft: 10,
      padding: "12px 18px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      color: "#EAF0FF",
      fontWeight: 900,
      cursor: "pointer",
    },
    option: {
      display: "block",
      width: "100%",
      padding: 14,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.04)",
      color: "#EAF0FF",
      marginBottom: 12,
      textAlign: "left",
      cursor: "pointer",
      fontWeight: 700,
    },
    activeOption: {
      border: "1px solid rgba(56,189,248,0.55)",
      background: "rgba(56,189,248,0.12)",
    },
    pill: {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.05)",
      fontSize: 12,
      fontWeight: 900,
      marginBottom: 14,
    },
    checklist: {
      display: "grid",
      gap: 12,
      marginTop: 12,
      marginBottom: 8,
    },
    checklistItem: {
      padding: 14,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.04)",
    },
    checklistTitle: {
      fontSize: 14,
      fontWeight: 800,
      marginBottom: 4,
    },
    checklistText: {
      fontSize: 13,
      opacity: 0.78,
      lineHeight: 1.6,
    },
    row: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      marginTop: 10,
    },
  };

  function finishAndGoToIntegrations() {
    localStorage.setItem("atlas_onboarded", "true");
    localStorage.setItem("atlas_primary_goal", goal || "Grow Revenue");
    nav("/integrations", { replace: true });
  }

  function skipToCommandCenter() {
    localStorage.setItem("atlas_onboarded", "true");
    localStorage.setItem("atlas_primary_goal", goal || "Grow Revenue");
    nav("/command-center", { replace: true });
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.pill}>Atlas Revenue AI Onboarding</div>

        {step === 1 && (
          <>
            <div style={S.title}>Welcome to Atlas</div>
            <div style={S.sub}>
              Your free trial is live and {workspaceName} is ready. Atlas helps
              you see what is driving revenue, where pipeline risk is building,
              and where your next growth opportunities are hiding.
            </div>

            <div style={S.checklist}>
              <div style={S.checklistItem}>
                <div style={S.checklistTitle}>Step 1: Connect your data</div>
                <div style={S.checklistText}>
                  Connect your CRM, ad platforms, or upload a spreadsheet so
                  Atlas can start modeling your revenue engine.
                </div>
              </div>

              <div style={S.checklistItem}>
                <div style={S.checklistTitle}>Step 2: Review your command center</div>
                <div style={S.checklistText}>
                  Once your data is in, Atlas will surface visibility across
                  pipeline, forecasting, signals, and performance.
                </div>
              </div>

              <div style={S.checklistItem}>
                <div style={S.checklistTitle}>Step 3: Activate the trial fully</div>
                <div style={S.checklistText}>
                  The fastest way to get value from Atlas is to connect at least
                  one real data source during your trial.
                </div>
              </div>
            </div>

            <button style={S.btn} onClick={() => setStep(2)}>
              Continue Setup
            </button>

            <button style={S.secondaryBtn} onClick={skipToCommandCenter}>
              Skip for now
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={S.title}>What are you trying to improve first?</div>
            <div style={S.sub}>
              We’ll use this to shape your onboarding path and save your primary
              goal for the workspace.
            </div>

            {[
              "Grow Revenue",
              "Track Pipeline",
              "Manage Clients",
              "Improve Forecasting",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGoal(item)}
                style={{
                  ...S.option,
                  ...(goal === item ? S.activeOption : {}),
                }}
              >
                {item}
              </button>
            ))}

            <div style={S.row}>
              <button
                style={{
                  ...S.btn,
                  opacity: goal ? 1 : 0.55,
                  cursor: goal ? "pointer" : "not-allowed",
                  marginTop: 0,
                }}
                onClick={() => setStep(3)}
                disabled={!goal}
                type="button"
              >
                Continue
              </button>

              <button
                style={{ ...S.secondaryBtn, marginTop: 0, marginLeft: 0 }}
                onClick={() => setStep(1)}
                type="button"
              >
                Back
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={S.title}>Next best step: connect your data</div>
            <div style={S.sub}>
              Based on your goal of <b>{goal || "growing revenue"}</b>, the best
              next move is to connect at least one source so Atlas can begin
              generating real visibility for your team.
            </div>

            <div style={S.checklist}>
              <div style={S.checklistItem}>
                <div style={S.checklistTitle}>Recommended first connections</div>
                <div style={S.checklistText}>
                  Start with HubSpot, Google Ads, or Excel / CSV import. That
                  gives Atlas enough signal to begin showing meaningful insights.
                </div>
              </div>
            </div>

            <div style={S.row}>
              <button style={{ ...S.btn, marginTop: 0 }} onClick={finishAndGoToIntegrations}>
                Connect Data Sources
              </button>

              <button
                style={{ ...S.secondaryBtn, marginTop: 0, marginLeft: 0 }}
                onClick={skipToCommandCenter}
              >
                Go to Command Center
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}