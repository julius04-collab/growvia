const styles: Record<string, string> = {
  pending: "bg-sky-300/10 text-sky-300",
  in_progress: "bg-amber-300/10 text-amber-300",
  completed: "bg-accent/10 text-accent",
  success: "bg-accent/10 text-accent",
  answered: "bg-accent/10 text-accent",
  partial: "bg-orange-300/10 text-orange-300",
  cancelled: "bg-red-400/10 text-red-300",
  failed: "bg-red-400/10 text-red-300",
  open: "bg-sky-300/10 text-sky-300",
  closed: "bg-surface-2 text-muted",
};
const labels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  success: "Successful",
  partial: "Partial",
  cancelled: "Cancelled",
  failed: "Failed",
  open: "Open",
  answered: "Answered",
  closed: "Closed",
};

export function StatusChip({ status }: { status: string }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? "bg-surface-2 text-muted"}`}>
      {labels[status] ?? status}
    </span>
  );
}
