"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { recheckPayment } from "@/app/(app)/dashboard/add-funds/actions";

// While a payment is still pending, ask the gateway again every 5 seconds for about a minute.
export function PaymentPoll({ reference }: { reference: string }) {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    let stopped = false;
    const id = setInterval(async () => {
      tries += 1;
      try {
        const r = await recheckPayment(reference);
        if (r !== "pending" && !stopped) router.refresh();
      } catch {
        /* try again */
      }
      if (tries >= 12) clearInterval(id);
    }, 5000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [reference, router]);
  return null;
}
