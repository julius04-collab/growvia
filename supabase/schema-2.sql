-- Run this AFTER schema.sql. Safe to run more than once.

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- ---------- services ----------
create table if not exists public.services (
  id serial primary key,
  platform text not null,
  name text not null,
  price_per_1000 numeric(12,2) not null,
  min_qty integer not null,
  max_qty integer not null,
  start_time text not null default 'Instant',
  refill boolean not null default false,
  provider_service_id text,
  active boolean not null default true
);

insert into public.services (platform, name, price_per_1000, min_qty, max_qty, start_time, refill)
select * from (values
  ('Instagram','Followers',3500,100,50000,'0-1 hour',true),
  ('Instagram','Likes',900,50,100000,'0-30 min',false),
  ('Instagram','Reel views',400,100,1000000,'Instant',false),
  ('TikTok','Followers',4200,100,30000,'0-2 hours',true),
  ('TikTok','Likes',1100,50,100000,'0-30 min',false),
  ('TikTok','Video views',300,100,5000000,'Instant',false),
  ('YouTube','Video views',2800,500,500000,'0-6 hours',false),
  ('YouTube','Subscribers',18000,50,10000,'0-24 hours',true),
  ('Facebook','Page likes',3800,100,50000,'0-3 hours',true),
  ('X (Twitter)','Followers',5200,100,20000,'0-6 hours',true),
  ('Telegram','Channel members',2900,100,50000,'0-2 hours',true)
) as v(platform,name,price_per_1000,min_qty,max_qty,start_time,refill)
where not exists (select 1 from public.services);

-- ---------- orders: extra columns ----------
alter table public.orders add column if not exists service_id integer references public.services(id);
alter table public.orders add column if not exists provider_order_id text;
alter table public.orders add column if not exists refunded boolean not null default false;

-- ---------- payments ----------
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique,
  gateway text not null check (gateway in ('paystack','flutterwave')),
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','success','failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ---------- tickets ----------
create table if not exists public.tickets (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  reply text,
  status text not null default 'open' check (status in ('open','answered','closed')),
  created_at timestamptz not null default now()
);

-- ---------- row level security ----------
alter table public.services enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;

drop policy if exists "read active services" on public.services;
create policy "read active services" on public.services for select using (active);

drop policy if exists "read own payments" on public.payments;
create policy "read own payments" on public.payments for select using (auth.uid() = user_id);

drop policy if exists "read own tickets" on public.tickets;
create policy "read own tickets" on public.tickets for select using (auth.uid() = user_id);

drop policy if exists "create own tickets" on public.tickets;
create policy "create own tickets" on public.tickets for insert
  with check (auth.uid() = user_id and status = 'open' and reply is null);

-- ---------- functions ----------

-- Place an order: price is computed here from the services table, never trusted from the browser.
create or replace function public.place_order(p_service_id integer, p_link text, p_quantity integer)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  s public.services;
  v_charge numeric;
  v_id bigint;
begin
  if v_uid is null then raise exception 'Please sign in again.'; end if;
  if p_link is null or length(trim(p_link)) < 4 or length(p_link) > 500 then
    raise exception 'Enter a valid link.';
  end if;
  select * into s from public.services where id = p_service_id and active;
  if not found then raise exception 'This service is not available.'; end if;
  if p_quantity < s.min_qty or p_quantity > s.max_qty then
    raise exception 'Quantity must be between % and %.', s.min_qty, s.max_qty;
  end if;
  v_charge := round(s.price_per_1000 * p_quantity / 1000.0, 2);
  update public.profiles set balance = balance - v_charge
    where id = v_uid and balance >= v_charge;
  if not found then raise exception 'Insufficient balance. Please add funds.'; end if;
  insert into public.orders (user_id, service_id, service_name, link, quantity, charge)
    values (v_uid, s.id, s.platform || ' ' || s.name, p_link, p_quantity, v_charge)
    returning id into v_id;
  return v_id;
end;
$$;

-- Credit a verified payment exactly once.
create or replace function public.settle_payment(p_reference text)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_amount numeric;
begin
  update public.payments set status = 'success', paid_at = now()
    where reference = p_reference and status = 'pending'
    returning user_id, amount into v_user, v_amount;
  if v_user is null then return 0; end if;
  update public.profiles set balance = balance + v_amount where id = v_user;
  return v_amount;
end;
$$;

-- Return the money for an order once.
create or replace function public.refund_order(p_order_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found or o.refunded then return; end if;
  update public.orders set refunded = true, status = 'cancelled' where id = p_order_id;
  update public.profiles set balance = balance + o.charge where id = o.user_id;
end;
$$;

revoke all on function public.place_order(integer, text, integer) from public, anon;
grant execute on function public.place_order(integer, text, integer) to authenticated;

revoke all on function public.settle_payment(text) from public, anon, authenticated;
grant execute on function public.settle_payment(text) to service_role;

revoke all on function public.refund_order(bigint) from public, anon, authenticated;
grant execute on function public.refund_order(bigint) to service_role;

-- ---------- make yourself admin (replace the email, then run just this line) ----------
-- update public.profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
