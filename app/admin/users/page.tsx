import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { naira } from "@/lib/site";
import { card, when } from "@/lib/ui";

export default async function AdminUsers() {
  const { admin } = await requireAdmin();
  const [{ data: profiles }, { data: authList }] = await Promise.all([
    admin.from("profiles").select("id,full_name,balance,is_admin,created_at").order("created_at", { ascending: false }).limit(100),
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);
  const emails = new Map((authList?.users ?? []).map((u) => [u.id, u.email]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
      <div className={`${card} divide-y divide-border overflow-hidden`}>
        {(profiles ?? []).length === 0 && <p className="p-8 text-center text-sm text-muted">No customers yet.</p>}
        {(profiles ?? []).map((p) => (
          <Link key={p.id} href={`/admin/users/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-4 text-sm transition hover:bg-surface-2">
            <div className="min-w-0">
              <p className="font-medium">{p.full_name || "No name"} {p.is_admin && <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-[10px]">ADMIN</span>}</p>
              <p className="truncate text-xs text-muted">{emails.get(p.id) ?? p.id} · joined {when(p.created_at)}</p>
            </div>
            <p className="whitespace-nowrap font-semibold">{naira(Number(p.balance))}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
