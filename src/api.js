// src/api.js

// Build a safe API base that ALWAYS ends with /api
function buildApiBase(raw) {
  const cleaned = String(raw || "").trim().replace(/\/+$/, "");
  if (!cleaned) return "https://atlas-revenue-backend.onrender.com/api"; // fallback
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

// ✅ Prefer VITE_API_URL (Render env var), fallback to VITE_API_BASE, then fallback hardcoded
const API_BASE = buildApiBase(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE ||
    "https://atlas-revenue-backend.onrender.com/api"
);

// -------------------- Token + Org helpers --------------------
export function getToken() {
  return localStorage.getItem("butler_token") || "";
}
export function setToken(token) {
  if (!token) localStorage.removeItem("butler_token");
  else localStorage.setItem("butler_token", token);
}
export function clearToken() {
  localStorage.removeItem("butler_token");
}

// ✅ Org helpers
export function getActiveOrgId() {
  return localStorage.getItem("active_org_id") || "";
}
export function setActiveOrgId(orgId) {
  if (!orgId) localStorage.removeItem("active_org_id");
  else localStorage.setItem("active_org_id", String(orgId));
}

// ✅ Org Name helpers (for showing Workspace name in UI)
export function getActiveOrgName() {
  return localStorage.getItem("active_org_name") || "";
}
export function setActiveOrgName(name) {
  if (!name) localStorage.removeItem("active_org_name");
  else localStorage.setItem("active_org_name", String(name));
}

// -------------------- User helpers --------------------
export function getUser() {
  try {
    const raw = localStorage.getItem("butler_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function setUser(user) {
  if (!user) localStorage.removeItem("butler_user");
  else localStorage.setItem("butler_user", JSON.stringify(user));
}
export function clearUser() {
  localStorage.removeItem("butler_user");
}

export function logout() {
  clearToken();
  clearUser();
  setActiveOrgId("");
  setActiveOrgName("");
}

// -------------------- Org context auto-fix --------------------
// If active_org_id is missing, try to pull it from stored user (orgId)
// This prevents 403 when the UI never explicitly selected a workspace yet.
function ensureOrgContext() {
  let orgId = getActiveOrgId();
  if (orgId) return orgId;

  const u = getUser();
  const fallback = u?.orgId || u?.scope?.orgId || "";
  if (fallback) {
    setActiveOrgId(fallback);
    orgId = String(fallback);
  }
  return orgId;
}

// -------------------- Core request helpers --------------------
async function request(path, options = {}) {
  const token = getToken();
  const orgId = ensureOrgContext(); // ✅ critical: always try to have org context

  const headers = { ...(options.headers || {}) };
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  // ✅ Auth header
  if (token) headers.Authorization = `Bearer ${token}`;

  // ✅ Workspace/org header (this is what your backend is expecting)
  if (orgId) headers["x-org-id"] = String(orgId);

  const cleanPath = path?.startsWith("/") ? path : `/${path}`;

  const res = await fetch(`${API_BASE}${cleanPath}`, {
    ...options,
    headers,
    // ok even if you’re not using cookies; does not break Bearer token auth
    credentials: "include",
  });

  // Read as text first so we can safely parse JSON or show raw errors
  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const apiGet = (path) => request(path, { method: "GET" });
export const apiPost = (path, payload) =>
  request(path, { method: "POST", body: JSON.stringify(payload || {}) });
export const apiPut = (path, payload) =>
  request(path, { method: "PUT", body: JSON.stringify(payload || {}) });
export const apiPatch = (path, payload) =>
  request(path, { method: "PATCH", body: JSON.stringify(payload || {}) });
export const apiDelete = (path) => request(path, { method: "DELETE" });

// -------------------- Auth --------------------
export const signup = async (payload) => {
  const res = await apiPost("/auth/signup", payload);

  // Try to auto-store token/user/org from common backend shapes
  if (res?.token) setToken(res.token);
  if (res?.user) setUser(res.user);

  const orgId = res?.user?.orgId || res?.orgId || res?.scope?.orgId || "";
  if (orgId) setActiveOrgId(orgId);

  const orgName = res?.org?.name || res?.user?.orgName || "";
  if (orgName) setActiveOrgName(orgName);

  return res;
};

export const login = async (payload) => {
  const res = await apiPost("/auth/login", payload);

  // Try to auto-store token/user/org from common backend shapes
  if (res?.token) setToken(res.token);
  if (res?.user) setUser(res.user);

  const orgId = res?.user?.orgId || res?.orgId || res?.scope?.orgId || "";
  if (orgId) setActiveOrgId(orgId);

  const orgName = res?.org?.name || res?.user?.orgName || "";
  if (orgName) setActiveOrgName(orgName);

  return res;
};

export const serverLogout = () => request("/auth/logout", { method: "POST" });

// -------------------- Dashboard --------------------
export const getDashboard = () => apiGet("/dashboard");
export const getIntegrations = () => apiGet("/integrations");
export const getAttributionSummary = () => apiGet("/attribution/summary");
export const getRevenueStability = () => apiGet("/revenue-stability");
export const getForecastScenarios = () => apiGet("/forecast/scenarios");

// -------------------- Metrics --------------------
export const getMetricsDaily = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.start) qs.set("start", params.start);
  if (params.end) qs.set("end", params.end);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet(`/metrics/daily${suffix}`);
};
export const getMetricsSummary = (days = 30) =>
  apiGet(`/metrics/summary?days=${encodeURIComponent(days)}`);

// -------------------- Insights --------------------
export const generateInsights = (payload) => apiPost("/insights/generate", payload);

// -------------------- Orgs / Workspaces --------------------
export const getMyOrgs = async () => {
  const res = await apiGet("/org/mine");

  // If backend returns orgs and we don't have an active org yet, pick the first one
  if (!getActiveOrgId()) {
    const list = Array.isArray(res?.orgs) ? res.orgs : Array.isArray(res) ? res : [];
    const first = list?.[0];
    if (first?._id) setActiveOrgId(first._id);
    if (first?.name) setActiveOrgName(first.name);
  }

  return res;
};

export const switchOrg = async (orgId) => {
  const res = await apiPost("/org/switch", { orgId });
  if (orgId) setActiveOrgId(orgId);

  // If backend returns org name, store it
  const name = res?.org?.name || res?.name || "";
  if (name) setActiveOrgName(name);

  return res;
};

// -------------------- Invites --------------------
export const createInvite = (email, role = "analyst") =>
  apiPost("/invites", { email, role });
export const listInvites = () => apiGet("/invites");
export const getInvite = (token) => apiGet(`/invites/${encodeURIComponent(token)}`);
export const acceptInvite = (token) =>
  apiPost(`/invites/${encodeURIComponent(token)}/accept`, {});

// -------------------- Clients (CRUD) --------------------
export const getClients = () => apiGet("/clients");
export const getClient = (id) => apiGet(`/clients/${id}`);
export const createClient = (payload) => apiPost("/clients", payload);
export const updateClient = (id, payload) => apiPut(`/clients/${id}`, payload);
export const deleteClient = (id) => apiDelete(`/clients/${id}`);

// -------------------- Deals (Pipeline) --------------------
export const getDeals = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.stage) qs.set("stage", params.stage);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet(`/deals${suffix}`);
};

export const getDeal = (id) => apiGet(`/deals/${id}`);
export const createDeal = (payload) => apiPost("/deals", payload);
export const updateDeal = (id, payload) => apiPut(`/deals/${id}`, payload);
export const deleteDeal = (id) => apiDelete(`/deals/${id}`);
export const moveDealStage = (id, stage) =>
  apiPatch(`/deals/${id}/stage`, { stage });

export const getDealActivity = (id) => apiGet(`/deals/${id}/activity`);
export const logDealActivity = (id, payload) =>
  apiPost(`/deals/${id}/activity`, payload);

// -------------------- Deal Intel --------------------
export const getPriorities = (limit = 10) =>
  apiGet(`/deal-intel/priorities?limit=${encodeURIComponent(limit)}`);
export const runAutopilot = (payload = { maxUpdates: 200, dryRun: true, force: false }) =>
  apiPost(`/deal-intel/autopilot/run`, payload);

// -------------------- Revenue Intel Board --------------------
export const getRevenueIntelBoard = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.reactivateAfterDays != null)
    qs.set("reactivateAfterDays", String(params.reactivateAfterDays));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet(`/revenue-intel/board${suffix}`);
};

// -------------------- Demo Seed --------------------
export const seedDemoData = async () => apiPost("/seed/refresh");

// -------------------- Optional: pipeline helper --------------------
export const getPipeline = async () => {
  const res = await getDeals();
  const deals = Array.isArray(res?.deals) ? res.deals : Array.isArray(res) ? res : [];

  const pipelineValue = deals.reduce((sum, d) => {
    const amt = Number(d?.amount ?? d?.value ?? 0) || 0;
    const prob = Number(d?.probability ?? 1) || 0;
    return sum + amt * prob;
  }, 0);

  return { deals, pipelineValue: Math.round(pipelineValue) };
};