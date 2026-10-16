"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/dashboard/NavLinks";
import { passwordRules } from "@/lib/password";
import { inputCls } from "@/lib/ui";

// Password box with a show/hide eye and, when `rules` is on, a live checklist of what it must contain.
export function PasswordField({
  label,
  name = "password",
  autoComplete,
  rules = false,
  autoFocus,
}: {
  label: string;
  name?: string;
  autoComplete: "new-password" | "current-password";
  rules?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const [shown, setShown] = useState(false);
  const [touched, setTouched] = useState(false);
  const passed = passwordRules.filter((r) => r.test(value)).length;

  return (
    <div className="text-sm">
      <label htmlFor={id} className="mb-1 block text-muted">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setTouched(true)}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          required
          aria-describedby={rules ? `${id}-rules` : undefined}
          className={`${inputCls} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-muted transition hover:text-foreground"
        >
          <Icon name={shown ? "eyeoff" : "eye"} className="h-5 w-5" />
        </button>
      </div>

      {rules && (touched || value) && (
        <div id={`${id}-rules`} className="mt-3 rounded-xl bg-surface-2 p-3">
          <div className="mb-2 flex gap-1" aria-hidden="true">
            {passwordRules.map((r, i) => (
              <span key={r.key} className={`h-1 flex-1 rounded-full transition ${i < passed ? (passed === passwordRules.length ? "bg-accent" : "bg-amber-300") : "bg-border"}`} />
            ))}
          </div>
          <p className="mb-1 text-xs text-muted">Your password needs:</p>
          <ul className="space-y-1">
            {passwordRules.map((r) => {
              const ok = r.test(value);
              return (
                <li key={r.key} className={`flex items-center gap-2 text-xs ${ok ? "text-accent" : "text-muted"}`}>
                  <Icon name={ok ? "check" : "x"} className="h-3.5 w-3.5" stroke={2.6} />
                  <span>{r.label}</span>
                  <span className="sr-only">{ok ? "done" : "not yet"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
