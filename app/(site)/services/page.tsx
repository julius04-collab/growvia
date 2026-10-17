import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { naira } from "@/lib/site";
import { getPublicServices } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Services",
  description: "Browse Growvia services and prices per 1,000 for every platform.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight">Services</h1>
      <Suspense fallback={<Skeleton />}>
        <Catalogue />
      </Suspense>
      <div className="mt-12 rounded-3xl bg-primary px-6 py-10 text-center">
        <h2 className="text-2xl font-bold">Ready to order?</h2>
        <p className="mx-auto mt-2 max-w-md text-white/80">Create a free account, add funds in naira and place your first order.</p>
        <Link href="/signup" className="mt-5 inline-block rounded-xl bg-accent px-7 py-3 font-semibold text-black">Create free account</Link>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading services">
      {[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-surface" />)}
    </div>
  );
}

async function Catalogue() {
  const { services, live } = await getPublicServices();
  const platforms = Array.from(new Set(services.map((s) => s.platform)));
  return (
    <>
      <p className="mt-2 max-w-2xl text-muted">
        Prices are per 1,000 and shown in naira.{" "}
        {live ? "These are our current rates. The exact total is shown before you pay." : "Rates shown here are sample pricing and may change. Final prices appear in your dashboard before you pay."}
      </p>

      {platforms.map((p) => {
        const all = services.filter((s) => s.platform === p);
        if (!all.length) return null;
        const rows = all.slice(0, 25);
        return (
          <section key={p} className="mt-10">
            <h2 className="mb-3 text-xl font-semibold">{p}</h2>
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Service</th>
                    <th className="px-5 py-3 font-medium">Price / 1,000</th>
                    <th className="px-5 py-3 font-medium">Min – Max</th>
                    <th className="px-5 py-3 font-medium">Starts</th>
                    <th className="px-5 py-3 font-medium">Refill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td className="px-5 py-3 font-medium">{s.name}</td>
                      <td className="px-5 py-3">{naira(s.pricePer1000)}</td>
                      <td className="px-5 py-3 text-muted">{s.min.toLocaleString()} – {s.max.toLocaleString()}</td>
                      <td className="px-5 py-3 text-muted">{s.start}</td>
                      <td className="px-5 py-3">
                        {s.refill ? <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs text-accent">Yes</span> : <span className="text-muted">No</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {all.length > rows.length && (
              <p className="mt-2 text-sm text-muted">Showing {rows.length} of {all.length} {p} services. Create a free account to see them all.</p>
            )}
          </section>
        );
      })}
    </>
  );
}
