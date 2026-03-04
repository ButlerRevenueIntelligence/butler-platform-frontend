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
  // Try a few common keys (safe defaults)
  return (
    localStorage.getItem("active_org_plan") ||
    localStorage.getItem("org_plan") ||
    localStorage.getItem("plan") ||
    "STANDARD"
  );
}

export function setPlan(plan) {
  if (!plan) localStorage.removeItem("active_org_plan");
  else localStorage.setItem("active_org_plan", String(plan));
}