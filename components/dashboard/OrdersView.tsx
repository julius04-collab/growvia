"use client";

import { useState } from "react";
import { naira } from "@/lib/site";
import { card, when } from "@/lib/ui";
import { StatusChip } from "./StatusChip";
import { PlatformBadge } from "./PlatformBadge";

export type OrderItem = {
  id: number;
  service_name: string;
  link?: string | null;
  quantity: number;
  charge: number;
  status: string;
  created_at: string;
};

const tabs = [
  { key: "all", label: "All", test: () => true },
  { key: "active", label: "Active", test: (s: string) => s === "pending" || s === "in_progress" },
  { key: "completed", label: "Completed", test: (s: string) => s === "completed" },
  { key: "other", label: "Other", test: (s: string) => s === "partial" || s === "cancelled" },
];

export function OrdersView({ orders }: { orders: OrderItem[] }) {
  const [tab, setTab] = useState("all");
  const current = tabs.find((t) => t.key === tab) ?? tabs[0];
  const list = orders.filter((o) => current.test(o.status));

  return (
    <div className="space-y-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {tabs.map((t) => {
          const n = orders.filter((o) => t.test(o.status)).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                tab === t.key ? "border-primary bg-primary text-white" : "border-border text-muted hover:text-foreground"
              }`}
            >
              {t.label} <span className="ml-1 opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-medium">{orders.length === 0 ? "No orders yet" : "Nothing here"}</p>
          <p className="mt-1 text-sm text-muted">
            {orders.length === 0 ? "Your orders will show up here." : "No orders match this filter."}
          </p>
        </div>
      ) : (
        <div className={`${card} divide-y divide-border overflow-hidden`}>
          {list.map((o) => (
            <div key={o.id} className="flex items-center gap-3 px-4 py-4 text-sm">
              <PlatformBadge name={o.service_name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{o.service_name}</p>
                <p className="text-xs text-muted">
                  #{o.id} · {Number(o.quantity).toLocaleString()} · {naira(Number(o.charge))} · {when(o.created_at)}
                </p>
                {o.link && <p className="truncate text-xs text-muted/70">{o.link}</p>}
              </div>
              <StatusChip status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
