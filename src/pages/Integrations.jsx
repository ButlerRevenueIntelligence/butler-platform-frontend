import React, { useEffect, useMemo, useState } from "react";
import {
  getIntegrations,
  connectIntegration,
  disconnectIntegration,
  getActiveOrgName,
} from "../api";

const connectorCatalog = [
  { id: "hubspot", name: "HubSpot CRM", category: "CRM" },
  { id: "salesforce", name: "Salesforce", category: "CRM" },
  { id: "google_ads", name: "Google Ads", category: "Advertising" },
  { id: "meta_ads", name: "Meta Ads", category: "Advertising" },
  { id: "linkedin_ads", name: "LinkedIn Ads", category: "Advertising" },
  { id: "ga4", name: "Google Analytics 4", category: "Analytics" },
  { id: "stripe", name: "Stripe", category: "Payments" },
  { id: "shopify", name: "Shopify", category: "Commerce" },
];

const statusColor = {
  connected: "#22c55e",
  syncing: "#facc15",
  disconnected: "#64748b",
};

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeOrgName, setActiveOrgNameState] = useState(getActiveOrgName());

useEffect(() => {
  setActiveOrgNameState(getActiveOrgName());
}, [loading]);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const data = await getIntegrations();
      const list = Array.isArray(data?.integrations) ? data.integrations : [];

      const map = {};
      list.forEach((i) => {
        map[i.id] = i;
      });

      setIntegrations(map);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load connectors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConnect(id) {
    try {
      setBusyId(id);
      setError("");
      setSuccess("");

      const data = await connectIntegration(id);
      const list = Array.isArray(data?.integrations) ? data.integrations : [];

      const map = {};
      list.forEach((i) => {
        map[i.id] = i;
      });

      setIntegrations(map);
      setSuccess(`${connectorCatalog.find((c) => c.id === id)?.name || id} connected`);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to connect integration");
    } finally {
      setBusyId("");
    }
  }

  async function handleDisconnect(id) {
    try {
      setBusyId(id);
      setError("");
      setSuccess("");

      const data = await disconnectIntegration(id);
      const list = Array.isArray(data?.integrations) ? data.integrations : [];

      const map = {};
      list.forEach((i) => {
        map[i.id] = i;
      });

      setIntegrations(map);
      setSuccess(
        `${connectorCatalog.find((c) => c.id === id)?.name || id} disconnected`
      );
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to disconnect integration");
    } finally {
      setBusyId("");
    }
  }

  const connectedCount = useMemo(() => {
    return Object.values(integrations).filter((i) => i?.status === "connected").length;
  }, [integrations]);

  return (
    <div
      style={{
        padding: 28,
        maxWidth: 1300,
        margin: "0 auto",
        color: "#fff",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(191,219,254,0.82)",
            marginBottom: 8,
          }}
        >
          Data Infrastructure
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
          Atlas Data Connectors
        </h1>

        <div
          style={{
            fontSize: 14,
            color: "rgba(226,232,240,0.7)",
            marginTop: 8,
            lineHeight: 1.6,
            maxWidth: 900,
          }}
        >
          Connect your revenue stack so Atlas can model pipeline, forecast revenue,
          and detect growth signals across your workspace.
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Active Workspace: {activeOrgName || "Unknown"}
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Connected: {connectedCount}
          </div>

          <button
            onClick={load}
            disabled={loading || !!busyId}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: loading || !!busyId ? "not-allowed" : "pointer",
              opacity: loading || !!busyId ? 0.7 : 1,
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            marginBottom: 16,
            borderRadius: 12,
            padding: 12,
            border: "1px solid rgba(255,120,120,0.35)",
            background: "rgba(255,0,0,0.10)",
            color: "#FFD7D7",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          style={{
            marginBottom: 16,
            borderRadius: 12,
            padding: 12,
            border: "1px solid rgba(34,197,94,0.35)",
            background: "rgba(34,197,94,0.10)",
            color: "#DCFCE7",
            fontSize: 14,
          }}
        >
          {success}
        </div>
      ) : null}

      {loading && (
        <div style={{ opacity: 0.7, marginBottom: 16 }}>Loading connectors...</div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
          gap: 20,
        }}
      >
        {connectorCatalog.map((c) => {
          const live = integrations[c.id];
          const status = live?.status || "disconnected";
          const color = statusColor[status] || "#64748b";
          const isConnected = status === "connected";
          const isBusy = busyId === c.id;

          return (
            <div
              key={c.id}
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 20,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
                boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800 }}>{c.name}</div>

              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginBottom: 8,
                }}
              >
                {c.category}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  marginBottom: 8,
                  textTransform: "capitalize",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: color,
                  }}
                />
                {status}
              </div>

              <div
                style={{
                  fontSize: 11,
                  opacity: 0.75,
                  marginBottom: 6,
                  minHeight: 16,
                }}
              >
                {live?.mode ? `Mode: ${live.mode}` : "Mode: demo"}
              </div>

              <div
                style={{
                  fontSize: 11,
                  opacity: 0.6,
                  marginBottom: 14,
                  minHeight: 16,
                }}
              >
                {live?.lastSync ? `Last sync: ${formatDate(live.lastSync)}` : "No sync yet"}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!isConnected ? (
                  <button
                    onClick={() => handleConnect(c.id)}
                    disabled={!!busyId}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: !!busyId ? "not-allowed" : "pointer",
                      opacity: !!busyId ? 0.7 : 1,
                    }}
                  >
                    {isBusy ? "Connecting..." : "Connect"}
                  </button>
                ) : (
                  <>
                    <button
                      disabled
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(34,197,94,0.30)",
                        background: "rgba(34,197,94,0.12)",
                        color: "#DCFCE7",
                        fontWeight: 700,
                        fontSize: 12,
                        opacity: 0.95,
                      }}
                    >
                      Connected
                    </button>

                    <button
                      onClick={() => handleDisconnect(c.id)}
                      disabled={!!busyId}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: !!busyId ? "not-allowed" : "pointer",
                        opacity: !!busyId ? 0.7 : 1,
                      }}
                    >
                      {isBusy ? "Disconnecting..." : "Disconnect"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}