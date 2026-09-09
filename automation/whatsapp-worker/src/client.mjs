import whatsapp from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const {Client,LocalAuth}=whatsapp;

export function connectWhatsApp(config){
  const client=new Client({
    authStrategy:new LocalAuth({clientId:"ulisoc-jummah",dataPath:config.authDir}),
    puppeteer:{headless:config.headless,executablePath:config.chromePath,protocolTimeout:240_000,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"]},
  });
  let rejectReady;
  const ready=new Promise((resolve,reject)=>{
    rejectReady=reject;
    const timeout=setTimeout(()=>reject(new Error("WhatsApp did not become ready within four minutes.")),240_000);
    client.once("qr",code=>{console.log("Scan this QR in WhatsApp → Linked Devices → Link a device");qrcode.generate(code,{small:true})});
    client.once("authenticated",()=>console.log("WhatsApp authenticated"));
    client.once("ready",()=>{clearTimeout(timeout);console.log("WhatsApp client ready");resolve(client)});
    client.once("auth_failure",message=>{clearTimeout(timeout);reject(new Error(`WhatsApp authentication failed: ${message}`))});
  });
  client.on("disconnected",reason=>console.warn(`WhatsApp disconnected: ${reason}`));
  client.initialize().catch(error=>rejectReady(error));
  return {client,ready};
}

export async function disconnectWhatsApp(client){try{await client.destroy()}catch{}}
