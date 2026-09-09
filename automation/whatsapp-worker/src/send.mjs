import fs from "node:fs/promises";
import whatsapp from "whatsapp-web.js";
import {fetchJummah} from "./api.mjs";
import {capturePoster} from "./poster.mjs";
import {markSend,sendRecord} from "./state.mjs";

const {MessageMedia}=whatsapp;

export async function prepareAndSend({client,config,confirm=false,force=false,source="manual"}){
  const payload=await fetchJummah(config);
  console.log(`Friday: ${payload.date}`);
  if(!payload.sendable){console.log(`Nothing sent: ${payload.reason}`);return {status:"skipped",payload}}
  const posterPath=await capturePoster(config,payload);
  console.log(`Poster generated: ${posterPath}`);
  console.log("\nCaption preview:\n----------------\n"+payload.caption+"\n----------------");
  if(config.dryRun){console.log("DRY RUN complete — nothing sent.");return {status:"dry-run",payload,posterPath}}
  if(!confirm)throw new Error("Live sending requires the --confirm flag.");

  const testDate=process.env.LOCAL_TEST_DATE?.trim()??"";
  const safeTestGroupId=process.env.SAFE_TEST_GROUP_ID?.trim()??"";
  const controlledTestAllowed=process.env.ALLOW_TEST_SEND==="true"&&safeTestGroupId.length>0&&config.targetGroupId===safeTestGroupId&&config.schedulerEnabled===false;
  if(testDate&&!controlledTestAllowed)throw new Error("Fixture send blocked: target does not match SAFE_TEST_GROUP_ID.");

  console.log(`Target: ${config.targetGroupName} (${config.targetGroupId})`);
  const previous=await sendRecord(config.dataDir,config.targetGroupId,payload.date);
  if(previous&&!force)throw new Error(`A previous attempt is marked ${previous.status}. Use --force only after checking the group.`);
  await markSend(config.dataDir,config.targetGroupId,payload.date,{status:"sending-poster",source,mediaMode:config.mediaMode});

  let posterMessageId=null;
  let captionMessageId=null;
  try{
    const media=MessageMedia.fromFilePath(posterPath);
    console.log(config.mediaMode==="document"?"Sending poster as a document...":"Sending HD poster...");
    const posterMessage=await client.sendMessage(config.targetGroupId,media,config.mediaMode==="document"?{sendMediaAsDocument:true}:{sendMediaAsHd:true});
    posterMessageId=posterMessage?.id?._serialized??"unknown";
    await markSend(config.dataDir,config.targetGroupId,payload.date,{status:"poster-sent",source,mediaMode:config.mediaMode,posterMessageId,posterSentAt:new Date().toISOString()});
    console.log("Poster sent successfully. Sending caption...");
    const captionMessage=await client.sendMessage(config.targetGroupId,payload.caption);
    captionMessageId=captionMessage?.id?._serialized??"unknown";
    await markSend(config.dataDir,config.targetGroupId,payload.date,{status:"sent",source,mediaMode:config.mediaMode,posterMessageId,captionMessageId,sentAt:new Date().toISOString()});
    console.log("POSTER AND CAPTION SENT SUCCESSFULLY!");
    return {status:"sent",payload,posterPath,posterMessageId,captionMessageId};
  }catch(error){
    await markSend(config.dataDir,config.targetGroupId,payload.date,{status:posterMessageId===null?"poster-failed":"caption-failed",source,mediaMode:config.mediaMode,posterMessageId,captionMessageId,error:error instanceof Error?error.message:"Unknown send failure",failedAt:new Date().toISOString()});
    throw error;
  }finally{await fs.chmod(posterPath,0o600).catch(()=>{})}
}
