"use server";

import { requireUser } from "@/lib/auth";
import type { FormState } from "@/lib/types";

export async function createTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (subject.length < 3 || subject.length > 120) return { error: "Enter a short subject (3 to 120 characters)." };
  if (message.length < 10 || message.length > 2000) return { error: "Describe the problem in 10 to 2000 characters." };

  const { error } = await supabase.from("tickets").insert({ user_id: user.id, subject, message });
  if (error) return { error: "Could not send your ticket. Please try again." };
  return { ok: "Ticket sent. We will reply here." };
}
