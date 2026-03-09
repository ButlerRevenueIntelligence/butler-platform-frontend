export default function SectionCard({
  title,
  children,
  rightSlot = null,
  className = "",
}) {
  return (
    <section
      className={`rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}
    >
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
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live
          </div>
        )}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}