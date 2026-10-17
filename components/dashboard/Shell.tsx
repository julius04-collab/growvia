import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requireUser } from "@/lib/auth";
import { userNav, type NavItem } from "@/lib/nav";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "./LogoutButton";

export function ShellFrame({
  name,
  items,
  demo = false,
  badge,
  accountHref,
  children,
}: {
  name: string;
  items: NavItem[];
  demo?: boolean;
  badge?: string;
  accountHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
        <div className="px-2 py-3"><Logo /></div>
        <div className="mt-4"><NavLinks variant="side" items={items} /></div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col pb-32 md:pb-0">
        {demo && (
          <div className="bg-amber-300/15 px-4 py-2 text-center text-xs text-amber-200">
            Demo preview with sample data. Nothing here is real.
          </div>
        )}
        <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden"><Logo /></div>
            {badge && <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold">{badge}</span>}
            <p className="hidden text-sm text-muted md:block">
              {demo ? "Viewing as " : "Signed in as "}<span className="text-foreground">{name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {accountHref && (
              <Link
                href={accountHref}
                aria-label="Account"
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold uppercase"
              >
                {name.trim().charAt(0) || "U"}
              </Link>
            )}
            {demo ? (
              <Link href="/" className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground">Exit demo</Link>
            ) : (
              <>
                {badge && <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">My dashboard</Link>}
                <LogoutButton />
              </>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
      <NavLinks variant="bottom" items={items} />
    </div>
  );
}

export async function Shell({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const name = profile?.full_name || user.user_metadata?.full_name || user.email || "you";
  return <ShellFrame name={name} items={userNav()} accountHref="/dashboard/account">{children}</ShellFrame>;
}

export function ShellSkeleton() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block" />
      <div className="flex-1 p-8"><div className="h-8 w-48 animate-pulse rounded bg-surface-2" /></div>
    </div>
  );
}
