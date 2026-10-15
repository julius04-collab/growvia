import { requireAdmin } from "@/lib/auth";
import { naira } from "@/lib/site";
import { card } from "@/lib/ui";

export default async function AdminHome() {
  const { admin } = await requireAdmin();
  const head = { count: "exact" as const, head: true };
  const [users, orders, active, openTickets, paid, wallets] = await Promise.all([
    admin.from("profiles").select("id", head),
    admin.from("orders").select("id", head),
    admin.from("orders").select("id", head).in("status", ["pending", "in_progress"]),
    admin.from("tickets").select("id", head).eq("status", "open"),
    admin.from("payments").select("amount").eq("status", "success").limit(5000),
    admin.from("profiles").select("balance").limit(5000),
  ]);
  const sum = (rows: { [k: string]: unknown }[] | null, k: string) => (rows ?? []).reduce((t, r) => t + Number(r[k] ?? 0), 0);

  const stats: [string, string | number][] = [
    ["Users", users.count ?? 0],
    ["Orders", orders.count ?? 0],
    ["Active orders", active.count ?? 0],
    ["Open tickets", openTickets.count ?? 0],
    ["Total funded", naira(sum(paid.data, "amount"))],
    ["Money in wallets", naira(sum(wallets.data, "balance"))],
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map(([k, v]) => (
          <div key={k} className={`${card} p-5`}>
            <p className="text-2xl font-bold">{v}</p>
            <p className="text-xs text-muted">{k}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
