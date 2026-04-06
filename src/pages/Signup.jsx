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

  /* ---------------- INVITE LOAD ---------------- */
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

        setInviteInfo(data.invite);

        setForm((prev) => ({
          ...prev,
          email: data.invite.email || prev.email,
        }));
      } catch (err) {
        setError("Could not load invite.");
      } finally {
        setInviteLoading(false);
      }
    })();
  }, [inviteToken]);

  /* ===================================================== */
  /* 🚀 PUBLIC FREE TRIAL SIGNUP */
  /* ===================================================== */
  if (!isInvite) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.brand}>Start Your Free Trial</div>
          <div style={styles.brandSub}>
            Get full access to Atlas Revenue AI for 7 days
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);

              try {
                const res = await fetch(`${API_BASE}/api/auth/signup`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form),
                });

                const data = await res.json();

                if (!res.ok || !data?.ok) {
                  throw new Error(data?.message || "Signup failed");
                }

                /* ✅ IMPORTANT: match your auth system */
                if (data.token) {
                  localStorage.setItem("butler_token", data.token);
                }

                /* redirect into app */
                window.location.href = "/command-center";
              } catch (err) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            style={styles.form}
          >
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

            <button style={styles.btn}>
              {loading ? "Starting Trial..." : "Start Free Trial"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ===================================================== */
  /* 🔐 INVITE FLOW (UNCHANGED BUT CLEANED) */
  /* ===================================================== */
  async function onSubmit(e) {
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
        throw new Error(data?.message || "Invite failed");
      }

      nav(`/login?email=${encodeURIComponent(form.email)}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>Activate Your Access</div>

        <form onSubmit={onSubmit} style={styles.form}>
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

          <button style={styles.btn}>
            {loading ? "Activating..." : "Activate Access"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===================================================== */
/* 🎨 STYLES (UNCHANGED CORE) */
/* ===================================================== */

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#050916",
  },
  card: {
    width: 400,
    padding: 24,
    borderRadius: 20,
    background: "#0b1228",
    color: "#fff",
  },
  brand: {
    fontSize: 24,
    fontWeight: 900,
  },
  brandSub: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  form: {
    display: "grid",
    gap: 10,
  },
  input: {
    height: 45,
    borderRadius: 10,
    padding: "0 12px",
  },
  btn: {
    height: 48,
    borderRadius: 12,
    background: "#3b82f6",
    color: "#fff",
    fontWeight: 900,
  },
  errBox: {
    color: "#ff6b6b",
    fontSize: 13,
  },
};