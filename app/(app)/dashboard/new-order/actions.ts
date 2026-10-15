"use server";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { providerAddOrder } from "@/lib/provider";

type Result = { ok: true; orderId: number } | { ok: false; error: string };

export async function placeOrder(input: { serviceId: number; link: string; quantity: number }): Promise<Result> {
  const { supabase } = await requireUser();
  const link = String(input.link ?? "").trim();
  const quantity = Math.floor(Number(input.quantity));
  const serviceId = Math.floor(Number(input.serviceId));
  if (link.length < 4 || link.length > 500) return { ok: false, error: "Enter a valid link." };
  if (!Number.isFinite(quantity) || quantity < 1) return { ok: false, error: "Enter a valid quantity." };

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
  } catch {
    // The provider refused it, so give the money back.
    await admin.rpc("refund_order", { p_order_id: orderId });
    return { ok: false, error: "We could not place this order right now, and you were not charged. Please try again." };
  }
}
