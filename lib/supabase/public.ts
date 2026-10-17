import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./env";
import { fetchAll } from "@/lib/paged";
import { sampleServices, type Service } from "@/lib/site";

// Reads public data (active services) without a signed-in user.
// Call it inside <Suspense>. Falls back to the sample list if the database is not reachable.
export async function getPublicServices(): Promise<{ services: Service[]; live: boolean }> {
  if (!supabaseUrl || !supabaseKey) return { services: sampleServices, live: false };
  try {
    const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const data = await fetchAll<{ id: number; platform: string; name: string; price_per_1000: number; min_qty: number; max_qty: number; start_time: string; refill: boolean }>((a, b) =>
      db
        .from("services")
        .select("id,platform,name,price_per_1000,min_qty,max_qty,start_time,refill")
        .eq("active", true)
        .order("platform")
        .order("id")
        .range(a, b),
    );
    if (!data.length) return { services: sampleServices, live: false };
    return {
      live: true,
      services: data.map((s) => ({
        id: s.id,
        platform: s.platform,
        name: s.name,
        pricePer1000: Number(s.price_per_1000),
        min: s.min_qty,
        max: s.max_qty,
        start: s.start_time,
        refill: s.refill,
      })) as Service[],
    };
  } catch {
    return { services: sampleServices, live: false };
  }
}
