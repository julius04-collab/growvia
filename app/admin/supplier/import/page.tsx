import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { providerBalance, providerKind, providerMode, providerServices } from "@/lib/provider";
import { Notice, StateCard } from "@/components/ui/StateCard";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { ImportPicker, type PickRow } from "@/components/admin/ImportPicker";
import { card } from "@/lib/ui";
import { importServices } from "../../actions";

export default async function ImportServicesPage({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const flash = await searchParams;
  const { admin } = await requireAdmin();

  if (providerMode() !== "live") {
    return (
      <div className={card}>
        <StateCard icon="server" tone="warn" title="Connect your supplier first" text="Add PROVIDER_API_URL and PROVIDER_API_KEY in Vercel, redeploy, then come back to import real services." actions={[{ label: "Back to Supplier", href: "/admin/supplier" }]} />
      </div>
    );
  }

  let list;
  let error = "";
  try {
    list = await providerServices();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }
  const currency = await providerBalance().then((b) => b.currency).catch(() => "");
  const { data: existing } = await admin.from("services").select("provider_service_id").not("provider_service_id", "is", null);
  const have = new Set((existing ?? []).map((r) => String(r.provider_service_id)));

  const rows: PickRow[] = (list ?? []).map((s) => ({
    id: s.service,
    name: s.name,
    category: s.category,
    platform: s.platform ?? "",
    rate: s.rate,
    min: s.min,
    max: s.max,
    delivery: s.delivery ?? "",
    imported: have.has(s.service),
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/supplier" className="text-sm text-muted hover:text-foreground">← Supplier</Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Import services</h1>
        <p className="text-sm text-muted">Pick the supplier services you want to sell. Each one is saved with the supplier&apos;s ID, so orders go to the right service.</p>
      </div>
      <Flash {...flash} />
      {providerKind() === "pawaboost" && (
        <Notice tone="warn">
          PawaBoost&apos;s docs don&apos;t say whether their price is per unit or per 1,000. Their example suggests per 1,000, which is what this page assumes. Import one service, place one small test order, and confirm the charge before importing more.
        </Notice>
      )}
      {error ? <Notice tone="bad">Could not load the supplier&apos;s services: {error}</Notice> : <ImportPicker rows={rows} action={importServices} currency={currency} />}
    </div>
  );
}
