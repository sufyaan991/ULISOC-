import { env } from "cloudflare:workers";

export type MembershipPeriod={academicYear:string;expiresAt:number};

export function currentMembershipPeriod(now=Date.now()):MembershipPeriod{
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",year:"numeric",month:"numeric"}).formatToParts(new Date(now));
  const year=Number(parts.find(part=>part.type==="year")?.value);
  const month=Number(parts.find(part=>part.type==="month")?.value);
  const startYear=month>=8?year:year-1;
  const endYear=startYear+1;
  return {academicYear:`${startYear}/${String(endYear).slice(-2)}`,expiresAt:Date.UTC(endYear,6,31,23,0,0,0)};
}

export function membershipIsActive(expiresAt:number,now=Date.now()){return expiresAt>now}
export function walletExpiryIso(expiresAt:number){return new Date(expiresAt).toISOString()}

export async function purgeExpiredMembershipData(now=Date.now()){
  await env.DB.batch([
    env.DB.prepare("DELETE FROM otp_challenges WHERE expires_at<=?").bind(now),
    env.DB.prepare("DELETE FROM member_email_hashes WHERE expires_at<=?").bind(now),
    env.DB.prepare("DELETE FROM wallet_membership_passes WHERE expires_at<=?").bind(now),
  ]);
}
