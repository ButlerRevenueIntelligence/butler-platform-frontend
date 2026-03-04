// frontend/src/utils/permissions.js

export function hasPerm(perms = [], perm) {
  if (!perm) return false;
  if (perms.includes("*")) return true;
  return perms.includes(perm);
}

export function hasAllPerms(perms = [], required = []) {
  return required.every((p) => hasPerm(perms, p));
}