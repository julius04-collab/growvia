import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  const items = [
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "WhatsApp", value: site.whatsapp, href: `https://wa.me/${site.whatsapp.replace(/\D/g, "")}` },
    { label: "Location", value: site.address },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight">Contact us</h1>
      <p className="mt-2 text-muted">Questions about an order or payment? Reach us here and include your order ID if you have one.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {items.map((i) => (
          <div key={i.label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs text-muted">{i.label}</p>
            {i.href ? (
              <a href={i.href} className="mt-1 block break-words font-medium text-accent">{i.value}</a>
            ) : (
              <p className="mt-1 font-medium">{i.value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
