import { database } from "@/db/sql";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// The committee maintains `members` (email, full_name) in the Supabase Table Editor.
// Emails are matched case-insensitively because they are typed in by hand.
export async function findMember(email: string) {
  return database.prepare("SELECT email, full_name FROM members WHERE lower(email) = lower(?) LIMIT 1").bind(email.trim()).first<{ email: string; full_name: string }>();
}

// The signed-in Supabase user, if their email is currently on the member list.
// The list is re-checked on every call, so removing a row revokes access immediately.
export async function currentMember() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email) return null;
  const member = await findMember(email);
  return member ? { email, fullName: member.full_name } : null;
}
