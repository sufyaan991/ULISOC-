import { hasEditorSession } from "@/lib/jummah-auth";
import { AdminHeader } from "@/components/admin-header";
import { JummahEditor } from "./jummah-editor";
import { JummahLogin } from "./login";

export const dynamic="force-dynamic";

export default async function JummahAdminPage(){
  if(!await hasEditorSession())return <JummahLogin/>;
  return <main className="admin-shell"><AdminHeader backHref="/admin" backLabel="Committee portal" switchHref="/admin/discounts" switchLabel="Member access"/><JummahEditor/></main>;
}
