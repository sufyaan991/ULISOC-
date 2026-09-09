import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {markSend,sendRecord} from "../src/state.mjs";

test("send state is persisted per group and Friday",async()=>{
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),"ulisoc-worker-"));
  try{assert.equal(await sendRecord(directory,"123@g.us","2026-09-11"),null);await markSend(directory,"123@g.us","2026-09-11",{status:"sent",messageId:"abc"});const record=await sendRecord(directory,"123@g.us","2026-09-11");assert.equal(record.status,"sent");assert.equal(record.messageId,"abc")}
  finally{await fs.rm(directory,{recursive:true,force:true})}
});
