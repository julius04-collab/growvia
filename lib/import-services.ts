import type { ProviderService } from "@/lib/provider";

const known: [RegExp, string][] = [
  [/instagram|^ig$/i, "Instagram"],
  [/tiktok|tik tok/i, "TikTok"],
  [/youtube|^yt$/i, "YouTube"],
  [/facebook|^fb$/i, "Facebook"],
  [/twitter|^x$|^x\b/i, "X (Twitter)"],
  [/telegram/i, "Telegram"],
];

export function normalizePlatform(raw: string | undefined, fallbackText = ""): string {
  const text = (raw || "").trim();
  for (const [re, label] of known) if (re.test(text)) return label;
  if (text) return text.charAt(0).toUpperCase() + text.slice(1);
  for (const [re, label] of known) if (re.test(fallbackText)) return label;
  return "Other";
}

// Customers see "<platform> <name>", so drop a platform word that the supplier already put at the start of the name.
export function cleanName(name: string, platform: string): string {
  const words = [platform, platform.replace(/\s*\(.*\)/, ""), "Twitter", "X"];
  let n = name.trim();
  for (const w of words) {
    const re = new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[\\s:\\-–—·]*`, "i");
    if (re.test(n)) {
      n = n.replace(re, "");
      break;
    }
  }
  return (n || name).trim().slice(0, 120);
}

// fx = naira per 1 unit of the supplier's currency (1 when the supplier already charges in naira).
export function priceWithMarkup(supplierRatePer1000: number, markupPercent: number, fx = 1): number {
  return Math.ceil(supplierRatePer1000 * fx * (1 + markupPercent / 100));
}

export function toServiceRow(s: ProviderService, markupPercent: number, fx = 1) {
  const platform = normalizePlatform(s.platform, `${s.category} ${s.name}`);
  return {
    platform,
    name: cleanName(s.name, platform),
    price_per_1000: priceWithMarkup(s.rate, markupPercent, fx),
    min_qty: Math.max(1, Math.floor(s.min)),
    max_qty: Math.max(Math.floor(s.min), Math.floor(s.max)),
    start_time: s.delivery || "Varies",
    refill: s.refill,
    provider_service_id: s.service,
    active: true,
  };
}
