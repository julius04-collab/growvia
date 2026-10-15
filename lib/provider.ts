import "server-only";

// Talks to the SMM provider. Uses the standard "v2" panel API.
// With no PROVIDER_API_URL / PROVIDER_API_KEY it runs a built-in MOCK that
// accepts every order and moves it pending -> in progress -> completed over ~5 minutes.

export type OrderStatus = "pending" | "in_progress" | "completed" | "partial" | "cancelled";

const url = () => process.env.PROVIDER_API_URL;
const key = () => process.env.PROVIDER_API_KEY;
export const providerMode = () => (url() && key() ? "live" : "mock");

async function call(params: Record<string, string>) {
  const res = await fetch(url()!, {
    method: "POST",
    body: new URLSearchParams({ key: key()!, ...params }),
    cache: "no-store",
  });
  return res.json();
}

export async function providerAddOrder(input: {
  providerServiceId?: string | null;
  link: string;
  quantity: number;
}): Promise<{ id: string }> {
  if (providerMode() === "mock") return { id: `mock-${Date.now()}` };
  if (!input.providerServiceId) throw new Error("Service has no provider id");
  const json = await call({
    action: "add",
    service: input.providerServiceId,
    link: input.link,
    quantity: String(input.quantity),
  });
  if (!json.order) throw new Error(json.error ?? "Provider rejected the order");
  return { id: String(json.order) };
}

const map: Record<string, OrderStatus> = {
  pending: "pending",
  processing: "in_progress",
  "in progress": "in_progress",
  completed: "completed",
  partial: "partial",
  canceled: "cancelled",
  cancelled: "cancelled",
  refunded: "cancelled",
};

export async function providerStatus(id: string, createdAt: string): Promise<OrderStatus> {
  if (id.startsWith("mock-")) {
    const age = Date.now() - Date.parse(createdAt);
    if (age < 60_000) return "pending";
    if (age < 300_000) return "in_progress";
    return "completed";
  }
  const json = await call({ action: "status", order: id });
  return map[String(json.status ?? "").toLowerCase()] ?? "in_progress";
}
