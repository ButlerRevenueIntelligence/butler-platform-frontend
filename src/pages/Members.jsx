// frontend/src/pages/Members.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPut, getActiveOrgName } from "../api";

const safe = (v) => (v == null ? "" : String(v));

const roleTone = (role) => {
  const r = safe(role).toLowerCase();
  if (r === "owner") return "#22C55E";
  if (r === "admin") return "#38BDF8";
  if (r === "manager") return "#F59E0B";
  if (r === "analyst") return "#A78BFA";
  if (r === "member") return "#EAB308";
  if (r === "viewer") return "#A3A3A3";
  return "#A3A3A3";
};

const statusTone = (status) => {
  const s = safe(status).toLowerCase();
  if (s === "active") return "#22C55E";
  if (s === "invited") return "#F59E0B";
  if (s === "suspended") return "#FB7185";
  if (s === "disabled") return "#94A3B8";
  return "#A3A3A3";
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

export default function Members() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const workspaceName = getActiveOrgName() || "Current Workspace";

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const data = await apiGet("/members");
      const list = Array.isArray(data?.members)
        ? data.members
        : Array.isArray(data)
        ? data
        : [];
      setItems(list);
    } catch (e) {
      setErr(e?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateMember(membershipId, patch) {
    setErr("");
    setSuccess("");
    setSavingId(membershipId);

    try {
      await apiPut(`/members/${membershipId}`, patch);
      setSuccess("Member updated successfully.");
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to update member");
    } finally {
      setSavingId("");
    }
  }

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => safe(i?.status).toLowerCase() === "active").length;
    const admins = items.filter((i) => {
      const r = safe(i?.role).toLowerCase();
      return r === "owner" || r === "admin";
    }).length;
    const managers = items.filter((i) => safe(i?.role).toLowerCase() === "manager").length;

    return { total, active, admins, managers };
  }, [items]);

  const executiveSummary = useMemo(() => {
    if (!items.length) {
      return `No active team members are currently being shown for ${workspaceName}. Atlas Member Control lets owners and admins monitor workspace access, adjust roles, and manage operational permissions.`;
    }

    return `Atlas Member Control is tracking ${stats.total} team members for ${workspaceName}. ${stats.active} are active, ${stats.admins} have admin-level access, and ${stats.managers} have manager-level access. Use this layer to manage who can operate inside the workspace.`;
  }, [items, stats, workspaceName]);

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
    error: {
      marginTop: 12,
      borderRadius: 12,
      padding: 12,
      border: "1px solid rgba(255,0,0,0.25)",
      background: "rgba(255,0,0,0.10)",
      color: "#FFD7D7",
    },
    success: {
      marginTop: 12,
      borderRadius: 12,
      padding: 12,
      border: "1px solid rgba(34,197,94,0.28)",
      background: "rgba(34,197,94,0.12)",
      color: "#D1FAE5",
    },
    list: {
      display: "grid",
      gap: 12,
      marginTop: 12,
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
    controls: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginTop: 12,
      alignItems: "center",
    },
    select: {
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      color: "#EAF0FF",
      outline: "none",
    },
    button: {
      borderRadius: 999,
      padding: "10px 14px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      color: "#EAF0FF",
      fontWeight: 900,
      fontSize: 12,
      cursor: "pointer",
    },
  };

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />

      <div style={S.topRow}>
        <div>
          <h1 style={S.title}>Atlas Member Control</h1>
          <div style={S.sub}>
            Manage member roles and access for <b>{workspaceName}</b>.
          </div>
        </div>

        <button onClick={load} disabled={loading} style={S.btnGhost}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div style={S.heroCard}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
          Executive Team Briefing
        </div>
        <div style={{ fontSize: 14, opacity: 0.92, lineHeight: 1.65 }}>
          {executiveSummary}
        </div>
      </div>

      <div style={S.signalGrid}>
        <div style={S.signalCard}>
          <div style={S.signalLabel}>TOTAL MEMBERS</div>
          <div style={S.signalValue}>{stats.total}</div>
          <div style={S.signalSub}>All tracked team members in this workspace.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>ACTIVE</div>
          <div style={S.signalValue}>{stats.active}</div>
          <div style={S.signalSub}>Members currently able to operate in the workspace.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>ADMIN ACCESS</div>
          <div style={S.signalValue}>{stats.admins}</div>
          <div style={S.signalSub}>Owners and admins with elevated control.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>MANAGERS</div>
          <div style={S.signalValue}>{stats.managers}</div>
          <div style={S.signalSub}>Members with manager-level workspace access.</div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>
          Workspace Members
        </div>
        <div style={{ opacity: 0.78, fontSize: 13 }}>
          Review active members, update roles, and manage status across the workspace.
        </div>

        {success ? <div style={S.success}>{success}</div> : null}
        {err ? <div style={S.error}>{err}</div> : null}

        {loading ? (
          <div style={{ marginTop: 12 }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.84 }}>No members found.</div>
        ) : (
          <div style={S.list}>
            {items.map((member) => {
              const id = member?.membershipId || member?._id || member?.id;
              const roleColor = roleTone(member?.role);
              const statusColor = statusTone(member?.status);

              return (
                <div key={id} style={S.item}>
                  <div style={S.itemTop}>
                    <div>
                      <div style={S.itemTitle}>{member?.name || "User"}</div>
                      <div style={S.itemMeta}>
                        {member?.email || "—"}
                        {" • "}Joined: <strong>{formatDate(member?.joinedAt || member?.createdAt)}</strong>
                        {member?.lastActiveAt ? (
                          <>
                            {" • "}Last Active: <strong>{formatDate(member.lastActiveAt)}</strong>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ ...S.tag, color: roleColor }}>
                        Role {safe(member?.role || "—").toUpperCase()}
                      </div>
                      <div style={{ ...S.tag, color: statusColor }}>
                        {safe(member?.status || "—").toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div style={S.controls}>
                    <select
                      defaultValue={member?.role || "member"}
                      style={S.select}
                      id={`role-${id}`}
                    >
                      <option value="owner">owner</option>
                      <option value="admin">admin</option>
                      <option value="manager">manager</option>
                      <option value="analyst">analyst</option>
                      <option value="member">member</option>
                      <option value="viewer">viewer</option>
                    </select>

                    <select
                      defaultValue={member?.status || "active"}
                      style={S.select}
                      id={`status-${id}`}
                    >
                      <option value="active">active</option>
                      <option value="invited">invited</option>
                      <option value="suspended">suspended</option>
                      <option value="disabled">disabled</option>
                    </select>

                    <button
                      style={S.button}
                      disabled={savingId === id}
                      onClick={() => {
                        const roleEl = document.getElementById(`role-${id}`);
                        const statusEl = document.getElementById(`status-${id}`);

                        updateMember(id, {
                          role: roleEl?.value,
                          status: statusEl?.value,
                        });
                      }}
                    >
                      {savingId === id ? "Saving..." : "Update Member"}
                    </button>
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