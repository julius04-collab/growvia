"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav";

export function NavLinks({ variant, items }: { variant: "side" | "bottom"; items: NavItem[] }) {
  const path = usePathname();
  const active = (i: NavItem) => (i.exact ? path === i.href : path.startsWith(i.href));

  if (variant === "bottom") {
    return (
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-border bg-surface/95 backdrop-blur md:hidden"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={`py-3 text-center text-[11px] ${active(i) ? "font-semibold text-accent" : "text-muted"}`}
          >
            {i.short}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav className="space-y-1">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`block rounded-xl px-4 py-2.5 text-sm transition ${
            active(i) ? "bg-primary text-white" : "text-muted hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
