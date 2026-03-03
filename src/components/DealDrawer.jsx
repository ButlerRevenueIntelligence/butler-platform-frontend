import React, { useEffect, useMemo, useState } from "react";
import { getDealActivity, logDealActivity, moveDealStage, getDeal, updateDeal } from "../api";

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

function nextActionFallback(d) {
  const stage = (d?.stage || "").toLowerCase();
  if (stage.includes("disc")) return "Confirm ICP, pain, decision-maker";
  if (stage.includes("prop")) return "Follow up: proposal review + next step";
  if (stage.includes("follow")) return "Call + handle objections + set decision date";
  if (stage.includes("neg")) return "Align terms + close plan + mutual action items";
  if (stage.includes("won")) return "Kickoff + onboarding + success metrics";
  if (stage.includes("lost")) return "Log loss reason + set reactivation reminder";
  return "Follow up";
}

// date helpers for <input type="date">
const toDateInputValue = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const fromDateInputValue = (s) => {
  if (!s) return null;
  const dt = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
};

export default function DealDrawer({
  open,
  dealId,
  initialDeal = null,
  onClose,
  onDealUpdated,
}) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [deal, setDeal] = useState(initialDeal);
  const [activity, setActivity] = useState({ nextAction: "", nextActionDueAt: null, lastActivityAt: null, activities: [], outcome: null });

  // editable fields
  const [edit, setEdit] = useState({
    nextAction: "",
    nextActionDueAt: "",
    closedReason: "",
    competitor: "",
    reactivationAt: "",
  });

  const isClosed = (deal?.stage || "").includes("Closed");

  useEffect(() => {
    if (!open || !dealId) return;

    let alive = true;

    async function loadDrawer() {
      try {
        setLoading(true);

        const dealRes = await getDeal(dealId).catch(() => null);
        const fetched = dealRes?.deal || dealRes || null;
        if (alive && fetched) setDeal(fetched);

        const act = await getDealActivity(dealId).catch(() => null);
        if (alive && act) {
          setActivity({
            nextAction: act?.nextAction || "",
            nextActionDueAt: act?.nextActionDueAt || null,
            lastActivityAt: act?.lastActivityAt || null,
            activities: Array.isArray(act?.activities) ? act.activities : [],
            outcome: act?.outcome || null,
          });

          // hydrate edit
          const outcome = act?.outcome || {};
          setEdit({
            nextAction: (fetched?.nextAction || act?.nextAction || "").toString() || nextActionFallback(fetched),
            nextActionDueAt: toDateInputValue(fetched?.nextActionDueAt || act?.nextActionDueAt || ""),
            closedReason: (fetched?.closedReason || outcome?.closedReason || "").toString(),
            competitor: (fetched?.competitor || outcome?.competitor || "").toString(),
            reactivationAt: toDateInputValue(fetched?.reactivationAt || outcome?.reactivationAt || ""),
          });
        } else if (alive) {
          setActivity({ nextAction: "", nextActionDueAt: null, lastActivityAt: null, activities: [], outcome: null });
          setEdit({
            nextAction: (fetched?.nextAction || "").toString() || nextActionFallback(fetched),
            nextActionDueAt: toDateInputValue(fetched?.nextActionDueAt || ""),
            closedReason: (fetched?.closedReason || "").toString(),
            competitor: (fetched?.competitor || "").toString(),
            reactivationAt: toDateInputValue(fetched?.reactivationAt || ""),
          });
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadDrawer();
    return () => {
      alive = false;
    };
  }, [open, dealId]);

  useEffect(() => {
    if (!open) return;
    if (initialDeal && (initialDeal?._id || initialDeal?.id) === dealId) {
      setDeal(initialDeal);
      setEdit((p) => ({
        ...p,
        nextAction: (initialDeal?.nextAction || p.nextAction || nextActionFallback(initialDeal)).toString(),
        nextActionDueAt: toDateInputValue(initialDeal?.nextActionDueAt || p.nextActionDueAt),
        closedReason: (initialDeal?.closedReason || p.closedReason || "").toString(),
        competitor: (initialDeal?.competitor || p.competitor || "").toString(),
        reactivationAt: toDateInputValue(initialDeal?.reactivationAt || p.reactivationAt),
      }));
    }
  }, [open, dealId, initialDeal]);

  const displayedNextAction = useMemo(() => {
    return deal?.nextAction || activity?.nextAction || edit?.nextAction || nextActionFallback(deal);
  }, [deal, activity, edit]);

  async function refreshActivity() {
    if (!dealId) return;
    try {
      setLoading(true);
      const act = await getDealActivity(dealId);
      setActivity({
        nextAction: act?.nextAction || "",
        nextActionDueAt: act?.nextActionDueAt || null,
        lastActivityAt: act?.lastActivityAt || null,
        activities: Array.isArray(act?.activities) ? act.activities : [],
        outcome: act?.outcome || null,
      });
    } catch {
      setActivity({ nextAction: "", nextActionDueAt: null, lastActivityAt: null, activities: [], outcome: null });
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    if (!dealId) return;
    try {
      setSaving(true);

      const payload = {
        nextAction: (edit.nextAction || "").trim(),
        nextActionDueAt: edit.nextActionDueAt ? fromDateInputValue(edit.nextActionDueAt) : null,
        closedReason: (edit.closedReason || "").trim(),
        competitor: (edit.competitor || "").trim(),
        reactivationAt: edit.reactivationAt ? fromDateInputValue(edit.reactivationAt) : null,
      };

      const res = await updateDeal(dealId, payload);
      const updated = res?.deal || res;

      setDeal((prev) => (prev ? { ...prev, ...updated } : updated));
      onDealUpdated?.(updated);
      await refreshActivity();
    } catch (e) {
      alert(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function onLogActivity() {
    if (!dealId) return;
    const type = window.prompt("Activity type? (note/call/email/meeting/task)", "note") || "note";
    const note = window.prompt("What happened? (short note)", "") || "";
    const nextAction = window.prompt("Next action (optional)", displayedNextAction) || "";
    const due = window.prompt("Due date? (YYYY-MM-DD) optional", edit.nextActionDueAt || "") || "";

    try {
      setSaving(true);
      const payload = { type, note, nextAction };
      if (due.trim()) payload.nextActionDueAt = fromDateInputValue(due.trim());

      const res = await logDealActivity(dealId, payload);
      const updated = res?.deal || res;

      setDeal((prev) => (prev ? { ...prev, ...updated } : updated));
      onDealUpdated?.(updated);

      await refreshActivity();
    } catch (e) {
      alert(e?.message || "Failed to log activity");
    } finally {
      setSaving(false);
    }
  }

  async function setStage(stage) {
    if (!dealId) return;
    try {
      setSaving(true);
      const res = await moveDealStage(dealId, stage);
      const updated = res?.deal || res;

      setDeal((prev) => (prev ? { ...prev, ...updated, stage } : { ...updated, stage }));
      onDealUpdated?.({ ...updated, stage });

      await refreshActivity();
    } catch (e) {
      alert(e?.message || "Failed to update stage");
    } finally {
      setSaving(false);
    }
  }

  const S = {
    drawer: {
      position: "fixed",
      top: 0,
      right: 0,
      height: "100vh",
      width: "min(560px, 94vw)",
      background: "rgba(10, 16, 35, 0.98)",
      borderLeft: "1px solid rgba(255,255,255,0.10)",
      zIndex: 999,
      padding: 16,
      overflow: "auto",
      color: "#EAF0FF",
    },
    header: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" },
    title: { fontWeight: 1000, fontSize: 14, lineHeight: 1.35 },
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
    divider: { height: 1, background: "rgba(255,255,255,0.10)", margin: "12px 0" },
    card: {
      borderRadius: 14,
      padding: 12,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
    },
    row: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
    small: { fontSize: 12, opacity: 0.9, lineHeight: 1.5 },
    muted: { opacity: 0.85, fontSize: 12 },
    label: { fontSize: 11, fontWeight: 900, opacity: 0.85, letterSpacing: 0.6, marginBottom: 6 },
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
      minHeight: 84,
      resize: "vertical",
    },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  };

  if (!open) return null;

  return (
    <div style={S.drawer}>
      <div style={S.header}>
        <div>
          <div style={S.title}>Deal Intelligence</div>
          <div style={{ marginTop: 6, opacity: 0.9, fontSize: 12 }}>
            {deal?.clientId?.name ? <span><b>{deal.clientId.name}</b> — </span> : null}
            <b>{deal?.name || "Deal"}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button style={S.btnGhost} disabled={loading || saving} onClick={refreshActivity}>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button style={S.btnGhost} disabled={saving} onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div style={S.divider} />

      <div style={{ display: "grid", gap: 12 }}>
        {/* Summary */}
        <div style={S.card}>
          <div style={S.row}>
            <div style={S.small}>Stage: <b>{deal?.stage || "—"}</b></div>
            <div style={S.small}>Value: <b>{money(deal?.amount ?? 0)}</b></div>
          </div>
          <div style={{ marginTop: 6, ...S.small }}>
            Probability: <b>{Math.round(safeNum(deal?.probability ?? 0.5) * 100)}%</b>
          </div>
          <div style={{ marginTop: 6, ...S.muted }}>
            Last activity: <b>{activity?.lastActivityAt ? new Date(activity.lastActivityAt).toLocaleString() : "—"}</b>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={S.btn} disabled={saving} onClick={onLogActivity}>
              {saving ? "Saving..." : "Log Activity"}
            </button>

            <button style={S.btnGhost} disabled={saving} onClick={() => setStage("Closed Won")}>
              Mark Closed Won
            </button>
            <button style={S.btnGhost} disabled={saving} onClick={() => setStage("Closed Lost")}>
              Mark Closed Lost
            </button>

            <button style={S.btn} disabled={saving} onClick={onSave}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Execution fields */}
        <div style={S.card}>
          <div style={S.label}>NEXT ACTION</div>
          <textarea
            style={S.textarea}
            value={edit.nextAction}
            onChange={(e) => setEdit((p) => ({ ...p, nextAction: e.target.value }))}
            placeholder="What happens next?"
          />

          <div style={{ marginTop: 10 }}>
            <div style={S.label}>NEXT ACTION DUE DATE</div>
            <input
              style={S.input}
              type="date"
              value={edit.nextActionDueAt}
              onChange={(e) => setEdit((p) => ({ ...p, nextActionDueAt: e.target.value }))}
            />
          </div>

          <div style={{ marginTop: 12, opacity: 0.9, fontSize: 12 }}>
            Current: <b>{displayedNextAction}</b>
          </div>
        </div>

        {/* Win/Loss fields */}
        <div style={{ ...S.card, opacity: isClosed ? 1 : 0.6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 1000 }}>Win / Loss Intelligence</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              {isClosed ? "Active" : "Locked until Closed"}
            </div>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div>
              <div style={S.label}>CLOSED REASON</div>
              <input
                style={S.input}
                value={edit.closedReason}
                onChange={(e) => setEdit((p) => ({ ...p, closedReason: e.target.value }))}
                placeholder="ex: pricing, timing, budget freeze..."
                disabled={!isClosed}
              />
            </div>

            <div style={S.grid2}>
              <div>
                <div style={S.label}>COMPETITOR</div>
                <input
                  style={S.input}
                  value={edit.competitor}
                  onChange={(e) => setEdit((p) => ({ ...p, competitor: e.target.value }))}
                  placeholder="ex: Vendor X / Agency Y"
                  disabled={!isClosed}
                />
              </div>

              <div>
                <div style={S.label}>REACTIVATION DATE</div>
                <input
                  style={S.input}
                  type="date"
                  value={edit.reactivationAt}
                  onChange={(e) => setEdit((p) => ({ ...p, reactivationAt: e.target.value }))}
                  disabled={!isClosed}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ fontWeight: 1000, marginTop: 2 }}>Activity Timeline</div>

        {loading ? (
          <div style={{ opacity: 0.85 }}>Loading timeline…</div>
        ) : (activity?.activities || []).length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {activity.activities.map((a, idx) => (
              <div key={`${a?.createdAt || idx}`} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div style={{ fontWeight: 1000, fontSize: 12 }}>
                    {(a?.type || "note").toString().toUpperCase()}
                  </div>
                  <div style={{ opacity: 0.85, fontSize: 12 }}>
                    {a?.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                  </div>
                </div>

                {a?.note ? <div style={{ marginTop: 8, lineHeight: 1.5 }}>{a.note}</div> : null}

                {a?.nextAction ? (
                  <div style={{ marginTop: 8, opacity: 0.92 }}>
                    Next action set: <b>{a.nextAction}</b>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ opacity: 0.85 }}>
            No activity yet. Click <b>Log Activity</b> to create the first touch.
          </div>
        )}
      </div>
    </div>
  );
}