import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { isoAgo } from "@/lib/time";
import { providerBalance, providerHost, providerMode, providerServices, type ProviderService } from "@/lib/provider";
import { getSettings } from "@/lib/settings";
import { card, when } from "@/lib/ui";
import { Notice, StateCard } from "@/components/ui/StateCard";

async function settle<T>(p: Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  try {
    return { ok: true, value: await p };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export default async function AdminSupplier() {
  const { admin } = await requireAdmin();
  const live = providerMode() === "live";
  const dayAgo = isoAgo(24 * 3600 * 1000);
  const head = { count: "exact" as const, head: true };

  const [bal, list, cfg, unmapped, failed, recentFailed] = await Promise.all([
    live ? settle(providerBalance()) : Promise.resolve(null),
    live ? settle(providerServices()) : Promise.resolve(null),
    getSettings(admin),
    admin.from("services").select("id,platform,name").eq("active", true).is("provider_service_id", null),
    admin.from("orders").select("id", head).eq("status", "cancelled").is("provider_order_id", null).gte("created_at", dayAgo),
    admin.from("orders").select("id,service_name,created_at").eq("status", "cancelled").is("provider_order_id", null).order("created_at", { ascending: false }).limit(5),
  ]);

  const low = bal?.ok && cfg.settings.lowBalanceAlert > 0 && bal.value.balance < cfg.settings.lowBalanceAlert;
  const groups = new Map<string, ProviderService[]>();
  if (list?.ok) for (const s of list.value) groups.set(s.category, [...(groups.get(s.category) ?? []), s]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Supplier</h1>
        <p className="text-sm text-muted">The provider that actually delivers your orders.</p>
      </div>

      {!live ? (
        <div className={card}>
          <StateCard
            icon="server"
            tone="warn"
            title="No supplier connected"
            text="Orders are being simulated: they move from pending to completed on their own and nothing is delivered. Add the two variables below in Vercel, then redeploy."
          >
            <pre className="mt-4 w-full overflow-x-auto rounded-xl bg-surface-2 p-3 text-left text-xs">{`PROVIDER_API_URL=https://their-site.com/api/v2
PROVIDER_API_KEY=your-key`}</pre>
          </StateCard>
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <div className={`${card} p-5`}>
              <p className="text-xs text-muted">Supplier balance</p>
              {bal?.ok ? (
                <p className="mt-1 text-2xl font-bold">{bal.value.balance.toLocaleString("en-NG", { maximumFractionDigits: 2 })} <span className="text-sm font-normal text-muted">{bal.value.currency}</span></p>
              ) : (
                <p className="mt-1 text-sm text-red-300">Could not read: {bal && !bal.ok ? bal.error : ""}</p>
              )}
            </div>
            <div className={`${card} p-5`}>
              <p className="text-xs text-muted">Connected to</p>
              <p className="mt-1 break-all text-sm font-semibold">{providerHost() ?? "-"}</p>
              <p className="text-xs text-muted">API key is set (never shown)</p>
            </div>
            <div className={`${card} p-5`}>
              <p className="text-xs text-muted">Failed at supplier (24h)</p>
              <p className="mt-1 text-2xl font-bold">{failed.count ?? 0}</p>
              <p className="text-xs text-muted">refunded automatically</p>
            </div>
          </section>

          {low && bal?.ok && (
            <Notice tone="bad">
              Supplier balance is below your alert level ({cfg.settings.lowBalanceAlert.toLocaleString()}). Top up your provider account, or orders will start failing. You can{" "}
              <Link href="/admin/settings" className="underline">pause new orders</Link> in the meantime.
            </Notice>
          )}
          {bal && !bal.ok && <Notice tone="bad">We could not reach the supplier. Check PROVIDER_API_URL and PROVIDER_API_KEY in Vercel. Orders placed now may fail and be refunded.</Notice>}
          {(failed.count ?? 0) > 0 && (
            <section className="space-y-2">
              <h2 className="font-semibold">Recent orders that failed at the supplier</h2>
              <div className={`${card} divide-y divide-border overflow-hidden`}>
                {(recentFailed.data ?? []).map((o) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex justify-between gap-3 px-5 py-3 text-sm transition hover:bg-surface-2">
                    <span>#{o.id} · {o.service_name}</span><span className="text-muted">{when(o.created_at)}</span>
                  </Link>
                ))}
              </div>
              <p className="text-xs text-muted">Common causes: not enough supplier balance, a wrong provider service ID, or the supplier being down.</p>
            </section>
          )}
        </>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Services without a provider service ID <span className="text-muted">({(unmapped.data ?? []).length})</span></h2>
        {(unmapped.data ?? []).length === 0 ? (
          <Notice tone="good">Every active service is mapped to a provider service.</Notice>
        ) : (
          <>
            <p className="text-sm text-muted">{live ? "Orders for these will fail until you map them." : "Map these before going live."} Find the ID in the list below, then enter it on the Services page.</p>
            <div className={`${card} divide-y divide-border overflow-hidden`}>
              {(unmapped.data ?? []).map((s) => (
                <Link key={s.id} href="/admin/services" className="flex justify-between px-5 py-3 text-sm transition hover:bg-surface-2">
                  <span>{s.platform} {s.name}</span><span className="text-accent">Map →</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {live && (
        <section className="space-y-3">
          <h2 className="font-semibold">Supplier service list</h2>
          {!list?.ok ? (
            <Notice tone="bad">Could not load the service list: {list && !list.ok ? list.error : ""}</Notice>
          ) : (
            <>
              <p className="text-sm text-muted">{list.value.length} services. The <b>ID</b> column is what you enter as “Provider service ID”. Rates are per 1,000 in your provider&apos;s currency.</p>
              <div className="space-y-2">
                {Array.from(groups.entries()).slice(0, 60).map(([cat, rows]) => (
                  <details key={cat} className={`${card} group`}>
                    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-medium">
                      <span className="min-w-0 truncate">{cat}</span><span className="text-xs text-muted">{rows.length}</span>
                    </summary>
                    <div className="divide-y divide-border border-t border-border">
                      {rows.slice(0, 80).map((s) => (
                        <div key={s.service} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 px-5 py-3 text-xs">
                          <span className="rounded bg-surface-2 px-2 py-1 font-mono">{s.service}</span>
                          <span className="min-w-0">{s.name}<span className="block text-muted">{s.min.toLocaleString()} – {s.max.toLocaleString()}{s.refill ? " · refill" : ""}</span></span>
                          <span className="whitespace-nowrap font-semibold">{s.rate}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
