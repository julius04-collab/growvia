import Link from "next/link";
import { platforms, sampleServices, naira, site } from "@/lib/site";
import { FeatureIcon, FloatingChips, GrowthIllustration, PlatformTile, StepIcon } from "@/components/home/visuals";

const steps = [
  { n: "1", icon: "user" as const, title: "Create an account", text: "Sign up with your email in under a minute." },
  { n: "2", icon: "wallet" as const, title: "Add funds", text: "Top up your wallet in naira by card or bank transfer." },
  { n: "3", icon: "link" as const, title: "Place an order", text: "Pick a service, paste your link, choose a quantity." },
  { n: "4", icon: "chart" as const, title: "Track it", text: "Watch your order status update from your dashboard." },
];

const features = [
  { icon: "screen", title: "Everything on one screen", text: "Place an order in a few taps: platform, service, link, quantity, done." },
  { icon: "naira", title: "Clear prices in naira", text: "See the exact total before you pay. No hidden fees." },
  { icon: "track", title: "Live order tracking", text: "Pending, in progress, completed. Always visible in your dashboard." },
  { icon: "refill", title: "Refill on selected services", text: "Services marked with refill are topped up if the count drops within the stated period." },
  { icon: "api", title: "Reseller API (coming soon)", text: "Building your own panel? API access is on the way." },
  { icon: "support", title: "Real support", text: "Open a ticket or message us on WhatsApp." },
];

const faqs = [
  {
    q: "How do I add funds?",
    a: "Open Add funds in your dashboard and pay by card or bank transfer. Your wallet is credited after the payment is confirmed.",
  },
  {
    q: "How fast do orders start?",
    a: "Each service shows its usual start time. Many start within minutes, but times vary by service and platform.",
  },
  {
    q: "What do I need before ordering?",
    a: "Your account or post must be public and the link must be correct. Orders can't be changed once they start.",
  },
  {
    q: "Can results drop?",
    a: "Yes, counts on some services can go down over time. Services marked with refill are topped up within the refill period shown.",
  },
  {
    q: "Do you need my password?",
    a: "Never. We only ever need a public link. Don't share your password with anyone.",
  },
  {
    q: "What if an order isn't delivered?",
    a: "Undelivered or partially delivered orders are refunded to your wallet. See our Refund Policy for the details.",
  },
];

export default function Home() {
  const preview = sampleServices.slice(0, 5);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-primary/30 blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-16 md:grid-cols-2 md:items-center md:pt-24">
          <div>
            <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
              Social media marketing services
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Grow your social media presence, <span className="hl-accent">in seconds.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Order followers, likes and views for Instagram, TikTok, YouTube and more from one clean dashboard. Pay in naira. Track every order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-xl bg-accent px-6 py-3 font-semibold text-black transition hover:brightness-95">
                Create free account
              </Link>
              <Link href="/services" className="rounded-xl border border-border px-6 py-3 font-semibold transition hover:bg-surface">
                View services
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <li>✓ Pay in ₦</li>
              <li>✓ Live order tracking</li>
              <li>✓ Support when you need it</li>
            </ul>
          </div>

          {/* Dashboard preview */}
          <div className="relative">
          <FloatingChips />
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted">Wallet balance</p>
                <p className="text-3xl font-bold">₦25,000</p>
              </div>
              <span className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black">Add funds</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[["Orders", "128"], ["Pending", "3"], ["Completed", "120"]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface-2 p-3">
                  <p className="text-xl font-bold">{v}</p>
                  <p className="text-xs text-muted">{k}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              {[
                ["Instagram followers", "In progress", "text-amber-300 bg-amber-300/10"],
                ["TikTok views", "Completed", "text-accent bg-accent/10"],
                ["YouTube views", "Pending", "text-sky-300 bg-sky-300/10"],
              ].map(([n, s, c]) => (
                <div key={n} className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3 text-sm">
                  <span>{n}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c}`}>{s}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted">Preview of the dashboard</p>
          </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-7">
          <p className="mb-4 text-center text-sm text-muted">Services for the platforms you use</p>
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2.5 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            {platforms.map((p) => (
              <PlatformTile key={p} name={p} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20">
        <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
        <p className="mt-2 text-muted">Four steps from sign up to results.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <StepIcon name={s.icon} />
                <span className="text-4xl font-bold text-border">{s.n}</span>
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Popular services</h2>
            <p className="mt-2 text-muted">Prices shown per 1,000. Sample pricing, final rates are in your dashboard.</p>
          </div>
          <Link href="/services" className="hidden text-sm text-accent sm:block">See all →</Link>
        </div>
        <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {preview.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium">{s.platform} {s.name}</p>
                <p className="text-xs text-muted">Starts: {s.start} · Min {s.min.toLocaleString()}{s.refill ? " · Refill" : ""}</p>
              </div>
              <p className="whitespace-nowrap font-semibold">{naira(s.pricePer1000)} <span className="text-xs font-normal text-muted">/1k</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <h2 className="text-3xl font-bold tracking-tight">Built to be simple</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-surface p-5">
              <FeatureIcon name={f.icon} />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Growth illustration */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-border bg-surface p-6 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Start small. Scale when it works.</h2>
            <p className="mt-3 text-muted">
              Order a small batch first, see how it lands, then scale up from the same wallet. Every order is tracked in your dashboard from pending to completed.
            </p>
            <Link href="/signup" className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 font-semibold text-black transition hover:brightness-95">
              Create free account
            </Link>
          </div>
          <div>
            <GrowthIllustration />
            <p className="mt-1 text-center text-[11px] text-muted">Illustration</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-20">
        <h2 className="text-3xl font-bold tracking-tight">Common questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-surface p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.q}
                <span className="text-accent transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="rounded-3xl bg-primary px-6 py-12 text-center">
          <h2 className="text-3xl font-bold">Ready to place your first order?</h2>
          <p className="mx-auto mt-2 max-w-md text-white/80">Create your free {site.name} account and start in minutes.</p>
          <Link href="/signup" className="mt-6 inline-block rounded-xl bg-accent px-7 py-3 font-semibold text-black">
            Create free account
          </Link>
        </div>
      </section>
    </>
  );
}
