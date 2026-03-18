import React from "react";
import { Navigate } from "react-router-dom";
import { getPlan } from "../utils/perms";
import UpgradeBanner from "./UpgradeBanner";

const PLAN_ORDER = {
  CORE: 1,
  GROWTH: 2,
  ENTERPRISE: 3,
};

function hasAccess(userPlan, requiredPlan) {
  return PLAN_ORDER[userPlan] >= PLAN_ORDER[requiredPlan];
}

export default function RequirePlan({
  plan = "CORE",
  children,
  fallback = "banner", // "banner" or "redirect"
}) {
  const userPlan = (getPlan() || "CORE").toUpperCase();

  // ADMIN / OWNER OVERRIDE
  const user = JSON.parse(localStorage.getItem("butler_user") || "{}");
  const role = (user?.role || "").toLowerCase();
  const email = (user?.email || "").toLowerCase();

  if (
    role === "admin" ||
    role === "owner" ||
    email === "butlercomarketingagency@gmail.com"
  ) {
    return children;
  }

  if (!hasAccess(userPlan, plan)) {
    if (fallback === "redirect") {
      return <Navigate to="/overview" replace />;
    }

    return <UpgradeBanner missingPerm={plan} />;
  }

  return children;
}