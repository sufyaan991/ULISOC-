import { databaseFeaturesEnabled } from "@/lib/features";
import { ServiceUnavailable } from "@/components/service-unavailable";
import { hasEditorSession } from "@/lib/jummah-auth";
import { AdminHeader } from "@/components/admin-header";
import { JummahLogin } from "../jummah/login";
import { DiscountSettings } from "./settings";

export const dynamic = "force-dynamic";
export default async function DiscountAdminPage() {
  if (!databaseFeaturesEnabled) return <ServiceUnavailable title="Committee tools temporarily unavailable" />;
  if (!await hasEditorSession()) return <JummahLogin/>;
  return <main className="admin-shell"><AdminHeader backHref="/admin" backLabel="Committee portal" switchHref="/admin/jummah" switchLabel="Jumu&apos;ah editor"/><DiscountSettings/></main>;
}
