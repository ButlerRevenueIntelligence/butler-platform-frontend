import React from "react";

export default function PageShell({ title, right, children }) {
  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div>{right}</div>
      </div>

      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  );
}