import React, { useState } from "react";

export default function ClientForm({ onSubmit, submitting }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("Lead");
  const [value, setValue] = useState(0);
  const [notes, setNotes] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, company, email, phone, stage, value, notes });
      }}
      style={cardStyle}
    >
      <div style={gridStyle}>
        <label style={labelStyle}>
          Name *
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" />
        </label>

        <label style={labelStyle}>
          Company
          <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" />
        </label>

        <label style={labelStyle}>
          Email
          <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@..." />
        </label>

        <label style={labelStyle}>
          Phone
          <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555)..." />
        </label>

        <label style={labelStyle}>
          Stage
          <select style={inputStyle} value={stage} onChange={(e) => setStage(e.target.value)}>
            <option>Lead</option>
            <option>Prospect</option>
            <option>Customer</option>
            <option>Lost</option>
          </select>
        </label>

        <label style={labelStyle}>
          Value
          <input style={inputStyle} type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
      </div>

      <label style={{ ...labelStyle, marginTop: 10 }}>
        Notes
        <textarea style={{ ...inputStyle, height: 80 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." />
      </label>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <button disabled={submitting || !name.trim()} style={btnStyle}>
          {submitting ? "Adding..." : "Add Client"}
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