import React from "react";

export function AtlasPageHero({
  title,
  subtitle,
  description,
  badges = [],
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(99,102,241,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-sky-300/80">
              {subtitle}
            </p>
          ) : null}

          {description ? (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 md:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>

        {!!badges.length && (
          <div className="flex flex-wrap gap-2 xl:max-w-[360px] xl:justify-end">
            {badges.map((badge) => (
              <div
                key={badge}
                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-zinc-200"
              >
                {badge}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SignalGrid({ items = [] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
        >
          <div className="text-sm leading-6 text-zinc-200">{item}</div>
        </div>
      ))}
    </div>
  );
}

export function ChartShell({ children, height = "h-[340px]" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(4,10,24,0.72)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className={height}>{children}</div>
    </div>
  );
}

export function InsightStack({ title, items = [] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm leading-6 text-zinc-300 shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export function NextMoveStack({ items = [] }) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={item}
          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-400/20 bg-sky-400/10 text-[12px] font-semibold text-sky-200">
            {idx + 1}
          </div>
          <div className="text-sm leading-6 text-zinc-300">{item}</div>
        </div>
      ))}
    </div>
  );
}

export function AtlasCard({ title, children, rightSlot = null }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-sky-400 to-indigo-500" />
          <h3 className="text-[18px] font-semibold tracking-tight text-white">
            {title}
          </h3>
        </div>

        {rightSlot ? (
          rightSlot
        ) : (
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-300">
            Live
          </div>
        )}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}