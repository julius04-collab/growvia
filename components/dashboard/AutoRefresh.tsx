"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { refreshMyOrders } from "@/app/(app)/dashboard/actions";

// While orders are active, check for new statuses every 20 seconds.
export function AutoRefresh({ active }: { active: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    const tick = async () => {
      try {
        await refreshMyOrders();
        if (!stopped) router.refresh();
      } catch {
        /* try again next time */
      }
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [active, router]);
  return null;
}
