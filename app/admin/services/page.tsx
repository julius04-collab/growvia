import { requireAdmin } from "@/lib/auth";
import { card, inputCls, btnPrimary } from "@/lib/ui";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { addService, saveService } from "../actions";

const small = `${inputCls} py-2`;

const PAGE = 50;

export default async function AdminServices({ searchParams }: { searchParams: Promise<FlashParams & { q?: string; page?: string }> }) {
  const flash = await searchParams;
  const { admin } = await requireAdmin();
  const q = (flash.q ?? "").trim().slice(0, 60).replace(/[%,()]/g, " ");
  const page = Math.max(1, Number(flash.page) || 1);

  let query = admin.from("services").select("*", { count: "exact" }).order("platform").order("id").range((page - 1) * PAGE, page * PAGE - 1);
  if (q) query = query.or(`name.ilike.%${q}%,platform.ilike.%${q}%`);
  const { data, count: matching } = await query;

  const total = (await admin.from("services").select("id", { count: "exact", head: true })).count ?? 0;
  const live = (await admin.from("services").select("id", { count: "exact", head: true }).eq("active", true)).count ?? 0;
  const fromSupplier = (await admin.from("services").select("id", { count: "exact", head: true }).not("provider_service_id", "is", null)).count ?? 0;
  const pages = Math.max(1, Math.ceil((matching ?? 0) / PAGE));
  const link = (p: number) => `/admin/services?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services and prices</h1>
        <p className="text-sm text-muted">
          Price is what customers pay per 1,000 (₦). Provider service ID is the ID from your provider&apos;s service list, used once a real provider is connected.
        </p>
      </div>

      <Flash {...flash} />

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className={`${card} p-4`}><p className="text-2xl font-bold">{total}</p><p className="text-muted">Total</p></div>
        <div className={`${card} p-4`}><p className="text-2xl font-bold">{live}</p><p className="text-muted">Live for customers</p></div>
        <div className={`${card} p-4`}><p className="text-2xl font-bold">{fromSupplier}</p><p className="text-muted">Imported from supplier</p></div>
      </div>

      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search services, e.g. tiktok followers" className={`${small} flex-1`} />
        <button className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface-2">Search</button>
      </form>
      <p className="text-sm text-muted">{matching ?? 0} match{matching === 1 ? "" : "es"} · page {page} of {pages}</p>

      <div className="space-y-3">
        {(data ?? []).map((s) => (
          <form key={s.id} action={saveService} className={`${card} grid gap-3 p-4 text-sm sm:grid-cols-6`}>
            <input type="hidden" name="id" value={s.id} />
            <p className="font-medium sm:col-span-6">{s.platform} {s.name}</p>
            <label>Price / 1k<input name="price_per_1000" type="number" step="0.01" min="0" defaultValue={s.price_per_1000} className={small} /></label>
            <label>Min<input name="min_qty" type="number" min="1" defaultValue={s.min_qty} className={small} /></label>
            <label>Max<input name="max_qty" type="number" min="1" defaultValue={s.max_qty} className={small} /></label>
            <label className="sm:col-span-2">Provider service ID<input name="provider_service_id" defaultValue={s.provider_service_id ?? ""} className={small} /></label>
            <div className="flex items-end justify-between gap-3">
              <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={s.active} /> Active</label>
              <button className="rounded-xl border border-border px-4 py-2 hover:bg-surface-2">Save</button>
            </div>
          </form>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          {page > 1 ? <a href={link(page - 1)} className="rounded-xl border border-border px-4 py-2 hover:bg-surface-2">← Previous</a> : <span />}
          {page < pages ? <a href={link(page + 1)} className="rounded-xl border border-border px-4 py-2 hover:bg-surface-2">Next →</a> : <span />}
        </div>
      )}

      <form action={addService} className={`${card} grid gap-3 p-5 text-sm sm:grid-cols-3`}>
        <h2 className="font-semibold sm:col-span-3">Add a service</h2>
        <label>Platform<input name="platform" required placeholder="Instagram" className={small} /></label>
        <label>Name<input name="name" required placeholder="Followers" className={small} /></label>
        <label>Price / 1k (₦)<input name="price_per_1000" type="number" step="0.01" min="0" required className={small} /></label>
        <label>Min<input name="min_qty" type="number" min="1" required className={small} /></label>
        <label>Max<input name="max_qty" type="number" min="1" required className={small} /></label>
        <label>Starts<input name="start_time" placeholder="0-1 hour" className={small} /></label>
        <label>Provider service ID<input name="provider_service_id" className={small} /></label>
        <label className="flex items-end gap-2 pb-2"><input type="checkbox" name="refill" /> Refill</label>
        <div className="flex items-end"><button className={btnPrimary}>Add service</button></div>
      </form>
    </div>
  );
}
