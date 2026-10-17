"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { providerServices, providerStatus } from "@/lib/provider";
import { toServiceRow } from "@/lib/import-services";
import { verifyAndCredit } from "@/lib/payments";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => Number(f.get(k));
const refresh = () => revalidatePath("/admin", "layout");

// Send the admin back to a page with a message banner (shown by <Flash />).
function flash(path: string, text: string, ok = true): never {
  redirect(`${path}?${ok ? "ok" : "err"}=${encodeURIComponent(text)}`);
}

export async function setOrderStatus(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  const status = str(formData, "status");
  if (!id || !["pending", "in_progress", "completed", "partial", "cancelled"].includes(status)) return;
  if (status === "cancelled") await admin.rpc("refund_order", { p_order_id: id }); // cancels and refunds once
  else await admin.from("orders").update({ status }).eq("id", id);
  refresh();
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
  refresh();
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
  refresh();
}

export async function replyTicket(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  const reply = str(formData, "reply");
  if (!id || reply.length < 2) return;
  await admin.from("tickets").update({ reply, status: "answered" }).eq("id", id);
  refresh();
}

export async function closeTicket(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  if (!id) return;
  await admin.from("tickets").update({ status: "closed" }).eq("id", id);
  refresh();
}

// Ask the provider for this one order's latest status right now.
export async function syncOneOrder(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  const back = `/admin/orders/${id}`;
  const { data: o } = await admin.from("orders").select("id,status,provider_order_id,created_at").eq("id", id).maybeSingle();
  if (!o) flash("/admin/orders", "Order not found.", false);
  if (!o.provider_order_id) flash(back, "This order has no provider order ID, so there is nothing to check.", false);
  let s;
  try {
    s = await providerStatus(o.provider_order_id, o.created_at);
  } catch (e) {
    flash(back, `Could not reach the provider: ${e instanceof Error ? e.message : "unknown error"}`, false);
  }
  if (s === o.status) flash(back, "Already up to date.");
  await admin.from("orders").update({ status: s }).eq("id", id);
  if (s === "cancelled") await admin.rpc("refund_order", { p_order_id: id });
  refresh();
  flash(back, `Status updated to ${s.replace("_", " ")}.`);
}

export async function refundOrderFull(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  const back = str(formData, "back") || "/admin/refunds";
  if (!id) return;
  const { error } = await admin.rpc("refund_order", { p_order_id: id });
  refresh();
  flash(back, error ? error.message : `Order #${id} refunded in full.`, !error);
}

export async function refundOrderPartial(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = num(formData, "id");
  const amount = num(formData, "amount");
  const back = str(formData, "back") || "/admin/refunds";
  if (!id || !(amount > 0)) flash(back, "Enter an amount to refund.", false);
  const { error } = await admin.rpc("refund_order_partial", { p_order_id: id, p_amount: amount });
  refresh();
  if (error) {
    const missing = /function .* does not exist|schema cache/i.test(error.message);
    flash(back, missing ? "Run the latest setup-all.sql in Supabase first (it adds partial refunds)." : error.message, false);
  }
  flash(back, `Refunded ₦${amount.toLocaleString("en-NG")} on order #${id}.`);
}

export async function adjustWallet(formData: FormData) {
  const { admin } = await requireAdmin();
  const user = str(formData, "user");
  const amount = num(formData, "amount");
  const sign = str(formData, "direction") === "debit" ? -1 : 1;
  const note = str(formData, "note");
  const back = `/admin/users/${user}`;
  if (!user || !(amount > 0)) flash(back, "Enter an amount above 0.", false);
  const { data, error } = await admin.rpc("adjust_wallet", { p_user: user, p_amount: sign * amount, p_note: note });
  refresh();
  if (error) {
    const missing = /function .* does not exist|schema cache/i.test(error.message);
    flash(back, missing ? "Run the latest setup-all.sql in Supabase first (it adds wallet adjustments)." : error.message, false);
  }
  flash(back, `Done. New balance: ₦${Number(data).toLocaleString("en-NG")}.`);
}

// Re-check a payment with the gateway and credit it if it really succeeded.
export async function verifyPaymentNow(formData: FormData) {
  await requireAdmin();
  const ref = str(formData, "reference");
  const back = str(formData, "back") || "/admin/refunds";
  if (!ref) return;
  const r = await verifyAndCredit(ref).catch(() => "pending" as const);
  refresh();
  const text: Record<string, string> = {
    success: "Confirmed with the gateway and credited to the wallet.",
    failed: "The gateway says this payment failed. Nothing was credited.",
    pending: "Still not confirmed. If the customer paid a different amount, use Wallet adjustment on their page.",
    unknown: "Payment not found.",
  };
  flash(back, text[r], r === "success");
}

const settingKeys = ["announcement", "support_email", "support_whatsapp", "low_balance_alert"] as const;

export async function saveSettings(formData: FormData) {
  const { admin } = await requireAdmin();
  const rows: { key: string; value: string; updated_at: string }[] = [
    { key: "orders_paused", value: formData.get("orders_paused") === "on" ? "true" : "false" },
    ...settingKeys.map((k) => ({ key: k, value: str(formData, k).slice(0, 300) })),
  ].map((r) => ({ ...r, updated_at: new Date().toISOString() }));
  if (!(Number(rows.find((r) => r.key === "low_balance_alert")?.value || 0) >= 0)) flash("/admin/settings", "Low balance alert must be 0 or more.", false);
  const { error } = await admin.from("settings").upsert(rows, { onConflict: "key" });
  if (error) {
    const missing = /relation .* does not exist|schema cache|settings/i.test(error.message);
    flash("/admin/settings", missing ? "Run the latest setup-all.sql in Supabase first (it creates the settings table)." : error.message, false);
  }
  refresh();
  flash("/admin/settings", "Settings saved.");
}

// Imports the picked supplier services into our catalogue with a markup. Prices are re-read from the
// supplier here on the server, never taken from the browser.
export async function importServices(formData: FormData) {
  const { admin } = await requireAdmin();
  const back = "/admin/supplier/import";
  const picked = new Set(formData.getAll("pick").map(String));
  const markup = Number(formData.get("markup"));
  const fx = Number(formData.get("fx") || 1);
  const hideSamples = formData.get("hide_samples") === "on";
  if (picked.size === 0) flash(back, "Tick at least one service to import.", false);
  if (picked.size > 300) flash(back, "Import at most 300 services at a time.", false);
  if (!(markup >= 0 && markup <= 1000)) flash(back, "Markup must be between 0 and 1000 percent.", false);
  if (!(fx > 0 && fx <= 100000)) flash(back, "Enter how many naira 1 unit of the supplier currency is worth.", false);

  let list;
  try {
    list = await providerServices();
  } catch (e) {
    flash(back, `Could not reach the supplier: ${e instanceof Error ? e.message : "unknown error"}`, false);
  }
  const { data: existing } = await admin.from("services").select("provider_service_id").not("provider_service_id", "is", null);
  const have = new Set((existing ?? []).map((r) => String(r.provider_service_id)));

  const rows = list.filter((s) => picked.has(s.service) && !have.has(s.service) && s.rate >= 0 && s.max >= s.min).map((s) => toServiceRow(s, markup, fx));
  if (rows.length) {
    const { error } = await admin.from("services").insert(rows);
    if (error) flash(back, `Could not save: ${error.message}`, false);
  }
  let hidden = 0;
  if (hideSamples && (rows.length > 0 || have.size > 0)) {
    const { data } = await admin.from("services").update({ active: false }).is("provider_service_id", null).eq("active", true).select("id");
    hidden = data?.length ?? 0;
  }
  refresh();
  const skipped = picked.size - rows.length;
  flash(
    "/admin/services",
    `Imported ${rows.length} service(s)${skipped > 0 ? `, skipped ${skipped} already imported or invalid` : ""}${hidden ? `, hid ${hidden} sample service(s)` : ""}.`,
  );
}
