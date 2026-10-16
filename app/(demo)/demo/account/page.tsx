import { card, inputCls, btnPrimary } from "@/lib/ui";

export default function DemoAccount() {
  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Account</h1>
      <section className={`${card} space-y-4 p-6`}>
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-xl font-bold">D</span>
          <div>
            <p className="font-semibold">Demo user</p>
            <p className="text-sm text-muted">demo@growvia.com</p>
          </div>
        </div>
      </section>
      <section className={`${card} p-6`}>
        <h2 className="mb-4 font-semibold">Change password</h2>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">New password</span>
          <input type="password" disabled placeholder="••••••••" className={`${inputCls} opacity-60`} />
        </label>
        <button disabled className={`${btnPrimary} mt-4`}>Update password</button>
        <p className="mt-3 text-xs text-muted">Disabled in the demo.</p>
      </section>
    </div>
  );
}
