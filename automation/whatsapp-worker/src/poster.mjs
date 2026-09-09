import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

export async function capturePoster(config,payload){
  const outputDir=path.join(config.dataDir,"previews");
  await fs.mkdir(outputDir,{recursive:true,mode:0o700});
  const outputPath=path.join(outputDir,`jummah-${payload.date}.jpg`);
  const browser=await puppeteer.launch({headless:true,executablePath:config.chromePath,protocolTimeout:240_000,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"]});
  try{
    const page=await browser.newPage();
    await page.setViewport({width:1080,height:1350,deviceScaleFactor:1});
    await page.setExtraHTTPHeaders({authorization:`Bearer ${config.automationSecret}`});
    const url=new URL(payload.posterPath,config.apiBase);
    const response=await page.goto(url.href,{waitUntil:"networkidle0",timeout:60_000});
    if(!response?.ok())throw new Error(`Poster page returned ${response?.status()??"no response"}.`);
    await page.waitForSelector(".jummah-poster",{timeout:20_000});
    await page.screenshot({path:outputPath,type:"jpeg",quality:78,clip:{x:0,y:0,width:1080,height:1350}});
    const details=await fs.stat(outputPath);
    console.log(`Compressed poster size: ${Math.round(details.size/1024)} KB`);
    return outputPath;
  }finally{await browser.close()}
}
