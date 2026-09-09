import { AdminHeader } from "@/components/admin-header";
import { hasEditorSession } from "@/lib/jummah-auth";
import { JummahLogin } from "../jummah/login";
import { getCurrentJummah } from "@/lib/jummah";

export const dynamic = "force-dynamic";

export default async function PosterGeneratorPage() {
  if (!await hasEditorSession()) return <JummahLogin />;
  const schedule=await getCurrentJummah();

  return <main className="admin-shell">
    <AdminHeader backHref="/admin" backLabel="Committee portal" switchHref="/admin/jummah" switchLabel="Jumu’ah editor" />
    <section className="poster-placeholder">
      <p className="eyebrow">Committee tool</p>
      <h1 className="display">POSTER<br /><span>GENERATOR</span></h1>
      <div className="poster-placeholder-card">
        <strong>{schedule?"POSTER READY":"NOT READY"}</strong>
        <p>{schedule?"This poster uses the currently published Jumu‘ah information. The WhatsApp worker captures the same 1080 × 1350 design.":"Publish the upcoming Friday in the Jumu‘ah editor first."}</p>
        {schedule&&<><div className="poster-preview"><iframe title="Current Jumu‘ah poster" src={`/automation/poster?date=${encodeURIComponent(schedule.fridayDate)}`}/></div><a href={`/automation/poster?date=${encodeURIComponent(schedule.fridayDate)}`} target="_blank" rel="noreferrer">Open full-size poster ↗</a></>}
      </div>
    </section>
  </main>;
}
