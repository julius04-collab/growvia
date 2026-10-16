"use server";

import { requireUser } from "@/lib/auth";
import { verifyAndCredit, type PayResult } from "@/lib/payments";

// Re-checks one of the signed-in user's own payments with the gateway.
export async function recheckPayment(reference: string): Promise<PayResult> {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("payments").select("reference").eq("reference", reference).maybeSingle();
  if (!data) return "unknown"; // not this user's payment (row level security hides it)
  return verifyAndCredit(reference).catch(() => "pending" as const);
}
