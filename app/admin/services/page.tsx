import { requireAdmin } from "@/lib/auth";
import { card, inputCls, btnPrimary } from "@/lib/ui";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { addService, saveService } from "../actions";

const small = `${inputCls} py-2`;

export default async function AdminServices({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const flash = await searchParams;
  const { admin } = await requireAdmin();
  const { data } = await admin.from("services").select("*").order("platform").order("id");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services and prices</h1>
        <p className="text-sm text-muted">
          Price is what customers pay per 1,000 (₦). Provider service ID is the ID from your provider&apos;s service list, used once a real provider is connected.
        </p>
      </div>

      <Flash {...flash} />
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
