// frontend/src/pages/Partners.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = ["owner", "admin", "manager", "analyst"];

function getToken() {
  return localStorage.getItem("butler_token");
}
function getActiveOrgId() {
  return localStorage.getItem("active_org_id");
}

async function apiReq(path, { method = "GET", body } = {}) {
  const token = getToken();
  const orgId = getActiveOrgId();

  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(orgId ? { "x-org-id": orgId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}

export default function Partners() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [me, setMe] = useState({ userId: "", role: "analyst" });
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState("");
  const [removingId, setRemovingId] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await apiReq("/partners");
      const list = Array.isArray(res?.partners) ? res.partners : [];
      setRows(list);
      setMe(res?.me || { userId: "", role: "analyst" });
    } catch (e) {
      console.error("Partners load error:", e);
      setError(e?.message || "Failed to load partners");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const canAdmin = useMemo(() => {
    const r = String(me?.role || "").toLowerCase();
    return r === "owner" || r === "admin";
  }, [me]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((p) => {
      const name = (p?.name || "").toLowerCase();
      const email = (p?.email || "").toLowerCase();
      const role = (p?.role || "").toLowerCase();
      const id = (p?.userId || p?.id || "").toLowerCase();
      return name.includes(s) || email.includes(s) || role.includes(s) || id.includes(s);
    });
  }, [rows, q]);

  async function changeRole(membershipId, nextRole) {
    if (!canAdmin) return;
    try {
      setSavingId(membershipId);
      await apiReq(`/partners/${membershipId}/role`, { method: "PATCH", body: { role: nextRole } });
      await load();
    } catch (e) {
      alert(e?.message || "Failed to update role");
    } finally {
      setSavingId("");
    }
  }

  async function removeMember(membershipId, nameOrEmail) {
    if (!canAdmin) return;
    const ok = window.confirm(
      `Remove this partner from the workspace?\n\n${nameOrEmail || "This member"}`
    );
    if (!ok) return;

    try {
      setRemovingId(membershipId);
      await apiReq(`/partners/${membershipId}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e?.message || "Failed to remove partner");
    } finally {
      setRemovingId("");
    }
  }

  const S = styles;

  return (
    <div style={S.page}>
      <div style={S.headerRow}>
        <div>
          <h1 style={S.title}>Partners</h1>
          <div style={S.sub}>
            Manage workspace members, roles, and access.
          </div>
        </div>

        <div style={S.headerActions}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search partners..."
            style={S.search}
          />

          <button onClick={load} style={S.btn}>
            Refresh
          </button>

          <button
            onClick={() => nav("/invites")}
            style={{ ...S.btn, ...S.btnPrimary }}
            title="Invite partners via the Invites page"
          >
            Invite Partner
          </button>
        </div>
      </div>

      {error ? <div style={S.error}>{error}</div> : null}

      <div style={S.metaRow}>
        <div style={S.pill}>
          Your role: <b style={{ marginLeft: 6 }}>{String(me?.role || "analyst").toUpperCase()}</b>
        </div>
        <div style={S.pill}>
          Access: <b style={{ marginLeft: 6 }}>{canAdmin ? "ADMIN" : "STANDARD"}</b>
        </div>
        <div style={S.pill}>
          Members: <b style={{ marginLeft: 6 }}>{rows.length}</b>
        </div>
      </div>

      {loading ? (
        <div style={S.muted}>Loading partners…</div>
      ) : filtered.length === 0 ? (
        <div style={S.muted}>No partners found.</div>
      ) : (
        <div style={S.grid}>
          {filtered.map((p) => {
            const id = p?.id || p?._id;
            const displayName =
              p?.name?.trim() ||
              (p?.email ? p.email.split("@")[0] : "") ||
              `User ${String(p?.userId || "").slice(-6)}`;

            const isMe = p?.userId && me?.userId && String(p.userId) === String(me.userId);

            return (
              <div key={id} style={S.card}>
                <div style={S.cardTop}>
                  <div style={{ minWidth: 0 }}>
                    <div style={S.nameRow}>
                      <div style={S.name} title={displayName}>
                        {displayName}
                      </div>
                      {isMe ? <div style={S.meTag}>YOU</div> : null}
                    </div>
                    <div style={S.email} title={p?.email || p?.userId || ""}>
                      {p?.email || p?.userId || ""}
                    </div>
                  </div>

                  <div style={S.roleBox}>
                    <div style={S.roleLabel}>ROLE</div>

                    {canAdmin ? (
                      <select
                        value={String(p?.role || "analyst").toLowerCase()}
                        onChange={(e) => changeRole(id, e.target.value)}
                        disabled={savingId === id || (isMe && String(me.role).toLowerCase() === "owner")}
                        style={S.select}
                        title={
                          isMe && String(me.role).toLowerCase() === "owner"
                            ? "Owner cannot demote themselves"
                            : "Change role"
                        }
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={S.rolePill}>{String(p?.role || "analyst").toUpperCase()}</div>
                    )}
                  </div>
                </div>

                <div style={S.cardBottom}>
                  <div style={S.status}>
                    Status: <b>{p?.status || "active"}</b>
                  </div>

                  {canAdmin ? (
                    <button
                      onClick={() => removeMember(id, p?.email || displayName)}
                      disabled={removingId === id || isMe}
                      style={{
                        ...S.btnDanger,
                        ...(isMe ? S.btnDisabled : null),
                      }}
                      title={isMe ? "You can’t remove yourself" : "Remove from workspace"}
                    >
                      {removingId === id ? "Removing…" : "Remove"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={S.footerNote}>
        Tip: Inviting partners is handled in <b>Invites</b>. This page manages roles + access for existing members.
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24, color: "#EAF0FF" },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: 28, fontWeight: 900 },
  sub: { marginTop: 8, opacity: 0.8 },
  headerActions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  search: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.25)",
    color: "inherit",
    outline: "none",
    minWidth: 260,
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
  btnPrimary: {
    background: "rgba(124,92,255,0.18)",
    border: "1px solid rgba(124,92,255,0.45)",
  },
  error: {
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
    border: "1px solid rgba(255,0,0,0.25)",
    background: "rgba(255,0,0,0.10)",
    color: "salmon",
  },
  metaRow: { marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    fontSize: 12,
    opacity: 0.95,
  },
  muted: { marginTop: 16, opacity: 0.75 },
  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 12,
  },
  card: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" },
  nameRow: { display: "flex", gap: 8, alignItems: "center" },
  name: { fontWeight: 950, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  email: { marginTop: 6, opacity: 0.8, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  meTag: {
    fontSize: 10,
    fontWeight: 950,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(34,197,94,0.15)",
    border: "1px solid rgba(34,197,94,0.35)",
  },
  roleBox: { minWidth: 150, textAlign: "right" },
  roleLabel: { fontSize: 10, opacity: 0.7, fontWeight: 900, letterSpacing: 0.8 },
  select: {
    marginTop: 8,
    width: "100%",
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "#EAF0FF",
    outline: "none",
    fontWeight: 900,
    cursor: "pointer",
  },
  rolePill: {
    marginTop: 8,
    display: "inline-flex",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: 0.8,
  },
  cardBottom: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  status: { opacity: 0.85, fontSize: 12 },
  btnDanger: {
    borderRadius: 999,
    padding: "10px 12px",
    border: "1px solid rgba(255,100,100,0.35)",
    background: "rgba(255,100,100,0.10)",
    color: "#FFD2D2",
    fontWeight: 950,
    fontSize: 12,
    cursor: "pointer",
  },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  footerNote: { marginTop: 16, opacity: 0.65, fontSize: 12, lineHeight: 1.5 },
};