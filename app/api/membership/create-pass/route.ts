import { env } from "cloudflare:workers";
import { decryptSecret, encryptSecret } from "@/lib/member-discounts";
import { createGoogleWalletLink, formatMemberName, validMemberName, walletObjectIdentity } from "@/lib/google-wallet";
import { currentMembershipPeriod } from "@/lib/membership-lifecycle";
import { jsonNoStore, rejectOversizedRequest } from "@/lib/security";

export const dynamic = "force-dynamic";
export async function POST(request:Request) {
  const oversized=rejectOversizedRequest(request,8192);if(oversized)return oversized;
  const body = await request.json().catch(()=>({})) as { challengeId?:string; name?:string };
  const id=String(body.challengeId??"");
  if(!/^[0-9a-f-]{36}$/.test(id)) return jsonNoStore({error:"Verify your member email first."},{status:400});
  const challenge=await env.DB.prepare("SELECT email_hash,expires_at,used FROM otp_challenges WHERE id=?").bind(id).first<{email_hash:string;expires_at:number;used:number}>();
  if(!challenge||!challenge.used||challenge.expires_at<Date.now()) return jsonNoStore({error:"Your verification has expired. Start again."},{status:400});
  const period=currentMembershipPeriod();
  const currentMember=await env.DB.prepare("SELECT 1 AS ok FROM member_email_hashes WHERE email_hash=? AND academic_year=? AND expires_at>?").bind(challenge.email_hash,period.academicYear,Date.now()).first();
  if(!currentMember)return jsonNoStore({error:"Your membership is no longer active."},{status:403});
  let pass=await env.DB.prepare("SELECT object_id,encrypted_name,name_iv FROM wallet_membership_passes WHERE email_hash=? AND status='ACTIVE' AND expires_at>?").bind(challenge.email_hash,Date.now()).first<{object_id:string;encrypted_name:string;name_iv:string}>();
  const identity=await walletObjectIdentity(challenge.email_hash);
  if(!pass){
    const name=formatMemberName(String(body.name??""));
    if(!validMemberName(name)) return jsonNoStore({error:"Enter your full name using letters, spaces, apostrophes or hyphens."},{status:400});
    const encrypted=await encryptSecret(name);
    await env.DB.prepare("INSERT INTO wallet_membership_passes (email_hash,object_id,membership_id,encrypted_name,name_iv,academic_year,expires_at,status) VALUES (?,?,?,?,?,?,?,'ACTIVE') ON CONFLICT(email_hash) DO UPDATE SET object_id=excluded.object_id,membership_id=excluded.membership_id,encrypted_name=excluded.encrypted_name,name_iv=excluded.name_iv,academic_year=excluded.academic_year,expires_at=excluded.expires_at,status='ACTIVE'").bind(challenge.email_hash,identity.objectId,identity.membershipId,encrypted.encryptedValue,encrypted.iv,period.academicYear,period.expiresAt).run();
    pass=await env.DB.prepare("SELECT object_id,encrypted_name,name_iv FROM wallet_membership_passes WHERE email_hash=?").bind(challenge.email_hash).first<{object_id:string;encrypted_name:string;name_iv:string}>();
  }
  if(!pass) return jsonNoStore({error:"We couldn't create the membership pass."},{status:500});
  try {
    const memberName=await decryptSecret(pass.encrypted_name,pass.name_iv);
    const walletUrl=await createGoogleWalletLink(pass.object_id,identity.membershipId,memberName,period.academicYear,period.expiresAt);
    await env.DB.prepare("UPDATE wallet_membership_passes SET membership_id=?,academic_year=?,expires_at=?,status='ACTIVE' WHERE email_hash=?").bind(identity.membershipId,period.academicYear,period.expiresAt,challenge.email_hash).run();
    return jsonNoStore({ok:true,walletUrl,memberName,membershipId:identity.membershipId});
  } catch(error) {
    console.error("Google Wallet pass creation failed",error);
    return jsonNoStore({error:"Google Wallet is temporarily unavailable."},{status:503});
  }
}
