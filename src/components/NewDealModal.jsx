import React, { useEffect, useMemo, useRef } from "react";

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

// ---- date helpers (for <input type="date">) ----
const toDateInputValue = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function NewDealModal({
  open,
  saving,
  clients = [],
  form,
  setForm,
  onClose,
  onCreate,
}) {
  const nameRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => nameRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const selectedClient = useMemo(() => {
    const id = form.clientId;
    return clients.find((c) => (c._id || c.id) === id) || null;
  }, [clients, form.clientId]);

  const weighted = useMemo(() => {
    const amt = safeNum(form.amount);
    const prob = safeNum(form.probability);
    return amt * prob;
  }, [form.amount, form.probability]);

  const S = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 16,
    },
    modal: {
      width: "min(860px, 96vw)",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(10, 16, 35, 0.96)",
      padding: 16,
      color: "#EAF0FF",
    },
    titleRow: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" },
    title: { fontSize: 15, fontWeight: 900, margin: 0 },
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
    btnGhost: {
      borderRadius: 999,
      padding: "10px 14px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.16)",
      color: "#EAF0FF",
      fontWeight: 900,
      fontSize: 12,
      cursor: "pointer",
    },
    divider: { height: 1, background: "rgba(255,255,255,0.10)", margin: "12px 0" },
    grid: { display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 10 },
    label: { fontSize: 11, opacity: 0.8, fontWeight: 900, letterSpacing: 0.6, marginBottom: 6 },
    input: {
      width: "100%",
      borderRadius: 12,
      padding: "10px 12px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.20)",
      color: "#EAF0FF",
      outline: "none",
    },
    textarea: {
      width: "100%",
      borderRadius: 12,
      padding: "10px 12px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.20)",
      color: "#EAF0FF",
      outline: "none",
      minHeight: 70,
      resize: "vertical",
    },
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
    hint: { marginTop: 6, fontSize: 12, opacity: 0.75, lineHeight: 1.4 },
  };

  if (!open) return null;

  return (
    <div style={S.overlay} onClick={() => !saving && onClose?.()}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.titleRow}>
          <h3 style={S.title}>Create New Deal</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={S.btnGhost} disabled={saving} onClick={onClose}>
              Close
            </button>
            <button style={S.btn} disabled={saving} onClick={onCreate}>
              {saving ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </div>

        <div style={S.divider} />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={S.pill}>
            Client: <b>{selectedClient?.name || "—"}</b>
          </div>
          <div style={S.pill}>
            Weighted: <b>{money(weighted)}</b>
          </div>
          <div style={S.pill}>
            Due: <b>{form.nextActionDueAt ? new Date(form.nextActionDueAt).toLocaleDateString() : "—"}</b>
          </div>
        </div>

        <div style={{ marginTop: 14, ...S.grid }}>
          <div style={{ gridColumn: "span 2" }}>
            <div style={S.label}>DEAL NAME</div>
            <input
              ref={nameRef}
              style={S.input}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="ex: Apex Bank — Revenue Intelligence Rollout"
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <div style={S.label}>CLIENT</div>
            <select
              style={S.input}
              value={form.clientId}
              onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
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
            <div style={S.label}>AMOUNT ($)</div>
            <input
              style={S.input}
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="25000"
            />
          </div>

          <div>
            <div style={S.label}>PROBABILITY</div>
            <select
              style={S.input}
              value={String(form.probability)}
              onChange={(e) => setForm((p) => ({ ...p, probability: Number(e.target.value) }))}
            >
              <option value="0.2">20%</option>
              <option value="0.35">35%</option>
              <option value="0.5">50%</option>
              <option value="0.65">65%</option>
              <option value="0.8">80%</option>
              <option value="1">100%</option>
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <div style={S.label}>STAGE</div>
            <select
              style={S.input}
              value={form.stage}
              onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
            >
              <option value="Discovery">Discovery</option>
              <option value="Proposal">Proposal</option>
              <option value="Follow-Up">Follow-Up</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <div style={S.label}>NEXT ACTION DUE DATE</div>
            <input
              style={S.input}
              type="date"
              value={toDateInputValue(form.nextActionDueAt)}
              onChange={(e) => {
                const v = e.target.value;
                // store ISO date string (server expects a date-ish value)
                setForm((p) => ({
                  ...p,
                  nextActionDueAt: v ? new Date(`${v}T00:00:00.000Z`).toISOString() : null,
                }));
              }}
            />
            <div style={S.hint}>Used for overdue/due-today badges + execution discipline.</div>
          </div>

          <div style={{ gridColumn: "span 4" }}>
            <div style={S.label}>NEXT ACTION (AUTO-SUGGESTED)</div>
            <textarea
              style={S.textarea}
              value={form.nextAction}
              onChange={(e) => setForm((p) => ({ ...p, nextAction: e.target.value }))}
              placeholder="Next action..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}