"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav";

const paths: Record<string, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h13v4" />
      <path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z" />
      <circle cx="16.5" cy="14.5" r="1" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4-6.3" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="8.5" r="1" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  undo: <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </>
  ),
  server: (
    <>
      <rect x="3" y="3" width="18" height="7" rx="2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
      <path d="M7 6.5h.01M7 17.5h.01" />
    </>
  ),
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  alert: <path d="M12 3 2 20h20zM12 10v4M12 17.5h.01" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="M5 12.5 10 17.5 19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeoff: (
    <>
      <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.700 9.700 0 0 0 4.200-.9M9.900 9.900a3 3 0 0 0 4.200 4.200" />
    </>
  ),
  tools: <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-2.6-.6-.6-2.6z" />,
};

export function Icon({ name, className = "h-5 w-5", stroke = 2 }: { name: string; className?: string; stroke?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function NavLinks({ variant, items }: { variant: "side" | "bottom"; items: NavItem[] }) {
  const path = usePathname();
  const active = (i: NavItem) => (i.exact ? path === i.href : path.startsWith(i.href));
  const side = items.filter((i) => i.desktop !== false);

  if (variant === "bottom") {
    const mobile = items.filter((i) => i.mobile !== false);
    const primary = mobile.find((i) => i.primary);
    const rest = mobile.filter((i) => !i.primary);
    const half = Math.ceil(rest.length / 2);
    const ordered = primary ? [...rest.slice(0, half), primary, ...rest.slice(half)] : rest;

    return (
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-3xl border border-border bg-surface/90 px-2 py-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
          {ordered.map((i) =>
            i.primary ? (
              <Link
                key={i.href}
                href={i.href}
                aria-label={i.label}
                className="relative -top-5 mx-1 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-black shadow-lg shadow-accent/30 ring-4 ring-background transition active:scale-95"
              >
                <Icon name={i.icon} className="h-6 w-6" stroke={2.6} />
              </Link>
            ) : (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active(i) ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] transition ${
                  active(i) ? "bg-accent/10 font-semibold text-accent" : "text-muted"
                }`}
              >
                <Icon name={i.icon} className="h-5 w-5" />
                {i.short}
              </Link>
            ),
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="space-y-1">
      {side.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
            active(i) ? "bg-primary text-white" : "text-muted hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <Icon name={i.icon} className="h-[18px] w-[18px]" />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
