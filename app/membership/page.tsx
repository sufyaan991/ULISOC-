import { databaseFeaturesEnabled } from "@/lib/features";
import { ServiceUnavailable } from "@/components/service-unavailable";
import { SiteFrame } from "@/components/site-frame";
import { WalletGenerator } from "./wallet-generator";

export default function MembershipPage(){return <SiteFrame active="discounts">{databaseFeaturesEnabled ? <WalletGenerator/> : <ServiceUnavailable title="Digital membership temporarily unavailable"/>}</SiteFrame>}
