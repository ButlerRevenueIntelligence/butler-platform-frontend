import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getDashboard } from "../api";

const axisTick = { fill: "#9fb0d0", fontSize: 11 };

const tooltipStyle = {
  background: "rgba(7,11,24,0.97)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  color: "#fff",
  boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
};

const safeNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const moneyCompact = (num) => {
  const n = safeNum(num);
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
};

function parseRegionFromText(value = "") {
  const s = String(value || "").toLowerCase();

  if (
    s.includes("united states") ||
    s.includes("usa") ||
    s.includes("canada") ||
    s.includes("north america") ||
    s.includes("mexico")
  ) {
    return "North America";
  }

  if (
    s.includes("germany") ||
    s.includes("france") ||
    s.includes("uk") ||
    s.includes("united kingdom") ||
    s.includes("europe") ||
    s.includes("netherlands") ||
    s.includes("spain") ||
    s.includes("italy")
  ) {
    return "Europe";
  }

  if (
    s.includes("singapore") ||
    s.includes("japan") ||
    s.includes("india") ||
    s.includes("china") ||
    s.includes("asia") ||
    s.includes("hong kong")
  ) {
    return "Asia";
  }

  return "North America";
}

function toneStyle(tone) {
  const map = {
    Strong: {
      border: "1px solid rgba(16,185,129,0.22)",
      background: "rgba(16,185,129,0.12)",
      color: "#bbf7d0",
    },
    Stable: {
      border: "1px solid rgba(56,189,248,0.22)",
      background: "rgba(56,189,248,0.12)",
      color: "#bae6fd",
    },
    Emerging: {
      border: "1px solid rgba(245,158,11,0.22)",
      background: "rgba(245,158,11,0.12)",
      color: "#fde68a",
    },
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
    ...(map[tone] || map.Stable),
  };
}

function Section({ title, subtitle, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHead}>
        {subtitle ? <div style={styles.sectionSub}>{subtitle}</div> : null}
        <div style={styles.sectionTitle}>{title}</div>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function SmallStat({ label, value, note }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      {note ? <div style={styles.statNote}>{note}</div> : null}
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={styles.emptyState}>{text}</div>;
}

export default function GlobalRevenueMap() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getDashboard();
        if (!mounted) return;
        setDashboard(res || null);
      } catch (err) {
        console.error("GlobalRevenueMap load error:", err);
        if (!mounted) return;
        setError(err?.message || "Failed to load Global Revenue Map");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const workspaceMode = String(dashboard?.workspaceMode || "demo").toLowerCase();
  const isDemo = workspaceMode === "demo";
  const orgName = dashboard?.activeWorkspace?.name || "Workspace";
  const deals = Array.isArray(dashboard?.deals) ? dashboard.deals : [];
  const revenue = safeNum(dashboard?.summary?.revenue, 0);
  const pipelineValue = safeNum(dashboard?.summary?.pipelineValue, 0);
  const metrics = Array.isArray(dashboard?.metrics) ? dashboard.metrics : [];

  const mapRegions = useMemo(() => {
    if (isDemo) {
      return [
        {
          name: "North America",
          revenue: "$3.8M",
          pipeline: "$9.2M",
          closeRate: "36%",
          tone: "Strong",
          accounts: ["Apex Manufacturing", "Nova Healthcare", "Titan Logistics"],
          revenueNum: 3800000,
          pipelineNum: 9200000,
        },
        {
          name: "Europe",
          revenue: "$1.4M",
          pipeline: "$4.7M",
          closeRate: "29%",
          tone: "Stable",
          accounts: ["EuroMed Systems", "Vertex Industrial", "BlueCore Energy"],
          revenueNum: 1400000,
          pipelineNum: 4700000,
        },
        {
          name: "Asia",
          revenue: "$600K",
          pipeline: "$2.1M",
          closeRate: "22%",
          tone: "Emerging",
          accounts: ["Sakura Robotics", "Pacific Health Tech", "Orion Supply Group"],
          revenueNum: 600000,
          pipelineNum: 2100000,
        },
      ];
    }

    const grouped = new Map();

    deals.forEach((deal) => {
      const regionName = parseRegionFromText(
        deal?.region || deal?.country || deal?.location || deal?.territory || ""
      );

      if (!grouped.has(regionName)) {
        grouped.set(regionName, {
          name: regionName,
          revenueNum: 0,
          pipelineNum: 0,
          accounts: [],
          wonCount: 0,
          dealCount: 0,
        });
      }

      const row = grouped.get(regionName);
      const amount =
        safeNum(deal?.amount, 0) ||
        safeNum(deal?.value, 0) ||
        safeNum(deal?.pipelineValue, 0);

      const stage = String(deal?.stage || "");
      row.dealCount += 1;

      if (stage === "Closed Won") {
        row.revenueNum += amount;
        row.wonCount += 1;
      } else if (stage !== "Closed Lost") {
        row.pipelineNum += amount;
      }

      const accountName =
        deal?.accountName || deal?.company || deal?.clientName || deal?.name || "Account";

      if (!row.accounts.includes(accountName)) {
        row.accounts.push(accountName);
      }
    });

    return Array.from(grouped.values()).map((row) => {
      const closeRate =
        row.dealCount > 0 ? `${Math.round((row.wonCount / row.dealCount) * 100)}%` : "0%";

      let tone = "Emerging";
      if (row.revenueNum + row.pipelineNum >= 250000) tone = "Strong";
      else if (row.revenueNum + row.pipelineNum >= 75000) tone = "Stable";

      return {
        ...row,
        revenue: moneyCompact(row.revenueNum),
        pipeline: moneyCompact(row.pipelineNum),
        closeRate,
        tone,
      };
    });
  }, [isDemo, deals]);

  const topRegion = useMemo(() => {
    if (!mapRegions.length) return null;
    return [...mapRegions].sort(
      (a, b) => safeNum(b.revenueNum, 0) - safeNum(a.revenueNum, 0)
    )[0];
  }, [mapRegions]);

  const regionStats = useMemo(() => {
    if (isDemo) {
      return [
        { label: "Tracked Regions", value: "3", note: "Active territory groups" },
        { label: "Global Revenue", value: "$5.8M", note: "Current regional output" },
        { label: "Global Pipeline", value: "$16.0M", note: "Open opportunity value" },
        { label: "Top Region", value: "North America", note: "Highest density today" },
      ];
    }

    return [
      {
        label: "Tracked Regions",
        value: String(mapRegions.length),
        note: "Live territory groups",
      },
      {
        label: "Global Revenue",
        value: moneyCompact(revenue),
        note: "Live closed-won revenue",
      },
      {
        label: "Global Pipeline",
        value: moneyCompact(pipelineValue),
        note: "Live open opportunity value",
      },
      {
        label: "Top Region",
        value: topRegion?.name || "No Data",
        note: topRegion ? "Highest live concentration" : "No active territory yet",
      },
    ];
  }, [isDemo, mapRegions.length, revenue, pipelineValue, topRegion]);

  const summaryPoints = useMemo(() => {
    if (isDemo) {
      return [
        "North America remains the strongest current revenue and pipeline concentration zone.",
        "Europe has healthy pipeline depth but still needs stronger close efficiency.",
        "Asia is earlier-stage, but emerging opportunity flow supports long-term expansion interest.",
        "Regional execution should remain concentrated where near-term close probability is strongest.",
      ];
    }

    if (!mapRegions.length) {
      return [
        "No live regional revenue map data is available for this workspace yet.",
        "Atlas will populate territory intelligence once deals begin carrying region, country, location, or territory data.",
        "This live workspace is no longer using hardcoded demo regional numbers.",
        "Once opportunities are distributed by geography, leadership will see real territory performance here.",
      ];
    }

    return [
      `${topRegion?.name || "A leading region"} is currently the strongest live concentration zone.`,
      `${moneyCompact(revenue)} in revenue and ${moneyCompact(
        pipelineValue
      )} in pipeline are being tracked across ${mapRegions.length} live regions.`,
      "Regional execution should remain concentrated where live opportunity density and close performance are strongest.",
      "Atlas is using workspace deal distribution to map territory-level revenue and pipeline concentration.",
    ];
  }, [isDemo, mapRegions.length, topRegion, revenue, pipelineValue]);

  const revenueByRegion = useMemo(() => {
    return mapRegions.map((r) => ({
      name: r.name,
      revenue: safeNum(r.revenueNum, 0),
    }));
  }, [mapRegions]);

  const pipelineByRegion = useMemo(() => {
    return mapRegions.map((r) => ({
      name: r.name,
      pipeline: safeNum(r.pipelineNum, 0),
    }));
  }, [mapRegions]);

  const trendData = useMemo(() => {
    if (isDemo) {
      return [
        { quarter: "Q1", northAmerica: 2900000, europe: 980000, asia: 320000 },
        { quarter: "Q2", northAmerica: 3200000, europe: 1130000, asia: 430000 },
        { quarter: "Q3", northAmerica: 3520000, europe: 1270000, asia: 520000 },
        { quarter: "Q4", northAmerica: 3800000, europe: 1400000, asia: 600000 },
      ];
    }

    const monthly = metrics.slice(-4);
    return monthly.map((m, idx) => ({
      quarter: m?.date ? m.date.slice(5) : `P${idx + 1}`,
      northAmerica: Math.round(safeNum(m?.revenue, 0) * 0.5),
      europe: Math.round(safeNum(m?.revenue, 0) * 0.3),
      asia: Math.round(safeNum(m?.revenue, 0) * 0.2),
    }));
  }, [isDemo, metrics]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.hero}>
            <h1 style={styles.h1}>Loading Global Revenue Map...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.errorBox}>{error}</div>
        </div>
      </div>
    );
  }

  const noLiveGeoData = !isDemo && !mapRegions.length;

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.hero}>
          <div style={styles.eyebrow}>Revenue & Opportunity Distribution</div>
          <h1 style={styles.h1}>Global Revenue Map</h1>
          <div style={styles.heroText}>
            Atlas shows where revenue is being generated, where pipeline is building,
            and which regions deserve tighter leadership attention for <b>{orgName}</b>.
          </div>

          <div style={styles.badgeWrap}>
            {[
              isDemo ? "Demo Territory Mode" : "Live Territory Mode",
              noLiveGeoData ? "No Geo Data Yet" : "Revenue Mapping Synced",
              "Atlas AI Monitoring",
            ].map((item) => (
              <div key={item} style={styles.badge}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.statsGrid}>
          {regionStats.map((item) => (
            <SmallStat
              key={item.label}
              label={item.label}
              value={item.value}
              note={item.note}
            />
          ))}
        </div>

        <div style={styles.twoCol}>
          <Section title="Regional Summary" subtitle="Overview">
            <div style={styles.summaryList}>
              {summaryPoints.map((point) => (
                <div key={point} style={styles.summaryItem}>
                  {point}
                </div>
              ))}
            </div>
          </Section>

          <Section title="World View" subtitle="Territory">
            <div style={styles.mapShell}>
              {noLiveGeoData ? (
                <EmptyState text="No live geographic opportunity data yet. Add region, country, location, or territory fields to live deals to activate the map." />
              ) : (
                <div style={styles.demoMapPanel}>
                  <div style={styles.demoMapTitle}>Territory Command View</div>
                  <div style={styles.demoMapTopRegion}>
                    Top Region: <strong>{topRegion?.name || "North America"}</strong>
                  </div>
                  <div style={styles.demoMapGrid}>
                    {mapRegions.map((region) => (
                      <div key={region.name} style={styles.demoMapRegionCard}>
                        <div style={styles.demoMapRegionTop}>
                          <div style={styles.demoMapRegionName}>{region.name}</div>
                          <div style={toneStyle(region.tone)}>{region.tone}</div>
                        </div>
                        <div style={styles.demoMapRegionStats}>
                          <div>Revenue {region.revenue}</div>
                          <div>Pipeline {region.pipeline}</div>
                          <div>Close Rate {region.closeRate}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Revenue by Region" subtitle="Performance">
            <div style={styles.chartShell}>
              {noLiveGeoData ? (
                <EmptyState text="No live regional revenue values yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByRegion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={axisTick} stroke="#94a3b8" />
                    <YAxis
                      tick={axisTick}
                      stroke="#94a3b8"
                      tickFormatter={(v) => moneyCompact(v)}
                    />
                    <Tooltip
                      formatter={(value) => [moneyCompact(value), "Revenue"]}
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#8bf3ff"
                      radius={[10, 10, 0, 0]}
                      animationDuration={1400}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Section>

          <Section title="Pipeline by Region" subtitle="Coverage">
            <div style={styles.chartShell}>
              {noLiveGeoData ? (
                <EmptyState text="No live regional pipeline values yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineByRegion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={axisTick} stroke="#94a3b8" />
                    <YAxis
                      tick={axisTick}
                      stroke="#94a3b8"
                      tickFormatter={(v) => moneyCompact(v)}
                    />
                    <Tooltip
                      formatter={(value) => [moneyCompact(value), "Pipeline"]}
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar
                      dataKey="pipeline"
                      fill="#c4fbff"
                      radius={[10, 10, 0, 0]}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Regional Revenue Trend" subtitle="Momentum">
            <div style={styles.chartShell}>
              {!trendData.length ? (
                <EmptyState text="No live revenue trend data yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="quarter" tick={axisTick} stroke="#94a3b8" />
                    <YAxis
                      tick={axisTick}
                      stroke="#94a3b8"
                      tickFormatter={(v) => moneyCompact(v)}
                    />
                    <Tooltip
                      formatter={(value, name) => [moneyCompact(value), name]}
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="northAmerica"
                      stroke="#c4fbff"
                      strokeWidth={3.5}
                      dot={{ r: 3, fill: "#c4fbff" }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="europe"
                      stroke="#a7f3d0"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#a7f3d0" }}
                      activeDot={{ r: 6 }}
                      animationDuration={1700}
                    />
                    <Line
                      type="monotone"
                      dataKey="asia"
                      stroke="#fde047"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#fde047" }}
                      activeDot={{ r: 6 }}
                      animationDuration={1900}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Section>

          <Section title="Regional Opportunity Radar" subtitle="Territories">
            <div style={styles.radarList}>
              {mapRegions.length ? (
                mapRegions.map((region) => (
                  <div key={region.name} style={styles.radarCard}>
                    <div style={styles.radarTop}>
                      <div>
                        <div style={styles.radarName}>{region.name}</div>
                        <div style={styles.radarMeta}>
                          Top accounts: {region.accounts.join(", ") || "None"}
                        </div>
                      </div>
                      <div style={toneStyle(region.tone)}>{region.tone}</div>
                    </div>

                    <div style={styles.radarGrid}>
                      <div style={styles.mini}>
                        <div style={styles.miniLabel}>Revenue</div>
                        <div style={styles.miniValue}>{region.revenue}</div>
                      </div>
                      <div style={styles.mini}>
                        <div style={styles.miniLabel}>Pipeline</div>
                        <div style={styles.miniValue}>{region.pipeline}</div>
                      </div>
                      <div style={styles.mini}>
                        <div style={styles.miniLabel}>Close Rate</div>
                        <div style={styles.miniValue}>{region.closeRate}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No live territory radar data yet." />
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    color: "#fff",
    padding: "14px 16px 24px",
    background:
      "radial-gradient(900px 500px at 15% 0%, rgba(37,99,235,0.18), transparent 55%), radial-gradient(900px 500px at 85% 0%, rgba(124,92,255,0.14), transparent 55%), linear-gradient(180deg, #050814 0%, #070b18 100%)",
  },
  wrap: {
    maxWidth: 1380,
    margin: "0 auto",
    display: "grid",
    gap: 12,
  },
  hero: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "18px 20px",
    background:
      "linear-gradient(135deg, rgba(30,64,175,0.18), rgba(37,99,235,0.10), rgba(255,255,255,0.02))",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
  },
  eyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "rgba(125,211,252,0.9)",
    fontWeight: 800,
  },
  h1: {
    margin: "6px 0 0",
    fontSize: 28,
    lineHeight: 1.05,
    letterSpacing: -0.7,
    fontWeight: 900,
    color: "#ffffff",
  },
  heroText: {
    marginTop: 8,
    maxWidth: 760,
    fontSize: 14,
    lineHeight: 1.55,
    color: "rgba(226,232,240,0.9)",
  },
  badgeWrap: {
    marginTop: 12,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    fontSize: 11,
    fontWeight: 700,
    color: "#e2e8f0",
    whiteSpace: "nowrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },
  statCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "14px 14px 13px",
    minHeight: 126,
    background: "rgba(255,255,255,0.032)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.88)",
    fontWeight: 800,
  },
  statValue: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.05,
  },
  statNote: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 1.45,
    color: "rgba(203,213,225,0.76)",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
    gap: 12,
  },
  section: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
  },
  sectionHead: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: -0.35,
    color: "#fff",
  },
  sectionSub: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "rgba(148,163,184,0.75)",
    fontWeight: 700,
    marginBottom: 4,
  },
  sectionBody: {
    padding: 14,
  },
  summaryList: {
    display: "grid",
    gap: 8,
  },
  summaryItem: {
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(4,10,24,0.34)",
    borderRadius: 14,
    padding: "12px 13px",
    fontSize: 13,
    lineHeight: 1.55,
    color: "#dbe4f0",
  },
  chartShell: {
    height: 260,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    background: "rgba(4,10,24,0.72)",
    padding: 10,
  },
  mapShell: {
    height: 390,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(4,10,24,0.72)",
    position: "relative",
    padding: 18,
  },
  demoMapPanel: {
    height: "100%",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "radial-gradient(circle at top, rgba(56,189,248,0.12), transparent 45%), rgba(255,255,255,0.02)",
    padding: 16,
    display: "grid",
    gap: 12,
    alignContent: "start",
  },
  demoMapTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: "#fff",
  },
  demoMapTopRegion: {
    fontSize: 13,
    color: "rgba(226,232,240,0.88)",
  },
  demoMapGrid: {
    display: "grid",
    gap: 10,
  },
  demoMapRegionCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    padding: 12,
  },
  demoMapRegionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  demoMapRegionName: {
    fontSize: 15,
    fontWeight: 800,
    color: "#fff",
  },
  demoMapRegionStats: {
    marginTop: 8,
    display: "grid",
    gap: 5,
    fontSize: 12,
    color: "rgba(226,232,240,0.86)",
  },
  radarList: {
    display: "grid",
    gap: 10,
  },
  radarCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 13,
    background: "rgba(4,10,24,0.34)",
  },
  radarTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  radarName: {
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
  },
  radarMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 1.5,
    color: "rgba(203,213,225,0.78)",
  },
  radarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    marginTop: 12,
  },
  mini: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 10,
    background: "rgba(255,255,255,0.03)",
  },
  miniLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.86)",
    fontWeight: 700,
  },
  miniValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
  },
  emptyState: {
    height: "100%",
    minHeight: 220,
    border: "1px dashed rgba(255,255,255,0.12)",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    color: "rgba(226,232,240,0.78)",
    fontSize: 14,
    lineHeight: 1.6,
    textAlign: "center",
    background: "rgba(4,10,24,0.34)",
  },
  errorBox: {
    border: "1px solid rgba(255,120,120,0.35)",
    background: "rgba(255,0,0,0.10)",
    color: "#FFD7D7",
    borderRadius: 14,
    padding: 16,
    fontSize: 14,
  },
};