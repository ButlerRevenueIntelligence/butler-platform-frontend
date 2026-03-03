import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, createClient } from "../api";

export default function AccountDetail() {
  const { id } = useParams(); // matches /accounts/:id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      // Load account (client used as account container)
      const res = await apiGet(`/clients/${id}`);
      const acc =
        res?.client || res?.data || res;

      if (!acc) {
        throw new Error("Account not found");
      }

      setAccount(acc);

      // Load clients under same org
      const listRes = await apiGet(`/clients?orgId=${id}`);
      const rows =
        listRes?.clients ||
        listRes?.data ||
        listRes ||
        [];

      setClients(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load account.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Loading account…</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Error</h2>
        <p style={{ color: "tomato" }}>{error}</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Account not found</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate(-1)} style={btn}>
        ← Back
      </button>

      <h1>{account.name}</h1>
      <div style={{ opacity: 0.7 }}>
        {account.website || "—"} • {account.industry || "—"}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Clients</h2>
        {clients.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No clients yet.</div>
        ) : (
          clients.map((c) => (
            <div
              key={c._id}
              style={card}
              onClick={() => navigate(`/clients/${c._id}`)}
            >
              <strong>{c.name}</strong>
              <div style={{ opacity: 0.7 }}>
                {c.industry || "—"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const card = {
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
};

const btn = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};