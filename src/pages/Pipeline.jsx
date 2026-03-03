// frontend/src/pages/Pipeline.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getDeals, createDeal, deleteDeal, moveDealStage, getClients, getPriorities } from "../api";
import DealDrawer from "../components/DealDrawer.jsx";

const STAGES = ["Discovery", "Proposal", "Follow-Up", "Negotiation", "Closed Won", "Closed Lost"];

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

const normalizeStage = (s) => {
  const val = (s || "").toString().trim().toLowerCase();
  if (!val) return "Discovery";
  if (val.includes("disc")) return "Discovery";
  if (val.includes("prop")) return "Proposal";
  if (val.includes("follow")) return "Follow-Up";
  if (val.includes("neg")) return "Negotiation";
  if (val.includes("won")) return "Closed Won";
  if (val.includes("lost")) return "Closed Lost";
  return "Discovery";
};

function getClientName(d) {
  if (d?.clientId && typeof d.clientId === "object") return d.clientId?.name || "";
  return d?.clientName || "";
}

export default function Pipeline() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);

  const [q, setQ] = useState("");
  const [showClosed, setShowClosed] = useState(false);

  const [priorities, setPriorities] = useState({ top: [], summary: null });
  const [prioLoading, setPrioLoading] = useState(false);

  // ✅ Shared Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDealId, setDrawerDealId] = useState("");
  const [drawerDeal, setDrawerDeal] = useState(null);

  // ✅ B: Create Deal modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    clientId: "",
    amount: "",
    probability: "0.5",
    stage: "Discovery",
    nextAction: "",
  });

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [dealRes, clientRes] = await Promise.all([
        getDeals(),
        getClients().catch(() => ({ ok: true, clients: [] })),
      ]);

      const dealsArr = Array.isArray(dealRes?.deals) ? dealRes.deals : Array.isArray(dealRes) ? dealRes : [];
      setDeals(dealsArr);

      const clientsArr = Array.isArray(clientRes?.clients) ? clientRes.clients : Array.isArray(clientRes) ? clientRes : [];
      setClients(clientsArr);
    } catch (e) {
      setError(e?.message || "Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  }

  async function loadPriorities() {
    try {
      setPrioLoading(true);
      const res = await getPriorities(8);
      setPriorities({ top: res?.top || [], summary: res?.summary || null });
    } catch {
      setPriorities({ top: [], summary: null });
    } finally {
      setPrioLoading(false);
    }
  }

  useEffect(() => {
    load();
    loadPriorities();
  }, []);

  // 🔥 OPEN DRAWER
  function openDealDrawerById(id, dealObj = null) {
    setDrawerOpen(true);
    setDrawerDealId(id);
    setDrawerDeal(dealObj || null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerDealId("");
    setDrawerDeal(null);
  }

  const filteredDeals = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (deals || []).filter((d) => {
      const stage = STAGES.includes(d?.stage) ? d.stage : normalizeStage(d?.stage);
      if (!showClosed && stage.includes("Closed")) return false;
      if (!query) return true;

      const name = (d?.name || "").toLowerCase();
      const clientName = getClientName(d).toLowerCase();
      return name.includes(query) || clientName.includes(query) || stage.toLowerCase().includes(query);
    });
  }, [deals, q, showClosed]);

  const totals = useMemo(() => {
    const totalWeighted = (filteredDeals || []).reduce(
      (sum, d) => sum + safeNum(d?.amount ?? 0) * safeNum(d?.probability ?? 1),
      0
    );
    const count = (filteredDeals || []).length;
    return { totalWeighted, count };
  }, [filteredDeals]);

  const columns = useMemo(() => {
    const map = new Map(STAGES.map((s) => [s, []]));
    for (const d of filteredDeals || []) {
      const stage = STAGES.includes(d?.stage) ? d.stage : normalizeStage(d?.stage);
      map.get(stage).push(d);
    }
    return map;
  }, [filteredDeals]);

  async function onMoveDeal(id, stage) {
    if (!id || !stage) return;
    try {
      setSaving(true);
      setError("");
      const res = await moveDealStage(id, stage);
      const updated = res?.deal || res;

      setDeals((prev) =>
        (prev || []).map((d) => ((d?._id || d?.id) === id ? { ...d, ...updated, stage } : d))
      );

      await loadPriorities();
    } catch (e) {
      setError(e?.message || "Failed to move deal");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteDeal(id) {
    if (!id) return;
    if (!window.confirm("Delete this deal?")) return;

    try {
      setSaving(true);
      setError("");
      await deleteDeal(id);
      setDeals((prev) => (prev || []).filter((d) => (d?._id || d?.id) !== id));
      await loadPriorities();
      if (drawerDealId === id) closeDrawer();
    } catch (e) {
      setError(e?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  // ✅ B: Create Deal submit
  async function onCreateDeal(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const name = (createForm.name || "").trim();
      const clientId = (createForm.clientId || "").trim();
      if (!name) throw new Error("Deal name is required");
      if (!clientId) throw new Error("Select a client");

      const payload = {
        name,
        clientId,
        amount: Number(createForm.amount || 0),
        probability: Number(createForm.probability || 0.5),
        stage: createForm.stage || "Discovery",
        nextAction: (createForm.nextAction || "").trim(),
      };

      const res = await createDeal(payload);
      const created = res?.deal || res;

      setDeals((prev) => [created, ...(prev || [])]);
      setCreateOpen(false);
      setCreateForm({
        name: "",
        clientId: "",
        amount: "",
        probability: "0.5",
        stage: "Discovery",
        nextAction: "",
      });

      await loadPriorities();
    } catch (e2) {
      setError(e2?.message || "Failed to create deal");
    } finally {
      setSaving(false);
    }
  }

  const S = {
    page: { padding: 22, color: "#EAF0FF" },
    headerRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" },
    title: { fontSize: 26, fontWeight: 900, margin: 0 },
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
    btnDisabled: { cursor: "not-allowed", opacity: 0.6 },
    input: {
      width: "100%",
      borderRadius: 12,
      padding: "10px 12px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.20)",
      color: "#EAF0FF",
      outline: "none",
    },
    select: {
      width: "100%",
      borderRadius: 12,
      padding: "10px 12px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.20)",
      color: "#EAF0FF",
      outline: "none",
    },
    error: {
      marginTop: 12,
      borderRadius: 12,
      padding: 12,
      border: "1px solid rgba(255,0,0,0.25)",
      background: "rgba(255,0,0,0.10)",
    },
    grid: {
      marginTop: 14,
      display: "grid",
      gridTemplateColumns: "repeat(6, minmax(280px, 1fr))",
      gap: 12,
      overflowX: "auto",
      paddingBottom: 10,
    },
    col: {
      borderRadius: 16,
      padding: 12,
      background: "rgba(10,16,35,0.4)",
      border: "1px solid rgba(255,255,255,0.08)",
      minHeight: 420,
    },
    colTitle: { fontSize: 13, fontWeight: 900, letterSpacing: 0.8, opacity: 0.9 },
    dealCard: {
      padding: 12,
      borderRadius: 12,
      background: "rgba(255,255,255,0.05)",
      marginTop: 10,
      border: "1px solid rgba(255,255,255,0.08)",
      cursor: "pointer",
    },
    row: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" },

    // Modal
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 80,
      padding: 16,
    },
    modal: {
      width: "min(720px, 96vw)",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(10, 16, 35, 0.96)",
      padding: 16,
    },
    divider: { height: 1, background: "rgba(255,255,255,0.10)", margin: "12px 0" },
    formGrid: { display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 10 },
    formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  };

  return (
    <div style={S.page}>
      <div style={S.headerRow}>
        <h2 style={S.title}>Pipeline Command Center</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={S.pill}>
            Deals: <b>{totals.count}</b>
          </div>
          <div style={S.pill}>
            Weighted: <b>{money(totals.totalWeighted)}</b>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            disabled={saving}
            style={{ ...S.btn, ...(saving ? S.btnDisabled : null) }}
          >
            + Create Deal
          </button>

          <button
            onClick={() => {
              load();
              loadPriorities();
            }}
            disabled={loading || saving}
            style={{ ...S.btnGhost, ...(loading || saving ? S.btnDisabled : null) }}
          >
            {loading ? "Loading..." : prioLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          style={{ ...S.input, maxWidth: 420 }}
          placeholder="Search deals (client, deal, stage)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <button style={S.btnGhost} onClick={() => setShowClosed((v) => !v)}>
          {showClosed ? "Hide Closed" : "Show Closed"}
        </button>

        {q.trim() ? (
          <button style={S.btnGhost} onClick={() => setQ("")}>
            Clear
          </button>
        ) : null}
      </div>

      {error ? <div style={S.error}>{error}</div> : null}

      {/* Kanban */}
      <div style={S.grid}>
        {STAGES.map((stage) => {
          const list = columns.get(stage) || [];
          const stageWeighted = list.reduce((sum, d) => sum + safeNum(d?.amount ?? 0) * safeNum(d?.probability ?? 1), 0);

          return (
            <div key={stage} style={S.col}>
              <div style={S.row}>
                <div style={S.colTitle}>{stage.toUpperCase()}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  {list.length} • <b>{money(stageWeighted)}</b>
                </div>
              </div>

              {list.map((d) => {
                const id = d?._id || d?.id;

                return (
                  <div key={id} style={S.dealCard} onClick={() => openDealDrawerById(id, d)} title="Open Deal Intelligence">
                    <div style={{ fontWeight: 900, fontSize: 13, lineHeight: 1.35 }}>
                      {getClientName(d) ? `${getClientName(d)} — ` : ""}
                      {d?.name || "Deal"}
                    </div>

                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.92 }}>
                      {money(d?.amount ?? 0)} • {Math.round(safeNum(d?.probability ?? 0.5) * 100)}%
                    </div>

                    <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        style={S.select}
                        value={STAGES.includes(d?.stage) ? d.stage : stage}
                        onChange={(e) => {
                          e.stopPropagation();
                          onMoveDeal(id, e.target.value);
                        }}
                        disabled={saving}
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        style={{ ...S.btnGhost, padding: "10px 12px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDeal(id);
                        }}
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ✅ B: Create Deal Modal */}
      {createOpen ? (
        <div style={S.overlay} onClick={() => !saving && setCreateOpen(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 14 }}>Create Deal</div>
              <button style={S.btnGhost} disabled={saving} onClick={() => setCreateOpen(false)}>
                Close
              </button>
            </div>

            <div style={S.divider} />

            <form onSubmit={onCreateDeal}>
              <div style={S.formGrid}>
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.85, marginBottom: 6 }}>DEAL NAME</div>
                  <input
                    style={S.input}
                    value={createForm.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="ex: Atlas Revenue AI — Retainer"
                  />
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.85, marginBottom: 6 }}>AMOUNT</div>
                  <input
                    style={S.input}
                    value={createForm.amount}
                    onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="25000"
                  />
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.85, marginBottom: 6 }}>PROBABILITY</div>
                  <select
                    style={S.select}
                    value={createForm.probability}
                    onChange={(e) => setCreateForm((p) => ({ ...p, probability: e.target.value }))}
                  >
                    <option value="0.2">20%</option>
                    <option value="0.35">35%</option>
                    <option value="0.5">50%</option>
                    <option value="0.65">65%</option>
                    <option value="0.8">80%</option>
                    <option value="1">100%</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 10, ...S.formGrid2 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.85, marginBottom: 6 }}>CLIENT</div>
                  <select
                    style={S.select}
                    value={createForm.clientId}
                    onChange={(e) => setCreateForm((p) => ({ ...p, clientId: e.target.value }))}
                  >
                    <option value="">Select client…</option>
                    {clients.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.85, marginBottom: 6 }}>STAGE</div>
                  <select
                    style={S.select}
                    value={createForm.stage}
                    onChange={(e) => setCreateForm((p) => ({ ...p, stage: e.target.value }))}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.85, marginBottom: 6 }}>NEXT ACTION (OPTIONAL)</div>
                <input
                  style={S.input}
                  value={createForm.nextAction}
                  onChange={(e) => setCreateForm((p) => ({ ...p, nextAction: e.target.value }))}
                  placeholder="ex: Book discovery call + send recap"
                />
              </div>

              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  style={S.btnGhost}
                  disabled={saving}
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" style={S.btn} disabled={saving}>
                  {saving ? "Creating..." : "Create Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ✅ Shared Deal Drawer */}
      <DealDrawer
        open={drawerOpen}
        dealId={drawerDealId}
        initialDeal={drawerDeal}
        onClose={closeDrawer}
        onDealUpdated={(updated) => {
          const id = updated?._id || updated?.id;
          if (!id) return;

          setDeals((prev) => (prev || []).map((d) => ((d?._id || d?.id) === id ? { ...d, ...updated } : d)));
          loadPriorities();
        }}
      />
    </div>
  );
}