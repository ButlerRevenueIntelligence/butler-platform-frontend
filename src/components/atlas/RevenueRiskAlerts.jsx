import React from "react";

function toneStyles(severity) {
  const key = String(severity || "").toLowerCase();

  if (key === "high") {
    return {
      border: "1px solid rgba(239,68,68,0.22)",
      background: "rgba(239,68,68,0.12)",
      color: "#fecaca",
      dot: "#ef4444",
    };
  }

  if (key === "low") {
    return {
      border: "1px solid rgba(56,189,248,0.22)",
      background: "rgba(56,189,248,0.12)",
      color: "#bae6fd",
      dot: "#38bdf8",
    };
  }

  return {
    border: "1px solid rgba(245,158,11,0.22)",
    background: "rgba(245,158,11,0.12)",
    color: "#fde68a",
    dot: "#f59e0b",
  };
}

export default function RevenueRiskAlerts({ alerts = [] }) {
  const normalized = alerts.map((alert, index) => {
    if (typeof alert === "string") {
      return {
        id: `${index}-${alert}`,
        title: alert,
        description:
          "Review this signal with leadership and assign clear next-step ownership.",
        severity: "medium",
        category: "Revenue",
      };
    }

    return {
      id: alert.id || `${index}-${alert.title || "alert"}`,
      title: alert.title || "Risk alert",
      description:
        alert.description ||
        alert.body ||
        "Review this signal with leadership and assign clear next-step ownership.",
      severity: alert.severity || alert.level || "medium",
      category: alert.category || "Revenue",
    };
  });

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      {normalized.map((alert, idx) => {
        const tone = toneStyles(alert.severity);

        return (
          <div
            key={alert.id}
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
              padding: 16,
              boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: tone.dot,
                    boxShadow: `0 0 14px ${tone.dot}66`,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      color: "rgba(226,232,240,0.86)",
                    }}
                  >
                    Risk Alert
                  </div>

                  <div
                    style={{
                      padding: "4px 9px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      ...tone,
                    }}
                  >
                    {alert.category}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(148,163,184,0.78)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                #{idx + 1}
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 22,
                fontWeight: 850,
                lineHeight: 1.2,
                letterSpacing: -0.3,
                color: "#ffffff",
              }}
            >
              {alert.title}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 1.7,
                color: "rgba(219,228,240,0.84)",
              }}
            >
              {alert.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}