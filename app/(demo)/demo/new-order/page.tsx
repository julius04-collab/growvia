import { NewOrderForm } from "@/components/dashboard/NewOrderForm";
import { demoBalance, demoServices } from "@/lib/demo-data";

export default function DemoNewOrder() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New order</h1>
      <NewOrderForm services={demoServices} balance={demoBalance} simulated={false} demo />
    </div>
  );
}
