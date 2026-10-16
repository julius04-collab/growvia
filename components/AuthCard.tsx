"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authConfigured } from "@/lib/supabase/env";
import { btnPrimary } from "@/lib/ui";
import { Alert, AuthShell, Field } from "./auth/Field";
import { PasswordField } from "./auth/PasswordField";
import { PASSWORD_MESSAGE, passwordOk } from "@/lib/password";
import { VerifyCode } from "./auth/VerifyCode";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!authConfigured) {
      setError("Sign-in isn't set up yet. Please check back soon.");
      return;
    }
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const fullName = String(form.get("name") || "").trim();

    if (isSignup && !passwordOk(password)) {
      setError(PASSWORD_MESSAGE);
      return;
    }

    setBusy(true);
    const supabase = createClient();
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setVerifyEmail(email);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Account exists but email was never confirmed: send a fresh code.
          if (error.message.toLowerCase().includes("not confirmed")) {
            await supabase.auth.resend({ type: "signup", email });
            setVerifyEmail(email);
            return;
          }
          throw error;
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg.toLowerCase().includes("invalid login") ? "Wrong email or password." : msg);
    } finally {
      setBusy(false);
    }
  }

  if (verifyEmail) return <VerifyCode email={verifyEmail} onBack={() => setVerifyEmail(null)} />;

  return (
    <AuthShell
      title={isSignup ? "Create your account" : "Welcome back"}
      subtitle={isSignup ? "Start ordering in a few minutes." : "Log in to your dashboard."}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {isSignup && <Field label="Full name" name="name" type="text" autoComplete="name" required />}
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <PasswordField label="Password" autoComplete={isSignup ? "new-password" : "current-password"} rules={isSignup} />
        {!isSignup && (
          <div className="-mt-2 text-right text-sm">
            <Link href="/forgot-password" className="text-accent">Forgot password?</Link>
          </div>
        )}
        <Alert error={error} />
        <button type="submit" disabled={busy} className={`w-full ${btnPrimary}`}>
          {busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-accent">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </AuthShell>
  );
}
