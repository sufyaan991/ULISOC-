import { env } from "cloudflare:workers";
import { getJummahForFriday, venues, type JummahSchedule, type JummahVenue } from "@/lib/jummah";
import { runtimeSecret, secureBytesEqual } from "@/lib/security";

const encoder=new TextEncoder();

export function upcomingFridayInLeicester(now=new Date()){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/London",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short"}).formatToParts(now);
  const value=(type:string)=>parts.find(part=>part.type===type)?.value??"";
  const date=`${value("year")}-${value("month")}-${value("day")}`;
  const weekday=value("weekday");
  const days={Sun:5,Mon:4,Tue:3,Wed:2,Thu:1,Fri:0,Sat:6}[weekday]??0;
  const noon=new Date(`${date}T12:00:00Z`);
  noon.setUTCDate(noon.getUTCDate()+days);
  return noon.toISOString().slice(0,10);
}

export function formatFriday(fridayDate:string){
  return new Intl.DateTimeFormat("en-GB",{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(`${fridayDate}T12:00:00Z`));
}

export function jummahCaption(schedule:JummahSchedule){
  if(schedule.venue==="no-campus")return `Assalāmu ‘Alaykum\n\nThere is no on-campus Jumu‘ah on ${formatFriday(schedule.fridayDate)}.${schedule.announcement?`\n\n${schedule.announcement}`:""}\n\nJazākumullāhu Khayrā\nJumu‘ah & Facilities Team\nUniversity of Leicester Islamic Society`;
  const venue=venues[schedule.venue as Exclude<JummahVenue,"no-campus">];
  const firstTalk=schedule.firstTalk?`\n– Talk: ${schedule.firstTalk}`:"";
  return `Assalāmu ‘Alaykum\n\nJUMU‘AH ARRANGEMENTS\n${formatFriday(schedule.fridayDate)}\n\nVENUE: ${venue.name}\n${venue.detail}\n\n1ST JUMU‘AH\n– First adhān: ${schedule.firstAdhan}${firstTalk}\n– Khuṭbah (approx): ${schedule.firstKhutbah}\n– Ṣalāh (approx): ${schedule.firstSalah}\n\n2ND JUMU‘AH\n– First adhān: ${schedule.secondAdhan}\n– Khuṭbah (approx): ${schedule.secondKhutbah}\n– Ṣalāh (approx): ${schedule.secondSalah}\n\n${venue.sisters}${schedule.announcement?`\n\n${schedule.announcement}`:""}\n\nJazākumullāhu Khayrā\nJumu‘ah & Facilities Team\nUniversity of Leicester Islamic Society`;
}

async function digest(value:string){return new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(value)))}

export async function hasAutomationAccess(headers:Headers){
  const supplied=headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9_-]{32,})$/)?.[1]??"";
  if(!supplied)return false;
  try{return secureBytesEqual(await digest(supplied),await digest(runtimeSecret("ULISOC_AUTOMATION_SECRET")))}catch{return false}
}

export async function getAutomationPayload(now=new Date()){
  const date=upcomingFridayInLeicester(now);
  const schedule=await getJummahForFriday(date);
  if(!schedule)return {date,sendable:false as const,reason:"No published Jumu‘ah configuration exists for the upcoming Friday."};
  if(schedule.venue==="no-campus")return {date,sendable:false as const,reason:"No on-campus Jumu‘ah",caption:jummahCaption(schedule)};
  const venue=venues[schedule.venue as Exclude<JummahVenue,"no-campus">];
  return {
    date,
    sendable:true as const,
    venue:{key:schedule.venue,name:venue.name,detail:venue.detail,sistersInfo:venue.sisters},
    times:{first:{adhan:schedule.firstAdhan,talk:schedule.firstTalk,khutbah:schedule.firstKhutbah,salah:schedule.firstSalah},second:{adhan:schedule.secondAdhan,khutbah:schedule.secondKhutbah,salah:schedule.secondSalah}},
    announcement:schedule.announcement,
    caption:jummahCaption(schedule),
    posterPath:`/automation/poster?date=${encodeURIComponent(date)}`,
    updatedAt:schedule.updatedAt,
  };
}
