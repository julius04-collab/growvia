"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createTicket } from "@/app/(app)/dashboard/support/actions";
import type { FormState } from "@/lib/types";
import { btnPrimary, inputCls } from "@/lib/ui";

export function TicketForm({ demo = false }: { demo?: boolean }) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [demoOk, setDemoOk] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(createTicket, {});

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      ref={ref}
      action={demo ? undefined : action}
      onSubmit={demo ? (e) => { e.preventDefault(); ref.current?.reset(); setDemoOk(true); } : undefined}
      className="space-y-4"
    >
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Subject</span>
        <input name="subject" className={inputCls} maxLength={120} required placeholder="e.g. Order #12 has not started" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">What happened?</span>
        <textarea name="message" className={`${inputCls} min-h-28`} maxLength={2000} required placeholder="Include the order number if it is about an order." />
      </label>
      {state.error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>}
      {demoOk && <p role="status" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">Demo only: no ticket was sent.</p>}
      {state.ok && <p role="status" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{state.ok}</p>}
      <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Sending…" : "Send ticket"}</button>
    </form>
  );
}
