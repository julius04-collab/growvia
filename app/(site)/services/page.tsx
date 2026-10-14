import type { Metadata } from "next";
import { platforms, sampleServices, naira } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Browse Growvia services and prices per 1,000 for every platform.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight">Services</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Prices are per 1,000 and shown in naira. Rates shown here are sample pricing and may change. Final prices appear in your dashboard before you pay.
      </p>

      {platforms.map((p) => {
        const rows = sampleServices.filter((s) => s.platform === p);
        if (!rows.length) return null;
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
          </section>
        );
      })}
    </div>
  );
}
