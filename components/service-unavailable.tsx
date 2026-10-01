import Link from "next/link";

export function ServiceUnavailable({ title = "Temporarily unavailable" }: { title?: string }) {
  return <section className="wrap" style={{ paddingBlock: 80, maxWidth: 760 }}>
    <p className="eyebrow">ULISOC</p>
    <h1 className="display" style={{ fontSize: "clamp(36px, 7vw, 64px)", marginBlock: 20 }}>{title}</h1>
    <p style={{ color: "#aaa", lineHeight: 1.7 }}>We’re updating this service. Please check back soon or contact the committee for help.</p>
    <p style={{ marginTop: 24 }}><Link href="/contact">Contact the committee →</Link></p>
    <p style={{ marginTop: 16 }}><Link href="/">← Back to the website</Link></p>
  </section>;
}
