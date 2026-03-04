// frontend/src/pages/Partners.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Partners (Workspace Members) page.
 * - Will NOT break the app if backend endpoint isn't live yet (404 becomes "empty state").
 * - When you wire the backend, just update ENDPOINT below.
 */

const ENDPOINT = "/api/partners"; // <-- change later to your real route when backend is ready

export default function Partners() {
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  async function loadPartners() {
    const controller = new AbortController();

    try {
      setLoading(true);
      setError("");

      const res = await fetch(ENDPOINT, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      // If backend route isn't wired yet, treat as empty (no red error)
      if (res.status === 404) {
        setPartners([]);
        return;
      }

      if (!res.ok) {
        const txt = await safeText(res);
        throw new Error(txt || `Request failed: ${res.status}`);
      }

      const data = await res.json();
      const rows = Array.isArray(data?.partners)
        ? data.partners
        : Array.isArray(data?.rows)
        ? data.rows
        : Array.isArray(data)
        ? data
        : [];

      setPartners(rows);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load partners");
      setPartners([]);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }

  useEffect(() => {
    loadPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return partners;
    return partners.filter((p) => {
      const name = (p?.name || p?.fullName || "").toLowerCase();
      const email = (p?.email || "").toLowerCase();
      const role = (p?.role || "").toLowerCase();
      return name.includes(s) || email.includes(s) || role.includes(s);
    });
  }, [partners, q]);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto", color: "#EAF0FF" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Partners</h1>
          <div style={{ marginTop: 8, opacity: 0.8 }}>
            Manage workspace members, roles, and access.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search partners..."
            style={searchStyle}
          />
          <button onClick={loadPartners} disabled={loading} style={btnGhost}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Status pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <div style={pill}>Your role: <b>ANALYST</b></div>
        <div style={pill}>Access: <b>STANDARD</b></div>
        <div style={pill}>Members: <b>{partners.length}</b></div>
      </div>

      {/* Error (only show if NOT the “endpoint missing” case) */}
      {error ? (
        <div style={errorBox}>
          <b>Heads up:</b> {error}
          <div style={{ marginTop: 6, opacity: 0.85, fontSize: 12 }}>
            If you haven’t wired the backend partners route yet, this is expected.
          </div>
        </div>
      ) : null}

      {/* Content */}
      <div style={{ marginTop: 14 }}>
        {!loading && filtered.length === 0 ? (
          <div style={{ opacity: 0.8 }}>
            No partners found.
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              Tip: Inviting partners can be handled in <b>Invites</b>. This page manages roles + access for existing members.
            </div>
          </div>
        ) : null}

        {filtered.length ? (
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {filtered.map((p, idx) => (
              <div key={p?._id || p?.id || idx} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {p?.name || p?.fullName || "Partner"}
                  </div>
                  <div style={{ opacity: 0.85 }}>{p?.role || "Member"}</div>
                </div>
                <div style={{ opacity: 0.8, marginTop: 6 }}>{p?.email || ""}</div>
                {p?.company ? <div style={{ opacity: 0.8, marginTop: 4 }}>{p.company}</div> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

const pill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  fontSize: 12,
  opacity: 0.95,
  color: "#EAF0FF",
};

const searchStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
  outline: "none",
  minWidth: 260,
};

const btnGhost = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  fontWeight: 800,
};

const card = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 14,
  background: "rgba(255,255,255,0.03)",
};

const errorBox = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,120,120,0.35)",
  background: "rgba(255,120,120,0.10)",
  color: "#FFD7D7",
};