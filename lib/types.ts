export type FormState = { error?: string; ok?: string };

export type DbService = {
  id: number;
  platform: string;
  name: string;
  price_per_1000: number;
  min_qty: number;
  max_qty: number;
  start_time: string;
  refill: boolean;
};
