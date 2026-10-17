import Link from "next/link";
import { Logo } from "./Logo";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            Social media marketing services, ordered from one simple dashboard.
          </p>
        </div>
        <FooterCol title="Product" items={[["Services", "/services"], ["How it works", "/#how-it-works"], ["FAQ", "/#faq"]]} />
        <FooterCol title="Account" items={[["Log in", "/login"], ["Create account", "/signup"]]} />
        <FooterCol title="Legal" items={[["Terms of Service", "/terms"], ["Privacy Policy", "/privacy"], ["Refund Policy", "/refund"], ["Contact", "/contact"]]} />
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted">
        <div className="mb-3 flex justify-center"><ThemeToggle /></div>
        © 2026 {site.name}. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      <ul className="space-y-2 text-sm text-muted">
        {items.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="transition hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
