// Original illustrations for the home page. No stock photos and no platform logos.

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function StepIcon({ name }: { name: "user" | "wallet" | "link" | "chart" }) {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
      <rect x="1" y="1" width="46" height="46" rx="14" className="fill-primary/15 stroke-primary/40" strokeWidth="1" />
      <g {...stroke} className="text-primary" transform="translate(12 12)">
        {name === "user" && (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>)}
        {name === "wallet" && (<><path d="M3 7a2 2 0 0 1 2-2h13v4" /><rect x="3" y="7" width="18" height="13" rx="2.5" /><circle cx="16.5" cy="13.5" r="1.2" fill="currentColor" /></>)}
        {name === "link" && (<><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" /></>)}
        {name === "chart" && (<><path d="M3 20h18" /><path d="M5 16l5-5 3 3 6-7" /><path d="M15 7h4v4" /></>)}
      </g>
    </svg>
  );
}

export function FeatureIcon({ name }: { name: string }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...stroke}>
        {name === "screen" && (<><rect x="3" y="4" width="18" height="13" rx="2.5" /><path d="M8 21h8M12 17v4" /></>)}
        {name === "naira" && (<><path d="M7 4v16M17 4v16M7 5l10 14" /><path d="M4 10h16M4 14h16" /></>)}
        {name === "track" && (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>)}
        {name === "refill" && (<><path d="M20 12a8 8 0 0 1-14 5.3" /><path d="M4 12a8 8 0 0 1 14-5.3" /><path d="M18 3v4h-4M6 21v-4h4" /></>)}
        {name === "api" && (<><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" /></>)}
        {name === "support" && (<><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /><path d="M20 19c0 1.5-2 2.5-5 2.5" /></>)}
      </svg>
    </span>
  );
}

const tiles: Record<string, [string, string]> = {
  Instagram: ["IG", "#e1306c"],
  TikTok: ["TT", "#25f4ee"],
  YouTube: ["YT", "#ff4d4d"],
  Facebook: ["FB", "#4c8dff"],
  "X (Twitter)": ["X", "#8a8aa3"],
  Telegram: ["TG", "#37aee2"],
};

export function PlatformTile({ name }: { name: string }) {
  const [label, color] = tiles[name] ?? [name.slice(0, 2).toUpperCase(), "#8a8aa3"];
  return (
    <span className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 py-2 pl-2 pr-4">
      <span className="grid h-8 w-8 place-items-center rounded-lg text-[11px] font-bold" style={{ backgroundColor: `${color}26`, color }}>
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{name}</span>
    </span>
  );
}

// Floating "result" cards that sit around the dashboard preview in the hero.
export function FloatingChips() {
  return (
    <>
      <div className="float-a absolute -top-6 left-6 hidden items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 shadow-xl shadow-black/20 sm:flex">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-black">
          <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke} strokeWidth={2.4}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </span>
        <span className="text-xs leading-tight"><b className="block text-sm">+1,200</b><span className="text-muted">followers</span></span>
      </div>
      <div className="float-b absolute -bottom-6 right-6 hidden items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 shadow-xl shadow-black/20 sm:flex">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke} strokeWidth={2.4}><path d="M5 12l5 5 9-10" /></svg>
        </span>
        <span className="text-xs leading-tight"><b className="block text-sm">Order complete</b><span className="text-muted">TikTok views</span></span>
      </div>
    </>
  );
}

// A decorative rising line chart. It is an illustration, not real data.
export function GrowthIllustration() {
  return (
    <svg viewBox="0 0 520 260" className="h-auto w-full" role="img" aria-label="Illustration of a rising growth chart">
      <defs>
        <linearGradient id="gv-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6c3bff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#6c3bff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[50, 100, 150, 200].map((y) => <line key={y} x1="20" x2="500" y1={y} y2={y} stroke="currentColor" className="text-border" strokeDasharray="4 6" />)}
      <path d="M20 215 C80 205 110 190 160 170 S250 150 290 120 S390 80 430 60 S480 34 500 22 V240 H20Z" fill="url(#gv-fill)" />
      <path d="M20 215 C80 205 110 190 160 170 S250 150 290 120 S390 80 430 60 S480 34 500 22" fill="none" stroke="#6c3bff" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 225 C90 222 130 214 180 200 S260 185 310 160 S400 125 440 110 S485 92 500 84" fill="none" stroke="#b6ff3b" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" />
      <circle cx="500" cy="22" r="8" fill="#b6ff3b" />
      <circle cx="500" cy="22" r="16" fill="#b6ff3b" opacity="0.25" />
    </svg>
  );
}
