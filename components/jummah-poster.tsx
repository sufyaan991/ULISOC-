import { formatFriday } from "@/lib/jummah-automation";
import { venues, type JummahSchedule, type JummahVenue } from "@/lib/jummah";

export function JummahPoster({schedule}:{schedule:JummahSchedule}){
  const noCampus=schedule.venue==="no-campus";
  const venue=noCampus?null:venues[schedule.venue as Exclude<JummahVenue,"no-campus">];
  return <article className="jummah-poster">
    <header><img src="/assets/ulisoc-logo.png" alt=""/><div><strong>UNIVERSITY OF LEICESTER</strong><span>ISLAMIC SOCIETY</span></div></header>
    <div className="poster-pattern" aria-hidden="true"/>
    <main>
      <p className="poster-kicker">JUMU‘AH ARRANGEMENTS</p>
      <h1>{formatFriday(schedule.fridayDate)}</h1>
      {noCampus?<section className="no-campus"><strong>NO ON-CAMPUS JUMU‘AH</strong><p>{schedule.announcement||"On-campus Jumu‘ah is paused for the university holiday."}</p></section>:<>
        <section className="poster-venue"><small>VENUE</small><strong>{venue?.name}</strong><p>{venue?.detail}</p></section>
        <div className="poster-times">
          <TimeBlock title="1ST JUMU‘AH" rows={[["ADHĀN",schedule.firstAdhan],...(schedule.firstTalk?[["TALK",schedule.firstTalk]]:[]),["KHUṬBAH",schedule.firstKhutbah],["ṢALĀH",schedule.firstSalah]]}/>
          <TimeBlock title="2ND JUMU‘AH" rows={[["ADHĀN",schedule.secondAdhan],["KHUṬBAH",schedule.secondKhutbah],["ṢALĀH",schedule.secondSalah]]}/>
        </div>
        <section className="poster-note"><strong>SISTERS</strong><p>{venue?.sisters}</p>{schedule.announcement&&<p>{schedule.announcement}</p>}</section>
      </>}
    </main>
    <footer><strong>@ULISOC</strong><span>ulisoc.uk</span></footer>
    <style>{`
      html,body{margin:0;background:#080707}.jummah-poster{position:relative;width:1080px;height:1350px;overflow:hidden;background:#090808;color:#fff;font-family:Arial,Helvetica,sans-serif;border-top:20px solid #b10008}.jummah-poster *{box-sizing:border-box}.jummah-poster header{height:142px;padding:28px 58px;display:flex;align-items:center;gap:23px;border-bottom:2px solid #3a3030}.jummah-poster header img{width:76px;height:76px;object-fit:contain}.jummah-poster header div{display:grid;gap:5px}.jummah-poster header strong{font-size:25px;letter-spacing:.09em}.jummah-poster header span{color:#d6b777;font-size:21px;letter-spacing:.18em}.poster-pattern{position:absolute;right:-70px;top:20px;width:560px;height:330px;background:url('/assets/hero-banner.png') center/contain no-repeat;opacity:.13}.jummah-poster main{padding:60px 62px 42px;position:relative;z-index:1}.poster-kicker{margin:0 0 18px;color:#d6b777;font-size:24px;font-weight:900;letter-spacing:.18em}.jummah-poster h1{font-family:Impact,'Arial Narrow Bold',sans-serif;font-size:91px;line-height:.9;text-transform:uppercase;max-width:920px;margin:0 0 48px;letter-spacing:-.02em}.poster-venue{border-left:12px solid #b10008;background:#160d0e;padding:25px 30px;margin-bottom:38px}.poster-venue small,.poster-note strong{display:block;color:#d6b777;font-size:19px;font-weight:900;letter-spacing:.15em;margin-bottom:10px}.poster-venue strong{display:block;font-size:37px;line-height:1.05}.poster-venue p,.poster-note p{font-size:21px;color:#d4ceca;margin:9px 0 0;line-height:1.35}.poster-times{display:grid;grid-template-columns:1fr 1fr;gap:25px}.poster-time{border:2px solid #3a3030;background:#100e0e;padding:24px 27px}.poster-time h2{font-family:Impact,'Arial Narrow Bold',sans-serif;color:#c92028;font-size:49px;margin:0 0 18px}.poster-row{display:flex;justify-content:space-between;gap:20px;border-top:1px solid #3a3030;padding:13px 0;font-size:21px}.poster-row span:first-child{color:#aaa;font-weight:800}.poster-row strong{font-size:24px}.poster-note{margin-top:28px;padding:22px 27px;background:#160d0e;border-left:8px solid #d6b777}.no-campus{margin-top:95px;border:3px solid #b10008;background:#160d0e;padding:55px;text-align:center}.no-campus strong{font-family:Impact,'Arial Narrow Bold',sans-serif;color:#c92028;font-size:78px;line-height:.95}.no-campus p{font-size:28px;line-height:1.45}.jummah-poster footer{position:absolute;left:0;right:0;bottom:0;height:86px;padding:0 62px;background:#b10008;display:flex;align-items:center;justify-content:space-between;font-size:23px;letter-spacing:.08em}
    `}</style>
  </article>
}

function TimeBlock({title,rows}:{title:string;rows:string[][]}){return <section className="poster-time"><h2>{title}</h2>{rows.map(([label,value])=><div className="poster-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>}
