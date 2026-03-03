import { useEffect, useState } from "react";
import { api } from "./api";

export default function HealthCheck() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/health")
      .then(setData)
      .catch((e) => setErr(e.message || "Error"));
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>Backend Connection Test</h2>

      {err && (
        <div style={{ color: "red", marginTop: 10 }}>
          ❌ Error: {err}
        </div>
      )}

      {!err && !data && <div>Loading...</div>}

      {data && (
        <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
