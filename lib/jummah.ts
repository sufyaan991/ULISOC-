import { and, asc, desc, eq, gte } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { jummahSchedules } from "@/db/schema";

export type JummahVenue = "sports-hall" | "studio-013" | "no-campus";
export type JummahSchedule = typeof jummahSchedules.$inferSelect;

export const venues: Record<JummahVenue, {name:string; detail:string; sisters:string; maps:string}> = {
  "sports-hall": {
    name: "Charles Wilson Sports Hall",
    detail: "Charles Wilson Building, University Road",
    sisters: "Space is available for sisters at the back of the sports hall.",
    maps: "https://www.google.com/maps/search/?api=1&query=Charles+Wilson+Building+University+of+Leicester",
  },
  "studio-013": {
    name: "Percy Gee Building · Studio 0.13",
    detail: "Ground floor, SU Square (Atrium), behind Starbucks",
    sisters: "Sisters should use the Charles Wilson prayer room for Zuhr.",
    maps: "https://www.google.com/maps/search/?api=1&query=Percy+Gee+Building+University+of+Leicester",
  },
};

export function todayInLeicester(){
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/London",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
}

export async function getCurrentJummah(){
  const [row]=await getDb().select().from(jummahSchedules).where(and(gte(jummahSchedules.fridayDate,todayInLeicester()),eq(jummahSchedules.published,true))).orderBy(asc(jummahSchedules.fridayDate)).limit(1);
  return row??null;
}

export async function getJummahForFriday(fridayDate:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(fridayDate))return null;
  const [row]=await getDb().select().from(jummahSchedules).where(and(eq(jummahSchedules.fridayDate,fridayDate),eq(jummahSchedules.published,true))).limit(1);
  return row??null;
}

export async function getJummahHistory(){
  return getDb().select().from(jummahSchedules).orderBy(desc(jummahSchedules.fridayDate)).limit(12);
}

export function isJummahAdmin(email:string){
  const configured=((env as unknown as Record<string,string|undefined>).JUMMAH_ADMIN_EMAILS??"talhawan7232@gmail.com").split(",").map(value=>value.trim().toLowerCase()).filter(Boolean);
  return configured.includes(email.toLowerCase());
}

export async function saveJummah(input:Omit<typeof jummahSchedules.$inferInsert,"id"|"updatedAt">){
  const [row]=await getDb().insert(jummahSchedules).values(input).onConflictDoUpdate({target:jummahSchedules.fridayDate,set:{...input,updatedAt:new Date().toISOString()}}).returning();
  return row;
}
