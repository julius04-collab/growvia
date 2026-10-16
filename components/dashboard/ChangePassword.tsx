"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary } from "@/lib/ui";
import { PasswordField } from "@/components/auth/PasswordField";
import { PASSWORD_MESSAGE, passwordOk } from "@/lib/password";

export function ChangePassword() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [fieldKey, setFieldKey] = useState(0); // new key = empty password box

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    const form = e.currentTarget;
    const password = String(new FormData(form).get("password") || "");
    if (!passwordOk(password)) return setError(PASSWORD_MESSAGE);
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    form.reset();
    setFieldKey((k) => k + 1);
    setOk("Password updated.");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <PasswordField key={fieldKey} label="New password" autoComplete="new-password" rules />
      {error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      {ok && <p role="status" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{ok}</p>}
      <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : "Update password"}</button>
    </form>
  );
}
