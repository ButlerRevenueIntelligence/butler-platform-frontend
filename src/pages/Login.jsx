// frontend/src/pages/Login.jsx
import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  Link,
  useLocation,
  useSearchParams,
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

// ✅ helper: normalize Mongo ObjectId-ish shapes to string
const oid = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (v.$oid) return v.$oid; // Mongo Extended JSON
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

  // If email comes through search params, prefill
  useEffect(() => {
    const e = params.get("email");
    if (e) setEmail(e);
  }, [params]);

  // Prefill email from query param (if present)
  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  // Optional: if invite token passed, fetch invite and prefill email
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

      // ✅ Token (support multiple shapes)
      const token =
        res?.token ||
        res?.accessToken ||
        res?.data?.token ||
        res?.data?.accessToken ||
        "";

      if (!token) throw new Error("Login succeeded but no token was returned.");

      // ✅ persist token in BOTH app helpers + localStorage
      try {
        setToken(token);
      } catch (_) {}

      localStorage.setItem("token", token);
      localStorage.setItem("butler_token", token);

      // ✅ User
      const user = res?.user || res?.data?.user || null;

      try {
        setUser(user || null);
      } catch (_) {}

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("butler_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("butler_user");
      }

      // ✅ Org context (normalize ObjectId-like shapes)
      const orgIdRaw =
        user?.orgId ||
        user?.activeOrgId ||
        res?.orgId ||
        res?.activeOrgId ||
        res?.workspaceId ||
        res?.data?.orgId ||
        res?.data?.activeOrgId ||
        res?.data?.workspaceId ||
        "";

      const orgId = oid(orgIdRaw);

      // ✅ Org name (optional)
      const orgName =
        user?.orgName ||
        user?.organizationName ||
        user?.company ||
        res?.orgName ||
        res?.workspaceName ||
        res?.data?.orgName ||
        res?.data?.workspaceName ||
        "";

      // ✅ persist org context in BOTH app helpers + localStorage
      if (orgId) {
        try {
          setActiveOrgId(orgId);
        } catch (_) {}
        localStorage.setItem("activeOrgId", orgId);
        localStorage.setItem("butler_active_org_id", orgId);
      }

      if (orgName) {
        try {
          setActiveOrgName(orgName);
        } catch (_) {}
        localStorage.setItem("activeOrgName", orgName);
        localStorage.setItem("butler_active_org_name", orgName);
      }

      // ✅ Go to primary route
      nav("/revenue-intel", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.shell}>
        <div style={styles.brandRow}>
          <div style={styles.logoDot} />
          <div>
            <div style={styles.brand}>Butler Revenue Intelligence</div>
            <div style={styles.brandSub}>
              {prefillLoading ? "Loading invite…" : "Sign in to your workspace"}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            type="email"
            required
            autoComplete="email"
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            type="password"
            required
            autoComplete="current-password"
          />

          {err && (
            <div style={styles.errBox}>
              <b style={{ display: "block", marginBottom: 4 }}>
                Couldn’t sign in
              </b>
              <span style={{ opacity: 0.9 }}>{err}</span>
            </div>
          )}

          <button disabled={loading || prefillLoading} style={styles.btn}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div style={styles.bottomRow}>
            <span style={{ opacity: 0.8 }}>No account?</span>{" "}
            <Link
              to="/signup"
              style={{ color: "rgba(234,240,255,0.92)", fontWeight: 800 }}
            >
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },
  shell: {
    width: "100%",
    maxWidth: 420,
    padding: 18,
    borderRadius: 18,
    background: "rgba(10, 14, 28, 0.55)",
    border: "1px solid rgba(140,170,255,0.16)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
  },
  brandRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  logoDot: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background:
      "radial-gradient(circle at 30% 30%, rgba(120,160,255,0.9), rgba(60,120,255,0.25))",
    border: "1px solid rgba(140,170,255,0.25)",
  },
  brand: { fontWeight: 800, letterSpacing: "-0.01em" },
  brandSub: { fontSize: 12, color: "rgba(210,225,255,0.7)" },
  form: { display: "grid", gap: 10, marginTop: 6 },
  label: { fontSize: 12, color: "rgba(210,225,255,0.72)", fontWeight: 700 },
  input: {
    height: 42,
    borderRadius: 12,
    padding: "0 12px",
    background: "rgba(10,14,28,0.35)",
    border: "1px solid rgba(140,170,255,0.18)",
    outline: "none",
    color: "rgba(234,240,255,0.92)",
  },
  btn: {
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(140,170,255,0.22)",
    background: "rgba(120,160,255,0.22)",
    color: "rgba(234,240,255,0.92)",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 6,
  },
  bottomRow: { marginTop: 8, fontSize: 12, color: "rgba(210,225,255,0.8)" },
  errBox: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,120,120,0.35)",
    background: "rgba(80,10,10,0.25)",
    color: "rgba(255,220,220,0.92)",
  },
};