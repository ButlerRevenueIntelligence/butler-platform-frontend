import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Signup() {
  const nav = useNavigate();
  const query = useQuery();

  const inviteToken = query.get("token") || query.get("invite");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteInfo, setInviteInfo] = useState(null);

  const isInvite = Boolean(inviteToken);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (!inviteToken) return;

    (async () => {
      setInviteLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/api/invites/${inviteToken}`);
        const data = await res.json();

        if (!res.ok || !data?.ok || !data?.invite) {
          setInviteInfo(null);
          setError(data?.message || "Invite link is invalid or expired.");
          return;
        }

        const invite = data.invite;
        setInviteInfo(invite);

        setForm((prev) => ({
          ...prev,
          email: invite?.email || prev.email,
        }));
      } catch (err) {
        setInviteInfo(null);
        setError("Could not load invite. Please try again.");
      } finally {
        setInviteLoading(false);
      }
    })();
  }, [inviteToken]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isInvite) {
      setError("Account creation is invite-only.");
      return;
    }

    if (!inviteInfo) {
      setError("Invite link is invalid or expired.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/invites/${inviteToken}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Invite accept failed.");
      }

      nav(
        `/login?email=${encodeURIComponent(form.email)}${
          inviteToken ? `&invite=${encodeURIComponent(inviteToken)}` : ""
        }`,
        { replace: true }
      );
    } catch (err) {
      setError(err?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!isInvite) {
    return (
      <div style={styles.page} className="atlas-signup-page">
        <div style={styles.bgGlowA} />
        <div style={styles.bgGlowB} />
        <div style={styles.gridLines} />
        <div style={styles.network} />

        <div style={styles.shellSingle}>
          <div style={styles.card} className="atlas-signup-card">
            <div style={styles.cardTop}>
              <div>
                <div style={styles.brand}>Atlas Revenue AI</div>
                <div style={styles.brandSub}>Private workspace onboarding</div>
              </div>
              <div style={styles.livePill}>Invite Only</div>
            </div>

            <div style={styles.lockTitle}>Access is controlled.</div>
            <div style={styles.lockText}>
              Atlas accounts are only created after a live demo, approved billing,
              and workspace approval. Public signup is disabled.
            </div>

            <div style={styles.infoBox}>
              To access the platform, your team must first:
              <div style={styles.infoList}>
                <div>• complete a demo</div>
                <div>• approve billing</div>
                <div>• receive a workspace invite</div>
              </div>
            </div>

            <a
              href="mailto:admin@butlerco.com?subject=Atlas%20Revenue%20AI%20Demo%20Request"
              style={styles.btnLink}
            >
              Request a Demo
            </a>

            <button style={styles.secondaryBtn} onClick={() => nav("/login")}>
              Back to Login
            </button>
          </div>
        </div>

        <style>{responsiveCss}</style>
      </div>
    );
  }

  return (
    <div style={styles.page} className="atlas-signup-page">
      <div style={styles.bgGlowA} />
      <div style={styles.bgGlowB} />
      <div style={styles.gridLines} />
      <div style={styles.network} />

      <div style={styles.shell} className="atlas-signup-shell">
        <div style={styles.heroSide}>
          <div style={styles.heroBadge}>Invite Accepted</div>

          <div style={styles.brandBlock}>
            <div>
              <div style={styles.heroBrand}>Atlas Revenue AI</div>
              <div style={styles.heroSubBrand}>
                Revenue Intelligence Operating System
              </div>
            </div>
          </div>

          <h1 style={styles.heroTitle} className="atlas-signup-title">
            Activate your workspace access.
          </h1>

          <div style={styles.heroText} className="atlas-signup-text">
            Your account is being created through a private invite. Complete setup
            below to access your Atlas workspace.
          </div>

          {inviteInfo ? (
            <div style={styles.featureList}>
              <div style={styles.featurePill}>
                Invited Email: {inviteInfo.email || "—"}
              </div>
              {inviteInfo.orgName ? (
                <div style={styles.featurePill}>Workspace: {inviteInfo.orgName}</div>
              ) : null}
              {inviteInfo.role || inviteInfo.accessLevel ? (
                <div style={styles.featurePill}>
                  Access: {inviteInfo.role || inviteInfo.accessLevel}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div style={styles.card} className="atlas-signup-card">
          <div style={styles.cardTop}>
            <div>
              <div style={styles.brand}>Create your access</div>
              <div style={styles.brandSub}>
                {inviteLoading ? "Loading invite…" : "Complete your invite setup"}
              </div>
            </div>

            <div style={styles.livePill}>Secure Setup</div>
          </div>

          <form onSubmit={onSubmit} style={styles.form}>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Full Name</label>
              <input
                className="atlas-signup-input"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your full name"
                autoComplete="name"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>Email</label>
              <input
                className="atlas-signup-input"
                name="email"
                type="email"
                value={form.email}
                readOnly
                required
                autoComplete="email"
                style={{
                  ...styles.input,
                  opacity: 0.88,
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>Password</label>
              <input
                className="atlas-signup-input"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Create your password"
                autoComplete="new-password"
                required
                style={styles.input}
              />
            </div>

            {error ? (
              <div style={styles.errBox}>
                <b style={{ display: "block", marginBottom: 4 }}>Couldn’t create access</b>
                <span style={{ opacity: 0.9 }}>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading || inviteLoading || !inviteInfo}
              style={styles.btn}
              className="atlas-signup-button"
            >
              {loading ? "Activating…" : "Activate Access"}
            </button>

            <div style={styles.bottomRow}>
              Already activated?{" "}
              <button
                type="button"
                onClick={() =>
                  nav(
                    `/login?email=${encodeURIComponent(form.email)}${
                      inviteToken ? `&invite=${encodeURIComponent(inviteToken)}` : ""
                    }`
                  )
                }
                style={styles.inlineLinkBtn}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{responsiveCss}</style>
    </div>
  );
}

const responsiveCss = `
  @keyframes floatNetwork {
    from { transform: translateY(0px); }
    to { transform: translateY(-200px); }
  }

  @media (max-width: 980px) {
    .atlas-signup-shell {
      grid-template-columns: 1fr !important;
      gap: 24px !important;
    }
  }

  @media (max-width: 640px) {
    .atlas-signup-page {
      padding: 18px !important;
    }

    .atlas-signup-title {
      font-size: 40px !important;
      line-height: 1.02 !important;
    }

    .atlas-signup-text {
      font-size: 16px !important;
      line-height: 1.6 !important;
    }

    .atlas-signup-card {
      max-width: 100% !important;
      justify-self: stretch !important;
    }
  }

  .atlas-signup-input:focus {
    border: 1px solid #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important;
  }

  .atlas-signup-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 44px rgba(59,130,246,0.40);
  }
`;

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
  shellSingle: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 520,
    display: "grid",
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
  lockTitle: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.08,
  },
  lockText: {
    marginTop: 12,
    fontSize: 15,
    color: "rgba(220,232,255,0.82)",
    lineHeight: 1.7,
  },
  infoBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(220,232,255,0.84)",
    fontSize: 14,
    lineHeight: 1.65,
  },
  infoList: {
    marginTop: 10,
    display: "grid",
    gap: 4,
    fontSize: 13,
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
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnLink: {
    height: 52,
    borderRadius: 14,
    border: "1px solid rgba(120,180,255,0.30)",
    background: "linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 18,
    cursor: "pointer",
    marginTop: 18,
    boxShadow: "0 14px 40px rgba(59,130,246,0.35)",
    transition: "all 0.2s ease",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 10,
    width: "100%",
  },
  bottomRow: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(210,225,255,0.82)",
  },
  inlineLinkBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    padding: 0,
    fontSize: 13,
  },
  errBox: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,120,120,0.35)",
    background: "rgba(80,10,10,0.25)",
    color: "rgba(255,220,220,0.92)",
  },
};