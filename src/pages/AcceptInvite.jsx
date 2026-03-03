// frontend/src/pages/AcceptInvite.jsx
import React, { useEffect, useState } from "react";
import { acceptInvite, getInvite } from "../api";
import { useSearchParams } from "react-router-dom";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [invite, setInvite] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setErr("");
      try {
        // Optional: if your backend has /invites/:id this might not work with a token.
        // If it fails, it’s fine — accept still works.
        const data = await getInvite(token);
        setInvite(data?.invite || data);
      } catch {
        // ignore
      }
    }
    load();
  }, [token]);

  async function onAccept() {
    setErr("");
    setOk(false);
    try {
      await acceptInvite(token);
      setOk(true);
    } catch (e) {
      setErr(e?.message || "Accept failed");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Accept Invite</h2>

      {!token ? (
        <div>Missing invite token.</div>
      ) : (
        <>
          {invite?.email ? (
            <div style={{ opacity: 0.8, marginBottom: 10 }}>
              Invite for <b>{invite.email}</b> (role: {invite.role || "—"})
            </div>
          ) : null}

          {err ? (
            <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: "rgba(255,0,0,0.08)" }}>
              {err}
            </div>
          ) : null}

          {ok ? (
            <div style={{ padding: 12, borderRadius: 8, background: "rgba(0,255,0,0.08)" }}>
              Invite accepted ✅ You can close this tab and sign in.
            </div>
          ) : (
            <button onClick={onAccept}>Accept Invite</button>
          )}
        </>
      )}
    </div>
  );
}