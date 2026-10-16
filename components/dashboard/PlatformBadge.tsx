const map: [string, string, string][] = [
  ["Instagram", "IG", "#e1306c"],
  ["TikTok", "TT", "#25f4ee"],
  ["YouTube", "YT", "#ff4d4d"],
  ["Facebook", "FB", "#4c8dff"],
  ["X (Twitter)", "X", "#ffffff"],
  ["Telegram", "TG", "#37aee2"],
];

// Small coloured tile that shows which platform an order is for.
export function PlatformBadge({ name }: { name: string }) {
  const m = map.find(([p]) => name.startsWith(p));
  const [, label, color] = m ?? ["", name.slice(0, 2).toUpperCase(), "#8a8aa3"];
  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold"
      style={{ backgroundColor: `${color}22`, color }}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
