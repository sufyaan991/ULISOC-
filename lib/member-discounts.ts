import { env } from "cloudflare:workers";
import { hmacBytes, runtimeSecret } from "@/lib/security";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const runtime = () => env as unknown as Record<string, string | undefined>;

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}
function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}
async function hmac(value: string) {
  return bytesToBase64(await hmacBytes(runtimeSecret("MEMBERSHIP_HMAC_SECRET"), value));
}
async function encryptionKey() {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`ulisoc-data-v1:${runtimeSecret("DATA_ENCRYPTION_SECRET")}`));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function legacyHmac(value:string){
  // Transitional read-only compatibility for records created before key separation.
  const secret=runtime().JUMMAH_SESSION_SECRET;if(!secret)return null;
  return bytesToBase64(await hmacBytes(secret,value));
}
async function legacyEncryptionKey(){
  // Removed after the one-time crypto_migration_v2 marker is written.
  const secret=runtime().JUMMAH_SESSION_SECRET;if(!secret)return null;
  const digest=await crypto.subtle.digest("SHA-256",encoder.encode(`ulisoc-discounts:${secret}`));
  return crypto.subtle.importKey("raw",digest,"AES-GCM",false,["decrypt"]);
}

export function normalizeEmail(value: string) { return value.trim().toLowerCase(); }
export function isEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254; }
export async function hashEmail(value: string) { return hmac(`email:${normalizeEmail(value)}`); }
export async function legacyHashEmail(value:string){return legacyHmac(`email:${normalizeEmail(value)}`)}
export async function hashIp(value: string) { return hmac(`ip:${value || "unknown"}`); }
export async function hashOtp(id: string, code: string) { return hmac(`otp:${id}:${code}`); }

export async function encryptSecret(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(), encoder.encode(value));
  return { encryptedValue: bytesToBase64(new Uint8Array(encrypted)), iv: bytesToBase64(iv) };
}
export async function decryptSecret(encryptedValue: string, iv: string) {
  try{
    const clear=await crypto.subtle.decrypt({name:"AES-GCM",iv:base64ToBytes(iv)},await encryptionKey(),base64ToBytes(encryptedValue));
    return decoder.decode(clear);
  }catch(error){
    const legacy=await legacyEncryptionKey();if(!legacy)throw error;
    const clear=await crypto.subtle.decrypt({name:"AES-GCM",iv:base64ToBytes(iv)},legacy,base64ToBytes(encryptedValue));
    return decoder.decode(clear);
  }
}

export const encryptMemberEmail = encryptSecret;
export const decryptMemberEmail = decryptSecret;

export async function getDiscountSecret(key: "brevo_api_key" | "podur_code" | "calis_code" | "wallet_service_account") {
  const row = await env.DB.prepare("SELECT encrypted_value, iv FROM discount_secrets WHERE key = ?").bind(key).first<{encrypted_value:string;iv:string}>();
  if (!row) return null;
  return decryptSecret(row.encrypted_value, row.iv);
}

export function secureEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index++) result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return result === 0;
}
