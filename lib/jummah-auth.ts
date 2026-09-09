import { cookies } from "next/headers";
import { env } from "cloudflare:workers";
import { base64UrlToBytes, bytesToBase64Url, hmacBytes, runtimeSecret, secureBytesEqual } from "@/lib/security";

const COOKIE="ulisoc_jummah_editor";
const encoder=new TextEncoder();
const runtime=()=>env as unknown as Record<string,string|undefined>;
const SESSION_SECONDS=12*60*60;

async function digest(value:string){return new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(value)))}
function equal(a:Uint8Array,b:Uint8Array){if(a.length!==b.length)return false;let result=0;for(let i=0;i<a.length;i++)result|=a[i]^b[i];return result===0}
type SessionPayload={v:1;nonce:string;iat:number;exp:number};
async function sessionToken(){
  const now=Math.floor(Date.now()/1000);
  const payload:SessionPayload={v:1,nonce:crypto.randomUUID(),iat:now,exp:now+SESSION_SECONDS};
  const encoded=bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature=bytesToBase64Url(await hmacBytes(runtimeSecret("AUTH_SESSION_SECRET"),encoded));
  return `${encoded}.${signature}`;
}

export async function passwordMatches(candidate:string){const password=runtime().JUMMAH_EDITOR_PASSWORD;if(!password)return false;return equal(await digest(candidate),await digest(password))}
export async function hasEditorSession(){
  const value=(await cookies()).get(COOKIE)?.value;
  if(!value)return false;
  const [encoded,signature,...extra]=value.split(".");
  if(!encoded||!signature||extra.length)return false;
  try{
    const expected=await hmacBytes(runtimeSecret("AUTH_SESSION_SECRET"),encoded);
    if(!secureBytesEqual(base64UrlToBytes(signature),expected))return false;
    const payload=JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded))) as Partial<SessionPayload>;
    const now=Math.floor(Date.now()/1000);
    return payload.v===1&&typeof payload.nonce==="string"&&payload.nonce.length>=32&&typeof payload.iat==="number"&&typeof payload.exp==="number"&&payload.iat<=now+60&&payload.exp>now&&payload.exp-payload.iat===SESSION_SECONDS;
  }catch{return false}
}
export async function editorCookie(){return `${COOKIE}=${await sessionToken()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`}
export function clearEditorCookie(){return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`}
