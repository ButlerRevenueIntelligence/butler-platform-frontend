import React, { useEffect, useMemo, useState } from "react";
import mapboxgl from "mapbox-gl";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
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

const rawToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
const MAPBOX_TOKEN =
  rawToken && rawToken !== "YOUR_MAPBOX_PUBLIC_TOKEN" ? rawToken : "";

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

const hasMapboxToken = Boolean(MAPBOX_TOKEN);

const fallbackMapStyle = {
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

function getRegionCoordinates(name) {
  if (name === "Europe") {
    return { lat: 50.1109, lng: 8.6821 };
  }
  if (name === "Asia") {
    return { lat: 1.3521, lng: 103.8198 };
  }
  return { lat: 37.0902, lng: -95.7129 };
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

function RegionMarker({ region, onClick }) {
  const size = Math.max(
    16,
    Math.min(34, Math.round((safeNum(region.pipelineNum, 0) / Math.max(region.maxPipeline || 1, 1)) * 28 + 8))
  );

  return (
    <Marker longitude={region.lng} latitude={region.lat} anchor="center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(region);
        }}
        title={region.name}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          background:
            region.tone === "Strong"
              ? "radial-gradient(circle at 35% 35%, #d8fbff, #38bdf8 58%, #0ea5e9 100%)"
              : region.tone === "Stable"
              ? "radial-gradient(circle at 35% 35%, #e0f2fe, #60a5fa 58%, #2563eb 100%)"
              : "radial-gradient(circle at 35% 35%, #fef3c7, #f59e0b 58%, #d97706 100%)",
          border: "2px solid rgba(255,255,255,0.92)",
          boxShadow: "0 0 0 8px rgba(56,189,248,0.10), 0 12px 26px rgba(0,0,0,0.36)",
          cursor: "pointer",
        }}
      />
    </Marker>
  );
}

export default function GlobalRevenueMap() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initialView = useMemo(
    () => ({
      longitude: 10,
      latitude: 22,
      zoom: 1.15,
    }),
    []
  );

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
        console.error(err);
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
          lat: 37.0902,
          lng: -95.7129,
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
          lat: 50.1109,
          lng: 8.6821,
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
          lat: 1.3521,
          lng: 103.8198,
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
        deal?.region ||
          deal?.country ||
          deal?.location ||
          deal?.territory ||
          ""
      );

      if (!grouped.has(regionName)) {
        const coords = getRegionCoordinates(regionName);
        grouped.set(regionName, {
          name: regionName,
          lat: coords.lat,
          lng: coords.lng,
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
        deal?.accountName ||
        deal?.company ||
        deal?.clientName ||
        deal?.name ||
        "Account";

      if (!row.accounts.includes(accountName)) {
        row.accounts.push(accountName);
      }
    });

    const arr = Array.from(grouped.values()).map((row) => {
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

    const maxPipeline = Math.max(...arr.map((r) => safeNum(r.pipelineNum, 0)), 1);

    return arr.map((r) => ({
      ...r,
      maxPipeline,
    }));
  }, [isDemo, deals]);

  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    if (mapRegions.length) {
      setSelectedRegion(mapRegions[0]);
    } else {
      setSelectedRegion(null);
    }
  }, [mapRegions]);

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
      `${moneyCompact(revenue)} in revenue and ${moneyCompact(pipelineValue)} in pipeline are being tracked across ${mapRegions.length} live regions.`,
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
                <>
                  <div style={styles.mapHud}>
                    <div style={styles.mapHudHead}>
                      <div style={styles.mapHudTitle}>Atlas Territory Command</div>
                    </div>

                    <div style={styles.mapHudBody}>
                      <div style={styles.mapHudMetric}>
                        <div style={styles.mapHudLabel}>Top Active Region</div>
                        <div style={styles.mapHudValue}>{topRegion?.name || "No Data"}</div>
                        <div style={styles.mapHudSub}>
                          {topRegion
                            ? "Highest revenue concentration and strongest near-term execution density."
                            : "No live territory concentration available yet."}
                        </div>
                      </div>

                      <div style={styles.mapHudMetric}>
                        <div style={styles.mapHudLabel}>Region Revenue</div>
                        <div style={styles.mapHudValue}>{topRegion?.revenue || "$0"}</div>
                      </div>

                      <div style={styles.mapHudMetric}>
                        <div style={styles.mapHudLabel}>Open Pipeline</div>
                        <div style={styles.mapHudValue}>{topRegion?.pipeline || "$0"}</div>
                      </div>
                    </div>
                  </div>

                  <Map
                    initialViewState={initialView}
                    mapboxAccessToken={MAPBOX_TOKEN || undefined}
                    mapStyle={hasMapboxToken ? "mapbox://styles/mapbox/dark-v11" : fallbackMapStyle}
                    projection={hasMapboxToken ? "globe" : "mercator"}
                    attributionControl={false}
                    style={{ width: "100%", height: "100%" }}
                    onClick={() => setSelectedRegion(null)}
                    onLoad={(e) => {
                      const map = e.target;

                      if (hasMapboxToken) {
                        try {
                          map.setFog({
                            color: "rgb(10, 15, 35)",
                            "high-color": "rgb(36, 92, 223)",
                            "horizon-blend": 0.08,
                            "space-color": "rgb(3, 7, 18)",
                            "star-intensity": 0.2,
                          });
                        } catch {}
                      }

                      map.resize();

                      setTimeout(() => {
                        try {
                          map.flyTo({
                            center: [10, 22],
                            zoom: 1.15,
                            speed: 0.5,
                          });
                        } catch {}
                      }, 250);
                    }}
                  >
                    <NavigationControl position="top-right" />

                    {mapRegions.map((region) => (
                      <RegionMarker
                        key={region.name}
                        region={region}
                        onClick={setSelectedRegion}
                      />
                    ))}

                    {selectedRegion ? (
                      <Popup
                        longitude={selectedRegion.lng}
                        latitude={selectedRegion.lat}
                        anchor="top"
                        closeButton={false}
                        closeOnClick={false}
                        offset={22}
                        className="atlas-map-popup"
                      >
                        <div
                          style={{
                            minWidth: 230,
                            padding: 12,
                            borderRadius: 14,
                            color: "#fff",
                            background:
                              "linear-gradient(180deg, rgba(8,14,28,0.98), rgba(5,9,18,0.96))",
                            border: "1px solid rgba(255,255,255,0.10)",
                            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <div style={{ fontWeight: 900, fontSize: 15 }}>
                              {selectedRegion.name}
                            </div>
                            <div style={toneStyle(selectedRegion.tone)}>
                              {selectedRegion.tone}
                            </div>
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
                            <div>Revenue {selectedRegion.revenue}</div>
                            <div>Pipeline {selectedRegion.pipeline}</div>
                            <div>Close Rate {selectedRegion.closeRate}</div>
                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              fontSize: 11,
                              lineHeight: 1.5,
                              color: "rgba(203,213,225,0.74)",
                            }}
                          >
                            Key accounts: {selectedRegion.accounts.join(", ") || "None"}
                          </div>
                        </div>
                      </Popup>
                    ) : null}
                  </Map>

                  {!hasMapboxToken ? (
                    <div style={styles.mapStatus}>
                      Fallback map active — add VITE_MAPBOX_TOKEN for full Mapbox globe
                    </div>
                  ) : null}
                </>
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
  },
  mapStatus: {
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
  mapHud: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 5,
    width: 250,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "linear-gradient(180deg, rgba(8,14,28,0.88), rgba(5,9,18,0.82))",
    backdropFilter: "blur(10px)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.30)",
    overflow: "hidden",
  },
  mapHudHead: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  mapHudTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.82)",
    fontWeight: 800,
  },
  mapHudBody: {
    padding: 12,
    display: "grid",
    gap: 10,
  },
  mapHudMetric: {
    display: "grid",
    gap: 4,
  },
  mapHudLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.78)",
    fontWeight: 800,
  },
  mapHudValue: {
    fontSize: 20,
    lineHeight: 1.05,
    fontWeight: 900,
    color: "#fff",
  },
  mapHudSub: {
    fontSize: 12,
    color: "rgba(203,213,225,0.74)",
    lineHeight: 1.45,
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