import {readFile,writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";

const clientPath=fileURLToPath(new URL("../node_modules/whatsapp-web.js/src/Client.js",import.meta.url));
let source=await readFile(clientPath,"utf8");

const debugPolling=`        let start = Date.now();
        let timeout = this.options.authTimeoutMs;
        let res = false;
        while (start > Date.now() - timeout) {
            res = await this.pupPage.evaluate(
                'window.Debug?.VERSION != undefined',
            );
            if (res) {
                break;
            }
            await new Promise((r) => setTimeout(r, 200));
        }
        if (!res) {
            throw 'auth timeout';
        }`;
const debugWait=`        await this.pupPage.waitForFunction(
            'window.Debug?.VERSION != undefined',
            { timeout: this.options.authTimeoutMs },
        );`;
const readyPolling=`                    let start = Date.now();
                    let res = false;
                    while (start > Date.now() - 30000) {
                        // Check window.WWebJS Injection
                        res = await this.pupPage.evaluate(
                            'window.WWebJS != undefined',
                        );
                        if (res) {
                            break;
                        }
                        await new Promise((r) => setTimeout(r, 200));
                    }
                    if (!res) {
                        throw 'ready timeout';
                    }`;
const readyWait=`                    await this.pupPage.waitForFunction(
                        'window.WWebJS != undefined',
                        { timeout: 30000 },
                    );`;
const initialInject=`        await this.inject();

        this.pupPage.on('framenavigated'`;
const resilientInitialInject=`        let initialInjectionComplete = false;
        let initialInjectionError;
        for (let attempt = 1; attempt <= 5; attempt++) {
            try {
                await this.inject();
                initialInjectionComplete = true;
                break;
            } catch (error) {
                initialInjectionError = error;
                const message = String(error?.message ?? error);
                if (!message.includes('Execution context was destroyed')) {
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        if (!initialInjectionComplete) {
            throw initialInjectionError;
        }

        this.pupPage.on('framenavigated'`;

let changed=false;
if(source.includes(debugPolling)){source=source.replace(debugPolling,debugWait);changed=true}
if(source.includes(readyPolling)){source=source.replace(readyPolling,readyWait);changed=true}
if(source.includes(initialInject)){source=source.replace(initialInject,resilientInitialInject);changed=true}
if(!changed&&(!source.includes(debugWait)||!source.includes(readyWait)||!source.includes(resilientInitialInject)))throw new Error("The installed whatsapp-web.js layout changed; refusing to apply an unsafe patch.");
await writeFile(clientPath,source);
console.log(changed?"Applied WhatsApp navigation-safety patch.":"WhatsApp navigation-safety patch already applied.");
