import { DashboardView } from "@/components/dashboard/DashboardView";
import { demoOrders, demoBalance } from "@/lib/demo-data";

export default function DemoDashboard() {
  return <DashboardView first="Demo" balance={demoBalance} orders={demoOrders} base="/demo" />;
}
