import React from "react";

function BenchmarkCard({ title, company, industry, top }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(148,163,184,0.8)",
        }}
      >
        {title}
      </div>

      <div style={{ marginTop: 12 }}>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Your Company</span>
          <strong>{company}</strong>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            color: "#94a3b8",
          }}
        >
          <span>Industry Avg</span>
          <span>{industry}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
            color: "#94a3b8",
          }}
        >
          <span>Top Quartile</span>
          <span>{top}</span>
        </div>

      </div>
    </div>
  );
}

export default function AtlasBenchmarks() {

  const benchmarks = [
    {
      title: "Pipeline Coverage",
      company: "2.4x",
      industry: "2.9x",
      top: "4.1x",
    },
    {
      title: "Forecast Confidence",
      company: "78%",
      industry: "73%",
      top: "90%",
    },
    {
      title: "Customer Acquisition Cost",
      company: "$740",
      industry: "$610",
      top: "$420",
    },
    {
      title: "Deal Velocity",
      company: "34 days",
      industry: "41 days",
      top: "24 days",
    },
  ];

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 18,
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(56,189,248,0.08))",
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "rgba(125,211,252,0.9)",
          fontWeight: 800,
        }}
      >
        Atlas Market Benchmarks
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 14,
        }}
      >
        {benchmarks.map((b) => (
          <BenchmarkCard key={b.title} {...b} />
        ))}
      </div>
    </div>
  );
}