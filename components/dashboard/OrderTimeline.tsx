import { Icon } from "./NavLinks";
import { naira } from "@/lib/site";

type Step = { label: string; text: string; state: "done" | "current" | "todo" | "bad" };

function steps(status: string, refunded: number): Step[] {
  const placed: Step = { label: "Order placed", text: "Payment taken from your wallet.", state: "done" };
  if (status === "cancelled") {
    return [
      placed,
      {
        label: "Cancelled",
        text: refunded > 0 ? `${naira(refunded)} was returned to your wallet.` : "This order was cancelled.",
        state: "bad",
      },
    ];
  }
  const start: Step = {
    label: "Started",
    text: "The supplier has begun delivering.",
    state: status === "pending" ? "current" : "done",
  };
  const finish: Step =
    status === "completed"
      ? { label: "Completed", text: "All done. Counts can take a little time to show on the platform.", state: "done" }
      : status === "partial"
        ? { label: "Partly delivered", text: "Only part of the order could be delivered.", state: "bad" }
        : { label: "Completed", text: "We will update this page when it finishes.", state: status === "in_progress" ? "current" : "todo" };
  return [placed, start, finish];
}

export function OrderTimeline({ status, refunded }: { status: string; refunded: number }) {
  const list = steps(status, refunded);
  const ring = { done: "bg-accent text-black", current: "bg-amber-300/20 text-amber-300 ring-2 ring-amber-300/40", todo: "bg-surface-2 text-muted", bad: "bg-red-400/15 text-red-300" };
  return (
    <ol className="space-y-5">
      {list.map((s, i) => (
        <li key={s.label} className="relative flex gap-4">
          {i < list.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-px bg-border" aria-hidden="true" />}
          <span className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ${ring[s.state]}`}>
            <Icon name={s.state === "bad" ? "x" : s.state === "done" ? "check" : "clock"} className="h-4 w-4" stroke={2.6} />
          </span>
          <div className="pb-1">
            <p className={`text-sm font-semibold ${s.state === "todo" ? "text-muted" : ""}`}>{s.label}</p>
            <p className="text-xs text-muted">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
