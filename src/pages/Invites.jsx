// frontend/src/pages/Invites.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createInvite, listInvites } from "../api";

const safe = (v) => (v == null ? "" : String(v));

const roleTone = (role) => {
  const r = safe(role).toLowerCase();
  if (r === "owner") return "#22C55E";
  if (r === "admin") return "#38BDF8";
  if (r === "manager") return "#F59E0B";
  if (r === "analyst") return "#A78BFA";
  return "#A3A3A3";
};

const statusTone = (status) => {
  const s = safe(status).toLowerCase();
  if (s.includes("accepted")) return "#22C55E";
  if (s.includes("pending")) return "#F59E0B";
  if (s.includes("expired")) return "#FB7185";
  return "#A3A3A3";
};

export default function Invites() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("analyst");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await listInvites();
      const list = Array.isArray(data?.invites)
        ? data.invites
        : Array.isArray(data)
        ? data
        : [];
      setItems(list);
    } catch (e) {
      setErr(e?.message || "Failed to load invites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate() {
    setErr("");
    try {
      setCreating(true);
      await createInvite({ email: email.trim(), role });
      setEmail("");
      await load();
    } catch (e) {
      setErr(e?.message || "Create invite failed");
    } finally {
      setCreating(false);
    }
  }

  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((i) =>
      safe(i?.status).toLowerCase().includes("pending")
    ).length;
    const accepted = items.filter((i) =>
      safe(i?.status).toLowerCase().includes("accepted")
    ).length;
    const expired = items.filter((i) =>
      safe(i?.status).toLowerCase().includes("expired")
    ).length;

    return { total, pending, accepted, expired };
  }, [items]);

  const executiveSummary = useMemo(() => {
    if (!items.length) {
      return "No invite records are currently active for this workspace. Atlas Invite Control lets you manage access expansion, track invite status, and oversee workspace onboarding from one place.";
    }

    return `Atlas Invite Control is currently tracking ${stats.total} invite records. ${stats.pending} are pending, ${stats.accepted} have been accepted, and ${stats.expired} are expired. Use this layer to manage who gets access to the workspace and how that access is expanding over time.`;
  }, [items, stats]);

  const S = {
    page: {
      minHeight: "100vh",
      padding: "26px 26px 40px",
      color: "#EAF0FF",
    },
    bgGlow: {
      position: "fixed",
      inset: 0,
      zIndex: -1,
      background:
        "radial-gradient(1200px 700px at 15% 15%, rgba(124,92,255,0.25), transparent 60%), radial-gradient(1000px 650px at 85% 30%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 650px at 50% 90%, rgba(34,197,94,0.10), transparent 60%), linear-gradient(180deg, rgba(5,8,18,1) 0%, rgba(7,12,28,1) 55%, rgba(5,8,18,1) 100%)",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "flex-start",
      flexWrap: "wrap",
    },
    title: {
      margin: 0,
      fontSize: 32,
      fontWeight: 900,
    },
    sub: {
      marginTop: 8,
      opacity: 0.8,
      fontSize: 14,
    },
    heroCard: {
      marginTop: 14,
      borderRadius: 18,
      padding: 18,
      border: "1px solid rgba(255,255,255,0.08)",
      background:
        "linear-gradient(135deg, rgba(124,92,255,0.16), rgba(56,189,248,0.10), rgba(255,255,255,0.03))",
    },
    signalGrid: {
      marginTop: 14,
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(220px, 1fr))",
      gap: 12,
    },
    signalCard: {
      borderRadius: 16,
      padding: 16,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(10,16,35,0.4)",
    },
    signalLabel: {
      fontSize: 12,
      opacity: 0.8,
      letterSpacing: 0.8,
    },
    signalValue: {
      marginTop: 8,
      fontSize: 28,
      fontWeight: 900,
    },
    signalSub: {
      marginTop: 8,
      fontSize: 12,
      opacity: 0.82,
      lineHeight: 1.45,
    },
    card: {
      marginTop: 14,
      borderRadius: 18,
      padding: 18,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(10, 16, 35, 0.55)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    },
    input: {
      width: "100%",
      padding: "12px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      color: "#EAF0FF",
      outline: "none",
    },
    select: {
      width: "100%",
      padding: "12px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      color: "#EAF0FF",
      outline: "none",
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
    btnGhost: {
      borderRadius: 999,
      padding: "10px 14px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "transparent",
      color: "#EAF0FF",
      fontWeight: 900,
      fontSize: 12,
      cursor: "pointer",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr auto",
      gap: 12,
      alignItems: "end",
      maxWidth: 840,
    },
    error: {
      marginTop: 12,
      borderRadius: 12,
      padding: 12,
      border: "1px solid rgba(255,0,0,0.25)",
      background: "rgba(255,0,0,0.10)",
    },
    list: {
      display: "grid",
      gap: 12,
      marginTop: 12,
      maxWidth: 900,
    },
    item: {
      padding: 14,
      borderRadius: 14,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    itemTop: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap",
    },
    itemTitle: {
      fontWeight: 900,
      fontSize: 15,
    },
    itemMeta: {
      opacity: 0.84,
      fontSize: 13,
      marginTop: 8,
      lineHeight: 1.5,
    },
    tag: {
      fontSize: 12,
      fontWeight: 900,
      padding: "6px 10px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.10)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
    },
  };

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />

      <div style={S.topRow}>
        <div>
          <h1 style={S.title}>Atlas Invite Control</h1>
          <div style={S.sub}>
            Create, track, and manage workspace invites as part of Global HQ access control.
          </div>
        </div>

        <button onClick={load} disabled={loading} style={S.btnGhost}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div style={S.heroCard}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
          Executive Invite Briefing
        </div>
        <div style={{ fontSize: 14, opacity: 0.92, lineHeight: 1.65 }}>
          {executiveSummary}
        </div>
      </div>

      <div style={S.signalGrid}>
        <div style={S.signalCard}>
          <div style={S.signalLabel}>TOTAL INVITES</div>
          <div style={S.signalValue}>{stats.total}</div>
          <div style={S.signalSub}>All tracked invite records in this workspace.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>PENDING</div>
          <div style={S.signalValue}>{stats.pending}</div>
          <div style={S.signalSub}>Invites awaiting acceptance or action.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>ACCEPTED</div>
          <div style={S.signalValue}>{stats.accepted}</div>
          <div style={S.signalSub}>Invites that have already converted into access.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>EXPIRED</div>
          <div style={S.signalValue}>{stats.expired}</div>
          <div style={S.signalSub}>Invites that are no longer valid and may need reissue.</div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>
          Create Invite
        </div>

        <div style={S.formGrid}>
          <input
            value={email}
            placeholder="person@company.com"
            onChange={(e) => setEmail(e.target.value)}
            style={S.input}
          />

          <select value={role} onChange={(e) => setRole(e.target.value)} style={S.select}>
            <option value="owner">owner</option>
            <option value="admin">admin</option>
            <option value="analyst">analyst</option>
            <option value="viewer">viewer</option>
          </select>

          <button onClick={onCreate} disabled={!email.trim() || creating} style={S.btn}>
            {creating ? "Creating..." : "Create Invite"}
          </button>
        </div>

        {err ? <div style={S.error}>{err}</div> : null}
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>
          Recent Invites
        </div>
        <div style={{ opacity: 0.78, fontSize: 13 }}>
          Track recent access invites and their current status across the workspace.
        </div>

        {loading ? (
          <div style={{ marginTop: 12 }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.84 }}>No invites yet.</div>
        ) : (
          <div style={S.list}>
            {items.map((inv) => {
              const id = inv?._id || inv?.id || `${inv.email}-${inv.createdAt}`;
              const roleColor = roleTone(inv?.role);
              const statusColor = statusTone(inv?.status);

              return (
                <div key={id} style={S.item}>
                  <div style={S.itemTop}>
                    <div style={S.itemTitle}>{inv?.email || "—"}</div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <div
                        style={{
                          ...S.tag,
                          color: roleColor,
                        }}
                      >
                        Role {safe(inv?.role || "—").toUpperCase()}
                      </div>
                      <div
                        style={{
                          ...S.tag,
                          color: statusColor,
                        }}
                      >
                        {safe(inv?.status || "—").toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div style={S.itemMeta}>
                    {inv?.createdAt ? (
                      <>
                        Created: <strong>{new Date(inv.createdAt).toLocaleString()}</strong>
                      </>
                    ) : null}

                    {inv?.expiresAt ? (
                      <>
                        {" • "}Expires:{" "}
                        <strong>{new Date(inv.expiresAt).toLocaleString()}</strong>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}