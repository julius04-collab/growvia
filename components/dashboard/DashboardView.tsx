import Link from "next/link";
import { naira } from "@/lib/site";
import { StatusChip } from "./StatusChip";

export type OrderRow = {
  id: number;
  service_name: string;
  quantity: number;
  charge: number;
  status: string;
};

export function DashboardView({
  first,
  balance,
  orders,
  base = "/dashboard",
}: {
  first: string;
  balance: number;
  orders: OrderRow[];
  base?: string;
}) {
  const active = orders.filter((o) => o.status === "pending" || o.status === "in_progress").length;
  const completed = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hi {first} 👋</h1>
        <p className="text-sm text-muted">Here&apos;s your account at a glance.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <p className="text-sm text-muted">Wallet balance</p>
          <p className="text-4xl font-bold">{naira(balance)}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`${base}/add-funds`} className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black">Add funds</Link>
          <Link href={`${base}/new-order`} className="rounded-xl border border-border px-5 py-3 text-sm font-semibold">New order</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[["Total orders", orders.length], ["Active", active], ["Completed", completed]].map(([k, v]) => (
          <div key={String(k)} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-2xl font-bold">{v}</p>
            <p className="text-xs text-muted">{k}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href={`${base}/orders`} className="text-sm text-accent">View all</Link>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-medium">No orders yet</p>
            <p className="mt-1 text-sm text-muted">Add funds, then place your first order.</p>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
                <div>
                  <p className="font-medium">{o.service_name}</p>
                  <p className="text-xs text-muted">#{o.id} · {Number(o.quantity).toLocaleString()} · {naira(Number(o.charge))}</p>
                </div>
                <StatusChip status={o.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
