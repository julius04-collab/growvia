"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary, inputCls } from "@/lib/ui";

export function ChangePassword() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    const form = e.currentTarget;
    const password = String(new FormData(form).get("password") || "");
    if (password.length < 8) return setError("Use a password with at least 8 characters.");
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    form.reset();
    setOk("Password updated.");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-muted">New password</span>
        <input name="password" type="password" autoComplete="new-password" minLength={8} required className={inputCls} />
      </label>
      {error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      {ok && <p role="status" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{ok}</p>}
      <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : "Update password"}</button>
    </form>
  );
}
