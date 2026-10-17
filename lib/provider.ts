import "server-only";

// Talks to the supplier that delivers orders. Three modes:
//  - "pawaboost": the PawaBoost REST API (Bearer key, JSON). Chosen when the URL contains "pawaboost",
//    or when PROVIDER_TYPE=pawaboost.
//  - "smm": the standard "v2" panel API (key + action in a form body), used by most SMM panels.
//  - mock: no PROVIDER_API_URL / PROVIDER_API_KEY, so orders are simulated (pending -> in progress -> completed).

export type OrderStatus = "pending" | "in_progress" | "completed" | "partial" | "cancelled";

const url = () => (process.env.PROVIDER_API_URL ?? "").trim().replace(/\/+$/, "");
// Tolerates a pasted "Bearer " prefix or quotes; the code adds "Bearer " itself.
const key = () => (process.env.PROVIDER_API_KEY ?? "").trim().replace(/^["']|["']$/g, "").replace(/^bearer\s+/i, "").trim();
export const providerMode = () => (url() && key() ? "live" : "mock");
export const providerKind = (): "pawaboost" | "smm" =>
  process.env.PROVIDER_TYPE === "pawaboost" || (process.env.PROVIDER_TYPE !== "smm" && /pawaboost/i.test(url())) ? "pawaboost" : "smm";

// ---------- shared ----------

// True when the provider refused because OUR balance with them is too low.
export function isSupplierFundsError(message: string) {
  return /(not enough|insufficient|low).{0,20}(fund|balance|credit)|balance.{0,20}(low|too low|not enough)/i.test(message);
}

export function providerHost() {
  try {
    return url() ? new URL(url()).host : null;
  } catch {
    return null;
  }
}

const statusMap: Record<string, OrderStatus> = {
  pending: "pending",
  queued: "pending",
  processing: "in_progress",
  "in progress": "in_progress",
  running: "in_progress",
  completed: "completed",
  complete: "completed",
  partial: "partial",
  canceled: "cancelled",
  cancelled: "cancelled",
  failed: "cancelled",
  refunded: "cancelled",
};

// Unknown words are treated as "in progress" so an order is never wrongly completed or refunded.
export function mapProviderStatus(raw: unknown): OrderStatus {
  return statusMap[String(raw ?? "").trim().toLowerCase().replace(/_/g, " ")] ?? "in_progress";
}

export type ProviderBalance = { balance: number; currency: string };
export type ProviderService = {
  service: string;
  name: string;
  category: string;
  rate: number;
  min: number;
  max: number;
  refill: boolean;
  platform?: string; // PawaBoost only
  delivery?: string; // PawaBoost only, e.g. "0-1 Hour"
};

function assertLive() {
  if (providerMode() === "mock") throw new Error("No provider is connected yet.");
}

// ---------- PawaBoost ----------

async function pawa(path: string, init?: { method?: string; body?: unknown }) {
  const res = await fetch(`${url()}${path}`, {
    method: init?.method ?? "GET",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = String(json?.error ?? json?.message ?? `HTTP ${res.status}`);
    if (res.status === 402) throw new Error(`Insufficient supplier balance: ${msg}`);
    if (res.status === 401) throw new Error("The supplier rejected our API key (401). Check PROVIDER_API_KEY.");
    if (res.status === 429) throw new Error("Supplier rate limit reached (60 requests a minute). Try again shortly.");
    throw new Error(msg);
  }
  if (json == null) throw new Error("Provider returned an unreadable response.");
  return json;
}

// ---------- standard v2 SMM API ----------

async function smm(params: Record<string, string>) {
  const res = await fetch(url(), {
    method: "POST",
    body: new URLSearchParams({ key: key(), ...params }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json().catch(() => null);
  if (json == null) throw new Error(`Provider returned an unreadable response (HTTP ${res.status}).`);
  return json;
}

// ---------- public functions ----------

export async function providerAddOrder(input: {
  providerServiceId?: string | null;
  link: string;
  quantity: number;
}): Promise<{ id: string }> {
  if (providerMode() === "mock") return { id: `mock-${Date.now()}` };
  if (!input.providerServiceId) throw new Error("Service has no provider id");
  if (providerKind() === "pawaboost") {
    const json = await pawa("/order", {
      method: "POST",
      body: { serviceId: input.providerServiceId, link: input.link, quantity: input.quantity },
    });
    const id = json?.order?.id;
    if (!id) throw new Error(String(json?.error ?? "Provider rejected the order"));
    return { id: String(id) };
  }
  const json = await smm({
    action: "add",
    service: input.providerServiceId,
    link: input.link,
    quantity: String(input.quantity),
  });
  if (!json.order) throw new Error(json.error ?? "Provider rejected the order");
  return { id: String(json.order) };
}

export async function providerStatus(id: string, createdAt: string): Promise<OrderStatus> {
  if (id.startsWith("mock-")) {
    const age = Date.now() - Date.parse(createdAt);
    if (age < 60_000) return "pending";
    if (age < 300_000) return "in_progress";
    return "completed";
  }
  if (providerKind() === "pawaboost") {
    const json = await pawa(`/order/${encodeURIComponent(id)}`);
    return mapProviderStatus(json?.order?.status ?? json?.status);
  }
  const json = await smm({ action: "status", order: id });
  return mapProviderStatus(json.status);
}

export async function providerBalance(): Promise<ProviderBalance> {
  assertLive();
  if (providerKind() === "pawaboost") {
    const json = await pawa("/balance");
    return { balance: Number(json.balance), currency: String(json.currency ?? "NGN") };
  }
  const json = await smm({ action: "balance" });
  if (json.error) throw new Error(String(json.error));
  return { balance: Number(json.balance), currency: String(json.currency ?? "") };
}

export async function providerServices(): Promise<ProviderService[]> {
  assertLive();
  if (providerKind() === "pawaboost") {
    const json = await pawa("/services");
    const list = json?.services;
    if (!Array.isArray(list)) throw new Error("Provider did not return a service list.");
    return list.map((r: Record<string, unknown>) => ({
      service: String(r.id),
      name: String(r.name ?? ""),
      category: [r.platform, r.category].filter(Boolean).join(" · ") || "Other",
      rate: Number(r.pricePerUnit),
      min: Number(r.minQuantity),
      max: Number(r.maxQuantity),
      refill: false,
      platform: r.platform ? String(r.platform) : undefined,
      delivery: r.deliveryTime ? String(r.deliveryTime) : undefined,
    }));
  }
  const json = await smm({ action: "services" });
  if (!Array.isArray(json)) throw new Error(String(json?.error ?? "Provider did not return a service list."));
  return json.map((r: Record<string, unknown>) => ({
    service: String(r.service),
    name: String(r.name ?? ""),
    category: String(r.category ?? "Other"),
    rate: Number(r.rate),
    min: Number(r.min),
    max: Number(r.max),
    refill: r.refill === true || r.refill === "true" || r.refill === 1,
  }));
}
