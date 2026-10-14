import { Suspense } from "react";
import type { Metadata } from "next";
import { Shell, ShellSkeleton } from "@/components/dashboard/Shell";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
