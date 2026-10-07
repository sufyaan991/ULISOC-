"use client";
import { useEffect, useState } from "react";

type Status={memberCount:number;passCount:number;academicYear:string;expiresAt:number;podurConfigured:boolean;calisConfigured:boolean;walletConfigured:boolean};

export function DiscountSettings(){
  const[state,setState]=useState<Status|null>(null);const[podurCode,setPodurCode]=useState("");const[calisCode,setCalisCode]=useState("");const[walletServiceAccount,setWalletServiceAccount]=useState("");const[message,setMessage]=useState("");const[saving,setSaving]=useState(false);
  useEffect(()=>{fetch("/api/admin/discounts",{cache:"no-store"}).then(r=>r.json()).then((data:Status)=>setState(data))},[]);
  async function save(event:React.FormEvent){
    event.preventDefault();setSaving(true);setMessage("");
    const response=await fetch("/api/admin/discounts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({podurCode,calisCode,walletServiceAccount})});const data=await response.json();
    setSaving(false);if(!response.ok){setMessage(data.error??"Could not save settings.");return}setState(data);setPodurCode("");setCalisCode("");setWalletServiceAccount("");setMessage("Settings saved securely.");
  }
  return <section className="settings">
    <p className="eyebrow">Committee setup</p><h1 className="display">MEMBER<br/><span>ACCESS</span></h1><p className="intro">Manage the discount codes and Google Wallet connection that verified members can access.</p>
    <div className="summary"><span className={state?.podurConfigured?"ready":"missing"}>{state?.podurConfigured?"✓ PODUR code saved":"PODUR code needed"}</span><span className={state?.calisConfigured?"ready":"missing"}>{state?.calisConfigured?"✓ Cali's code saved":"Cali's code needed"}</span><span className={state?.walletConfigured?"ready":"missing"}>{state?.walletConfigured?"✓ Google Wallet connected":"Wallet key needed"}</span><span>{state?.memberCount??0} members</span><span>{state?.passCount??0} Wallet passes</span></div>
    <p className="note" role="note">The member list is managed in Supabase: open the project, go to <strong>Table Editor → members</strong>, and add each member&apos;s email and full name (or import a CSV). Changes apply immediately; removing a row also stops that member&apos;s Wallet pass from verifying.</p>
    <form onSubmit={save}>
      <label>PODUR discount code <small>{state?.podurConfigured?"Already saved — leave blank to keep it":"Only verified members will receive this"}</small><input type="password" autoComplete="off" value={podurCode} onChange={e=>setPodurCode(e.target.value)}/></label>
      <label>Cali&apos;s discount code <small>{state?.calisConfigured?"Already saved — leave blank to keep it":"Only verified members will receive this"}</small><input type="password" autoComplete="off" value={calisCode} onChange={e=>setCalisCode(e.target.value)}/></label>
      <label>Google Wallet service-account JSON <small>{state?.walletConfigured?"Already encrypted and saved — leave blank to keep it":"Open the downloaded .json file, copy everything and paste it here"}</small><textarea className="secret-json" rows={5} value={walletServiceAccount} onChange={e=>setWalletServiceAccount(e.target.value)} placeholder={'{\n  "type": "service_account",\n  ...\n}'}/></label>
      <button disabled={saving||!state}>{saving?"Saving securely…":"Save settings →"}</button>{message&&<p className="message" role="status">{message}</p>}
    </form>
    <p className="privacy">Wallet passes for {state?.academicYear??"the current academic year"} expire automatically at the end of 31 July. Codes and credentials are encrypted before storage.</p>
    <style>{`.settings{width:min(900px,calc(100% - 32px));margin:auto;padding:45px 0 80px}.settings h1{font-size:clamp(68px,11vw,112px);line-height:.82;margin:14px 0 28px}.settings h1 span{color:#b3222d}.intro{color:#bbb;font-size:17px;max-width:600px}.summary{display:flex;flex-wrap:wrap;gap:10px;margin:30px 0}.summary span{border:1px solid #3a3030;padding:10px 13px;font-size:13px}.summary .ready{color:#b8d6ad}.summary .missing{color:#ff9ca0}.note{margin:0 0 22px;border-left:4px solid #d6b777;background:#1d1710;color:#e7d6a8;padding:14px;line-height:1.5}form{border:1px solid var(--border);background:#100e0e;padding:26px;display:grid;gap:22px}label{display:grid;gap:8px;color:#ddd;font-weight:800}small{color:#8f8885;font-weight:400}input,textarea{width:100%;border:1px solid #3a3030;background:#090808;color:#fff;padding:14px;font:inherit;font-size:16px}textarea{resize:vertical;line-height:1.65}.secret-json{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px}form button{border:0;background:#b3222d;color:#fff;padding:17px;font-weight:900;text-transform:uppercase;cursor:pointer}form button:disabled{opacity:.55;cursor:not-allowed}.message{margin:0;color:#d6b777}.privacy{font-size:13px;color:#777;line-height:1.6;margin-top:18px}@media(max-width:650px){form{padding:20px}.settings{padding-top:25px}}`}</style>
  </section>;
}
