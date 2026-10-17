// Edit these once the client confirms real details.
export const site = {
  name: "Growvia",
  tagline: "Grow faster. Order in seconds.",
  email: "growvia87@gmail.com",
  whatsapp: "+234 000 000 0000",
  address: "Lagos, Nigeria",
  updated: "October 2026",
};

export const platforms = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
  "X (Twitter)",
  "Telegram",
] as const;

export type Platform = (typeof platforms)[number];

export type Service = {
  id: number;
  platform: Platform;
  name: string;
  pricePer1000: number; // NGN, SAMPLE VALUES until a provider is chosen
  min: number;
  max: number;
  start: string;
  refill: boolean;
};

// SAMPLE DATA. Replace with the services imported from the provider API.
export const sampleServices: Service[] = [
  { id: 1, platform: "Instagram", name: "Followers", pricePer1000: 3500, min: 100, max: 50000, start: "0-1 hour", refill: true },
  { id: 2, platform: "Instagram", name: "Likes", pricePer1000: 900, min: 50, max: 100000, start: "0-30 min", refill: false },
  { id: 3, platform: "Instagram", name: "Reel views", pricePer1000: 400, min: 100, max: 1000000, start: "Instant", refill: false },
  { id: 4, platform: "TikTok", name: "Followers", pricePer1000: 4200, min: 100, max: 30000, start: "0-2 hours", refill: true },
  { id: 5, platform: "TikTok", name: "Likes", pricePer1000: 1100, min: 50, max: 100000, start: "0-30 min", refill: false },
  { id: 6, platform: "TikTok", name: "Video views", pricePer1000: 300, min: 100, max: 5000000, start: "Instant", refill: false },
  { id: 7, platform: "YouTube", name: "Video views", pricePer1000: 2800, min: 500, max: 500000, start: "0-6 hours", refill: false },
  { id: 8, platform: "YouTube", name: "Subscribers", pricePer1000: 18000, min: 50, max: 10000, start: "0-24 hours", refill: true },
  { id: 9, platform: "Facebook", name: "Page likes", pricePer1000: 3800, min: 100, max: 50000, start: "0-3 hours", refill: true },
  { id: 10, platform: "X (Twitter)", name: "Followers", pricePer1000: 5200, min: 100, max: 20000, start: "0-6 hours", refill: true },
  { id: 11, platform: "Telegram", name: "Channel members", pricePer1000: 2900, min: 100, max: 50000, start: "0-2 hours", refill: true },
];

export const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
