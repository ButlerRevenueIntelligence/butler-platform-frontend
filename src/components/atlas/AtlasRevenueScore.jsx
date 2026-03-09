import React, { useMemo } from "react";

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function calculateScore({ coverage, forecastConfidence, pipelineValue }) {

  let score = 50;

  if (coverage >= 4) score += 20;
  else if (coverage >= 2) score += 10;

  if (forecastConfidence >= 80) score += 20;
  else if (forecastConfidence >= 65) score += 10;

  if (pipelineValue > 1000000) score += 10;

  return Math.min(100, Math.round(score));
}

function scoreColor(score) {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#facc15";
  return "#ef4444";
}

export default function AtlasRevenueScore({ kpis }) {

  const score = useMemo(() => {

    return calculateScore({
      coverage: safeNum(kpis?.coverage),
      forecastConfidence: safeNum(kpis?.forecastConfidence || 75),
      pipelineValue: safeNum(kpis?.pipelineValue),
    });

  }, [kpis]);

  const color = scoreColor(score);

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 20,
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(56,189,248,0.10))",
        boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>

        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontWeight: 800,
            color: "rgba(226,232,240,0.7)",
          }}
        >
          Atlas Revenue Score
        </div>

        <div
          style={{
            fontSize: 42,
            fontWeight: 900,
            color,
            marginTop: 6,
          }}
        >
          {score} / 100
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "rgba(226,232,240,0.85)",
          }}
        >
          Overall health of your revenue engine.
        </div>

      </div>

      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: `6px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 18,
          color,
        }}
      >
        {score}
      </div>
    </div>
  );
}