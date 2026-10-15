import { requireAdmin } from "@/lib/auth";
import { card, inputCls, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { closeTicket, replyTicket } from "../actions";

export default async function AdminTickets() {
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("tickets")
    .select("id,user_id,subject,message,reply,status,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  const tickets = data ?? [];
  const ids = Array.from(new Set(tickets.map((t) => t.user_id)));
  const { data: profiles } = ids.length ? await admin.from("profiles").select("id,full_name").in("id", ids) : { data: [] };
  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "User"]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
      {tickets.length === 0 && <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">No tickets yet.</p>}
      {tickets.map((t) => (
        <article key={t.id} className={`${card} space-y-3 p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-medium">{t.subject}</h2>
              <p className="text-xs text-muted">#{t.id} · {names.get(t.user_id)} · {when(t.created_at)}</p>
            </div>
            <StatusChip status={t.status} />
          </div>
          <p className="whitespace-pre-wrap text-sm text-muted">{t.message}</p>
          {t.reply && <p className="whitespace-pre-wrap rounded-xl bg-surface-2 p-3 text-sm"><span className="mb-1 block text-xs font-semibold text-accent">Your reply</span>{t.reply}</p>}
          {t.status !== "closed" && (
            <div className="space-y-2">
              <form action={replyTicket} className="space-y-2">
                <input type="hidden" name="id" value={t.id} />
                <textarea name="reply" required defaultValue={t.reply ?? ""} placeholder="Write a reply" className={`${inputCls} min-h-20`} />
                <button className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black">{t.reply ? "Update reply" : "Send reply"}</button>
              </form>
              <form action={closeTicket}>
                <input type="hidden" name="id" value={t.id} />
                <button className="text-sm text-muted hover:text-foreground">Close ticket</button>
              </form>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
