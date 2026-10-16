import type { Metadata } from "next";
import { StateCard } from "@/components/ui/StateCard";

export const metadata: Metadata = { title: "Access denied", robots: { index: false, follow: false } };

export default function AccessDenied() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <StateCard
        icon="lock"
        tone="warn"
        title="You do not have access to this page"
        text="This area is for Growvia administrators only. If you think this is a mistake, sign in with the admin account."
        actions={[
          { label: "Admin sign in", href: "/admin-login", primary: true },
          { label: "My dashboard", href: "/dashboard" },
        ]}
      />
    </div>
  );
}
