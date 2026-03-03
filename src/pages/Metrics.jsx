// frontend/src/pages/Metrics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getMetricsDaily, getMetricsSummary } from "../api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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

const pct = (n) => `${Math.round(safeNum(n) * 100)}%`;

export default function Metrics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [sRes, dRes] = await Promise.all([
        getMetricsSummary(days),
        getMetricsDaily(days),
      ]);

      setSummary(sRes?.summary || null);
      setSeries(Array.isArray(dRes?.days) ? dRes.days : []);
    } catch (e) {
      setError(e?.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const kpis = useMemo(() => {
    const s = summary || {};
    return [
      { label: "Deals (window)", value: s.totalDeals ?? 0 },
      { label: "Weighted Pipeline", value: money(s.weighted ?? 0) },
      { label: "Raw Pipeline", value: money(s.raw ?? 0) },
      { label: "Won Revenue", value: money(s.wonRevenue ?? 0) },
      { label: "Win Rate", value: pct(s.winRate ?? 0) },
      { label: "Avg Deal", value: money(s.avgDeal ?? 0) },
      { label: "Avg Cycle", value: `${Math.round(safeNum(s.avgCycleDays ?? 0))}d` },
      { label: "Stale Deals", value: s.staleCount ?? 0 },
    ];
  }, [summary]);

  const S = {
    page: { padding: 22, color: "#EAF0FF" },
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
    title: { margin: 0, fontSize: 26, fontWeight: 900 },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.04)",
      fontSize: 12,
      opacity: 0.95,
    },
    btn: {
      borderRadius: 999,
      padding: "10px 14px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      color: "#EAF0FF",
      fontWeight: 900,
      fontSize: 12,
      cursor: "pointer",
    },
    select: {
      borderRadius: 999,
      padding: "10px 12px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(0,0,0,0.22)",
      color: "#EAF0FF",
      fontWeight: 900,
      fontSize: 12,
      outline: "none",
    },
    grid: { marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, minmax(220px, 1fr))", gap: 12 },
    card: {
      borderRadius: 16,
      padding: 14,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
    },
    label: { opacity: 0.8, fontSize: 12 },
    value: { marginTop: 6, fontSize: 20, fontWeight: 900 },
    charts: { marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    chartCard: {
      borderRadius: 16,
      padding: 14,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      minHeight: 320,
    },
    error: {
      marginTop: 12,
      borderRadius: 12,
      padding: 12,
      border: "1px solid rgba(255,0,0,0.25)",
      background: "rgba(255,0,0,0.10)",
    },
  };

  return (
    <div style={S.page}>
      <div style={S.headerRow}>
        <h2 style={S.title}>Metrics Command Center</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={S.pill}>Window:</div>
          <select style={S.select} value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>

          <button style={S.btn} onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error ? <div style={S.error}>{error}</div> : null}

      <div style={S.grid}>
        {kpis.map((k) => (
          <div key={k.label} style={S.card}>
            <div style={S.label}>{k.label}</div>
            <div style={S.value}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={S.charts}>
        <div style={S.chartCard}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Weighted Pipeline Created (Daily)</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
              <Tooltip formatter={(v) => money(v)} labelFormatter={(l) => `Date: ${l}`} />
              <Line type="monotone" dataKey="weightedCreated" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={S.chartCard}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Won Revenue (Daily)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
              <Tooltip formatter={(v) => money(v)} labelFormatter={(l) => `Date: ${l}`} />
              <Bar dataKey="wonRevenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}