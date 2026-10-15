"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => Number(f.get(k));

export async function setOrderStatus(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  const status = str(formData, "status");
  if (!id || !["pending", "in_progress", "completed", "partial", "cancelled"].includes(status)) return;
  if (status === "cancelled") await admin.rpc("refund_order", { p_order_id: id }); // cancels and refunds once
  else await admin.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
}

export async function saveService(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  const price = num(formData, "price_per_1000");
  const min = num(formData, "min_qty");
  const max = num(formData, "max_qty");
  if (!id || !(price >= 0) || !(min > 0) || !(max >= min)) return;
  await admin
    .from("services")
    .update({
      price_per_1000: price,
      min_qty: min,
      max_qty: max,
      active: formData.get("active") === "on",
      provider_service_id: str(formData, "provider_service_id") || null,
    })
    .eq("id", id);
  revalidatePath("/admin/services");
}

export async function addService(formData: FormData) {
  const { admin } = await requireAdmin();
  const platform = str(formData, "platform");
  const name = str(formData, "name");
  const price = num(formData, "price_per_1000");
  const min = num(formData, "min_qty");
  const max = num(formData, "max_qty");
  if (!platform || !name || !(price >= 0) || !(min > 0) || !(max >= min)) return;
  await admin.from("services").insert({
    platform,
    name,
    price_per_1000: price,
    min_qty: min,
    max_qty: max,
    start_time: str(formData, "start_time") || "Instant",
    refill: formData.get("refill") === "on",
    provider_service_id: str(formData, "provider_service_id") || null,
  });
  revalidatePath("/admin/services");
}

export async function replyTicket(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  const reply = str(formData, "reply");
  if (!id || reply.length < 2) return;
  await admin.from("tickets").update({ reply, status: "answered" }).eq("id", id);
  revalidatePath("/admin/tickets");
}

export async function closeTicket(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  if (!id) return;
  await admin.from("tickets").update({ status: "closed" }).eq("id", id);
  revalidatePath("/admin/tickets");
}
