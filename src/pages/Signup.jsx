import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signup, acceptInvite } from "../api";

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
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/invites/${inviteToken}`
        );
        const data = await res.json();

        if (!res.ok || !data?.ok || !data?.invite) {
          setInviteInfo(null);
          setError(data?.message || "Invite link is invalid or expired.");
          return;
        }

        setInviteInfo(data.invite);

        setForm((prev) => ({
          ...prev,
          email: data.invite.email || prev.email,
        }));
      } catch {
        setError("Could not load invite.");
      } finally {
        setInviteLoading(false);
      }
    })();
  }, [inviteToken]);

  async function handlePublicSignup(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      localStorage.setItem("atlas_onboarded", "false");
      nav("/welcome", { replace: true });
    } catch (err) {
      setError(err?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteSignup(e) {
    e.preventDefault();
    setError("");

    if (!inviteInfo) {
      setError("Invite invalid.");
      return;
    }

    if (!form.name.trim()) {
      setError("Enter your name.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await acceptInvite(inviteToken, {
        name: form.name.trim(),
        password: form.password,
      });

      nav(`/login?email=${encodeURIComponent(form.email)}`, { replace: true });
    } catch (err) {
      setError(err?.message || "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  if (!isInvite) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.brand}>Start Your Free Trial</div>
          <div style={styles.brandSub}>
            Get full access to Atlas Revenue AI for 7 days
          </div>

          <form onSubmit={handlePublicSignup} style={styles.form}>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={onChange}
              style={styles.input}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              style={styles.input}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              style={styles.input}
              required
            />

            {error && <div style={styles.errBox}>{error}</div>}

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Starting Trial..." : "Start Free Trial"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>Activate Your Access</div>
        <div style={styles.brandSub}>
          {inviteLoading ? "Loading invite..." : "Complete your invited setup"}
        </div>

        <form onSubmit={handleInviteSignup} style={styles.form}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={onChange}
            style={styles.input}
            required
          />

          <input
            name="email"
            value={form.email}
            readOnly
            style={styles.input}
          />

          <input
            name="password"
            type="password"
            placeholder="Create Password"
            value={form.password}
            onChange={onChange}
            style={styles.input}
            required
          />

          {error && <div style={styles.errBox}>{error}</div>}

          <button type="submit" style={styles.btn} disabled={loading || inviteLoading || !inviteInfo}>
            {loading ? "Activating..." : "Activate Access"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#050916",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 24,
    borderRadius: 20,
    background: "#0b1228",
    color: "#fff",
    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
  },
  brand: {
    fontSize: 24,
    fontWeight: 900,
  },
  brandSub: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    marginTop: 6,
  },
  form: {
    display: "grid",
    gap: 10,
  },
  input: {
    height: 45,
    borderRadius: 10,
    padding: "0 12px",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  btn: {
    height: 48,
    borderRadius: 12,
    background: "#3b82f6",
    color: "#fff",
    fontWeight: 900,
    border: "none",
    cursor: "pointer",
  },
  errBox: {
    color: "#ff6b6b",
    fontSize: 13,
  },
};