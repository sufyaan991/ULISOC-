type AdminHeaderProps = {
  backHref: string;
  backLabel: string;
  switchHref: string;
  switchLabel: string;
};

export function AdminHeader({ backHref, backLabel, switchHref, switchLabel }: AdminHeaderProps) {
  return <header className="admin-top">
    <a className="admin-back-link" href={backHref}>← {backLabel}</a>
    <nav className="admin-nav" aria-label="Committee tools">
      <a className="admin-nav-link" href={switchHref}>{switchLabel}</a>
      <form className="admin-logout-form" action="/api/admin/logout" method="post">
        <button className="admin-logout-button" type="submit">Log out</button>
      </form>
    </nav>
  </header>;
}
