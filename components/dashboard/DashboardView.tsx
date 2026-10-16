import Link from "next/link";
import { naira } from "@/lib/site";
import { StatusChip } from "./StatusChip";
import { PlatformBadge } from "./PlatformBadge";
import { card } from "@/lib/ui";

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
  const stats = [
    { label: "Total orders", value: orders.length, dot: "bg-foreground" },
    { label: "Active", value: active, dot: "bg-amber-300" },
    { label: "Completed", value: completed, dot: "bg-accent" },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hi {first} 👋</h1>
        <p className="text-sm text-muted">Here&apos;s your account at a glance.</p>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#5a2fe0] to-[#2b1480] p-6 shadow-xl shadow-primary/20">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/25 blur-3xl" />
        <p className="text-sm text-white/70">Wallet balance</p>
        <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{naira(balance)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`${base}/add-funds`} className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black transition active:scale-95">
            Add funds
          </Link>
          <Link href={`${base}/new-order`} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/25 backdrop-blur transition active:scale-95">
            New order
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`${card} p-4`}>
            <span className={`mb-3 block h-1.5 w-6 rounded-full ${s.dot}`} />
            <p className="text-3xl font-bold leading-none">{s.value}</p>
            <p className="mt-1.5 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link href={`${base}/orders`} className="text-sm text-accent">View all</Link>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-medium">No orders yet</p>
            <p className="mt-1 text-sm text-muted">Add funds, then place your first order.</p>
          </div>
        ) : (
          <div className={`${card} divide-y divide-border overflow-hidden`}>
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-4 py-3.5 text-sm">
                <PlatformBadge name={o.service_name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{o.service_name}</p>
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
