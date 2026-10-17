import Link from "next/link";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#6c3bff" />
      <path d="M45 21.5A17 17 0 1 0 49 32H33.5" stroke="#b6ff3b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
      <LogoMark />
      Growvia
    </Link>
  );
}
