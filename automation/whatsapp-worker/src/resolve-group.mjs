import "dotenv/config";
import readline from "node:readline/promises";
import {stdin as input,stdout as output} from "node:process";
import {loadConfig} from "./config.mjs";
import {connectWhatsApp,disconnectWhatsApp} from "./client.mjs";

function inviteCode(value){
  const trimmed=value.trim();
  const match=trimmed.match(/(?:chat\.whatsapp\.com\/)?([A-Za-z0-9_-]{10,})/);
  if(!match)throw new Error("That does not look like a WhatsApp group invite link.");
  return match[1];
}

const prompt=readline.createInterface({input,output});
const config=loadConfig({requireTarget:false});
const {client,ready}=connectWhatsApp(config);

try{
  await ready;
  const link=await prompt.question("Paste the private group invite link: ");
  const group=await client.getInviteInfo(inviteCode(link));
  const id=group?.id?._serialized??group?.id;
  if(!id||!String(id).endsWith("@g.us"))throw new Error("WhatsApp did not return a valid group ID.");
  console.log(`\nGroup found:\n${group.subject||group.name||"Unnamed group"}\n${id}`);
}finally{
  prompt.close();
  await disconnectWhatsApp(client);
}
