export const inputCls =
  "w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none transition focus:border-primary";
export const btnPrimary =
  "rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:opacity-60";
export const btnGhost =
  "rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface-2";
export const card = "rounded-2xl border border-border bg-surface";

export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
