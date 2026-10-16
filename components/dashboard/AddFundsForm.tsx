"use client";

import { useState } from "react";
import { naira } from "@/lib/site";
import { btnPrimary, inputCls } from "@/lib/ui";

const presets = [1000, 2000, 5000, 10000, 20000, 50000];
const names = { paystack: "Paystack", flutterwave: "Flutterwave" } as const;

export function AddFundsForm({
  gateways,
  defaultGateway,
  min,
  max,
  demo = false,
}: {
  gateways: ("paystack" | "flutterwave")[];
  defaultGateway: "paystack" | "flutterwave" | null;
  min: number;
  max: number;
  demo?: boolean;
}) {
  const [amount, setAmount] = useState("5000");
  const [gateway, setGateway] = useState(defaultGateway ?? gateways[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const n = Number(amount);
  const valid = Number.isInteger(n) && n >= min && n <= max;

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!valid) return setError(`Enter an amount between ${naira(min)} and ${naira(max)}.`);
    if (demo) return setNotice("Demo only: in the live app you would now be sent to the payment page.");
    setBusy(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n, gateway }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Could not start the payment.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (!gateways.length) {
    return <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">Payments are not set up yet. Please check back soon.</p>;
  }

  return (
    <form onSubmit={pay} className="space-y-5">
      <div>
        <p className="mb-2 text-sm text-muted">Amount</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setAmount(String(p))}
              className={`rounded-full border px-4 py-2 text-sm transition ${n === p ? "border-primary bg-primary text-white" : "border-border text-muted hover:text-foreground"}`}
            >
              {naira(p)}
            </button>
          ))}
        </div>
        <input className={`${inputCls} mt-3`} value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" aria-label="Amount in naira" />
        <p className="mt-1 text-xs text-muted">Minimum {naira(min)}, maximum {naira(max)}.</p>
      </div>

      {gateways.length > 1 && (
        <div>
          <p className="mb-2 text-sm text-muted">Pay with</p>
          <div className="flex gap-2">
            {gateways.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGateway(g)}
                className={`rounded-xl border px-4 py-2 text-sm transition ${g === gateway ? "border-accent bg-accent/5" : "border-border text-muted"}`}
              >
                {names[g]}
              </button>
            ))}
          </div>
        </div>
      )}

      {notice && <p role="status" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{notice}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={busy || !valid} className={`w-full sm:w-auto ${btnPrimary}`}>
        {busy ? "Redirecting…" : `Pay ${valid ? naira(n) : ""}`}
      </button>
    </form>
  );
}
