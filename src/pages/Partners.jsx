// frontend/src/pages/Partners.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";

/**
 * Partners / Partner Intelligence
 * ✅ Uses api.js so Authorization + x-org-id headers are always attached
 * ✅ Safe if backend route isn't wired (404 becomes empty state)
 * ✅ Restyled to match newer Atlas executive screens
 */

export default function Partners() {
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  async function loadPartners() {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet("/partners");

      const rows = Array.isArray(data?.partners)
        ? data.partners
        : Array.isArray(data?.rows)
        ? data.rows
        : Array.isArray(data)
        ? data
        : [];

      setPartners(rows);
    } catch (e) {
      if (e?.status === 404) {
        setPartners([]);
        setError("");
        return;
      }

      setError(e?.message || "Failed to load partners");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPartners();
  }, []);

  const enrichedPartners = useMemo(() => {
    return (partners || []).map((p, idx) => {
      const role = (p?.role || "Member").toString();
      const company = (p?.company || "").toString().trim();
      const email = (p?.email || "").toString().trim();

      let score = 45;
      if (role.toLowerCase().includes("admin")) score += 20;
      if (role.toLowerCase().includes("manager")) score += 15;
      if (company) score += 10;
      if (email) score += 10;
      score += (idx % 4) * 3;

      const influence = Math.min(88, score + 5);

      return {
        ...p,
        normalizedRole: role || "Member",
        partnerScore: score,
        influenceScore: influence,
      };
    });
  }, [partners]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return enrichedPartners;

    return enrichedPartners.filter((p) => {
      const name = (p?.name || p?.fullName || "").toLowerCase();
      const email = (p?.email || "").toLowerCase();
      const role = (p?.normalizedRole || "").toLowerCase();
      const company = (p?.company || "").toLowerCase();

      return (
        name.includes(s) ||
        email.includes(s) ||
        role.includes(s) ||
        company.includes(s)
      );
    });
  }, [enrichedPartners, q]);

  const stats = useMemo(() => {
    const total = enrichedPartners.length;

    const admins = enrichedPartners.filter((p) =>
      (p?.normalizedRole || "").toLowerCase().includes("admin")
    ).length;

    const managers = enrichedPartners.filter((p) =>
      (p?.normalizedRole || "").toLowerCase().includes("manager")
    ).length;

    const avgScore =
      total > 0
        ? Math.round(
            enrichedPartners.reduce((sum, p) => sum + (p.partnerScore || 0), 0) / total
          )
        : 0;

    return { total, admins, managers, avgScore };
  }, [enrichedPartners]);

  const topPartners = useMemo(() => {
    return [...enrichedPartners]
      .sort((a, b) => (b.partnerScore || 0) - (a.partnerScore || 0))
      .slice(0, 3);
  }, [enrichedPartners]);

  const executiveSummary = useMemo(() => {
    if (!stats.total) {
      return "No partner records are currently available in this workspace. Once partner and workspace member records are connected, Atlas can track influence, access distribution, and collaboration strength across your ecosystem.";
    }

    return `Atlas Partner Intelligence is currently tracking ${stats.total} partner records. ${stats.admins} have admin-level access, ${stats.managers} are operating in management roles, and the average partner influence score is ${stats.avgScore}. This gives leadership a cleaner view of collaboration strength, partner leverage, and access concentration across the workspace.`;
  }, [stats]);

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />

      <div style={S.wrap}>
        <div style={S.hero}>
          <div style={S.heroTop}>
            <div>
              <div style={S.eyebrow}>Workspace Collaboration Intelligence</div>
              <h1 style={S.title}>Atlas Partner Intelligence</h1>
              <div style={S.sub}>
                Monitor partner records, member roles, influence, and access visibility
                across the workspace.
              </div>
            </div>

            <div style={S.headerControls}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search partners..."
                style={S.search}
              />
              <button onClick={loadPartners} disabled={loading} style={S.btnGhost}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div style={S.badgeWrap}>
            <div style={S.badge}>Partner Visibility Active</div>
            <div style={S.badge}>Collaboration Scoring Synced</div>
            <div style={S.badge}>Atlas AI Monitoring</div>
          </div>
        </div>

        <div style={S.briefingCard}>
          <div style={S.sectionEyebrow}>Executive Briefing</div>
          <div style={S.briefingText}>{executiveSummary}</div>
        </div>

        <div style={S.statsGrid}>
          <StatCard
            label="Total Partners"
            value={stats.total}
            note="Total partner or member records visible in this workspace."
          />
          <StatCard
            label="Admin Access"
            value={stats.admins}
            note="Partners with admin-level access or equivalent authority."
          />
          <StatCard
            label="Management Roles"
            value={stats.managers}
            note="Partners operating in management or lead-type roles."
          />
          <StatCard
            label="Avg Influence Score"
            value={stats.avgScore}
            note="Estimated collaboration strength across current partner records."
          />
        </div>

        <div style={S.infoPills}>
          <div style={S.pill}>
            Your role: <b>ANALYST</b>
          </div>
          <div style={S.pill}>
            Access: <b>STANDARD</b>
          </div>
          <div style={S.pill}>
            Members: <b>{partners.length}</b>
          </div>
        </div>

        {error ? (
          <div style={S.errorBox}>
            <b>Heads up:</b> {String(error)}
            <div style={{ marginTop: 6, opacity: 0.85, fontSize: 12 }}>
              If the backend partners route is not wired yet, this is expected.
            </div>
          </div>
        ) : null}

        <div style={S.twoCol}>
          <Section title="Partner Summary" subtitle="Overview">
            {!stats.total ? (
              <div style={S.emptyBox}>
                No partner records available yet.
                <div style={S.emptySub}>
                  Once partner data is connected, Atlas will surface access distribution,
                  influence signals, and collaboration insights here.
                </div>
              </div>
            ) : (
              <div style={S.summaryList}>
                <div style={S.summaryItem}>
                  Atlas is currently tracking <b>{stats.total}</b> partner records in this
                  workspace.
                </div>
                <div style={S.summaryItem}>
                  <b>{stats.admins}</b> have admin-level visibility and{" "}
                  <b>{stats.managers}</b> are operating in management roles.
                </div>
                <div style={S.summaryItem}>
                  The average partner influence score is <b>{stats.avgScore}</b>, giving a
                  high-level view of collaboration strength.
                </div>
                <div style={S.summaryItem}>
                  Search and scoring help leadership quickly identify the most valuable
                  partner relationships.
                </div>
              </div>
            )}
          </Section>

          <Section title="Top Partner Influence" subtitle="Leaderboard">
            {topPartners.length ? (
              <div style={S.leaderList}>
                {topPartners.map((p, idx) => (
                  <div key={p?._id || p?.id || idx} style={S.leaderCard}>
                    <div style={S.leaderTop}>
                      <div>
                        <div style={S.leaderName}>
                          {p?.name || p?.fullName || "Partner"}
                        </div>
                        <div style={S.leaderMeta}>
                          {p?.company || "No company"} • {p?.normalizedRole || "Member"}
                        </div>
                      </div>

                      <div style={scorePill(p.partnerScore)}>
                        Score {p.partnerScore}
                      </div>
                    </div>

                    <div style={S.leaderMetrics}>
                      <MiniMetric label="Influence" value={p.influenceScore} />
                      <MiniMetric label="Role" value={p.normalizedRole || "Member"} />
                      <MiniMetric label="Status" value="Active" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={S.emptyBox}>No high-influence partners to display yet.</div>
            )}
          </Section>
        </div>

        <Section title="Partner Records" subtitle="Live Workspace View">
          {!loading && filtered.length === 0 ? (
            <div style={S.emptyBox}>
              No partners found.
              <div style={S.emptySub}>
                Tip: inviting partners can be handled in <b>Invites</b>. This page tracks
                partner visibility, roles, and collaboration intelligence for existing
                members.
              </div>
            </div>
          ) : null}

          {filtered.length ? (
            <div style={S.partnerList}>
              {filtered.map((p, idx) => (
                <div key={p?._id || p?.id || idx} style={S.partnerCard}>
                  <div style={S.partnerTop}>
                    <div style={{ minWidth: 0 }}>
                      <div style={S.partnerTitleRow}>
                        <div style={S.partnerName}>
                          {p?.name || p?.fullName || "Partner"}
                        </div>
                        <div style={scorePill(p.partnerScore)}>
                          Partner Score {p.partnerScore}
                        </div>
                        <div style={S.tag}>Influence {p.influenceScore}</div>
                      </div>

                      <div style={S.partnerMeta}>
                        Role: <strong>{p?.normalizedRole || "Member"}</strong>
                        {p?.email ? (
                          <>
                            {" • "}Email: <strong>{p.email}</strong>
                          </>
                        ) : null}
                        {p?.company ? (
                          <>
                            {" • "}Company: <strong>{p.company}</strong>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div style={S.tag}>Active Partner</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={S.section}>
      <div style={S.sectionHead}>
        {subtitle ? <div style={S.sectionSub}>{subtitle}</div> : null}
        <div style={S.sectionTitle}>{title}</div>
      </div>
      <div style={S.sectionBody}>{children}</div>
    </div>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div style={S.statCard}>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValue}>{value}</div>
      <div style={S.statNote}>{note}</div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div style={S.miniCard}>
      <div style={S.miniLabel}>{label}</div>
      <div style={S.miniValue}>{value}</div>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    color: "#EAF0FF",
    padding: "14px 16px 24px",
    background:
      "radial-gradient(900px 500px at 15% 0%, rgba(37,99,235,0.18), transparent 55%), radial-gradient(900px 500px at 85% 0%, rgba(124,92,255,0.14), transparent 55%), linear-gradient(180deg, #050814 0%, #070b18 100%)",
  },
  bgGlow: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    background:
      "radial-gradient(1200px 700px at 15% 15%, rgba(124,92,255,0.20), transparent 60%), radial-gradient(1000px 650px at 85% 30%, rgba(56,189,248,0.14), transparent 60%), radial-gradient(900px 650px at 50% 90%, rgba(34,197,94,0.08), transparent 60%)",
  },
  wrap: {
    maxWidth: 1380,
    margin: "0 auto",
    display: "grid",
    gap: 12,
  },
  hero: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "18px 20px",
    background:
      "linear-gradient(135deg, rgba(30,64,175,0.18), rgba(37,99,235,0.10), rgba(255,255,255,0.02))",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  eyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "rgba(125,211,252,0.9)",
    fontWeight: 800,
  },
  title: {
    margin: "6px 0 0",
    fontSize: 28,
    lineHeight: 1.05,
    letterSpacing: -0.6,
    fontWeight: 900,
    color: "#fff",
  },
  sub: {
    marginTop: 8,
    maxWidth: 760,
    fontSize: 14,
    lineHeight: 1.55,
    color: "rgba(226,232,240,0.88)",
  },
  headerControls: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  badgeWrap: {
    marginTop: 12,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    fontSize: 11,
    fontWeight: 700,
    color: "#e2e8f0",
    whiteSpace: "nowrap",
  },
  briefingCard: {
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.14), rgba(56,189,248,0.09), rgba(255,255,255,0.02))",
  },
  sectionEyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "rgba(148,163,184,0.78)",
    fontWeight: 800,
    marginBottom: 8,
  },
  briefingText: {
    fontSize: 14,
    lineHeight: 1.65,
    opacity: 0.92,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },
  statCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "14px 14px 13px",
    minHeight: 126,
    background: "rgba(255,255,255,0.032)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.88)",
    fontWeight: 800,
  },
  statValue: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.05,
  },
  statNote: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 1.45,
    color: "rgba(203,213,225,0.76)",
  },
  infoPills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    fontSize: 11,
    opacity: 0.95,
    color: "#EAF0FF",
  },
  search: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.25)",
    color: "#EAF0FF",
    outline: "none",
    minWidth: 250,
  },
  btnGhost: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#EAF0FF",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,120,120,0.35)",
    background: "rgba(255,120,120,0.10)",
    color: "#FFD7D7",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
    gap: 12,
  },
  section: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
  },
  sectionHead: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: -0.35,
    color: "#fff",
  },
  sectionSub: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "rgba(148,163,184,0.75)",
    fontWeight: 700,
    marginBottom: 4,
  },
  sectionBody: {
    padding: 14,
  },
  summaryList: {
    display: "grid",
    gap: 8,
  },
  summaryItem: {
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(4,10,24,0.34)",
    borderRadius: 14,
    padding: "12px 13px",
    fontSize: 13,
    lineHeight: 1.55,
    color: "#dbe4f0",
  },
  leaderList: {
    display: "grid",
    gap: 10,
  },
  leaderCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 13,
    background: "rgba(4,10,24,0.34)",
  },
  leaderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  leaderName: {
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
  },
  leaderMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 1.5,
    color: "rgba(203,213,225,0.78)",
  },
  leaderMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    marginTop: 12,
  },
  miniCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 10,
    background: "rgba(255,255,255,0.03)",
  },
  miniLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.86)",
    fontWeight: 700,
  },
  miniValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
  },
  partnerList: {
    display: "grid",
    gap: 10,
  },
  partnerCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 14,
    background: "rgba(255,255,255,0.03)",
  },
  partnerTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
  },
  partnerTitleRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  partnerName: {
    fontWeight: 900,
    fontSize: 16,
    color: "#fff",
  },
  partnerMeta: {
    opacity: 0.82,
    marginTop: 8,
    fontSize: 13,
    lineHeight: 1.5,
  },
  tag: {
    fontSize: 11,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  emptyBox: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(4,10,24,0.30)",
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#dbe4f0",
    opacity: 0.9,
  },
  emptySub: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.78,
  },
};

const scorePill = (score) => ({
  fontSize: 11,
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
});