/* Static security contract for STAGED Coding Academy learner profiles.
 * Real Supabase isolation must still be tested with two authenticated users.
 */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.join(__dirname,".."),read=file=>fs.readFileSync(path.join(base,file),"utf8");
const sql=read("backend/learner-profile-setup.sql");
const configSource=read("cloud-config.js"),account=read("account.js"),html=read("account.html");
new Function(configSource);new Function(account);
const ctx={window:{}};vm.runInNewContext(configSource,ctx);
const config=ctx.window.LAMA_CODING_CLOUD_CONFIG;
assert.equal(config.enabled,false,"Do not activate cloud accounts without real RLS testing.");
assert.equal(config.url,"");
assert.equal(config.publishableKey,"");
assert.equal(config.table,"lama_coding_progress");
assert.equal(config.profileTable,"lama_coding_learners");
assert.match(sql,/create table if not exists public\.lama_coding_learners/i);
assert.match(sql,/user_id uuid primary key references auth\.users\(id\) on delete cascade/i);
assert.match(sql,/display_name text not null default ''/i);
assert.match(sql,/char_length\(display_name\) <= 60/i);
assert.match(sql,/preferred_language in \('en','ur'\)/i);
assert.match(sql,/enable row level security/i);
assert.match(sql,/revoke all on table public\.lama_coding_learners from public, anon/i);
assert.match(sql,/grant select, insert, update, delete on table public\.lama_coding_learners to authenticated/i);
const perms=["select","insert","update","delete"];
for(const p of perms){
 assert.match(sql,new RegExp("for "+p+" to authenticated[\\s\\S]*?auth\\.uid\\(\\)","i"),
  "Learner "+p+" must be scoped by session user ID.");
}
assert.match(sql,/for update to authenticated[\s\S]*?using[\s\S]*?with check/i);
assert.match(sql,/for insert to authenticated[\s\S]*?with check/i);
assert.doesNotMatch(sql,/security definer/i,"No privileged security-definer helper is needed.");
assert.doesNotMatch(sql,/ppsc_|public\.users/i,"Coding data must not be stored in PPSC tables.");
assert.match(html,/id="profileCard" hidden/);
assert.match(html,/id="displayName" maxlength="60"/);
assert.match(html,/id="preferredLanguage"/);
assert.match(html,/id="profileSave" type="submit" disabled/);
assert.match(account,/const verified=await requireUser\(\)/);
assert.match(account,/client\.from\(config\.profileTable\)/);
assert.match(account,/\.upsert\(\{user_id:verified\.id,display_name:displayName,preferred_language:lang\}/);
assert.match(account,/if\(!client\|\|!user\|\|recovery\|\|busy\)return/);
assert.match(account,/byId\("profileCard"\)\.hidden=!user\|\|recovery\|\|!client/);
assert.match(account,/profile=null;byId\("syncConsent"\)\.checked=false/);
assert.match(account,/profileCard/);
assert.doesNotMatch(account,/(?:sb_secret_|service_role|ppsc_)/i);
console.log("PASS: disabled-by-default separate learner profile, own-user RLS, 60-char name, EN/UR choice and explicit save only.");
