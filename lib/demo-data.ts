// Sample data for the public /demo preview. Not real.
import { sampleServices } from "@/lib/site";
import type { DbService } from "@/lib/types";

export const demoBalance = 25000;

export const demoOrders = [
  { id: 1042, service_name: "Instagram Followers", link: "https://instagram.com/yourbrand", quantity: 1000, charge: 3500, status: "in_progress", created_at: "2026-10-15T07:42:00Z" },
  { id: 1041, service_name: "TikTok Video views", link: "https://tiktok.com/@yourbrand/video/123", quantity: 10000, charge: 3000, status: "completed", created_at: "2026-10-14T15:10:00Z" },
  { id: 1040, service_name: "Instagram Likes", link: "https://instagram.com/p/AbC123", quantity: 500, charge: 450, status: "completed", created_at: "2026-10-14T11:05:00Z" },
  { id: 1039, service_name: "YouTube Video views", link: "https://youtube.com/watch?v=demo", quantity: 2000, charge: 5600, status: "pending", created_at: "2026-10-14T09:30:00Z" },
  { id: 1038, service_name: "Telegram Channel members", link: "https://t.me/yourchannel", quantity: 1000, charge: 2900, status: "partial", created_at: "2026-10-13T18:20:00Z" },
  { id: 1037, service_name: "Facebook Page likes", link: "https://facebook.com/yourpage", quantity: 500, charge: 1900, status: "completed", created_at: "2026-10-13T10:00:00Z" },
  { id: 1036, service_name: "X (Twitter) Followers", link: "https://x.com/yourbrand", quantity: 500, charge: 2600, status: "cancelled", created_at: "2026-10-12T14:45:00Z" },
];

export const demoServices: DbService[] = sampleServices.map((s) => ({
  id: s.id,
  platform: s.platform,
  name: s.name,
  price_per_1000: s.pricePer1000,
  min_qty: s.min,
  max_qty: s.max,
  start_time: s.start,
  refill: s.refill,
}));

export const demoPayments = [
  { id: 3, gateway: "paystack", amount: 10000, status: "success", created_at: "2026-10-14T08:15:00Z" },
  { id: 2, gateway: "flutterwave", amount: 5000, status: "failed", created_at: "2026-10-13T16:40:00Z" },
  { id: 1, gateway: "paystack", amount: 20000, status: "success", created_at: "2026-10-12T09:05:00Z" },
];

export const demoTickets = [
  { id: 12, subject: "Order #1038 only partly delivered", message: "I ordered 1,000 members but only about 600 joined. Can you check?", reply: "Thanks for flagging this. We have refunded the undelivered part to your wallet.", status: "answered", created_at: "2026-10-14T10:20:00Z" },
  { id: 13, subject: "How long does YouTube views take?", message: "Order #1039 is still pending after a few hours. Is that normal?", reply: null, status: "open", created_at: "2026-10-15T06:55:00Z" },
];
