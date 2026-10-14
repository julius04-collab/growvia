import { Logo } from "@/components/Logo";
import { requireUser } from "@/lib/auth";
import { NavLinks } from "./NavLinks";
import { LogoutButton } from "./LogoutButton";

export async function Shell({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const name = profile?.full_name || user.user_metadata?.full_name || user.email;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
        <div className="px-2 py-3"><Logo /></div>
        <div className="mt-4"><NavLinks variant="side" /></div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-8">
          <div className="md:hidden"><Logo /></div>
          <p className="hidden text-sm text-muted md:block">
            Signed in as <span className="text-foreground">{name}</span>
          </p>
          <LogoutButton />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
      <NavLinks variant="bottom" />
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block" />
      <div className="flex-1 p-8"><div className="h-8 w-48 animate-pulse rounded bg-surface-2" /></div>
    </div>
  );
}
