export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="font-medium">Coming in the next update</p>
        <p className="mt-1 text-sm text-muted">{text}</p>
      </div>
    </div>
  );
}
