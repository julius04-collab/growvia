import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { providerMode } from "@/lib/provider";
import { naira } from "@/lib/site";
import { btnGhost, card, inputCls, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { OrderTimeline } from "@/components/dashboard/OrderTimeline";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { refundOrderFull, refundOrderPartial, setOrderStatus, syncOneOrder } from "../../actions";

export default async function AdminOrderDetails({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<FlashParams> }) {
  const [{ id }, flash] = await Promise.all([params, searchParams]);
  if (!/^\d{1,12}$/.test(id)) notFound();
  const { admin } = await requireAdmin();
  const { data: o } = await admin.from("orders").select("*").eq("id", Number(id)).maybeSingle();
  if (!o) notFound();
  const [{ data: profile }, { data: authUser }] = await Promise.all([
    admin.from("profiles").select("full_name,balance").eq("id", o.user_id).maybeSingle(),
    admin.auth.admin.getUserById(o.user_id),
  ]);
  const refunded = Number(o.refunded_amount ?? (o.refunded ? o.charge : 0));
  const back = `/admin/orders/${o.id}`;
  const rows: [string, React.ReactNode][] = [
    ["Customer", <Link key="c" href={`/admin/users/${o.user_id}`} className="text-accent">{profile?.full_name || "Customer"}</Link>],
    ["Email", authUser?.user?.email ?? "-"],
    ["Quantity", Number(o.quantity).toLocaleString()],
    ["Charged", naira(Number(o.charge))],
    ["Placed", when(o.created_at)],
    ["Provider order ID", o.provider_order_id ?? "None (never reached the supplier)"],
    ["Service ID", o.service_id ? `#${o.service_id}` : "-"],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-sm text-muted hover:text-foreground">← All orders</Link>
      <Flash {...flash} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Order #{o.id}</h1>
          <p className="text-sm text-muted">{o.service_name}</p>
        </div>
        <StatusChip status={o.status} />
      </div>

      <section className={`${card} divide-y divide-border text-sm`}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-5 py-3"><span className="text-muted">{k}</span><span className="min-w-0 break-all text-right font-medium">{v}</span></div>
        ))}
        <div className="flex justify-between gap-4 px-5 py-3"><span className="text-muted">Link</span><a href={/^https?:\/\//i.test(o.link) ? o.link : undefined} target="_blank" rel="noreferrer" className="min-w-0 break-all text-right font-medium text-accent">{o.link}</a></div>
        {refunded > 0 && <div className="flex justify-between px-5 py-3"><span className="text-muted">Refunded to customer</span><span className="font-semibold text-accent">{naira(refunded)}</span></div>}
      </section>

      <section className={`${card} p-5`}>
        <h2 className="mb-4 text-sm font-medium text-muted">What the customer sees</h2>
        <OrderTimeline status={o.status} refunded={refunded} />
      </section>

      <section className={`${card} space-y-4 p-5`}>
        <h2 className="font-semibold">Actions</h2>
        {o.provider_order_id && (
          <form action={syncOneOrder}>
            <input type="hidden" name="id" value={o.id} />
            <button className={btnGhost}>{providerMode() === "mock" ? "Check status (simulated)" : "Check status with supplier"}</button>
          </form>
        )}
        {!o.refunded && (
          <>
            <form action={setOrderStatus} className="flex flex-wrap gap-2">
              <input type="hidden" name="id" value={o.id} />
              <select name="status" defaultValue={o.status} className={`${inputCls} max-w-48`}>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
                <option value="cancelled">Cancel and refund in full</option>
              </select>
              <button className={btnGhost}>Set status</button>
            </form>
            <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <form action={refundOrderFull} className="space-y-2">
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="back" value={back} />
                <p className="text-sm text-muted">Give the customer the whole {naira(Number(o.charge))} back and cancel the order.</p>
                <button className="rounded-xl border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-400/10">Refund in full</button>
              </form>
              <form action={refundOrderPartial} className="space-y-2">
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="back" value={back} />
                <p className="text-sm text-muted">Refund only the undelivered part (₦).</p>
                <div className="flex gap-2">
                  <input name="amount" type="number" step="0.01" min="1" max={Number(o.charge)} required placeholder="Amount" className={`${inputCls} max-w-36`} />
                  <button className={btnGhost}>Refund part</button>
                </div>
              </form>
            </div>
          </>
        )}
        {o.refunded && <p className="text-sm text-muted">This order has already been refunded, so it cannot be refunded again.</p>}
      </section>
    </div>
  );
}
