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
Sign-up and password-reset use a code the user types in. Edit two templates so they show the code:

**Confirm signup** (subject: `Your Growvia code`)
```html
<h2>Confirm your email</h2>
<p>Your Growvia verification code is:</p>
<h1>{{ .Token }}</h1>
<p>If you did not sign up, ignore this email.</p>
```
**Reset password** (subject: `Reset your Growvia password`)
```html
<h2>Reset your password</h2>
<p>Your Growvia reset code is:</p>
<h1>{{ .Token }}</h1>
<p>If you did not ask for this, ignore this email.</p>
```
Also: Authentication > Sign In / Providers > Email: keep "Confirm email" ON.
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
