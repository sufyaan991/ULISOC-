import { env, waitUntil } from "cloudflare:workers";
import { getDiscountSecret, hashEmail, hashIp, hashOtp, isEmail, legacyHashEmail, normalizeEmail } from "@/lib/member-discounts";
import { currentMembershipPeriod, membershipIsActive, purgeExpiredMembershipData } from "@/lib/membership-lifecycle";
import { jsonNoStore, rejectOversizedRequest, requestIp } from "@/lib/security";

export const dynamic = "force-dynamic";
const genericMessage = "Code sent. Check your inbox and junk folder — it may take a minute to arrive.";

export async function POST(request: Request) {
  const oversized=rejectOversizedRequest(request,4096);if(oversized)return oversized;
  await purgeExpiredMembershipData();
  const body = await request.json().catch(() => ({})) as { email?: string };
  const email = normalizeEmail(String(body.email ?? ""));
  if (!isEmail(email)) return jsonNoStore({ error: "Enter a valid email address." }, { status: 400 });
  const id = crypto.randomUUID();
  const emailHash = await hashEmail(email);
  const ipHash = await hashIp(requestIp(request));
  const now = Date.now();
  await env.DB.prepare("DELETE FROM otp_challenges WHERE expires_at < ? OR created_at < ?").bind(now, now - 86400000).run();
  let member = await env.DB.prepare("SELECT academic_year,expires_at FROM member_email_hashes WHERE email_hash = ?").bind(emailHash).first<{academic_year:string;expires_at:number}>();
  if(!member){const legacyHash=await legacyHashEmail(email);if(legacyHash){member=await env.DB.prepare("SELECT academic_year,expires_at FROM member_email_hashes WHERE email_hash=?").bind(legacyHash).first<{academic_year:string;expires_at:number}>();if(member&&legacyHash!==emailHash){await env.DB.batch([env.DB.prepare("UPDATE member_email_hashes SET email_hash=? WHERE email_hash=?").bind(emailHash,legacyHash),env.DB.prepare("UPDATE wallet_membership_passes SET email_hash=? WHERE email_hash=?").bind(emailHash,legacyHash)])}}}
  const recentEmail = await env.DB.prepare("SELECT COUNT(*) AS count FROM otp_challenges WHERE email_hash = ? AND created_at > ?").bind(emailHash, now - 3600000).first<{count:number}>();
  const recentIp = await env.DB.prepare("SELECT COUNT(*) AS count FROM otp_challenges WHERE ip_hash = ? AND created_at > ?").bind(ipHash, now - 3600000).first<{count:number}>();
  const period=currentMembershipPeriod();
  const eligible=Boolean(member)&&member?.academic_year===period.academicYear&&membershipIsActive(member?.expires_at??0)&&Number(recentEmail?.count??0)<5&&Number(recentIp?.count??0)<20;
  const [apiKey]=await Promise.all([getDiscountSecret("brevo_api_key"),new Promise(resolve=>setTimeout(resolve,120))]);
  if (!apiKey) return jsonNoStore({ error: "Member verification is temporarily unavailable." }, { status: 503 });
  if (!eligible) return jsonNoStore({ ok: true, challengeId: id, message: genericMessage });
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
  await env.DB.prepare("INSERT INTO otp_challenges (id,email_hash,ip_hash,code_hash,expires_at,attempts,used,created_at) VALUES (?,?,?,?,?,0,0,?)").bind(id, emailHash, ipHash, await hashOtp(id, code), now + 600000, now).run();
  waitUntil((async()=>{
    try{
      const response = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "accept": "application/json", "content-type": "application/json", "api-key": apiKey }, body: JSON.stringify({ sender: { name: "ULISOC Membership", email: "membership@ulisoc.uk" }, to: [{ email }], subject: `${code} is your ULISOC verification code`, htmlContent: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#111"><p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#777">University of Leicester Islamic Society</p><h1 style="font-size:32px;margin:24px 0 8px">Your verification code</h1><p style="font-size:44px;font-weight:800;letter-spacing:.18em;margin:20px 0;color:#b10008">${code}</p><p>This code expires in 10 minutes. If you didn’t request it, you can ignore this email.</p></div>` }) });
      if(!response.ok){console.error("Brevo verification email failed",response.status);await env.DB.prepare("DELETE FROM otp_challenges WHERE id=?").bind(id).run()}
    }catch(error){console.error("Brevo verification request failed",error);await env.DB.prepare("DELETE FROM otp_challenges WHERE id=?").bind(id).run()}
  })());
  return jsonNoStore({ ok: true, challengeId: id, message: genericMessage });
}
