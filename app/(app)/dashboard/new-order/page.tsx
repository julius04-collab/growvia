import { requireUser } from "@/lib/auth";
import { providerMode } from "@/lib/provider";
import type { DbService } from "@/lib/types";
import { NewOrderForm } from "@/components/dashboard/NewOrderForm";

export default async function NewOrderPage() {
  const { supabase, user } = await requireUser();
  const [{ data: services }, { data: profile }] = await Promise.all([
    supabase
      .from("services")
      .select("id,platform,name,price_per_1000,min_qty,max_qty,start_time,refill")
      .eq("active", true)
      .order("platform")
      .order("id"),
    supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New order</h1>
      <NewOrderForm
        services={(services ?? []) as DbService[]}
        balance={Number(profile?.balance ?? 0)}
        simulated={providerMode() === "mock"}
      />
    </div>
  );
}
