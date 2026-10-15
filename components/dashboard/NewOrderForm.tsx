"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { naira } from "@/lib/site";
import { btnPrimary, card, inputCls } from "@/lib/ui";
import type { DbService } from "@/lib/types";
import { placeOrder } from "@/app/(app)/dashboard/new-order/actions";

export function NewOrderForm({ services, balance, simulated }: { services: DbService[]; balance: number; simulated: boolean }) {
  const router = useRouter();
  const platforms = useMemo(() => Array.from(new Set(services.map((s) => s.platform))), [services]);
  const [platform, setPlatform] = useState(platforms[0] ?? "");
  const list = services.filter((s) => s.platform === platform);
  const [serviceId, setServiceId] = useState<number | null>(list[0]?.id ?? null);
  const [link, setLink] = useState("");
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const selected = services.find((s) => s.id === serviceId) ?? null;
  const q = Math.floor(Number(qty));
  const qtyValid = selected ? q >= selected.min_qty && q <= selected.max_qty : false;
  const total = selected && qtyValid ? Math.round(Number(selected.price_per_1000) * q) / 1000 : 0;
  const short = total > balance;

  function pickPlatform(p: string) {
    setPlatform(p);
    setServiceId(services.find((s) => s.platform === p)?.id ?? null);
    setError("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Choose a service.");
    if (link.trim().length < 4) return setError("Paste the link to your profile or post.");
    if (!qtyValid) return setError(`Quantity must be between ${selected.min_qty.toLocaleString()} and ${selected.max_qty.toLocaleString()}.`);
    start(async () => {
      const res = await placeOrder({ serviceId: selected.id, link: link.trim(), quantity: q });
      if (res.ok) router.push(`/dashboard/orders?placed=${res.orderId}`);
      else setError(res.error);
    });
  }

  if (!services.length) {
    return <div className={`${card} p-8 text-center text-sm text-muted`}>No services are available yet. Please check back soon.</div>;
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {simulated && (
          <p className="rounded-xl bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
            Test mode: orders are simulated and nothing is delivered to a real account.
          </p>
        )}

        <section>
          <h2 className="mb-2 text-sm font-medium text-muted">1. Platform</h2>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => pickPlatform(p)}
                className={`rounded-full border px-4 py-2 text-sm transition ${p === platform ? "border-primary bg-primary text-white" : "border-border text-muted hover:text-foreground"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-muted">2. Service</h2>
          <div className="space-y-2">
            {list.map((s) => (
              <label
                key={s.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${s.id === serviceId ? "border-accent bg-accent/5" : "border-border hover:bg-surface"}`}
              >
                <span className="flex items-center gap-3">
                  <input type="radio" name="service" checked={s.id === serviceId} onChange={() => setServiceId(s.id)} className="accent-[#b6ff3b]" />
                  <span>
                    <span className="block text-sm font-medium">{s.name}</span>
                    <span className="block text-xs text-muted">
                      Starts {s.start_time} · {s.min_qty.toLocaleString()} to {s.max_qty.toLocaleString()}
                      {s.refill ? " · Refill" : ""}
                    </span>
                  </span>
                </span>
                <span className="whitespace-nowrap text-sm font-semibold">
                  {naira(Number(s.price_per_1000))} <span className="text-xs font-normal text-muted">/1k</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted">3. Details</h2>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Link to your profile or post</span>
            <input className={inputCls} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" inputMode="url" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">
              Quantity{selected ? ` (${selected.min_qty.toLocaleString()} to ${selected.max_qty.toLocaleString()})` : ""}
            </span>
            <input className={inputCls} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="e.g. 1000" />
          </label>
          <p className="text-xs text-muted">Your account or post must be public. We never need your password.</p>
        </section>
      </div>

      <aside className={`${card} h-fit space-y-3 p-5 lg:sticky lg:top-6`}>
        <h2 className="font-semibold">Order summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Service</dt><dd className="text-right">{selected ? `${selected.platform} ${selected.name}` : "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Quantity</dt><dd>{qtyValid ? q.toLocaleString() : "-"}</dd></div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><dt>Total</dt><dd>{qtyValid ? naira(total) : "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Wallet balance</dt><dd>{naira(balance)}</dd></div>
        </dl>
        {short && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            Not enough balance. <Link href="/dashboard/add-funds" className="underline">Add funds</Link>
          </p>
        )}
        {error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={pending || short} className={`w-full ${btnPrimary}`}>
          {pending ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
