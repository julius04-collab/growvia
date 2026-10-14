import { site } from "@/lib/site";

export function Prose({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {site.updated}</p>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground/90 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-accent">
        {children}
      </div>
    </article>
  );
}
