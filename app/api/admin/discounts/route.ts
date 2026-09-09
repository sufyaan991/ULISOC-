import { env } from "cloudflare:workers";
import { hasEditorSession } from "@/lib/jummah-auth";
import { expireGoogleWalletObject } from "@/lib/google-wallet";
import { currentMembershipPeriod, purgeExpiredMembershipData } from "@/lib/membership-lifecycle";
import { decryptMemberEmail, decryptSecret, encryptMemberEmail, encryptSecret, hashEmail, isEmail, normalizeEmail } from "@/lib/member-discounts";
import { jsonNoStore, rejectOversizedRequest, requireSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

async function migrateLegacyCrypto(){
  const db=env.DB;
  const complete=await db.prepare("SELECT 1 AS ok FROM discount_secrets WHERE key='crypto_migration_v2'").first();
  if(complete)return;
  const statements:D1PreparedStatement[]=[];
  const secrets=await db.prepare("SELECT key,encrypted_value,iv FROM discount_secrets").all<{key:string;encrypted_value:string;iv:string}>();
  for(const row of secrets.results){const value=await decryptSecret(row.encrypted_value,row.iv);const encrypted=await encryptSecret(value);statements.push(db.prepare("UPDATE discount_secrets SET encrypted_value=?,iv=?,updated_at=CURRENT_TIMESTAMP WHERE key=?").bind(encrypted.encryptedValue,encrypted.iv,row.key))}
  const members=await db.prepare("SELECT email_hash,encrypted_email,email_iv FROM member_email_hashes WHERE encrypted_email IS NOT NULL AND email_iv IS NOT NULL").all<{email_hash:string;encrypted_email:string;email_iv:string}>();
  for(const row of members.results){const email=await decryptMemberEmail(row.encrypted_email,row.email_iv);const newHash=await hashEmail(email);const encrypted=await encryptMemberEmail(email);if(newHash===row.email_hash){statements.push(db.prepare("UPDATE member_email_hashes SET encrypted_email=?,email_iv=? WHERE email_hash=?").bind(encrypted.encryptedValue,encrypted.iv,row.email_hash))}else{statements.push(db.prepare("INSERT INTO member_email_hashes (email_hash,encrypted_email,email_iv) VALUES (?,?,?) ON CONFLICT(email_hash) DO UPDATE SET encrypted_email=excluded.encrypted_email,email_iv=excluded.email_iv").bind(newHash,encrypted.encryptedValue,encrypted.iv),db.prepare("UPDATE wallet_membership_passes SET email_hash=? WHERE email_hash=?").bind(newHash,row.email_hash),db.prepare("DELETE FROM member_email_hashes WHERE email_hash=?").bind(row.email_hash))}}
  const passes=await db.prepare("SELECT object_id,encrypted_name,name_iv FROM wallet_membership_passes").all<{object_id:string;encrypted_name:string;name_iv:string}>();
  for(const pass of passes.results){if(!pass.encrypted_name||!pass.name_iv)continue;const name=await decryptSecret(pass.encrypted_name,pass.name_iv);const encrypted=await encryptSecret(name);statements.push(db.prepare("UPDATE wallet_membership_passes SET encrypted_name=?,name_iv=? WHERE object_id=?").bind(encrypted.encryptedValue,encrypted.iv,pass.object_id))}
  const marker=await encryptSecret("complete");statements.push(db.prepare("INSERT INTO discount_secrets (key,encrypted_value,iv,updated_at) VALUES ('crypto_migration_v2',?,?,CURRENT_TIMESTAMP)").bind(marker.encryptedValue,marker.iv));
  if(statements.length)await db.batch(statements);
}

async function status(){
  const db=env.DB;
  await migrateLegacyCrypto();
  await purgeExpiredMembershipData();
  const period=currentMembershipPeriod();
  const count=await db.prepare("SELECT COUNT(*) AS count FROM member_email_hashes").first<{count:number}>();
  const configured=await db.prepare("SELECT key FROM discount_secrets WHERE key IN ('brevo_api_key','podur_code','calis_code','wallet_service_account')").all<{key:string}>();
  const stored=await db.prepare("SELECT encrypted_email,email_iv FROM member_email_hashes ORDER BY added_at,email_hash").all<{encrypted_email:string|null;email_iv:string|null}>();
  const memberEmails:string[]=[];let legacyMemberCount=0;
  for(const row of stored.results){if(!row.encrypted_email||!row.email_iv){legacyMemberCount++;continue}try{memberEmails.push(await decryptMemberEmail(row.encrypted_email,row.email_iv))}catch{legacyMemberCount++}}
  memberEmails.sort((a,b)=>a.localeCompare(b));
  const passCount=await db.prepare("SELECT COUNT(*) AS count FROM wallet_membership_passes WHERE status='ACTIVE' AND expires_at>?").bind(Date.now()).first<{count:number}>();
  const has=(key:string)=>configured.results.some(row=>row.key===key);
  return {memberCount:Number(count?.count??0),memberEmails,legacyMemberCount,passCount:Number(passCount?.count??0),academicYear:period.academicYear,expiresAt:period.expiresAt,brevoConfigured:has("brevo_api_key"),podurConfigured:has("podur_code"),calisConfigured:has("calis_code"),walletConfigured:has("wallet_service_account")};
}

export async function GET(){
  if(!await hasEditorSession())return jsonNoStore({error:"Not authorised"},{status:403});
  return jsonNoStore(await status());
}

export async function POST(request:Request){
  const rejected=requireSameOrigin(request);if(rejected)return rejected;
  const oversized=rejectOversizedRequest(request,524288);if(oversized)return oversized;
  if(!await hasEditorSession())return jsonNoStore({error:"Not authorised"},{status:403});
  const body=await request.json().catch(()=>({})) as {brevoApiKey?:string;podurCode?:string;calisCode?:string;memberEmails?:string;walletServiceAccount?:string;confirmMemberRemoval?:boolean};
  const db=env.DB;const statements:D1PreparedStatement[]=[];
  const saveSecret=async(key:string,value?:string)=>{if(value?.trim()){const encrypted=await encryptSecret(value.trim());statements.push(db.prepare("INSERT INTO discount_secrets (key,encrypted_value,iv,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET encrypted_value=excluded.encrypted_value,iv=excluded.iv,updated_at=CURRENT_TIMESTAMP").bind(key,encrypted.encryptedValue,encrypted.iv))}};
  await saveSecret("brevo_api_key",body.brevoApiKey);
  await saveSecret("podur_code",body.podurCode);
  await saveSecret("calis_code",body.calisCode);
  if(body.walletServiceAccount?.trim()){
    let account:{type?:string;client_email?:string;private_key?:string};
    try{account=JSON.parse(body.walletServiceAccount)}catch{return jsonNoStore({error:"The Google service-account JSON is not valid JSON."},{status:400})}
    if(account.type!=="service_account"||!account.client_email?.endsWith(".iam.gserviceaccount.com")||!account.private_key?.includes("BEGIN PRIVATE KEY"))return jsonNoStore({error:"That file does not look like a Google service-account key."},{status:400});
    await saveSecret("wallet_service_account",JSON.stringify(account));
  }
  if(typeof body.memberEmails==="string"){
    const period=currentMembershipPeriod();
    const emails=[...new Set(body.memberEmails.split(/[\s,;]+/).map(normalizeEmail).filter(Boolean))];
    if(emails.some(email=>!isEmail(email)))return jsonNoStore({error:"One or more member emails is invalid."},{status:400});
    if(emails.length>3000)return jsonNoStore({error:"Please upload no more than 3,000 emails at once."},{status:400});
    const hashes=await Promise.all(emails.map(hashEmail));const next=new Set(hashes);
    const current=await db.prepare("SELECT email_hash FROM member_email_hashes").all<{email_hash:string}>();
    const removed=current.results.map(row=>row.email_hash).filter(hash=>!next.has(hash));
    const removedPasses: {email_hash:string;object_id:string}[]=[];
    for(const hash of removed){const pass=await db.prepare("SELECT email_hash,object_id FROM wallet_membership_passes WHERE email_hash=? AND status='ACTIVE'").bind(hash).first<{email_hash:string;object_id:string}>();if(pass)removedPasses.push(pass)}
    if(removed.length&&!body.confirmMemberRemoval)return jsonNoStore({confirmationRequired:true,removedMembers:removed.length,revokedPasses:removedPasses.length,message:`This will remove ${removed.length} member${removed.length===1?"":"s"} and revoke ${removedPasses.length} Wallet pass${removedPasses.length===1?"":"es"}.`},{status:409});
    for(const pass of removedPasses){try{await expireGoogleWalletObject(pass.object_id)}catch(error){console.error("Wallet revocation failed",error);return jsonNoStore({error:"A Wallet pass could not be revoked, so the member list was not changed. Please try again."},{status:503})}}
    statements.push(db.prepare("DELETE FROM member_email_hashes"));
    for(const hash of removed)statements.push(db.prepare("DELETE FROM wallet_membership_passes WHERE email_hash=?").bind(hash));
    for(let index=0;index<emails.length;index++){const encrypted=await encryptMemberEmail(emails[index]);statements.push(db.prepare("INSERT INTO member_email_hashes (email_hash,encrypted_email,email_iv,academic_year,expires_at) VALUES (?,?,?,?,?)").bind(hashes[index],encrypted.encryptedValue,encrypted.iv,period.academicYear,period.expiresAt))}
  }
  if(!statements.length)return jsonNoStore({error:"Add at least one setting to save."},{status:400});
  await db.batch(statements);
  return jsonNoStore(await status());
}
