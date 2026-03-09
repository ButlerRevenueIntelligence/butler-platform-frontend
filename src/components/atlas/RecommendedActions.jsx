export default function RecommendedActions({ actions = [] }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      {actions.map((action, idx) => (
        <div
          key={action.title}
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 16,
            background: "rgba(4,10,24,0.34)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                minWidth: 30,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.18)",
                color: "#bae6fd",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {idx + 1}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.3,
                  }}
                >
                  {action.title}
                </div>

                <div
                  style={{
                    padding: "5px 9px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#dbeafe",
                    background: "rgba(59,130,246,0.14)",
                    border: "1px solid rgba(59,130,246,0.18)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Recommended
                </div>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "rgba(226,232,240,0.82)",
                  wordBreak: "break-word",
                }}
              >
                {action.description}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}