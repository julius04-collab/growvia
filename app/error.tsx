"use client";

import { RouteError } from "@/components/ui/RouteError";

export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <RouteError {...props} home="/" />
    </div>
  );
}
