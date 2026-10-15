import { requireAdmin } from "@/lib/auth";
import { naira } from "@/lib/site";
import { card, inputCls, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { setOrderStatus } from "../actions";

export default async function AdminOrders() {
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("orders")
    .select("id,user_id,service_name,link,quantity,charge,status,refunded,provider_order_id,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const orders = data ?? [];
  const ids = Array.from(new Set(orders.map((o) => o.user_id)));
  const { data: profiles } = ids.length ? await admin.from("profiles").select("id,full_name").in("id", ids) : { data: [] };
  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "User"]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <div className={`${card} divide-y divide-border overflow-hidden`}>
        {orders.length === 0 && <p className="p-8 text-center text-sm text-muted">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="space-y-3 px-5 py-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">#{o.id} · {o.service_name}</p>
                <p className="text-xs text-muted">
                  {names.get(o.user_id)} · {Number(o.quantity).toLocaleString()} · {naira(Number(o.charge))} · {when(o.created_at)}
                </p>
                <p className="truncate text-xs text-muted">{o.link}</p>
              </div>
              <StatusChip status={o.status} />
            </div>
            {!o.refunded && (
              <form action={setOrderStatus} className="flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className={`${inputCls} max-w-44 py-2`}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="partial">Partial</option>
                  <option value="cancelled">Cancel and refund</option>
                </select>
                <button className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface-2">Update</button>
              </form>
            )}
            {o.refunded && <p className="text-xs text-muted">Refunded to the customer wallet.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
