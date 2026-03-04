export function can(session, perm) {
  const perms = session?.permissions || [];
  return perms.includes("*") || perms.includes(perm);
}