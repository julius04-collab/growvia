import type { Metadata } from "next";
import { ShellFrame } from "@/components/dashboard/Shell";
import { userNav } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Dashboard demo",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellFrame name="Demo user" items={userNav("/demo")} accountHref="/demo/account" demo>
      {children}
    </ShellFrame>
  );
}
