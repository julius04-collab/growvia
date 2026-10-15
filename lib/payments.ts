import "server-only";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type Gateway = "paystack" | "flutterwave";
export const MIN_FUND = 500;
export const MAX_FUND = 500000;
const CURRENCY = "NGN";

const keys = {
  paystack: () => process.env.PAYSTACK_SECRET_KEY,
  flutterwave: () => process.env.FLUTTERWAVE_SECRET_KEY,
};

// Which gateways have a secret key set, and whether it is a test key.
export function gatewayInfo() {
  const enabled = (["paystack", "flutterwave"] as Gateway[]).filter((g) => Boolean(keys[g]()));
  const preferred = process.env.PAYMENT_GATEWAY as Gateway | undefined;
  const fallback = enabled[0] ?? null;
  const def = preferred && enabled.includes(preferred) ? preferred : fallback;
  return {
    enabled,
    default: def,
    test: {
      paystack: (keys.paystack() ?? "").startsWith("sk_test"),
      flutterwave: (keys.flutterwave() ?? "").toUpperCase().includes("TEST"),
    },
  };
}

async function gw(url: string, secret: string, body?: unknown) {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, json };
}

export async function startPayment(p: {
  userId: string;
  email: string;
  name: string;
  gateway: Gateway;
  amount: number;
  origin: string;
}): Promise<string> {
  const secret = keys[p.gateway]();
  if (!secret) throw new Error("This payment method is not available.");
  const admin = createAdminClient();
  const reference = `gv_${randomBytes(12).toString("hex")}`;

  const { error } = await admin.from("payments").insert({
    user_id: p.userId,
    reference,
    gateway: p.gateway,
    amount: p.amount,
    status: "pending",
  });
  if (error) throw new Error("Could not start the payment. Please try again.");

  const callback = `${p.origin}/api/payments/callback`;
  try {
    let url: string | undefined;
    if (p.gateway === "paystack") {
      const r = await gw("https://api.paystack.co/transaction/initialize", secret, {
        email: p.email,
        amount: Math.round(p.amount * 100), // kobo
        currency: CURRENCY,
        reference,
        callback_url: callback,
      });
      url = r.json?.data?.authorization_url;
    } else {
      const r = await gw("https://api.flutterwave.com/v3/payments", secret, {
        tx_ref: reference,
        amount: p.amount,
        currency: CURRENCY,
        redirect_url: callback,
        customer: { email: p.email, name: p.name || p.email },
        customizations: { title: "Growvia wallet top-up" },
      });
      url = r.json?.data?.link;
    }
    if (!url) throw new Error("The payment provider did not accept the request.");
    return url;
  } catch (e) {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    throw e instanceof Error ? e : new Error("Payment failed to start.");
  }
}

export type PayResult = "success" | "pending" | "failed" | "unknown";

// Asks the gateway directly whether the payment really succeeded, then credits the wallet once.
// Safe to call many times (callback, webhook, retries): settle_payment only credits a pending row.
export async function verifyAndCredit(reference: string): Promise<PayResult> {
  const admin = createAdminClient();
  const { data: pay } = await admin
    .from("payments")
    .select("reference,gateway,amount,status")
    .eq("reference", reference)
    .maybeSingle();
  if (!pay) return "unknown";
  if (pay.status === "success") return "success";
  if (pay.status === "failed") return "failed";

  const secret = keys[pay.gateway as Gateway]();
  if (!secret) return "pending";

  let state: PayResult = "pending";
  let paid = 0;
  let currency = "";

  if (pay.gateway === "paystack") {
    const r = await gw(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, secret);
    const d = r.json?.data;
    if (r.ok && d) {
      state = d.status === "success" ? "success" : ["failed", "abandoned", "reversed"].includes(d.status) ? "failed" : "pending";
      paid = Number(d.amount) / 100;
      currency = d.currency;
    }
  } else {
    const r = await gw(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
      secret,
    );
    const d = r.json?.data;
    if (r.ok && d) {
      state = d.status === "successful" ? "success" : d.status === "failed" ? "failed" : "pending";
      paid = Number(d.amount);
      currency = d.currency;
    }
  }

  if (state === "success") {
    if (currency !== CURRENCY || paid + 0.001 < Number(pay.amount)) {
      // Paid something different from what we asked for: do not credit automatically.
      console.error("payment amount/currency mismatch", { reference, paid, currency, expected: pay.amount });
      return "pending";
    }
    const { error } = await admin.rpc("settle_payment", { p_reference: reference });
    return error ? "pending" : "success";
  }
  if (state === "failed") {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference).eq("status", "pending");
  }
  return state;
}
