"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary } from "@/lib/ui";
import { Alert, AuthShell } from "./Field";
import { CodeInput } from "./CodeInput";
import { useCooldown } from "./useResend";

// Step 2 of signup: the user enters the 6-digit code Supabase emailed them.
export function VerifyCode({ email, onBack }: { email: string; onBack: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cooldown = useCooldown();
  const working = useRef(false); // stops auto-submit and the button from firing twice

  async function verify(token: string) {
    if (working.current || token.length !== 6) return;
    working.current = true;
    setError("");
    setNotice("");
    setBusy(true);
    const { error } = await createClient().auth.verifyOtp({ email, token, type: "signup" });
    if (error) {
      setBusy(false);
      working.current = false;
      setCode("");
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
    setCode("");
    cooldown.start();
    setNotice("We sent you a new code. Use the newest one.");
  }

  return (
    <AuthShell title="Check your email" subtitle={`We sent a 6-digit code to ${email}. Paste it here or type it in.`}>
      <form onSubmit={(e) => { e.preventDefault(); verify(code); }} className="space-y-4">
        <CodeInput value={code} onChange={(c) => { setCode(c); if (error) setError(""); }} onComplete={verify} autoFocus invalid={Boolean(error)} disabled={busy} />
        <Alert error={error} notice={notice} />
        <button type="submit" disabled={busy || code.length !== 6} className={`w-full ${btnPrimary}`}>
          {busy ? "Checking…" : "Verify and continue"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-muted">Tip: touch and hold the code in the email to copy it, then paste it into the first box.</p>
      <div className="mt-5 flex items-center justify-between text-sm">
        <button onClick={onBack} className="text-muted hover:text-foreground">Use a different email</button>
        <button onClick={resend} disabled={cooldown.left > 0} className="text-accent disabled:text-muted">
          {cooldown.left > 0 ? `Resend in ${cooldown.left}s` : "Resend code"}
        </button>
      </div>
    </AuthShell>
  );
}
