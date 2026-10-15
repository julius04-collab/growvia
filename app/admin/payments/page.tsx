import { requireAdmin } from "@/lib/auth";
import { naira } from "@/lib/site";
import { card, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";

export default async function AdminPayments() {
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("payments")
    .select("id,user_id,reference,gateway,amount,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = data ?? [];
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profiles } = ids.length ? await admin.from("profiles").select("id,full_name").in("id", ids) : { data: [] };
  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "User"]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
      <div className={`${card} divide-y divide-border overflow-hidden`}>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-muted">No payments yet.</p>}
        {rows.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
            <div className="min-w-0">
              <p className="font-medium">{naira(Number(p.amount))} · {names.get(p.user_id)}</p>
              <p className="truncate text-xs capitalize text-muted">{p.gateway} · {when(p.created_at)} · {p.reference}</p>
            </div>
            <StatusChip status={p.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
