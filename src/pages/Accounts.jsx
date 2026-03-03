// frontend/src/pages/Accounts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import AccountForm from "../components/AccountForm.jsx";
import { getClients, createClient } from "../api";

export default function Accounts() {
  const nav = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");

  async function load() {
    try {
      setLoading(true);
      const res = await getClients();
      const items = Array.isArray(res?.clients) ? res.clients : Array.isArray(res) ? res : [];
      setAccounts(items);
    } catch (e) {
      console.error("Accounts load error:", e);
      alert(e?.message || "Failed to load accounts");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return accounts;

    return accounts.filter((a) => {
      const name = (a?.name || "").toLowerCase();
      const industry = (a?.industry || "").toLowerCase();
      const website = (a?.website || "").toLowerCase();
      return name.includes(s) || industry.includes(s) || website.includes(s);
    });
  }, [accounts, q]);

  async function createAccount(payload) {
    try {
      setCreating(true);

      // AccountForm likely returns: { name, website, industry, ... }
      // Our backend expects the same for Client create.
      const res = await createClient(payload);

      // createClient returns the created client or { ok: true, client: ... } depending on backend
      // so just reload to be safe.
      await load();
      return res;
    } catch (e) {
      console.error("Create account error:", e);
      alert(e?.message || "Failed to create account");
    } finally {
      setCreating(false);
    }
  }

  return (
    <PageShell
      title="Accounts"
      right={
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search accounts..."
          style={searchStyle}
        />
      }
    >
      <AccountForm onSubmit={createAccount} submitting={creating} />

      <div style={{ marginTop: 14 }}>
        {loading ? (
          <div style={muted}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={muted}>No accounts yet. Create your first one above.</div>
        ) : (
          <div style={gridStyle}>
            {filtered.map((a) => (
              <button
                key={a._id || a.id}
                onClick={() => nav(`/accounts/${a._id || a.id}`)}
                style={cardBtnStyle}
              >
                <div style={{ fontWeight: 700, fontSize: 16 }}>{a.name || "Untitled Account"}</div>
                <div style={mutedSmall}>{a.industry || "—"}</div>
                <div style={mutedSmall}>{a.website || ""}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

const muted = { opacity: 0.75 };
const mutedSmall = { opacity: 0.75, fontSize: 12, marginTop: 4 };

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
};

const cardBtnStyle = {
  textAlign: "left",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 14,
  background: "rgba(255,255,255,0.03)",
  color: "inherit",
  cursor: "pointer",
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