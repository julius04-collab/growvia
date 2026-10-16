import { requireUser } from "@/lib/auth";
import { site } from "@/lib/site";
import { card } from "@/lib/ui";
import { TicketsList, type TicketItem } from "@/components/dashboard/TicketsList";
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
        <TicketsList tickets={(tickets ?? []) as TicketItem[]} />
      </section>
    </div>
  );
}
