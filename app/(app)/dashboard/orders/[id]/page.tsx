import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { naira } from "@/lib/site";
import { btnGhost, btnPrimary, card, when } from "@/lib/ui";
import { AutoRefresh } from "@/components/dashboard/AutoRefresh";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { PlatformBadge } from "@/components/dashboard/PlatformBadge";
import { OrderTimeline } from "@/components/dashboard/OrderTimeline";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,12}$/.test(id)) notFound();
  const { supabase } = await requireUser();
  // Row level security means this only ever returns the signed-in user's own order.
  const { data: o } = await supabase.from("orders").select("*").eq("id", Number(id)).maybeSingle();
  if (!o) notFound();

  const active = o.status === "pending" || o.status === "in_progress" ? 1 : 0;
  const refunded = Number(o.refunded_amount ?? (o.refunded ? o.charge : 0));
  const rows: [string, React.ReactNode][] = [
    ["Order number", `#${o.id}`],
    ["Quantity", Number(o.quantity).toLocaleString()],
    ["Amount charged", naira(Number(o.charge))],
    ["Placed", when(o.created_at)],
  ];

  return (
    <div className="space-y-6">
      <AutoRefresh active={active} />
      <div>
        <Link href="/dashboard/orders" className="text-sm text-muted hover:text-foreground">← All orders</Link>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <PlatformBadge name={o.service_name} />
            <div>
              <h1 className="text-xl font-bold tracking-tight">{o.service_name}</h1>
              <p className="text-sm text-muted">Order #{o.id}</p>
            </div>
          </div>
          <StatusChip status={o.status} />
        </div>
      </div>

      <section className={`${card} p-5`}>
        <h2 className="mb-4 text-sm font-medium text-muted">Progress</h2>
        <OrderTimeline status={o.status} refunded={refunded} />
      </section>

      <section className={`${card} divide-y divide-border text-sm`}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-5 py-3"><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>
        ))}
        <div className="flex justify-between gap-4 px-5 py-3">
          <span className="text-muted">Link</span>
          <span className="min-w-0 break-all text-right font-medium">{o.link}</span>
        </div>
        {refunded > 0 && (
          <div className="flex justify-between gap-4 px-5 py-3"><span className="text-muted">Refunded to wallet</span><span className="font-semibold text-accent">{naira(refunded)}</span></div>
        )}
      </section>

      {o.status === "partial" && refunded === 0 && (
        <p className="rounded-xl bg-orange-300/10 px-4 py-3 text-sm text-orange-200">
          Part of this order was delivered. We review partial orders and refund the undelivered part to your wallet. Contact support if you want it sooner.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`/dashboard/support?subject=${encodeURIComponent(`Order #${o.id}`)}`} className={btnGhost}>Need help with this order?</Link>
        <Link href="/dashboard/new-order" className={btnPrimary}>Order again</Link>
      </div>
    </div>
  );
}
