import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyOrderEvent, verifySignature } from "@/lib/pawaboost";

// PawaBoost calls this when an order is created or its delivery status changes.
// Delivery is best-effort (no retries), so order pages also poll the supplier as a fallback.
export async function POST(request: Request) {
  const secret = process.env.PAWABOOST_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 });

  const raw = await request.text(); // the signature covers the untouched bytes
  if (!verifySignature(raw, request.headers.get("x-pawaboost-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: { event?: string; data?: Record<string, unknown> };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const event = String(request.headers.get("x-pawaboost-event") ?? body.event ?? "");
  const data = (body.data && typeof body.data === "object" ? body.data : body) as Record<string, unknown>;

  try {
    const result = await applyOrderEvent(createAdminClient(), event, data);
    return NextResponse.json({ received: true, result });
  } catch (e) {
    console.error("pawaboost webhook failed", e);
    // 500 so a failed delivery shows up on their side; our polling still catches up.
    return NextResponse.json({ error: "Could not process the event" }, { status: 500 });
  }
}
