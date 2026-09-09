import {SiteFrame} from "@/components/site-frame";

const contacts=[
  {number:"01",title:"WHATSAPP",body:"Request the current ULISOC community chat link.",label:"Request chat link ↗",href:"mailto:su-islamic@le.ac.uk?subject=Request%20for%20ULISOC%20WhatsApp%20link"},
  {number:"02",title:"INSTAGRAM",body:"Follow our events, reminders and latest announcements.",label:"@ulisoc ↗",href:"https://www.instagram.com/ulisoc/"},
  {number:"03",title:"EMAIL",body:"Questions, collaborations or anything you need help with.",label:"su-islamic@le.ac.uk ↗",href:"mailto:su-islamic@le.ac.uk"},
];

export default function Contact(){return <SiteFrame active="contact"><div className="wrap contact-page">
  <p className="eyebrow">Chat · Social · Email</p>
  <h1 className="display page-title">GET IN<br/><span className="red">TOUCH</span></h1>
  <section className="contact-options" aria-label="Contact ULISOC">
    {contacts.map((contact)=><a key={contact.title} className="contact-option" href={contact.href} target={contact.href.startsWith("http")?"_blank":undefined} rel={contact.href.startsWith("http")?"noopener noreferrer":undefined}>
      <span className="contact-number">{contact.number}</span>
      <div><h2 className="display">{contact.title}</h2><p>{contact.body}</p></div>
      <strong>{contact.label}</strong>
    </a>)}
  </section>
  <style>{`.contact-page{min-height:calc(100vh - 250px)}.contact-options{border-top:1px solid var(--border);margin-bottom:72px}.contact-option{display:grid;grid-template-columns:70px minmax(240px,1fr) auto;align-items:center;gap:28px;min-height:150px;padding:26px 30px;border-bottom:1px solid var(--border);color:#f5f0ed;transition:background .2s ease,padding .2s ease}.contact-option:hover{background:#140c0d;padding-left:38px}.contact-number{align-self:start;color:#c52028;font-size:12px;font-weight:800;letter-spacing:.12em}.contact-option h2{font-size:clamp(42px,5vw,66px);line-height:.9;margin:0 0 12px}.contact-option p{color:#9f9793;line-height:1.55;margin:0;max-width:520px}.contact-option strong{color:#c52028;font-size:12px;letter-spacing:.08em;text-transform:uppercase;text-align:right}@media(max-width:700px){.contact-option{grid-template-columns:42px 1fr;gap:18px;padding:25px 0}.contact-option:hover{padding-left:8px}.contact-option strong{grid-column:2;text-align:left}.contact-option h2{font-size:44px}}`}</style>
</div></SiteFrame>}
