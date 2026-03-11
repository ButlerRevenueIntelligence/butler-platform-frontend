import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(1200px 700px at 15% 15%, rgba(124,92,255,0.22), transparent 60%), radial-gradient(1000px 650px at 85% 30%, rgba(56,189,248,0.18), transparent 60%), linear-gradient(180deg, rgba(5,8,18,1) 0%, rgba(7,12,28,1) 55%, rgba(5,8,18,1) 100%)",
        color: "#EAF0FF",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          padding: 40,
          borderRadius: 16,
          textAlign: "center",
          maxWidth: 500,
        }}
      >
        <h1>Welcome to Atlas Revenue AI</h1>

        <p style={{ opacity: 0.8 }}>
          Your revenue intelligence system is now active.
        </p>

        <button
          onClick={() => navigate("/command-center")}
          style={{
            marginTop: 20,
            padding: "12px 24px",
            borderRadius: 999,
            border: "none",
            fontWeight: 700,
            background: "linear-gradient(90deg,#2563eb,#38bdf8)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Enter Atlas
        </button>
      </div>
    </div>
  );
}