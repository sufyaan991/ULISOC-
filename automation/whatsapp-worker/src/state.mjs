import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const empty=()=>({version:1,sends:{}});
const key=(target,date)=>`${target}:${date}`;

async function readState(dataDir){
  try{const value=JSON.parse(await fs.readFile(path.join(dataDir,"send-state.json"),"utf8"));return value?.version===1&&value.sends?value:empty()}
  catch(error){if(error?.code==="ENOENT")return empty();throw error}
}

async function writeState(dataDir,state){
  await fs.mkdir(dataDir,{recursive:true,mode:0o700});
  const file=path.join(dataDir,"send-state.json");
  const temporary=`${file}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temporary,JSON.stringify(state,null,2),{mode:0o600});
  await fs.rename(temporary,file);
}

export async function sendRecord(dataDir,target,date){return (await readState(dataDir)).sends[key(target,date)]??null}
export async function markSend(dataDir,target,date,record){const state=await readState(dataDir);state.sends[key(target,date)]={...record,updatedAt:new Date().toISOString()};await writeState(dataDir,state)}
