import React, { useEffect, useState } from "react";
import { getIntegrations } from "../api";

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

export default function Integrations() {
  const [integrations, setIntegrations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getIntegrations();

        const map = {};
        (data || []).forEach((i) => {
          map[i.id] = i;
        });

        setIntegrations(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div
      style={{
        padding: 28,
        maxWidth: 1300,
        margin: "0 auto",
        color: "#fff",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>
          Atlas Data Connectors
        </h1>

        <div
          style={{
            fontSize: 14,
            color: "rgba(226,232,240,0.7)",
          }}
        >
          Connect your revenue stack so Atlas can model pipeline, forecast
          revenue, and detect growth signals.
        </div>
      </div>

      {loading && (
        <div style={{ opacity: 0.7 }}>Loading connectors...</div>
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
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                {c.name}
              </div>

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
                  marginBottom: 6,
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

              {live?.lastSync && (
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.6,
                    marginBottom: 12,
                  }}
                >
                  Last sync: {live.lastSync}
                </div>
              )}

              <button
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {status === "connected" ? "Manage" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}