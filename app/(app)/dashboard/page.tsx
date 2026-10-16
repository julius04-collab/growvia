import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { Notice } from "@/components/ui/StateCard";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { AutoRefresh } from "@/components/dashboard/AutoRefresh";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: orders }, { settings }] = await Promise.all([
    supabase.from("profiles").select("full_name,balance").eq("id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("id,service_name,quantity,charge,status,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    getSettings(supabase),
  ]);

  const first = (profile?.full_name || user.user_metadata?.full_name || "there").split(" ")[0];
  const active = (orders ?? []).filter((o) => o.status === "pending" || o.status === "in_progress").length;
  return (
    <>
      <AutoRefresh active={active} />
      {settings.ordersPaused && <div className="mb-4"><Notice tone="warn">New orders are paused for a short while. Your wallet and existing orders are safe.</Notice></div>}
      {settings.announcement && <div className="mb-4"><Notice>{settings.announcement}</Notice></div>}
      <DashboardView first={first} balance={Number(profile?.balance ?? 0)} orders={orders ?? []} />
    </>
  );
}
