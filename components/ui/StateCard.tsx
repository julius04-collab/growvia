import Link from "next/link";
import { Icon } from "@/components/dashboard/NavLinks";
import { btnGhost, btnPrimary } from "@/lib/ui";

type Tone = "neutral" | "good" | "warn" | "bad";
const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  good: "bg-accent/10 text-accent",
  warn: "bg-amber-300/10 text-amber-300",
  bad: "bg-red-400/10 text-red-300",
};

export type StateAction = { label: string; href?: string; onClick?: () => void; primary?: boolean };

// One look for every empty, error, success and blocked state.
export function StateCard({
  icon,
  tone = "neutral",
  title,
  text,
  actions = [],
  compact = false,
  children,
}: {
  icon: string;
  tone?: Tone;
  title: string;
  text?: string;
  actions?: StateAction[];
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`mx-auto flex max-w-md flex-col items-center text-center ${compact ? "py-8" : "py-14"}`}>
      <span className={`grid h-14 w-14 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-xl font-bold tracking-tight">{title}</h2>
      {text && <p className="mt-2 text-sm text-muted">{text}</p>}
      {children}
      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actions.map((a) => {
            const cls = a.primary ? btnPrimary : btnGhost;
            return a.href ? (
              <Link key={a.label} href={a.href} className={cls}>{a.label}</Link>
            ) : (
              <button key={a.label} type="button" onClick={a.onClick} className={cls}>{a.label}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inline notice for banners inside a page.
export function Notice({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <p role={tone === "bad" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${tones[tone]}`}>{children}</p>;
}

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface" />)}
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-2" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
