import { env } from "cloudflare:workers";

const encoder = new TextEncoder();
const runtime = () => env as unknown as Record<string, string | undefined>;

export const noStoreHeaders = { "cache-control": "no-store, private, max-age=0", pragma: "no-cache" } as const;

export function jsonNoStore(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  for (const [key, value] of Object.entries(noStoreHeaders)) headers.set(key, value);
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function runtimeSecret(name: "AUTH_SESSION_SECRET" | "MEMBERSHIP_HMAC_SECRET" | "DATA_ENCRYPTION_SECRET" | "ULISOC_AUTOMATION_SECRET") {
  const value = runtime()[name];
  if (!value || value.length < 32) throw new Error(`${name} is not configured securely.`);
  return value;
}

export async function hmacBytes(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export function bytesToBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
}

export function secureBytesEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index++) result |= a[index] ^ b[index];
  return result === 0;
}

export function requestIp(request: Request) {
  return (request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

export function requireSameOrigin(request: Request) {
  return isSameOrigin(request) ? null : jsonNoStore({ error: "Request origin was not accepted." }, { status: 403 });
}

export function rejectOversizedRequest(request:Request,maxBytes:number){
  const length=Number(request.headers.get("content-length")??0);
  return Number.isFinite(length)&&length>maxBytes?jsonNoStore({error:"Request is too large."},{status:413}):null;
}
