import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { isoAgo } from "@/lib/time";
import { naira } from "@/lib/site";
import { btnGhost, card, inputCls, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { refundOrderFull, refundOrderPartial, verifyPaymentNow } from "../actions";

export default async function AdminRefunds({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const flash = await searchParams;
  const { admin } = await requireAdmin();
  const staleCutoff = isoAgo(15 * 60 * 1000);
  const [{ data: partial }, { data: stale }, { data: history }] = await Promise.all([
    admin.from("orders").select("*").eq("status", "partial").eq("refunded", false).order("created_at", { ascending: false }).limit(50),
    admin.from("payments").select("id,user_id,reference,gateway,amount,created_at").eq("status", "pending").lte("created_at", staleCutoff).order("created_at", { ascending: false }).limit(50),
    admin.from("orders").select("*").eq("refunded", true).order("created_at", { ascending: false }).limit(30),
  ]);
  const total = (history ?? []).reduce((t, o) => t + Number(o.refunded_amount ?? o.charge ?? 0), 0);
  const back = "/admin/refunds";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Refunds</h1>
        <p className="text-sm text-muted">Failed and cancelled orders are refunded automatically. This page is for the cases that need a decision.</p>
      </div>
      <Flash {...flash} />

      <section className="space-y-3">
        <h2 className="font-semibold">Partial orders waiting for a decision <span className="text-muted">({(partial ?? []).length})</span></h2>
        {(partial ?? []).length === 0 && <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">Nothing waiting.</p>}
        {(partial ?? []).map((o) => (
          <article key={o.id} className={`${card} space-y-3 p-5 text-sm`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-accent">#{o.id} · {o.service_name}</Link>
                <p className="text-xs text-muted">{Number(o.quantity).toLocaleString()} ordered · charged {naira(Number(o.charge))} · {when(o.created_at)}</p>
              </div>
              <StatusChip status="partial" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <form action={refundOrderPartial} className="flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="back" value={back} />
                <input name="amount" type="number" step="0.01" min="1" max={Number(o.charge)} required placeholder="Undelivered ₦" className={inputCls} />
                <button className={btnGhost}>Refund part</button>
              </form>
              <form action={refundOrderFull}>
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="back" value={back} />
                <button className="rounded-xl border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-400/10">Refund in full</button>
              </form>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Payments not confirmed after 15 minutes <span className="text-muted">({(stale ?? []).length})</span></h2>
        <p className="text-sm text-muted">Usually the customer closed the page before paying. Verify asks the gateway directly and credits the wallet only if the full amount was paid.</p>
        {(stale ?? []).length === 0 && <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">Nothing stuck.</p>}
        <div className={`${card} divide-y divide-border overflow-hidden empty:hidden`}>
          {(stale ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
              <div className="min-w-0">
                <Link href={`/admin/users/${p.user_id}`} className="font-medium">{naira(Number(p.amount))}</Link>
                <p className="truncate text-xs capitalize text-muted">{p.gateway} · {when(p.created_at)} · {p.reference}</p>
              </div>
              <form action={verifyPaymentNow}>
                <input type="hidden" name="reference" value={p.reference} />
                <input type="hidden" name="back" value={back} />
                <button className={btnGhost}>Verify</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="font-semibold">Refund history</h2>
          <p className="text-sm text-muted">Last {(history ?? []).length}: <span className="font-semibold text-foreground">{naira(total)}</span></p>
        </div>
        <div className={`${card} divide-y divide-border overflow-hidden`}>
          {(history ?? []).length === 0 && <p className="p-6 text-center text-sm text-muted">No refunds yet.</p>}
          {(history ?? []).map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition hover:bg-surface-2">
              <span className="min-w-0 truncate">#{o.id} · {o.service_name} · {when(o.created_at)}</span>
              <span className="whitespace-nowrap font-medium">{naira(Number(o.refunded_amount ?? o.charge))}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
