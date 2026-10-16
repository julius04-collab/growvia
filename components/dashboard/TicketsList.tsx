import { card, when } from "@/lib/ui";
import { StatusChip } from "./StatusChip";

export type TicketItem = { id: number; subject: string; message: string; reply: string | null; status: string; created_at: string };

export function TicketsList({ tickets }: { tickets: TicketItem[] }) {
  if (!tickets.length) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">No tickets yet.</div>;
  }
  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <article key={t.id} className={`${card} space-y-3 p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">{t.subject}</h3>
              <p className="text-xs text-muted">#{t.id} · {when(t.created_at)}</p>
            </div>
            <StatusChip status={t.status} />
          </div>
          <p className="whitespace-pre-wrap text-sm text-muted">{t.message}</p>
          {t.reply && (
            <div className="rounded-xl bg-surface-2 p-4 text-sm">
              <p className="mb-1 text-xs font-semibold text-accent">Reply from support</p>
              <p className="whitespace-pre-wrap">{t.reply}</p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
