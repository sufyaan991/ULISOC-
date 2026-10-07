import { database, type SqlStatement } from "@/db/sql";
import { hasEditorSession } from "@/lib/jummah-auth";
import { currentMembershipPeriod, purgeExpiredMembershipData } from "@/lib/membership-lifecycle";
import { encryptSecret } from "@/lib/member-discounts";
import { jsonNoStore, rejectOversizedRequest, requireSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

// The member list itself is managed in the Supabase Table Editor (`members` table).
async function status(){
  const db=database;
  await purgeExpiredMembershipData();
  const period=currentMembershipPeriod();
  const count=await db.prepare("SELECT COUNT(*) AS count FROM members").first<{count:number}>();
  const configured=await db.prepare("SELECT key FROM discount_secrets WHERE key IN ('podur_code','calis_code','wallet_service_account')").all<{key:string}>();
  const passCount=await db.prepare("SELECT COUNT(*) AS count FROM wallet_membership_passes WHERE status='ACTIVE' AND expires_at>?").bind(Date.now()).first<{count:number}>();
  const has=(key:string)=>configured.results.some(row=>row.key===key);
  return {memberCount:Number(count?.count??0),passCount:Number(passCount?.count??0),academicYear:period.academicYear,expiresAt:period.expiresAt,podurConfigured:has("podur_code"),calisConfigured:has("calis_code"),walletConfigured:has("wallet_service_account")};
}

export async function GET(){
  if(!await hasEditorSession())return jsonNoStore({error:"Not authorised"},{status:403});
  return jsonNoStore(await status());
}

export async function POST(request:Request){
  const rejected=requireSameOrigin(request);if(rejected)return rejected;
  const oversized=rejectOversizedRequest(request,524288);if(oversized)return oversized;
  if(!await hasEditorSession())return jsonNoStore({error:"Not authorised"},{status:403});
  const body=await request.json().catch(()=>({})) as {podurCode?:string;calisCode?:string;walletServiceAccount?:string};
  const db=database;const statements:SqlStatement[]=[];
  const saveSecret=async(key:string,value?:string)=>{if(value?.trim()){const encrypted=await encryptSecret(value.trim());statements.push(db.prepare("INSERT INTO discount_secrets (key,encrypted_value,iv,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET encrypted_value=excluded.encrypted_value,iv=excluded.iv,updated_at=CURRENT_TIMESTAMP").bind(key,encrypted.encryptedValue,encrypted.iv))}};
  await saveSecret("podur_code",body.podurCode);
  await saveSecret("calis_code",body.calisCode);
  if(body.walletServiceAccount?.trim()){
    let account:{type?:string;client_email?:string;private_key?:string};
    try{account=JSON.parse(body.walletServiceAccount)}catch{return jsonNoStore({error:"The Google service-account JSON is not valid JSON."},{status:400})}
    if(account.type!=="service_account"||!account.client_email?.endsWith(".iam.gserviceaccount.com")||!account.private_key?.includes("BEGIN PRIVATE KEY"))return jsonNoStore({error:"That file does not look like a Google service-account key."},{status:400});
    await saveSecret("wallet_service_account",JSON.stringify(account));
  }
  if(!statements.length)return jsonNoStore({error:"Add at least one setting to save."},{status:400});
  await db.batch(statements);
  return jsonNoStore(await status());
}
