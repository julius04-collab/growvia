"use client";

import { useEffect } from "react";
import { StateCard } from "./StateCard";

export function RouteError({ error, retry, home }: { error: Error & { digest?: string }; retry: () => void; home: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <StateCard
      icon="alert"
      tone="bad"
      title="Something went wrong"
      text="We could not load this page. Your money and orders are safe. Try again, and if it keeps happening, contact support."
      actions={[{ label: "Try again", onClick: retry, primary: true }, { label: "Back to start", href: home }]}
    >
      {error.digest && <p className="mt-4 text-xs text-muted">Error code: {error.digest}</p>}
    </StateCard>
  );
}
