import { currentMember } from "@/lib/members";
import { jsonNoStore } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const member = await currentMember();
  return jsonNoStore(member ? { member: true, email: member.email } : { member: false });
}
