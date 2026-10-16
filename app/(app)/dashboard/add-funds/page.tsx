import { requireUser } from "@/lib/auth";
import { gatewayInfo, MIN_FUND, MAX_FUND } from "@/lib/payments";
import { naira } from "@/lib/site";
import { card } from "@/lib/ui";
import { AddFundsForm } from "@/components/dashboard/AddFundsForm";
import { PaymentsList, type PaymentItem } from "@/components/dashboard/PaymentsList";

const messages: Record<string, { text: string; cls: string }> = {
  success: { text: "Payment received. Your wallet has been topped up.", cls: "bg-accent/10 text-accent" },
  pending: { text: "We are still confirming your payment. Your balance updates as soon as it is confirmed.", cls: "bg-amber-300/10 text-amber-200" },
  failed: { text: "The payment did not go through, and you were not charged.", cls: "bg-red-500/10 text-red-300" },
  unknown: { text: "We could not find that payment.", cls: "bg-red-500/10 text-red-300" },
};

export default async function AddFundsPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const { payment } = await searchParams;
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: payments }] = await Promise.all([
    supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle(),
    supabase.from("payments").select("id,reference,gateway,amount,status,created_at").order("created_at", { ascending: false }).limit(10),
  ]);
  const info = gatewayInfo();
  const testMode = info.default ? info.test[info.default] : false;
  const msg = payment ? messages[payment] : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add funds</h1>
        <p className="text-sm text-muted">Current balance: <span className="font-semibold text-foreground">{naira(Number(profile?.balance ?? 0))}</span></p>
      </div>

      {msg && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${msg.cls}`}>{msg.text}</p>}

      {testMode && (
        <p className="rounded-xl bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
          Test mode: no real money moves. On Paystack, use test card 4084 0840 8408 4081, any future expiry date and CVV 408.
        </p>
      )}

      <section className={`${card} p-6`}>
        <AddFundsForm gateways={info.enabled} defaultGateway={info.default} min={MIN_FUND} max={MAX_FUND} />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Recent payments</h2>
        <PaymentsList payments={(payments ?? []) as PaymentItem[]} />
      </section>
    </div>
  );
}
