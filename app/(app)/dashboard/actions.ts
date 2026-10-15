"use server";

import { requireUser } from "@/lib/auth";
import { syncOrders } from "@/lib/orders";

// Pulls fresh statuses from the provider for this user's active orders.
export async function refreshMyOrders() {
  const { user } = await requireUser();
  await syncOrders(user.id);
}
