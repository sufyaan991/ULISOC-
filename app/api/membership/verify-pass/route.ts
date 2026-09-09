import { env } from "cloudflare:workers";
import { verifyMembershipQrToken } from "@/lib/google-wallet";
import { jsonNoStore } from "@/lib/security";

export const dynamic="force-dynamic";

export async function GET(request:Request){
  const token=new URL(request.url).searchParams.get("token")??"";
  const verified=await verifyMembershipQrToken(token);
  if(!verified)return jsonNoStore({valid:false,message:"This ULISOC membership has expired or is invalid."},{status:400});
  const pass=await env.DB.prepare("SELECT p.status,p.expires_at,m.email_hash AS member FROM wallet_membership_passes p LEFT JOIN member_email_hashes m ON m.email_hash=p.email_hash WHERE p.membership_id=? AND p.status='ACTIVE' AND p.expires_at>? LIMIT 1").bind(verified.id,Date.now()).first<{status:string;expires_at:number;member:string|null}>();
  if(!pass?.member)return jsonNoStore({valid:false,message:"This ULISOC membership is no longer active."},{status:404});
  return jsonNoStore({valid:true,membershipId:verified.id,academicYear:verified.year,expires:new Date(verified.exp).toLocaleDateString("en-GB",{timeZone:"Europe/London",day:"numeric",month:"long",year:"numeric"})});
}
