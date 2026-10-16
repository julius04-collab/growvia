import { TicketForm } from "@/components/dashboard/TicketForm";
import { TicketsList } from "@/components/dashboard/TicketsList";
import { demoTickets } from "@/lib/demo-data";
import { card } from "@/lib/ui";

export default function DemoSupport() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-sm text-muted">Open a ticket below and we will reply here.</p>
      </div>
      <section className={`${card} p-6`}>
        <h2 className="mb-4 font-semibold">New ticket</h2>
        <TicketForm demo />
      </section>
      <section>
        <h2 className="mb-3 font-semibold">Your tickets</h2>
        <TicketsList tickets={demoTickets} />
      </section>
    </div>
  );
}
