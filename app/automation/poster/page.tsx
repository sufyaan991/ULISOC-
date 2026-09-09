import { headers } from "next/headers";
import { hasEditorSession } from "@/lib/jummah-auth";
import { hasAutomationAccess } from "@/lib/jummah-automation";
import { getJummahForFriday } from "@/lib/jummah";
import { JummahPoster } from "@/components/jummah-poster";

export const dynamic="force-dynamic";

export default async function AutomationPosterPage({searchParams}:{searchParams:Promise<{date?:string}>}){
  if(!await hasEditorSession()&&!await hasAutomationAccess(await headers()))return <PlainStatus message="Not authorised"/>;
  const {date=""}=await searchParams;
  const schedule=await getJummahForFriday(date);
  if(!schedule)return <PlainStatus message="No published Jumu‘ah poster exists for this Friday."/>;
  return <JummahPoster schedule={schedule}/>;
}

function PlainStatus({message}:{message:string}){return <main style={{width:1080,height:1350,display:"grid",placeItems:"center",background:"#090808",color:"#fff",font:"700 34px Arial",textAlign:"center",padding:80}}>{message}</main>}
