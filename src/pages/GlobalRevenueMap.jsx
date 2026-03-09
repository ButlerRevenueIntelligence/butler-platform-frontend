import React, { useMemo, useState } from "react";
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

const regionStats = [
  { label: "Tracked Regions", value: "3", note: "Active territory groups" },
  { label: "Global Revenue", value: "$5.8M", note: "Current regional output" },
  { label: "Global Pipeline", value: "$16.0M", note: "Open opportunity value" },
  { label: "Top Region", value: "North America", note: "Highest density today" },
];

const summaryPoints = [
  "North America remains the strongest current revenue and pipeline concentration zone.",
  "Europe has healthy pipeline depth but still needs stronger close efficiency.",
  "Asia is earlier-stage, but emerging opportunity flow supports long-term expansion interest.",
  "Regional execution should remain concentrated where near-term close probability is strongest.",
];

const mapRegions = [
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

const revenueByRegion = [
  { name: "North America", revenue: 3800000 },
  { name: "Europe", revenue: 1400000 },
  { name: "Asia", revenue: 600000 },
];

const pipelineByRegion = [
  { name: "North America", pipeline: 9200000 },
  { name: "Europe", pipeline: 4700000 },
  { name: "Asia", pipeline: 2100000 },
];

const trendData = [
  { quarter: "Q1", northAmerica: 2900000, europe: 980000, asia: 320000 },
  { quarter: "Q2", northAmerica: 3200000, europe: 1130000, asia: 430000 },
  { quarter: "Q3", northAmerica: 3520000, europe: 1270000, asia: 520000 },
  { quarter: "Q4", northAmerica: 3800000, europe: 1400000, asia: 600000 },
];

const moneyCompact = (num) => {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num}`;
};

const axisTick = { fill: "#9fb0d0", fontSize: 11 };

const tooltipStyle = {
  background: "rgba(7,11,24,0.97)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  color: "#fff",
  boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
};

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
};

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

function RegionMarker({ region, onClick }) {
  const size = Math.max(
    16,
    Math.min(34, Math.round((region.pipelineNum / 9200000) * 28 + 8))
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
  const initialView = useMemo(
    () => ({
      longitude: 10,
      latitude: 22,
      zoom: 1.15,
    }),
    []
  );

  const [selectedRegion, setSelectedRegion] = useState(mapRegions[0]);

  const topRegion = useMemo(() => {
    return [...mapRegions].sort((a, b) => b.revenueNum - a.revenueNum)[0];
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.hero}>
          <div style={styles.eyebrow}>Revenue & Opportunity Distribution</div>
          <h1 style={styles.h1}>Global Revenue Map</h1>
          <div style={styles.heroText}>
            Atlas shows where revenue is being generated, where pipeline is building,
            and which regions deserve tighter leadership attention.
          </div>

          <div style={styles.badgeWrap}>
            {[
              "Territory Intelligence Active",
              "Revenue Mapping Synced",
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
              <div style={styles.mapHud}>
                <div style={styles.mapHudHead}>
                  <div style={styles.mapHudTitle}>Atlas Territory Command</div>
                </div>

                <div style={styles.mapHudBody}>
                  <div style={styles.mapHudMetric}>
                    <div style={styles.mapHudLabel}>Top Active Region</div>
                    <div style={styles.mapHudValue}>{topRegion.name}</div>
                    <div style={styles.mapHudSub}>
                      Highest revenue concentration and strongest near-term execution density.
                    </div>
                  </div>

                  <div style={styles.mapHudMetric}>
                    <div style={styles.mapHudLabel}>Region Revenue</div>
                    <div style={styles.mapHudValue}>{topRegion.revenue}</div>
                  </div>

                  <div style={styles.mapHudMetric}>
                    <div style={styles.mapHudLabel}>Open Pipeline</div>
                    <div style={styles.mapHudValue}>{topRegion.pipeline}</div>
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
                    } catch {
                      // ignore fog errors on unsupported styles
                    }
                  }

                  map.resize();

                  setTimeout(() => {
                    try {
                      map.flyTo({
                        center: [10, 22],
                        zoom: 1.15,
                        speed: 0.5,
                      });
                    } catch {
                      // ignore
                    }
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
                        Key accounts: {selectedRegion.accounts.join(", ")}
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
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Revenue by Region" subtitle="Performance">
            <div style={styles.chartShell}>
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
            </div>
          </Section>

          <Section title="Pipeline by Region" subtitle="Coverage">
            <div style={styles.chartShell}>
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
            </div>
          </Section>
        </div>

        <div style={styles.twoCol}>
          <Section title="Regional Revenue Trend" subtitle="Momentum">
            <div style={styles.chartShell}>
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
            </div>
          </Section>

          <Section title="Regional Opportunity Radar" subtitle="Territories">
            <div style={styles.radarList}>
              {mapRegions.map((region) => (
                <div key={region.name} style={styles.radarCard}>
                  <div style={styles.radarTop}>
                    <div>
                      <div style={styles.radarName}>{region.name}</div>
                      <div style={styles.radarMeta}>
                        Top accounts: {region.accounts.join(", ")}
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
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}