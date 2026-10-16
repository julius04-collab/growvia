import type { SupabaseClient } from "@supabase/supabase-js";
import { site } from "@/lib/site";

export type Settings = {
  ordersPaused: boolean;
  announcement: string;
  supportEmail: string;
  supportWhatsapp: string;
  lowBalanceAlert: number; // supplier balance below this shows a warning (0 = off)
};

export const defaultSettings: Settings = {
  ordersPaused: false,
  announcement: "",
  supportEmail: site.email,
  supportWhatsapp: site.whatsapp,
  lowBalanceAlert: 0,
};

// Never throws. If the settings table does not exist yet, defaults are used and `ready` is false.
export async function getSettings(db: SupabaseClient): Promise<{ settings: Settings; ready: boolean }> {
  try {
    const { data, error } = await db.from("settings").select("key,value");
    if (error || !data) return { settings: defaultSettings, ready: false };
    const m = new Map(data.map((r) => [r.key as string, String(r.value ?? "")]));
    return {
      ready: true,
      settings: {
        ordersPaused: m.get("orders_paused") === "true",
        announcement: m.get("announcement") ?? "",
        supportEmail: m.get("support_email") || defaultSettings.supportEmail,
        supportWhatsapp: m.get("support_whatsapp") || defaultSettings.supportWhatsapp,
        lowBalanceAlert: Number(m.get("low_balance_alert") ?? 0) || 0,
      },
    };
  } catch {
    return { settings: defaultSettings, ready: false };
  }
}
