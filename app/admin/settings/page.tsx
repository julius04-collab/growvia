import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { gatewayInfo } from "@/lib/payments";
import { providerMode } from "@/lib/provider";
import { btnPrimary, card, inputCls } from "@/lib/ui";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { Notice } from "@/components/ui/StateCard";
import { saveSettings } from "../actions";

export default async function AdminSettings({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const flash = await searchParams;
  const { admin } = await requireAdmin();
  const { settings, ready } = await getSettings(admin);
  const gw = gatewayInfo();

  const status: [string, string, boolean][] = [
    ["Payment gateway", gw.enabled.length ? gw.enabled.map((g) => `${g}${gw.test[g] ? " (test)" : ""}`).join(", ") : "Not configured", gw.enabled.length > 0],
    ["Supplier", providerMode() === "live" ? "Connected" : "Simulated (no provider)", providerMode() === "live"],
    ["Service role key", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)],
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">Changes apply straight away. No redeploy needed.</p>
      </div>
      <Flash {...flash} />
      {!ready && <Notice tone="warn">The settings table does not exist yet. Run the latest <b>supabase/setup-all.sql</b> in Supabase (safe to run again), then reload.</Notice>}

      <form action={saveSettings} className={`${card} space-y-5 p-5 text-sm`}>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="orders_paused" defaultChecked={settings.ordersPaused} className="mt-1 accent-[#b6ff3b]" />
          <span>
            <span className="block font-medium">Pause new orders</span>
            <span className="block text-xs text-muted">Customers see a “new orders are paused” screen. Use this when your supplier balance runs out or the supplier is down. Wallets and existing orders are not affected.</span>
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block text-muted">Announcement on every customer dashboard (optional)</span>
          <input name="announcement" defaultValue={settings.announcement} maxLength={300} placeholder="e.g. Instagram followers are slower today" className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-muted">Support email</span>
            <input name="support_email" type="email" defaultValue={settings.supportEmail} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-muted">Support WhatsApp</span>
            <input name="support_whatsapp" defaultValue={settings.supportWhatsapp} className={inputCls} />
          </label>
        </div>
        <label className="block sm:max-w-xs">
          <span className="mb-1 block text-muted">Warn me when supplier balance drops below</span>
          <input name="low_balance_alert" type="number" min="0" step="1" defaultValue={settings.lowBalanceAlert || ""} placeholder="0 = off" className={inputCls} />
          <span className="mt-1 block text-xs text-muted">In your provider&apos;s currency (shown on the Supplier page).</span>
        </label>
        <button className={btnPrimary}>Save settings</button>
      </form>

      <section className="space-y-2">
        <h2 className="font-semibold">Connections</h2>
        <p className="text-sm text-muted">These are set as environment variables in Vercel, so they are shown here but changed there.</p>
        <div className={`${card} divide-y divide-border text-sm`}>
          {status.map(([k, v, ok]) => (
            <div key={k} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="text-muted">{k}</span>
              <span className={`font-medium ${ok ? "text-accent" : "text-amber-300"}`}>{v}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
