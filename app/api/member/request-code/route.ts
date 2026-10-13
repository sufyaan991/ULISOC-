import { findMember } from "@/lib/members";
import { isEmail, normalizeEmail } from "@/lib/member-discounts";
import { jsonNoStore, rejectOversizedRequest, requireSameOrigin } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rejected = requireSameOrigin(request); if (rejected) return rejected;
  const oversized = rejectOversizedRequest(request, 4096); if (oversized) return oversized;
  const body = await request.json().catch(() => ({})) as { email?: string };
  const email = normalizeEmail(String(body.email ?? ""));
  if (!isEmail(email)) return jsonNoStore({ error: "Enter a valid email address." }, { status: 400 });
  if (!await findMember(email)) {
    return jsonNoStore({ code: "not_member", error: "That email isn't on the ULISOC member list. Check you used the email you joined with, or contact the committee." }, { status: 404 });
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) {
    console.error("Supabase sign-in code failed", error.status, error.code, error.message);
    if (error.status === 429) return jsonNoStore({ error: "Please wait a minute before requesting another code." }, { status: 429 });
    return jsonNoStore({ error: "We couldn't send your code right now. Please try again in a few minutes or contact the committee." }, { status: 503 });
  }
  return jsonNoStore({ ok: true, message: "Code sent. Check your inbox and junk folder — it may take a minute to arrive." });
}
