-- Run AFTER schema.sql and schema-2.sql (or just run setup-all.sql). Safe to run more than once.

-- ---------- site settings (key/value) ----------
create table if not exists public.settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
-- Customers may read only the public keys. Everything is written by the server.
drop policy if exists "read public settings" on public.settings;
create policy "read public settings" on public.settings for select
  using (key in ('orders_paused','announcement','support_email','support_whatsapp'));

-- ---------- wallet adjustments log ----------
create table if not exists public.wallet_adjustments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  note text not null default '',
  order_id bigint,
  created_at timestamptz not null default now()
);
alter table public.wallet_adjustments enable row level security;
drop policy if exists "read own adjustments" on public.wallet_adjustments;
create policy "read own adjustments" on public.wallet_adjustments for select using (auth.uid() = user_id);

-- ---------- how much of an order was refunded ----------
alter table public.orders add column if not exists refunded_amount numeric(12,2) not null default 0;
update public.orders set refunded_amount = charge where refunded and refunded_amount = 0;

-- Full refund (replaces the earlier version so it also records the amount).
create or replace function public.refund_order(p_order_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found or o.refunded then return; end if;
  update public.orders set refunded = true, refunded_amount = o.charge, status = 'cancelled' where id = p_order_id;
  update public.profiles set balance = balance + o.charge where id = o.user_id;
  insert into public.wallet_adjustments (user_id, amount, note, order_id)
    values (o.user_id, o.charge, 'Refund for order #' || p_order_id, p_order_id);
end;
$$;

-- Refund part of an order once (for partial deliveries).
create or replace function public.refund_order_partial(p_order_id bigint, p_amount numeric)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;
  if o.refunded then raise exception 'This order was already refunded.'; end if;
  if p_amount is null or p_amount <= 0 or p_amount > o.charge then
    raise exception 'Refund must be more than 0 and at most the order charge.';
  end if;
  update public.orders set refunded = true, refunded_amount = p_amount where id = p_order_id;
  update public.profiles set balance = balance + p_amount where id = o.user_id;
  insert into public.wallet_adjustments (user_id, amount, note, order_id)
    values (o.user_id, p_amount, 'Partial refund for order #' || p_order_id, p_order_id);
end;
$$;

-- Manual credit or debit by an admin. Never lets a balance go below zero.
create or replace function public.adjust_wallet(p_user uuid, p_amount numeric, p_note text)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_balance numeric;
begin
  if p_amount is null or p_amount = 0 then raise exception 'Enter an amount.'; end if;
  if p_note is null or length(trim(p_note)) < 3 then raise exception 'Add a short note.'; end if;
  update public.profiles set balance = balance + p_amount
    where id = p_user and balance + p_amount >= 0
    returning balance into v_balance;
  if not found then raise exception 'User not found, or the balance would go below zero.'; end if;
  insert into public.wallet_adjustments (user_id, amount, note) values (p_user, p_amount, trim(p_note));
  return v_balance;
end;
$$;

revoke all on function public.refund_order(bigint) from public, anon, authenticated;
grant execute on function public.refund_order(bigint) to service_role;
revoke all on function public.refund_order_partial(bigint, numeric) from public, anon, authenticated;
grant execute on function public.refund_order_partial(bigint, numeric) to service_role;
revoke all on function public.adjust_wallet(uuid, numeric, text) from public, anon, authenticated;
grant execute on function public.adjust_wallet(uuid, numeric, text) to service_role;
