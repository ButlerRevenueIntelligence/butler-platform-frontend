// frontend/src/pages/ClientDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrgSwitcher from "../components/OrgSwitcher";
import { getClient, updateClient, deleteClient } from "../api";

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

export default function ClientDetail() {
  const nav = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [client, setClient] = useState(null);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const derived = useMemo(() => {
    const hasWebsite = !!safe(website).trim();
    const hasOwner = !!safe(ownerName).trim() || !!safe(ownerEmail).trim();
    const hasIndustry = !!safe(industry).trim();
    const hasNotes = !!safe(notes).trim();

    let engagementScore = 35;
    if (hasWebsite) engagementScore += 20;
    if (hasOwner) engagementScore += 20;
    if (hasIndustry) engagementScore += 10;
    if (hasNotes) engagementScore += 10;

    const expansionProbability = Math.min(
      84,
      46 + (hasWebsite ? 10 : 0) + (hasOwner ? 10 : 0) + (hasNotes ? 8 : 0)
    );

    const accountReadiness = Math.min(
      100,
      (hasWebsite ? 25 : 0) +
        (hasOwner ? 25 : 0) +
        (hasIndustry ? 20 : 0) +
        (hasNotes ? 20 : 0) +
        10
    );

    return {
      domain: domainFromWebsite(website),
      engagementScore,
      expansionProbability,
      accountReadiness,
    };
  }, [website, ownerName, ownerEmail, industry, notes]);

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
      title: { margin: 0, fontSize: 30, fontWeight: 900 },
      sub: { marginTop: 8, opacity: 0.8, fontSize: 14 },
      card,
      heroCard: {
        ...card,
        background:
          "linear-gradient(135deg, rgba(124,92,255,0.16), rgba(56,189,248,0.10), rgba(255,255,255,0.03))",
      },
      input,
      btn,
      btnDanger: { ...btn, border: "1px solid rgba(251,113,133,0.35)" },
      btnGhost: { ...btn, background: "rgba(0,0,0,0.16)" },
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
      error: {
        marginTop: 10,
        borderRadius: 12,
        padding: 12,
        border: "1px solid rgba(255,0,0,0.25)",
        background: "rgba(255,0,0,0.10)",
      },
      label: { fontSize: 12, opacity: 0.75, marginBottom: 6, letterSpacing: 0.6 },
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

  async function load() {
    try {
      setLoading(true);
      setError("");

      const res = await getClient(id);
      const c = res?.client || res;
      setClient(c);

      setName(safe(c?.name));
      setIndustry(safe(c?.industry));
      setWebsite(safe(c?.website));
      setOwnerName(safe(c?.ownerName));
      setOwnerEmail(safe(c?.ownerEmail));
      setNotes(safe(c?.notes));
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to load client");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onSave(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        industry: industry.trim(),
        website: website.trim(),
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim(),
        notes: notes.trim(),
      };

      await updateClient(id, payload);
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to save client");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setError("");
    const ok = window.confirm("Delete this client? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteClient(id);
      nav("/clients");
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to delete client");
    }
  }

  const executiveSummary = !loading
    ? `Atlas Account Intelligence is currently focused on ${
        name || "this account"
      }. The current engagement score is ${derived.engagementScore}, estimated expansion probability is ${
        derived.expansionProbability
      }%, and account readiness is ${derived.accountReadiness}%. ${
        safe(notes).trim()
          ? "Additional account context has been captured in the notes field."
          : "Adding more account notes can improve strategic context and follow-up quality."
      }`
    : "Loading account intelligence profile…";

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />

      <div style={S.topRow}>
        <div>
          <h1 style={S.title}>Atlas Account Profile</h1>
          <div style={S.sub}>
            {client?.name ? <strong>{client.name}</strong> : "Loading account…"}
          </div>
        </div>

        <div style={{ minWidth: 260 }}>
          <OrgSwitcher onSwitched={() => load()} />
        </div>
      </div>

      <div style={S.heroCard}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
          Executive Account Briefing
        </div>
        <div style={{ fontSize: 14, opacity: 0.92, lineHeight: 1.65 }}>
          {executiveSummary}
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div style={S.signalGrid}>
        <div style={S.signalCard}>
          <div style={S.signalLabel}>ENGAGEMENT SCORE</div>
          <div style={S.signalValue}>{derived.engagementScore}</div>
          <div style={S.signalSub}>Estimated account signal quality based on available profile data.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>EXPANSION PROBABILITY</div>
          <div style={S.signalValue}>{derived.expansionProbability}%</div>
          <div style={S.signalSub}>Estimated likelihood of future growth potential within this account.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>ACCOUNT READINESS</div>
          <div style={S.signalValue}>{derived.accountReadiness}%</div>
          <div style={S.signalSub}>How complete this account record is for revenue intelligence use.</div>
        </div>

        <div style={S.signalCard}>
          <div style={S.signalLabel}>DOMAIN</div>
          <div style={{ ...S.signalValue, fontSize: 22 }}>
            {derived.domain || "—"}
          </div>
          <div style={S.signalSub}>Resolved account domain from the website field.</div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div style={S.card}>
        {loading ? (
          <div style={{ opacity: 0.85 }}>Loading…</div>
        ) : (
          <form onSubmit={onSave}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <div style={S.scorePill(derived.engagementScore)}>
                Engagement {derived.engagementScore}
              </div>
              <div style={S.tag}>Expansion {derived.expansionProbability}%</div>
              <div style={S.tag}>Readiness {derived.accountReadiness}%</div>
            </div>

            <div style={S.grid3}>
              <div>
                <div style={S.label}>Client Name *</div>
                <input style={S.input} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <div style={S.label}>Industry</div>
                <input style={S.input} value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </div>
              <div>
                <div style={S.label}>Website</div>
                <input
                  style={S.input}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div style={S.grid2}>
              <div>
                <div style={S.label}>Owner Name</div>
                <input style={S.input} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div>
              <div>
                <div style={S.label}>Owner Email</div>
                <input style={S.input} value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div>
              <div style={S.label}>Notes</div>
              <textarea
                style={{ ...S.input, minHeight: 110, resize: "vertical" }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ height: 14 }} />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="submit" style={S.btn} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button type="button" style={S.btnGhost} onClick={() => nav("/clients")}>
                Back to Accounts
              </button>

              <button type="button" style={S.btnDanger} onClick={onDelete}>
                Delete Account
              </button>
            </div>

            {error ? <div style={S.error}>{error}</div> : null}
          </form>
        )}
      </div>
    </div>
  );
}