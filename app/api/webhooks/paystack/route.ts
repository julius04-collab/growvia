import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { verifyAndCredit } from "@/lib/payments";

// Set this URL in Paystack: Settings > API Keys & Webhooks > Test Webhook URL.
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const raw = await request.text();
  const sig = request.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const event = JSON.parse(raw);
  const ref = event?.data?.reference;
  if (event?.event === "charge.success" && ref) await verifyAndCredit(String(ref));
  return NextResponse.json({ received: true });
}
