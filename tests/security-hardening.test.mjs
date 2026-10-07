import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path){return readFile(new URL(`../${path}`,import.meta.url),"utf8")}

test("admin authentication has per-IP throttling and expiring unique sessions",async()=>{
  const [login,auth]=await Promise.all([source("app/api/admin/login/route.ts"),source("lib/jummah-auth.ts")]);
  assert.match(login,/admin_login_blocks/);assert.match(login,/900000/);assert.match(login,/3600000/);assert.match(login,/ipHash/);
  assert.match(login,/recent>=3/);assert.match(login,/after\?\.recent\?\?0\)>=3/);
  assert.match(auth,/crypto\.randomUUID\(\)/);assert.match(auth,/iat/);assert.match(auth,/exp/);assert.match(auth,/payload\.exp>now/);assert.match(auth,/AUTH_SESSION_SECRET/);
});

test("sensitive routes use no-store and admin writes verify origin",async()=>{
  const paths=["app/api/admin/discounts/route.ts","app/api/discounts/code/route.ts","app/api/member/request-code/route.ts","app/api/member/verify-code/route.ts","app/api/member/session/route.ts","app/api/membership/create-pass/route.ts"];
  for(const path of paths)assert.match(await source(path),/jsonNoStore/);
  for(const path of ["app/api/admin/login/route.ts","app/api/admin/logout/route.ts","app/api/admin/discounts/route.ts","app/api/admin/jummah/route.ts","app/api/member/request-code/route.ts","app/api/member/verify-code/route.ts","app/api/member/sign-out/route.ts","app/api/discounts/code/route.ts","app/api/membership/create-pass/route.ts"])assert.match(await source(path),/requireSameOrigin/);
});

test("members-only routes re-check the member list on every request",async()=>{
  const [code,pass,members,request]=await Promise.all([source("app/api/discounts/code/route.ts"),source("app/api/membership/create-pass/route.ts"),source("lib/members.ts"),source("app/api/member/request-code/route.ts")]);
  assert.match(code,/currentMember\(\)/);assert.match(pass,/currentMember\(\)/);
  assert.match(members,/auth\.getUser\(\)/);assert.match(members,/lower\(email\) = lower\(\?\)/);
  // Same response for members and non-members, so the endpoint does not reveal who is a member.
  assert.match(request,/if \(member\)/);assert.doesNotMatch(request,/status: 404/);
});

test("discounts contain no embedded map or Cali's secret",async()=>{
  const [page,code]=await Promise.all([source("app/discounts/page.tsx"),source("app/api/discounts/code/route.ts")]);
  assert.doesNotMatch(page,/<iframe|output=embed/);assert.doesNotMatch(code,/ULISOC20/);assert.match(code,/calis_code/);
});

test("Wallet passes use signed longer IDs and an expiry interval",async()=>{
  const wallet=await source("lib/google-wallet.ts");
  assert.match(wallet,/slice\(0,16\)/);assert.match(wallet,/validTimeInterval/);assert.match(wallet,/createMembershipQrToken/);assert.match(wallet,/https:\/\/ulisoc\.uk/);assert.doesNotMatch(wallet,/talho-walho/);
});

test("site-wide browser protections include CSP and anti-framing",async()=>{
  const worker=await source("next.config.ts");
  for(const header of ["Strict-Transport-Security","X-Content-Type-Options","Referrer-Policy","Permissions-Policy","X-Frame-Options","Content-Security-Policy"])assert.match(worker,new RegExp(header));
  assert.match(worker,/frame-ancestors 'none'/);
});
