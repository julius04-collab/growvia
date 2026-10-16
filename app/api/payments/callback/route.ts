import { NextResponse } from "next/server";
import { verifyAndCredit } from "@/lib/payments";

// The gateway sends the customer back here. Paystack uses ?reference, Flutterwave uses ?tx_ref.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ref = url.searchParams.get("reference") || url.searchParams.get("tx_ref") || url.searchParams.get("trxref");
  if (!ref) return NextResponse.redirect(new URL("/dashboard/add-funds", url.origin));
  await verifyAndCredit(ref).catch(() => "pending" as const);
  // The result page reads the real status from the database, so the URL cannot be faked into a "success".
  const back = new URL("/dashboard/add-funds/result", url.origin);
  back.searchParams.set("ref", ref);
  return NextResponse.redirect(back);
}
