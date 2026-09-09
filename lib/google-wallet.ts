import { getDiscountSecret } from "@/lib/member-discounts";
import { walletExpiryIso } from "@/lib/membership-lifecycle";
import { base64UrlToBytes, bytesToBase64Url, hmacBytes, runtimeSecret, secureBytesEqual } from "@/lib/security";

const ISSUER_ID = "3388000000023195368";
const CLASS_ID = `${ISSUER_ID}.ulisoc_membership_2026_27`;
const WALLET_ASSET_ORIGIN = "https://ulisoc.uk";

type ServiceAccount = { client_email:string; private_key:string };

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function jsonPart(value: unknown) { return base64Url(new TextEncoder().encode(JSON.stringify(value))); }
function pemBytes(pem: string) {
  const raw = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  return Uint8Array.from(atob(raw), char => char.charCodeAt(0));
}
async function signJwt(account: ServiceAccount, payload: Record<string, unknown>) {
  const header = jsonPart({ alg:"RS256", typ:"JWT" });
  const body = jsonPart(payload);
  const unsigned = `${header}.${body}`;
  const key = await crypto.subtle.importKey("pkcs8", pemBytes(account.private_key), { name:"RSASSA-PKCS1-v1_5", hash:"SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${base64Url(new Uint8Array(signature))}`;
}

async function getWalletAccessToken(account: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const assertion = await signJwt(account, {
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/wallet_object.issuer",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !data.access_token) throw new Error(data.error_description || "Google Wallet authentication failed.");
  return data.access_token;
}

async function updateExistingWalletObject(account: ServiceAccount, objectId: string, genericObject: Record<string, unknown>) {
  const accessToken = await getWalletAccessToken(account);
  const response = await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${encodeURIComponent(objectId)}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify(genericObject),
  });
  // A first-time member has no object to patch yet; Google's save link below creates it.
  if (response.status === 404) return;
  if (!response.ok) {
    console.error("Google Wallet object update failed", response.status, (await response.text()).slice(0,240));
    throw new Error("Google Wallet is temporarily unavailable.");
  }
}

export async function expireGoogleWalletObject(objectId:string){
  const raw=await getDiscountSecret("wallet_service_account");
  if(!raw)throw new Error("Google Wallet is temporarily unavailable.");
  const account=JSON.parse(raw) as ServiceAccount;
  await updateExistingWalletObject(account,objectId,{state:"EXPIRED"});
}

export function formatMemberName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-GB").replace(/(^|[\s'-])\p{L}/gu, match => match.toLocaleUpperCase("en-GB"));
}
export function validMemberName(value: string) {
  return value.length >= 2 && value.length <= 80 && /^[\p{L}\p{M}][\p{L}\p{M}\s'-]*$/u.test(value);
}
export async function walletObjectIdentity(emailHash: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(emailHash)));
  const hex = [...digest].map(byte=>byte.toString(16).padStart(2,"0")).join("");
  return { objectId:`${ISSUER_ID}.member_${hex.slice(0,24)}`, membershipId:`ULI-${hex.slice(0,16).toUpperCase()}` };
}
export async function createMembershipQrToken(membershipId:string,academicYear:string,expiresAt:number){
  const payload=bytesToBase64Url(new TextEncoder().encode(JSON.stringify({v:1,id:membershipId,year:academicYear,exp:expiresAt})));
  const signature=bytesToBase64Url(await hmacBytes(runtimeSecret("MEMBERSHIP_HMAC_SECRET"),`wallet:${payload}`));
  return `${payload}.${signature}`;
}
export async function verifyMembershipQrToken(token:string){
  const [payload,signature,...extra]=token.split(".");if(!payload||!signature||extra.length)return null;
  try{
    const expected=await hmacBytes(runtimeSecret("MEMBERSHIP_HMAC_SECRET"),`wallet:${payload}`);
    if(!secureBytesEqual(base64UrlToBytes(signature),expected))return null;
    const value=JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as {v?:number;id?:string;year?:string;exp?:number};
    if(value.v!==1||typeof value.id!=="string"||typeof value.year!=="string"||typeof value.exp!=="number"||value.exp<=Date.now())return null;
    return value;
  }catch{return null}
}
export async function createGoogleWalletLink(objectId:string,membershipId:string,memberName:string,academicYear:string,expiresAt:number) {
  const raw = await getDiscountSecret("wallet_service_account");
  if (!raw) throw new Error("Google Wallet is not configured yet.");
  const account = JSON.parse(raw) as ServiceAccount;
  if (!account.client_email || !account.private_key) throw new Error("The Google Wallet credential is invalid.");
  const qrToken=await createMembershipQrToken(membershipId,academicYear,expiresAt);
  const genericObject = {
    id: objectId,
    classId: CLASS_ID,
    state: "ACTIVE",
    hexBackgroundColor: "#b10008",
    logo: { sourceUri:{ uri:`${WALLET_ASSET_ORIGIN}/assets/ulisoc-logo-red.png` }, contentDescription:{ defaultValue:{ language:"en-GB", value:"ULISOC emblem" } } },
    heroImage: { sourceUri:{ uri:`${WALLET_ASSET_ORIGIN}/assets/hero-banner.png` }, contentDescription:{ defaultValue:{ language:"en-GB", value:"ULISOC membership artwork" } } },
    cardTitle: { defaultValue:{ language:"en-GB", value:"University of Leicester Islamic Society" } },
    header: { defaultValue:{ language:"en-GB", value:memberName } },
    subheader: { defaultValue:{ language:"en-GB", value:"ULISOC Member" } },
    barcode: { type:"QR_CODE", value:`https://ulisoc.uk/api/membership/verify-pass?token=${encodeURIComponent(qrToken)}`, alternateText:membershipId },
    validTimeInterval:{start:{date:new Date().toISOString()},end:{date:walletExpiryIso(expiresAt)}},
    textModulesData: [
      { id:"academic_year", header:"ACADEMIC YEAR", body:academicYear },
      { id:"membership_id", header:"MEMBERSHIP ID", body:membershipId },
    ],
  };
  await updateExistingWalletObject(account, objectId, genericObject);
  const jwt = await signJwt(account, { iss:account.client_email, aud:"google", origins:["https://ulisoc.uk"], typ:"savetowallet", iat:Math.floor(Date.now()/1000), payload:{ genericObjects:[genericObject] } });
  return `https://pay.google.com/gp/v/save/${jwt}`;
}
