// frontend/src/pages/AcceptInvite.jsx
import React, { useEffect, useMemo, useState } from "react";
import { acceptInvite, getInvite } from "../api";
import { useSearchParams } from "react-router-dom";

const safe = (v) => (v == null ? "" : String(v));

const roleTone = (role) => {
  const r = safe(role).toLowerCase();
  if (r === "owner") return "#22C55E";
  if (r === "admin") return "#38BDF8";
  if (r === "manager") return "#F59E0B";
  if (r === "analyst") return "#A78BFA";
  return "#A3A3A3";
};

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [invite, setInvite] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setErr("");
      setLoading(true);

      try {
        const data = await getInvite(token);
        setInvite(data?.invite || data);
      } catch {
        // ignore on purpose
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  async function onAccept() {
    setErr("");
    setOk(false);

    try {
      setAccepting(true);
      await acceptInvite(token);
      setOk(true);
    } catch (e) {
      setErr(e?.message || "Accept failed");
    } finally {
      setAccepting(false);
    }
  }

  const executiveSummary = useMemo(() => {
    if (!token) {
      return "No invite token was detected in the URL. Atlas cannot validate or accept an invite without a valid token.";
    }

    if (ok) {
      return "Your Atlas workspace invite has been accepted successfully. You can now sign in and access the workspace based on the permissions attached to this invite.";
    }

    if (invite?.email) {
      return `Atlas has detected an invite for ${invite.email}. This invite is configured for the ${safe(
        invite.role || "—"
      )} role. Accepting it will connect your account to the invited workspace context.`;
    }

    if (loading) {
      return "Atlas is validating your invite token and loading available invite details.";
    }

    return "Atlas detected an invite token, but invite details could not be fully resolved. You can still attempt to accept the invite if the token is valid.";
  }, [token, invite, ok, loading]);

  const S = {
    page: {
      minHeight: "100vh",
      padding: "26px 26px 40px",
      color: "#EAF0FF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    bgGlow: {
      position: "fixed",
      inset: 0,
      zIndex: -1,
      background:
        "radial-gradient(1200px 700px at 15% 15%, rgba(124,92,255,0.25), transparent 60%), radial-gradient(1000px 650px at 85% 30%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 650px at 50% 90%, rgba(34,197,94,0.10), transparent 60%), linear-gradient(180deg, rgba(5,8,18,1) 0%, rgba(7,12,28,1) 55%, rgba(5,8,18,1) 100%)",
    },
    shell: {
      width: "min(760px, 96vw)",
      display: "grid",
      gap: 14,
    },
    card: {
      borderRadius: 18,
      padding: 18,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(10, 16, 35, 0.55)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    },
    heroCard: {
      borderRadius: 18,
      padding: 18,
      border: "1px solid rgba(255,255,255,0.08)",
      background:
        "linear-gradient(135deg, rgba(124,92,255,0.16), rgba(56,189,248,0.10), rgba(255,255,255,0.03))",
    },
    title: {
      margin: 0,
      fontSize: 30,
      fontWeight: 900,
    },
    sub: {
      marginTop: 8,
      opacity: 0.82,
      fontSize: 14,
      lineHeight: 1.55,
    },
    tag: {
      fontSize: 12,
      fontWeight: 900,
      padding: "6px 10px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.10)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
    },
    btn: {
      borderRadius: 999,
      padding: "10px 16px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      color: "#EAF0FF",
      fontWeight: 900,
      fontSize: 12,
      cursor: "pointer",
    },
    error: {
      borderRadius: 12,
      padding: 12,
      border: "1px solid rgba(255,0,0,0.25)",
      background: "rgba(255,0,0,0.10)",
    },
    success: {
      borderRadius: 12,
      padding: 12,
      border: "1px solid rgba(34,197,94,0.30)",
      background: "rgba(34,197,94,0.12)",
    },
    meta: {
      opacity: 0.85,
      fontSize: 13,
      lineHeight: 1.6,
    },
  };

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />

      <div style={S.shell}>
        <div style={S.heroCard}>
          <h1 style={S.title}>Atlas Invite Acceptance</h1>
          <div style={S.sub}>{executiveSummary}</div>
        </div>

        {!token ? (
          <div style={S.card}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>
              Missing Invite Token
            </div>
            <div style={S.meta}>
              The invite link is incomplete or invalid. Please return to the original invite email and use the full link provided.
            </div>
          </div>
        ) : (
          <>
            <div style={S.card}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <div style={S.tag}>Invite Token Detected</div>
                {invite?.role ? (
                  <div style={{ ...S.tag, color: roleTone(invite.role) }}>
                    Role {safe(invite.role).toUpperCase()}
                  </div>
                ) : null}
                {invite?.status ? (
                  <div style={S.tag}>{safe(invite.status).toUpperCase()}</div>
                ) : null}
              </div>

              {loading ? (
                <div style={S.meta}>Loading invite details…</div>
              ) : invite?.email ? (
                <div style={S.meta}>
                  Invite for <strong>{invite.email}</strong>
                  {invite?.role ? (
                    <>
                      {" • "}Role: <strong>{invite.role}</strong>
                    </>
                  ) : null}
                  {invite?.expiresAt ? (
                    <>
                      <br />
                      Expires: <strong>{new Date(invite.expiresAt).toLocaleString()}</strong>
                    </>
                  ) : null}
                </div>
              ) : (
                <div style={S.meta}>
                  Invite details could not be fully loaded, but you can still attempt acceptance if the token is valid.
                </div>
              )}
            </div>

            {err ? <div style={S.error}>{err}</div> : null}

            {ok ? (
              <div style={S.success}>
                Invite accepted ✅ You can now close this tab and sign in to Atlas.
              </div>
            ) : (
              <div style={S.card}>
                <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>
                  Accept Workspace Invite
                </div>
                <div style={S.meta}>
                  Accepting this invite will attach your account to the target Atlas workspace with the role assigned in the invite.
                </div>

                <div style={{ marginTop: 14 }}>
                  <button onClick={onAccept} disabled={accepting} style={S.btn}>
                    {accepting ? "Accepting..." : "Accept Invite"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}