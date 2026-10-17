import { requireUser } from "@/lib/auth";
import { providerMode } from "@/lib/provider";
import { getSettings } from "@/lib/settings";
import { fetchAll } from "@/lib/paged";
import type { DbService } from "@/lib/types";
import { NewOrderForm } from "@/components/dashboard/NewOrderForm";

export default async function NewOrderPage() {
  const { supabase, user } = await requireUser();
  const [services, { data: profile }] = await Promise.all([
    fetchAll<DbService>((a, b) =>
      supabase
        .from("services")
        .select("id,platform,name,price_per_1000,min_qty,max_qty,start_time,refill")
        .eq("active", true)
        .order("platform")
        .order("id")
        .range(a, b),
    ).catch(() => [] as DbService[]),
    supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle(),
  ]);

  const { settings } = await getSettings(supabase);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New order</h1>
      <NewOrderForm
        services={services}
        balance={Number(profile?.balance ?? 0)}
        simulated={providerMode() === "mock"}
        paused={settings.ordersPaused}
      />
    </div>
  );
}
