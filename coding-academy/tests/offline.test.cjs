/* Service-worker behavior: never cache account verification links or unknown dynamic paths.
 * Run: node coding-academy/tests/offline.test.cjs
 */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","sw.js"),"utf8");
new Function(source);
assert.match(source,/lama-coding-academy-v14/);
assert.match(source,/if \(url\.search \|\| url\.hash/);
assert.match(source,/STATIC_ASSETS\.has\(url\.href\)/);
const assetMatch=source.match(/const ASSETS = (\[[^\n]+\]);/);
assert.ok(assetMatch,"The offline cache must list its static assets explicitly.");
const realAssets=vm.runInNewContext(assetMatch[1]);
for(const relative of realAssets){
 assert.equal(fs.existsSync(path.join(__dirname,"..",relative)),true,"Missing precache file: "+relative);
}
const scope="https://www.lamastudio.pk/coding-academy/";
const handlers={};
let networkCalls=[],cachePuts=[],cacheDeletes=[];
const cacheContents=new Map();
const fakeResponse=(name,headers={})=>({
 name,ok:true,type:"basic",
 headers:{get:x=>headers[x]||null,has:x=>Object.hasOwn(headers,x)},
 clone(){return fakeResponse(name,headers);}
});
const existingCache={
 async addAll(paths){for(const p of paths)cacheContents.set(new URL(p,scope).href,fakeResponse("precache:"+p));},
 async put(req,response){cachePuts.push(req.url);cacheContents.set(req.url,response);},
 async match(req){return cacheContents.get(typeof req==="string"?req:req.url)||undefined;}
};
const caches={
 async open(name){assert.match(name,/lama-coding-academy-v14/);return existingCache;},
 async match(req){return existingCache.match(req);},
 async keys(){return ["lama-coding-academy-v8","lama-school-suite-v1","lama-coding-academy-v14"];},
 async delete(name){cacheDeletes.push(name);return true;}
};
const self={
 location:{href:scope+"sw.js"},
 clients:{async claim(){return true;}},
 async skipWaiting(){return true;},
 addEventListener(type,fn){handlers[type]=fn;}
};
let networkFails=false,privateNext=false;
async function fetch(req){
 networkCalls.push(req.url);
 if(networkFails)throw Error("offline");
 return privateNext?fakeResponse("private",{"cache-control":"no-store"}):fakeResponse("network");
}
vm.runInNewContext(source,{self,caches,fetch,URL,Response:{error:()=>({ok:false})}});
assert.equal(typeof handlers.install,"function");
assert.equal(typeof handlers.activate,"function");
assert.equal(typeof handlers.fetch,"function");
function lifecycle(type){
 let pending=null;handlers[type]({waitUntil(p){pending=p;}});assert.ok(pending);
 return pending;
}
async function dispatch(url,options={}){
 const request={url,method:options.method||"GET",mode:options.mode||"cors",cache:options.cache||"default"};
 let result=null,intercepted=false;
 handlers.fetch({request,respondWith(p){intercepted=true;result=p;}});
 return {intercepted,reply:intercepted?await result:undefined};
}
(async()=>{
 await lifecycle("install");await lifecycle("activate");
 assert.deepEqual(cacheDeletes,["lama-coding-academy-v8"],"Other LAMA product caches must remain.");
 assert.ok(cacheContents.has(scope+"index.html"),"Homepage must be pre-cached.");
 assert.ok(cacheContents.has(scope+"account.html"),"Account UI cached as a static asset.");
 assert.ok(cacheContents.has(scope+"python-harness.py"),"Python harness cached for offline reading.");
 const before=cachePuts.length;
 const privateUrl=scope+"account.html?code=secret-one-time-token&flow=recovery";
 const q=await dispatch(privateUrl,{mode:"navigate"});
 assert.equal(q.intercepted,false,"Auth callback query must not be processed or cached by the service worker.");
 assert.equal(cacheContents.has(privateUrl),false);
 assert.equal(cachePuts.length,before);
 const logout=await dispatch(scope+"account.html?error_description=some-private-message",{mode:"navigate"});
 assert.equal(logout.intercepted,false);
 const dynamic=await dispatch(scope+"private-record.json");
 assert.equal(dynamic.intercepted,false,"Unknown path must not enter cache.");
 const posted=await dispatch(scope+"index.html",{method:"POST"});
 assert.equal(posted.intercepted,false);
 const external=await dispatch("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs");
 assert.equal(external.intercepted,false,"Third-party code must not be cached by this service worker.");
 const staticPage=await dispatch(scope+"index.html",{mode:"navigate"});
 assert.equal(staticPage.intercepted,true);
 assert.match(staticPage.reply.name,/precache/);
 assert.equal(cachePuts.length,before,"Already cached static pages must not re-download.");
 const missingPage=await dispatch(scope+"nonexistent.html",{mode:"navigate"});
 assert.equal(missingPage.intercepted,true,"Unknown navigations can load online.");
 assert.equal(missingPage.reply.name,"network");
 assert.equal(cacheContents.has(scope+"nonexistent.html"),false,"Unknown paths are never cached.");
 networkFails=true;
 const offline=await dispatch(scope+"not-a-page.html",{mode:"navigate"});
 assert.equal(offline.reply.name,"precache:./index.html","Offline navigation fallback must show cached homepage.");
 networkFails=false;
 privateNext=true;
 cacheContents.delete(scope+"diagnostics.js");
 const sensitiveHeader=await dispatch(scope+"diagnostics.js");
 assert.equal(sensitiveHeader.reply.name,"private");
 assert.equal(cacheContents.has(scope+"diagnostics.js"),false,"no-store response must not be cached.");
 privateNext=false;
 const ordinary=await dispatch(scope+"diagnostics.js");
 assert.equal(ordinary.reply.name,"network");
 assert.equal(cacheContents.get(scope+"diagnostics.js").name,"network","Normal static responses should reenter cache.");
 assert.equal(cachePuts.length,before+1);
 console.log("PASS: explicit static-only PWA cache, auth query bypass, no-store protection, offline fallback, non-interference with other LAMA caches.");
})().catch(error=>{console.error(error);process.exitCode=1;});
