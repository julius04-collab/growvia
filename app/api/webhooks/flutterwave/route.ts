import { NextResponse } from "next/server";
import { verifyAndCredit } from "@/lib/payments";

// Set this URL in Flutterwave: Settings > Webhooks. Secret hash must equal FLUTTERWAVE_SECRET_HASH.
export async function POST(request: Request) {
  const hash = process.env.FLUTTERWAVE_SECRET_HASH;
  if (!hash) return NextResponse.json({ error: "not configured" }, { status: 503 });
  if (request.headers.get("verif-hash") !== hash) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }
  const event = await request.json().catch(() => ({}));
  const ref = event?.data?.tx_ref;
  if (ref) await verifyAndCredit(String(ref));
  return NextResponse.json({ received: true });
}
