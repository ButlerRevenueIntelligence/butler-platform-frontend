// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import Integrations from "./pages/Integrations.jsx";

// Atlas Revenue OS pages
import DealWarRoom from "./pages/DealWarRoom.jsx";
import GrowthEngine from "./pages/GrowthEngine.jsx";
import AccountIntelligence from "./pages/AccountIntelligence.jsx";
import GlobalRevenueMap from "./pages/GlobalRevenueMap.jsx";
import Reports from "./pages/Reports.jsx";
import AtlasAIOperator from "./pages/AtlasAIOperator.jsx";
import BoardMode from "./pages/BoardMode.jsx";

import AppLayout from "./components/AppLayout.jsx";
import RequirePerm from "./components/RequirePerm.jsx";

function isAuthenticated() {
  return !!localStorage.getItem("butler_token");
}

function RequireAuth({ children }) {
  const location = useLocation();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function RedirectIfAuth({ children }) {
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (isAuthenticated()) {
    return <Navigate to="/command-center" replace />;
  }

  return children;
}

export default function App() {
  const authed = isAuthenticated();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={authed ? "/command-center" : "/login"} replace />}
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
        {/* Core / legacy routes */}
        <Route
          path="/overview"
          element={
            <RequirePerm perm="dashboard.view">
              <Dashboard />
            </RequirePerm>
          }
        />

        <Route
          path="/command-center"
          element={
            <RequirePerm perm="command_center.view">
              <Dashboard />
            </RequirePerm>
          }
        />

        {/* Legacy Deal Room */}
        <Route
          path="/deal-room"
          element={
            <RequirePerm perm="deal_room.view">
              <Pipeline />
            </RequirePerm>
          }
        />

        <Route
          path="/market-signals"
          element={
            <RequirePerm perm="market_signals.view">
              <Metrics />
            </RequirePerm>
          }
        />

        <Route
          path="/accounts"
          element={
            <RequirePerm perm="clients.view">
              <Clients />
            </RequirePerm>
          }
        />

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

        <Route
          path="/integrations"
          element={
            <RequirePerm perm="dashboard.view">
              <Integrations />
            </RequirePerm>
          }
        />

        <Route
          path="/data-connectors"
          element={
            <RequirePerm perm="dashboard.view">
              <Integrations />
            </RequirePerm>
          }
        />

        <Route path="/invites" element={<Invites />} />
        <Route path="/clients/:id" element={<ClientDetail />} />

        {/* Atlas Revenue OS routes */}
        <Route
          path="/deal-war-room"
          element={
            <RequirePerm perm="deal_room.view">
              <DealWarRoom />
            </RequirePerm>
          }
        />

        <Route
          path="/growth-engine"
          element={
            <RequirePerm perm="market_signals.view">
              <GrowthEngine />
            </RequirePerm>
          }
        />

        <Route
          path="/account-intelligence"
          element={
            <RequirePerm perm="clients.view">
              <AccountIntelligence />
            </RequirePerm>
          }
        />

        <Route
          path="/global-revenue-map"
          element={
            <RequirePerm perm="admin.audit">
              <GlobalRevenueMap />
            </RequirePerm>
          }
        />

        <Route
          path="/atlas-ai-operator"
          element={
            <RequirePerm perm="dashboard.view">
              <AtlasAIOperator />
            </RequirePerm>
          }
        />

        <Route
          path="/reports"
          element={
            <RequirePerm perm="dashboard.view">
              <Reports />
            </RequirePerm>
          }
        />

        <Route
          path="/board-mode"
          element={
            <RequirePerm perm="dashboard.view">
              <BoardMode />
            </RequirePerm>
          }
        />

        {/* Backward-compatible redirects */}
        <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
        <Route path="/revenue-intel" element={<Navigate to="/command-center" replace />} />
        <Route path="/pipeline" element={<Navigate to="/deal-war-room" replace />} />
        <Route path="/metrics" element={<Navigate to="/market-signals" replace />} />
        <Route path="/clients" element={<Navigate to="/accounts" replace />} />

        {/* Friendly aliases */}
        <Route path="/growth" element={<Navigate to="/growth-engine" replace />} />
        <Route path="/ai-operator" element={<Navigate to="/atlas-ai-operator" replace />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={authed ? "/command-center" : "/login"} replace />}
      />
    </Routes>
  );
}