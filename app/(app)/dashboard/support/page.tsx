import { requireUser } from "@/lib/auth";
import { site } from "@/lib/site";
import { card, when } from "@/lib/ui";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { TicketForm } from "@/components/dashboard/TicketForm";

export default async function SupportPage() {
  const { supabase } = await requireUser();
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id,subject,message,reply,status,created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-sm text-muted">
          Open a ticket below, or email <a className="text-accent" href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>

      <section className={`${card} p-6`}>
        <h2 className="mb-4 font-semibold">New ticket</h2>
        <TicketForm />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Your tickets</h2>
        {!tickets?.length ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">No tickets yet.</div>
        ) : (
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
        )}
      </section>
    </div>
  );
}
