// frontend/src/components/RequirePerm.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { hasPerm } from "../utils/perms";
import UpgradeBanner from "./UpgradeBanner";

export default function RequirePerm({ perm, children }) {
  if (hasPerm(perm)) return children;

  return (
    <div style={{ padding: 24 }}>
      <UpgradeBanner missingPerm={perm} />
      <div style={{ marginTop: 14 }}>
        <Navigate to="/revenue-intel" replace />
      </div>
    </div>
  );
}