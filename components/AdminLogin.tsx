"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authConfigured } from "@/lib/supabase/env";
import { btnPrimary } from "@/lib/ui";
import { Alert, AuthShell, Field } from "./auth/Field";
import { PasswordField } from "./auth/PasswordField";

export function AdminLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!authConfigured) return setError("Sign-in isn't set up yet.");
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    });
    setBusy(false);
    if (error) return setError(error.message.toLowerCase().includes("invalid login") ? "Wrong email or password." : error.message);
    // The admin pages check the admin flag themselves and show "access denied" to everyone else.
    router.push("/admin");
    router.refresh();
  }

  return (
    <AuthShell title="Admin sign in" subtitle="For Growvia staff only.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <PasswordField label="Password" autoComplete="current-password" />
        <Alert error={error} />
        <button type="submit" disabled={busy} className={`w-full ${btnPrimary}`}>{busy ? "Please wait…" : "Sign in"}</button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Not an admin? <Link href="/login" className="text-accent">Customer login</Link>
      </p>
    </AuthShell>
  );
}
