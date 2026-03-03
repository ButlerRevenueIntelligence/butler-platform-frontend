// frontend/src/pages/RevenueIntel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getRevenueIntelBoard, seedDemoData } from "../api";
import DealDrawer from "../components/DealDrawer.jsx";

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

export default function RevenueIntel() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  const [reactivateAfterDays, setReactivateAfterDays] = useState(30);
  const [data, setData] = useState(null);

  // ✅ Shared Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDealId, setDrawerDealId] = useState("");
  const [drawerDeal, setDrawerDeal] = useState(null);

  const openDealDrawerById = (id, dealObj = null) => {
    if (!id) return;
    setDrawerOpen(true);
    setDrawerDealId(id);
    setDrawerDeal(dealObj || null);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerDealId("");
    setDrawerDeal(null);
  };

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await getRevenueIntelBoard({ reactivateAfterDays });
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load Revenue Intelligence");
    } finally {
      setLoading(false);
    }
  }

  async function onSeedDemo() {
    try {
      setSeeding(true);
      setError("");
      await seedDemoData({ clients: 10, deals: 25 });
      await load();
      alert("Demo data seeded ✅");
    } catch (e) {
      setError(e?.message || "Seed demo failed");
      alert(e?.message || "Seed demo failed");
    } finally {
      setSeeding(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = data?.execution || { overdue: [], dueToday: [], upcoming: [], counts: {} };
  const react = data?.reactivation || { items: [], count: 0, reactivateAfterDays };
  const wl =
    data?.winLoss || {
      won: 0,
      lost: 0,
      winRate: 0,
      avgWon: 0,
      avgLost: 0,
      avgCycleDaysWon: 0,
      avgCycleDaysLost: 0,
    };

  const weightedValue = useMemo(() => {
    const all = [...(exec.overdue || []), ...(exec.dueToday || []), ...(exec.upcoming || [])];
    return all.reduce((sum, d) => sum + safeNum(d.amount) * safeNum(d.probability), 0);
  }, [exec]);

  const S = {
    page: { padding: 22, color: "#EAF0FF" },
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
    title: { margin: 0, fontSize: 26, fontWeight: 900 },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
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
      opacity: 0.98,
    },
    btnGhost: {
      borderRadius: 999,
      padding: "10px 14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.16)",
      color: "#EAF0FF",
      fontWeight: 900,
      fontSize: 12,
      cursor: "pointer",
      opacity: 0.98,
    },
    card: {
      marginTop: 14,
      borderRadius: 16,
      padding: 16,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
    },
    grid3: {
      marginTop: 14,
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
      gap: 12,
    },
    panel: {
      borderRadius: 16,
      padding: 14,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(10, 16, 35, 0.35)",
      minHeight: 240,
    },
    panelTitle: { fontWeight: 900, fontSize: 13, letterSpacing: 0.7, opacity: 0.95 },
    row: {
      marginTop: 10,
      borderRadius: 12,
      padding: 10,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      cursor: "pointer",
    },
    small: { fontSize: 12, opacity: 0.85, lineHeight: 1.5 },
    badge: (tone) => ({
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: 0.7,
      color: tone === "bad" ? "#FB7185" : tone === "warn" ? "#F59E0B" : "#22C55E",
    }),
    error: {
      marginTop: 12,
      borderRadius: 12,
      padding: 12,
      border: "1px solid rgba(255,0,0,0.25)",
      background: "rgba(255,0,0,0.10)",
    },
    input: {
      width: 90,
      borderRadius: 10,
      padding: "8px 10px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.20)",
      color: "#EAF0FF",
      outline: "none",
      fontWeight: 800,
    },
  };

  // helper: build a minimal "deal-like" object for the drawer
  const toDrawerDeal = (d) => {
    if (!d) return null;
    return {
      _id: d.id || d._id,
      id: d.id || d._id,
      name: d.name,
      stage: d.stage,
      amount: d.amount,
      probability: d.probability,
      nextAction: d.nextAction,
      nextActionDueAt: d.dueAt || d.nextActionDueAt,
      lastActivityAt: d.lastActivityAt,
      clientId: d.clientId || (d.clientName ? { name: d.clientName } : undefined),
      clientName: d.clientName,
      closedReason: d.closedReason,
      competitor: d.competitor,
      reactivationAt: d.reactivationAt,
    };
  };

  return (
    <div style={S.page}>
      <div style={S.headerRow}>
        <h2 style={S.title}>Revenue Intelligence</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={S.pill}>
            Win rate: <b>{wl.winRate}%</b>
          </div>
          <div style={S.pill}>
            Exec pressure (weighted): <b>{money(weightedValue)}</b>
          </div>

          <button onClick={load} disabled={loading || seeding} style={S.btn}>
            {loading ? "Loading..." : "Refresh"}
          </button>

          {/* ✅ STEP 6: Seed Demo Data */}
          <button onClick={onSeedDemo} disabled={loading || seeding} style={S.btnGhost}>
            {seeding ? "Seeding..." : "Seed Demo Data"}
          </button>
        </div>
      </div>

      {error ? <div style={S.error}>{error}</div> : null}

      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Reactivation Rules</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Closed Lost age ≥</div>
            <input
              style={S.input}
              value={reactivateAfterDays}
              onChange={(e) => setReactivateAfterDays(Number(e.target.value || 0))}
            />
            <div style={{ fontSize: 12, opacity: 0.9 }}>days</div>
            <button style={S.btnGhost} disabled={loading || seeding} onClick={load}>
              Apply
            </button>
          </div>
        </div>
      </div>

      <div style={S.grid3}>
        {/* OVERDUE */}
        <div style={S.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={S.panelTitle}>OVERDUE</div>
            <div style={S.badge("bad")}>{exec.counts?.overdue || (exec.overdue || []).length}</div>
          </div>

          {(exec.overdue || []).length ? (
            exec.overdue.slice(0, 10).map((d) => (
              <div
                key={d.id}
                style={S.row}
                onClick={() => openDealDrawerById(d.id, toDrawerDeal(d))}
                title="Click to open Deal Intelligence"
              >
                <div style={{ fontWeight: 900, fontSize: 12 }}>
                  {d.clientName ? `${d.clientName} — ` : ""}
                  {d.name}
                </div>
                <div style={S.small}>
                  Stage: <b>{d.stage}</b> • Due: <b>{new Date(d.dueAt).toLocaleDateString()}</b>
                  <br />
                  Next: <b>{d.nextAction || "—"}</b>
                  <br />
                  Weighted: <b>{money(safeNum(d.amount) * safeNum(d.probability))}</b>
                </div>
              </div>
            ))
          ) : (
            <div style={{ marginTop: 10, opacity: 0.85, fontSize: 13 }}>Nothing overdue. That’s elite.</div>
          )}
        </div>

        {/* DUE TODAY */}
        <div style={S.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={S.panelTitle}>DUE TODAY</div>
            <div style={S.badge("warn")}>{exec.counts?.dueToday || (exec.dueToday || []).length}</div>
          </div>

          {(exec.dueToday || []).length ? (
            exec.dueToday.slice(0, 10).map((d) => (
              <div
                key={d.id}
                style={S.row}
                onClick={() => openDealDrawerById(d.id, toDrawerDeal(d))}
                title="Click to open Deal Intelligence"
              >
                <div style={{ fontWeight: 900, fontSize: 12 }}>
                  {d.clientName ? `${d.clientName} — ` : ""}
                  {d.name}
                </div>
                <div style={S.small}>
                  Stage: <b>{d.stage}</b> • Due: <b>{new Date(d.dueAt).toLocaleDateString()}</b>
                  <br />
                  Next: <b>{d.nextAction || "—"}</b>
                  <br />
                  Weighted: <b>{money(safeNum(d.amount) * safeNum(d.probability))}</b>
                </div>
              </div>
            ))
          ) : (
            <div style={{ marginTop: 10, opacity: 0.85, fontSize: 13 }}>No “today” actions. Clear runway.</div>
          )}
        </div>

        {/* WIN/LOSS + REACTIVATION */}
        <div style={S.panel}>
          <div style={S.panelTitle}>WIN/LOSS + REACTIVATION</div>

          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <div style={{ ...S.row, cursor: "default" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontWeight: 900, fontSize: 12 }}>Win / Loss</div>
              <div style={S.small}>
                Won: <b>{wl.won}</b> • Lost: <b>{wl.lost}</b> • Win rate: <b>{wl.winRate}%</b>
                <br />
                Avg Won: <b>{money(wl.avgWon)}</b> • Avg Lost: <b>{money(wl.avgLost)}</b>
                <br />
                Cycle Won: <b>{wl.avgCycleDaysWon}d</b> • Cycle Lost: <b>{wl.avgCycleDaysLost}d</b>
              </div>
            </div>

            <div style={{ ...S.row, cursor: "default" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontWeight: 900, fontSize: 12 }}>
                Reactivation Queue <span style={{ opacity: 0.8 }}>(Closed Lost)</span>
              </div>
              <div style={S.small}>
                Candidates: <b>{react.count}</b> • Threshold: <b>{react.reactivateAfterDays || reactivateAfterDays} days</b>
              </div>
            </div>

            {(react.items || []).slice(0, 6).map((d) => (
              <div
                key={d.id}
                style={S.row}
                onClick={() => openDealDrawerById(d.id, toDrawerDeal(d))}
                title="Click to open Deal Intelligence"
              >
                <div style={{ fontWeight: 900, fontSize: 12 }}>
                  {d.clientName ? `${d.clientName} — ` : ""}
                  {d.name}
                </div>
                <div style={S.small}>
                  Last touch: <b>{d.lastTouchAgeDays}d</b> ago
                  <br />
                  Suggested: <b>{d.suggested}</b>
                  <br />
                  Value: <b>{money(d.amount)}</b>
                </div>
              </div>
            ))}

            {(react.items || []).length === 0 ? (
              <div style={{ marginTop: 10, opacity: 0.85, fontSize: 13 }}>No reactivation candidates yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ✅ Shared Deal Drawer */}
      <DealDrawer
        open={drawerOpen}
        dealId={drawerDealId}
        initialDeal={drawerDeal}
        onClose={closeDrawer}
        onDealUpdated={() => {
          load(); // refresh board so counts + lists update immediately
        }}
      />
    </div>
  );
}