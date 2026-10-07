import { findMember } from "@/lib/members";
import { isEmail, normalizeEmail } from "@/lib/member-discounts";
import { jsonNoStore, rejectOversizedRequest, requireSameOrigin } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
const genericMessage = "If that email is on the member list, a code is on its way. Check your inbox and junk folder — it may take a minute to arrive.";

// Codes are only sent to emails on the member list, but the response is the same
// either way so the endpoint cannot be used to find out who is a member.
export async function POST(request: Request) {
  const rejected = requireSameOrigin(request); if (rejected) return rejected;
  const oversized = rejectOversizedRequest(request, 4096); if (oversized) return oversized;
  const body = await request.json().catch(() => ({})) as { email?: string };
  const email = normalizeEmail(String(body.email ?? ""));
  if (!isEmail(email)) return jsonNoStore({ error: "Enter a valid email address." }, { status: 400 });
  const [member] = await Promise.all([findMember(email), new Promise(resolve => setTimeout(resolve, 150))]);
  if (member) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) console.error("Supabase sign-in code failed", error.status, error.code);
  }
  return jsonNoStore({ ok: true, message: genericMessage });
}
