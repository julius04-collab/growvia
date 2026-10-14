import { requireUser } from "@/lib/auth";
import { naira } from "@/lib/site";
import { StatusChip } from "@/components/dashboard/StatusChip";

export default async function OrdersPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("orders")
    .select("id,service_name,link,quantity,charge,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const list = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-medium">No orders yet</p>
          <p className="mt-1 text-sm text-muted">Your orders will show up here.</p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {list.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{o.service_name}</p>
                <p className="truncate text-xs text-muted">#{o.id} · {Number(o.quantity).toLocaleString()} · {naira(Number(o.charge))} · {o.link}</p>
              </div>
              <StatusChip status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
