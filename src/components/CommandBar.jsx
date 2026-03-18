import React, { useState } from "react";
import { getPlan } from "../utils/perms";
import UpgradeModal from "./UpgradeModal";

export default function CommandBar({
  onGenerateBoardReport,
  onRunAiAnalysis,
  onSimulateForecast,
  onExportRevenueModel,
  busy = false,
}) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [upgradePlan, setUpgradePlan] = useState("GROWTH");

  const plan = getPlan();
  const isGrowth = plan === "GROWTH" || plan === "ENTERPRISE";
  const isEnterprise = plan === "ENTERPRISE";

  function openUpgrade(feature, requiredPlan) {
    setUpgradeFeature(feature);
    setUpgradePlan(requiredPlan);
    setUpgradeOpen(true);
  }

  function handleAiClick() {
    if (!isGrowth) {
      openUpgrade("AI Analysis", "GROWTH");
      return;
    }
    onRunAiAnalysis?.();
  }

  function handleForecastClick() {
    if (!isGrowth) {
      openUpgrade("Forecast Simulation", "GROWTH");
      return;
    }
    onSimulateForecast?.();
  }

  function handleExportClick() {
    if (!isEnterprise) {
      openUpgrade("Revenue Model Export", "ENTERPRISE");
      return;
    }
    onExportRevenueModel?.();
  }

  return (
    <>
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
          onClick={handleAiClick}
          disabled={busy}
          type="button"
        >
          Run AI Analysis
        </button>

        <button
          className="cmd"
          onClick={handleForecastClick}
          disabled={busy}
          type="button"
        >
          Simulate Forecast
        </button>

        <button
          className="cmd"
          onClick={handleExportClick}
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

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        requiredPlan={upgradePlan}
        feature={upgradeFeature}
      />
    </>
  );
}