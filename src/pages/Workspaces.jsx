// frontend/src/pages/Workspaces.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrgs, setActiveOrgId, getActiveOrgId, switchOrg } from "../api";

const ROLE_RANK = {
  owner: 5,
  admin: 4,
  manager: 3,
  sales: 2,
  analyst: 1,
};

const rankRole = (r) => ROLE_RANK[String(r || "").toLowerCase()] || 0;

export default function Workspaces() {
  const nav = useNavigate();
  const [orgsRaw, setOrgsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [err, setErr] = useState("");

  const activeOrgId = getActiveOrgId();

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const res = await getMyOrgs();
      const rows = res?.orgs || res?.data?.orgs || [];
      setOrgsRaw(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setErr(e?.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // De-dupe by orgId and keep the "highest" role if duplicates exist
  const orgs = useMemo(() => {
    const map = new Map();

    for (const o of orgsRaw) {
      const id = String(o?.orgId || "").trim();
      if (!id) continue;

      const current = map.get(id);
      if (!current) {
        map.set(id, { ...o, orgId: id });
        continue;
      }

      // Prefer the higher role
      const curRank = rankRole(current.role);
      const nextRank = rankRole(o.role);
      if (nextRank > curRank) {
        map.set(id, { ...current, ...o, orgId: id });
      } else {
        // Keep existing, but fill any missing fields
        map.set(id, {
          ...o,
          ...current,
          orgId: id,
          orgName: current.orgName || o.orgName,
          orgSlug: current.orgSlug || o.orgSlug,
          status: current.status || o.status,
        });
      }
    }

    const arr = Array.from(map.values());

    // Sort: active first, then by role rank, then by name
    arr.sort((a, b) => {
      const aActive = String(a.orgId) === String(activeOrgId) ? 1 : 0;
      const bActive = String(b.orgId) === String(activeOrgId) ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;

      const rr = rankRole(b.role) - rankRole(a.role);
      if (rr !== 0) return rr;

      return String(a.orgName || "").localeCompare(String(b.orgName || ""));
    });

    return arr;
  }, [orgsRaw, activeOrgId]);

  async function onSelect(orgId) {
    try {
      setErr("");
      setSwitching(true);

      // validate membership server-side
      await switchOrg(orgId);

      // actually switch tenant client-side
      setActiveOrgId(orgId);

      // go to dashboard after switch
      nav("/dashboard", { replace: true });
    } catch (e) {
      setErr(e?.message || "Failed to switch workspace");
    } finally {
      setSwitching(false);
    }
  }

  const activeOrg = orgs.find((o) => String(o.orgId) === String(activeOrgId)) || null;

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Workspaces</h2>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            Select a workspace to view. This sets your <b>x-org-id</b> header.
          </div>
        </div>

        <button
          onClick={load}
          disabled={loading || switching}
          style={{
            height: 40,
            borderRadius: 12,
            padding: "0 12px",
            border: "1px solid rgba(140,170,255,0.22)",
            background: "rgba(10,14,28,0.35)",
            color: "rgba(234,240,255,0.92)",
            cursor: loading || switching ? "not-allowed" : "pointer",
            opacity: loading || switching ? 0.7 : 1,
            fontWeight: 800,
          }}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {activeOrg ? (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(140,170,255,0.18)",
            background: "rgba(120,160,255,0.10)",
          }}
        >
          <div style={{ fontWeight: 900 }}>Current workspace</div>
          <div style={{ marginTop: 6, opacity: 0.9 }}>
            <b>{activeOrg.orgName}</b> — Role: <b>{activeOrg.role}</b>
          </div>
        </div>
      ) : null}

      {err ? (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 10,
            background: "rgba(255,0,0,0.08)",
          }}
        >
          {err}
        </div>
      ) : null}

      {!loading && !orgs.length ? (
        <div style={{ marginTop: 14, opacity: 0.85 }}>No workspaces found for this user.</div>
      ) : null}

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {orgs.map((o) => {
          const isActive = String(o.orgId) === String(activeOrgId);

          return (
            <button
              key={o.orgId}
              onClick={() => onSelect(o.orgId)}
              disabled={switching}
              style={{
                textAlign: "left",
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(140,170,255,0.22)",
                background: isActive ? "rgba(120,160,255,0.22)" : "rgba(10,14,28,0.35)",
                color: "rgba(234,240,255,0.92)",
                cursor: switching ? "not-allowed" : "pointer",
                opacity: switching ? 0.7 : 1,
              }}
            >
              <div style={{ fontWeight: 900, display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>{o.orgName || "Organization"}</span>
                {isActive ? <span style={{ fontWeight: 900 }}>✅ Active</span> : null}
              </div>

              <div style={{ marginTop: 6, opacity: 0.8, fontSize: 12 }}>
                Role: <b>{o.role || "analyst"}</b> • Status: <b>{o.status || "active"}</b>
                {o.orgSlug ? (
                  <>
                    {" "}
                    • Slug: <b>{o.orgSlug}</b>
                  </>
                ) : null}
              </div>

              {isActive ? (
                <div style={{ marginTop: 8, opacity: 0.75, fontSize: 12 }}>
                  This workspace is currently selected in localStorage.
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}