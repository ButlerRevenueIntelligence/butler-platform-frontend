// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import RevenueIntel from "./pages/RevenueIntel.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import Metrics from "./pages/Metrics.jsx";
import Clients from "./pages/Clients.jsx";
import ClientDetail from "./pages/ClientDetail.jsx";
import Partners from "./pages/Partners.jsx";
import Workspaces from "./pages/Workspaces.jsx";
import Invites from "./pages/Invites.jsx";
import AcceptInvite from "./pages/AcceptInvite.jsx";

import Accounts from "./pages/Accounts.jsx";
import AccountDetail from "./pages/AccountDetail.jsx";

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
  if (isAuthenticated()) return <Navigate to="/command-center" replace />;
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
            <Navigate to="/command-center" replace />
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

      {/* PROTECTED */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* ✅ Pretty URLs (what your navbar is trying to use) */}
        <Route path="/overview" element={<Dashboard />} />
        <Route path="/command-center" element={<RevenueIntel />} />
        <Route
          path="/deal-room"
          element={
            <RequirePerm perm="deal_room.view">
              <Pipeline />
            </RequirePerm>
          }
        />
        <Route path="/market-signals" element={<Metrics />} />
        <Route path="/accounts" element={<Clients />} />
        <Route path="/accounts/:id" element={<ClientDetail />} />
        <Route
          path="/partners"
          element={
            <RequirePerm perm="partners.manage">
              <Partners />
            </RequirePerm>
          }
        />
        <Route
          path="/global-hq"
          element={
            <RequirePerm perm="admin.audit">
              <Workspaces />
            </RequirePerm>
          }
        />
        <Route path="/invites" element={<Invites />} />

        {/* ✅ Backward-compatible old URLs (so nothing breaks) */}
        <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
        <Route path="/revenue-intel" element={<Navigate to="/command-center" replace />} />
        <Route path="/pipeline" element={<Navigate to="/deal-room" replace />} />
        <Route path="/metrics" element={<Navigate to="/market-signals" replace />} />
        <Route path="/workspaces" element={<Navigate to="/global-hq" replace />} />
        <Route path="/clients" element={<Navigate to="/accounts" replace />} />

        {/* Keep these only if you actually still use them somewhere */}
        <Route path="/legacy-accounts" element={<Accounts />} />
        <Route path="/legacy-accounts/:id" element={<AccountDetail />} />
      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated() ? "/command-center" : "/login"} replace />
        }
      />
    </Routes>
  );
}