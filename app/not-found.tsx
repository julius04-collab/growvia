import type { Metadata } from "next";
import { StateCard } from "@/components/ui/StateCard";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <StateCard
        icon="search"
        title="We could not find that page"
        text="The link may be old, or the order or item no longer exists."
        actions={[{ label: "Go to my dashboard", href: "/dashboard", primary: true }, { label: "Home", href: "/" }]}
      />
    </div>
  );
}
