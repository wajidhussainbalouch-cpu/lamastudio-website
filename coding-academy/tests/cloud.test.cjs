/* Run: node coding-academy/tests/cloud.test.cjs
 * Offline tests only; real sign-in/RLS across accounts require dedicated backend QA.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(base,name),"utf8");
const code=read("cloud-core.js"),account=read("account.js"),html=read("account.html"),config=read("cloud-config.js"),sql=read("backend/cloud-progress-setup.sql");
new Function(code);new Function(account);new Function(config);
assert.match(html,/src="\.\/cloud-core\.js"/);
assert.match(html,/src="\.\/cloud-config\.js"/);
assert.match(html,/src="\.\/account\.js"/);
assert.match(account,/supabase-js@2\.119\.0\/\+esm/);
assert.match(account,/\.auth\.signUp\(/);
assert.match(account,/\.auth\.signInWithPassword\(/);
assert.match(account,/\.auth\.resetPasswordForEmail\(/);
assert.match(account,/\.auth\.updateUser\(/);
assert.match(account,/\.auth\.signOut\(/);
assert.match(account,/\.insert\(/);
assert.match(account,/\.update\(/);
assert.match(account,/\.eq\("updated_at",latest\.updated_at\)/);
assert.match(account,/changed on another device/);
assert.match(account,/\.delete\(\)/);
assert.match(account,/\.maybeSingle\(\)/);
assert.match(account,/await requireUser\(\)/);
assert.match(account,/if\(!confirm\(/);
assert.doesNotMatch(account,/(?:service_role|sb_secret_)/i,"Public client must not contain privileged keys");
assert.match(sql,/enable row level security/i);
assert.match(sql,/revoke all on table public\.lama_coding_progress from public, anon/i);
assert.match(sql,/for select to authenticated[\s\S]*?auth\.uid\(\)/i);
assert.match(sql,/for insert to authenticated[\s\S]*?with check/i);
assert.match(sql,/for update to authenticated[\s\S]*?using[\s\S]*?with check/i);
assert.match(sql,/for delete to authenticated[\s\S]*?auth\.uid\(\)/i);
assert.match(sql,/user_id uuid primary key references auth\.users/i);
assert.match(sql,/octet_length\(snapshot::text\)/i);
const win={};
vm.runInNewContext(code,{window:win,TextEncoder});
const core=win.LAMA_CODING_CLOUD_CORE;
assert.ok(core&&core.read&&core.apply&&core.validate&&core.counts);
const store=new Map();
const storage={getItem:key=>store.has(key)?store.get(key):null,setItem:(key,v)=>store.set(key,String(v)),removeItem:key=>store.delete(key)};
const starter=core.read(storage);
assert.equal(core.counts(starter).done,0);
assert.equal(core.counts(starter).total,52);
assert.equal(Object.keys(starter.modules).length,4);
const completed={
 foundation:{goal:"web",progress:{h1:true,p:true},drafts:{h1:"<h1>Hello</h1>"},name:"Test Learner"},
 practice:{track:"js",selected:{js:"js-fee"},passed:{"js-fee":true,"sql-filter":true},drafts:{"js-fee":"function a() {}"}},
 python:{selected:"pyx-greetings",passed:{"pyx-greetings":{at:"2026-11-10T00:00:00Z"}},drafts:{"pyx-greetings":"def greet(name): return name"},answers:{"pyx-greetings":0},lang:"ur"},
 studio:{project:"school",steps:{school:1},checks:{school:{navigation:{reviewed:true}}},code:{school:"<html></html>"},reflection:{school:"I practiced navigation."},lang:"en"}
};
for(const part of core.parts)storage.setItem(part.key,JSON.stringify(completed[part.id]));
const snap=core.read(storage);
const counts=core.counts(snap);
assert.equal(counts.done,6);
assert.equal(counts.total,52);
assert.equal(snap.modules.python.lang,"ur");
assert.ok(core.sizeOf(snap)<core.maxBytes);
const remote=JSON.parse(JSON.stringify(snap));
remote.modules.python.passed["pyx-fees"]={at:"2026-11-10T01:00:00Z"};
remote.modules.foundation.progress.css=true;
core.apply(storage,remote);
assert.equal(core.counts(core.read(storage)).done,8);
assert.equal(core.read(storage).modules.python.passed["pyx-fees"].at,"2026-11-10T01:00:00Z");
assert.throws(()=>core.validate({format:core.format,version:1,modules:{foundation:null}}),/all four/i);
assert.throws(()=>core.validate({format:core.format,version:2,modules:remote.modules}),/Unsupported/i);
assert.throws(()=>core.validate({...remote,modules:{...remote.modules,python:{passed:[]}}}),/invalid field/i);
assert.throws(()=>core.validate({...remote,modules:{...remote.modules,python:{drafts:{"x":"A".repeat(90001)}}}}),/invalid field/i);
assert.throws(()=>core.validate({...remote,modules:{...remote.modules,python:{passed:{constructor:"oops"}}}}),/invalid field/i);
assert.throws(()=>core.validate({...remote,modules:{...remote.modules,python:{secret:"do not accept"}}}),/invalid field/i);
// Simulate a failed device write after two fields. The local state should roll back.
const before=JSON.stringify([...store.entries()]);
let tries=0;
const broken={
 getItem:storage.getItem,
 setItem(key,val){tries++;if(tries===2)throw Error("Storage full");storage.setItem(key,val);},
 removeItem:storage.removeItem
};
assert.throws(()=>core.apply(broken,snap),/Restore failed|Cloud restore failed/);
assert.equal(JSON.stringify([...store.entries()]),before,"Failure must not leave partially restored data");
// Disabled-by-default account UI does not import the external client or upload anything.
vm.runInNewContext(config,{window:win});
assert.equal(win.LAMA_CODING_CLOUD_CONFIG.enabled,false);
assert.equal(win.LAMA_CODING_CLOUD_CONFIG.publishableKey,"");
class E{
 constructor(){this.disabled=false;this.hidden=false;this.textContent="";this.value="";this.checked=false;this.className="";this.type="password";this.dataset={};this.listeners={};this.attributes={};}
 addEventListener(t,f){this.listeners[t]=f;}
 setAttribute(k,v){this.attributes[k]=v;}
}
const els=new Map(),get=id=>{if(!els.has(id))els.set(id,new E());return els.get(id);};
const page={getElementById:get,querySelectorAll:()=>["login","signup","reset"].map(mode=>({dataset:{mode},setAttribute(){},addEventListener(){}}))};
const browser={...win,addEventListener(){}};
vm.runInNewContext(account,{window:browser,document:page,localStorage:storage,navigator:{},location:{href:"https://example.org/account.html"},console,setTimeout,confirm:()=>true});
assert.match(get("configStatus").textContent,/not activated/i);
assert.equal(get("authSubmit").disabled,true);
assert.equal(get("upload").disabled,true);
assert.equal(get("refresh").disabled,true);
assert.match(get("localCount").textContent,/8 \/ 52/);
console.log("PASS: per-module validation, 52 scoring, safe local restore/rollback, RLS SQL, optional account disabled by default.");
