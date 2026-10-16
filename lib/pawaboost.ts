import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { mapProviderStatus, type OrderStatus } from "@/lib/provider";

// PawaBoost signs the RAW request body: "sha256=" + HMAC-SHA256(secret, rawBody) as hex.
export function verifySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false;
  const expected = Buffer.from("sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex"));
  const given = Buffer.from(header.trim());
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

const FINAL: OrderStatus[] = ["completed", "cancelled"];

export type EventResult = "updated" | "unchanged" | "ignored";

// Applies an order.updated event. Safe to receive twice or out of order:
//  - unknown orders and refunded orders are ignored,
//  - a finished order (completed/cancelled) is never moved backwards,
//  - setting the same status again changes nothing.
export async function applyOrderEvent(admin: SupabaseClient, event: string, data: Record<string, unknown>): Promise<EventResult> {
  if (event !== "order.updated") return "ignored"; // order.created: we already stored the order when we placed it
  const providerId = data.id ?? data.orderId;
  if (!providerId) return "ignored";
  const { data: order } = await admin
    .from("orders")
    .select("id,status,refunded")
    .eq("provider_order_id", String(providerId))
    .maybeSingle();
  if (!order || order.refunded) return "ignored";

  const next = mapProviderStatus(data.status);
  if (next === order.status) return "unchanged";
  if (FINAL.includes(order.status as OrderStatus)) return "unchanged";

  await admin.from("orders").update({ status: next }).eq("id", order.id);
  if (next === "cancelled") await admin.rpc("refund_order", { p_order_id: order.id });
  return "updated";
}
