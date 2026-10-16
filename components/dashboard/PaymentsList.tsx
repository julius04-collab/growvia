import { naira } from "@/lib/site";
import { card, when } from "@/lib/ui";
import { StatusChip } from "./StatusChip";

export type PaymentItem = { id: number; gateway: string; amount: number; status: string; created_at: string };

export function PaymentsList({ payments }: { payments: PaymentItem[] }) {
  if (!payments.length) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">No payments yet.</div>;
  }
  return (
    <div className={`${card} divide-y divide-border overflow-hidden`}>
      {payments.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
          <div>
            <p className="font-medium">{naira(Number(p.amount))}</p>
            <p className="text-xs capitalize text-muted">{p.gateway} · {when(p.created_at)}</p>
          </div>
          <StatusChip status={p.status} />
        </div>
      ))}
    </div>
  );
}
