import Link from "next/link";
import { hasEditorSession } from "@/lib/jummah-auth";
import { JummahLogin } from "./jummah/login";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

const tools = [
  {
    number: "01",
    title: "Member Access",
    description: "Manage the member list, verification access and digital membership setup.",
    href: "/admin/discounts",
    action: "Open member access",
  },
  {
    number: "02",
    title: "Jumu’ah Editor",
    description: "Set this Friday’s venue, prayer times and announcements.",
    href: "/admin/jummah",
    action: "Open Jumu’ah editor",
  },
  {
    number: "03",
    title: "Poster Generator",
    description: "Create the weekly ULISOC Jumu’ah announcement poster.",
    href: "/admin/posters",
    action: "Open poster generator",
  },
];

export default async function AdminPortalPage() {
  if (!await hasEditorSession()) return <JummahLogin />;

  return <main className="admin-shell">
    <AdminHeader backHref="/" backLabel="Back to website" switchHref="/admin/jummah" switchLabel="Jumu’ah editor" />
    <section className="portal-heading">
      <p className="eyebrow">Committee access</p>
      <h1 className="display">COMMITTEE<br /><span>PORTAL</span></h1>
      <p>Choose what you want to manage.</p>
    </section>
    <section className="portal-grid" aria-label="Committee tools">
      {tools.map((tool) => <Link className="portal-card" href={tool.href} key={tool.href}>
        <span className="portal-number">{tool.number}</span>
        <div>
          <h2 className="display">{tool.title}</h2>
          <p>{tool.description}</p>
        </div>
        <strong>{tool.action} <span aria-hidden="true">↗</span></strong>
      </Link>)}
    </section>
  </main>;
}
