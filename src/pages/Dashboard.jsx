// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getDashboard,
  getIntegrations,
  getPipeline,
  getAttributionSummary,
  getRevenueStability,
  getForecastScenarios,
  seedDemoData,
} from "../api";

import OrgSwitcher from "../components/OrgSwitcher";
import { useNavigate } from "react-router-dom";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

/** ---------------- Helpers ---------------- */
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

const moneyCompact = (n) => {
  const num = safeNum(n);
  const abs = Math.abs(num);
  if (abs >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(num / 1_000).toFixed(0)}k`;
  return money(num);
};

const dateLabel = (v, mode = "date") => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return mode === "datetime" ? d.toLocaleString() : d.toLocaleDateString();
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const calcWoW = (metrics) => {
  if (!Array.isArray(metrics) || metrics.length < 14) return null;
  const sorted = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
  const sumRev = (arr) => arr.reduce((acc, m) => acc + safeNum(m.revenue), 0);
  const last7 = sumRev(sorted.slice(-7));
  const prev7 = sumRev(sorted.slice(-14, -7));
  if (prev7 <= 0) return null;
  return ((last7 - prev7) / prev7) * 100;
};

const riskFromCoverage = (coverage) => {
  if (coverage >= 4) return { label: "Strong", tone: "good" };
  if (coverage >= 2) return { label: "Moderate", tone: "warn" };
  return { label: "At Risk", tone: "bad" };
};

const normalizeStage = (s) => {
  const val = (s || "").toString().trim().toLowerCase();
  if (!val) return "Unknown";
  if (val.includes("disc")) return "Discovery";
  if (val.includes("prop")) return "Proposal";
  if (val.includes("follow")) return "Follow-Up";
  if (val.includes("neg")) return "Negotiation";
  if (val.includes("close") || val.includes("won")) return "Closed Won";
  if (val.includes("lost")) return "Closed Lost";
  return s?.toString?.() || "Unknown";
};

const prettyProvider = (i) => {
  const raw = (i?.provider || i?.name || i?.key || "").toString().trim();
  if (!raw) return "Integration";
  return raw
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const prettyStatus = (i) => {
  const s = (i?.status || i?.state || "connected").toString().trim();
  return s || "connected";
};

const integrationMeta = (i) => {
  const last =
    i?.updatedAt ||
    i?.lastSync ||
    i?.last_synced_at ||
    i?.connectedAt ||
    i?.createdAt ||
    null;
  if (!last) return null;
  const d = new Date(last);
  if (Number.isNaN(d.getTime())) return null;
  return `Last sync: ${d.toLocaleString()}`;
};

// Local insight generator (NO OpenAI key needed)
const buildLocalInsights = (kpis, seed = 0) => {
  const jitter = (base, range = 6) => {
    const r = Math.sin((seed + base) * 999) * 10000;
    const frac = r - Math.floor(r);
    const delta = (frac - 0.5) * range * 2;
    return clamp(Math.round(base + delta), 60, 97);
  };

  const items = [];

  // 1) Efficiency
  if (kpis.spend30 > 0 && kpis.revenue30 > 0) {
    const roi = (kpis.revenue30 - kpis.spend30) / kpis.spend30;
    if (roi >= 1) {
      items.push({
        type: "OPPORTUNITY",
        impact: "HIGH IMPACT",
        confidence: jitter(92),
        title: "Marketing efficiency is strong",
        body: "ROI is trending positive. Increase budget carefully in the best-performing channels to compound growth.",
      });
    } else if (roi < 0) {
      items.push({
        type: "WARNING",
        impact: "MEDIUM IMPACT",
        confidence: jitter(84),
        title: "Paid efficiency drift detected",
        body: "Spend is outpacing revenue. Tighten targeting, remove weak ad sets, and improve conversion rate on the highest-traffic pages.",
      });
    } else {
      items.push({
        type: "OPPORTUNITY",
        impact: "MEDIUM IMPACT",
        confidence: jitter(80),
        title: "Performance is stable",
        body: "Run controlled experiments (landing page + offer tests) to lift conversion rate while maintaining CAC.",
      });
    }
  } else {
    items.push({
      type: "OPPORTUNITY",
      impact: "HIGH IMPACT",
      confidence: jitter(78),
      title: "Connect data sources to unlock attribution",
      body: "Once ads + CRM are connected, the platform will show true revenue attribution and predictable pipeline forecasting.",
    });
  }

  // 2) Coverage
  if (kpis.coverage >= 4) {
    items.push({
      type: "SUCCESS",
      impact: "HIGH IMPACT",
      confidence: jitter(90),
      title: "Pipeline coverage is healthy",
      body: "Coverage suggests strong revenue protection. Prioritize closing motions and remove deal friction to accelerate wins.",
    });
  } else if (kpis.coverage >= 2) {
    items.push({
      type: "OPPORTUNITY",
      impact: "MEDIUM IMPACT",
      confidence: jitter(82),
      title: "Pipeline is workable, but needs lift",
      body: "Aim for 4x coverage to stabilize forecasting and reduce revenue volatility.",
    });
  } else {
    items.push({
      type: "WARNING",
      impact: "HIGH IMPACT",
      confidence: jitter(88),
      title: "Pipeline coverage is low",
      body: "Coverage is under target. Increase top-of-funnel volume and reactivation to build pipeline before forecasting becomes unstable.",
    });
  }

  // 3) CAC
  if (kpis.cac > 500) {
    items.push({
      type: "WARNING",
      impact: "MEDIUM IMPACT",
      confidence: jitter(81),
      title: "CAC is elevated",
      body: "Reduce CAC by tightening ICP targeting, adding retargeting, and improving landing page conversion rate.",
    });
  } else {
    items.push({
      type: "SUCCESS",
      impact: "MEDIUM IMPACT",
      confidence: jitter(86),
      title: "CAC is under control",
      body: "Maintain efficiency while scaling budget in channels that drive the highest close-rate leads.",
    });
  }

  return items.slice(0, 3);
};

// Fallback scenarios
const FALLBACK_SCENARIOS = [
  {
    key: "current",
    label: "Baseline Reality",
    note: "What’s happening right now",
    multipliers: { revenue: 1.0, spend: 1.0, leads: 1.0, pipeline: 1.0 },
  },
  {
    key: "expansion",
    label: "Global Expansion",
    note: "Scale spend with controlled lift",
    multipliers: { revenue: 1.12, spend: 1.18, leads: 1.15, pipeline: 1.1 },
  },
  {
    key: "precision",
    label: "Precision Efficiency",
    note: "Cut waste, protect margin, optimize conversion",
    multipliers: { revenue: 1.06, spend: 0.9, leads: 0.98, pipeline: 1.02 },
  },
  {
    key: "domination",
    label: "Market Domination",
    note: "Speed-first scaling strategy",
    multipliers: { revenue: 1.2, spend: 1.35, leads: 1.25, pipeline: 1.15 },
  },
];

function normalizeScenarios(res) {
  const raw =
    (Array.isArray(res) && res) ||
    (Array.isArray(res?.scenarios) && res.scenarios) ||
    (Array.isArray(res?.data?.scenarios) && res.data.scenarios) ||
    null;

  if (!raw || !raw.length) return null;

  const rename = {
    scenario_0: { label: "Baseline Reality", note: "What’s happening right now" },
    scenario_1: { label: "Global Expansion", note: "Scale spend with controlled lift" },
    scenario_2: { label: "Precision Efficiency", note: "Cut waste, protect margin" },
    scenario_3: { label: "Market Domination", note: "Speed-first scaling strategy" },
  };

  const prettifyIfScenarioKey = (key, label, note) => {
    const k = String(key || "").trim();
    const l = String(label || "").trim();
    const picked = rename[k] || rename[l];
    if (!picked) return { label: label || key, note: note || "" };
    return { label: picked.label, note: note && note.length ? note : picked.note };
  };

  const list = raw
    .map((s, idx) => {
      const key = (s?.key || s?.id || s?.slug || `scenario_${idx}`).toString();
      const label = (s?.label || s?.name || s?.title || key).toString();
      const note = (s?.note || s?.description || "").toString();

      const m = s?.multipliers || s?.mult || {};
      const multipliers = {
        revenue: safeNum(m.revenue ?? s?.revenue ?? 1) || 1,
        spend: safeNum(m.spend ?? s?.spend ?? 1) || 1,
        leads: safeNum(m.leads ?? s?.leads ?? 1) || 1,
        pipeline: safeNum(m.pipeline ?? s?.pipeline ?? 1) || 1,
      };

      const renamed = prettifyIfScenarioKey(key, label, note);
      return { key, label: renamed.label, note: renamed.note, multipliers };
    })
    .filter((s) => s.key && s.label);

  return list.length ? list : null;
}

/** ---------------- Component ---------------- */
export default function Dashboard() {
  const nav = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [pipeline, setPipeline] = useState({ deals: [], pipelineValue: 0 });
  const [attribution, setAttribution] = useState(null);
  const [rss, setRss] = useState(null);

  const [serverScenarios, setServerScenarios] = useState(null);
  const [scenarioKey, setScenarioKey] = useState("current");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // AI insights
  const [aiInsights, setAiInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightSeed, setInsightSeed] = useState(Date.now());

  // Demo seed UX (DEV only)
  const isDev = !!import.meta.env.DEV;
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMsg, setDemoMsg] = useState("");

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [dash, ints, pipe, attrib, rssRes, scenRes] = await Promise.all([
        getDashboard(),
        getIntegrations(),
        getPipeline(),
        getAttributionSummary(),
        getRevenueStability().catch(() => null),
        typeof getForecastScenarios === "function"
          ? getForecastScenarios().catch(() => null)
          : Promise.resolve(null),
      ]);

      setRss(rssRes?.ok ? rssRes : null);
      setDashboard(dash || {});

      const intsArr = Array.isArray(ints)
        ? ints
        : Array.isArray(ints?.integrations)
        ? ints.integrations
        : [];
      setIntegrations(intsArr);

      setPipeline(pipe || { deals: [], pipelineValue: 0 });
      setAttribution(attrib || null);

      const normalized = scenRes ? normalizeScenarios(scenRes) : null;
      setServerScenarios(normalized);

      if (normalized?.length) {
        const exists = normalized.some((s) => s.key === scenarioKey);
        if (!exists) setScenarioKey(normalized[0].key);
      }

      // reset AI insights cache so local insights show fresh on load
      setAiInsights([]);
      setInsightSeed(Date.now());
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await loadDashboardData();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** seed demo data (DEV only) */
  async function onLoadDemoData() {
    if (demoLoading) return;

    const orgId = dashboard?.org?._id || dashboard?.orgId || "default";
    const guardKey = `atlas_demo_seeded_${orgId}`;
    const alreadySeeded = localStorage.getItem(guardKey) === "1";

    const ok = window.confirm(
      alreadySeeded
        ? "Demo data was already loaded for this workspace.\n\nLoad it again anyway? (This can create duplicates unless the backend clears first.)"
        : "Load demo data into this workspace?\n\nThis will create sample clients + deals for demo purposes."
    );
    if (!ok) return;

    try {
      setDemoLoading(true);
      setDemoMsg("");
      setError("");

      await seedDemoData({ clients: 10, deals: 25 });

      localStorage.setItem(guardKey, "1");
      setDemoMsg("✅ Demo data loaded. Refreshing…");
      await loadDashboardData();
      setDemoMsg("✅ Demo data loaded successfully.");
      setTimeout(() => setDemoMsg(""), 3500);
    } catch (e) {
      console.error("seed demo error:", e);
      setDemoMsg("");
      setError(e?.message || "Failed to load demo data");
    } finally {
      setDemoLoading(false);
    }
  }

  /** Attribution normalization */
  const channelRows = useMemo(() => {
    const arr = attribution?.channels;
    return Array.isArray(arr) ? arr : [];
  }, [attribution]);

  const channelChart = useMemo(() => {
    return channelRows
      .map((c) => ({
        channel: c.channel || c.source || c.name || "Channel",
        spend: safeNum(c.spend),
        revenue: safeNum(c.revenue),
        leads: safeNum(c.leads),
        roiPct:
          safeNum(c.spend) > 0
            ? ((safeNum(c.revenue) - safeNum(c.spend)) / safeNum(c.spend)) * 100
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [channelRows]);

  /** Data normalization */
  const metrics = useMemo(() => {
    const arr = Array.isArray(dashboard?.metrics) ? dashboard.metrics : [];
    const normalized = arr
      .map((m) => ({
        date: m?.date || m?.day || m?.createdAt || m?.ts || null,
        revenue: safeNum(m?.revenue),
        spend: safeNum(m?.spend),
        leads: safeNum(m?.leads),
      }))
      .filter((m) => m.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return normalized.map((m) => ({
      ...m,
      x: new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "2-digit" }),
    }));
  }, [dashboard]);

  const deals = useMemo(
    () => (Array.isArray(pipeline?.deals) ? pipeline.deals : []),
    [pipeline]
  );

  const scenarioList = useMemo(() => {
    if (Array.isArray(serverScenarios) && serverScenarios.length) return serverScenarios;
    return FALLBACK_SCENARIOS;
  }, [serverScenarios]);

  const activeScenario = useMemo(() => {
    const found = scenarioList.find((s) => s.key === scenarioKey);
    return found || scenarioList[0] || FALLBACK_SCENARIOS[0];
  }, [scenarioList, scenarioKey]);

  /** KPIs */
  const kpis = useMemo(() => {
    const m = activeScenario?.multipliers || { revenue: 1, spend: 1, leads: 1, pipeline: 1 };

    const rawRevenue30 =
      (dashboard?.revenue ?? dashboard?.revenue30d ?? null) ??
      metrics.reduce((acc, mm) => acc + safeNum(mm.revenue), 0);

    const rawSpend30 = metrics.reduce((acc, mm) => acc + safeNum(mm.spend), 0);
    const rawLeads30 = metrics.reduce((acc, mm) => acc + safeNum(mm.leads), 0);

    const rawPipelineValue =
      (dashboard?.pipelineValue ?? pipeline?.pipelineValue ?? null) ??
      deals.reduce((acc, d) => acc + safeNum(d?.amount ?? d?.value ?? d?.pipelineValue), 0);

    const revenue30 = safeNum(rawRevenue30) * safeNum(m.revenue || 1);
    const spend30 = safeNum(rawSpend30) * safeNum(m.spend || 1);
    const leads30 = safeNum(rawLeads30) * safeNum(m.leads || 1);
    const pipelineValue = safeNum(rawPipelineValue) * safeNum(m.pipeline || 1);

    const cac = leads30 > 0 ? spend30 / leads30 : 0;

    const forecast90 =
      (dashboard?.forecast90d ?? dashboard?.forecast ?? null) ??
      (metrics.length ? (safeNum(rawRevenue30) / metrics.length) * 90 : 0);

    const forecast90Scenario = safeNum(forecast90) * safeNum(m.revenue || 1);

    const coverage = revenue30 > 0 ? pipelineValue / revenue30 : 0;
    const wow = calcWoW(metrics);

    const base = clamp(coverage * 25, 20, 100);
    const boost = wow == null ? 0 : clamp(wow, -10, 10);
    const healthScore = clamp(base + boost, 0, 100);

    const risk = riskFromCoverage(coverage);

    return {
      revenue30,
      spend30,
      leads30,
      pipelineValue,
      cac,
      forecast90: forecast90Scenario,
      coverage,
      wow,
      healthScore,
      risk,
      scenario: activeScenario,
    };
  }, [dashboard, metrics, pipeline, deals, activeScenario]);

  const lastUpdatedLabel = dashboard?.lastUpdated
    ? new Date(dashboard.lastUpdated).toLocaleString()
    : new Date().toLocaleString();

  const dataAsOfLabel = dashboard?.dataAsOf
    ? new Date(dashboard.dataAsOf).toLocaleDateString()
    : metrics?.length
    ? dateLabel(metrics[metrics.length - 1].date, "date")
    : new Date().toLocaleDateString();

  const orgName = dashboard?.org?.name || dashboard?.orgName || "Butler & Co";

  const targets = useMemo(() => {
    const monthlyRevenueGoal =
      safeNum(dashboard?.targets?.monthlyRevenueGoal) ||
      safeNum(dashboard?.monthlyGoal) ||
      100000;

    const quarterlyRevenueGoal =
      safeNum(dashboard?.targets?.quarterlyRevenueGoal) || monthlyRevenueGoal * 3;

    const currentMonthRevenue = safeNum(kpis.revenue30);
    const currentQuarterForecast = safeNum(kpis.forecast90);

    const monthPct =
      monthlyRevenueGoal > 0 ? (currentMonthRevenue / monthlyRevenueGoal) * 100 : 0;
    const quarterPct =
      quarterlyRevenueGoal > 0 ? (currentQuarterForecast / quarterlyRevenueGoal) * 100 : 0;

    return {
      monthlyRevenueGoal,
      quarterlyRevenueGoal,
      currentMonthRevenue,
      currentQuarterForecast,
      monthPct: clamp(monthPct, 0, 200),
      quarterPct: clamp(quarterPct, 0, 200),
    };
  }, [dashboard, kpis]);

  const why = useMemo(() => {
    const protectionMonths = clamp(kpis.coverage, 0, 12);
    const closeLift5 = safeNum(kpis.pipelineValue) * 0.05;
    const spend = safeNum(kpis.spend30);
    const savings10 = spend * 0.1;
    return { protectionMonths, closeLift5, savings10 };
  }, [kpis]);

  /** ✅ Generate insights (LOCAL ONLY) */
  async function onGenerateInsights() {
    try {
      setInsightsLoading(true);
      setError("");

      const seed = Date.now();
      setAiInsights([]);       // ensure local insights render
      setInsightSeed(seed);    // triggers rebuild
    } catch (e) {
      console.error("Generate insights error:", e);
      setError("Failed to generate insights");
    } finally {
      setInsightsLoading(false);
    }
  }

  const pipelineByStage = useMemo(() => {
    const map = new Map();
    for (const d of deals) {
      const stage = normalizeStage(d?.stage || d?.status);
      const val = safeNum(d?.amount ?? d?.value ?? d?.pipelineValue);
      map.set(stage, (map.get(stage) || 0) + val);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [deals]);

  const insights = useMemo(() => buildLocalInsights(kpis, insightSeed), [kpis, insightSeed]);
  const displayedInsights = aiInsights?.length ? aiInsights : insights;

  const donutColors = ["#7C5CFF", "#22C55E", "#F59E0B", "#38BDF8", "#FB7185", "#A3A3A3"];

  const rsi = useMemo(() => {
    const score =
      rss?.ok && Number.isFinite(Number(rss.score))
        ? Number(rss.score)
        : clamp(Math.round(kpis.healthScore), 0, 100);

    const tier =
      score >= 85 ? "Strong" : score >= 70 ? "Controlled Volatility" : score >= 55 ? "Watchlist" : "High Risk";
    return { score, tier };
  }, [rss, kpis]);

  /** Styles (same as yours; unchanged) */
  const S = useMemo(() => {
    const card = {
      background: "rgba(10, 16, 35, 0.55)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 18,
      backdropFilter: "blur(10px)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    };

    return {
      page: { minHeight: "100vh", padding: "26px 26px 40px", color: "#EAF0FF" },
      bgGlow: {
        position: "fixed",
        inset: 0,
        zIndex: -1,
        background:
          "radial-gradient(1200px 700px at 15% 15%, rgba(124,92,255,0.25), transparent 60%), radial-gradient(1000px 650px at 85% 30%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 650px at 50% 90%, rgba(34,197,94,0.10), transparent 60%), linear-gradient(180deg, rgba(5,8,18,1) 0%, rgba(7,12,28,1) 55%, rgba(5,8,18,1) 100%)",
      },
      topRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 },
      title: { margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: 0.2 },
      sub: { marginTop: 8, opacity: 0.85, fontSize: 14 },
      org: { opacity: 0.9, fontSize: 14, marginTop: 10 },
      badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
        fontSize: 12,
        opacity: 0.95,
        textDecoration: "none",
        color: "#EAF0FF",
        cursor: "pointer",
      },
      pillLinkRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 },
      simRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 },
      kpiGrid: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 14, marginBottom: 14 },
      card,
      kLabel: { fontSize: 12, opacity: 0.8, letterSpacing: 0.8 },
      kValue: { marginTop: 10, fontSize: 32, fontWeight: 900 },
      kSub: { marginTop: 10, fontSize: 13, opacity: 0.85 },
      grid: { display: "grid", gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1fr)", gap: 14, alignItems: "start" },
      chartsGrid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 },
      chartRow: { display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.1fr)", gap: 14 },
      sectionTitle: { fontSize: 16, fontWeight: 900, marginBottom: 10 },
      chartBox: { height: 280 },
      miniChartBox: { height: 240 },
      rightStack: { display: "flex", flexDirection: "column", gap: 14 },
      divider: { height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" },
      list: { display: "grid", gap: 10 },
      pillCard: { borderRadius: 14, padding: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" },
      pillTitle: { fontWeight: 900, fontSize: 14, marginBottom: 6 },
      pillMeta: { opacity: 0.85, fontSize: 13, lineHeight: 1.35 },
      progressWrap: { height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" },
      progressBar: (pct) => ({ height: "100%", width: `${clamp(pct, 0, 200)}%`, background: "linear-gradient(90deg, rgba(56,189,248,0.9), rgba(124,92,255,0.9))" }),
      miniRow: { display: "grid", gap: 6 },
      miniLabel: { fontSize: 12, opacity: 0.8, letterSpacing: 0.6 },
      miniValue: { fontSize: 18, fontWeight: 900 },
      insightWrap: { display: "grid", gap: 10 },
      insightItem: (type) => ({
        borderRadius: 14,
        padding: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          type === "SUCCESS"
            ? "linear-gradient(90deg, rgba(34,197,94,0.12), rgba(255,255,255,0.02))"
            : type === "WARNING"
            ? "linear-gradient(90deg, rgba(245,158,11,0.12), rgba(255,255,255,0.02))"
            : "linear-gradient(90deg, rgba(56,189,248,0.12), rgba(255,255,255,0.02))",
      }),
      insightTop: { display: "flex", justifyContent: "space-between", gap: 10 },
      tag: (type) => ({
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 0.7,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        color: type === "SUCCESS" ? "#22C55E" : type === "WARNING" ? "#F59E0B" : "#38BDF8",
      }),
      confidence: { fontSize: 12, fontWeight: 900, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" },
      insightTitle: { fontWeight: 900, fontSize: 15, marginTop: 10 },
      insightBody: { opacity: 0.88, marginTop: 6, fontSize: 13, lineHeight: 1.45 },
      statusGood: { color: "#22C55E", fontWeight: 900 },
      statusWarn: { color: "#F59E0B", fontWeight: 900 },
      statusBad: { color: "#FB7185", fontWeight: 900 },
      error: { marginTop: 10, borderRadius: 12, padding: 12, border: "1px solid rgba(255,0,0,0.25)", background: "rgba(255,0,0,0.10)" },
      actionBtn: { borderRadius: 999, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#EAF0FF", fontWeight: 900, fontSize: 12, cursor: "pointer", opacity: 0.98 },
      actionBtnDisabled: { cursor: "not-allowed", opacity: 0.65 },
      helperText: { opacity: 0.75, fontSize: 12, marginTop: 6 },
      success: { marginTop: 10, borderRadius: 12, padding: 12, border: "1px solid rgba(34,197,94,0.30)", background: "rgba(34,197,94,0.12)", color: "rgba(234,240,255,0.95)" },
    };
  }, []);

  const riskStyle =
    kpis.risk.tone === "good" ? S.statusGood : kpis.risk.tone === "warn" ? S.statusWarn : S.statusBad;

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.bgGlow} />
        <h1 style={S.title}>Revenue Intelligence Overview</h1>
        <div style={S.sub}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />

      {/* Header */}
      <div style={S.topRow}>
        <div>
          <h1 style={S.title}>Revenue Intelligence Overview</h1>
          <div style={S.sub}>
            <span style={{ opacity: 0.7 }}>Last updated:</span> {lastUpdatedLabel}{" "}
            <span style={{ opacity: 0.7 }}>• Data as of:</span> {dataAsOfLabel}
          </div>
          <div style={S.org}>
            <span style={{ opacity: 0.7 }}>Org:</span> <strong>{orgName}</strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ minWidth: 260 }}>
            <OrgSwitcher onSwitched={() => loadDashboardData()} />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {isDev ? (
              <button
                onClick={onLoadDemoData}
                disabled={demoLoading}
                style={{ ...S.actionBtn, ...(demoLoading ? S.actionBtnDisabled : null) }}
                title="Seeds demo clients + deals into the active workspace"
              >
                {demoLoading ? "Loading Demo…" : "Load Demo Data"}
              </button>
            ) : null}

            <div style={S.badge}>Live KPI Summary</div>
            <div style={S.badge}>Insights Engine</div>
            <div style={S.badge}>Secure Session</div>
          </div>
        </div>
      </div>

      {demoMsg ? <div style={S.success}>{demoMsg}</div> : null}
      {error ? <div style={S.error}>{error}</div> : null}

      {/* Summary */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Revenue Command Center Summary</div>
        <div style={{ display: "grid", gap: 8, fontSize: 14, opacity: 0.95 }}>
          <div>
            Revenue is{" "}
            {kpis.wow == null ? (
              <strong>steady</strong>
            ) : (
              <strong style={kpis.wow >= 0 ? S.statusGood : S.statusBad}>
                {kpis.wow >= 0 ? "up" : "down"} {Math.abs(kpis.wow).toFixed(1)}% WoW
              </strong>
            )}
          </div>
          <div>
            Pipeline coverage is <strong>{kpis.coverage.toFixed(1)}x</strong> (
            <span style={riskStyle}>
              <strong>{kpis.risk.label}</strong>
            </span>
            )
          </div>
          <div>
            90-day forecast suggests <strong>{money(kpis.forecast90)}</strong>
          </div>
          <div style={{ marginTop: 6, opacity: 0.8, fontSize: 12 }}>
            Mode: <strong>{kpis.scenario?.label || "Current"}</strong> — {kpis.scenario?.note || "Actual performance"}
          </div>
        </div>
      </div>

      {/* Revenue Impact */}
      <div style={{ display: "grid", gap: 12, fontSize: 15, lineHeight: 1.7 }}>
        <div>
          <strong>Revenue Protection:</strong> At current coverage, revenue is protected for approximately{" "}
          <strong>{kpis.coverage.toFixed(1)} months</strong>.
        </div>
        <div>
          <strong>Pipeline Leverage:</strong> A +5% close-rate lift unlocks approximately{" "}
          <strong>{money(kpis.pipelineValue * 0.05)}</strong> in additional revenue — without increasing spend.
        </div>
        <div>
          <strong>Efficiency Gain:</strong> Reducing marketing waste by 10% recovers approximately{" "}
          <strong>{money(kpis.spend30 * 0.1)}</strong> per month in margin.
        </div>
        <div>
          <strong>Strategic Projection:</strong> Under <strong>{kpis.scenario?.label}</strong>, 90-day revenue projects to{" "}
          <strong>{money(kpis.forecast90)}</strong>.
        </div>
      </div>

      {/* Quick links */}
      <div style={{ ...S.pillLinkRow, marginTop: 12 }}>
        <a href="/api/export/executive-summary" style={S.badge}>
          Boardroom Export (PDF)
        </a>
        <div onClick={() => nav("/workspaces")} style={S.badge}>
          Workspaces
        </div>
        <div onClick={() => nav("/invites")} style={S.badge}>
          Invites
        </div>
        <div onClick={() => nav("/clients")} style={S.badge}>
          Clients
        </div>
        <div onClick={() => nav("/pipeline")} style={S.badge}>
          Pipeline
        </div>
      </div>

      {/* Scenario Mode */}
      <div style={S.simRow}>
        {scenarioList.map((s) => (
          <button
            key={s.key}
            onClick={() => setScenarioKey(s.key)}
            style={{
              ...S.badge,
              background: scenarioKey === s.key ? "rgba(124,92,255,0.18)" : "rgba(255,255,255,0.04)",
              border: scenarioKey === s.key ? "1px solid rgba(124,92,255,0.45)" : "1px solid rgba(255,255,255,0.10)",
            }}
            title={s.note || ""}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div style={S.kpiGrid}>
        <div style={S.card}>
          <div style={S.kLabel}>REVENUE (30D)</div>
          <div style={S.kValue}>{moneyCompact(kpis.revenue30)}</div>
          <div style={S.kSub}>
            Momentum:{" "}
            {kpis.wow == null ? (
              "—"
            ) : (
              <span style={kpis.wow >= 0 ? S.statusGood : S.statusBad}>
                {kpis.wow >= 0 ? "▲" : "▼"} {Math.abs(kpis.wow).toFixed(1)}% WoW
              </span>
            )}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.kLabel}>PIPELINE</div>
          <div style={S.kValue}>{moneyCompact(kpis.pipelineValue)}</div>
          <div style={S.kSub}>
            Coverage: <strong>{kpis.coverage.toFixed(1)}x</strong>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.kLabel}>CUSTOMER ACQUISITION COST</div>
          <div style={S.kValue}>{moneyCompact(kpis.cac)}</div>
          <div style={S.kSub}>Based on spend/leads (30D)</div>
        </div>

        <div style={S.card}>
          <div style={S.kLabel}>FORECAST (90D)</div>
          <div style={S.kValue}>{moneyCompact(kpis.forecast90)}</div>
          <div style={S.kSub}>Scenario-based projection</div>
        </div>

        <div style={S.card}>
          <div style={S.kLabel}>REVENUE STABILITY INDEX</div>
          <div style={{ marginTop: 10, fontSize: 34, fontWeight: 950, ...S.statusGood }}>
            {Math.round(rsi.score)}/100
          </div>
          <div style={S.kSub}>
            Tier: <strong>{rsi.tier}</strong>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={S.grid}>
        {/* LEFT */}
        <div style={S.chartsGrid}>
          <div style={S.chartRow}>
            <div style={S.card}>
              <div style={S.sectionTitle}>Revenue vs Spend (30 Days)</div>
              <div style={S.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics} margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" tickMargin={8} />
                    <YAxis tickMargin={8} />
                    <Tooltip formatter={(value, name) => [money(value), name]} />
                    <Legend />
                    <Line type="monotone" dataKey="spend" stroke="#8884d8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="revenue" stroke="#00c6ff" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.sectionTitle}>Pipeline by Stage</div>
              <div style={S.miniChartBox}>
                {pipelineByStage.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(value) => money(value)} />
                      <Legend />
                      <Pie data={pipelineByStage} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={3}>
                        {pipelineByStage.map((entry, idx) => (
                          <Cell key={entry.name} fill={donutColors[idx % donutColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ opacity: 0.85, paddingTop: 10 }}>
                    No pipeline stage data yet.
                    <div style={{ opacity: 0.7, marginTop: 6, fontSize: 13 }}>
                      Once deals have stages + values, this donut fills automatically.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Leads (30 Days)</div>
            <div style={S.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics} margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" tickMargin={8} />
                  <YAxis tickMargin={8} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={S.sectionTitle}>AI-Powered Insights</div>
              <button
                onClick={onGenerateInsights}
                disabled={insightsLoading}
                style={{ ...S.actionBtn, ...(insightsLoading ? S.actionBtnDisabled : null) }}
              >
                {insightsLoading ? "Generating..." : "Generate New Insights"}
              </button>
            </div>

            <div style={S.helperText}>
              Generates fresh executive insights based on your latest revenue, spend, pipeline, and lead signals.
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={S.insightWrap}>
                {displayedInsights.map((it, idx) => (
                  <div key={`${it.title}-${idx}`} style={S.insightItem(it.type)}>
                    <div style={S.insightTop}>
                      <div style={S.tag(it.type)}>
                        {it.type} <span style={{ opacity: 0.7 }}>•</span> {it.impact}
                      </div>
                      <div style={S.confidence}>{it.confidence}% CONFIDENCE</div>
                    </div>
                    <div style={S.insightTitle}>{it.title}</div>
                    <div style={S.insightBody}>{it.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={S.rightStack}>
          <div style={S.card}>
            <div style={S.sectionTitle}>Connected Integrations</div>
            {integrations?.length ? (
              <div style={S.list}>
                {integrations.slice(0, 6).map((i, idx) => {
                  const meta = integrationMeta(i);
                  return (
                    <div key={i?._id || i?.id || `${i?.provider || i?.name || "int"}-${idx}`} style={S.pillCard}>
                      <div style={S.pillTitle}>{prettyProvider(i)}</div>
                      <div style={S.pillMeta}>
                        Status: <strong>{prettyStatus(i)}</strong>
                        {meta ? <div style={{ opacity: 0.75, marginTop: 6 }}>{meta}</div> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ opacity: 0.85 }}>
                No integrations connected yet.
                <div style={{ opacity: 0.7, marginTop: 6, fontSize: 13 }}>
                  Connect Google Ads, Meta, LinkedIn, or your CRM to unlock full attribution.
                </div>
              </div>
            )}

            <div style={S.divider} />

            <div style={S.sectionTitle}>Recent Deals</div>
            {deals?.length ? (
              <div style={S.list}>
                {deals.slice(0, 5).map((d, idx) => (
                  <div key={d?._id || d?.id || `${d?.name || "deal"}-${idx}`} style={S.pillCard}>
                    <div style={S.pillTitle}>
                      {d?.clientId?.name ? `${d.clientId.name} — ` : ""}
                      {d?.name || d?.title || "Deal"}
                    </div>
                    <div style={S.pillMeta}>
                      Value: <strong>{money(d?.amount ?? d?.value ?? d?.pipelineValue ?? 0)}</strong>{" "}
                      <span style={{ opacity: 0.8 }}>• Stage:</span>{" "}
                      <strong>{normalizeStage(d?.stage || d?.status)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ opacity: 0.85 }}>No deals yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}