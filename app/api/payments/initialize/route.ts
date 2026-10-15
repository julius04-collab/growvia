import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gatewayInfo, startPayment, MIN_FUND, MAX_FUND, type Gateway } from "@/lib/payments";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const amount = Number(body?.amount);
  const info = gatewayInfo();
  const gateway = (body?.gateway || info.default) as Gateway;

  if (!info.enabled.includes(gateway)) {
    return NextResponse.json({ error: "This payment method is not available yet." }, { status: 400 });
  }
  if (!Number.isInteger(amount) || amount < MIN_FUND || amount > MAX_FUND) {
    return NextResponse.json(
      { error: `Enter a whole amount between ₦${MIN_FUND.toLocaleString()} and ₦${MAX_FUND.toLocaleString()}.` },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  try {
    const url = await startPayment({
      userId: user.id,
      email: user.email!,
      name: profile?.full_name ?? "",
      gateway,
      amount,
      origin: new URL(request.url).origin,
    });
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Payment failed." }, { status: 502 });
  }
}
