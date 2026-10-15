"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary } from "@/lib/ui";
import { Alert, AuthShell, Field } from "./Field";
import { useCooldown } from "./useResend";

// Step 2 of signup: the user types the code Supabase emailed them.
export function VerifyCode({ email, onBack }: { email: string; onBack: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cooldown = useCooldown();

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const token = String(new FormData(e.currentTarget).get("code") || "").replace(/\s/g, "");
    setBusy(true);
    const { error } = await createClient().auth.verifyOtp({ email, token, type: "signup" });
    setBusy(false);
    if (error) {
      setError("That code is wrong or has expired. Check it or request a new one.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function resend() {
    setError("");
    setNotice("");
    const { error } = await createClient().auth.resend({ type: "signup", email });
    if (error) {
      setError(error.message);
      return;
    }
    cooldown.start();
    setNotice("We sent you a new code.");
  }

  return (
    <AuthShell title="Check your email" subtitle={`We sent a code to ${email}. Enter it below to finish creating your account.`}>
      <form onSubmit={verify} className="space-y-4">
        <Field label="Verification code" name="code" inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={10} required autoFocus />
        <Alert error={error} notice={notice} />
        <button type="submit" disabled={busy} className={`w-full ${btnPrimary}`}>
          {busy ? "Checking…" : "Verify and continue"}
        </button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <button onClick={onBack} className="text-muted hover:text-foreground">Use a different email</button>
        <button onClick={resend} disabled={cooldown.left > 0} className="text-accent disabled:text-muted">
          {cooldown.left > 0 ? `Resend in ${cooldown.left}s` : "Resend code"}
        </button>
      </div>
    </AuthShell>
  );
}
