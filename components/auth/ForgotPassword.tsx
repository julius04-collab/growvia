"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authConfigured } from "@/lib/supabase/env";
import { btnPrimary } from "@/lib/ui";
import { Alert, AuthShell, Field } from "./Field";
import { useCooldown } from "./useResend";

export function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cooldown = useCooldown();

  async function sendCode(address: string) {
    const { error } = await createClient().auth.resetPasswordForEmail(address);
    if (error) throw error;
    cooldown.start();
  }

  async function requestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!authConfigured) {
      setError("Sign-in isn't set up yet. Please check back soon.");
      return;
    }
    const address = String(new FormData(e.currentTarget).get("email") || "").trim();
    setBusy(true);
    try {
      await sendCode(address);
      setEmail(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function reset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setError("");
    const form = new FormData(e.currentTarget);
    const token = String(form.get("code") || "").replace(/\s/g, "");
    const password = String(form.get("password") || "");
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: vErr } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
    if (vErr) {
      setBusy(false);
      setError("That code is wrong or has expired. Check it or request a new one.");
      return;
    }
    const { error: uErr } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (uErr) {
      setError(uErr.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (!email) {
    return (
      <AuthShell title="Forgot your password?" subtitle="Enter your email and we will send you a code to reset it.">
        <form onSubmit={requestCode} className="space-y-4">
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Alert error={error} />
          <button type="submit" disabled={busy} className={`w-full ${btnPrimary}`}>
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/login" className="text-accent">Back to log in</Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle={`If an account exists for ${email}, we sent it a code. Enter the code and choose a new password.`}>
      <form onSubmit={reset} className="space-y-4">
        <Field label="Code from your email" name="code" inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={10} required autoFocus />
        <Field label="New password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <Alert error={error} notice={notice} />
        <button type="submit" disabled={busy} className={`w-full ${btnPrimary}`}>
          {busy ? "Saving…" : "Reset password"}
        </button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <button onClick={() => setEmail(null)} className="text-muted hover:text-foreground">Use a different email</button>
        <button
          disabled={cooldown.left > 0}
          onClick={async () => {
            setError("");
            try {
              await sendCode(email);
              setNotice("We sent you a new code.");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not send the code.");
            }
          }}
          className="text-accent disabled:text-muted"
        >
          {cooldown.left > 0 ? `Resend in ${cooldown.left}s` : "Resend code"}
        </button>
      </div>
    </AuthShell>
  );
}
