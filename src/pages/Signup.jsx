// frontend/src/pages/Signup.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signup, setToken } from "../api";

const API_BASE = import.meta.env.VITE_API_URL || ""; // e.g. http://localhost:5001

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Signup() {
  const nav = useNavigate();
  const query = useQuery();
  const inviteToken = query.get("token"); // /signup?token=...

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteInfo, setInviteInfo] = useState(null); // { email, orgId, role/accessLevel, expiresAt }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  // If invite token exists, load invite info and lock email
  useEffect(() => {
    if (!inviteToken) return;

    (async () => {
      setInviteLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/api/invites/${inviteToken}`);
        const data = await res.json();

        if (!res.ok || !data?.ok) {
          setError(data?.message || "Invite link is invalid or expired.");
          setInviteInfo(null);
          return;
        }

        setInviteInfo(data.invite);

        // Prefill + lock email to invite email
        setForm((p) => ({
          ...p,
          email: data.invite?.email || p.email,
        }));
      } catch (err) {
        setError("Could not load invite. Please try again.");
        setInviteInfo(null);
      } finally {
        setInviteLoading(false);
      }
    })();
  }, [inviteToken]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // INVITE SIGNUP FLOW
      if (inviteToken) {
        if (form.password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        const res = await fetch(`${API_BASE}/api/invites/${inviteToken}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            password: form.password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data?.ok) {
          throw new Error(data?.message || "Invite accept failed.");
        }

        // Accept endpoint doesn't return a JWT in your current backend,
        // so send them to login.
        nav("/login");
        return;
      }

      // NORMAL SIGNUP FLOW (existing)
      const res = await signup(form);

      // backend might return { token } OR { data: { token } }
      const token = res?.token || res?.data?.token;

      if (token) setToken(token);

      nav("/dashboard");
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const isInvite = Boolean(inviteToken);

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>{isInvite ? "Accept invite" : "Create account"}</h2>

      {isInvite ? (
        <div style={{ marginTop: 8, opacity: 0.85, fontSize: 14 }}>
          {inviteLoading ? "Loading invite..." : inviteInfo ? "You’re creating an account from an invite." : null}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            margin: "12px 0",
            padding: 10,
            borderRadius: 8,
            background: "rgba(255,0,0,0.08)",
          }}
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginTop: 10 }}>
          Name
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            autoComplete="name"
            required
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginTop: 10 }}>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            required
            readOnly={isInvite} // lock email to invite
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              opacity: isInvite ? 0.85 : 1,
              cursor: isInvite ? "not-allowed" : "text",
            }}
          />
        </label>

        <label style={{ display: "block", marginTop: 10 }}>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete={isInvite ? "new-password" : "new-password"}
            required
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading || inviteLoading || (isInvite && !inviteInfo)}
          style={{ width: "100%", marginTop: 14, padding: 12 }}
        >
          {loading ? "Creating..." : isInvite ? "Accept invite" : "Create account"}
        </button>
      </form>

      <div style={{ marginTop: 14 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}