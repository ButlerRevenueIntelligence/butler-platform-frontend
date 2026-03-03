// frontend/src/components/MetricsDaily.jsx
import React from "react";

export default function MetricsDaily({ rows = [] }) {
  return (
    <div style={card()}>
      <div style={header()}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>MetricsDaily</h3>
          <div style={{ opacity: 0.8, fontSize: 12, marginTop: 4 }}>
            Executive-grade daily performance snapshot
          </div>
        </div>
        <div style={{ opacity: 0.85, fontSize: 12 }}>
          Rows: <b>{rows.length}</b>
        </div>
      </div>

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table style={table()}>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th align="right">Sessions</Th>
              <Th align="right">Leads</Th>
              <Th align="right">Conv%</Th>
              <Th align="right">Spend</Th>
              <Th align="right">Revenue</Th>
              <Th align="right">CPL</Th>
              <Th align="right">ROAS</Th>
              <Th>Top Channel</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} style={row()}>
                <Td>{r.date}</Td>
                <Td align="right">{fmtNum(r.sessions)}</Td>
                <Td align="right">{fmtNum(r.leads)}</Td>
                <Td align="right">{fmtPct(r.convRate)}</Td>
                <Td align="right">{fmtMoney(r.spend)}</Td>
                <Td align="right">{fmtMoney(r.revenue)}</Td>
                <Td align="right">{fmtMoney(r.cpl)}</Td>
                <Td align="right">
                  <span style={pill(r.roas >= 3)}>{r.roas?.toFixed?.(2) ?? r.roas}</span>
                </Td>
                <Td>{r.topChannel}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, opacity: 0.75, fontSize: 12 }}>
        Next: hook these metrics to real sources (GA4, Ads, CRM) + saved filters (7/30/90 days).
      </div>
    </div>
  );
}

function fmtNum(n) {
  return new Intl.NumberFormat("en-US").format(Number(n || 0));
}
function fmtMoney(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}
function fmtPct(n) {
  return `${Number(n || 0).toFixed(2)}%`;
}

function card() {
  return {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
  };
}

function header() {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };
}

function table() {
  return {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: 980,
  };
}

function row() {
  return {
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  };
}

function Th({ children, align }) {
  return (
    <th
      style={{
        textAlign: align || "left",
        padding: "10px 10px",
        fontSize: 12,
        opacity: 0.85,
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        position: "sticky",
        top: 0,
        background: "rgba(10,18,45,0.85)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align }) {
  return (
    <td
      style={{
        textAlign: align || "left",
        padding: "10px 10px",
        fontSize: 13,
        opacity: 0.96,
      }}
    >
      {children}
    </td>
  );
}

function pill(good) {
  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.14)",
    background: good ? "rgba(0,255,160,0.14)" : "rgba(255,140,0,0.14)",
  };
}
