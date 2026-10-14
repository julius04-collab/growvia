import { requireUser } from "@/lib/auth";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name,balance").eq("id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("id,service_name,quantity,charge,status,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const first = (profile?.full_name || user.user_metadata?.full_name || "there").split(" ")[0];
  return <DashboardView first={first} balance={Number(profile?.balance ?? 0)} orders={orders ?? []} />;
}
