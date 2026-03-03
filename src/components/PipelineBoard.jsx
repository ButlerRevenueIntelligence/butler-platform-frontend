// frontend/src/components/PipelineBoard.jsx
import React from "react";

export default function PipelineBoard({ summary, deals }) {
  const stages = summary?.stages || [];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={grid2()}>
        <KPI title="Total Pipeline" value={money(summary?.totalValue)} sub="Total value across stages" />
        <KPI title="Weighted Pipeline" value={money(summary?.weightedValue)} sub="Probability-adjusted value" />
        <KPI title="Total Deals" value={num(summary?.totalDeals)} sub="Active opportunities" />
        <KPI title="Close Focus" value={focusText(stages)} sub="What to push next" />
      </div>

      <div style={card()}>
        <div style={cardHeader()}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Pipeline Stages</div>
            <div style={{ opacity: 0.8, fontSize: 12, marginTop: 4 }}>
              Executive view of deal flow across your funnel
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {stages.map((s) => (
            <StageRow key={s.key} stage={s} total={summary?.totalValue || 1} />
          ))}
        </div>

        <div style={{ marginTop: 12, opacity: 0.75, fontSize: 12 }}>
          Next: connect CRM so this updates live (HubSpot/Salesforce), then add owner + date filters.
        </div>
      </div>

      <div style={card()}>
        <div style={cardHeader()}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Deals</div>
            <div style={{ opacity: 0.8, fontSize: 12, marginTop: 4 }}>
              Highest priority opportunities to move this week
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table style={table()}>
            <thead>
              <tr>
                <Th>Deal</Th>
                <Th>Stage</Th>
                <Th align="right">MRR</Th>
                <Th align="right">90-Day Value</Th>
                <Th>Owner</Th>
                <Th>Next Step</Th>
                <Th>Updated</Th>
              </tr>
            </thead>
            <tbody>
              {(deals || []).map((d) => (
                <tr key={d.id} style={row()}>
                  <Td><b>{d.name}</b></Td>
                  <Td>
                    <span style={stagePill(d.stage)}>{labelStage(d.stage)}</span>
                  </Td>
                  <Td align="right">{money(d.mrr)}</Td>
                  <Td align="right">{money(d.value90d)}</Td>
                  <Td>{d.owner}</Td>
                  <Td>{d.nextStepIn}</Td>
                  <Td>{(d.updatedAt || "").slice(0, 10)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, sub }) {
  return (
    <div style={kpi()}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 950, marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function StageRow({ stage, total }) {
  const pct = Math.max(0, Math.min(100, (Number(stage.value || 0) / Number(total || 1)) * 100));
  return (
    <div style={stageRow()}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 850 }}>{stage.label}</div>
        <div style={{ opacity: 0.85 }}>
          <b>{num(stage.count)}</b> deals • <b>{money(stage.value)}</b>
        </div>
      </div>
      <div style={barWrap()}>
        <div style={barFill(pct)} />
      </div>
    </div>
  );
}

function labelStage(s) {
  const map = {
    new: "New",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    closed_won: "Closed Won",
  };
  return map[s] || s;
}

function focusText(stages) {
  const proposal = stages.find((s) => s.key === "proposal");
  const negotiation = stages.find((s) => s.key === "negotiation");
  if ((negotiation?.count || 0) > 0) return "Push Negotiation";
  if ((proposal?.count || 0) > 0) return "Close Proposals";
  return "Qualify New Leads";
}

function num(n) {
  return new Intl.NumberFormat("en-US").format(Number(n || 0));
}
function money(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

function grid2() {
  return { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 };
}
function kpi() {
  return {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
  };
}
function card() {
  return {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
  };
}
function cardHeader() {
  return { display: "flex", alignItems: "center", justifyContent: "space-between" };
}
function stageRow() {
  return {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(0,0,0,0.10)",
  };
}
function barWrap() {
  return {
    marginTop: 10,
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  };
}
function barFill(pct) {
  return {
    width: `${pct}%`,
    height: "100%",
    borderRadius: 999,
    background: "rgba(45,118,255,0.65)",
  };
}
function table() {
  return { width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 980 };
}
function row() {
  return { borderBottom: "1px solid rgba(255,255,255,0.10)" };
}
function Th({ children, align }) {
  return (
    <th
      style={{
        textAlign: align || "left",
        padding: "10px 10px",
        fontSize: 12,
        opacity: 0.85,
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        position: "sticky",
        top: 0,
        background: "rgba(10,18,45,0.85)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </th>
  );
}
function Td({ children, align }) {
  return (
    <td style={{ textAlign: align || "left", padding: "10px 10px", fontSize: 13, opacity: 0.96 }}>
      {children}
    </td>
  );
}
function stagePill(stage) {
  const base = {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.14)",
  };
  const map = {
    new: { background: "rgba(255,255,255,0.08)" },
    qualified: { background: "rgba(0,255,200,0.12)" },
    proposal: { background: "rgba(45,118,255,0.18)" },
    negotiation: { background: "rgba(255,180,0,0.16)" },
    closed_won: { background: "rgba(0,255,160,0.18)" },
  };
  return { ...base, ...(map[stage] || {}) };
}
