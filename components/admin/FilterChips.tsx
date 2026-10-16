import Link from "next/link";

export function FilterChips({ base, current, options }: { base: string; current: string; options: { key: string; label: string; count?: number }[] }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {options.map((o) => (
        <Link
          key={o.key}
          href={o.key === "all" ? base : `${base}?status=${o.key}`}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
            current === o.key ? "border-primary bg-primary text-white" : "border-border text-muted hover:text-foreground"
          }`}
        >
          {o.label}
          {o.count != null && <span className="ml-1 opacity-70">{o.count}</span>}
        </Link>
      ))}
    </div>
  );
}
