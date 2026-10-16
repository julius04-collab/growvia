import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { isoAgo } from "@/lib/time";
import { providerMode } from "@/lib/provider";
import { getSettings } from "@/lib/settings";
import { naira } from "@/lib/site";
import { card, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { Notice } from "@/components/ui/StateCard";

export default async function AdminHome() {
  const { admin } = await requireAdmin();
  const head = { count: "exact" as const, head: true };
  const dayAgo = isoAgo(24 * 3600 * 1000);
  const staleCutoff = isoAgo(15 * 60 * 1000);
  const [users, orders, active, openTickets, paid, wallets, recent, unmapped, failedSupplier, stalePay, partial, cfg] = await Promise.all([
    admin.from("profiles").select("id", head),
    admin.from("orders").select("id", head),
    admin.from("orders").select("id", head).in("status", ["pending", "in_progress"]),
    admin.from("tickets").select("id", head).eq("status", "open"),
    admin.from("payments").select("amount").eq("status", "success").limit(5000),
    admin.from("profiles").select("balance").limit(5000),
    admin.from("orders").select("id,service_name,quantity,charge,status,created_at").order("created_at", { ascending: false }).limit(6),
    admin.from("services").select("id", head).eq("active", true).is("provider_service_id", null),
    admin.from("orders").select("id", head).eq("status", "cancelled").is("provider_order_id", null).gte("created_at", dayAgo),
    admin.from("payments").select("id", head).eq("status", "pending").lte("created_at", staleCutoff),
    admin.from("orders").select("id", head).eq("status", "partial").eq("refunded", false),
    getSettings(admin),
  ]);
  const sum = (rows: { [k: string]: unknown }[] | null, k: string) => (rows ?? []).reduce((t, r) => t + Number(r[k] ?? 0), 0);
  const live = providerMode() === "live";

  const alerts: { tone: "warn" | "bad"; text: React.ReactNode }[] = [];
  if (cfg.settings.ordersPaused) alerts.push({ tone: "warn", text: <>New orders are paused. <Link href="/admin/settings" className="underline">Resume in Settings</Link></> });
  if (!live) alerts.push({ tone: "warn", text: <>No supplier connected: orders are simulated. <Link href="/admin/supplier" className="underline">See Supplier</Link></> });
  if (live && (unmapped.count ?? 0) > 0) alerts.push({ tone: "bad", text: <>{unmapped.count} active service(s) have no provider service ID, so their orders will fail. <Link href="/admin/services" className="underline">Fix in Services</Link></> });
  if ((failedSupplier.count ?? 0) > 0) alerts.push({ tone: "bad", text: <>{failedSupplier.count} order(s) failed at the supplier in the last 24 hours and were refunded. <Link href="/admin/supplier" className="underline">Check supplier</Link></> });
  if ((stalePay.count ?? 0) > 0) alerts.push({ tone: "warn", text: <>{stalePay.count} payment(s) still unconfirmed after 15 minutes. <Link href="/admin/refunds" className="underline">Review</Link></> });
  if ((partial.count ?? 0) > 0) alerts.push({ tone: "warn", text: <>{partial.count} partial order(s) waiting for a refund decision. <Link href="/admin/refunds" className="underline">Review</Link></> });

  const stats: [string, string | number, string][] = [
    ["Customers", users.count ?? 0, "/admin/users"],
    ["Orders", orders.count ?? 0, "/admin/orders"],
    ["Active orders", active.count ?? 0, "/admin/orders?status=active"],
    ["Open tickets", openTickets.count ?? 0, "/admin/tickets"],
    ["Total funded", naira(sum(paid.data, "amount")), "/admin/payments"],
    ["Money in wallets", naira(sum(wallets.data, "balance")), "/admin/users"],
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>

      {alerts.length > 0 ? (
        <div className="space-y-2">{alerts.map((a, i) => <Notice key={i} tone={a.tone}>{a.text}</Notice>)}</div>
      ) : (
        <Notice tone="good">Everything looks healthy. Nothing needs your attention.</Notice>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map(([k, v, href]) => (
          <Link key={k} href={href} className={`${card} p-5 transition hover:bg-surface-2`}>
            <p className="text-2xl font-bold">{v}</p>
            <p className="text-xs text-muted">{k}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Latest orders</h2>
          <Link href="/admin/orders" className="text-sm text-accent">See all</Link>
        </div>
        <div className={`${card} divide-y divide-border overflow-hidden`}>
          {(recent.data ?? []).length === 0 && <p className="p-8 text-center text-sm text-muted">No orders yet.</p>}
          {(recent.data ?? []).map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-4 text-sm transition hover:bg-surface-2">
              <div className="min-w-0">
                <p className="truncate font-medium">#{o.id} · {o.service_name}</p>
                <p className="text-xs text-muted">{Number(o.quantity).toLocaleString()} · {naira(Number(o.charge))} · {when(o.created_at)}</p>
              </div>
              <StatusChip status={o.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
