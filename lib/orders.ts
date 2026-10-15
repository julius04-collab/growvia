import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { providerStatus } from "@/lib/provider";

// Refreshes the status of a user's active orders from the provider.
// Never throws: if anything is missing the page simply shows the stored status.
export async function syncOrders(userId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("id,status,provider_order_id,created_at")
      .eq("user_id", userId)
      .in("status", ["pending", "in_progress"])
      .not("provider_order_id", "is", null)
      .limit(50);
    await Promise.all(
      (data ?? []).map(async (o) => {
        try {
          const s = await providerStatus(o.provider_order_id, o.created_at);
          if (s === o.status) return;
          await admin.from("orders").update({ status: s }).eq("id", o.id);
          if (s === "cancelled") await admin.rpc("refund_order", { p_order_id: o.id });
        } catch {
          /* keep old status */
        }
      }),
    );
  } catch {
    /* admin client not configured */
  }
}
