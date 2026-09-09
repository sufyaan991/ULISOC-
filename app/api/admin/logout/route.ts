import { clearEditorCookie } from "@/lib/jummah-auth";
import { requireSameOrigin } from "@/lib/security";
export async function POST(request:Request){const rejected=requireSameOrigin(request);if(rejected)return rejected;return new Response(null,{status:303,headers:{location:new URL("/",request.url).toString(),"set-cookie":clearEditorCookie(),"cache-control":"no-store"}})}
