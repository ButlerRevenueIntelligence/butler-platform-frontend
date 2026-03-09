import React, { useState, useMemo } from "react";

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const money = (n) =>
  safeNum(n).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function ForecastSimulator({ deals = [], kpis }) {

  const [dealSlipPercent, setDealSlipPercent] = useState(10);
  const [conversionLift, setConversionLift] = useState(0);
  const [marketingLift, setMarketingLift] = useState(0);

  const baselineRevenue = useMemo(() => {
    return deals.reduce((sum, d) => {
      const amt = safeNum(d?.amount ?? d?.value ?? 0);
      const prob = safeNum(d?.probability ?? 0) / 100;
      return sum + amt * prob;
    }, 0);
  }, [deals]);

  const simulatedRevenue = useMemo(() => {

    let forecast = baselineRevenue;

    const slipLoss = forecast * (dealSlipPercent / 100);
    forecast -= slipLoss;

    const conversionBoost = forecast * (conversionLift / 100);
    forecast += conversionBoost;

    const marketingBoost = forecast * (marketingLift / 100);
    forecast += marketingBoost;

    return forecast;

  }, [baselineRevenue, dealSlipPercent, conversionLift, marketingLift]);

  const delta = simulatedRevenue - baselineRevenue;

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 18,
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(56,189,248,0.08))",
        boxShadow: "0 14px 34px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.18em",
          fontWeight: 800,
          textTransform: "uppercase",
          color: "rgba(125,211,252,0.9)",
        }}
      >
        Forecast Simulator
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 24,
          fontWeight: 900,
          color: "#fff",
        }}
      >
        Simulated Forecast
      </div>

      <div style={{ marginTop: 10, color: "#e2e8f0" }}>
        Baseline Forecast: <strong>{money(baselineRevenue)}</strong>
      </div>

      <div style={{ marginTop: 6, color: "#e2e8f0" }}>
        Simulated Forecast: <strong>{money(simulatedRevenue)}</strong>
      </div>

      <div
        style={{
          marginTop: 6,
          fontWeight: 800,
          color: delta >= 0 ? "#22c55e" : "#ef4444",
        }}
      >
        Impact: {money(delta)}
      </div>

      <div style={{ marginTop: 16 }}>

        <label style={{ fontSize: 13 }}>
          Deal Slip Risk (%)
        </label>

        <input
          type="range"
          min="0"
          max="40"
          value={dealSlipPercent}
          onChange={(e) => setDealSlipPercent(Number(e.target.value))}
          style={{ width: "100%" }}
        />

      </div>

      <div style={{ marginTop: 12 }}>

        <label style={{ fontSize: 13 }}>
          Conversion Improvement (%)
        </label>

        <input
          type="range"
          min="0"
          max="40"
          value={conversionLift}
          onChange={(e) => setConversionLift(Number(e.target.value))}
          style={{ width: "100%" }}
        />

      </div>

      <div style={{ marginTop: 12 }}>

        <label style={{ fontSize: 13 }}>
          Marketing Impact (%)
        </label>

        <input
          type="range"
          min="0"
          max="40"
          value={marketingLift}
          onChange={(e) => setMarketingLift(Number(e.target.value))}
          style={{ width: "100%" }}
        />

      </div>
    </div>
  );
}