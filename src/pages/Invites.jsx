// frontend/src/pages/Invites.jsx
import React, { useEffect, useState } from "react";
import { createInvite, listInvites } from "../api";

export default function Invites() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("analyst");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await listInvites();
      const list = Array.isArray(data?.invites) ? data.invites : Array.isArray(data) ? data : [];
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
      await createInvite({ email: email.trim(), role });
      setEmail("");
      await load();
    } catch (e) {
      setErr(e?.message || "Create invite failed");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Invites</h2>
      <div style={{ opacity: 0.75, marginBottom: 12 }}>
        Create and track user invites for the current workspace.
      </div>

      {err ? (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: "rgba(255,0,0,0.08)" }}>
          {err}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 10, maxWidth: 640 }}>
        <input
          value={email}
          placeholder="person@company.com"
          onChange={(e) => setEmail(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="owner">owner</option>
          <option value="admin">admin</option>
          <option value="analyst">analyst</option>
          <option value="viewer">viewer</option>
        </select>
        <button onClick={onCreate} disabled={!email.trim()}>
          Create Invite
        </button>
      </div>

      <h3 style={{ marginTop: 18 }}>Recent Invites</h3>
      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div>No invites yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 10, maxWidth: 720 }}>
          {items.map((inv) => {
            const id = inv?._id || inv?.id || `${inv.email}-${inv.createdAt}`;
            return (
              <div
                key={id}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ fontWeight: 800 }}>{inv?.email || "—"}</div>
                <div style={{ opacity: 0.8, fontSize: 13, marginTop: 4 }}>
                  Role: {inv?.role || "—"} • Status: {inv?.status || "—"}
                </div>
                {inv?.expiresAt ? (
                  <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                    Expires: {new Date(inv.expiresAt).toLocaleString()}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}