import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout, getActiveOrgId, getActiveOrgName, getUser } from "../api";
import { hasPerm } from "../utils/permissions";

const baseLink = {
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: 0.12,
  color: "#EAF0FF",
  padding: "8px 12px",
  borderRadius: 12,
  transition: "all 160ms ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 34,
  lineHeight: 1,
};

const navLinkStyle = ({ isActive }) => ({
  ...baseLink,
  border: isActive
    ? "1px solid rgba(96,165,250,0.42)"
    : "1px solid rgba(255,255,255,0.07)",
  background: isActive
    ? "linear-gradient(180deg, rgba(37,99,235,0.24), rgba(29,78,216,0.18))"
    : "rgba(255,255,255,0.028)",
  boxShadow: isActive
    ? "0 0 0 1px rgba(59,130,246,0.08), 0 6px 18px rgba(37,99,235,0.16)"
    : "none",
});

const pill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.07)",
  background: "rgba(255,255,255,0.035)",
  color: "#EAF0FF",
  fontSize: 11,
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const label = {
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 0.8,
  color: "rgba(226,232,240,0.48)",
  minWidth: 88,
  paddingTop: 8,
};

function NavRow({ title, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr",
        gap: 10,
        alignItems: "start",
      }}
    >
      <div style={label}>{title}</div>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const nav = useNavigate();

  const [permissions, setPermissions] = useState(() => {
    const u = getUser();
    return u?.permissions || u?.perms || [];
  });

  const can = (perm) => !permissions?.length || hasPerm(permissions, perm);

  const orgId = getActiveOrgId();
  const [workspaceLabel, setWorkspaceLabel] = useState(
    () => getActiveOrgName() || orgId || "—"
  );

  useEffect(() => {
    const sync = () => {
      const u = getUser();
      setPermissions(u?.permissions || u?.perms || []);
      setWorkspaceLabel(getActiveOrgName() || getActiveOrgId() || "—");
    };

    sync();

    const onStorage = (e) => {
      if (
        e.key === "butler_user" ||
        e.key === "active_org_id" ||
        e.key === "active_org_name"
      ) {
        sync();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const localTime = useMemo(() => {
    try {
      return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [now]);

  const hqTime = useMemo(() => {
    try {
      return now.toLocaleTimeString([], {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [now]);

  const localTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      return "";
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(900px 460px at 10% 0%, rgba(37,99,235,0.16), transparent 55%), radial-gradient(700px 420px at 85% 0%, rgba(99,102,241,0.10), transparent 55%), linear-gradient(180deg, #060915 0%, #070b18 100%)",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(14px)",
          background: "rgba(6,10,20,0.80)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "10px 18px 10px",
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 3,
                minWidth: 190,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 1000,
                  lineHeight: 1,
                  letterSpacing: -0.35,
                  color: "#F8FAFC",
                }}
              >
                Atlas Revenue AI
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "rgba(226,232,240,0.66)",
                }}
              >
                Revenue Operating System
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <div style={pill}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: "#22c55e",
                    boxShadow: "0 0 8px rgba(34,197,94,0.5)",
                  }}
                />
                <strong>Systems Online</strong>
              </div>

              <div style={pill}>
                Workspace: <strong>{workspaceLabel}</strong>
              </div>

              <div style={pill}>
                HQ (EST): <strong>{hqTime || "—"}</strong>
              </div>

              <div style={pill}>
                Local: <strong>{localTime || "—"}</strong>
                {localTz ? <span style={{ opacity: 0.68 }}>• {localTz}</span> : null}
              </div>

              <button
                onClick={() => {
                  logout();
                  nav("/login");
                }}
                style={{
                  borderRadius: 999,
                  padding: "8px 13px",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#EAF0FF",
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                Logout
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 8,
              padding: 10,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.05)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.012))",
              boxShadow: "0 8px 22px rgba(0,0,0,0.14)",
            }}
          >
            <NavRow title="CORE">
              {can("dashboard.view") && (
                <NavLink to="/overview" style={navLinkStyle}>
                  Overview
                </NavLink>
              )}

              {can("command_center.view") && (
                <NavLink to="/command-center" style={navLinkStyle}>
                  Command Center
                </NavLink>
              )}

              {can("deal_room.view") && (
                <NavLink to="/deal-war-room" style={navLinkStyle}>
                  Deal War Room
                </NavLink>
              )}

              {can("market_signals.view") && (
                <NavLink to="/growth-engine" style={navLinkStyle}>
                  Growth Engine
                </NavLink>
              )}

              {can("clients.view") && (
                <NavLink to="/account-intelligence" style={navLinkStyle}>
                  Account Intelligence
                </NavLink>
              )}
            </NavRow>

            <NavRow title="INTELLIGENCE">
              {can("dashboard.view") && (
                <NavLink to="/data-connectors" style={navLinkStyle}>
                  Data Connectors
                </NavLink>
              )}

              {can("market_signals.view") && (
                <NavLink to="/market-signals" style={navLinkStyle}>
                  Market Signals
                </NavLink>
              )}

              {can("partners.manage") && (
                <NavLink to="/partners" style={navLinkStyle}>
                  Partners
                </NavLink>
              )}

              {can("admin.audit") && (
                <NavLink to="/global-revenue-map" style={navLinkStyle}>
                  Global Revenue Map
                </NavLink>
              )}

              {can("dashboard.view") && (
                <NavLink to="/atlas-ai-operator" style={navLinkStyle}>
                  Atlas AI Operator
                </NavLink>
              )}

              {can("dashboard.view") && (
                <NavLink to="/reports" style={navLinkStyle}>
                  Reports
                </NavLink>
              )}

              {can("dashboard.view") && (
                <NavLink to="/board-mode" style={navLinkStyle}>
                  Board Mode
                </NavLink>
              )}
            </NavRow>

            <NavRow title="LEGACY">
              {can("deal_room.view") && (
                <NavLink to="/deal-room" style={navLinkStyle}>
                  Deal Room
                </NavLink>
              )}

              {can("clients.view") && (
                <NavLink to="/accounts" style={navLinkStyle}>
                  Accounts
                </NavLink>
              )}

              {can("admin.audit") && (
                <NavLink to="/global-hq" style={navLinkStyle}>
                  Global HQ
                </NavLink>
              )}
            </NavRow>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "14px 18px 32px",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}