import "dotenv/config";
import cron from "node-cron";
import {loadConfig} from "./config.mjs";
import {connectWhatsApp,disconnectWhatsApp} from "./client.mjs";
import {prepareAndSend} from "./send.mjs";

const command=process.argv[2]||"start";
const flags=new Set(process.argv.slice(3));

async function main(){
  const config=loadConfig({requireTarget:command!=="list-groups"});
  const {client,ready}=connectWhatsApp(config);
  const stop=async()=>{await disconnectWhatsApp(client);process.exit(0)};
  process.once("SIGINT",stop);process.once("SIGTERM",stop);
  await ready;

  if(command==="list-groups"){
    const groups=(await client.getChats()).filter(chat=>chat.isGroup).sort((a,b)=>(a.name||"").localeCompare(b.name||""));
    if(!groups.length)console.log("No WhatsApp groups are visible to this account.");
    for(const group of groups)console.log(`${group.name||"Unnamed group"}\n${group.id._serialized}\n`);
    return disconnectWhatsApp(client);
  }

  if(command==="send-now"){
    await prepareAndSend({client,config,confirm:flags.has("--confirm"),force:flags.has("--force"),source:"manual"});
    return disconnectWhatsApp(client);
  }

  if(command!=="start")throw new Error(`Unknown command: ${command}`);
  if(!config.schedulerEnabled){console.log("Scheduler is disabled. Set SCHEDULER_ENABLED=true only after the Committee-chat test succeeds.");return}
  if(config.dryRun)console.log("Scheduler is running in DRY_RUN mode; scheduled runs cannot send WhatsApp messages.");
  if(!cron.validate(config.cron))throw new Error("SEND_CRON is not a valid cron expression.");
  cron.schedule(config.cron,()=>prepareAndSend({client,config,confirm:true,source:"schedule"}).catch(error=>console.error("Scheduled Jumu'ah send failed",error)),{timezone:config.timezone,noOverlap:true,name:"ulisoc-jummah"});
  console.log(`Scheduler ready: ${config.cron} (${config.timezone})`);
}

main().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1});
