import React from "react";
import UpgradeBanner from "./UpgradeBanner";
import { getPlan } from "../utils/perms";

export default function UpgradeGate({
  requiredPlan = "GROWTH",
  children,
  feature = "this feature",
}) {
  const plan = (getPlan() || "CORE").toUpperCase();

  const hierarchy = {
    CORE: 1,
    GROWTH: 2,
    ENTERPRISE: 3,
  };

  const hasAccess = hierarchy[plan] >= hierarchy[requiredPlan];

  if (hasAccess) return children;

  return (
    <UpgradeBanner missingPerm={feature} requiredPlan={requiredPlan} />
  );
}