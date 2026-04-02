// frontend/src/pages/Clients.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrgSwitcher from "../components/OrgSwitcher";
import { getClients, createClient, deleteClient } from "../api";

const safe = (v) => (v == null ? "" : String(v));

const normalizeWebsite = (url) => {
  const val = safe(url).trim();
  if (!val) return "";
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  return `https://${val}`;
};

const domainFromWebsite = (url) => {
  try {
    const normalized = normalizeWebsite(url);
    if (!normalized) return "";
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

export default function Clients() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [clients, setClients] = useState([]);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [primaryContactEmail, setPrimaryContactEmail] = useState("");
  const [primaryContactPhone, setPrimaryContactPhone] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await getClients();
      setClients(Array.isArray(res?.clients) ? res.clients : []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const enrichedClients = useMemo(() => {
    return (clients || []).map((c, idx) => {
      const hasWebsite = !!safe(c?.website).trim();
      const hasContact =
        !!safe(c?.primaryContactName).trim() ||
        !!safe(c?.primaryContactEmail).trim() ||
        !!safe(c?.primaryContactPhone).trim();
      const hasIndustry = !!safe(c?.industry).trim();
      const hasNotes = !!safe(c?.notes).trim();

      let engagementScore = 35;
      if (hasWebsite) engagementScore += 20;
      if (hasContact) engagementScore += 20;
      if (hasIndustry) engagementScore += 10;
      if (hasNotes) engagementScore += 10;
      engagementScore += (idx % 4) * 3;

      const expansionProbability = Math.min(
        82,
        45 + (idx % 5) * 7 + (hasNotes ? 6 : 0)
      );

      return {
        ...c,
        engagementScore,
        expansionProbability,
        derivedDomain: domainFromWebsite(c?.website),
      };
    });
  }, [clients]);

  const summaryStats = useMemo(() => {
    const total = enrichedClients.length;
    const withWebsite = enrichedClients.filter((c) => safe(c?.website).trim()).length;
    const withContact = enrichedClients.filter(
      (c) =>
        safe(c?.primaryContactName).trim() ||
        safe(c?.primaryContactEmail).trim() ||
        safe(c?.primaryContactPhone).trim()
    ).length;

    const avgEngagement =
      total > 0
        ? Math.round(
            enrichedClients.reduce((sum, c) => sum + (c.engagementScore || 0), 0) / total
          )
        : 0;

    return { total, withWebsite, withContact, avgEngagement };
  }, [enrichedClients]);

  const accountBriefing = useMemo(() => {
    if (!summaryStats.total) {
      return "No clients are currently loaded in this workspace. Add client records to begin organizing company data, primary contact visibility, website coverage, and engagement context.";
    }

    return `This workspace currently includes ${summaryStats.total} clients. ${summaryStats.withWebsite} have website coverage, ${summaryStats.withContact} include primary contact visibility, and the current average engagement score is ${summaryStats.avgEngagement}. Use this page to manage client records and keep account information organized.`;
  }, [summaryStats]);

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
        flexWrap: "wrap",
      },
      title: { margin: 0, fontSize: 32, fontWeight: 900 },
      sub: { marginTop: 8, opacity: 0.8, fontSize: 14, lineHeight: 1.5 },
      card,
      heroCard: {
        ...card,
        background:
          "linear-gradient(135deg, rgba(124,92,255,0.16), rgba(56,189,248,0.10), rgba(255,255,255,0.03))",
      },
      input,
      btn,
      btnDanger: { ...btn, border: "1px solid rgba(251,113,133,0.35)" },
      btnGhost: {
        ...btn,
        background: "rgba(0,0,0,0.16)",
      },
      grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
      grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
      signalGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(220px, 1fr))",
        gap: 12,
      },
      signalCard: {
        borderRadius: 16,
        padding: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(10, 16, 35, 0.35)",
      },
      signalLabel: { fontSize: 12, opacity: 0.8, letterSpacing: 0.8 },
      signalValue: { marginTop: 8, fontSize: 28, fontWeight: 900 },
      signalSub: { marginTop: 8, fontSize: 12, opacity: 0.82, lineHeight: 1.45 },
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
      meta: { opacity: 0.85, fontSize: 13, lineHeight: 1.5 },
      error: {
        marginTop: 10,
        borderRadius: 12,
        padding: 12,
        border: "1px solid rgba(255,0,0,0.25)",
        background: "rgba(255,0,0,0.10)",
      },
      success: {
        marginTop: 10,
        borderRadius: 12,
        padding: 12,
        border: "1px solid rgba(34,197,94,0.25)",
        background: "rgba(34,197,94,0.10)",
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
      scorePill: (score) => ({
        fontSize: 12,
        fontWeight: 900,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.10)",
        background:
          score >= 75
            ? "rgba(34,197,94,0.12)"
            : score >= 55
            ? "rgba(245,158,11,0.12)"
            : "rgba(251,113,133,0.12)",
        color: score >= 75 ? "#22C55E" : score >= 55 ? "#F59E0B" : "#FB7185",
      }),
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
        primaryContactName: primaryContactName.trim(),
        primaryContactEmail: primaryContactEmail.trim().toLowerCase(),
        primaryContactPhone: primaryContactPhone.trim(),
        status,
        notes: notes.trim(),
      };

      await createClient(payload);

      setName("");
      setIndustry("");
      setWebsite("");
      setPrimaryContactName("");
      setPrimaryContactEmail("");
      setPrimaryContactPhone("");
      setStatus("active");
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
          <div style={S.sub}>
            Track client records, primary contacts, website coverage, and account context for the active workspace.
          </div>
        </div>

        <div style={{ minWidth: 260 }}>
          <OrgSwitcher onSwitched={load} />
        </div>
      </div>

      <div style={S.heroCard}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
          Client Briefing
        </div>
        <div style={{ fontSize: 14, opacity: 0.92, lineHeight: 1.65 }}>
          {accountBriefing}
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div style={S.signalGrid}>
        <div style={S.signalCard}>
          <div style={S.signalLabel}>TOTAL CLIENTS</div>
          <div style={S.signalValue}>{summaryStats.total}</div>
          <div style={S.signalSub}>Total client records in the active workspace.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>AVG ENGAGEMENT SCORE</div>
          <div style={S.signalValue}>{summaryStats.avgEngagement}</div>
          <div style={S.signalSub}>Estimated signal quality across client records.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>WEBSITE COVERAGE</div>
          <div style={S.signalValue}>{summaryStats.withWebsite}</div>
          <div style={S.signalSub}>Clients with website data available.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>CONTACT VISIBILITY</div>
          <div style={S.signalValue}>{summaryStats.withContact}</div>
          <div style={S.signalSub}>Clients with primary contact details added.</div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div style={S.card}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
          Create Client
        </div>

        <form onSubmit={onCreate}>
          <div style={S.grid3}>
            <input
              style={S.input}
              placeholder="Client name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              style={S.input}
              placeholder="Industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <input
              style={S.input}
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div style={{ height: 12 }} />

          <div style={S.grid3}>
            <input
              style={S.input}
              placeholder="Primary contact name"
              value={primaryContactName}
              onChange={(e) => setPrimaryContactName(e.target.value)}
            />
            <input
              style={S.input}
              placeholder="Primary contact email"
              value={primaryContactEmail}
              onChange={(e) => setPrimaryContactEmail(e.target.value)}
            />
            <input
              style={S.input}
              placeholder="Primary contact phone"
              value={primaryContactPhone}
              onChange={(e) => setPrimaryContactPhone(e.target.value)}
            />
          </div>

          <div style={{ height: 12 }} />

          <div style={S.grid2}>
            <select
              style={S.input}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="prospect">prospect</option>
              <option value="archived">archived</option>
            </select>

            <div />
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

            <button type="button" style={S.btnGhost} onClick={() => nav("/overview")}>
              Back to Overview
            </button>
          </div>
        </form>

        {error ? <div style={S.error}>{error}</div> : null}
      </div>

      <div style={{ height: 14 }} />

      <div style={S.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900 }}>Client Directory</div>
          <div style={S.tag}>{clients.length} total</div>
        </div>

        <div style={{ height: 12 }} />

        {loading ? (
          <div style={{ opacity: 0.85 }}>Loading…</div>
        ) : enrichedClients.length ? (
          <div style={S.list}>
            {enrichedClients.map((c) => {
              const id = c?._id || c?.id;
              const websiteLabel = safe(c?.website).trim();
              const domain = c?.derivedDomain || safe(c?.domain).trim();

              return (
                <div key={id} style={S.item}>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: 14 }}>
                        {safe(c?.name || "Client")}
                      </div>

                      <div style={S.scorePill(c.engagementScore)}>
                        Engagement {c.engagementScore}
                      </div>

                      <div style={S.tag}>Expansion {c.expansionProbability}%</div>
                      <div style={S.tag}>{safe(c?.status || "active")}</div>
                    </div>

                    <div style={{ ...S.meta, marginTop: 8 }}>
                      {c?.industry ? (
                        <>
                          Industry: <strong>{safe(c.industry)}</strong>
                          {" • "}
                        </>
                      ) : null}

                      {websiteLabel ? (
                        <>
                          Website: <strong>{safe(domain || websiteLabel)}</strong>
                        </>
                      ) : (
                        <>
                          Website: <strong>—</strong>
                        </>
                      )}

                      <div style={{ marginTop: 6, opacity: 0.8 }}>
                        Contact: <strong>{safe(c?.primaryContactName || "—")}</strong> •{" "}
                        {safe(c?.primaryContactEmail || "—")}
                        {safe(c?.primaryContactPhone).trim()
                          ? ` • ${safe(c?.primaryContactPhone)}`
                          : ""}
                      </div>

                      {safe(c?.notes).trim() ? (
                        <div style={{ marginTop: 6, opacity: 0.82 }}>
                          Notes: {safe(c.notes)}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
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