export default function DIDPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900 text-slate-200">
      <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">D-ID Avatar Stream</span>
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-500/40 bg-slate-800">
        <div className="h-8 w-8 animate-pulse rounded-full bg-emerald-400/70" />
      </div>
      <p className="max-w-xs text-center text-sm text-slate-400">
        Connect your D-ID session to replace this placeholder with the live doctor avatar.
      </p>
    </div>
  );
}

