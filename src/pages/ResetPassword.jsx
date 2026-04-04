import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const nav = useNavigate();
  const query = useQuery();
  const token = query.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSuccess("");

    if (!token) {
      setErr("Reset token is missing.");
      return;
    }

    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, password);
      setSuccess(res?.message || "Password reset successful.");

      setTimeout(() => {
        nav("/login", { replace: true });
      }, 1800);
    } catch (e2) {
      setErr(e2?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgGlowA} />
      <div style={styles.bgGlowB} />

      <div style={styles.card}>
        <div style={styles.badge}>Secure Reset</div>
        <h1 style={styles.title}>Create a new password</h1>
        <div style={styles.sub}>
          Set a new password for your Atlas workspace login.
        </div>

        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.fieldWrap}>
            <label style={styles.label}>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              style={styles.input}
            />
          </div>

          {err ? <div style={styles.errBox}>{err}</div> : null}
          {success ? <div style={styles.successBox}>{success}</div> : null}

          <button disabled={loading} style={styles.btn}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>
            Back to login
          </Link>
        </div>
      </div>
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
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 460,
    padding: 28,
    borderRadius: 24,
    background: "rgba(10,16,40,0.78)",
    border: "1px solid rgba(110,150,255,0.20)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
    color: "#fff",
  },
  badge: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(75,145,255,0.30)",
    background: "rgba(20,32,70,0.45)",
    color: "#8ec5ff",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "18px 0 8px",
    fontSize: 34,
    fontWeight: 900,
  },
  sub: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "rgba(210,225,255,0.78)",
    marginBottom: 18,
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
  },
  btn: {
    height: 50,
    borderRadius: 14,
    border: "1px solid rgba(120,180,255,0.30)",
    background: "linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
    marginTop: 4,
  },
  errBox: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,120,120,0.35)",
    background: "rgba(80,10,10,0.25)",
    color: "rgba(255,220,220,0.92)",
  },
  successBox: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "rgba(34,197,94,0.14)",
    color: "#dcfce7",
  },
  footer: {
    marginTop: 18,
  },
  link: {
    color: "#fff",
    fontWeight: 800,
    textDecoration: "none",
  },
};