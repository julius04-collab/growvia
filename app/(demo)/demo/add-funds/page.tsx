import { AddFundsForm } from "@/components/dashboard/AddFundsForm";
import { PaymentsList } from "@/components/dashboard/PaymentsList";
import { demoBalance, demoPayments } from "@/lib/demo-data";
import { naira } from "@/lib/site";
import { card } from "@/lib/ui";

export default function DemoAddFunds() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add funds</h1>
        <p className="text-sm text-muted">Current balance: <span className="font-semibold text-foreground">{naira(demoBalance)}</span></p>
      </div>
      <section className={`${card} p-6`}>
        <AddFundsForm gateways={["paystack", "flutterwave"]} defaultGateway="paystack" min={500} max={500000} demo />
      </section>
      <section>
        <h2 className="mb-3 font-semibold">Recent payments</h2>
        <PaymentsList payments={demoPayments} />
      </section>
    </div>
  );
}
