const styles: Record<string, string> = {
  pending: "bg-sky-300/10 text-sky-300",
  in_progress: "bg-amber-300/10 text-amber-300",
  completed: "bg-accent/10 text-accent",
  partial: "bg-orange-300/10 text-orange-300",
  cancelled: "bg-red-400/10 text-red-300",
};
const labels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  partial: "Partial",
  cancelled: "Cancelled",
};

export function StatusChip({ status }: { status: string }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? "bg-surface-2 text-muted"}`}>
      {labels[status] ?? status}
    </span>
  );
}
