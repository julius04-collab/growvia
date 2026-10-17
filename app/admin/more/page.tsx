import Link from "next/link";
import { adminNav } from "@/lib/nav";
import { card } from "@/lib/ui";
import { Icon } from "@/components/dashboard/NavLinks";
import { ThemeRow } from "@/components/ThemeToggle";

export default function AdminMore() {
  const items = adminNav.filter((i) => i.desktop !== false);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">All admin pages</h1>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={`${card} flex items-center gap-3 p-4 text-sm font-medium transition hover:bg-surface-2`}>
            <Icon name={i.icon} className="h-5 w-5 text-accent" />
            {i.label}
          </Link>
        ))}
        <Link href="/dashboard" className={`${card} flex items-center gap-3 p-4 text-sm font-medium transition hover:bg-surface-2`}>
          <Icon name="user" className="h-5 w-5 text-accent" />
          My customer dashboard
        </Link>
      </div>
      <section className={`${card} p-5`}><ThemeRow /></section>
    </div>
  );
}
