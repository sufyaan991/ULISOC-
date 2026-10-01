import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

test("Next.js serves public pages without a database and disables unfinished services", { timeout: 60000 }, async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "ulisoc-next-test-"));
  const env = { ...process.env, NODE_ENV: "production" };
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "0"], { env, stdio: ["ignore", "pipe", "pipe"] });
  t.after(async () => {
    if (server.exitCode === null) {
      const stopped = once(server, "exit");
      server.kill("SIGTERM");
      await stopped;
    }
    await rm(directory, { recursive: true, force: true });
  });
  const base = await new Promise((resolve, reject) => {
    let log = "";
    const timer = setTimeout(() => reject(new Error(`Next.js did not start: ${log}`)), 20000);
    server.on("error", reject);
    server.on("exit", code => { clearTimeout(timer); reject(new Error(`Next.js exited (${code}): ${log}`)); });
    const read = chunk => {
      log += chunk;
      const address = log.match(/http:\/\/localhost:(\d+)/);
      if (address && /Ready in/.test(log)) { clearTimeout(timer); resolve(`http://localhost:${address[1]}`); }
    };
    server.stdout.on("data", read);
    server.stderr.on("data", read);
  });
  for (const route of ["/", "/about", "/contact", "/discounts", "/membership", "/admin", "/admin/jummah", "/admin/discounts"]) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  }
  for (const route of ["/api/admin/jummah", "/api/automation/jummah", "/api/jummah", "/api/membership/verify-pass"]) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 503, route);
    assert.match((await response.json()).error, /temporarily unavailable/);
    assert.match(response.headers.get("cache-control"), /no-store/);
  }
  for (const route of ["/api/admin/login", "/api/discounts/request-code", "/api/membership/create-pass"]) {
    const response = await fetch(`${base}${route}`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    assert.equal(response.status, 503, route);
  }
  const membership = await (await fetch(`${base}/membership`)).text();
  assert.match(membership, /Digital membership temporarily unavailable/);
  assert.doesNotMatch(membership, /Email me a code/);
  const admin = await (await fetch(`${base}/admin`)).text();
  assert.match(admin, /Committee tools temporarily unavailable/);
  assert.doesNotMatch(admin, /Committee password/);
});
