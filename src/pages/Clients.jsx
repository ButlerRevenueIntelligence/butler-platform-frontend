// frontend/src/pages/Clients.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrgSwitcher from "../components/OrgSwitcher";
import { getClients, createClient, deleteClient } from "../api";

const safe = (v) => (v == null ? "" : String(v));

export default function Clients() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [clients, setClients] = useState([]);

  // Create form
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await getClients();
      setClients(res?.clients || []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const S = useMemo(() => {
    const card = {
      background: "rgba(10, 16, 35, 0.55)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 18,
      backdropFilter: "blur(10px)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    };

    const input = {
      width: "100%",
      padding: "12px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      color: "#EAF0FF",
      outline: "none",
    };

    const btn = {
      borderRadius: 999,
      padding: "10px 14px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      color: "#EAF0FF",
      fontWeight: 900,
      fontSize: 12,
      cursor: "pointer",
    };

    return {
      page: { minHeight: "100vh", padding: "26px 26px 40px", color: "#EAF0FF" },
      bgGlow: {
        position: "fixed",
        inset: 0,
        zIndex: -1,
        background:
          "radial-gradient(1200px 700px at 15% 15%, rgba(124,92,255,0.25), transparent 60%), radial-gradient(1000px 650px at 85% 30%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 650px at 50% 90%, rgba(34,197,94,0.10), transparent 60%), linear-gradient(180deg, rgba(5,8,18,1) 0%, rgba(7,12,28,1) 55%, rgba(5,8,18,1) 100%)",
      },
      topRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 16,
      },
      title: { margin: 0, fontSize: 32, fontWeight: 900 },
      sub: { marginTop: 8, opacity: 0.8, fontSize: 14 },
      card,
      input,
      btn,
      btnDanger: { ...btn, border: "1px solid rgba(251,113,133,0.35)" },
      grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
      grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
      list: { display: "grid", gap: 12 },
      item: {
        borderRadius: 14,
        padding: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
      },
      meta: { opacity: 0.85, fontSize: 13, lineHeight: 1.35 },
      error: {
        marginTop: 10,
        borderRadius: 12,
        padding: 12,
        border: "1px solid rgba(255,0,0,0.25)",
        background: "rgba(255,0,0,0.10)",
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
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }

    try {
      setCreating(true);

      const payload = {
        name: name.trim(),
        industry: industry.trim(),
        website: website.trim(),
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim(),
        notes: notes.trim(),
      };

      await createClient(payload);

      // reset form
      setName("");
      setIndustry("");
      setWebsite("");
      setOwnerName("");
      setOwnerEmail("");
      setNotes("");

      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2?.message || "Failed to create client");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id) {
    setError("");
    const ok = window.confirm("Delete this client? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteClient(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to delete client");
    }
  }

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />

      <div style={S.topRow}>
        <div>
          <h1 style={S.title}>Clients</h1>
          <div style={S.sub}>Create, edit, and manage client records for the current workspace.</div>
        </div>

        <div style={{ minWidth: 260 }}>
          <OrgSwitcher onSwitched={() => load()} />
        </div>
      </div>

      {/* Create */}
      <div style={S.card}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>Create Client</div>

        <form onSubmit={onCreate}>
          <div style={S.grid3}>
            <input style={S.input} placeholder="Client name *" value={name} onChange={(e) => setName(e.target.value)} />
            <input style={S.input} placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            <input style={S.input} placeholder="Website (https://...)" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          <div style={{ height: 12 }} />

          <div style={S.grid2}>
            <input style={S.input} placeholder="Owner name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            <input style={S.input} placeholder="Owner email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
          </div>

          <div style={{ height: 12 }} />

          <textarea
            style={{ ...S.input, minHeight: 90, resize: "vertical" }}
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div style={{ height: 12 }} />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" style={S.btn} disabled={creating}>
              {creating ? "Creating..." : "Create Client"}
            </button>

            <button type="button" style={S.btn} onClick={() => nav("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </form>

        {error ? <div style={S.error}>{error}</div> : null}
      </div>

      <div style={{ height: 14 }} />

      {/* List */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 900 }}>Client Directory</div>
          <div style={S.tag}>{clients.length} total</div>
        </div>

        <div style={{ height: 12 }} />

        {loading ? (
          <div style={{ opacity: 0.85 }}>Loading…</div>
        ) : clients.length ? (
          <div style={S.list}>
            {clients.map((c) => {
              const id = c?._id || c?.id;
              return (
                <div key={id} style={S.item}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 14 }}>{safe(c?.name || "Client")}</div>
                    <div style={S.meta}>
                      {c?.industry ? <>Industry: <strong>{safe(c.industry)}</strong> • </> : null}
                      {c?.website ? <>Website: <strong>{safe(c.website)}</strong></> : null}
                      <div style={{ marginTop: 6, opacity: 0.8 }}>
                        Owner: <strong>{safe(c?.ownerName || "—")}</strong> • {safe(c?.ownerEmail || "—")}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button style={S.btn} onClick={() => nav(`/clients/${id}`)}>
                      View / Edit
                    </button>
                    <button style={S.btnDanger} onClick={() => onDelete(id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ opacity: 0.85 }}>No clients yet. Create one above.</div>
        )}
      </div>
    </div>
  );
}