import { hasEditorSession } from "@/lib/jummah-auth";
import { AdminHeader } from "@/components/admin-header";
import { JummahLogin } from "../jummah/login";
import { DiscountSettings } from "./settings";

export const dynamic = "force-dynamic";
export default async function DiscountAdminPage() {
  if (!await hasEditorSession()) return <JummahLogin/>;
  return <main className="admin-shell"><AdminHeader backHref="/admin" backLabel="Committee portal" switchHref="/admin/jummah" switchLabel="Jumu&apos;ah editor"/><DiscountSettings/></main>;
}
