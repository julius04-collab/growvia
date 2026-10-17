"use client";

import { useMemo, useState } from "react";
import { btnGhost, btnPrimary, card, inputCls } from "@/lib/ui";
import { normalizePlatform, priceWithMarkup } from "@/lib/import-services";

export type PickRow = { id: string; name: string; category: string; platform: string; rate: number; min: number; max: number; delivery: string; imported: boolean };

// Lists the supplier's services, lets the admin tick which to sell, and previews the customer price.
export function ImportPicker({ rows, action, currency }: { rows: PickRow[]; action: (fd: FormData) => void | Promise<void>; currency: string }) {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("All");
  const [markup, setMarkup] = useState("30");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const platforms = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => normalizePlatform(r.platform, r.name))))], [rows]);
  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          (platform === "All" || normalizePlatform(r.platform, r.name) === platform) &&
          (!q || `${r.name} ${r.category}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, q, platform],
  );
  const selectable = visible.filter((r) => !r.imported);
  const m = Number(markup) >= 0 ? Number(markup) : 0;

  function toggle(id: string) {
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <form action={action} className="space-y-5">
      {Array.from(picked).map((id) => <input key={id} type="hidden" name="pick" value={id} />)}

      <div className={`${card} grid gap-4 p-5 text-sm sm:grid-cols-3`}>
        <label className="block">
          <span className="mb-1 block text-muted">Your markup (%)</span>
          <input name="markup" type="number" min="0" max="1000" step="1" value={markup} onChange={(e) => setMarkup(e.target.value)} className={inputCls} />
          <span className="mt-1 block text-xs text-muted">Added on top of the supplier price. You can still edit each price later.</span>
        </label>
        <label className="block">
          <span className="mb-1 block text-muted">Search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. followers" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-muted">Platform</span>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
            {platforms.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{visible.length} shown · <b className="text-foreground">{picked.size}</b> ticked</p>
        <div className="flex gap-2">
          <button type="button" className={btnGhost} onClick={() => setPicked((s) => new Set([...s, ...selectable.map((r) => r.id)]))}>Tick all shown</button>
          <button type="button" className={btnGhost} onClick={() => setPicked(new Set())}>Clear</button>
        </div>
      </div>

      <div className={`${card} divide-y divide-border overflow-hidden`}>
        {visible.length === 0 && <p className="p-8 text-center text-sm text-muted">No services match.</p>}
        {visible.slice(0, 200).map((r) => (
          <label key={r.id} className={`flex items-start gap-3 px-4 py-3 text-sm ${r.imported ? "opacity-50" : "cursor-pointer hover:bg-surface-2"}`}>
            <input type="checkbox" disabled={r.imported} checked={picked.has(r.id)} onChange={() => toggle(r.id)} className="mt-1 accent-[#b6ff3b]" />
            <span className="min-w-0 flex-1">
              <span className="block break-words font-medium">{r.name}</span>
              <span className="block text-xs text-muted">{r.category} · {r.min.toLocaleString()} – {r.max.toLocaleString()}{r.delivery ? ` · ${r.delivery}` : ""}{r.imported ? " · already imported" : ""}</span>
            </span>
            <span className="whitespace-nowrap text-right text-xs">
              <span className="block text-muted">cost {r.rate.toLocaleString()} {currency}</span>
              <span className="block text-sm font-semibold">you sell ₦{priceWithMarkup(r.rate, m).toLocaleString()}</span>
            </span>
          </label>
        ))}
      </div>
      {visible.length > 200 && <p className="text-xs text-muted">Showing the first 200. Use search or the platform filter to narrow the list.</p>}

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="hide_samples" defaultChecked className="mt-1 accent-[#b6ff3b]" />
        <span>
          <span className="block font-medium">Hide the placeholder sample services</span>
          <span className="block text-xs text-muted">Turns off the 11 starter services that have no supplier behind them, so customers only see real ones.</span>
        </span>
      </label>

      <div className="sticky bottom-24 md:bottom-4">
        <button disabled={picked.size === 0} className={`w-full ${btnPrimary}`}>Import {picked.size} service{picked.size === 1 ? "" : "s"}</button>
      </div>
    </form>
  );
}
