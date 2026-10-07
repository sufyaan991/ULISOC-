"use client";
import { AlertTriangle, MailCheck, UserX } from "lucide-react";

export type Notice = { tone: "error" | "info"; text: string; code?: string };

// Builds a notice from a failed API response, keeping its error code (e.g. "not_member").
export function errorNotice(data: { error?: string; code?: string }, fallback: string): Notice {
  return { tone: "error", text: data.error ?? fallback, code: data.code };
}

export function MemberNotice({ notice, email }: { notice: Notice; email: string }) {
  if (notice.code === "not_member") {
    return (
      <div className="member-notice not-member" role="alert">
        <span className="notice-icon"><UserX aria-hidden="true" /></span>
        <div>
          <strong className="notice-title">Not on the member list</strong>
          <p>
            We couldn&apos;t find <b>{email}</b> on the ULISOC member list. Check the spelling, or try the email you used when you bought your membership.
          </p>
          <a className="notice-action" href="/contact">Contact the committee →</a>
        </div>
        <style>{styles}</style>
      </div>
    );
  }
  const error = notice.tone === "error";
  return (
    <div className={`member-notice ${error ? "error" : "info"}`} role={error ? "alert" : "status"}>
      <span className="notice-icon">{error ? <AlertTriangle aria-hidden="true" /> : <MailCheck aria-hidden="true" />}</span>
      <p>{notice.text}</p>
      <style>{styles}</style>
    </div>
  );
}

const styles = `.member-notice{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start;margin-top:18px;padding:16px 18px;border:1px solid;border-left-width:4px;text-align:left;animation:notice-in .22s ease-out}
.member-notice p{margin:0;font-size:14px;line-height:1.55;color:#e9e1dc;text-transform:none;letter-spacing:normal;font-weight:500}
.member-notice b{color:#fff;word-break:break-all}
.notice-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center}
.notice-icon svg{width:18px;height:18px}
.notice-title{display:block;margin:2px 0 6px;font-size:16px;color:#fff}
.notice-action{display:inline-block;margin-top:12px;font-size:13px;font-weight:900;text-transform:uppercase;color:#fff;border-bottom:2px solid #c52028;padding-bottom:3px}
.notice-action:hover,.notice-action:focus-visible{color:#ff8a90}
.member-notice.not-member,.member-notice.error{background:#1d0f10;border-color:#5a2226;border-left-color:#c52028}
.not-member .notice-icon,.error .notice-icon{background:rgba(197,32,40,.18);color:#ff6b72}
.member-notice.info{background:#1d1710;border-color:#4a3d22;border-left-color:#d6b777}
.info .notice-icon{background:rgba(214,183,119,.16);color:#d6b777}
@keyframes notice-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.member-notice{animation:none}}`;
