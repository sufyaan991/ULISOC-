import { env } from "cloudflare:workers";
import { editorCookie, passwordMatches } from "@/lib/jummah-auth";
import { hashIp } from "@/lib/member-discounts";
import { jsonNoStore, rejectOversizedRequest, requestIp, requireSameOrigin } from "@/lib/security";

export const dynamic="force-dynamic";

export async function POST(request:Request){
  const rejected=requireSameOrigin(request);if(rejected)return rejected;
  const oversized=rejectOversizedRequest(request,4096);if(oversized)return oversized;
  const now=Date.now();
  const ipHash=await hashIp(requestIp(request));
  await env.DB.prepare("DELETE FROM admin_login_attempts WHERE attempted_at < ?").bind(now-86400000).run();
  const block=await env.DB.prepare("SELECT blocked_until,level FROM admin_login_blocks WHERE ip_hash=?").bind(ipHash).first<{blocked_until:number;level:number}>();
  if(block&&block.blocked_until>now){const seconds=Math.max(1,Math.ceil((block.blocked_until-now)/1000));return jsonNoStore({error:`Too many attempts. Try again in ${block.level>=2?"one hour":"15 minutes"}.`},{status:429,headers:{"retry-after":String(seconds)}})}
  const counts=await env.DB.prepare("SELECT SUM(CASE WHEN attempted_at > ? THEN 1 ELSE 0 END) AS recent, COUNT(*) AS hourly FROM admin_login_attempts WHERE ip_hash=? AND attempted_at>?").bind(now-600000,ipHash,now-3600000).first<{recent:number;hourly:number}>();
  const recent=Number(counts?.recent??0);const hourly=Number(counts?.hourly??0);
  if(hourly>=10)return jsonNoStore({error:"Too many attempts. Try again in one hour."},{status:429,headers:{"retry-after":"3600"}});
  if(recent>=3)return jsonNoStore({error:"Too many attempts. Try again in 15 minutes."},{status:429,headers:{"retry-after":"900"}});
  const body=await request.json().catch(()=>({})) as {password?:string};
  if(!await passwordMatches(body.password??"")){
    await env.DB.prepare("INSERT INTO admin_login_attempts (ip_hash,attempted_at) VALUES (?,?)").bind(ipHash,now).run();
    const after=await env.DB.prepare("SELECT SUM(CASE WHEN attempted_at>? THEN 1 ELSE 0 END) AS recent,COUNT(*) AS hourly FROM admin_login_attempts WHERE ip_hash=? AND attempted_at>?").bind(now-600000,ipHash,now-3600000).first<{recent:number;hourly:number}>();
    if(Number(after?.recent??0)>=3){const level=Number(after?.hourly??0)>=10?2:1;const duration=level===2?3600000:900000;await env.DB.prepare("INSERT INTO admin_login_blocks (ip_hash,blocked_until,level) VALUES (?,?,?) ON CONFLICT(ip_hash) DO UPDATE SET blocked_until=excluded.blocked_until,level=excluded.level").bind(ipHash,now+duration,level).run()}
    return jsonNoStore({error:"Incorrect committee password."},{status:401});
  }
  await env.DB.batch([env.DB.prepare("DELETE FROM admin_login_attempts WHERE ip_hash=?").bind(ipHash),env.DB.prepare("DELETE FROM admin_login_blocks WHERE ip_hash=?").bind(ipHash)]);
  return jsonNoStore({ok:true},{headers:{"set-cookie":await editorCookie()}});
}
