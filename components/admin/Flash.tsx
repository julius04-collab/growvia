import { Notice } from "@/components/ui/StateCard";

export function Flash({ ok, err }: { ok?: string; err?: string }) {
  if (err) return <Notice tone="bad">{err}</Notice>;
  if (ok) return <Notice tone="good">{ok}</Notice>;
  return null;
}

export type FlashParams = { ok?: string; err?: string };
