import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { naira } from "@/lib/site";
import { card, when } from "@/lib/ui";
import { StateCard } from "@/components/ui/StateCard";
import { PaymentPoll } from "@/components/dashboard/PaymentPoll";

export const metadata: Metadata = { title: "Payment result" };

export default async function PaymentResult({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const { supabase, user } = await requireUser();
  const { data: pay } = ref
    ? await supabase.from("payments").select("reference,gateway,amount,status,created_at,paid_at").eq("reference", ref).maybeSingle()
    : { data: null };

  if (!pay) {
    return (
      <StateCard
        icon="search"
        title="We could not find that payment"
        text="If money left your account, contact support with the time and amount and we will check it for you."
        actions={[{ label: "Contact support", href: "/dashboard/support?subject=Missing%20payment", primary: true }, { label: "Back to Add funds", href: "/dashboard/add-funds" }]}
      />
    );
  }

  const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle();
  const amount = naira(Number(pay.amount));

  const details = (
    <dl className={`${card} mx-auto mt-6 w-full max-w-sm divide-y divide-border text-left text-sm`}>
      <div className="flex justify-between px-4 py-3"><dt className="text-muted">Amount</dt><dd className="font-semibold">{amount}</dd></div>
      <div className="flex justify-between px-4 py-3"><dt className="text-muted">Method</dt><dd className="capitalize">{pay.gateway}</dd></div>
      <div className="flex justify-between px-4 py-3"><dt className="text-muted">Started</dt><dd>{when(pay.created_at)}</dd></div>
      <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted">Reference</dt><dd className="truncate font-mono text-xs">{pay.reference}</dd></div>
      {pay.status === "success" && (
        <div className="flex justify-between px-4 py-3"><dt className="text-muted">New balance</dt><dd className="font-semibold text-accent">{naira(Number(profile?.balance ?? 0))}</dd></div>
      )}
    </dl>
  );

  if (pay.status === "success") {
    return (
      <div className="flex flex-col items-center">
        <StateCard
          icon="check"
          tone="good"
          title="Payment received"
          text={`${amount} has been added to your wallet.`}
          actions={[{ label: "Place an order", href: "/dashboard/new-order", primary: true }, { label: "Add more funds", href: "/dashboard/add-funds" }]}
        />
        {details}
      </div>
    );
  }

  if (pay.status === "failed") {
    return (
      <div className="flex flex-col items-center">
        <StateCard
          icon="x"
          tone="bad"
          title="Payment did not go through"
          text="You were not charged. If money left your account, it is returned by your bank, usually within a few days. You can try again with another card or method."
          actions={[{ label: "Try again", href: "/dashboard/add-funds", primary: true }, { label: "Contact support", href: "/dashboard/support?subject=Failed%20payment" }]}
        />
        {details}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <PaymentPoll reference={pay.reference} />
      <StateCard
        icon="clock"
        tone="warn"
        title="Confirming your payment"
        text="This usually takes under a minute. This page updates by itself and your wallet is credited as soon as the payment is confirmed. You do not need to pay again."
        actions={[{ label: "Back to dashboard", href: "/dashboard" }, { label: "Contact support", href: "/dashboard/support?subject=Payment%20not%20confirmed" }]}
      />
      {details}
    </div>
  );
}
