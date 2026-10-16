import { OrdersView } from "@/components/dashboard/OrdersView";
import { demoOrders } from "@/lib/demo-data";

export default function DemoOrders() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <OrdersView orders={demoOrders} />
    </div>
  );
}
