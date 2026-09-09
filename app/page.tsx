import {SiteFrame} from "@/components/site-frame";
import {PrayerDashboard} from "@/components/prayer-dashboard";
import {getCurrentJummah} from "@/lib/jummah";
export const dynamic="force-dynamic";
export default async function Home(){let jummah=null;try{jummah=await getCurrentJummah()}catch{}return <SiteFrame active="prayer"><PrayerDashboard jummah={jummah}/></SiteFrame>}
