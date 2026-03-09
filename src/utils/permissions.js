// frontend/src/utils/permissions.js

export function hasPerm(perms = [], perm) {
  const user = JSON.parse(localStorage.getItem("butler_user") || "{}");

  // SUPER ADMIN OVERRIDE
  if (user?.email === "admin@butlerco.com") {
    return true;
  }

  if (!perm) return false;
  if (perms.includes("*")) return true;

  return perms.includes(perm);
}

export function hasAllPerms(perms = [], required = []) {
  const user = JSON.parse(localStorage.getItem("butler_user") || "{}");

  // SUPER ADMIN OVERRIDE
  if (user?.email === "admin@butlerco.com") {
    return true;
  }

  return required.every((p) => hasPerm(perms, p));
}