import { requireUser } from "@/lib/auth";
import { OrdersView, type OrderItem } from "@/components/dashboard/OrdersView";
import { AutoRefresh } from "@/components/dashboard/AutoRefresh";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ placed?: string }> }) {
  const { placed } = await searchParams;
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("orders")
    .select("id,service_name,link,quantity,charge,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const list = (data ?? []) as OrderItem[];
  const active = list.filter((o) => o.status === "pending" || o.status === "in_progress").length;

  return (
    <div className="space-y-5">
      <AutoRefresh active={active} />
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      {placed && (
        <p role="status" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
          Order #{placed} placed. Its status updates here automatically.
        </p>
      )}
      <OrdersView orders={list} />
    </div>
  );
}
