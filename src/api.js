const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

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

// ✅ NEW: Org Name helpers (for showing Workspace name in UI)
export function getActiveOrgName() {
  return localStorage.getItem("active_org_name") || "";
}
export function setActiveOrgName(name) {
  if (!name) localStorage.removeItem("active_org_name");
  else localStorage.setItem("active_org_name", String(name));
}

export function logout() {
  clearToken();
  setActiveOrgId("");
  setActiveOrgName(""); // ✅ clear name too
}

// -------------------- Core request helpers --------------------
async function request(path, options = {}) {
  const token = getToken();
  const orgId = getActiveOrgId();

  const headers = { ...(options.headers || {}) };
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (orgId) headers["x-org-id"] = orgId;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const apiGet = (path) => request(path, { method: "GET" });
export const apiPost = (path, payload) => request(path, { method: "POST", body: JSON.stringify(payload || {}) });
export const apiPut = (path, payload) => request(path, { method: "PUT", body: JSON.stringify(payload || {}) });
export const apiPatch = (path, payload) => request(path, { method: "PATCH", body: JSON.stringify(payload || {}) });
export const apiDelete = (path) => request(path, { method: "DELETE" });

export const listPartners = () => apiGet(`/partners`);

// -------------------- Auth --------------------
export const signup = (payload) => apiPost("/auth/signup", payload);
export const login = (payload) => apiPost("/auth/login", payload);
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
export const getMetricsSummary = (days = 30) => apiGet(`/metrics/summary?days=${encodeURIComponent(days)}`);

// -------------------- Insights --------------------
export const generateInsights = (payload) => apiPost("/insights/generate", payload);

// -------------------- Orgs / Workspaces --------------------
export const getMyOrgs = () => apiGet("/org/mine");
export const switchOrg = (orgId) => apiPost("/org/switch", { orgId });

// -------------------- Invites --------------------
export const createInvite = (email, role = "analyst") => apiPost("/invites", { email, role });
export const listInvites = () => apiGet("/invites");
export const getInvite = (token) => apiGet(`/invites/${encodeURIComponent(token)}`);
export const acceptInvite = (token) => apiPost(`/invites/${encodeURIComponent(token)}/accept`, {});

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
export const moveDealStage = (id, stage) => apiPatch(`/deals/${id}/stage`, { stage });

export const getDealActivity = (id) => apiGet(`/deals/${id}/activity`);
export const logDealActivity = (id, payload) => apiPost(`/deals/${id}/activity`, payload);

// -------------------- Deal Intel (priorities/autopilot) --------------------
export const getPriorities = (limit = 10) => apiGet(`/deal-intel/priorities?limit=${encodeURIComponent(limit)}`);
export const runAutopilot = (payload = { maxUpdates: 200, dryRun: true, force: false }) =>
  apiPost(`/deal-intel/autopilot/run`, payload);

// -------------------- Revenue Intel Board --------------------
export const getRevenueIntelBoard = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.reactivateAfterDays != null) qs.set("reactivateAfterDays", String(params.reactivateAfterDays));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet(`/revenue-intel/board${suffix}`);
};


// -------------------- Demo Seed --------------------
export const seedDemoData = async () => {
  // this matches backend route: POST /api/seed/refresh
  const res = await apiPost(`/seed/refresh`);
  return res;
};

// ✅ Optional: getPipeline helper used by Dashboard.jsx
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