/* LAMA Coding Academy privacy/deletion checks.
 * No database/user account is created or deleted by these local-only tests.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const config=read("cloud-config.js"),coreJs=read("cloud-core.js"),account=read("account.js"),
  html=read("account.html"),privacy=read("privacy.html"),
  edge=read("backend/supabase/functions/coding-account-delete/index.ts");
new Function(config);new Function(coreJs);new Function(account);
assert.match(privacy,/Draft privacy information/);
assert.match(privacy,/authentica|cloud/i);
assert.match(privacy,/اردو میں مختصر وضاحت/);
for(const id of ["clearLocal","accountDeleteArea","accountDeleteForm","deletePassword","deletePhrase","deleteAccount","clearAfterDelete","eraseStatus"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.match(account,/config\.accountDeletionEnabled===true/);
assert.match(account,/\.functions\.invoke\("coding-account-delete"/);
assert.match(account,/confirmation:"DELETE ACCOUNT"/);
assert.match(account,/if\(!confirm\("Permanently delete/);
assert.match(account,/else localStorage\.setItem\(item\.key,item\.value\)/);
assert.match(edge,/request\.method !== "DELETE"/);
assert.match(edge,/allowedOrigins\.has\(origin\)/);
assert.match(edge,/userClient\.auth\.getUser\(token\)/);
assert.match(edge,/userClient\.auth\.signInWithPassword/);
assert.match(edge,/authenticated\?\.user\?\.id !== user\.id/);
assert.match(edge,/admin\.auth\.admin\.deleteUser\(user\.id\)/);
assert.match(edge,/Deno\.env\.get\("SUPABASE_SECRET_KEYS"\)/);
assert.match(edge,/Deno\.env\.get\("SUPABASE_PUBLISHABLE_KEYS"\)/);
assert.match(edge,/payload\.confirmation !== "DELETE ACCOUNT"/);
assert.doesNotMatch(edge,/deleteUser\((?:payload|request|body)\./);
assert.doesNotMatch(account,/admin\.auth\.admin\.deleteUser/);
assert.doesNotMatch(html,/(?:sb_secret_|SUPABASE_SERVICE_ROLE_KEY)/);
const win={addEventListener(){}};
vm.runInNewContext(coreJs,{window:win,TextEncoder});
vm.runInNewContext(config,{window:win});
assert.equal(win.LAMA_CODING_CLOUD_CONFIG.enabled,false);
assert.equal(win.LAMA_CODING_CLOUD_CONFIG.accountDeletionEnabled,false);
const store=new Map([
 ["lama-coding-academy-v1",'{"progress":{"h1":true}}'],
 ["lama-coding-practice-v2",'{"passed":{"js-fee":true}}'],
 ["lama-python-executable-v1",'{"passed":{"pyx-greetings":{"at":"2026-11-10"}}}'],
 ["lama-coding-project-studio-v1",'{"checks":{}}'],
 ["lama-coding-questions-v1",'{"stats":{"html-1-01":{"attempts":1,"correct":1,"lastCorrect":true}}}'],
 ["unrelated-auth-storage-key","keep this unrelated data"]
]);
const storage={
 getItem:key=>store.has(key)?store.get(key):null,
 setItem:(key,value)=>store.set(key,String(value)),
 removeItem:key=>store.delete(key)
};
class Element{
 constructor(){this.textContent="";this.value="";this.disabled=false;this.checked=false;this.hidden=false;this.className="";this.dataset={};this.type="password";this.listeners={};}
 addEventListener(event,fn){this.listeners[event]=fn;}
 setAttribute(){}
}
const elems=new Map(),byId=id=>{if(!elems.has(id))elems.set(id,new Element());return elems.get(id);};
const tabs=["login","signup","reset"].map(mode=>({dataset:{mode},addEventListener(){},setAttribute(){}}));
const doc={getElementById:byId,querySelectorAll:()=>tabs};
const result=vm.runInNewContext(account,{
 window:win,document:doc,localStorage:storage,navigator:{},location:{href:"https://www.lamastudio.pk/coding-academy/account.html"},
 setTimeout(){},confirm:()=>true,console
});
assert.equal(byId("deleteAccount").disabled,true,"Account deletion is gated by disabled backend flag.");
assert.equal(byId("upload").disabled,true,"Cloud sync must remain off.");
assert.match(byId("localCount").textContent,/3 \/ 62/);
// Guest learner can remove all five local Coding Academy learning records.
assert.ok(typeof byId("clearLocal").listeners.click==="function");
byId("clearLocal").listeners.click();
for(const part of win.LAMA_CODING_CLOUD_CORE.parts)
 assert.equal(storage.getItem(part.key),null,"Must erase local module "+part.id);
assert.equal(storage.getItem("lama-coding-questions-v1"),null,"Delete question progress with the four course records.");
assert.equal(storage.getItem("unrelated-auth-storage-key"),"keep this unrelated data","Do not clear unrelated app/session data.");
assert.equal(byId("localCount").textContent,"0 / 62");
assert.match(byId("eraseStatus").textContent,/Device learning data erased/);
console.log("PASS: staged account deletion, password verification guards, learner privacy copy, guest-only local erasure, unrelated storage preservation.");
