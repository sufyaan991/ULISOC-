import { findMember } from "@/lib/members";
import { isEmail, normalizeEmail } from "@/lib/member-discounts";
import { jsonNoStore, rejectOversizedRequest, requireSameOrigin } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rejected = requireSameOrigin(request); if (rejected) return rejected;
  const oversized = rejectOversizedRequest(request, 4096); if (oversized) return oversized;
  const body = await request.json().catch(() => ({})) as { email?: string; code?: string };
  const email = normalizeEmail(String(body.email ?? ""));
  const code = String(body.code ?? "");
  if (!isEmail(email) || !/^\d{6,10}$/.test(code)) return jsonNoStore({ error: "Check the code from your email." }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  if (error) {
    console.error("Supabase code verification failed", error.status, error.code, error.message);
    return jsonNoStore({ error: "That code isn't right or has expired. Try again or request a new one." }, { status: 400 });
  }
  const member = await findMember(email);
  if (!member) {
    await supabase.auth.signOut();
    return jsonNoStore({ error: "That email isn't on the current member list. Please contact the committee." }, { status: 403 });
  }
  return jsonNoStore({ ok: true, email });
}
