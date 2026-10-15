import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authConfigured } from "@/lib/supabase/env";

// Request-time helper: use inside a <Suspense> boundary.
export async function requireUser() {
  if (!authConfigured) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// Only users with profiles.is_admin = true get past this.
export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) redirect("/dashboard");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/dashboard");
  return { user, admin: createAdminClient() };
}
