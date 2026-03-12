import React from "react";

export default function ExecutiveSummary({ kpis }) {

  const pipeline = kpis?.pipelineValue || 0;
  const forecast = kpis?.forecastValue || 1;

  const coverage = (pipeline / forecast).toFixed(1);

  return (
    <div className="atlas-card">
      <h2>Revenue Intelligence Summary</h2>

      <p>
        Pipeline coverage currently sits at <strong>{coverage}x</strong> expected
        revenue targets.
      </p>

      <p>
        Atlas AI has detected <strong>${kpis?.dealsAtRisk || 0}</strong> in
        potential revenue risk due to stalled opportunities.
      </p>

      <p>
        Top performing revenue channel:{" "}
        <strong>{kpis?.topChannel || "Google Ads"}</strong>.
      </p>

      <p>
        Forecast confidence:{" "}
        <strong>{kpis?.forecastConfidence || "Moderate"}</strong>.
      </p>
    </div>
  );
}