// frontend/src/utils/perms.js

export function getPermissions() {
  try {
    const raw = localStorage.getItem("permissions");
    const perms = raw ? JSON.parse(raw) : [];
    return Array.isArray(perms) ? perms : [];
  } catch {
    return [];
  }
}

export function hasPerm(perms, perm) {
  if (!perm) return false;
  if (!Array.isArray(perms)) return false;
  if (perms.includes("*")) return true;
  return perms.includes(perm);
}

// --- Plan helpers (used by UpgradeBanner) ---
export function getPlan() {
  return (
    localStorage.getItem("active_org_plan") ||
    localStorage.getItem("org_plan") ||
    localStorage.getItem("plan") ||
    "SCALE"
  );
}

export function setPlan(plan) {
  if (!plan) {
    localStorage.removeItem("active_org_plan");
    localStorage.removeItem("org_plan");
    localStorage.removeItem("plan");
  } else {
    const value = String(plan).toUpperCase().trim();
    localStorage.setItem("active_org_plan", value);
    localStorage.setItem("org_plan", value);
    localStorage.setItem("plan", value);
  }
}