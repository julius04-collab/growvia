"use client";

import { useRef } from "react";

// Six boxes for a one-time code. Paste the whole code into any box and it fills all six.
// Typing moves forward, Backspace moves back, and onComplete fires once all six digits are in.
export function CodeInput({
  value,
  onChange,
  onComplete,
  length = 6,
  autoFocus = false,
  invalid = false,
  disabled = false,
}: {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function commit(next: string, focusAt?: number) {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (focusAt !== undefined) refs.current[Math.min(focusAt, length - 1)]?.focus();
    if (clean.length === length) onComplete?.(clean);
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          maxLength={length} // lets a pasted code arrive whole; we trim it ourselves
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            let typed = e.target.value.replace(/\D/g, "");
            // A box that already held a digit now holds two: keep only the new one.
            if (typed.length === 2 && d) typed = typed.replace(d, "") || typed.slice(-1);
            if (!typed) return commit(value.slice(0, i) + value.slice(i + 1));
            // One digit typed, or a whole code pasted/autofilled: fill from this box onward.
            const merged = (value.slice(0, i) + typed + value.slice(i + 1)).slice(0, length);
            commit(typed.length > 1 ? typed : merged, i + typed.length);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              e.preventDefault();
              commit(value.slice(0, i - 1) + value.slice(i), i - 1);
            } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text").replace(/\D/g, "");
            if (!text) return;
            e.preventDefault();
            commit(text, text.length);
          }}
          className={`h-14 w-full min-w-0 rounded-xl border bg-surface-2 text-center text-2xl font-bold tabular-nums outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 ${
            invalid ? "border-red-400/70" : d ? "border-primary" : "border-border"
          }`}
        />
      ))}
    </div>
  );
}
