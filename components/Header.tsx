import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/services", label: "Services" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-muted transition hover:text-foreground">
            Log in
          </Link>
          <Link href="/signup" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95">
            Get started
          </Link>
        </div>
      </div>
      {/* Mobile nav: simple scrollable row, no JS needed */}
      <nav className="flex gap-5 overflow-x-auto border-t border-border px-4 py-2 text-sm text-muted md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
