import { NextResponse } from "next/server";
import { verifyAndCredit } from "@/lib/payments";

// The gateway sends the customer back here. Paystack uses ?reference, Flutterwave uses ?tx_ref.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ref = url.searchParams.get("reference") || url.searchParams.get("tx_ref") || url.searchParams.get("trxref");
  const back = new URL("/dashboard/add-funds", url.origin);
  if (!ref) return NextResponse.redirect(back);
  const result = await verifyAndCredit(ref).catch(() => "pending" as const);
  back.searchParams.set("payment", result);
  return NextResponse.redirect(back);
}
