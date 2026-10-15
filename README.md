# Growvia

Social media marketing services platform. Phase 1: marketing site, services page, legal pages, auth UI.

## Setup
Full step-by-step (database, keys, email codes, webhooks, testing): [docs/SETUP.md](docs/SETUP.md)

## Live links
- Site: https://growvia-one.vercel.app/
- Sign in: https://growvia-one.vercel.app/login
- Sign up: https://growvia-one.vercel.app/signup
- Dashboard: https://growvia-one.vercel.app/dashboard (redirects to sign in when logged out)

## Auth setup (Supabase)
1. Run `supabase/schema.sql` in the Supabase SQL Editor.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel and redeploy (see `.env.example`).
3. Auth > URL Configuration: Site URL `https://growvia-one.vercel.app`, redirect `https://growvia-one.vercel.app/auth/callback`.

## Run
```
npm install
npm run dev
```

## Edit before launch
- `lib/site.ts`: support email, WhatsApp, address, and the SAMPLE services/prices
- `app/(site)/terms|privacy|refund`: draft templates, have them reviewed

## Next phases
Auth + wallet (Supabase), provider API integration, Paystack/Flutterwave (swappable), dashboard, admin.
