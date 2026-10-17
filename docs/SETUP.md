# Growvia setup (test mode)

Do these in order. Everything here uses TEST keys, so no real money moves.

## 1. Database (Supabase > SQL Editor)
Paste the CONTENTS of each file, one at a time, and click Run:
1. `supabase/schema.sql`
2. `supabase/schema-2.sql` (safe to run again later)

Then make yourself admin. Replace the email with the one you signed up with and run:
```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```
Admin panel: `/admin`.

## 2. Environment variables
Local: copy `.env.example` to `.env.local`. Live: Vercel > Settings > Environment Variables, then redeploy.

| Name | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page, anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | same page, service_role / secret key. Server only. Never share it |
| `PAYMENT_GATEWAY` | `paystack` or `flutterwave` (the default shown to users) |
| `PAYSTACK_SECRET_KEY` | Paystack > Settings > API Keys. Test key starts `sk_test_` |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave > Settings > API. Test key |
| `FLUTTERWAVE_SECRET_HASH` | any random string you make up; paste the same one in Flutterwave's webhook settings |
| `PROVIDER_API_URL`, `PROVIDER_API_KEY` | leave empty for now: orders are simulated |

## 3. Email codes (Supabase > Authentication > Email Templates)
Sign-up and password-reset use a 6-digit code the user pastes or types. Use the designed templates in `supabase/email-templates/`:

1. **Confirm signup**: open `supabase/email-templates/confirm-signup.html`, copy ALL of it, paste it into the "Confirm signup" template's message body, and set the subject to `{{ .Token }} is your Growvia verification code`.
2. **Reset password**: same with `reset-password.html`, subject `{{ .Token }} is your Growvia password reset code`.
3. Authentication > Sign In / Providers > Email: keep "Confirm email" ON and set **Email OTP Length to 6** (the code boxes in the app are six wide). The templates say the code lasts 1 hour, which is Supabase's default "Email OTP Expiration" (3600).

Do not put `{{ .ConfirmationURL }}` back in these templates. The code is the only way in, and the code is one unbroken string of digits so a single touch-and-hold selects all of it.

Supabase's built-in sender only allows a few emails per hour. Before real users, add your own SMTP (Project Settings > Authentication > SMTP), for example Resend.

## 4. Webhooks (optional but recommended)
The wallet is already credited when the customer returns from the payment page. Webhooks cover the case where they close the tab.
- Paystack > Settings > API Keys & Webhooks > Test Webhook URL: `https://growvia-one.vercel.app/api/webhooks/paystack`
- Flutterwave > Settings > Webhooks: URL `https://growvia-one.vercel.app/api/webhooks/flutterwave`, Secret hash = your `FLUTTERWAVE_SECRET_HASH`

## 5. Test checklist
1. Sign up with a real email, type the code, land on the dashboard.
2. Log out, use Forgot password, type the code, set a new password.
3. Add funds with a test payment. The balance should rise.
4. New order: pick a service, paste any link, place it. Watch Orders go Pending, In progress, Completed (about 5 minutes, simulated).
5. Open a support ticket. In `/admin/tickets`, reply. The reply appears on the user's Support page.
6. In `/admin/services`, change a price and confirm New order shows it.

## 6. Going live later
- Replace the test keys with live keys (Paystack `sk_live_`, Flutterwave live) and re-register the webhook URLs in live mode.
- Set `PROVIDER_API_URL` / `PROVIDER_API_KEY`, then put each service's real provider service ID in `/admin/services`.
- Add your own SMTP, a real domain, real support email/WhatsApp in `lib/site.ts`, and have the legal pages reviewed.

## Not built yet
- Reseller API (the home page says "coming soon").
- Automatic refund of the undelivered part of a "Partial" order (admin can cancel and refund the whole order).
- Manual wallet credit for a payment that arrived with the wrong amount (it stays Pending and is logged).
- The public /services page still shows fixed sample prices, not the live database prices.


## Screens added in the latest update

Customer: order details (`/dashboard/orders/[id]`), payment result (`/dashboard/add-funds/result`), live prices on `/services`, loading, error, access-denied and not-found pages, "orders paused" and "service unavailable" states.

Admin (sign in at `/admin-login`): order details, customer details with wallet adjustment, refunds (partial and full, unconfirmed payments), supplier (balance, health, provider service list), settings (pause orders, announcement, support contacts, low-balance alert).

**You must re-run `supabase/setup-all.sql`** (safe to run again) to create the `settings` and `wallet_adjustments` tables and the partial-refund and wallet-adjustment functions. Until you do, those admin screens show a notice instead of working, and everything else keeps working.


## PawaBoost supplier

1. In PawaBoost, create an API key. Copy it (starts with `pk_live_`).
2. In Vercel add: `PROVIDER_API_URL=https://pawaboost.com/api/v1` and `PROVIDER_API_KEY=<your key>`. Redeploy.
3. Webhook (optional): on the key in PawaBoost, set the webhook URL to `https://<your-site>/api/webhooks/pawaboost` and a secret. Add the same secret in Vercel as `PAWABOOST_WEBHOOK_SECRET`. Use the "test webhook" button in PawaBoost; it should succeed.
4. Open Admin → Supplier. You should see your PawaBoost balance and their service list. Copy each service ID into Admin → Services → "Provider service ID". Orders for unmapped services fail and are refunded.
5. Place one small real test order and compare the charge to the price. PawaBoost's docs do not say if the price is per unit or per 1,000.

Notes: PawaBoost allows 60 requests a minute per key, and webhooks are not retried. Statuses are also polled, so a missed webhook only delays an update.


## Getting real services on the site

The 11 services created by the SQL are placeholders with no supplier behind them. To replace them: Admin -> Supplier -> **Import services**. Tick the services you want to sell, set your markup, keep "Hide the placeholder sample services" ticked, and import. Prices can be edited afterwards under Admin -> Services. The public /services page and the customer order form read from this list.
