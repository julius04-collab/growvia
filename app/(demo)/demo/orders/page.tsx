import { naira } from "@/lib/site";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { demoOrders } from "@/lib/demo-data";

export default function DemoOrders() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {demoOrders.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
            <div className="min-w-0">
              <p className="font-medium">{o.service_name}</p>
              <p className="truncate text-xs text-muted">#{o.id} · {o.quantity.toLocaleString()} · {naira(o.charge)}</p>
            </div>
            <StatusChip status={o.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
