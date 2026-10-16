import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { naira } from "@/lib/site";
import { card, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { FilterChips } from "@/components/admin/FilterChips";

const filters: Record<string, string[] | null> = {
  all: null,
  active: ["pending", "in_progress"],
  completed: ["completed"],
  partial: ["partial"],
  cancelled: ["cancelled"],
};

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const key = status in filters ? status : "all";
  const { admin } = await requireAdmin();
  let q = admin
    .from("orders")
    .select("id,user_id,service_name,link,quantity,charge,status,refunded,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filters[key]) q = q.in("status", filters[key]!);
  const { data } = await q;
  const orders = data ?? [];
  const ids = Array.from(new Set(orders.map((o) => o.user_id)));
  const { data: profiles } = ids.length ? await admin.from("profiles").select("id,full_name").in("id", ids) : { data: [] };
  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "Customer"]));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <FilterChips
        base="/admin/orders"
        current={key}
        options={[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "completed", label: "Completed" },
          { key: "partial", label: "Partial" },
          { key: "cancelled", label: "Cancelled" },
        ]}
      />
      <div className={`${card} divide-y divide-border overflow-hidden`}>
        {orders.length === 0 && <p className="p-8 text-center text-sm text-muted">No orders {key === "all" ? "yet" : "in this view"}.</p>}
        {orders.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-4 text-sm transition hover:bg-surface-2">
            <div className="min-w-0">
              <p className="font-medium">#{o.id} · {o.service_name}</p>
              <p className="truncate text-xs text-muted">
                {names.get(o.user_id)} · {Number(o.quantity).toLocaleString()} · {naira(Number(o.charge))} · {when(o.created_at)}
              </p>
              <p className="truncate text-xs text-muted/70">{o.link}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusChip status={o.status} />
              {o.refunded && <span className="text-[11px] text-muted">refunded</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
