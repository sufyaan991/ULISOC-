import { getCurrentJummah } from "@/lib/jummah";

export const dynamic="force-dynamic";

export async function GET(){
  try{return Response.json({schedule:await getCurrentJummah()})}
  catch{return Response.json({schedule:null},{status:200})}
}
