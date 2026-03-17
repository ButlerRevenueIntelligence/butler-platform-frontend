// frontend/src/pages/Workspaces.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyOrgs,
  getActiveOrgId,
  getActiveOrgName,
  getWorkspaces,
  getActiveWorkspace,
  switchWorkspace,
} from "../api";

const ROLE_RANK = {
  owner: 6,
  admin: 5,
  manager: 4,
  analyst: 3,
  member: 2,
  viewer: 1,
  sales: 1,
};

const rankRole = (r) => ROLE_RANK[String(r || "").toLowerCase()] || 0;

function roleTone(role) {
  const rank = rankRole(role);
  if (rank >= 6) return "#22C55E";
  if (rank >= 5) return "#38BDF8";
  if (rank >= 4) return "#F59E0B";
  if (rank >= 3) return "#A78BFA";
  return "#A3A3A3";
}

function scorePill(role) {
  const tone = roleTone(role);

  return {
    fontSize: 11,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    color: tone,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };
}

function Section({ title, subtitle, children }) {
  return (
    <div style={S.section}>
      <div style={S.sectionHead}>
        <div>
          {subtitle ? <div style={S.sectionSub}>{subtitle}</div> : null}
          <div style={S.sectionTitle}>{title}</div>
        </div>
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

function normalizeWorkspaceRow(row) {
  if (!row) return null;

  const workspace = row.workspace || row.org || row.organization || null;

  const orgId =
    workspace?._id ||
    workspace?.id ||
    row.orgId ||
    row.workspaceId ||
    row.id ||
    "";

  if (!orgId) return null;

  return {
    orgId: String(orgId),
    orgName:
      workspace?.name ||
      row.orgName ||
      row.workspaceName ||
      row.name ||
      "Workspace",
    orgSlug: workspace?.slug || row.orgSlug || row.slug || "",
    role: row.role || row.orgRole || row.workspaceRole || "member",
    status:
      row.status ||
      workspace?.status ||
      row.membershipStatus ||
      "active",
    plan: workspace?.plan || row.plan || "",
    billingStatus:
      workspace?.billing?.status || row.billingStatus || "",
  };
}

export default function Workspaces() {
  const nav = useNavigate();

  const [orgsRaw, setOrgsRaw] = useState(() => {
    const stored = getWorkspaces();
    return Array.isArray(stored) ? stored : [];
  });

  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [err, setErr] = useState("");

  const activeOrgId = getActiveOrgId();
  const activeWorkspace = getActiveWorkspace();
  const activeOrgName = getActiveOrgName();

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const stored = getWorkspaces();
      if (Array.isArray(stored) && stored.length) {
        setOrgsRaw(stored);
      }

      const res = await getMyOrgs();
      const rows =
        res?.orgs ||
        res?.data?.orgs ||
        res?.workspaces ||
        res?.data?.workspaces ||
        [];

      if (Array.isArray(rows) && rows.length) {
        setOrgsRaw(rows);
      }
    } catch (e) {
      const stored = getWorkspaces();
      if (Array.isArray(stored) && stored.length) {
        setOrgsRaw(stored);
      } else {
        setErr(e?.message || "Failed to load workspaces");
      }
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
  }, []);

  const orgs = useMemo(() => {
    const normalized = (Array.isArray(orgsRaw) ? orgsRaw : [])
      .map(normalizeWorkspaceRow)
      .filter(Boolean);

    const map = new Map();

    for (const o of normalized) {
      const id = String(o?.orgId || "").trim();
      if (!id) continue;

      const current = map.get(id);
      if (!current) {
        map.set(id, { ...o, orgId: id });
        continue;
      }

      const curRank = rankRole(current.role);
      const nextRank = rankRole(o.role);

      if (nextRank > curRank) {
        map.set(id, { ...current, ...o, orgId: id });
      } else {
        map.set(id, {
          ...o,
          ...current,
          orgId: id,
          orgName: current.orgName || o.orgName,
          orgSlug: current.orgSlug || o.orgSlug,
          status: current.status || o.status,
          plan: current.plan || o.plan,
          billingStatus: current.billingStatus || o.billingStatus,
        });
      }
    }

    const arr = Array.from(map.values());

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

      await switchWorkspace(orgId);
      nav("/command-center", { replace: true });
    } catch (e) {
      setErr(e?.message || "Failed to switch workspace");
    } finally {
      setSwitching(false);
    }
  }

  const activeOrg =
    orgs.find((o) => String(o.orgId) === String(activeOrgId)) ||
    (activeWorkspace
      ? normalizeWorkspaceRow({
          workspace: activeWorkspace,
          role: "member",
          status: "active",
        })
      : null);

  const stats = useMemo(() => {
    const total = orgs.length;
    const owners = orgs.filter(
      (o) => String(o.role || "").toLowerCase() === "owner"
    ).length;
    const admins = orgs.filter(
      (o) => String(o.role || "").toLowerCase() === "admin"
    ).length;
    const managers = orgs.filter(
      (o) => String(o.role || "").toLowerCase() === "manager"
    ).length;

    return { total, owners, admins, managers };
  }, [orgs]);

  const workspaceBriefing = useMemo(() => {
    if (!orgs.length) {
      return "No workspaces are currently available for this user. Once organizations are connected, Global HQ will let you switch environments, review access levels, and manage operating context from one place.";
    }

    if (activeOrg) {
      return `Global HQ is currently tracking ${stats.total} workspace environments. The active workspace is ${activeOrg.orgName || activeOrgName || "Current Workspace"}, where your role is ${activeOrg.role || "member"}. Use this hub to switch organizations, validate access, and manage workspace context.`;
    }

    return `Global HQ is currently tracking ${stats.total} workspace environments. Select a workspace to activate the correct organization context and x-org-id header.`;
  }, [orgs, activeOrg, activeOrgName, stats]);

  const topAccessOrgs = useMemo(() => {
    return [...orgs]
      .sort((a, b) => rankRole(b.role) - rankRole(a.role))
      .slice(0, 3);
  }, [orgs]);

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />

      <div style={S.wrap}>
        <div style={S.hero}>
          <div style={S.heroTop}>
            <div>
              <div style={S.eyebrow}>Organization Command Center</div>
              <h1 style={S.title}>Global HQ</h1>
              <div style={S.sub}>
                Manage organization context, switch workspaces, and control the active
                operating environment across the platform.
              </div>
            </div>

            <div style={S.headerControls}>
              <div style={S.badge}>Workspace Control Active</div>
              <div style={S.badge}>Access Validation Synced</div>
              <div style={S.badge}>Atlas HQ Monitoring</div>

              <div style={{ width: "100%" }} />

              <button
                onClick={load}
                disabled={loading || switching}
                style={{
                  ...S.btn,
                  cursor: loading || switching ? "not-allowed" : "pointer",
                  opacity: loading || switching ? 0.7 : 1,
                }}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        <div style={S.briefingCard}>
          <div style={S.briefingEyebrow}>Workspace Briefing</div>
          <div style={S.briefingBody}>{workspaceBriefing}</div>
        </div>

        <div style={S.statsGrid}>
          <StatCard
            label="Total Workspaces"
            value={stats.total}
            note="Organization environments available to this user."
          />
          <StatCard
            label="Owner Roles"
            value={stats.owners}
            note="Workspaces where this user has owner-level access."
          />
          <StatCard
            label="Admin Roles"
            value={stats.admins}
            note="Workspaces where this user has admin-level access."
          />
          <StatCard
            label="Manager Roles"
            value={stats.managers}
            note="Workspaces where this user has manager-level operating access."
          />
        </div>

        {activeOrg ? (
          <div style={S.currentCard}>
            <div style={S.currentEyebrow}>Current Workspace</div>
            <div style={S.currentTitle}>
              {activeOrg.orgName || activeOrgName || "Workspace"}
            </div>
            <div style={S.currentMeta}>
              Role: <b>{activeOrg.role}</b>
              {activeOrg.orgSlug ? (
                <>
                  {" • "}Slug: <b>{activeOrg.orgSlug}</b>
                </>
              ) : null}
              {activeOrg.plan ? (
                <>
                  {" • "}Plan: <b>{activeOrg.plan}</b>
                </>
              ) : null}
            </div>
            <div style={S.currentSub}>
              This workspace is currently setting the active <b>x-org-id</b> context.
            </div>
          </div>
        ) : null}

        {err ? <div style={S.error}>{err}</div> : null}

        <div style={S.twoCol}>
          <Section title="Workspace Summary" subtitle="Overview">
            {!loading && !orgs.length ? (
              <div style={S.emptyBox}>No workspaces found for this user.</div>
            ) : (
              <div style={S.summaryList}>
                <div style={S.summaryItem}>
                  Atlas is currently tracking <b>{stats.total}</b> workspace environments
                  for this user.
                </div>
                <div style={S.summaryItem}>
                  Access distribution includes <b>{stats.owners}</b> owner roles,{" "}
                  <b>{stats.admins}</b> admin roles, and <b>{stats.managers}</b> manager
                  roles.
                </div>
                <div style={S.summaryItem}>
                  Global HQ ensures the correct organization context is applied before
                  navigating the rest of Atlas.
                </div>
                <div style={S.summaryItem}>
                  Switching here updates the active workspace and the platform’s effective
                  operating scope.
                </div>
              </div>
            )}
          </Section>

          <Section title="Highest Access Workspaces" subtitle="Priority">
            {topAccessOrgs.length ? (
              <div style={S.leaderList}>
                {topAccessOrgs.map((o, idx) => {
                  const isActive = String(o.orgId) === String(activeOrgId);

                  return (
                    <div key={o.orgId || idx} style={S.leaderCard}>
                      <div style={S.leaderTop}>
                        <div>
                          <div style={S.leaderName}>{o.orgName || "Workspace"}</div>
                          <div style={S.leaderMeta}>
                            {o.orgSlug || "No slug"} • {o.status || "active"}
                            {o.plan ? ` • ${o.plan}` : ""}
                          </div>
                        </div>

                        <div style={scorePill(o.role)}>
                          {String(o.role || "member").toUpperCase()}
                        </div>
                      </div>

                      <div style={S.leaderBottom}>
                        <div style={S.tag}>
                          {isActive ? "Active Workspace" : "Available Workspace"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={S.emptyBox}>No workspace access data available yet.</div>
            )}
          </Section>
        </div>

        <Section title="Workspace Directory" subtitle="Organization List">
          {!loading && !orgs.length ? (
            <div style={S.emptyBox}>No workspaces found for this user.</div>
          ) : null}

          <div style={S.list}>
            {orgs.map((o) => {
              const isActive = String(o.orgId) === String(activeOrgId);

              return (
                <button
                  key={o.orgId}
                  onClick={() => onSelect(o.orgId)}
                  disabled={switching}
                  style={{
                    ...S.item,
                    ...(isActive ? S.itemActive : null),
                    cursor: switching ? "not-allowed" : "pointer",
                    opacity: switching ? 0.7 : 1,
                  }}
                >
                  <div style={S.itemTop}>
                    <div style={S.itemLeft}>
                      <div style={S.itemTitle}>{o.orgName || "Workspace"}</div>
                      <div style={S.itemMeta}>
                        Role: <b>{o.role || "member"}</b> • Status:{" "}
                        <b>{o.status || "active"}</b>
                        {o.orgSlug ? (
                          <>
                            {" • "}Slug: <b>{o.orgSlug}</b>
                          </>
                        ) : null}
                        {o.plan ? (
                          <>
                            {" • "}Plan: <b>{o.plan}</b>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div style={S.itemRight}>
                      <div style={scorePill(o.role)}>
                        {String(o.role || "member").toUpperCase()}
                      </div>
                      <div style={S.tag}>
                        {isActive ? "Active Workspace" : "Available Workspace"}
                      </div>
                    </div>
                  </div>

                  <div style={S.itemFoot}>
                    {isActive
                      ? "This workspace is currently selected in localStorage and used by the platform."
                      : "Click to activate this workspace and switch your organization context."}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    padding: "14px 16px 24px",
    color: "#EAF0FF",
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
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    alignContent: "flex-start",
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
  btn: {
    borderRadius: 999,
    padding: "10px 14px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#EAF0FF",
    fontWeight: 900,
    fontSize: 12,
  },
  briefingCard: {
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.14), rgba(56,189,248,0.09), rgba(255,255,255,0.02))",
  },
  briefingEyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "rgba(148,163,184,0.78)",
    fontWeight: 800,
    marginBottom: 8,
  },
  briefingBody: {
    fontSize: 14,
    opacity: 0.92,
    lineHeight: 1.65,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },
  statCard: {
    borderRadius: 16,
    padding: "14px 14px 13px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,16,35,0.40)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
    minHeight: 126,
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
    opacity: 0.78,
    lineHeight: 1.45,
  },
  currentCard: {
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(140,170,255,0.18)",
    background: "rgba(120,160,255,0.10)",
  },
  currentEyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(191,219,254,0.86)",
    fontWeight: 800,
  },
  currentTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: 900,
    color: "#fff",
  },
  currentMeta: {
    marginTop: 8,
    opacity: 0.92,
    fontSize: 13,
    lineHeight: 1.5,
  },
  currentSub: {
    marginTop: 6,
    opacity: 0.78,
    fontSize: 12,
  },
  error: {
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
  leaderBottom: {
    marginTop: 12,
    display: "flex",
    justifyContent: "flex-start",
  },
  list: {
    display: "grid",
    gap: 10,
  },
  item: {
    textAlign: "left",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(140,170,255,0.18)",
    background: "rgba(10,14,28,0.35)",
    color: "rgba(234,240,255,0.92)",
  },
  itemActive: {
    background: "rgba(120,160,255,0.18)",
    border: "1px solid rgba(140,170,255,0.28)",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  itemLeft: {
    minWidth: 0,
  },
  itemRight: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  itemTitle: {
    fontWeight: 900,
    fontSize: 15,
    color: "#fff",
  },
  itemMeta: {
    marginTop: 8,
    opacity: 0.84,
    fontSize: 13,
    lineHeight: 1.5,
  },
  itemFoot: {
    marginTop: 10,
    opacity: 0.75,
    fontSize: 12,
    lineHeight: 1.45,
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
};