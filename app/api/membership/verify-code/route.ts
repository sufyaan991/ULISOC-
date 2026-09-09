import { env } from "cloudflare:workers";
import { hashOtp, secureEqual } from "@/lib/member-discounts";
import { jsonNoStore, rejectOversizedRequest } from "@/lib/security";

export const dynamic = "force-dynamic";
export async function POST(request:Request) {
  const oversized=rejectOversizedRequest(request,4096);if(oversized)return oversized;
  const body = await request.json().catch(()=>({})) as { challengeId?:string; code?:string };
  const id = String(body.challengeId??""); const code = String(body.code??"");
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^\d{6}$/.test(code)) return jsonNoStore({error:"Check the six-digit code."},{status:400});
  const row = await env.DB.prepare("SELECT email_hash,code_hash,expires_at,attempts,used FROM otp_challenges WHERE id = ?").bind(id).first<{email_hash:string;code_hash:string;expires_at:number;attempts:number;used:number}>();
  if (!row || row.used || row.expires_at<Date.now() || row.attempts>=5) return jsonNoStore({error:"That code has expired. Request a new one."},{status:400});
  if (!secureEqual(row.code_hash,await hashOtp(id,code))) { await env.DB.prepare("UPDATE otp_challenges SET attempts=attempts+1 WHERE id=?").bind(id).run(); return jsonNoStore({error:"That code isn't right. Try again."},{status:400}); }
  await env.DB.prepare("UPDATE otp_challenges SET used=1 WHERE id=?").bind(id).run();
  const existing = await env.DB.prepare("SELECT 1 AS ok FROM wallet_membership_passes WHERE email_hash=? AND status='ACTIVE' AND expires_at>?").bind(row.email_hash,Date.now()).first();
  return jsonNoStore({ok:true,hasPass:Boolean(existing)});
}
