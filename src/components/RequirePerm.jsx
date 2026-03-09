// frontend/src/components/RequirePerm.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function safeReadUser() {
  try {
    return (
      JSON.parse(localStorage.getItem("butler_user") || "null") ||
      JSON.parse(localStorage.getItem("user") || "null") ||
      {}
    );
  } catch {
    return {};
  }
}

export default function RequirePerm({ perm, children }) {
  const user = safeReadUser();
  const email = String(user?.email || "").trim().toLowerCase();
  const role = String(user?.role || "").trim().toLowerCase();
  const perms = Array.isArray(user?.permissions) ? user.permissions : [];

  // SUPER ADMIN / OWNER OVERRIDE
  if (
    email === "admin@butlerco.com" ||
    email === "butlercomarketingagency@gmail.com" ||
    role === "admin" ||
    role === "owner" ||
    perms.includes("*")
  ) {
    return children;
  }

  if (perm && !perms.includes(perm)) {
    return <Navigate to="/overview" replace />;
  }

  return children;
}