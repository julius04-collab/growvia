"use server";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupplierFundsError, providerAddOrder } from "@/lib/provider";
import { getSettings } from "@/lib/settings";

// kind: "paused" = admin paused new orders, "unavailable" = the supplier could not take it (we refunded).
type Result = { ok: true; orderId: number } | { ok: false; error: string; kind?: "paused" | "unavailable" };

export async function placeOrder(input: { serviceId: number; link: string; quantity: number }): Promise<Result> {
  const { supabase } = await requireUser();
  const link = String(input.link ?? "").trim();
  const quantity = Math.floor(Number(input.quantity));
  const serviceId = Math.floor(Number(input.serviceId));
  if (link.length < 4 || link.length > 500) return { ok: false, error: "Enter a valid link." };
  if (!Number.isFinite(quantity) || quantity < 1) return { ok: false, error: "Enter a valid quantity." };

  const { settings } = await getSettings(supabase);
  if (settings.ordersPaused) {
    return { ok: false, kind: "paused", error: "New orders are paused for a short while. Your wallet was not charged." };
  }

  // Price, balance check and charge all happen inside the database function.
  const { data: orderId, error } = await supabase.rpc("place_order", {
    p_service_id: serviceId,
    p_link: link,
    p_quantity: quantity,
  });
  if (error || orderId == null) return { ok: false, error: error?.message ?? "Could not place the order." };

  const admin = createAdminClient();
  try {
    const { data: svc } = await admin.from("services").select("provider_service_id").eq("id", serviceId).maybeSingle();
    const res = await providerAddOrder({ providerServiceId: svc?.provider_service_id, link, quantity });
    await admin.from("orders").update({ provider_order_id: res.id }).eq("id", orderId);
    return { ok: true, orderId: Number(orderId) };
  } catch (e) {
    // The provider refused it, so give the money back.
    await admin.rpc("refund_order", { p_order_id: orderId });
    const msg = e instanceof Error ? e.message : "";
    if (isSupplierFundsError(msg)) console.error("SUPPLIER BALANCE TOO LOW: top up your provider account.", msg);
    return {
      ok: false,
      kind: "unavailable",
      error: "This service is temporarily unavailable, and you were not charged. Please try again later or choose another service.",
    };
  }
}
