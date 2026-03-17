import React from "react";

export default function CommandBar({
  onGenerateBoardReport,
  onRunAiAnalysis,
  onSimulateForecast,
  onExportRevenueModel,
  busy = false,
}) {
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
        disabled={busy}
        type="button"
      >
        Run AI Analysis
      </button>

      <button
        className="cmd"
        onClick={onSimulateForecast}
        disabled={busy}
        type="button"
      >
        Simulate Forecast
      </button>

      <button
        className="cmd"
        onClick={onExportRevenueModel}
        disabled={busy}
        type="button"
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