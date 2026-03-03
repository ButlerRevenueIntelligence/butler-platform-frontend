import React, { useState } from "react";

export default function AccountForm({ onSubmit, submitting }) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, industry, website, notes });
      }}
      style={cardStyle}
    >
      <div style={gridStyle}>
        <label style={labelStyle}>
          Name *
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Free Fly Apparel" />
        </label>

        <label style={labelStyle}>
          Industry
          <input style={inputStyle} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., eCommerce" />
        </label>

        <label style={labelStyle}>
          Website
          <input style={inputStyle} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
        </label>
      </div>

      <label style={{ ...labelStyle, marginTop: 10 }}>
        Notes
        <textarea style={{ ...inputStyle, height: 80 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." />
      </label>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <button disabled={submitting || !name.trim()} style={btnStyle}>
          {submitting ? "Creating..." : "Create Account"}
        </button>
      </div>
    </form>
  );
}

const cardStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: 14,
  background: "rgba(255,255,255,0.03)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const labelStyle = { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, opacity: 0.95 };

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
  outline: "none",
};

const btnStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.08)",
  color: "inherit",
  cursor: "pointer",
};