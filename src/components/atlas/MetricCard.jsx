const accentMap = {
  sky: {
    line: "#38bdf8",
    glow: "rgba(56,189,248,0.18)",
    chip: "#bae6fd",
  },
  emerald: {
    line: "#10b981",
    glow: "rgba(16,185,129,0.18)",
    chip: "#bbf7d0",
  },
  violet: {
    line: "#8b5cf6",
    glow: "rgba(139,92,246,0.18)",
    chip: "#ddd6fe",
  },
  amber: {
    line: "#f59e0b",
    glow: "rgba(245,158,11,0.18)",
    chip: "#fde68a",
  },
  default: {
    line: "rgba(255,255,255,0.22)",
    glow: "rgba(255,255,255,0.10)",
    chip: "#e5edf8",
  },
};

export default function MetricCard({
  title,
  value,
  subtext = "",
  accent = "default",
}) {
  const tone = accentMap[accent] || accentMap.default;

  return (
    <div
      className="relative px-1 py-1"
      style={{
        minHeight: 92,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            {title}
          </div>

          <div className="mt-2 text-[24px] font-extrabold leading-none text-white md:text-[28px]">
            {value}
          </div>

          {subtext ? (
            <div className="mt-2 text-[13px] leading-5 text-slate-300/80">
              {subtext}
            </div>
          ) : null}
        </div>

        <div
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{
            color: tone.chip,
            background: `${tone.glow}`,
            border: `1px solid ${tone.line}33`,
          }}
        >
          Live
        </div>
      </div>

      <div
        className="mt-4 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, ${tone.line}, transparent 72%)`,
          boxShadow: `0 0 14px ${tone.glow}`,
        }}
      />
    </div>
  );
}