import React, { useState } from "react";

export default function Welcome() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");

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
      maxWidth: 720,
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
  };

  function finish() {
    localStorage.setItem("atlas_onboarded", "true");
    localStorage.setItem("atlas_primary_goal", goal || "Grow Revenue");
    window.location.href = "/overview";
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.pill}>Atlas Revenue AI Onboarding</div>

        {step === 1 && (
          <>
            <div style={S.title}>Welcome to Atlas Revenue AI</div>
            <div style={S.sub}>
              You’re officially inside your workspace. Atlas is designed to help
              you monitor pipeline health, surface revenue opportunities, track
              execution pressure, and give leadership a clearer path to growth.
            </div>
            <button style={S.btn} onClick={() => setStep(2)}>
              Get Started
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={S.title}>What Atlas Helps You Do</div>
            <div style={S.sub}>
              Atlas brings your revenue operation into one command center so you
              can move faster and make better decisions.
            </div>

            <div style={S.option}>Predict revenue and forecast movement</div>
            <div style={S.option}>Track pipeline pressure and deal momentum</div>
            <div style={S.option}>Monitor accounts, signals, and team activity</div>
            <div style={S.option}>Turn data into executive-level visibility</div>

            <button style={S.btn} onClick={() => setStep(3)}>
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div style={S.title}>What’s your main goal right now?</div>
            <div style={S.sub}>
              This helps Atlas tailor the experience as you get started.
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

            <button
              style={{
                ...S.btn,
                opacity: goal ? 1 : 0.55,
                cursor: goal ? "pointer" : "not-allowed",
              }}
              onClick={finish}
              disabled={!goal}
            >
              Finish Setup
            </button>
          </>
        )}
      </div>
    </div>
  );
}