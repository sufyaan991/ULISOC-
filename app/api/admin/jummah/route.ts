import { getJummahHistory, saveJummah, type JummahVenue } from "@/lib/jummah";
import { hasEditorSession } from "@/lib/jummah-auth";
import { jsonNoStore, rejectOversizedRequest, requireSameOrigin } from "@/lib/security";

export const dynamic="force-dynamic";
const time=/^([01]\d|2[0-3]):[0-5]\d$/;

export async function GET(){
  if(!await hasEditorSession())return jsonNoStore({error:"Not authorised"},{status:403});
  return jsonNoStore({schedules:await getJummahHistory()});
}

export async function POST(request:Request){
  const rejected=requireSameOrigin(request);if(rejected)return rejected;
  const oversized=rejectOversizedRequest(request,32768);if(oversized)return oversized;
  if(!await hasEditorSession())return jsonNoStore({error:"Not authorised"},{status:403});
  const body=await request.json() as Record<string,unknown>;
  const required=["firstAdhan","firstKhutbah","firstSalah","secondAdhan","secondKhutbah","secondSalah"] as const;
  const fridayDate=String(body.fridayDate??"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(fridayDate)||new Date(`${fridayDate}T12:00:00Z`).getUTCDay()!==5)return jsonNoStore({error:"Choose a Friday date."},{status:400});
  const venue=body.venue as JummahVenue;if(!["sports-hall","studio-013","no-campus"].includes(venue))return jsonNoStore({error:"Choose a venue."},{status:400});
  if(venue!=="no-campus"&&!required.every(key=>time.test(String(body[key]??""))))return jsonNoStore({error:"Check the prayer times."},{status:400});
  const firstTalk=String(body.firstTalk??"").trim();if(venue!=="no-campus"&&firstTalk&&!time.test(firstTalk))return jsonNoStore({error:"Check the talk time."},{status:400});
  const schedule=await saveJummah({fridayDate:String(body.fridayDate),venue,firstAdhan:String(body.firstAdhan),firstTalk:firstTalk||null,firstKhutbah:String(body.firstKhutbah),firstSalah:String(body.firstSalah),secondAdhan:String(body.secondAdhan),secondKhutbah:String(body.secondKhutbah),secondSalah:String(body.secondSalah),announcement:String(body.announcement??"").trim(),published:true,updatedBy:"Committee editor"});
  return jsonNoStore({schedule});
}
