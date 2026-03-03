// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Partners from "./pages/Partners.jsx";

import Metrics from "./pages/Metrics.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import Clients from "./pages/Clients.jsx";
import ClientDetail from "./pages/ClientDetail.jsx";

import Accounts from "./pages/Accounts.jsx";
import AccountDetail from "./pages/AccountDetail.jsx";

import AcceptInvite from "./pages/AcceptInvite.jsx";
import Invites from "./pages/Invites.jsx";
import Workspaces from "./pages/Workspaces.jsx";

import RevenueIntel from "./pages/RevenueIntel.jsx";
import AppLayout from "./components/AppLayout.jsx";

function isAuthenticated() {
  return !!localStorage.getItem("butler_token");
}

function RequireAuth({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

function RedirectIfAuth({ children }) {
  // ✅ if already logged in, send to the new command center
  if (isAuthenticated()) return <Navigate to="/revenue-intel" replace />;
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
            <Navigate to="/revenue-intel" replace />
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
        {/* ✅ Make Revenue Intel the first/primary route in the protected app */}
        <Route path="/revenue-intel" element={<RevenueIntel />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="/invites" element={<Invites />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/partners" element={<Partners />} />

        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />

        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated() ? "/revenue-intel" : "/login"} replace />
        }
      />
    </Routes>
  );
}