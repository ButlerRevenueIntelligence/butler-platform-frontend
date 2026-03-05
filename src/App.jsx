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
      <Route
        path="/"
        element={<Navigate to={isAuthenticated() ? "/command-center" : "/login"} replace />}
      />

      {/* PUBLIC */}
      <Route path="/signup" element={<RedirectIfAuth><Signup /></RedirectIfAuth>} />
      <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* PROTECTED */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        {/* Friendly routes */}
        <Route path="/overview" element={<RequirePerm perm="dashboard.view"><Dashboard /></RequirePerm>} />
        <Route path="/command-center" element={<RequirePerm perm="command_center.view"><RevenueIntel /></RequirePerm>} />
        <Route path="/deal-room" element={<RequirePerm perm="deal_room.view"><Pipeline /></RequirePerm>} />
        <Route path="/market-signals" element={<RequirePerm perm="market_signals.view"><Metrics /></RequirePerm>} />
        <Route path="/accounts" element={<RequirePerm perm="clients.view"><Clients /></RequirePerm>} />
        <Route path="/partners" element={<RequirePerm perm="partners.manage"><Partners /></RequirePerm>} />
        <Route path="/global-hq" element={<RequirePerm perm="admin.audit"><Workspaces /></RequirePerm>} />
        <Route path="/invites" element={<Invites />} />

        {/* Backward-compatible routes (old links still work) */}
        <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
        <Route path="/revenue-intel" element={<Navigate to="/command-center" replace />} />
        <Route path="/pipeline" element={<Navigate to="/deal-room" replace />} />
        <Route path="/metrics" element={<Navigate to="/market-signals" replace />} />
        <Route path="/clients" element={<Navigate to="/accounts" replace />} />

        <Route path="/clients/:id" element={<ClientDetail />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated() ? "/command-center" : "/login"} replace />} />
    </Routes>
  );
}