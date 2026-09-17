"use client";

import {useEffect, useState} from "react";
import {SiteFrame} from "@/components/site-frame";
import {PodurVerification} from "./podur-verification";

const offers = [
  ["20% OFF", "Cali's Leicester", "Food", "Online only", "/calis.png", "155A Evington Rd, Leicester · LE2 1QJ"],
  ["15% OFF", "La Maison Cafe", "Food & drink", "ISoc members only", "/la-maison-cafe.png", "43 Abbey St, Leicester · LE1 3TE"],
  ["TBC", "Tribez Steak Grill", "Food", "", "/tribez-steak-grill.png", "60 London Rd, Leicester · LE2 0QD"],
  ["TBC", "Chai Green", "Food", "", "/chai-green.png", "130 Evington Rd, Leicester · LE2 1HL"],
  ["10% OFF", "Vivace", "Food", "", "/vivace.png", "99 Alum Rock Rd, Birmingham · B8 1ND"],
  ["15% OFF", "Mango Twist", "Food", "", "/mango-twist.png", "2A Cank St, Leicester · LE1 5GW"],
  ["10% OFF", "Karak Chai", "Food", "", "/karak-chai.png", "124C Green Ln Rd, Leicester · LE5 3TJ"],
  ["TBC", "Boo", "Food", "", "/boo.png", "138 London Rd, Leicester · LE2 1EB"],
  ["20% OFF", "Royal Oud", "Retail", "", "/royal-oud.png", "3 Clock Tower Mall, Leicester · LE1 3YA"],
  ["20% OFF", "Maki & Ramen", "Food", "", "/maki-and-ramen.png", "Unit R22, 12 Highcross Ln, Bath House Ln, Leicester · LE1 4SA"],
  ["20% OFF", "JusT", "Food", "", "/just.png", "117 Narborough Rd, Leicester · LE3 0PA"],
  ["TBC", "Ma-Chaii", "Food", "", "/ma-chaii.png", "2 King St, Leicester · LE1 6RH"],
  ["10% OFF", "PODUR", "Online", "", "/podur.png", "Online only · podur.co.uk"],
];

const placeDetails = {
  0: {
    saving: "20% OFF",
    name: "Cali's Leicester",
    description: "Big burgers, loaded fries, crispy chicken, wings, wraps and shakes served from Cali's colourful Evington Road spot.",
    offer: "20% off online for verified ISoc members, available Monday–Thursday from 1 October 2026. There is no minimum spend and there are no exclusions. Confirm your listed member email to reveal the checkout code.",
    hours: <>Monday–Sunday<br/>12:00–01:00</>,
    address: <>155A Evington Rd, Leicester<br/>LE2 1QJ</>,
    directions: "https://www.google.com/maps/place/Calis+Leicester/@52.6255477,-1.1118625,17z/data=!3m1!4b1!4m6!3m5!1s0x487761efe4af6ddd:0xe02a25b43dbc96d5!8m2!3d52.6255477!4d-1.1092876!16s%2Fg%2F11ypgl24xn?entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D",
    website: "https://www.calis.uk/",
    websiteLabel: "Order online ↗",
  },
  1: {
    saving: "15% OFF",
    name: "La Maison Cafe",
    description: "A Leicester favourite for halal breakfast and brunch, known for generous plates, indulgent French toast and a relaxed city-centre atmosphere.",
    offer: "Full redemption details are being finalised. Check back before visiting.",
    hours: <>Sat–Thu · 10:00–17:00<br/>Friday · 14:00–17:00</>,
    address: <>43 Abbey St, Leicester<br/>LE1 3TE</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=43+Abbey+Street+Leicester+LE1+3TE",
    website: "https://www.lamaisoncafe.co.uk/leicester/",
    websiteLabel: "Visit website ↗",
  },
  2: {
    saving: "TBC",
    name: "Tribez Steak Grill",
    description: "A lively London Road steakhouse built for serious cravings, serving flame-grilled steaks and generous comfort-food plates in a relaxed setting.",
    offer: "The member discount and full redemption details are being finalised. Check back before visiting.",
    hours: <>Sun–Thu · 11:45–23:00<br/>Fri–Sat · 11:45–00:00</>,
    address: <>60 London Rd, Leicester<br/>LE2 0QD</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=Tribez+Steak+Grill+60+London+Road+Leicester+LE2+0QD",
    website: "https://www.instagram.com/tribezsteakgrill/",
    websiteLabel: "View Instagram ↗",
  },
  3: {
    saving: "TBC",
    name: "Chai Green",
    description: "A colourful South Asian street-food spot serving loaded breakfasts, warming karak chai, signature curry bowls and burgers made for proper comfort-food cravings.",
    offer: "The member discount and full redemption details are being finalised. Check back before visiting.",
    hours: <>Monday–Sunday<br/>09:00–23:00</>,
    address: <>130 Evington Rd, Leicester<br/>LE2 1HL</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=Chai+Green+130+Evington+Road+Leicester+LE2+1HL",
    website: "https://chaigreen1823.com/",
    websiteLabel: "Visit website ↗",
  },
  4: {
    saving: "10% OFF",
    name: "Vivace Cafe & Pizzeria",
    description: "An Italian-inspired halal café where stone-baked pizzas, fresh pasta, proper espresso and indulgent desserts meet a warm, lively atmosphere.",
    offer: "10% off for members. Full redemption details are being finalised, so check back before visiting.",
    hours: <>Monday–Sunday<br/>09:00–23:00</>,
    address: <>99 Alum Rock Rd, Birmingham<br/>B8 1ND</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=Vivace+Cafe+and+Pizzeria+99+Alum+Rock+Road+Birmingham+B8+1ND",
    website: "https://vivacecafeandpizzeria.co.uk/",
    websiteLabel: "Visit website ↗",
  },
  5: {
    saving: "15% OFF",
    name: "Mango Twist",
    description: "A bright little tropical escape bringing South American flavours to Leicester through fresh fruit, loaded açaí bowls, vibrant smoothies and wildly addictive spicy-sweet mango creations.",
    offer: "15% off for members. Full redemption details are being finalised, so check back before visiting.",
    hours: <>Mon–Thu · 11:00–21:00<br/>Fri–Sun · 11:00–23:00</>,
    address: <>2A Cank St, Leicester<br/>LE1 5GW</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=Mango+Twist+2A+Cank+Street+Leicester+LE1+5GW",
    website: "https://mangotwists.com/",
    websiteLabel: "Visit website ↗",
  },
  6: {
    saving: "10% OFF",
    name: "Karak Chaii",
    description: "A stylish home for proper South Asian comfort food, pairing richly brewed karak chaii with street-food favourites, loaded breakfasts and desserts worth staying for.",
    offer: "10% off for members. Full redemption details are being finalised, so check back before visiting.",
    hours: <>Monday–Sunday<br/>12:00–23:00</>,
    address: <>124C Green Ln Rd, Leicester<br/>LE5 3TJ</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=Karak+Chaii+124C+Green+Lane+Road+Leicester+LE5+3TJ",
    website: "https://karakchaii.co.uk/",
    websiteLabel: "Visit website ↗",
  },
  7: {
    saving: "TBC",
    name: "Boo",
    description: "One of Leicester’s home-grown burger heavyweights, serving crisp-edged handcrafted burgers, loaded fries and thick shakes with absolutely no interest in subtle cravings.",
    offer: "The member discount and full redemption details are still being confirmed. Check back before visiting.",
    hours: <>Monday–Sunday<br/>11:00–23:00</>,
    address: <>138 London Rd, Leicester<br/>LE2 1EB</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=Boo+Burger+138+London+Road+Leicester+LE2+1EB",
    website: "https://boo-burger.com/location/leicester/",
    websiteLabel: "Visit website ↗",
  },
  8: {
    saving: "20% OFF",
    name: "Royal Oud",
    description: "A city-centre fragrance destination packed with rich Arabian ouds, contemporary perfumes, oils and gift-worthy scents that smell considerably more expensive than they need to.",
    offer: "20% off for members. Full redemption details are being finalised, so check back before visiting.",
    hours: <>Mon–Sat · 09:00–18:00<br/>Sunday · 11:00–17:00</>,
    address: <>3 Clock Tower Mall, Leicester<br/>LE1 3YA</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=Royal+Oud+3+Clock+Tower+Mall+Leicester+LE1+3YA",
    website: "https://royaloudleicester.com/",
    websiteLabel: "Visit website ↗",
  },
  9: {
    saving: "20% OFF",
    name: "Maki & Ramen",
    description: "An award-winning Japanese spot bringing bold bowls of ramen, beautifully made sushi and comforting donburi to Highcross in a bright, modern setting.",
    offer: "20% off for members. Full redemption details are being finalised, so check back before visiting.",
    hours: <>Monday–Sunday<br/>12:00–22:00</>,
    address: <>Unit R22, 12 Highcross Ln, Leicester<br/>LE1 4SA</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=Maki+and+Ramen+Unit+R22+12+Highcross+Lane+Leicester+LE1+4SA",
    website: "https://www.makiramen.com/leicester-highcross/",
    websiteLabel: "Visit website ↗",
  },
  10: {
    saving: "20% OFF",
    name: "JusT",
    description: "A late-opening Leicester café built for every kind of craving, from fresh doughnuts and desserts to hot drinks and easy comfort-food favourites.",
    offer: "20% off for members. Full redemption details are being finalised, so check back before visiting.",
    hours: <>Monday–Sunday<br/>08:00–23:00</>,
    address: <>117 Narborough Rd, Leicester<br/>LE3 0PA</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=JusT+117+Narborough+Road+Leicester+LE3+0PA",
    website: "https://www.instagram.com/jus.t_leicester/",
    websiteLabel: "View Instagram ↗",
  },
  11: {
    saving: "TBC",
    name: "Ma-Chaii",
    description: "A beautifully considered matcha and chai bar serving precision-made drinks, playful flavour combinations and the kind of calm city-centre aesthetic that makes every cup camera-ready.",
    offer: "The member discount and full redemption details are still being confirmed. Check back before visiting.",
    hours: <>Monday–Sunday<br/>12:00–22:30</>,
    address: <>2 King St, Leicester<br/>LE1 6RH</>,
    directions: "https://www.google.com/maps/dir/?api=1&destination=Ma-Chaii+2+King+Street+Leicester+LE1+6RH",
    website: "https://www.instagram.com/drink.machaii/",
    websiteLabel: "View Instagram ↗",
  },
  12: {
    saving: "10% OFF",
    name: "PODUR Abaya",
    description: "An online abaya label pairing modest silhouettes with clean, contemporary detailing for polished everyday and occasion dressing.",
    offer: "10% off online for verified ISoc members. Confirm your listed member email to reveal the private checkout code.",
    hours: <>Online store<br/>Open 24 hours</>,
    address: <>Online only<br/>podur.co.uk</>,
    directions: "https://www.podur.co.uk/",
    website: "https://www.podur.co.uk/",
    websiteLabel: "Shop PODUR ↗",
  },
} as const;

type DetailIndex = keyof typeof placeDetails;

export default function Discounts() {
  const [activeDetail, setActiveDetail] = useState<DetailIndex | null>(null);
  const [detailClosing, setDetailClosing] = useState(false);
  const detail = activeDetail === null ? null : placeDetails[activeDetail];
  const closeDetail = () => {
    if (detailClosing) return;
    setDetailClosing(true);
    window.setTimeout(() => {
      setActiveDetail(null);
      setDetailClosing(false);
    }, 220);
  };

  useEffect(() => {
    if (activeDetail === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeDetail]);

  return (
    <SiteFrame active="discounts">
      <div className="wrap">
        <div className="discount-hero"><h1 className="display page-title">MEMBER<br/><span className="red">DISCOUNTS</span></h1><aside className="wallet-cta"><img src="/assets/ulisoc-logo-red.png" alt=""/><div><span>Already got your membership?</span><h2>Add it to your Wallet.</h2><p>Verify your membership and keep your ULISOC card on your phone.</p><a href="/membership">Get your digital membership →</a><small>Google Wallet available · Apple Wallet coming soon</small></div></aside></div>
        <section className="offers">
          {offers.map((offer, index) => (
            <article
              className={`offer ${offer[4] ? "with-image" : ""} ${index in placeDetails ? "interactive" : ""}`}
              key={index}
              onClick={index in placeDetails ? () => { setDetailClosing(false); setActiveDetail(index as DetailIndex); } : undefined}
              onKeyDown={index in placeDetails ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setDetailClosing(false);
                  setActiveDetail(index as DetailIndex);
                }
              } : undefined}
              role={index in placeDetails ? "button" : undefined}
              tabIndex={index in placeDetails ? 0 : undefined}
            >
              {offer[4] && <div className={`offer-image ${offer[1] === "PODUR" ? "logo-image" : ""} ${offer[1] === "Vivace" ? "vivace-image" : ""}`} style={{backgroundImage: `url(${offer[4]})`, backgroundPosition: offer[1] === "La Maison Cafe" ? "center 38%" : offer[1] === "Vivace" ? "72% center" : undefined}} aria-hidden="true"/>}
              <div className="offer-copy">
                <div className="display saving">{offer[0]}</div>
                <h2>{offer[1]}</h2>
                {offer[5] && <p className="address">{offer[5].split(" · ")[0]}{offer[5].includes(" · ") && <><br/><span>{offer[5].split(" · ")[1]}</span></>}</p>}
              </div>
              <div className="offer-link">View offer <b>↗</b></div>
            </article>
          ))}
        </section>
        {detail && (
          <div className={`modal-backdrop${detailClosing ? " closing" : ""}`} role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}>
            <section className={`place-modal${activeDetail!==0&&activeDetail!==12?" no-map":""}`} role="dialog" aria-modal="true" aria-labelledby="place-detail-title">
              <button className="close-modal" onClick={closeDetail} aria-label="Close offer details">×</button>
              <div className="detail-panel">
                <div className="detail-kicker">Member offer</div>
                <div className="display detail-saving">{detail.saving}</div>
                <h2 id="place-detail-title">{detail.name}</h2>
                <p className="description">{detail.description}</p>

                <div className="detail-block">
                  <span className="detail-label">Offer details</span>
                  <p>{detail.offer}</p>
                </div>

                <div className="detail-grid">
                  <div className="detail-block">
                    <span className="detail-label">Opening hours</span>
                    <p>{detail.hours}</p>
                  </div>
                  <div className="detail-block">
                    <span className="detail-label">Address</span>
                    <p>{detail.address}</p>
                  </div>
                </div>

                <div className="detail-actions">
                  <a href={detail.directions} target="_blank" rel="noreferrer">Get directions ↗</a>
                  <a className="secondary-action" href={detail.website} target="_blank" rel="noreferrer">{detail.websiteLabel}</a>
                </div>
              </div>
              {activeDetail === 0 ? <PodurVerification partner="Cali's"/> : activeDetail === 12 ? <PodurVerification/> : null}
            </section>
          </div>
        )}
        <style>{`
          .discount-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(380px,.9fr);gap:55px;align-items:center;margin-bottom:55px}.discount-hero .page-title{margin-bottom:0}.wallet-cta{border:1px solid #3b3533;background:linear-gradient(145deg,#151111,#0d0b0b);padding:28px;display:grid;grid-template-columns:58px 1fr;gap:22px;align-items:start}.wallet-cta img{width:58px;height:58px;object-fit:contain}.wallet-cta span,.wallet-cta small{text-transform:uppercase;letter-spacing:.11em;font-size:10px;font-weight:800;color:#9e9692}.wallet-cta h2{font-size:29px;line-height:1;margin:8px 0 10px}.wallet-cta p{color:#aaa;font-size:14px;line-height:1.5;margin:0 0 19px}.wallet-cta a{display:inline-flex;background:#c52028;color:#fff;padding:13px 16px;text-transform:uppercase;font-size:11px;font-weight:900}.wallet-cta a:hover{background:#fff;color:#090808}.wallet-cta small{display:block;margin-top:13px;line-height:1.4}
          .offers{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
          .offer{padding:30px;min-height:285px;border:1px solid var(--border);position:relative;overflow:hidden;transition:.2s background}
          .interactive{cursor:pointer}
          .interactive:focus-visible{outline:2px solid #c52028;outline-offset:4px}
          .offer:hover{background:#b3222d}
          .offer-copy{position:absolute;z-index:2;top:44%;left:30px;right:30px;transform:translateY(-50%)}
          .saving{font-size:clamp(46px,6vw,76px);margin:0 0 10px;color:#c52028}
          .offer:hover .saving{color:#fff}
          .offer h2{font-size:24px;line-height:1.15;margin:0;max-width:16ch}
          .address{color:#a29a96;font-size:14px;line-height:1.4;margin:9px 0 0;max-width:28ch}
          .offer:hover .address{color:#d8d1cd}
          .offer-link{position:absolute;z-index:3;bottom:28px;left:30px;right:30px;border-top:1px solid var(--border);padding-top:16px;text-transform:uppercase;font-size:12px;font-weight:800;display:flex;justify-content:space-between}
          .offer-image{position:absolute;z-index:0;inset:0 0 0 42%;background-size:cover;background-position:center;transition:opacity .35s ease}
          .offer-image.logo-image{background-size:cover;background-position:center}
          .offer-image:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#090808 0%,rgba(9,8,8,.92) 18%,rgba(9,8,8,.35) 62%,rgba(9,8,8,.12) 100%)}
          .with-image .offer-copy{right:auto;width:54%}
          .with-image .saving{font-size:clamp(42px,5vw,68px)}
          .with-image:hover{background:#090808}
          .with-image:hover .saving{color:#c52028}
          .modal-backdrop{position:fixed;z-index:1000;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);display:grid;place-items:center;padding:28px;animation:window-fade-in .28s ease-out both}
          .place-modal{position:relative;width:min(1120px,100%);max-height:min(760px,92vh);min-height:620px;background:#090808;border:1px solid #3b3533;display:grid;grid-template-columns:minmax(0,1fr) minmax(380px,.9fr);overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,.55);animation:window-rise-in .38s cubic-bezier(.22,1,.36,1) both}
          .place-modal.no-map{width:min(760px,100%);grid-template-columns:1fr}
          @keyframes window-fade-in{from{opacity:0}to{opacity:1}}
          @keyframes window-rise-in{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
          .modal-backdrop.closing{animation:window-fade-out .22s ease-in forwards;pointer-events:none}
          .modal-backdrop.closing .place-modal{animation:window-retreat-out .22s ease-in forwards}
          @keyframes window-fade-out{to{opacity:0}}
          @keyframes window-retreat-out{to{opacity:0;transform:translateY(10px) scale(.99)}}
          .close-modal{position:absolute;z-index:4;top:18px;right:18px;width:44px;height:44px;border:1px solid rgba(255,255,255,.28);border-radius:50%;background:rgba(9,8,8,.82);color:#fff;font-size:30px;line-height:1;cursor:pointer}
          .close-modal:hover{background:#c52028;border-color:#c52028}
          .detail-panel{padding:52px;overflow:auto}
          .detail-kicker,.detail-label{text-transform:uppercase;letter-spacing:.16em;font-size:12px;font-weight:800;color:#a29a96}
          .detail-saving{font-size:clamp(62px,8vw,104px);line-height:.86;color:#c52028;margin:28px 0 18px}
          .detail-panel h2{font-size:38px;line-height:1;margin:0 0 20px}
          .description{font-size:17px;line-height:1.65;color:#d3cdca;max-width:54ch;margin:0 0 32px}
          .detail-block{border-top:1px solid #393432;padding-top:16px}
          .detail-block p{font-size:15px;line-height:1.6;margin:8px 0 0;color:#ddd7d3}
          .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px}
          .detail-actions{display:flex;gap:12px;margin-top:34px}
          .detail-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;background:#c52028;border:1px solid #c52028;color:#fff;text-transform:uppercase;font-size:12px;font-weight:800;letter-spacing:.04em}
          .detail-actions .secondary-action{background:transparent;border-color:#4a4441}
          .detail-actions a:hover{background:#fff;border-color:#fff;color:#090808}
          @media(hover:hover) and (pointer:fine) and (min-width:721px){.with-image:hover .offer-image{opacity:.68}}
          @media(max-width:850px){.discount-hero{grid-template-columns:1fr;gap:30px;margin-bottom:38px}.wallet-cta{grid-template-columns:46px 1fr;padding:22px}.wallet-cta img{width:46px;height:46px}}
          @media(max-width:720px){.offers{grid-template-columns:1fr;gap:12px}.offer{min-height:260px}.with-image{min-height:390px}.offer-image{inset:0 0 auto 0;height:175px;background-position:center 49%}.offer-image.vivace-image{background-size:140% auto;background-position:right center!important}.offer-image:after{background:linear-gradient(180deg,rgba(9,8,8,.05) 25%,#090808 100%)}.with-image .offer-copy{top:225px;right:30px;width:auto;transform:none}.with-image .saving{margin:0 0 8px}.modal-backdrop{padding:0;place-items:stretch}.place-modal{width:100%;max-height:none;min-height:100dvh;display:block;overflow:auto}.detail-panel{padding:76px 24px 32px}.detail-saving{font-size:64px;margin-top:22px}.detail-panel h2{font-size:31px}.detail-grid{grid-template-columns:1fr;gap:22px}.detail-actions{flex-direction:column}.detail-actions a{width:100%}.close-modal{position:fixed}}
        `}</style>
      </div>
    </SiteFrame>
  );
}
