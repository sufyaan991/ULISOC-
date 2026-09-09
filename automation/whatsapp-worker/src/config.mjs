import path from "node:path";

function bool(name,fallback){const value=process.env[name];if(value===undefined)return fallback;if(value==="true")return true;if(value==="false")return false;throw new Error(`${name} must be true or false.`)}
function required(name){const value=process.env[name]?.trim();if(!value)throw new Error(`${name} is required.`);return value}

export function loadConfig({requireTarget=true}={}){
  const apiBase=required("ULISOC_API_BASE").replace(/\/$/,"");
  const url=new URL(apiBase);
  if(url.protocol!=="https:"&&!['localhost','127.0.0.1'].includes(url.hostname))throw new Error("ULISOC_API_BASE must use HTTPS.");
  const automationSecret=required("ULISOC_AUTOMATION_SECRET");
  if(automationSecret.length<32)throw new Error("ULISOC_AUTOMATION_SECRET must contain at least 32 characters.");
  const targetGroupId=process.env.TARGET_GROUP_ID?.trim()??"";
  if(requireTarget&&!/^\d+@g\.us$/.test(targetGroupId))throw new Error("TARGET_GROUP_ID must be a WhatsApp group ID ending in @g.us.");
  const dataDir=path.resolve(process.env.DATA_DIR||"./data");
  const mediaMode=process.env.MEDIA_MODE?.trim()||"hd";
  if(!["hd","document"].includes(mediaMode))throw new Error("MEDIA_MODE must be hd or document.");
  return {
    apiBase,automationSecret,targetGroupId,
    targetGroupName:process.env.TARGET_GROUP_NAME?.trim()||"Configured WhatsApp group",
    dryRun:bool("DRY_RUN",true),
    schedulerEnabled:bool("SCHEDULER_ENABLED",false),
    cron:process.env.SEND_CRON?.trim()||"0 18 * * 4",
    timezone:process.env.TIMEZONE?.trim()||"Europe/London",
    dataDir,
    authDir:path.resolve(process.env.AUTH_DIR||path.join(dataDir,"wwebjs_auth")),
    chromePath:process.env.CHROME_PATH?.trim()||undefined,
    headless:bool("HEADLESS",false),
    mediaMode,
  };
}
