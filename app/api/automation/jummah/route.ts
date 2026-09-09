import { getAutomationPayload, hasAutomationAccess } from "@/lib/jummah-automation";
import { jsonNoStore } from "@/lib/security";

export const dynamic="force-dynamic";

export async function GET(request:Request){
  if(!await hasAutomationAccess(request.headers))return jsonNoStore({error:"Not authorised"},{status:401,headers:{"www-authenticate":"Bearer"}});
  try{return jsonNoStore(await getAutomationPayload())}
  catch(error){console.error("Jumu'ah automation feed failed",error);return jsonNoStore({error:"Automation data is temporarily unavailable."},{status:503})}
}
