import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { naira } from "@/lib/site";
import { btnGhost, card, inputCls, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { adjustWallet } from "../../actions";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminUser({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<FlashParams> }) {
  const [{ id }, flash] = await Promise.all([params, searchParams]);
  if (!uuid.test(id)) notFound();
  const { admin } = await requireAdmin();
  const { data: p } = await admin.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  const [{ data: authUser }, { data: orders }, { data: payments }, { data: tickets }, { data: adjustments }] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from("orders").select("id,service_name,quantity,charge,status,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
    admin.from("payments").select("id,reference,gateway,amount,status,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
    admin.from("tickets").select("id,subject,status,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(5),
    admin.from("wallet_adjustments").select("id,amount,note,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
  ]);
  const u = authUser?.user;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm text-muted hover:text-foreground">← All customers</Link>
      <Flash {...flash} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{p.full_name || "No name"} {p.is_admin && <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-[10px] align-middle">ADMIN</span>}</h1>
          <p className="text-sm text-muted">{u?.email ?? id}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{naira(Number(p.balance))}</p>
          <p className="text-xs text-muted">wallet balance</p>
        </div>
      </div>

      <section className={`${card} divide-y divide-border text-sm`}>
        {[
          ["Joined", when(p.created_at)],
          ["Email confirmed", u?.email_confirmed_at ? "Yes" : "No"],
          ["Last sign in", u?.last_sign_in_at ? when(u.last_sign_in_at) : "Never"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between px-5 py-3"><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>
        ))}
      </section>

      <section className={`${card} space-y-3 p-5`}>
        <h2 className="font-semibold">Wallet adjustment</h2>
        <p className="text-sm text-muted">Use this to credit a payment that was not applied automatically, or to correct a mistake. Every change is logged with your note.</p>
        <form action={adjustWallet} className="grid gap-3 sm:grid-cols-[auto_1fr_2fr_auto]">
          <input type="hidden" name="user" value={id} />
          <select name="direction" className={inputCls} defaultValue="credit" aria-label="Credit or debit">
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <input name="amount" type="number" step="0.01" min="1" required placeholder="Amount ₦" className={inputCls} aria-label="Amount" />
          <input name="note" required minLength={3} maxLength={200} placeholder="Reason, e.g. Paid ₦5,000 by transfer ref 123" className={inputCls} aria-label="Reason" />
          <button className={btnGhost}>Apply</button>
        </form>
        {(adjustments ?? []).length > 0 && (
          <ul className="divide-y divide-border border-t border-border text-sm">
            {(adjustments ?? []).map((a) => (
              <li key={a.id} className="flex justify-between gap-3 py-2">
                <span className="min-w-0 truncate text-muted">{a.note} · {when(a.created_at)}</span>
                <span className={`whitespace-nowrap font-medium ${Number(a.amount) < 0 ? "text-red-300" : "text-accent"}`}>{Number(a.amount) < 0 ? "-" : "+"}{naira(Math.abs(Number(a.amount)))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Recent orders</h2>
        <div className={`${card} divide-y divide-border overflow-hidden`}>
          {(orders ?? []).length === 0 && <p className="p-6 text-center text-sm text-muted">No orders.</p>}
          {(orders ?? []).map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition hover:bg-surface-2">
              <span className="min-w-0 truncate">#{o.id} · {o.service_name} · {Number(o.quantity).toLocaleString()} · {naira(Number(o.charge))}</span>
              <StatusChip status={o.status} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Recent payments</h2>
        <div className={`${card} divide-y divide-border overflow-hidden`}>
          {(payments ?? []).length === 0 && <p className="p-6 text-center text-sm text-muted">No payments.</p>}
          {(payments ?? []).map((x) => (
            <div key={x.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <span className="min-w-0 truncate">{naira(Number(x.amount))} · <span className="capitalize">{x.gateway}</span> · {when(x.created_at)}</span>
              <StatusChip status={x.status} />
            </div>
          ))}
        </div>
      </section>

      {(tickets ?? []).length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Tickets</h2>
          <div className={`${card} divide-y divide-border overflow-hidden`}>
            {(tickets ?? []).map((t) => (
              <Link key={t.id} href="/admin/tickets" className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition hover:bg-surface-2">
                <span className="min-w-0 truncate">#{t.id} · {t.subject}</span>
                <StatusChip status={t.status} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
