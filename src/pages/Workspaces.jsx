// frontend/src/pages/Workspaces.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getActiveOrgId,
  getActiveOrgName,
  getActiveWorkspace,
  getMyOrgs,
  createWorkspace,
  switchWorkspace,
  deleteWorkspace,
  setActiveOrgId,
  setActiveOrgName,
  setActiveWorkspace,
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

function Section({ title, subtitle, children, rightSlot = null }) {
  return (
    <div style={S.section}>
      <div style={S.sectionHead}>
        <div>
          {subtitle ? <div style={S.sectionSub}>{subtitle}</div> : null}
          <div style={S.sectionTitle}>{title}</div>
        </div>
        {rightSlot ? <div>{rightSlot}</div> : null}
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

  const workspace = row.workspace || row.org || row.organization || row || null;

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
      workspace?.accessStatus ||
      row.accessStatus ||
      "active",
    plan: workspace?.plan || row.plan || "",
    billingStatus: workspace?.billing?.status || row.billingStatus || "",
    type: workspace?.type || row.type || "client",
    accessStatus: workspace?.accessStatus || row.accessStatus || "active",
    paymentStatus: workspace?.paymentStatus || row.paymentStatus || "",
  };
}

export default function Workspaces() {
  const [orgsRaw, setOrgsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "client",
    plan: "ENTERPRISE",
    companyWebsite: "",
    industry: "",
  });

  const activeOrgId = getActiveOrgId();
  const activeWorkspace = getActiveWorkspace();
  const activeOrgName = getActiveOrgName();

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const res = await getMyOrgs();
      const rows = Array.isArray(res?.orgs)
        ? res.orgs
        : Array.isArray(res)
        ? res
        : [];

      setOrgsRaw(rows);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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
        map.set(id, { ...o, orgId: id });
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
          type: current.type || o.type,
          accessStatus: current.accessStatus || o.accessStatus,
          paymentStatus: current.paymentStatus || o.paymentStatus,
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
      return "No workspaces are currently available for this user. Once organizations are connected, Global HQ will let you switch environments, review access levels, create new workspaces, and manage operating context from one place.";
    }

    if (activeOrg) {
      return `Global HQ is currently tracking ${stats.total} workspace environments. The active workspace is ${activeOrg.orgName || activeOrgName || "Current Workspace"}, where your role is ${activeOrg.role || "member"}. Use this hub to switch organizations, create new environments, and manage workspace context.`;
    }

    return `Global HQ is currently tracking ${stats.total} workspace environments. Select a workspace to activate the correct organization context and x-org-id header.`;
  }, [orgs, activeOrg, activeOrgName, stats]);

  const topAccessOrgs = useMemo(() => {
    return [...orgs]
      .sort((a, b) => rankRole(b.role) - rankRole(a.role))
      .slice(0, 3);
  }, [orgs]);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreateWorkspace(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setErr("Workspace name is required");
      return;
    }

    try {
      setCreating(true);
      setErr("");
      setSuccess("");

      const newWorkspaceName = form.name.trim();

      const created = await createWorkspace({
        name: newWorkspaceName,
        slug: form.slug.trim() || undefined,
        type: form.type,
        plan: form.plan,
        companyWebsite: form.companyWebsite.trim(),
        industry: form.industry.trim(),
      });

      if (created?.workspace?._id) {
        const switched = await switchWorkspace(created.workspace._id);
        const target = switched?.activeWorkspace || created.workspace;

        if (target?._id) {
          setActiveOrgId(target._id);
        }
        if (target?.name) {
          setActiveOrgName(target.name);
        }
        if (target) {
          setActiveWorkspace(target);
        }
      }

      setForm({
        name: "",
        slug: "",
        type: "client",
        plan: "ENTERPRISE",
        companyWebsite: "",
        industry: "",
      });

      setShowCreate(false);
      setSuccess(`Workspace "${newWorkspaceName}" created and activated`);
      await load();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to create workspace");
    } finally {
      setCreating(false);
    }
  }

  async function onSelect(orgId) {
    try {
      setErr("");
      setSuccess("");
      setSwitchingId(orgId);

      const res = await switchWorkspace(orgId);
      const target = res?.activeWorkspace;

      if (target?._id) setActiveOrgId(target._id);
      if (target?.name) setActiveOrgName(target.name);
      if (target) setActiveWorkspace(target);

      setSuccess(`Switched to ${target?.name || "workspace"}`);
      await load();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to switch workspace");
    } finally {
      setSwitchingId("");
    }
  }

  async function onDelete(org) {
    const confirmed = window.confirm(
      `Delete workspace "${org.orgName}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setErr("");
      setSuccess("");
      setDeletingId(org.orgId);

      await deleteWorkspace(org.orgId);

      setSuccess(`Deleted ${org.orgName}`);
      await load();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to delete workspace");
    } finally {
      setDeletingId("");
    }
  }

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
                Manage organization context, switch workspaces, create new environments,
                and control the active operating environment across the platform.
              </div>
            </div>

            <div style={S.headerControls}>
              <div style={S.badge}>Workspace Control Active</div>
              <div style={S.badge}>Access Validation Synced</div>
              <div style={S.badge}>Atlas HQ Monitoring</div>

              <div style={{ width: "100%" }} />

              <button
                onClick={load}
                disabled={loading || creating || !!switchingId || !!deletingId}
                style={{
                  ...S.btn,
                  cursor:
                    loading || creating || !!switchingId || !!deletingId
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    loading || creating || !!switchingId || !!deletingId
                      ? 0.7
                      : 1,
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

        {err ? <div style={S.error}>{err}</div> : null}
        {success ? <div style={S.success}>{success}</div> : null}

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

        <div style={S.twoCol}>
          <Section title="Workspace Summary" subtitle="Overview">
            {!loading && !orgs.length ? (
              <div style={S.emptyBox}>
                No workspaces found.
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => setShowCreate(true)}
                    style={S.primaryBtn}
                    type="button"
                  >
                    Create Your First Workspace
                  </button>
                </div>
              </div>
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

        <Section
          title="Create Workspace"
          subtitle="Provision New Environment"
          rightSlot={
            <button
              onClick={() => setShowCreate((v) => !v)}
              style={S.secondaryBtn}
              type="button"
            >
              {showCreate ? "Close" : "New Workspace"}
            </button>
          }
        >
          {showCreate && (
            <form onSubmit={handleCreateWorkspace} style={S.formGrid}>
              <div style={S.formGroup}>
                <label style={S.label}>Workspace Name</label>
                <input
                  style={S.input}
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Global Emerging Market Manager (GEMM)"
                />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Custom Slug (optional)</label>
                <input
                  style={S.input}
                  value={form.slug}
                  onChange={(e) => updateForm("slug", e.target.value)}
                  placeholder="gemm"
                />
              </div>

              <div style={S.formRow}>
                <div style={S.formGroup}>
                  <label style={S.label}>Workspace Type</label>
                  <select
                    style={S.input}
                    value={form.type}
                    onChange={(e) => updateForm("type", e.target.value)}
                  >
                    <option value="client">client</option>
                    <option value="agency">agency</option>
                  </select>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Plan</label>
                  <select
                    style={S.input}
                    value={form.plan}
                    onChange={(e) => updateForm("plan", e.target.value)}
                  >
                    <option value="SCALE">SCALE</option>
                    <option value="GROWTH">GROWTH</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Company Website</label>
                <input
                  style={S.input}
                  value={form.companyWebsite}
                  onChange={(e) => updateForm("companyWebsite", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Industry</label>
                <input
                  style={S.input}
                  value={form.industry}
                  onChange={(e) => updateForm("industry", e.target.value)}
                  placeholder="Finance"
                />
              </div>

              <div style={S.formActions}>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    ...S.primaryBtn,
                    opacity: creating ? 0.7 : 1,
                    cursor: creating ? "not-allowed" : "pointer",
                  }}
                >
                  {creating ? "Creating Workspace..." : "Create Workspace"}
                </button>

                <button
                  type="button"
                  style={S.secondaryBtn}
                  onClick={() =>
                    setForm({
                      name: "",
                      slug: "",
                      type: "client",
                      plan: "ENTERPRISE",
                      companyWebsite: "",
                      industry: "",
                    })
                  }
                >
                  Clear
                </button>
              </div>
            </form>
          )}
        </Section>

        <Section title="Workspace Directory" subtitle="Organization List">
          {!loading && !orgs.length ? (
            <div style={S.emptyBox}>
              No workspaces found.
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => setShowCreate(true)}
                  style={S.primaryBtn}
                  type="button"
                >
                  Create Your First Workspace
                </button>
              </div>
            </div>
          ) : null}

          <div style={S.list}>
            {orgs.map((o) => {
              const isActive = String(o.orgId) === String(activeOrgId);
              const isSwitching = switchingId === o.orgId;
              const isDeleting = deletingId === o.orgId;
              const canDelete =
                !isActive && String(o.role || "").toLowerCase() === "owner";

              return (
                <div
                  key={o.orgId}
                  style={{
                    ...S.item,
                    ...(isActive ? S.itemActive : null),
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
                        {o.type ? (
                          <>
                            {" • "}Type: <b>{o.type}</b>
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
                      : "Switch into this workspace or delete it if you own it and no longer need it."}
                  </div>

                  <div style={S.actionRow}>
                    {!isActive ? (
                      <button
                        onClick={() => onSelect(o.orgId)}
                        disabled={!!switchingId || !!deletingId}
                        style={{
                          ...S.primaryBtn,
                          opacity: isSwitching ? 0.7 : 1,
                          cursor:
                            switchingId || deletingId ? "not-allowed" : "pointer",
                        }}
                      >
                        {isSwitching ? "Switching..." : "Switch Workspace"}
                      </button>
                    ) : (
                      <button style={S.activeBtn} disabled>
                        Active Workspace
                      </button>
                    )}

                    {canDelete ? (
                      <button
                        onClick={() => onDelete(o)}
                        disabled={!!switchingId || !!deletingId}
                        style={{
                          ...S.dangerBtn,
                          opacity: isDeleting ? 0.7 : 1,
                          cursor:
                            switchingId || deletingId ? "not-allowed" : "pointer",
                        }}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    ) : null}
                  </div>
                </div>
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
  success: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "rgba(34,197,94,0.10)",
    color: "#DCFCE7",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
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
  formGrid: {
    display: "grid",
    gap: 12,
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  formGroup: {
    display: "grid",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(226,232,240,0.82)",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
  },
  formActions: {
    display: "flex",
    gap: 10,
    marginTop: 6,
    flexWrap: "wrap",
  },
  primaryBtn: {
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 900,
    border: "none",
    background: "linear-gradient(90deg,#2563eb,#38bdf8)",
    color: "#fff",
  },
  secondaryBtn: {
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
  },
  dangerBtn: {
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 900,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.10)",
    color: "#fff",
  },
  activeBtn: {
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 900,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "linear-gradient(90deg,#22c55e,#16a34a)",
    color: "#fff",
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
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  itemActive: {
    background: "rgba(120,160,255,0.18)",
    border: "1px solid rgba(140,170,255,0.35)",
    boxShadow:
      "0 0 0 1px rgba(140,170,255,0.25), 0 8px 30px rgba(37,99,235,0.25)",
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
  actionRow: {
    display: "flex",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
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