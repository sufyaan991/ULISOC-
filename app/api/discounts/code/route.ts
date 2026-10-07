import { currentMember } from "@/lib/members";
import { getDiscountSecret } from "@/lib/member-discounts";
import { jsonNoStore, rejectOversizedRequest, requireSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rejected = requireSameOrigin(request); if (rejected) return rejected;
  const oversized = rejectOversizedRequest(request, 4096); if (oversized) return oversized;
  if (!await currentMember()) return jsonNoStore({ error: "Sign in with your member email first." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { partner?: string };
  const partner = body.partner === "calis" ? "calis" : "podur";
  const discountCode = await getDiscountSecret(partner === "calis" ? "calis_code" : "podur_code");
  if (!discountCode) return jsonNoStore({ error: `The ${partner === "calis" ? "Cali's" : "PODUR"} code is not available yet.` }, { status: 503 });
  return jsonNoStore({ ok: true, discountCode });
}
