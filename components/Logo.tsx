import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-accent">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 17 12 5l7 12" />
          <path d="M9 17h6" />
        </svg>
      </span>
      Growvia
    </Link>
  );
}
