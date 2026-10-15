import { requireUser } from "@/lib/auth";
import { card } from "@/lib/ui";
import { ChangePassword } from "@/components/dashboard/ChangePassword";

export default async function AccountPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Account</h1>
      <section className={`${card} space-y-3 p-6`}>
        <h2 className="font-semibold">Profile</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Name</dt><dd>{profile?.full_name || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Email</dt><dd>{user.email}</dd></div>
        </dl>
      </section>
      <section className={`${card} p-6`}>
        <h2 className="mb-4 font-semibold">Change password</h2>
        <ChangePassword />
      </section>
    </div>
  );
}
