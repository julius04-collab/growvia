"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard", short: "Home" },
  { href: "/dashboard/new-order", label: "New order", short: "Order" },
  { href: "/dashboard/orders", label: "Orders", short: "Orders" },
  { href: "/dashboard/add-funds", label: "Add funds", short: "Funds" },
  { href: "/dashboard/support", label: "Support", short: "Help" },
];

export function NavLinks({ variant }: { variant: "side" | "bottom" }) {
  const path = usePathname();
  const active = (href: string) =>
    href === "/dashboard" ? path === href : path.startsWith(href);

  if (variant === "bottom") {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 backdrop-blur md:hidden">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={`py-3 text-center text-xs ${active(i.href) ? "font-semibold text-accent" : "text-muted"}`}
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
            active(i.href) ? "bg-primary text-white" : "text-muted hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
