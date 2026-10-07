import {SiteFrame} from "@/components/site-frame";
import {PrayerDashboard} from "@/components/prayer-dashboard";
import {getCurrentJummah} from "@/lib/jummah";
import {currentLondonMonth,getPrayerTimetable} from "@/lib/prayer-times";
export const dynamic="force-dynamic";
export default async function Home(){let jummah=null;try{jummah=await getCurrentJummah()}catch{}const {year,month}=currentLondonMonth();const timetable=await getPrayerTimetable(year,month).catch(()=>null);return <SiteFrame active="prayer"><PrayerDashboard jummah={jummah} timetable={timetable}/></SiteFrame>}
