import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

export default function PaywallModal({
  open = true,
  onClose,
  title = "Upgrade required",
  message = "You’ve reached a usage limit on your current plan.",

  // NEW
  primaryActionLabel = "Upgrade Now",
  onPrimaryAction,
  force = false, // hard lock (cannot close)
}) {
  const nav = useNavigate();

  if (!open) return null;

  function handlePrimary() {
    if (onPrimaryAction) {
      onPrimaryAction();
    } else {
      nav("/billing");
    }
  }

  return createPortal(
    <div
      onClick={!force ? onClose : undefined} // ❌ disable click-outside if forced
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(3,7,18,0.72)",
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
          width: "min(680px, 100%)",
          borderRadius: 24,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.20), rgba(124,92,255,0.14), rgba(255,255,255,0.03))",
          boxShadow: "0 24px 80px rgba(0,0,0,0.42)",
          color: "#EAF0FF",
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
            Atlas Revenue AI
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 1000,
              lineHeight: 1.02,
              letterSpacing: -0.8,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 15,
              lineHeight: 1.7,
              color: "rgba(226,232,240,0.88)",
            }}
          >
            {message}
          </div>

          {/* VALUE STACK */}
          <div
            style={{
              marginTop: 20,
              display: "grid",
              gap: 10,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              padding: 16,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 14 }}>
              Unlock full Atlas capabilities
            </div>

            <div style={{ fontSize: 13, opacity: 0.92 }}>
              • Predict revenue with AI-driven forecasting
            </div>
            <div style={{ fontSize: 13, opacity: 0.92 }}>
              • Track pipeline pressure and deal velocity
            </div>
            <div style={{ fontSize: 13, opacity: 0.92 }}>
              • Generate executive-level reports instantly
            </div>
            <div style={{ fontSize: 13, opacity: 0.92 }}>
              • Full visibility across your revenue system
            </div>
          </div>

          {/* ACTIONS */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handlePrimary}
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
              {primaryActionLabel}
            </button>

            {/* ❌ Hide close button if forced */}
            {!force && (
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
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}