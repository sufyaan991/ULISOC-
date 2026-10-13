import { database } from "@/db/sql";
import { currentMember } from "@/lib/members";
import { decryptSecret, encryptSecret, hashEmail } from "@/lib/member-discounts";
import { createGoogleWalletLink, formatMemberName, validMemberName, walletObjectIdentity } from "@/lib/google-wallet";
import { currentMembershipPeriod } from "@/lib/membership-lifecycle";
import { jsonNoStore, rejectOversizedRequest, requireSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

// Returns the member's existing pass, or { needsName: true } until a name is supplied.
export async function POST(request:Request) {
  const rejected=requireSameOrigin(request);if(rejected)return rejected;
  const oversized=rejectOversizedRequest(request,8192);if(oversized)return oversized;
  const member=await currentMember();
  if(!member)return jsonNoStore({error:"Sign in with your member email first."},{status:401});
  const body = await request.json().catch(()=>({})) as { name?:string };
  const period=currentMembershipPeriod();
  const emailHash=await hashEmail(member.email);
  let pass=await database.prepare("SELECT object_id,encrypted_name,name_iv FROM wallet_membership_passes WHERE email_hash=? AND status='ACTIVE' AND expires_at>?").bind(emailHash,Date.now()).first<{object_id:string;encrypted_name:string;name_iv:string}>();
  const identity=await walletObjectIdentity(emailHash);
  if(!pass){
    if(!body.name)return jsonNoStore({ok:true,needsName:true});
    const name=formatMemberName(String(body.name));
    if(!validMemberName(name)) return jsonNoStore({error:"Enter your full name using letters, spaces, apostrophes or hyphens."},{status:400});
    const encrypted=await encryptSecret(name);
    await database.prepare("INSERT INTO wallet_membership_passes (email_hash,member_email,object_id,membership_id,encrypted_name,name_iv,academic_year,expires_at,status) VALUES (?,?,?,?,?,?,?,?,'ACTIVE') ON CONFLICT(email_hash) DO UPDATE SET member_email=excluded.member_email,object_id=excluded.object_id,membership_id=excluded.membership_id,encrypted_name=excluded.encrypted_name,name_iv=excluded.name_iv,academic_year=excluded.academic_year,expires_at=excluded.expires_at,status='ACTIVE'").bind(emailHash,member.email,identity.objectId,identity.membershipId,encrypted.encryptedValue,encrypted.iv,period.academicYear,period.expiresAt).run();
    pass=await database.prepare("SELECT object_id,encrypted_name,name_iv FROM wallet_membership_passes WHERE email_hash=?").bind(emailHash).first<{object_id:string;encrypted_name:string;name_iv:string}>();
  }
  if(!pass) return jsonNoStore({error:"We couldn't create the membership pass."},{status:500});
  try {
    const memberName=await decryptSecret(pass.encrypted_name,pass.name_iv);
    // Always use the current issuer's object ID, so changing GOOGLE_WALLET_ISSUER_ID doesn't break stored passes.
    const walletUrl=await createGoogleWalletLink(identity.objectId,identity.membershipId,memberName,period.academicYear,period.expiresAt);
    await database.prepare("UPDATE wallet_membership_passes SET member_email=?,object_id=?,membership_id=?,academic_year=?,expires_at=?,status='ACTIVE' WHERE email_hash=?").bind(member.email,identity.objectId,identity.membershipId,period.academicYear,period.expiresAt,emailHash).run();
    return jsonNoStore({ok:true,walletUrl,memberName,membershipId:identity.membershipId});
  } catch(error) {
    console.error("Google Wallet pass creation failed",error);
    return jsonNoStore({error:"Google Wallet is temporarily unavailable."},{status:503});
  }
}
