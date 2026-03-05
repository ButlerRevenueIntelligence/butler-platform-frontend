// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";

// Pages
import Dashboard from "./pages/Dashboard.jsx";        // Overview
import RevenueIntel from "./pages/RevenueIntel.jsx";  // Command Center
import Pipeline from "./pages/Pipeline.jsx";          // Deal Room
import Metrics from "./pages/Metrics.jsx";            // Market Signals
import Partners from "./pages/Partners.jsx";

import Clients from "./pages/Clients.jsx";
import ClientDetail from "./pages/ClientDetail.jsx";

import Accounts from "./pages/Accounts.jsx";
import AccountDetail from "./pages/AccountDetail.jsx";

import AcceptInvite from "./pages/AcceptInvite.jsx";
import Invites from "./pages/Invites.jsx";
import Workspaces from "./pages/Workspaces.jsx";

import AppLayout from "./components/AppLayout.jsx";
import RequirePerm from "./components/RequirePerm.jsx";

function isAuthenticated() {
  return !!localStorage.getItem("butler_token");
}

function RequireAuth({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

function RedirectIfAuth({ children }) {
  // ✅ if already logged in, send to Overview
  if (isAuthenticated()) return <Navigate to="/overview" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={
          isAuthenticated() ? (
            <Navigate to="/overview" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* PUBLIC */}
      <Route
        path="/signup"
        element={
          <RedirectIfAuth>
            <Signup />
          </RedirectIfAuth>
        }
      />
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <Login />
          </RedirectIfAuth>
        }
      />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* PROTECTED WRAPPER (Layout + Outlet) */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* ✅ Primary navigation routes (what you want in the UI) */}
        <Route path="/overview" element={<Dashboard />} />

        <Route
          path="/command-center"
          element={<RevenueIntel />}
        />

        <Route
          path="/deal-room"
          element={
            <RequirePerm perm="deal_room.view">
              <Pipeline />
            </RequirePerm>
          }
        />

        <Route path="/market-signals" element={<Metrics />} />

        <Route
          path="/partners"
          element={
            <RequirePerm perm="partners.manage">
              <Partners />
            </RequirePerm>
          }
        />

        {/* Keep existing pages */}
        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="/invites" element={<Invites />} />

        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />

        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />

        {/* ✅ Backward-compatible redirects (so old links still work) */}
        <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
        <Route path="/revenue-intel" element={<Navigate to="/command-center" replace />} />
        <Route path="/pipeline" element={<Navigate to="/deal-room" replace />} />
        <Route path="/metrics" element={<Navigate to="/market-signals" replace />} />
      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated() ? "/overview" : "/login"} replace />
        }
      />
    </Routes>
  );
}