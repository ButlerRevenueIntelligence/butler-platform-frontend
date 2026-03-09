// frontend/src/components/OrgSwitcher.jsx
import { useEffect, useState } from "react";
import {
  getMyOrgs,
  switchOrg,
  setActiveOrgId,
  getActiveOrgId,
  setActiveOrgName,
} from "../api";

export default function OrgSwitcher({ onSwitched }) {
  const [orgs, setOrgs] = useState([]);
  const [active, setActive] = useState(getActiveOrgId() || "");
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const res = await getMyOrgs();
      const list = Array.isArray(res?.orgs) ? res.orgs : [];
      setOrgs(list);

      const current = getActiveOrgId();

      // If there's no active org yet, pick the first one.
      if (!current && list.length) {
        const firstOrgId = list[0]?._id;
        const firstOrgName = list[0]?.name;

        if (firstOrgId) {
          setActiveOrgId(firstOrgId);
          setActive(String(firstOrgId));
          setActiveOrgName(firstOrgName || "");
          if (typeof onSwitched === "function") onSwitched();
        }
      } else {
        setActive(current || "");
        const found = list.find((o) => String(o._id) === String(current));
        if (found?.name) setActiveOrgName(found.name);
      }
    } catch (e) {
      setErr(e?.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onChangeOrg(e) {
    const orgId = e.target.value;
    setActive(orgId);
    if (!orgId) return;

    const picked = orgs.find((o) => String(o._id) === String(orgId));

    try {
      setSwitching(true);
      setErr("");

      // server validates membership
      await switchOrg(orgId);

      // client stores active org (x-org-id header comes from api.js)
      setActiveOrgId(orgId);
      setActiveOrgName(picked?.name || "");

      if (typeof onSwitched === "function") onSwitched();
    } catch (e2) {
      setErr(e2?.message || "Failed to switch workspace");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
        Workspace
      </div>

      <select
        value={active}
        onChange={onChangeOrg}
        disabled={loading || switching}
        style={{
          height: 42,
          borderRadius: 12,
          padding: "0 12px",
          background: "rgba(10,14,28,0.35)",
          border: "1px solid rgba(140,170,255,0.18)",
          outline: "none",
          color: "rgba(234,240,255,0.92)",
          cursor: loading || switching ? "not-allowed" : "pointer",
        }}
      >
        <option value="" disabled>
          {loading ? "Loading workspaces..." : "Select a workspace"}
        </option>

        {orgs.map((o) => (
          <option key={o.orgId} value={o.orgId}>
            {o.orgName}
          </option>
        ))}
      </select>

      {err ? (
        <div
          style={{
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,120,120,0.35)",
            background: "rgba(80,10,10,0.25)",
            color: "rgba(255,220,220,0.92)",
            fontSize: 12,
          }}
        >
          {err}
        </div>
      ) : null}

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        {switching ? "Switching..." : "Switching changes the active x-org-id header."}
      </div>
    </div>
  );
}