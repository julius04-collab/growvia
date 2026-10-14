import Link from "next/link";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const input =
    "w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none transition focus:border-primary";
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-bold">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-muted">
          {isSignup ? "Start ordering in a few minutes." : "Log in to your dashboard."}
        </p>
        {/* UI only for now. Auth will be connected in the next phase. */}
        <form className="mt-6 space-y-4">
          {isSignup && (
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Full name</span>
              <input className={input} type="text" autoComplete="name" />
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Email</span>
            <input className={input} type="email" autoComplete="email" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Password</span>
            <input className={input} type="password" autoComplete={isSignup ? "new-password" : "current-password"} />
          </label>
          <button type="button" className="w-full rounded-xl bg-accent py-3 font-semibold text-black">
            {isSignup ? "Create account" : "Log in"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={isSignup ? "/login" : "/signup"} className="text-accent">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
