/* Real Chromium smoke tests for LAMA Coding Academy.
 * Runs the checked-out repository on localhost; no production deployment,
 * external account, learner data, or remote testing service is used.
 * This complements, not replaces, physical Android and manual accessibility QA.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const http=require("node:http");
const {chromium}=require("playwright");

const ROOT=path.resolve(__dirname,"../..");
const APP="/coding-academy/";
const MIME={
 ".html":"text/html; charset=utf-8",
 ".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",
 ".webmanifest":"application/manifest+json; charset=utf-8",
 ".svg":"image/svg+xml",
 ".css":"text/css; charset=utf-8",
 ".py":"text/plain; charset=utf-8",
 ".txt":"text/plain; charset=utf-8"
};
const tests=[];
function test(name,run){tests.push({name,run});}
function serve(){
 const server=http.createServer((req,res)=>{
  let url;
  try{url=new URL(req.url,"http://localhost");}catch(e){res.writeHead(400).end();return;}
  let pathname;
  try{pathname=decodeURIComponent(url.pathname);}catch(e){res.writeHead(400).end();return;}
  const requested=path.resolve(ROOT,"."+pathname);
  if(requested!==ROOT&&!requested.startsWith(ROOT+path.sep)){
   res.writeHead(403).end();return;
  }
  let file=requested;
  try{
   if(fs.statSync(file).isDirectory())file=path.join(file,"index.html");
   const stat=fs.statSync(file);
   if(!stat.isFile())throw Error("Not a regular file.");
   const extension=path.extname(file);
   if(!Object.hasOwn(MIME,extension)){res.writeHead(404).end();return;}
   res.writeHead(200,{
    "content-type":MIME[extension],
    "content-length":stat.size,
    "x-content-type-options":"nosniff",
    "cache-control":"public, max-age=0"
   });
   fs.createReadStream(file).pipe(res);
  }catch(e){res.writeHead(404,{"content-type":"text/plain"}).end("Not found");}
 });
 return new Promise((resolve,reject)=>{
  server.once("error",reject);
  server.listen(0,"127.0.0.1",()=>{
   server.off("error",reject);
   resolve({server,origin:"http://127.0.0.1:"+server.address().port});
  });
 });
}
function insideApp(origin,relative){return origin+APP+relative;}
async function browserPage(browser,viewport,allowServiceWorkers=false){
 const context=await browser.newContext({
  viewport,
  deviceScaleFactor:viewport.width<500?2:1,
  isMobile:viewport.width<500,
  hasTouch:viewport.width<500,
  serviceWorkers:allowServiceWorkers?"allow":"block",
  acceptDownloads:true
 });
 const page=await context.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error.message||error)));
 return {page,context,pageErrors};
}
async function assertNoOverflow(page,label){
 const info=await page.evaluate(()=>({
  width:document.documentElement.scrollWidth,
  viewport:window.innerWidth,
  body:document.body.scrollWidth
 }));
 assert.ok(info.width<=info.viewport+2,label+" horizontal overflow: "+JSON.stringify(info));
}
async function cleanup(view){
 if(view)await view.context.close();
}
test("desktop lessons and local draft persistence",async(browser,origin)=>{
 const view=await browserPage(browser,{width:1280,height:800});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"index.html"));
  await page.getByRole("button",{name:/Start my first lesson/}).click();
  await page.locator("#editor").waitFor();
  assert.ok((await page.locator("#editor").inputValue()).length>0);
  const code="<!doctype html><html><head><title>Demo</title></head><body><h1>Saved draft</h1></body></html>";
  await page.locator("#editor").fill(code);
  const first=await page.evaluate(()=>JSON.parse(localStorage.getItem("lama-coding-academy-v1")));
  assert.equal(first.drafts.h1,code);
  await page.reload();
  await page.locator('#nav button[data-screen="learn"]').click();
  await page.locator("#editor").waitFor();
  assert.equal(await page.locator("#editor").inputValue(),code);
  await page.locator('button[data-action="run"]').click();
  const src=await page.locator("#preview").getAttribute("srcdoc");
  assert.match(src,/Saved draft/);
  assert.match(src,/Content-Security-Policy/);
  // Complete a real authored foundation lesson using actual browser controls.
  await page.locator("#editor").fill("<!doctype html><html><body><h1>Hello, Developer!</h1></body></html>");
  await page.locator('input[name="quiz"][value="0"]').check();
  await page.locator('button[data-action="check"]').click();
  assert.match(await page.locator("#result").textContent(),/Lesson passed!/);
  const passed=await page.evaluate(()=>JSON.parse(localStorage.getItem("lama-coding-academy-v1")));
  assert.equal(typeof passed.progress.h1,"string","Passing a lesson should save a completion timestamp.");
  await page.goto(insideApp(origin,"progress.html"));
  assert.equal((await page.locator("#total").textContent()).trim(),"1 / 52");
  assert.equal(pageErrors.length,0,"Unexpected JavaScript errors: "+pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("browser progress totals and module navigation",async(browser,origin)=>{
 const view=await browserPage(browser,{width:1280,height:800});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"index.html"));
  await page.evaluate(()=>localStorage.setItem("lama-coding-academy-v1",JSON.stringify({
   goal:"web",name:"",progress:{h1:true},drafts:{},quiz:{},lastLesson:"h1"
  })));
  await page.goto(insideApp(origin,"progress.html"));
  await page.locator("#total").waitFor();
  assert.equal((await page.locator("#total").textContent()).trim(),"1 / 52");
  assert.equal(await page.locator("#modules article").count(),4);
  await page.goto(insideApp(origin,"practice.html"));
  assert.ok(await page.locator("#challengeMenu button").count()>=6);
  await page.goto(insideApp(origin,"studio.html"));
  assert.equal(await page.locator("#projectCards").locator("button,article").count()>0,true);
  assert.equal(pageErrors.length,0,pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("full backup, local erasure, review and verified restore",async(browser,origin)=>{
 const view=await browserPage(browser,{width:390,height:844});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"progress.html"));
  const snapshot={
   "lama-coding-academy-v1":{
    goal:"web",name:"Browser test learner",progress:{h1:true},
    drafts:{h1:"<h1>Private demonstration draft</h1>"},quiz:{h1:0},lastLesson:"h1"
   },
   "lama-coding-practice-v2":{
    track:"js",selected:{js:"js-fee"},passed:{"js-fee":true},
    drafts:{"js-fee":"const invoice = 42;"}
   },
   "lama-python-executable-v1":{
    selected:"pyx-greetings",drafts:{"pyx-greetings":"def greet(name):\n    return 'Hello ' + name"},
    answers:{},passed:{},lang:"ur"
   },
   "lama-coding-project-studio-v1":{
    project:"school",lang:"en",steps:{school:1},code:{school:"<h1>Demo school</h1>"},
    checks:{school:{navigation:{reviewed:true,checkedAt:"2026-11-12T00:00:00Z"}}},
    reflection:{school:"An invented test project, not actual school data"}
   }
  };
  await page.evaluate(stores=>{
    for(const [key,value] of Object.entries(stores))localStorage.setItem(key,JSON.stringify(value));
    localStorage.setItem("separate-lama-product","KEEP_OTHER_PROJECT_UNCHANGED");
  },snapshot);
  await page.reload();
  assert.equal((await page.locator("#total").textContent()).trim(),"3 / 52");
  const [download]=await Promise.all([
   page.waitForEvent("download"),
   page.locator("#export").click()
  ]);
  assert.match(download.suggestedFilename(),/^lama-coding-academy-progress-[0-9-]+\.json$/);
  const content=fs.readFileSync(await download.path());
  const backup=JSON.parse(content.toString("utf8"));
  assert.equal(backup.format,"lama-coding-academy-backup-v1");
  for(const [key,value] of Object.entries(snapshot)){
    const moduleId={
     "lama-coding-academy-v1":"foundation","lama-coding-practice-v2":"practice",
     "lama-python-executable-v1":"python","lama-coding-project-studio-v1":"studio"
    }[key];
    assert.deepEqual(backup.modules[moduleId],value,"Download must contain the real "+moduleId+" saved state.");
  }
  assert.equal((await page.locator("#status").textContent()).includes("downloaded"),true);
  await page.goto(insideApp(origin,"account.html"));
  page.on("dialog",dialog=>dialog.accept());
  await page.locator("#clearLocal").click();
  assert.match(await page.locator("#eraseStatus").textContent(),/Device learning data erased/);
  const erased=await page.evaluate(keys=>keys.map(key=>localStorage.getItem(key)),Object.keys(snapshot));
  assert.deepEqual(erased,[null,null,null,null],"Local erasure must remove all four academy records.");
  assert.equal(await page.evaluate(()=>localStorage.getItem("separate-lama-product")),"KEEP_OTHER_PROJECT_UNCHANGED");
  await page.goto(insideApp(origin,"progress.html"));
  assert.equal((await page.locator("#total").textContent()).trim(),"0 / 52");
  const file={name:"lama-test-progress.json",mimeType:"application/json",buffer:content};
  await page.locator("#file").setInputFiles(file);
  await page.waitForFunction(()=>!document.getElementById("confirm").disabled);
  assert.equal(await page.locator("#confirm").isEnabled(),true);
  assert.match(await page.locator("#restoreReview").textContent(),/Backup file: 3 \/ 52/);
  assert.equal((await page.locator("#total").textContent()).trim(),"0 / 52","Preview must not write data.");
  await page.locator("#cancel").click();
  assert.equal((await page.locator("#total").textContent()).trim(),"0 / 52");
  await page.locator("#file").setInputFiles(file);
  await page.waitForFunction(()=>!document.getElementById("confirm").disabled);
  assert.equal(await page.locator("#confirm").isEnabled(),true);
  await page.locator("#confirm").click();
  assert.match(await page.locator("#status").textContent(),/restored successfully/);
  assert.equal((await page.locator("#total").textContent()).trim(),"3 / 52");
  const restored=await page.evaluate(keys=>Object.fromEntries(
   keys.map(key=>[key,JSON.parse(localStorage.getItem(key))])
  ),Object.keys(snapshot));
  assert.deepEqual(restored,snapshot,"All four modules must match the downloaded backup.");
  assert.equal(await page.evaluate(()=>localStorage.getItem("separate-lama-product")),"KEEP_OTHER_PROJECT_UNCHANGED");
  await page.locator("#file").setInputFiles({
   name:"bad.json",mimeType:"application/json",buffer:Buffer.from("{not-json")
  });
  assert.equal(await page.locator("#confirm").isDisabled(),true);
  assert.match(await page.locator("#status").textContent(),/Backup rejected/);
  assert.equal((await page.locator("#total").textContent()).trim(),"3 / 52");
  assert.equal(pageErrors.length,0,"Unexpected JavaScript errors: "+pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("guest account remains disabled and privacy visible",async(browser,origin)=>{
 const view=await browserPage(browser,{width:1280,height:800});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"account.html"));
  assert.equal(await page.locator("#authSubmit").isDisabled(),true);
  assert.equal(await page.locator("#upload").isDisabled(),true);
  assert.equal(await page.locator("#accountDeleteArea").isHidden(),true);
  await page.getByRole("link",{name:/Read how learning data is stored/}).click();
  await page.getByRole("heading",{name:/Your code, your progress/}).waitFor();
  assert.ok((await page.locator("body").textContent()).includes("اردو"));
  assert.equal(pageErrors.length,0,pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("Python consent saves draft without fetching interpreter",async(browser,origin)=>{
 const view=await browserPage(browser,{width:390,height:844});
 try{
  const {page,pageErrors}=view;
  let externalRequests=0,dialogs=0;
  page.on("request",request=>{
   if(request.url().includes("cdn.jsdelivr.net/pyodide"))externalRequests++;
  });
  page.on("dialog",async dialog=>{
   dialogs++;
   assert.equal(dialog.type(),"confirm");
   await dialog.dismiss();
  });
  await page.goto(insideApp(origin,"python.html"));
  await page.locator("#editor").waitFor();
  const code="def practice():\n    return 9\n";
  await page.locator("#editor").fill(code);
  await page.locator("#run").click();
  assert.equal(dialogs,1,"Python should ask permission before first large download");
  assert.equal(externalRequests,0,"Declining Python must not fetch WebAssembly CDN");
  assert.equal((await page.locator("#feedback").textContent()).includes("cancel"),true);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("lama-python-executable-v1")));
  assert.equal(stored.drafts["pyx-greetings"],code);
  await page.reload();
  await page.locator("#editor").waitFor();
  assert.equal(await page.locator("#editor").inputValue(),code);
  await page.locator("#language").click();
  assert.equal(await page.locator("html").getAttribute("lang"),"ur");
  await page.locator("#offlineAlternative").click();
  await page.locator("h1").waitFor();
  assert.ok(page.url().endsWith("/practice.html"));
  assert.equal(pageErrors.length,0,pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("phone-sized pages have navigable controls without horizontal overflow",async(browser,origin)=>{
 const view=await browserPage(browser,{width:390,height:844});
 try{
  const {page,pageErrors}=view;
  for(const target of ["index.html","practice.html","python.html","studio.html","progress.html","account.html","privacy.html","diagnostics.html"]){
   await page.goto(insideApp(origin,target));
   await page.locator("body").waitFor();
   await assertNoOverflow(page,target);
  }
  // Repeat at a narrower Android viewport to catch clipped menu/action rows.
  await page.setViewportSize({width:360,height:780});
  for(const target of ["index.html","python.html","practice.html","studio.html","account.html","progress.html"]){
   await page.goto(insideApp(origin,target));
   await assertNoOverflow(page,target+" at 360px");
  }
  assert.equal(pageErrors.length,0,pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("diagnostics exports no learner data",async(browser,origin)=>{
 const view=await browserPage(browser,{width:1280,height:800});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"index.html"));
  await page.evaluate(()=>localStorage.setItem("unrelated-private-info","SENTINEL_PRIVATE_NEVER_EXPORT"));
  await page.goto(insideApp(origin,"diagnostics.html"));
  await page.locator("#checks .check").first().waitFor();
  await page.waitForFunction(()=>document.querySelectorAll("#checks .check").length===8);
  const [download]=await Promise.all([
   page.waitForEvent("download"),
   page.locator("#export").click()
  ]);
  const data=JSON.parse(fs.readFileSync(await download.path(),"utf8"));
  assert.equal(data.checks.length,8);
  assert.deepEqual(Object.keys(data).sort(),["checks","pythonStatus","report","version"]);
  assert.ok(!JSON.stringify(data).includes("SENTINEL_PRIVATE_NEVER_EXPORT"));
  assert.equal(data.pythonStatus,"not-tested");
  assert.equal(pageErrors.length,0,pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
// Semantic and contrast checks use axe-core on a real rendered Chromium DOM.
// These do not substitute for manual screen-reader and physical phone audits.
async function auditAccessibility(browser,origin,pages){
 const view=await browserPage(browser,{width:390,height:844});
 try{
  const {page,pageErrors}=view;
  const problems=[];
  for(const target of pages){
   await page.goto(insideApp(origin,target));
   await page.addScriptTag({path:require.resolve("axe-core/axe.min.js")});
   const issues=await page.evaluate(async()=>{
    const output=await window.axe.run(document,{
      runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa"]}
    });
    return output.violations.filter(v=>v.impact==="critical"||v.impact==="serious")
      .map(v=>({id:v.id,impact:v.impact,targets:v.nodes.slice(0,4).map(n=>n.target.join(" "))}));
   });
   for(const item of issues)problems.push({page:target,...item});
   if(target==="privacy.html"){
    const scrollRegion=page.locator(".table-wrap");
    await scrollRegion.focus();
    assert.equal(await scrollRegion.evaluate(node=>document.activeElement===node),true,
      "A learner using only a keyboard must be able to focus the wide privacy table.");
    assert.ok(await scrollRegion.evaluate(node=>getComputedStyle(node).outlineStyle!=="none"),
      "Keyboard focus on the privacy table must be visible.");
   }
  }
  assert.deepEqual(problems,[],"Fix serious/critical WCAG audit findings:\n"+JSON.stringify(problems,null,2));
  assert.equal(pageErrors.length,0,pageErrors.join(" | "));
 }finally{await cleanup(view);}
}
test("WCAG browser audit: learning activities",async(browser,origin)=>{
 await auditAccessibility(browser,origin,["index.html","practice.html","python.html","studio.html"]);
});
test("WCAG browser audit: progress, privacy and account",async(browser,origin)=>{
 await auditAccessibility(browser,origin,["progress.html","account.html","privacy.html","diagnostics.html"]);
});
test("installed PWA serves offline pages without caching auth recovery queries",async(browser,origin)=>{
 const view=await browserPage(browser,{width:1280,height:800},true);
 try{
  const {page,context,pageErrors}=view;
  await page.goto(insideApp(origin,"diagnostics.html"));
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(async()=>Boolean(await navigator.serviceWorker.controller));
  await page.goto(insideApp(origin,"account.html?code=FAKE_TEST_TOKEN_NO_CREDENTIAL"));
  const containsToken=await page.evaluate(async()=>{
    const keys=await caches.keys();
    for(const key of keys){
      const cache=await caches.open(key);
      const all=await cache.keys();
      if(all.some(request=>request.url.includes("FAKE_TEST_TOKEN_NO_CREDENTIAL")))return true;
    }
    return false;
  });
  assert.equal(containsToken,false,"Service worker must not cache recovery query URLs");
  await context.setOffline(true);
  await page.goto(insideApp(origin,"progress.html"));
  await page.locator("#total").waitFor();
  assert.match((await page.locator("#total").textContent()).trim(),/\/ 52/);
  await page.goto(insideApp(origin,"diagnostics.html"));
  await page.getByRole("heading",{name:"Can this device learn to code?"}).waitFor();
  await context.setOffline(false);
  assert.equal(pageErrors.length,0,pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
(async()=>{
 let server=null,browser=null,failures=0;
 try{
  const running=await serve();server=running.server;
  browser=await chromium.launch({headless:true});
  for(const t of tests){
    const started=Date.now();
    let deadline=null;
    try{
      await Promise.race([
       t.run(browser,running.origin),
       new Promise((_,reject)=>{deadline=setTimeout(()=>reject(Error("Browser test exceeded 35 seconds")),35000);})
      ]);
      console.log("PASS "+t.name+" ("+(Date.now()-started)+"ms)");
    }catch(error){
      failures++;
      console.error("FAIL "+t.name+": "+String(error&&error.stack||error).slice(0,2000));
    }finally{
      if(deadline!==null)clearTimeout(deadline);
    }
  }
  if(failures)throw Error(failures+" of "+tests.length+" Chromium smoke tests failed.");
  console.log("PASS: "+tests.length+" real Chromium smoke tests on desktop/mobile viewport and offline PWA.");
 }catch(error){
  console.error(error&&error.stack||error);
  process.exitCode=1;
 }finally{
  if(browser)await browser.close().catch(()=>{});
  if(server)await new Promise(resolve=>server.close(resolve));
 }
})();
