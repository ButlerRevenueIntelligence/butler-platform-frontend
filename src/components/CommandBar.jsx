import React from "react";
import { getPlan } from "../utils/perms";

export default function CommandBar({
  onGenerateBoardReport,
  onRunAiAnalysis,
  onSimulateForecast,
  onExportRevenueModel,
  busy = false,
}) {
  const plan = getPlan();

  const isScale = plan === "SCALE";
  const isGrowth = plan === "GROWTH" || plan === "ENTERPRISE";
  const isEnterprise = plan === "ENTERPRISE";

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 20,
        flexWrap: "wrap",
      }}
    >
      <button
        className="cmd"
        onClick={onGenerateBoardReport}
        disabled={busy}
        type="button"
      >
        Generate Board Report
      </button>

      <button
        className="cmd"
        onClick={onRunAiAnalysis}
        disabled={!isGrowth || busy}
        type="button"
        title={!isGrowth ? "Available on Growth and Enterprise plans" : ""}
      >
        Run AI Analysis
      </button>

      <button
        className="cmd"
        onClick={onSimulateForecast}
        disabled={!isGrowth || busy}
        type="button"
        title={!isGrowth ? "Available on Growth and Enterprise plans" : ""}
      >
        Simulate Forecast
      </button>

      <button
        className="cmd"
        onClick={onExportRevenueModel}
        disabled={!isEnterprise || busy}
        type="button"
        title={!isEnterprise ? "Available on Enterprise plan only" : ""}
      >
        Export Revenue Model
      </button>

      <style>
        {`
          .cmd{
            padding:10px 16px;
            border-radius:999px;
            border:1px solid rgba(255,255,255,.12);
            background:rgba(255,255,255,.05);
            cursor:pointer;
            font-weight:700;
            color:#EAF0FF;
          }
          .cmd:hover{
            background:rgba(124,92,255,.2);
          }
          .cmd:disabled{
            opacity:.6;
            cursor:not-allowed;
          }
        `}
      </style>
    </div>
  );
}