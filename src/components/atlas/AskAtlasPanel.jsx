import React, { useState } from "react";

const suggestedPrompts = [
  "What is the biggest forecast risk right now?",
  "Which deals are most likely to slip this month?",
  "Where should we shift budget for better revenue efficiency?",
  "Which accounts deserve executive attention this week?",
];

export default function AskAtlasPanel() {
  const [question, setQuestion] = useState("");

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 850,
                color: "#fff",
              }}
            >
              Atlas Copilot
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                lineHeight: 1.6,
                color: "rgba(203,213,225,0.78)",
              }}
            >
              Ask Atlas for risk analysis, prioritization, scenarios, and strategic recommendations.
            </div>
          </div>

          <div
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#dbeafe",
              border: "1px solid rgba(96,165,250,0.22)",
              background: "rgba(59,130,246,0.12)",
              whiteSpace: "nowrap",
            }}
          >
            Live
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              background: "rgba(4,10,24,0.55)",
              padding: 14,
            }}
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask Atlas a question about revenue, pipeline, forecast pressure, account intelligence, or growth signals..."
              style={{
                width: "100%",
                minHeight: 120,
                resize: "vertical",
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#fff",
                fontSize: 15,
                lineHeight: 1.7,
                fontFamily: "inherit",
              }}
            />
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <button
              style={{
                border: "none",
                borderRadius: 12,
                padding: "10px 14px",
                background: "#ffffff",
                color: "#000",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Ask Atlas
            </button>

            <button
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 12,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Run Executive Analysis
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          background: "rgba(255,255,255,0.03)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(148,163,184,0.9)",
            }}
          >
            Suggested Prompts
          </div>

          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(226,232,240,0.72)",
            }}
          >
            Quick Start
          </div>
        </div>

        <div
          style={{
            padding: 16,
            display: "grid",
            gap: 10,
          }}
        >
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={prompt}
              onClick={() => setQuestion(prompt)}
              style={{
                textAlign: "left",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                background: "rgba(4,10,24,0.34)",
                color: "#dbe4f0",
                padding: "13px 14px",
                fontSize: 14,
                lineHeight: 1.55,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  marginRight: 10,
                  background: "rgba(59,130,246,0.14)",
                  color: "#93c5fd",
                  fontSize: 12,
                  fontWeight: 800,
                  verticalAlign: "middle",
                }}
              >
                {idx + 1}
              </span>
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}