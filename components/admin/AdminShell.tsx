import { requireAdmin } from "@/lib/auth";
import { adminNav } from "@/lib/nav";
import { ShellFrame } from "@/components/dashboard/Shell";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <ShellFrame name={user.email ?? "admin"} items={adminNav} badge="Admin">
      {children}
    </ShellFrame>
  );
}
