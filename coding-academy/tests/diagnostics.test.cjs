/* Device readiness tests: no real learner data, backend, CDN or browser required.
 * Run: node coding-academy/tests/diagnostics.test.cjs
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,".."),read=name=>fs.readFileSync(path.join(root,name),"utf8");
const js=read("diagnostics.js"),html=read("diagnostics.html"),coreJs=read("cloud-core.js");
new Function(js);
assert.match(html,/src="\.\/diagnostics\.js"/);
assert.match(html,/src="\.\/cloud-core\.js"/);
assert.match(js,/new Worker\("\.\/python-runner\.mjs",\{type:"module"\}\)/);
assert.match(js,/diagnostic-probe/);
assert.match(js,/navigator\.serviceWorker\.getRegistration/);
assert.match(js,/caches\.match/);
assert.match(js,/testPython"\)\.addEventListener\("click",testPython\)/);
assert.doesNotMatch(js,/fetch\(/,"Normal capability checks must never fetch cloud or profile data");
const cloud={};
vm.runInNewContext(coreJs,{window:cloud,TextEncoder});
class E{
 constructor(){this.textContent="";this.className="";this.dataset={};this.children=[];this.disabled=false;this.listeners={};}
 addEventListener(name,callback){this.listeners[name]=callback;}
 appendChild(child){this.children.push(child);return child;}
 click(){this.clicked=true;}
 remove(){this.removed=true;}
}
const els=new Map(),byId=id=>{if(!els.has(id))els.set(id,new E());return els.get(id);};
const document={getElementById:byId,createElement:()=>new E(),body:{appendChild(){}}};
const storage=new Map([["unrelated-private-data",'{"name":"Someone Private","secret":"keep-private"}']]);
const localStorage={
 getItem:key=>storage.has(key)?storage.get(key):null,
 setItem:(key,v)=>storage.set(key,String(v)),
 removeItem:key=>storage.delete(key)
};
let lastBlob=null,spawned=0,terminated=0;
class FakeWorker{
 constructor(url,opts){spawned++;assert.equal(url,"./python-runner.mjs");assert.equal(opts.type,"module");}
 postMessage(message){
  assert.equal(message.action,"run");
  assert.match(message.code,/def add/);
  assert.equal(message.tests[0].expression,"add(2,3) == 5");
  this.onmessage({data:{id:message.id,type:"loading"}});
  this.onmessage({data:{id:message.id,type:"ready"}});
  this.onmessage({data:{id:message.id,type:"result",result:{stdout:"Python says 5\n",passed:true,results:[{label:"Math function works",pass:true}]}}});
 }
 terminate(){terminated++;}
}
const urlApi={createObjectURL(b){lastBlob=b;return "blob:test";},revokeObjectURL(){}};
const navigator={onLine:true,serviceWorker:{async getRegistration(){return {active:true};}}};
const caches={async match(){return {ok:true};}};
const windowMock={...cloud,isSecureContext:true,addEventListener(){}};
vm.runInNewContext(js,{
 window:windowMock,document,navigator,localStorage,WebAssembly,Worker:FakeWorker,
 Blob,URL:Object.assign(function URLMock(url,base){return new URL(url,base);},{createObjectURL:urlApi.createObjectURL,revokeObjectURL:urlApi.revokeObjectURL}),
 TextEncoder,caches,location:{href:"https://www.lamastudio.pk/coding-academy/diagnostics.html"},
 setTimeout,clearTimeout,console
});
(async()=>{
 await new Promise(resolve=>setTimeout(resolve,20));
 assert.equal(spawned,0,"Python should not load on normal page open");
 assert.equal(els.get("rerun").disabled,false);
 assert.equal(els.get("checks").children.length,8);
 for(const node of els.get("checks").children)assert.match(node.children[0].className,/state pass/);
 assert.equal(storage.get("unrelated-private-data"),'{"name":"Someone Private","secret":"keep-private"}');
 assert.equal(storage.has("lama-coding-diagnostic-probe-v1"),false,"Test storage key must be removed");
 byId("export").listeners.click();
 assert.ok(lastBlob,"An anonymous report is downloadable");
 const report=await lastBlob.text();
 assert.equal(JSON.parse(report).checks.length,8);
 assert.doesNotMatch(report,/Someone Private|keep-private/);
 byId("testPython").listeners.click();
 assert.equal(spawned,1,"Python only starts on explicit click");
 assert.equal(terminated,1,"Python worker is closed after the test");
 assert.equal(byId("pythonStatus").dataset.verdict,"passed");
 assert.match(byId("pythonStatus").textContent,/PASS: The real Python interpreter loaded/);
 assert.equal(byId("testPython").disabled,false);
 console.log("PASS: eight local browser checks, no automatic CDN download, anonymous export, real worker protocol and explicit cleanup.");
})().catch(error=>{console.error(error);process.exitCode=1;});
