import { requireUser } from "@/lib/auth";
import { naira } from "@/lib/site";
import { card, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { AutoRefresh } from "@/components/dashboard/AutoRefresh";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ placed?: string }> }) {
  const { placed } = await searchParams;
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("orders")
    .select("id,service_name,link,quantity,charge,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const list = data ?? [];
  const active = list.filter((o) => o.status === "pending" || o.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <AutoRefresh active={active} />
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      {placed && (
        <p role="status" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
          Order #{placed} placed. Its status updates here automatically.
        </p>
      )}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-medium">No orders yet</p>
          <p className="mt-1 text-sm text-muted">Your orders will show up here.</p>
        </div>
      ) : (
        <div className={`${card} divide-y divide-border overflow-hidden`}>
          {list.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{o.service_name}</p>
                <p className="truncate text-xs text-muted">
                  #{o.id} · {Number(o.quantity).toLocaleString()} · {naira(Number(o.charge))} · {when(o.created_at)}
                </p>
                <p className="truncate text-xs text-muted">{o.link}</p>
              </div>
              <StatusChip status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
