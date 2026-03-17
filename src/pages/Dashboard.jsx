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

import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  Source,
  Layer,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import OrgSwitcher from "../components/OrgSwitcher";
import AnimatedCounter from "../components/AnimatedCounter";
import AITicker from "../components/AITicker";
import CommandBar from "../components/CommandBar";
import ForecastConfidence from "../components/ForecastConfidence";
import SystemStatus from "../components/SystemStatus";
import ExecutiveBriefing from "../components/ExecutiveBriefing";
import RevenueLeakDetector from "../components/RevenueLeakDetector";
import PipelineVelocity from "../components/PipelineVelocity";
import OpportunityRadar from "../components/atlas/OpportunityRadar";
import RevenueTimeline from "../components/atlas/RevenueTimeline";
import LiveRevenueSnapshot from "../components/atlas/LiveRevenueSnapshot";
import DealRiskDetectionAI from "../components/atlas/DealRiskDetectionAI";
import ExecutiveSummary from "../components/ExecutiveSummary";

import {
  ResponsiveContainer,
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
  AreaChart,
  Area,
} from "recharts";

/** ---------------- Mapbox setup ---------------- */
const rawMapToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
const DASHBOARD_MAPBOX_TOKEN =
  rawMapToken && rawMapToken !== "YOUR_MAPBOX_PUBLIC_TOKEN" ? rawMapToken : "";

if (DASHBOARD_MAPBOX_TOKEN) {
  mapboxgl.accessToken = DASHBOARD_MAPBOX_TOKEN;
}

const hasDashboardMapToken = Boolean(DASHBOARD_MAPBOX_TOKEN);

const dashboardFallbackMapStyle = {
  version: 8,
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    },
  },
  layers: [
    {
      id: "carto-dark-layer",
      type: "raster",
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

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
  if (abs >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
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

const buildLocalInsights = (kpis, seed = 0) => {
  const jitter = (base, range = 6) => {
    const r = Math.sin((seed + base) * 999) * 10000;
    const frac = r - Math.floor(r);
    const delta = (frac - 0.5) * range * 2;
    return clamp(Math.round(base + delta), 60, 97);
  };

  const items = [];

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

function MiniRegionMarker({ region, onClick }) {
  const size = Math.max(14, Math.min(26, Math.round((region.pipeline / 1_000_000) * 1.4 + 10)));

  return (
    <Marker longitude={region.lng} latitude={region.lat} anchor="center">
      <button
        type="button"
        title={region.region}
        onClick={(e) => {
          e.stopPropagation();
          onClick(region);
        }}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          border: "2px solid rgba(255,255,255,0.92)",
          cursor: "pointer",
          animation: "atlasPulse 2.2s infinite",
          background:
            region.signal >= 60
              ? "radial-gradient(circle at 35% 35%, #d8fbff, #22c55e 58%, #0891b2 100%)"
              : region.signal >= 35
              ? "radial-gradient(circle at 35% 35%, #fef3c7, #f59e0b 58%, #d97706 100%)"
              : "radial-gradient(circle at 35% 35%, #fecdd3, #fb7185 58%, #be123c 100%)",
          boxShadow: "0 0 0 8px rgba(56,189,248,0.10), 0 10px 24px rgba(0,0,0,0.35)",
        }}
      />
    </Marker>
  );
}

export default function Dashboard() {
  const nav = useNavigate();

  useEffect(() => {
    if (
      !localStorage.getItem("atlas_onboarded") &&
      window.location.pathname !== "/welcome"
    ) {
      window.location.href = "/welcome";
    }
  }, []);

  const [dashboard, setDashboard] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [pipeline, setPipeline] = useState({ deals: [], pipelineValue: 0 });
  const [attribution, setAttribution] = useState(null);
  const [rss, setRss] = useState(null);

  const [serverScenarios, setServerScenarios] = useState(null);
  const [scenarioKey, setScenarioKey] = useState("current");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [aiInsights, setAiInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightSeed, setInsightSeed] = useState(Date.now());

  const isDev = !!import.meta.env.DEV;
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMsg, setDemoMsg] = useState("");

  const [selectedMiniRegion, setSelectedMiniRegion] = useState(null);
  const [miniMapView, setMiniMapView] = useState({
    longitude: 10,
    latitude: 18,
    zoom: 0.9,
  });

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("analyst");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteErr, setInviteErr] = useState("");

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
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMiniMapView((prev) => ({
        ...prev,
        longitude: prev.longitude >= 180 ? -180 : prev.longitude + 0.08,
      }));
    }, 70);

    return () => clearInterval(interval);
  }, []);

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

  async function handleQuickInvite() {
    setInviteMsg("");
    setInviteErr("");

    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      setInviteErr("Please enter an email address.");
      return;
    }

    try {
      setInviteLoading(true);

      const token =
        localStorage.getItem("butler_token") ||
        localStorage.getItem("token") ||
        "";

      const orgId =
        localStorage.getItem("x-org-id") ||
        localStorage.getItem("orgId") ||
        localStorage.getItem("butler_org_id") ||
        "";

      const res = await fetch("https://atlas-revenue-backend.onrender.com/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(orgId ? { "x-org-id": orgId } : {}),
        },
        body: JSON.stringify({
          email,
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send invite.");
      }

      setInviteMsg(`Invite sent to ${email}.`);
      setInviteEmail("");
      setInviteRole("analyst");
    } catch (e) {
      setInviteErr(e?.message || "Failed to send invite.");
    } finally {
      setInviteLoading(false);
    }
  }

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
      x: new Date(m.date).toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      }),
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

  const kpis = useMemo(() => {
    const m = activeScenario?.multipliers || {
      revenue: 1,
      spend: 1,
      leads: 1,
      pipeline: 1,
    };

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

  const liveRevenueSnapshot = useMemo(() => {
    const projectedRevenue = Math.max(
      safeNum(kpis.forecast90),
      safeNum(kpis.revenue30) * 3
    );

    const pipelineValue = safeNum(kpis.pipelineValue);
    const dealsAtRisk = Math.max(
      0,
      Math.round((safeNum(rss?.score) < 70 ? 3 : 1) + safeNum(dashboard?.staleDeals || 0))
    );
    const activeOpportunities = Array.isArray(deals) ? deals.length : 0;

    const forecastConfidence = clamp(
      Math.round((safeNum(rss?.score) || safeNum(kpis.healthScore)) * 0.95),
      55,
      98
    );

    return {
      projectedRevenue,
      pipelineValue,
      dealsAtRisk,
      activeOpportunities,
      forecastConfidence,
    };
  }, [kpis, rss, dashboard, deals]);

  const dealRiskItems = useMemo(() => {
    const sortedDeals = [...(Array.isArray(deals) ? deals : [])]
      .map((d, idx) => {
        const value = safeNum(d?.amount ?? d?.value ?? d?.pipelineValue);
        const stage = normalizeStage(d?.stage || d?.status);
        const staleDays = safeNum(d?.daysInStage ?? d?.staleDays ?? d?.ageDays);
        const probability = safeNum(d?.probability ?? d?.closeProbability ?? 0);

        let risk = "Watch";
        let reason = "Atlas AI suggests this deal should be monitored closely.";

        if (staleDays > 30 || probability < 35) {
          risk = "High";
          reason =
            "Atlas AI detected stalled movement, weak next-step clarity, and elevated close risk.";
        } else if (staleDays > 18 || probability < 50) {
          risk = "Medium";
          reason =
            "Opportunity is aging in stage longer than expected and follow-up velocity is slowing.";
        } else {
          reason =
            "Multiple timing and activity signals suggest this opportunity should remain on the watchlist.";
        }

        return {
          title: d?.name || d?.title || `Opportunity ${idx + 1}`,
          stage,
          risk,
          value,
          reason,
        };
      })
      .sort((a, b) => {
        const riskWeight = { High: 3, Medium: 2, Watch: 1 };
        return (riskWeight[b.risk] || 0) - (riskWeight[a.risk] || 0) || b.value - a.value;
      });

    if (sortedDeals.length) return sortedDeals.slice(0, 4);

    return [
      {
        title: "Opportunity 1",
        stage: "Proposal",
        risk: "High",
        value: 85000,
        reason:
          "Atlas AI detected stalled movement, weak next-step clarity, and elevated close risk.",
      },
      {
        title: "Opportunity 2",
        stage: "Negotiation",
        risk: "Medium",
        value: 62000,
        reason:
          "Opportunity is aging in stage longer than expected and follow-up velocity is slowing.",
      },
    ];
  }, [deals]);

  async function onGenerateInsights() {
    try {
      setInsightsLoading(true);
      setError("");
      const seed = Date.now();
      setAiInsights([]);
      setInsightSeed(seed);
    } catch (e) {
      console.error("Generate insights error:", e);
      setError("Failed to generate insights");
    } finally {
      setInsightsLoading(false);
    }
  }

  const pipelineByStage = useMemo(() => {
    const map = new window.Map();

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
      score >= 85
        ? "Strong"
        : score >= 70
        ? "Controlled Volatility"
        : score >= 55
        ? "Watchlist"
        : "High Risk";

    return { score, tier };
  }, [rss, kpis]);

  const overviewSignals = useMemo(() => {
    const items = [];

    if (kpis.wow != null) {
      items.push(
        kpis.wow >= 0
          ? `Revenue momentum is up ${Math.abs(kpis.wow).toFixed(1)}% week over week`
          : `Revenue momentum is down ${Math.abs(kpis.wow).toFixed(1)}% week over week`
      );
    }

    if (kpis.coverage < 2) {
      items.push("Pipeline coverage is below target and needs immediate lift");
    } else if (kpis.coverage < 4) {
      items.push("Pipeline coverage is workable but not yet elite");
    } else {
      items.push("Pipeline coverage is strong and protecting forecast stability");
    }

    if (channelChart.length) {
      items.push(
        `${channelChart[0]?.channel || "Top channel"} is currently leading attributed revenue`
      );
    }

    if (integrations.length < 2) {
      items.push("More integrations should be connected to unlock fuller attribution visibility");
    }

    if (safeNum(kpis.cac) > 500) {
      items.push("Customer acquisition cost is elevated and should be reviewed");
    }

    return items.slice(0, 5);
  }, [kpis, channelChart, integrations]);

  const regionalSignals = useMemo(() => {
    const pipelineBase = safeNum(kpis.pipelineValue || 0);
    const revenueBase = safeNum(kpis.revenue30 || 0);

    return [
      {
        region: "North America",
        signal: 72,
        revenue: revenueBase * 0.46,
        pipeline: pipelineBase * 0.44,
        note: "Strongest current execution zone",
        lat: 37.0902,
        lng: -95.7129,
      },
      {
        region: "Europe",
        signal: 44,
        revenue: revenueBase * 0.24,
        pipeline: pipelineBase * 0.27,
        note: "Healthy pipeline, moderate close pressure",
        lat: 50.1109,
        lng: 8.6821,
      },
      {
        region: "Asia",
        signal: 38,
        revenue: revenueBase * 0.18,
        pipeline: pipelineBase * 0.19,
        note: "Emerging expansion territory",
        lat: 1.3521,
        lng: 103.8198,
      },
      {
        region: "LATAM",
        signal: 21,
        revenue: revenueBase * 0.12,
        pipeline: pipelineBase * 0.1,
        note: "Early-stage opportunity density",
        lat: -15.7801,
        lng: -47.9292,
      },
    ].sort((a, b) => b.signal - a.signal);
  }, [kpis]);

  const revenueFlows = useMemo(
    () => [
      { from: "North America", to: "Europe" },
      { from: "North America", to: "Asia" },
      { from: "Europe", to: "Asia" },
    ],
    []
  );

  const revenueFlowGeoJson = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: revenueFlows
        .map((f) => {
          const start = regionalSignals.find((r) => r.region === f.from);
          const end = regionalSignals.find((r) => r.region === f.to);
          if (!start || !end) return null;

          return {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [start.lng, start.lat],
                [end.lng, end.lat],
              ],
            },
          };
        })
        .filter(Boolean),
    };
  }, [regionalSignals, revenueFlows]);

  const axisTick = { fill: "#9fb0d0", fontSize: 11 };

  const tooltipStyle = {
    background: "rgba(7,11,24,0.97)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "14px",
    color: "#fff",
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  };

  const legendStyle = { color: "#dbe4f0" };

  const S = useMemo(() => {
    const card = {
      background: "rgba(10, 16, 35, 0.55)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 16,
      backdropFilter: "blur(10px)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    };

    return {
      page: { minHeight: "100vh", padding: "22px 22px 34px", color: "#EAF0FF" },
      bgGlow: {
        position: "fixed",
        inset: 0,
        zIndex: -1,
        background: `
          linear-gradient(#0a0f1f 1px, transparent 1px),
          linear-gradient(90deg,#0a0f1f 1px, transparent 1px),
          radial-gradient(circle at 20% 20%,rgba(124,92,255,.25),transparent),
          radial-gradient(circle at 80% 30%,rgba(56,189,248,.15),transparent),
          #05070f
        `,
        backgroundSize: "60px 60px,60px 60px,auto,auto",
      },
      topRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 14,
        flexWrap: "wrap",
      },
      title: { margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: 0.2 },
      sub: { marginTop: 8, opacity: 0.85, fontSize: 13 },
      org: { opacity: 0.9, fontSize: 13, marginTop: 8 },
      badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
        fontSize: 11,
        opacity: 0.95,
        textDecoration: "none",
        color: "#EAF0FF",
        cursor: "pointer",
        fontWeight: 700,
      },
      simRow: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 12,
      },
      navGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 12,
        marginTop: 12,
        marginBottom: 12,
      },
      navCard: {
        borderRadius: 16,
        padding: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        cursor: "pointer",
      },
      navTitle: { fontWeight: 900, fontSize: 14, marginBottom: 8 },
      navDesc: { fontSize: 12, opacity: 0.8, lineHeight: 1.45 },
      signalStrip: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 10,
        marginTop: 12,
        marginBottom: 12,
      },
      signalPill: {
        borderRadius: 14,
        padding: "12px 14px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        fontSize: 12,
        lineHeight: 1.45,
        opacity: 0.92,
      },
      kpiGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: 12,
        marginBottom: 12,
      },
      card,
      kLabel: {
        fontSize: 11,
        opacity: 0.8,
        letterSpacing: 0.8,
      },
      kValue: {
        marginTop: 8,
        fontSize: 28,
        fontWeight: 900,
        lineHeight: 1.08,
      },
      kSub: {
        marginTop: 8,
        fontSize: 12,
        opacity: 0.85,
        lineHeight: 1.45,
      },
      grid: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 2.15fr) minmax(0, 1fr)",
        gap: 12,
        alignItems: "start",
      },
      chartsGrid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12 },
      chartRow: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.05fr)",
        gap: 12,
      },
      sectionTitle: { fontSize: 16, fontWeight: 900, marginBottom: 10 },
      chartShell: {
        height: 260,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        background: "rgba(4,10,24,0.72)",
        padding: 10,
      },
      miniChartShell: {
        height: 220,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        background: "rgba(4,10,24,0.72)",
        padding: 10,
      },
      miniWorldGrid: {
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        gap: 12,
      },
      miniMapShell: {
        height: 320,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        overflow: "hidden",
        background: "rgba(4,10,24,0.72)",
        position: "relative",
      },
      miniMapHud: {
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 5,
        width: 220,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "linear-gradient(180deg, rgba(8,14,28,0.88), rgba(5,9,18,0.82))",
        backdropFilter: "blur(10px)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.30)",
        overflow: "hidden",
      },
      miniMapHudHead: {
        padding: "10px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      },
      miniMapHudTitle: {
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: "rgba(148,163,184,0.82)",
        fontWeight: 800,
      },
      miniMapHudBody: {
        padding: 12,
        display: "grid",
        gap: 10,
      },
      miniMapHudLabel: {
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: "rgba(148,163,184,0.78)",
        fontWeight: 800,
      },
      miniMapHudValue: {
        fontSize: 22,
        lineHeight: 1.05,
        fontWeight: 900,
        color: "#fff",
      },
      miniMapHudSub: {
        fontSize: 12,
        color: "rgba(203,213,225,0.74)",
        lineHeight: 1.45,
      },
      miniMapStatus: {
        position: "absolute",
        left: 12,
        bottom: 12,
        zIndex: 5,
        padding: "7px 11px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(7,11,24,0.82)",
        color: "#cbd5e1",
        fontSize: 10,
        fontWeight: 700,
      },
      miniMapSide: {
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        background: "rgba(4,10,24,0.55)",
        padding: 14,
      },
      miniMapSideTitle: {
        fontSize: 14,
        fontWeight: 900,
        marginBottom: 10,
      },
      miniRankList: {
        display: "grid",
        gap: 10,
      },
      miniRankRow: {
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        padding: 10,
      },
      miniRankTop: {
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        alignItems: "center",
      },
      miniRankName: {
        fontWeight: 800,
        fontSize: 13,
      },
      miniRankValue: {
        fontWeight: 900,
        fontSize: 13,
      },
      rightStack: { display: "flex", flexDirection: "column", gap: 12 },
      divider: { height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" },
      list: { display: "grid", gap: 10 },
      pillCard: {
        borderRadius: 14,
        padding: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
      },
      pillTitle: { fontWeight: 900, fontSize: 14, marginBottom: 6 },
      pillMeta: { opacity: 0.85, fontSize: 13, lineHeight: 1.35 },
      progressWrap: {
        height: 10,
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)",
      },
      progressBar: (pct) => ({
        height: "100%",
        width: `${clamp(pct, 0, 200)}%`,
        background: "linear-gradient(90deg, rgba(56,189,248,0.9), rgba(124,92,255,0.9))",
      }),
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
      insightTop: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
      },
      tag: (type) => ({
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 0.7,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        color: type === "SUCCESS" ? "#22C55E" : type === "WARNING" ? "#F59E0B" : "#38BDF8",
      }),
      confidence: {
        fontSize: 11,
        fontWeight: 900,
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
      },
      insightTitle: { fontWeight: 900, fontSize: 15, marginTop: 10 },
      insightBody: { opacity: 0.88, marginTop: 6, fontSize: 13, lineHeight: 1.45 },
      statusGood: { color: "#22C55E", fontWeight: 900 },
      statusWarn: { color: "#F59E0B", fontWeight: 900 },
      statusBad: { color: "#FB7185", fontWeight: 900 },
      error: {
        marginTop: 10,
        borderRadius: 12,
        padding: 12,
        border: "1px solid rgba(255,0,0,0.25)",
        background: "rgba(255,0,0,0.10)",
      },
      actionBtn: {
        borderRadius: 999,
        padding: "10px 14px",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        color: "#EAF0FF",
        fontWeight: 900,
        fontSize: 12,
        cursor: "pointer",
        opacity: 0.98,
      },
      actionBtnDisabled: { cursor: "not-allowed", opacity: 0.65 },
      helperText: { opacity: 0.75, fontSize: 12, marginTop: 6, lineHeight: 1.45 },
      success: {
        marginTop: 10,
        borderRadius: 12,
        padding: 12,
        border: "1px solid rgba(34,197,94,0.30)",
        background: "rgba(34,197,94,0.12)",
        color: "rgba(234,240,255,0.95)",
      },
    };
  }, []);

  const riskStyle =
    kpis.risk.tone === "good"
      ? S.statusGood
      : kpis.risk.tone === "warn"
      ? S.statusWarn
      : S.statusBad;

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.bgGlow} />
        <h1 style={S.title}>Atlas Overview</h1>
        <div style={S.sub}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />

      <div style={S.topRow}>
        <div>
          <h1 style={S.title}>Atlas Overview</h1>
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
            <OrgSwitcher onSwitched={loadDashboardData} />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {isDev ? (
              <button
                onClick={onLoadDemoData}
                disabled={demoLoading}
                style={{ ...S.actionBtn, ...(demoLoading ? S.actionBtnDisabled : {}) }}
                title="Seeds demo clients + deals into the active workspace"
              >
                {demoLoading ? "Loading Demo…" : "Load Demo Data"}
              </button>
            ) : null}

            <div style={S.badge}>Revenue OS Overview</div>
            <div style={S.badge}>AI Insights Active</div>
            <div style={S.badge}>Secure Session</div>
          </div>
        </div>
      </div>

      {demoMsg ? <div style={S.success}>{demoMsg}</div> : null}
      {error ? <div style={S.error}>{error}</div> : null}

      <SystemStatus />
<AITicker />
<CommandBar />

<div style={{ ...S.card, marginTop: 12, marginBottom: 12 }}>
  <div style={S.sectionTitle}>Invite Your Team</div>

  <div style={S.helperText}>
    Bring analysts, managers, and leadership into Atlas so your whole team can
    operate inside one revenue command center.
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1.6fr 0.8fr auto",
      gap: 12,
      marginTop: 14,
    }}
  >
    <input
      type="email"
      placeholder="person@company.com"
      value={inviteEmail}
      onChange={(e) => setInviteEmail(e.target.value)}
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        color: "#EAF0FF",
        outline: "none",
      }}
    />

    <select
      value={inviteRole}
      onChange={(e) => setInviteRole(e.target.value)}
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        color: "#EAF0FF",
        outline: "none",
      }}
    >
      <option value="analyst">analyst</option>
      <option value="manager">manager</option>
      <option value="admin">admin</option>
      <option value="viewer">viewer</option>
    </select>

    <button
      onClick={handleQuickInvite}
      disabled={inviteLoading}
      style={{
        ...S.actionBtn,
        ...(inviteLoading ? S.actionBtnDisabled : {}),
        minWidth: 140,
      }}
    >
      {inviteLoading ? "Sending..." : "Send Invite"}
    </button>
  </div>

  {inviteMsg ? <div style={S.success}>{inviteMsg}</div> : null}
  {inviteErr ? <div style={S.error}>{inviteErr}</div> : null}
</div>
      
     
      <div style={S.signalStrip}>
        {overviewSignals.map((signal, idx) => (
          <div key={`${signal}-${idx}`} style={S.signalPill}>
            {signal}
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={S.sectionTitle}>Atlas Executive Overview</div>
        <div style={{ display: "grid", gap: 8, fontSize: 14, opacity: 0.95, lineHeight: 1.6 }}>
          <div>
            <ExecutiveBriefing kpis={kpis} />
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
          <div style={{ marginTop: 4, opacity: 0.8, fontSize: 12 }}>
            Mode: <strong>{kpis.scenario?.label || "Current"}</strong> —{" "}
            {kpis.scenario?.note || "Actual performance"}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <LiveRevenueSnapshot
          projectedRevenue={liveRevenueSnapshot.projectedRevenue}
          pipelineValue={liveRevenueSnapshot.pipelineValue}
          dealsAtRisk={liveRevenueSnapshot.dealsAtRisk}
          activeOpportunities={liveRevenueSnapshot.activeOpportunities}
          forecastConfidence={liveRevenueSnapshot.forecastConfidence}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <DealRiskDetectionAI deals={dealRiskItems} />
      </div>

      <div style={S.navGrid}>
        <div style={S.navCard} onClick={() => nav("/command-center")}>
          <div style={S.navTitle}>Command Center</div>
          <div style={S.navDesc}>
            Go to the main revenue war room for forecast, pipeline health, and AI intelligence.
          </div>
        </div>

        <div style={S.navCard} onClick={() => nav("/deal-war-room")}>
          <div style={S.navTitle}>Deal War Room</div>
          <div style={S.navDesc}>
            Analyze opportunity risk, stakeholders, next best actions, and close probability.
          </div>
        </div>

        <div style={S.navCard} onClick={() => nav("/growth-engine")}>
          <div style={S.navTitle}>Growth Engine</div>
          <div style={S.navDesc}>
            Connect marketing to pipeline and understand what channels drive revenue.
          </div>
        </div>

        <div style={S.navCard} onClick={() => nav("/atlas-ai-operator")}>
          <div style={S.navTitle}>Atlas AI Operator</div>
          <div style={S.navDesc}>
            Open the AI copilot for executive insights, strategy prompts, and revenue guidance.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
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

      <div style={S.card}>
        <div style={S.sectionTitle}>Forecast Confidence</div>
        <PipelineVelocity pipeline={pipeline} />
        <ForecastConfidence
          coverage={kpis.coverage}
          pipeline={kpis.pipelineValue}
          revenue={kpis.revenue30}
          forecast={kpis.forecast90}
        />
      </div>

      <div style={S.simRow}>
        {scenarioList.map((s) => (
          <button
            key={s.key}
            onClick={() => setScenarioKey(s.key)}
            style={{
              ...S.badge,
              background:
                scenarioKey === s.key ? "rgba(124,92,255,0.18)" : "rgba(255,255,255,0.04)",
              border:
                scenarioKey === s.key
                  ? "1px solid rgba(124,92,255,0.45)"
                  : "1px solid rgba(255,255,255,0.10)",
            }}
            title={s.note || ""}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={S.kpiGrid}>
        <div style={S.card}>
          <div style={S.kLabel}>REVENUE (30D)</div>
          <div style={S.kValue}>
            <AnimatedCounter value={kpis.revenue30} formatter={moneyCompact} />
          </div>
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
          <div style={S.kValue}>
            <AnimatedCounter value={kpis.pipelineValue} formatter={moneyCompact} />
          </div>
          <div style={S.kSub}>
            Coverage: <strong>{kpis.coverage.toFixed(1)}x</strong>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.kLabel}>CUSTOMER ACQUISITION COST</div>
          <div style={S.kValue}>
            <AnimatedCounter value={kpis.cac} formatter={moneyCompact} />
          </div>
          <div style={S.kSub}>Based on spend/leads (30D)</div>
        </div>

        <div style={S.card}>
          <div style={S.kLabel}>FORECAST (90D)</div>
          <div style={S.kValue}>
            <AnimatedCounter value={kpis.forecast90} formatter={moneyCompact} />
          </div>
          <div style={S.kSub}>Scenario-based projection</div>
        </div>

        <div style={S.card}>
          <div style={S.kLabel}>REVENUE STABILITY INDEX</div>
          <div style={{ marginTop: 8, fontSize: 30, fontWeight: 950, ...S.statusGood }}>
            <AnimatedCounter value={Math.round(rsi.score)} /> / 100
          </div>
          <div style={S.kSub}>
            Tier: <strong>{rsi.tier}</strong>
          </div>
        </div>
      </div>

      <div style={S.grid}>
        <div style={S.chartsGrid}>
          <div style={S.chartRow}>
            <div style={S.card}>
              <div style={S.sectionTitle}>Revenue vs Spend (30 Days)</div>
              <div style={S.chartShell}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00c6ff" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#00c6ff" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#7C5CFF" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
                    <XAxis dataKey="x" tick={axisTick} tickMargin={8} stroke="#94a3b8" />
                    <YAxis
                      tick={axisTick}
                      tickMargin={8}
                      stroke="#94a3b8"
                      tickFormatter={moneyCompact}
                    />
                    <Tooltip
                      formatter={(value, name) => [money(value), name]}
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend wrapperStyle={legendStyle} />
                    <Area
                      type="monotone"
                      dataKey="spend"
                      stroke="#7C5CFF"
                      fill="url(#spendFill)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00c6ff"
                      fill="url(#revFill)"
                      strokeWidth={3}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.sectionTitle}>Pipeline by Stage</div>
              <div style={S.miniChartShell}>
                {pipelineByStage.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(value) => money(value)}
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend wrapperStyle={legendStyle} />
                      <Pie
                        data={pipelineByStage}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="85%"
                        paddingAngle={3}
                      >
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
            <div style={S.chartShell}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
                  <XAxis dataKey="x" tick={axisTick} tickMargin={8} stroke="#94a3b8" />
                  <YAxis tick={axisTick} tickMargin={8} stroke="#94a3b8" />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#fff" }} />
                  <Legend wrapperStyle={legendStyle} />
                  <Bar dataKey="leads" fill="#38BDF8" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Channel Revenue Attribution</div>
            <div style={S.chartShell}>
              {channelChart.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelChart} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
                    <XAxis dataKey="channel" tick={axisTick} tickMargin={8} stroke="#94a3b8" />
                    <YAxis
                      tick={axisTick}
                      tickMargin={8}
                      stroke="#94a3b8"
                      tickFormatter={moneyCompact}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "revenue" || name === "spend") return [money(value), name];
                        if (name === "roiPct") return [`${safeNum(value).toFixed(1)}%`, name];
                        return [value, name];
                      }}
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend wrapperStyle={legendStyle} />
                    <Bar dataKey="revenue" fill="#38BDF8" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="spend" fill="#7C5CFF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ opacity: 0.85 }}>
                  No attribution data yet.
                  <div style={{ opacity: 0.7, marginTop: 6, fontSize: 13 }}>
                    Connect ad platforms and CRM sources to unlock channel-level attribution.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Global Revenue Intelligence Map</div>

            <div style={S.miniWorldGrid}>
              <div style={S.miniMapShell}>
                <div style={S.miniMapHud}>
                  <div style={S.miniMapHudHead}>
                    <div style={S.miniMapHudTitle}>Atlas Live Region Monitor</div>
                  </div>

                  <div style={S.miniMapHudBody}>
                    <div>
                      <div style={S.miniMapHudLabel}>Top Active Region</div>
                      <div style={S.miniMapHudValue}>{regionalSignals[0]?.region || "—"}</div>
                      <div style={S.miniMapHudSub}>
                        Highest revenue concentration and strongest leadership priority.
                      </div>
                    </div>

                    <div>
                      <div style={S.miniMapHudLabel}>Revenue</div>
                      <div style={S.miniMapHudValue}>
                        {moneyCompact(regionalSignals[0]?.revenue || 0)}
                      </div>
                    </div>

                    <div>
                      <div style={S.miniMapHudLabel}>Pipeline</div>
                      <div style={S.miniMapHudValue}>
                        {moneyCompact(regionalSignals[0]?.pipeline || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <Map
                  {...miniMapView}
                  onMove={(e) => setMiniMapView(e.viewState)}
                  mapboxAccessToken={DASHBOARD_MAPBOX_TOKEN || undefined}
                  mapStyle={
                    hasDashboardMapToken
                      ? "mapbox://styles/mapbox/dark-v11"
                      : dashboardFallbackMapStyle
                  }
                  projection={hasDashboardMapToken ? "globe" : "mercator"}
                  attributionControl={false}
                  style={{ width: "100%", height: "100%" }}
                  onClick={() => setSelectedMiniRegion(null)}
                  onLoad={(e) => {
                    const map = e.target;

                    if (hasDashboardMapToken) {
                      try {
                        map.setFog({
                          color: "rgb(10, 15, 35)",
                          "high-color": "rgb(36, 92, 223)",
                          "horizon-blend": 0.08,
                          "space-color": "rgb(3, 7, 18)",
                          "star-intensity": 0.25,
                        });
                      } catch {}
                    }

                    map.resize();
                  }}
                >
                  <NavigationControl position="top-right" />

                  <Source id="revenue-flows" type="geojson" data={revenueFlowGeoJson}>
                    <Layer
                      id="flow-lines"
                      type="line"
                      paint={{
                        "line-color": "#38BDF8",
                        "line-width": 2,
                        "line-opacity": 0.55,
                      }}
                    />
                  </Source>

                  {regionalSignals.map((region) => (
                    <MiniRegionMarker
                      key={region.region}
                      region={region}
                      onClick={setSelectedMiniRegion}
                    />
                  ))}

                  {selectedMiniRegion ? (
                    <Popup
                      longitude={selectedMiniRegion.lng}
                      latitude={selectedMiniRegion.lat}
                      anchor="top"
                      closeButton={false}
                      closeOnClick={false}
                      offset={20}
                      className="atlas-map-popup"
                    >
                      <div
                        style={{
                          minWidth: 220,
                          padding: 12,
                          borderRadius: 14,
                          color: "#fff",
                          background:
                            "linear-gradient(180deg, rgba(8,14,28,0.98), rgba(5,9,18,0.96))",
                          border: "1px solid rgba(255,255,255,0.10)",
                          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                        }}
                      >
                        <div style={{ fontWeight: 900, fontSize: 15 }}>
                          {selectedMiniRegion.region}
                        </div>

                        <div
                          style={{
                            marginTop: 10,
                            display: "grid",
                            gap: 6,
                            fontSize: 12,
                            color: "rgba(226,232,240,0.9)",
                          }}
                        >
                          <div>Revenue {moneyCompact(selectedMiniRegion.revenue)}</div>
                          <div>Pipeline {moneyCompact(selectedMiniRegion.pipeline)}</div>
                          <div>Signal {selectedMiniRegion.signal}%</div>
                        </div>

                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 11,
                            lineHeight: 1.5,
                            color: "rgba(203,213,225,0.74)",
                          }}
                        >
                          {selectedMiniRegion.note}
                        </div>
                      </div>
                    </Popup>
                  ) : null}
                </Map>

                {!hasDashboardMapToken ? (
                  <div style={S.miniMapStatus}>
                    Fallback map active — add VITE_MAPBOX_TOKEN for full globe
                  </div>
                ) : null}
              </div>

              <div style={S.miniMapSide}>
                <div style={S.miniMapSideTitle}>Regional Priority Ranking</div>

                <div style={S.miniRankList}>
                  {regionalSignals.map((r, idx) => (
                    <div key={`${r.region}-rank`} style={S.miniRankRow}>
                      <div style={S.miniRankTop}>
                        <div style={S.miniRankName}>
                          #{idx + 1} {r.region}
                        </div>
                        <div style={S.miniRankValue}>{r.signal}%</div>
                      </div>

                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.78, lineHeight: 1.45 }}>
                        {idx === 0
                          ? "Highest current revenue concentration and strongest leadership priority."
                          : idx === 1
                          ? "Healthy operating zone with room for stronger close execution."
                          : idx === 2
                          ? "Emerging territory with developing opportunity flow."
                          : "Lower-density region with longer-term upside potential."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={S.sectionTitle}>AI-Powered Insights</div>
              <button
                onClick={onGenerateInsights}
                disabled={insightsLoading}
                style={{ ...S.actionBtn, ...(insightsLoading ? S.actionBtnDisabled : {}) }}
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

        <div style={S.rightStack}>
          <div style={S.card}>
            <div style={S.sectionTitle}>Atlas AI Signals</div>
            <div style={S.list}>
              {overviewSignals.map((signal, idx) => (
                <div key={`${signal}-side-${idx}`} style={S.pillCard}>
                  <div style={S.pillMeta}>{signal}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Revenue Health Snapshot</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Pipeline Coverage</div>
              <div style={S.pillMeta}>
                <strong>{kpis.coverage.toFixed(1)}x</strong> •{" "}
                <span style={riskStyle}>{kpis.risk.label}</span>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Forecast Stability</div>
              <div style={S.pillMeta}>
                <strong>{rsi.score}/100</strong> • {rsi.tier}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Scenario Mode</div>
              <div style={S.pillMeta}>
                <strong>{kpis.scenario?.label}</strong> — {kpis.scenario?.note}
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Goal Tracking</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Monthly Revenue Goal</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  fontSize: 13,
                }}
              >
                <span>{money(targets.currentMonthRevenue)}</span>
                <span>{money(targets.monthlyRevenueGoal)}</span>
              </div>
              <div style={S.progressWrap}>
                <div style={S.progressBar(targets.monthPct)} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Quarter Forecast Progress</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  fontSize: 13,
                }}
              >
                <span>{money(targets.currentQuarterForecast)}</span>
                <span>{money(targets.quarterlyRevenueGoal)}</span>
              </div>
              <div style={S.progressWrap}>
                <div style={S.progressBar(targets.quarterPct)} />
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Connected Integrations</div>

            {integrations?.length ? (
              <div style={S.list}>
                {integrations.slice(0, 6).map((i, idx) => {
                  const meta = integrationMeta(i);

                  return (
                    <div
                      key={i?._id || i?.id || `${i?.provider || i?.name || "int"}-${idx}`}
                      style={S.pillCard}
                    >
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
            <RevenueLeakDetector pipeline={pipeline} />

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

          <div style={S.card}>
            <div style={S.sectionTitle}>Quick Navigation</div>

            <div style={S.list}>
              <div
                style={{ ...S.pillCard, cursor: "pointer" }}
                onClick={() => nav("/account-intelligence")}
              >
                <div style={S.pillTitle}>Account Intelligence</div>
                <div style={S.pillMeta}>
                  View engagement, revenue potential, and expansion opportunities.
                </div>
              </div>

              <div
                style={{ ...S.pillCard, cursor: "pointer" }}
                onClick={() => nav("/global-revenue-map")}
              >
                <div style={S.pillTitle}>Global Revenue Map</div>
                <div style={S.pillMeta}>
                  Analyze revenue and opportunity distribution by geography.
                </div>
              </div>

              <div
                style={{ ...S.pillCard, cursor: "pointer" }}
                onClick={() => nav("/reports")}
              >
                <div style={S.pillTitle}>Reports & Briefings</div>
                <div style={S.pillMeta}>
                  Generate executive-facing reports and boardroom summaries.
                </div>
              </div>

              <div
                style={{ ...S.pillCard, cursor: "pointer" }}
                onClick={() => nav("/partners")}
              >
                <div style={S.pillTitle}>Partners</div>
                <div style={S.pillMeta}>
                  Manage partner relationships and partner-sourced opportunity flow.
                </div>
              </div>

              <div
                style={{ ...S.pillCard, cursor: "pointer" }}
                onClick={() => nav("/integrations")}
              >
                <div style={S.pillTitle}>Integrations</div>
                <div style={S.pillMeta}>
                  Connect Google Ads, HubSpot, Stripe, and more.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 12,
        }}
      >
        <div style={S.card}>
          <div style={S.sectionTitle}>Opportunity Radar</div>
          <OpportunityRadar pipeline={pipeline} revenue={kpis.revenue30} />
        </div>

        <div style={S.card}>
          <div style={S.sectionTitle}>Revenue Timeline Projection</div>
          <RevenueTimeline forecast={kpis.forecast90} />
        </div>
      </div>
    </div>
  );
}