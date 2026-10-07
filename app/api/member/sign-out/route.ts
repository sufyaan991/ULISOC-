import { jsonNoStore, requireSameOrigin } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rejected = requireSameOrigin(request); if (rejected) return rejected;
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return jsonNoStore({ ok: true });
}
