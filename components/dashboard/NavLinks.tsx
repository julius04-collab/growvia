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
      {items.map((i) => (
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
