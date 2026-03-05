// frontend/src/components/AppLayout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  logout,
  getActiveOrgId,
  getActiveOrgName,
  getUser,
} from "../api";
import { hasPerm } from "../utils/permissions";

const linkStyle = ({ isActive }) => ({
  padding: "10px 12px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 12,
  letterSpacing: 0.6,
  color: "#EAF0FF",
  border: isActive
    ? "1px solid rgba(124,92,255,0.55)"
    : "1px solid rgba(255,255,255,0.10)",
  background: isActive
    ? "rgba(124,92,255,0.18)"
    : "rgba(255,255,255,0.04)",
});

const pill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  fontSize: 12,
  opacity: 0.95,
  color: "#EAF0FF",
};

export default function AppLayout() {
  const nav = useNavigate();

  const [permissions, setPermissions] = useState(() => {
    const u = getUser();
    return u?.permissions || u?.perms || [];
  });

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

  // Clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const localTime = useMemo(() => {
    try {
      return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  // ✅ FAIL-OPEN NAV:
  // If perms are missing/empty (common early on), show everything so UI isn't "missing".
  const can = (perm) => {
    if (!Array.isArray(permissions) || permissions.length === 0) return true;
    return hasPerm(permissions, perm);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#070B18" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: 14,
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(7,11,24,0.92)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Left Side */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "grid", lineHeight: 1.1 }}>
              <div style={{ fontWeight: 1000, letterSpacing: 0.8, color: "#EAF0FF" }}>
                Atlas Revenue AI
              </div>
              <div style={{ fontSize: 11, opacity: 0.78, marginTop: 3 }}>
                Global Command Center
              </div>
            </div>

            {/* ✅ Navigation */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {can("dashboard.view") && (
                <NavLink to="/dashboard" style={linkStyle}>
                  Overview
                </NavLink>
              )}

              {can("command_center.view") && (
                <NavLink to="/revenue-intel" style={linkStyle}>
                  Command Center
                </NavLink>
              )}

              {can("deal_room.view") && (
                <NavLink to="/pipeline" style={linkStyle}>
                  Deal Room
                </NavLink>
              )}

              {can("market_signals.view") && (
                <NavLink to="/metrics" style={linkStyle}>
                  Market Signals
                </NavLink>
              )}

              {can("clients.view") && (
                <NavLink to="/clients" style={linkStyle}>
                  Accounts
                </NavLink>
              )}

              {can("partners.manage") && (
                <NavLink to="/partners" style={linkStyle}>
                  Partners
                </NavLink>
              )}

              {can("admin.audit") && (
                <NavLink to="/workspaces" style={linkStyle}>
                  Global HQ
                </NavLink>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={pill}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#22C55E",
                }}
              />
              <span style={{ fontWeight: 900 }}>Systems Online</span>
            </div>

            <div style={pill}>
              Workspace: <b>{workspaceLabel}</b>
            </div>

            <div style={pill}>
              HQ (EST): <b>{hqTime || "—"}</b>
            </div>

            <div style={pill}>
              Local: <b>{localTime || "—"}</b>
              {localTz ? <span> • {localTz}</span> : null}
            </div>

            <button
              onClick={() => {
                logout();
                nav("/login");
              }}
              style={{
                borderRadius: 999,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "#EAF0FF",
                fontWeight: 900,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}