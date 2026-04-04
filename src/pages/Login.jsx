import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import {
  login,
  setToken,
  setUser,
  setActiveOrgId,
  setActiveOrgName,
  getInvite,
} from "../api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const oid = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (v.$oid) return v.$oid;
    if (v.id) return v.id;
    if (v._id) return typeof v._id === "string" ? v._id : v._id?.$oid || "";
    try {
      return String(v);
    } catch {
      return "";
    }
  }
  return "";
};

const decodeJwt = (token) => {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export default function Login() {
  const nav = useNavigate();
  const query = useQuery();
  const [params] = useSearchParams();

  const emailFromQuery = query.get("email");
  const inviteToken = query.get("invite");

  const [email, setEmail] = useState(emailFromQuery || "");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const e = params.get("email");
    if (e) setEmail(e);
  }, [params]);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (!inviteToken) return;

    (async () => {
      setPrefillLoading(true);
      setErr("");

      try {
        const data = await getInvite(inviteToken);
        const ok = data?.ok ?? true;
        const invite = data?.invite ?? data;

        if (!ok || !invite) {
          setErr(data?.message || "Invite link is invalid or expired.");
          return;
        }

        if (invite?.email) setEmail(invite.email);
      } catch (e) {
        setErr(e?.message || "Could not load invite email.");
      } finally {
        setPrefillLoading(false);
      }
    })();
  }, [inviteToken]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await login({ email, password });

      const token =
        res?.token ||
        res?.accessToken ||
        res?.data?.token ||
        res?.data?.accessToken ||
        "";

      if (!token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      try {
        setToken(token);
      } catch (_) {}

      localStorage.setItem("butler_token", token);
      localStorage.setItem("token", token);

      const claims = decodeJwt(token) || {};

      let user = res?.user || res?.data?.user || null;
      const activeWorkspace =
        res?.activeWorkspace || res?.data?.activeWorkspace || null;
      const workspaces = res?.workspaces || res?.data?.workspaces || [];
      const membership = res?.membership || res?.data?.membership || null;

      if (!user) {
        user = {
          id: claims.id || claims.userId || claims.sub || "",
          email,
          role: claims.role || "user",
          plan: claims.plan || claims.tier || claims.subscription || "STANDARD",
          orgId:
            claims.orgId ||
            claims.activeWorkspace ||
            claims.activeOrgId ||
            claims.workspaceId ||
            "",
          orgName:
            claims.orgName ||
            claims.workspaceName ||
            claims.company ||
            "",
          permissions: claims.permissions || claims.perms || [],
        };
      }

      const resolvedWorkspaceId = oid(
        activeWorkspace?._id ||
          activeWorkspace?.id ||
          user?.orgId ||
          res?.orgId ||
          res?.activeOrgId ||
          res?.workspaceId ||
          res?.data?.orgId ||
          res?.data?.activeOrgId ||
          res?.data?.workspaceId ||
          claims?.activeWorkspace ||
          claims?.orgId ||
          claims?.workspaceId ||
          ""
      );

      const resolvedWorkspaceName =
        activeWorkspace?.name ||
        user?.orgName ||
        user?.organizationName ||
        user?.company ||
        res?.orgName ||
        res?.workspaceName ||
        res?.data?.orgName ||
        res?.data?.workspaceName ||
        "";

      const normalizedUser = {
        ...user,
        orgId: resolvedWorkspaceId,
        activeWorkspace: resolvedWorkspaceId,
        orgName: resolvedWorkspaceName,
        workspaceName: resolvedWorkspaceName,
        permissions:
          user?.permissions ||
          user?.perms ||
          membership?.permissions ||
          [],
      };

      try {
        setUser(normalizedUser);
      } catch (_) {}

      localStorage.setItem("butler_user", JSON.stringify(normalizedUser));
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      if (resolvedWorkspaceId) {
        try {
          setActiveOrgId(resolvedWorkspaceId);
        } catch (_) {}

        localStorage.setItem("x-org-id", resolvedWorkspaceId);
        localStorage.setItem("orgId", resolvedWorkspaceId);
        localStorage.setItem("butler_org_id", resolvedWorkspaceId);
        localStorage.setItem("butler_active_org_id", resolvedWorkspaceId);
        localStorage.setItem("activeOrgId", resolvedWorkspaceId);
      }

      if (resolvedWorkspaceName) {
        try {
          setActiveOrgName(resolvedWorkspaceName);
        } catch (_) {}

        localStorage.setItem("butler_active_org_name", resolvedWorkspaceName);
        localStorage.setItem("activeOrgName", resolvedWorkspaceName);
      }

      if (activeWorkspace) {
        localStorage.setItem("activeWorkspace", JSON.stringify(activeWorkspace));
      }

      if (Array.isArray(workspaces)) {
        localStorage.setItem("workspaces", JSON.stringify(workspaces));
      }

      if (membership) {
        localStorage.setItem("membership", JSON.stringify(membership));
      }

      if (!resolvedWorkspaceId) {
        nav("/create-workspace", { replace: true });
        return;
      }

      nav("/command-center", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page} className="atlas-login-page">
      <div style={styles.bgGlowA} />
      <div style={styles.bgGlowB} />
      <div style={styles.gridLines} />
      <div style={styles.network} />

      <div style={styles.shell} className="atlas-login-shell">
        <div style={styles.heroSide}>
          <div style={styles.heroBadge}>Revenue Intelligence Platform</div>

          <div style={styles.brandBlock}>
            <div>
              <div style={styles.heroBrand}>Atlas Revenue AI</div>
              <div style={styles.heroSubBrand}>
                Revenue Intelligence Operating System
              </div>
            </div>
          </div>

          <h1 style={styles.heroTitle} className="atlas-login-title">
            Access your revenue command center.
          </h1>

          <div style={styles.heroText} className="atlas-login-text">
            Monitor pipeline pressure, identify growth opportunities, track market
            signals, and give leadership a clearer path to revenue decisions.
          </div>

          <div style={styles.featureList} className="atlas-feature-list">
            <div style={styles.featurePill}>Command Center</div>
            <div style={styles.featurePill}>Market Signals</div>
            <div style={styles.featurePill}>Deal Intelligence</div>
            <div style={styles.featurePill}>Atlas AI Operator</div>
          </div>
        </div>

        <div style={styles.card} className="atlas-login-card">
          <div style={styles.cardTop}>
            <div>
              <div style={styles.brand}>Atlas Revenue AI</div>
              <div style={styles.brandSub}>
                {prefillLoading ? "Loading invite…" : "Sign in to your workspace"}
              </div>
            </div>

            <div style={styles.livePill}>Secure Access</div>
          </div>

          <form onSubmit={onSubmit} style={styles.form}>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Email</label>
              <input
                className="atlas-login-input"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                type="email"
                required
                autoComplete="email"
              />
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>Password</label>
              <input
                className="atlas-login-input"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>

            <div style={styles.forgotWrap}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            {err && (
              <div style={styles.errBox}>
                <b style={{ display: "block", marginBottom: 4 }}>Couldn’t sign in</b>
                <span style={{ opacity: 0.9 }}>{err}</span>
              </div>
            )}

            <button
              disabled={loading || prefillLoading}
              style={styles.btn}
              className="atlas-login-button"
            >
              {loading ? "Signing in…" : "Access Atlas"}
            </button>

            <div style={styles.accessNote}>
              Atlas access is enabled after a live demo, approved billing setup,
              and workspace invitation.
            </div>

            <div style={styles.bottomRow}>
              <span style={{ opacity: 0.8 }}>Need access?</span>{" "}
              <a
                href="mailto:admin@butlerco.com?subject=Atlas%20Revenue%20AI%20Demo%20Request"
                style={styles.link}
              >
                Request a demo
              </a>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes floatNetwork {
          from { transform: translateY(0px); }
          to { transform: translateY(-200px); }
        }

        @media (max-width: 980px) {
          .atlas-login-shell {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }

        @media (max-width: 640px) {
          .atlas-login-page {
            padding: 18px !important;
          }

          .atlas-login-title {
            font-size: 40px !important;
            line-height: 1.02 !important;
          }

          .atlas-login-text {
            font-size: 16px !important;
            line-height: 1.6 !important;
          }

          .atlas-login-card {
            max-width: 100% !important;
            justify-self: stretch !important;
          }

          .atlas-feature-list {
            gap: 8px !important;
          }
        }

        .atlas-login-input:focus {
          border: 1px solid #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important;
        }

        .atlas-login-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 44px rgba(59,130,246,0.40);
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "linear-gradient(180deg, #040816 0%, #070d1d 48%, #050916 100%)",
  },
  bgGlowA: {
    position: "absolute",
    inset: "auto auto 10% 8%",
    width: 560,
    height: 560,
    borderRadius: "50%",
    background: "rgba(37,99,235,0.22)",
    filter: "blur(120px)",
    pointerEvents: "none",
  },
  bgGlowB: {
    position: "absolute",
    inset: "8% 8% auto auto",
    width: 520,
    height: 520,
    borderRadius: "50%",
    background: "rgba(56,189,248,0.12)",
    filter: "blur(120px)",
    pointerEvents: "none",
  },
  gridLines: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
    backgroundSize: "72px 72px",
    opacity: 0.22,
    pointerEvents: "none",
  },
  network: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(59,130,246,0.16) 2px, transparent 2px),
      radial-gradient(circle at 60% 70%, rgba(56,189,248,0.16) 2px, transparent 2px),
      radial-gradient(circle at 80% 40%, rgba(59,130,246,0.16) 2px, transparent 2px),
      radial-gradient(circle at 40% 80%, rgba(56,189,248,0.16) 2px, transparent 2px),
      radial-gradient(circle at 72% 20%, rgba(96,165,250,0.14) 2px, transparent 2px),
      radial-gradient(circle at 28% 58%, rgba(125,211,252,0.12) 2px, transparent 2px)
    `,
    backgroundSize: "400px 400px",
    opacity: 0.5,
    animation: "floatNetwork 40s linear infinite",
    pointerEvents: "none",
  },
  shell: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 1120,
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 28,
    alignItems: "center",
  },
  heroSide: {
    padding: "20px 8px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "9px 14px",
    borderRadius: 999,
    border: "1px solid rgba(75,145,255,0.30)",
    background: "rgba(20,32,70,0.45)",
    color: "#8ec5ff",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  brandBlock: {
    marginTop: 20,
  },
  heroBrand: {
    fontSize: 26,
    fontWeight: 900,
    color: "#fff",
  },
  heroSubBrand: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(210,225,255,0.72)",
    letterSpacing: "0.02em",
  },
  heroTitle: {
    margin: "22px 0 0",
    fontSize: 54,
    fontWeight: 950,
    lineHeight: 1.02,
    letterSpacing: "-0.04em",
    color: "#fff",
    maxWidth: 620,
  },
  heroText: {
    marginTop: 18,
    maxWidth: 620,
    fontSize: 18,
    lineHeight: 1.7,
    color: "rgba(220,232,255,0.82)",
  },
  featureList: {
    marginTop: 22,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  featurePill: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#dce8ff",
    fontSize: 13,
    fontWeight: 700,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    justifySelf: "end",
    padding: 24,
    borderRadius: 26,
    background: "rgba(10, 16, 40, 0.75)",
    border: "1px solid rgba(110,150,255,0.20)",
    backdropFilter: "blur(20px)",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  livePill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.22)",
    color: "#9ff0b7",
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  brand: {
    fontWeight: 900,
    fontSize: 21,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  brandSub: {
    fontSize: 12,
    color: "rgba(210,225,255,0.72)",
    marginTop: 4,
  },
  form: {
    display: "grid",
    gap: 12,
  },
  fieldWrap: {
    display: "grid",
    gap: 7,
  },
  label: {
    fontSize: 12,
    color: "rgba(210,225,255,0.74)",
    fontWeight: 800,
    letterSpacing: "0.02em",
  },
  input: {
    height: 48,
    borderRadius: 14,
    padding: "0 14px",
    background: "#ffffff",
    border: "1px solid rgba(140,170,255,0.20)",
    outline: "none",
    color: "#0f172a",
    fontSize: 16,
    transition: "all 0.2s ease",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
  },
  forgotWrap: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: -2,
  },
  forgotLink: {
    color: "#93c5fd",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
  },
  btn: {
    height: 52,
    borderRadius: 14,
    border: "1px solid rgba(120,180,255,0.30)",
    background: "linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 18,
    cursor: "pointer",
    marginTop: 6,
    boxShadow: "0 14px 40px rgba(59,130,246,0.35)",
    transition: "all 0.2s ease",
  },
  accessNote: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 1.6,
    color: "rgba(210,225,255,0.72)",
  },
  bottomRow: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(210,225,255,0.82)",
  },
  link: {
    color: "#fff",
    fontWeight: 800,
    textDecoration: "none",
  },
  errBox: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,120,120,0.35)",
    background: "rgba(80,10,10,0.25)",
    color: "rgba(255,220,220,0.92)",
  },
};