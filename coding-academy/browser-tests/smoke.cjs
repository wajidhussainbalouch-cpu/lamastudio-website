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
  assert.equal(first.drafts["intro-browser"],code);
  await page.reload();
  await page.locator('#nav button[data-screen="learn"]').click();
  await page.locator("#editor").waitFor();
  assert.equal(await page.locator("#editor").inputValue(),code);
  await page.locator('button[data-action="run"]').click();
  const src=await page.locator("#preview").getAttribute("srcdoc");
  assert.match(src,/Saved draft/);
  assert.match(src,/Content-Security-Policy/);
  // Complete a real authored foundation lesson using actual browser controls.
  await page.locator("#editor").fill("<!doctype html><html><body><h1>Hello, Browser!</h1></body></html>");
  await page.locator('input[name="quiz"][value="0"]').check();
  await page.locator('button[data-action="check"]').click();
  assert.match(await page.locator("#result").textContent(),/Lesson passed!/);
  const passed=await page.evaluate(()=>JSON.parse(localStorage.getItem("lama-coding-academy-v1")));
  assert.equal(typeof passed.progress["intro-browser"],"string","Passing a lesson should save a completion timestamp.");
  await page.goto(insideApp(origin,"progress.html"));
  assert.equal((await page.locator("#total").textContent()).trim(),"1 / 62");
  assert.equal(pageErrors.length,0,"Unexpected JavaScript errors: "+pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("new learner glossary, ordered levels and line-specific mistake recovery",async(browser,origin)=>{
 const view=await browserPage(browser,{width:390,height:844});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"index.html"));
  await page.getByRole("heading",{name:/Before you code: what do these words mean/}).waitFor();
  assert.match(await page.locator("#languageGuide").textContent(),/HTML/);
  assert.match(await page.locator("#languageGuide").textContent(),/SQL/);
  await page.getByRole("button",{name:/Start my first lesson/}).click();
  await page.locator("#editor").waitFor();
  const menu=page.locator(".lesson-list button[data-action=lesson]");
  assert.equal(await menu.count(),22);
  assert.equal(await page.locator(".side-level").count(),3);
  assert.equal(await page.locator('button[data-action="lesson"][data-id="intro-browser"]').first().isEnabled(),true);
  assert.equal(await page.locator(".lesson-list button[data-id=intro-html]").isDisabled(),true);
  assert.equal(await page.locator(".lesson-list button[data-id=condition]").isDisabled(),true);
  // Reproduce the exact kind of error seen on the learner's Android screenshot.
  const broken='<!doctype html>\n<html>\n<body>\n<My name is a coder>\n<h1>Hello, Browser!</h1>\n</body>\n</html>';
  await page.locator("#editor").fill(broken);
  await page.waitForFunction(()=>document.querySelector("#codeHintSummary")?.textContent.includes("Line 4:"));
  assert.match(await page.locator("#codeHintSummary").textContent(),/not a common HTML tag/);
  assert.ok((await page.locator("#lineGutter .problem").count())>=1);
  await page.locator('#codeHintSummary button[data-line="4"]').click();
  assert.equal(await page.locator("#editor").evaluate(el=>el===document.activeElement),true);
  assert.match(await page.locator("#editor").evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd)),/<My name is a coder>/);
  await page.locator("#editor").fill(broken.replace("<My name is a coder>","<p>My name is a coder</p>"));
  await page.waitForFunction(()=>document.querySelector("#codeHintSummary")?.textContent.includes("No common typing mistakes"));
  assert.equal(await page.locator("#lineGutter .problem").count(),0);
  await page.locator('input[name="quiz"][value="0"]').check();
  await page.locator('button[data-action="check"]').click();
  assert.match(await page.locator("#result").textContent(),/Lesson passed!/);
  assert.equal(await page.locator(".lesson-list button[data-id=intro-html]").isEnabled(),true);
  await page.locator(".lesson-list button[data-id=intro-html]").click();
  await page.getByRole("heading",{name:/HTML: the skeleton of a page/}).waitFor();
  assert.equal(pageErrors.length,0,pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("mistake-based lesson guidance opens real unlocked lessons without bypassing stages",async(browser,origin)=>{
 const view=await browserPage(browser,{width:360,height:780});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"quiz.html"));
  await page.evaluate(()=>{
   const state=window.LAMA_QUESTION_CORE.createState(),bank=window.LAMA_CODING_QUESTIONS;
   window.LAMA_QUESTION_CORE.record(state,bank.items.find(q=>q.track==="html"&&q.level===1),false);
   window.LAMA_QUESTION_CORE.record(state,bank.items.find(q=>q.track==="sql"&&q.level===1),false);
   window.LAMA_QUESTION_CORE.save(localStorage,state);
  });
  await page.reload();
  await assertNoOverflow(page,"weak-area cards at 360px");
  assert.equal(await page.locator("#coachList .coach-card").count(),2);
  assert.match(await page.locator("#coachList").textContent(),/HTML/);
  assert.match(await page.locator("#coachList").textContent(),/SQL/);
  assert.equal(await page.locator("#missed").textContent(),"2");
  const htmlLink=page.locator('#coachList a[href="./index.html#lesson=intro-html"]');
  assert.equal(await htmlLink.count(),1);
  await htmlLink.click();
  await page.locator("#editor").waitFor();
  assert.match(await page.locator(".course-notice").textContent(),/still locked/i);
  assert.match(await page.getByRole("heading",{level:1}).last().textContent(),/What is a website/);
  await page.evaluate(()=>{
   const key="lama-coding-academy-v1",x=JSON.parse(localStorage.getItem(key)||"{}");
   x.progress={...(x.progress||{}),"intro-browser":true};
   localStorage.setItem(key,JSON.stringify(x));
  });
  await page.goto(insideApp(origin,"quiz.html"));
  await page.locator('#coachList a[href="./index.html#lesson=intro-html"]').click();
  await page.locator("#editor").waitFor();
  assert.match(await page.getByRole("heading",{level:1}).last().textContent(),/HTML: the skeleton of a page/);
  await page.goto(insideApp(origin,"quiz.html"));
  await page.locator("#track").selectOption("html");
  await page.locator("#start").click();
  const item=await page.evaluate(()=>{
   const prompt=document.getElementById("prompt").textContent;
   return window.LAMA_CODING_QUESTIONS.items.find(x=>x.prompt===prompt);
  });
  if(item.mode==="build"){
   for(const index of [...item.answer].reverse())
    await page.locator('#options button[data-token="'+index+'"]').click();
  }else{
   const wrong=(item.answer+1)%item.options.length;
   await page.locator('#options button[data-choice="'+wrong+'"]').click();
  }
  await page.locator("#check").click();
  const help=page.locator("#feedback a.learn-link");
  assert.equal(await help.count(),1);
  assert.ok((await help.getAttribute("href")).startsWith("./index.html#lesson="));
  assert.match(await page.locator("#feedback").textContent(),/Useful next step/);
  await assertNoOverflow(page,"question feedback learning link");
  assert.equal(pageErrors.length,0,"JavaScript errors: "+pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("original question bank: ten-question coding round, explanations, missed review, offline retention",async(browser,origin)=>{
 const view=await browserPage(browser,{width:390,height:844});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"quiz.html"));
  await page.getByRole("heading",{name:/Learn coding, one small question/}).waitFor();
  assert.equal(await page.locator("#answered").textContent(),"0");
  assert.equal(await page.locator('#track option').count(),6);
  assert.equal(await page.locator('#level option').count(),3);
  const count=await page.evaluate(()=>window.LAMA_CODING_QUESTIONS.items.length);
  assert.equal(count,150);
  await assertNoOverflow(page,"150 question bank mobile");
  await page.locator("#track").selectOption("html");
  await page.locator("#start").click();
  await page.locator("#play").waitFor();
  let firstMissedId=null,build=0,predict=0;
  for(let i=0;i<10;i++){
   const item=await page.evaluate(()=>{
    const text=document.getElementById("prompt").textContent;
    const q=window.LAMA_CODING_QUESTIONS.items.find(x=>x.prompt===text);
    if(!q)throw Error("Question not found in real authored catalog: "+text);
    return q;
   });
   if(item.mode==="build"){
    build++;
    const offered=await page.locator("#options button[data-token]").evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.token)));
    assert.equal(offered.length,item.parts.length);
    assert.equal(new Set(offered).size,item.parts.length);
    assert.equal(item.answer.every((token,n)=>offered[n]===token),false,
      "Tap-to-build puzzle pieces must arrive shuffled, not pre-solved.");
    if(item.example)assert.equal(await page.locator("#example").isHidden(),true,
      "The full example must not reveal a code-building answer before submission.");
    const answerIndices=i===0?[...item.answer].reverse():item.answer;
    for(const pos of answerIndices)await page.locator('#options button[data-token="'+pos+'"]').click();
   }else{
    if(item.mode==="predict")predict++;
    await page.locator('#options button[data-choice="'+(i===0?(item.answer+1)%item.options.length:item.answer)+'"]').click();
   }
   if(i===0)firstMissedId=item.id;
   await page.locator("#check").click();
   await page.locator("#feedback").waitFor();
   assert.match(await page.locator("#feedback").textContent(),/Correct answer:/);
   if(i===0)assert.match(await page.locator("#feedback").textContent(),/Not quite/);
   else assert.match(await page.locator("#feedback").textContent(),/Correct!/);
   await page.locator("#next").click();
  }
  assert.ok(build>=1,"A beginner round must contain at least one code-building puzzle.");
  assert.ok(predict>=1,"A beginner round must include at least one output/behavior prediction.");
  assert.equal(await page.locator("#score").textContent(),"9 / 10");
  assert.equal(await page.locator("#answered").textContent(),"10");
  assert.equal(await page.locator("#missed").textContent(),"1");
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("lama-coding-questions-v1")));
  assert.equal(stored.stats[firstMissedId].attempts,1);
  assert.equal(stored.stats[firstMissedId].correct,0);
  assert.equal(stored.history.at(-1).score,9);
  assert.equal(await page.evaluate(()=>localStorage.getItem("lama-coding-academy-v1")),null,
    "Question practice must not touch the core 62-activity learner store.");
  await page.locator("#reviewAfter").click();
  assert.equal(await page.locator("#prompt").textContent(),
   await page.evaluate(id=>window.LAMA_CODING_QUESTIONS.items.find(x=>x.id===id).prompt,firstMissedId),
   "The next review round should start with the missed question.");
  // A correct retry removes the question from the live mistake list.
  const retry=await page.evaluate(id=>window.LAMA_CODING_QUESTIONS.items.find(x=>x.id===id),firstMissedId);
  if(retry.mode==="build"){
   for(const position of retry.answer)
    await page.locator('#options button[data-token="'+position+'"]').click();
  }else{
   await page.locator('#options button[data-choice="'+retry.answer+'"]').click();
  }
  await page.locator("#check").click();
  assert.match(await page.locator("#feedback").textContent(),/Correct!/);
  assert.equal(await page.locator("#missed").textContent(),"0",
    "A correctly answered mistake must leave the review queue.");
  await page.reload();
  assert.equal(await page.locator("#answered").textContent(),"11","Scores should persist after refresh.");
  assert.equal(await page.locator("#missed").textContent(),"0");
  await assertNoOverflow(page,"quiz bank after reload");
  assert.equal(pageErrors.length,0,"Unexpected quiz JavaScript errors: "+pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("question-score backup, erase, preview/cancel, restore and corrupt import",async(browser,origin)=>{
 const view=await browserPage(browser,{width:390,height:844});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"quiz.html"));
  await page.evaluate(()=>{
   const core=window.LAMA_QUESTION_CORE,bank=window.LAMA_CODING_QUESTIONS;
   const state=core.createState();
   core.record(state,bank.items[0],true);
   core.record(state,bank.items[1],false);
   core.record(state,bank.items[2],true);
   state.selection={track:"html",level:1};
   state.rounds["html-1"]=1;
   state.history.push({track:"html",level:1,score:2});
   core.save(localStorage,state);
   localStorage.setItem("lama-coding-academy-v1",'{"sentinel":"KEEP_LESSON_PROGRESS"}');
   localStorage.setItem("some-other-lama-product","KEEP_OTHER_PRODUCT");
  });
  await page.reload();
  assert.equal(await page.locator("#answered").textContent(),"3");
  assert.equal(await page.locator("#missed").textContent(),"1");
  const [download]=await Promise.all([
   page.waitForEvent("download"),
   page.locator("#quizExport").click()
  ]);
  assert.match(download.suggestedFilename(),/^lama-coding-question-scores-\d{4}-\d{2}-\d{2}\.json$/);
  const bytes=fs.readFileSync(await download.path());
  const exported=JSON.parse(bytes.toString("utf8"));
  assert.equal(exported.format,"lama-coding-questions-backup-v1");
  assert.equal(exported.version,1);
  assert.equal(Object.keys(exported.state.stats).length,3);
  assert.equal(exported.state.history.length,1);
  assert.equal(await page.locator("#quizBackupReview").textContent(),"","Backup is not pending before import.");
  page.on("dialog",dialog=>dialog.accept());
  await page.locator("#quizBackupSection details summary").click();
  await page.locator("#quizClear").click();
  assert.equal(await page.locator("#answered").textContent(),"0");
  assert.equal(await page.evaluate(()=>localStorage.getItem("lama-coding-academy-v1")),
   '{"sentinel":"KEEP_LESSON_PROGRESS"}');
  assert.equal(await page.evaluate(()=>localStorage.getItem("some-other-lama-product")),"KEEP_OTHER_PRODUCT");
  const file={name:"lama-coding-question-scores-demo.json",mimeType:"application/json",buffer:bytes};
  await page.locator("#quizBackupFile").setInputFiles(file);
  await page.waitForFunction(()=>!document.getElementById("quizConfirm").disabled);
  assert.match(await page.locator("#quizBackupReview").textContent(),/Selected backup: 3 checked answers/);
  assert.match(await page.locator("#quizBackupReview").textContent(),/Current on this phone: 0 checked answers/);
  assert.equal(await page.locator("#answered").textContent(),"0","Preview must not write local scores.");
  await page.locator("#quizCancel").click();
  assert.equal(await page.locator("#answered").textContent(),"0");
  assert.equal(await page.locator("#quizConfirm").isDisabled(),true);
  await page.locator("#quizBackupFile").setInputFiles(file);
  await page.waitForFunction(()=>!document.getElementById("quizConfirm").disabled);
  await page.locator("#quizConfirm").click();
  assert.equal(await page.locator("#answered").textContent(),"3");
  assert.equal(await page.locator("#missed").textContent(),"1");
  await page.reload();
  assert.equal(await page.locator("#answered").textContent(),"3","Restored scores must survive refresh.");
  assert.equal(await page.locator("#track").inputValue(),"html");
  assert.equal(await page.evaluate(()=>localStorage.getItem("some-other-lama-product")),"KEEP_OTHER_PRODUCT");
  await page.locator("#quizBackupFile").setInputFiles({
   name:"not-an-academy-backup.json",mimeType:"application/json",buffer:Buffer.from('{"format":"other-app"}')
  });
  await page.waitForFunction(()=>document.getElementById("quizBackupStatus").textContent.includes("Backup rejected"));
  assert.equal(await page.locator("#quizConfirm").isDisabled(),true);
  assert.equal(await page.locator("#answered").textContent(),"3");
  assert.equal(pageErrors.length,0,"Unexpected quiz backup browser error: "+pageErrors.join(" | "));
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
  assert.equal((await page.locator("#total").textContent()).trim(),"1 / 62");
  assert.equal(await page.locator("#modules article").count(),4);
  await page.goto(insideApp(origin,"practice.html"));
  assert.ok(await page.locator("#challengeMenu button").count()>=6);
  await page.goto(insideApp(origin,"studio.html"));
  assert.equal(await page.locator("#projectCards").locator("button,article").count()>0,true);
  assert.equal(pageErrors.length,0,pageErrors.join(" | "));
 }finally{await cleanup(view);}
});
test("complete academy backup of five stores and independent restoration",async(browser,origin)=>{
 const view=await browserPage(browser,{width:390,height:844});
 try{
  const {page,pageErrors}=view;
  await page.goto(insideApp(origin,"progress.html"));
  await assertNoOverflow(page,"complete backup interface at phone width");
  const snapshot={
   "lama-coding-academy-v1":{goal:"web",name:"Test learner",progress:{"intro-browser":true},
    drafts:{"intro-browser":"<h1>Offline demo</h1>"},quiz:{"intro-browser":0},lastLesson:"intro-browser"},
   "lama-coding-practice-v2":{track:"js",selected:{js:"js-fee"},passed:{"js-fee":true},drafts:{"js-fee":"let total = 42;"}},
   "lama-python-executable-v1":{selected:"pyx-greetings",drafts:{"pyx-greetings":"print('Hi')"},answers:{},passed:{},lang:"ur"},
   "lama-coding-project-studio-v1":{project:"school",lang:"en",steps:{school:1},
    code:{school:"<h1>Demo</h1>"},checks:{},reflection:{school:"Only fake test notes"}}
  };
  const quizData=await page.evaluate(records=>{
   for(const [key,value] of Object.entries(records))localStorage.setItem(key,JSON.stringify(value));
   const core=window.LAMA_QUESTION_CORE,data=window.LAMA_CODING_QUESTIONS;
   const q=core.createState();
   core.record(q,data.items[0],true);core.record(q,data.items[1],false);
   q.rounds["html-1"]=1;
   q.history.push({track:"html",level:1,score:1});
   q.selection={track:"html",level:1};
   core.save(localStorage,q);
   localStorage.setItem("separate-lama-product","DO_NOT_DELETE_OTHER_PROJECT");
   return q;
  },snapshot);
  await page.reload();
  assert.equal((await page.locator("#total").textContent()).trim(),"2 / 62");
  const [download]=await Promise.all([page.waitForEvent("download"),page.locator("#completeExport").click()]);
  assert.match(download.suggestedFilename(),/^lama-coding-academy-COMPLETE-[0-9-]+\.json$/);
  const fileBytes=fs.readFileSync(await download.path());
  const file=JSON.parse(fileBytes.toString("utf8"));
  assert.equal(file.format,"lama-coding-academy-complete-v1");
  assert.equal(file.version,1);
  assert.equal(file.questionBackup.format,"lama-coding-questions-backup-v1");
  for(const [key,value] of Object.entries(snapshot)){
   const moduleId={"lama-coding-academy-v1":"foundation","lama-coding-practice-v2":"practice",
    "lama-python-executable-v1":"python","lama-coding-project-studio-v1":"studio"}[key];
   assert.deepEqual(file.modules[moduleId],value,"Course data must survive complete export.");
  }
  assert.equal(file.questionBackup.state.stats["html-1-01"].correct,1);
  assert.equal(file.questionBackup.state.stats["html-1-02"].lastCorrect,false);
  // Confirm an explicit erase deletes exactly the five learner stores.
  page.on("dialog",dialog=>dialog.accept());
  await page.goto(insideApp(origin,"account.html"));
  await page.locator("#clearLocal").click();
  assert.match(await page.locator("#eraseStatus").textContent(),/Device learning data erased/);
  const keys=[...Object.keys(snapshot),"lama-coding-questions-v1"];
  const cleared=await page.evaluate(all=>all.map(k=>localStorage.getItem(k)),keys);
  assert.deepEqual(cleared,[null,null,null,null,null]);
  assert.equal(await page.evaluate(()=>localStorage.getItem("separate-lama-product")),
   "DO_NOT_DELETE_OTHER_PROJECT");
  await page.goto(insideApp(origin,"progress.html"));
  assert.equal((await page.locator("#total").textContent()).trim(),"0 / 62");
  const uploaded={name:"lama-academy-COMPLETE-test.json",mimeType:"application/json",buffer:fileBytes};
  await page.locator("#completeFile").setInputFiles(uploaded);
  await page.waitForFunction(()=>!document.getElementById("completeConfirm").disabled);
  assert.match(await page.locator("#completeReview").textContent(),/Selected backup: 2 \/ 62/);
  assert.match(await page.locator("#completeReview").textContent(),/Selected question practice: 2 answers checked/);
  assert.equal((await page.locator("#total").textContent()).trim(),"0 / 62","Preview must not write any progress.");
  await page.locator("#completeCancel").click();
  assert.equal((await page.locator("#total").textContent()).trim(),"0 / 62");
  await page.locator("#completeFile").setInputFiles(uploaded);
  await page.waitForFunction(()=>!document.getElementById("completeConfirm").disabled);
  await page.locator("#completeConfirm").click();
  assert.match(await page.locator("#completeStatus").textContent(),/all four courses and question scores/i);
  assert.equal((await page.locator("#total").textContent()).trim(),"2 / 62");
  const restored=await page.evaluate(all=>{
   const out={};for(const key of all)out[key]=JSON.parse(localStorage.getItem(key));return out;
  },keys);
  for(const [key,value] of Object.entries(snapshot))
   assert.deepEqual(restored[key],value,"All saved course records must be exact on restore.");
  assert.deepEqual(restored["lama-coding-questions-v1"],quizData,
   "Answered questions, mistake flags and completed quiz rounds must restore.");
  assert.equal(await page.evaluate(()=>localStorage.getItem("separate-lama-product")),
   "DO_NOT_DELETE_OTHER_PROJECT");
  // A malformed complete file must be rejected before writing anything.
  await page.locator("#completeFile").setInputFiles({
   name:"untrusted.json",mimeType:"application/json",buffer:Buffer.from("{bad json")
  });
  await page.waitForFunction(()=>document.getElementById("completeStatus").textContent.includes("rejected"));
  assert.equal(await page.locator("#completeConfirm").isDisabled(),true);
  assert.equal((await page.locator("#total").textContent()).trim(),"2 / 62");
  assert.equal(pageErrors.length,0,"Browser errors: "+pageErrors.join(" | "));
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
  assert.equal((await page.locator("#total").textContent()).trim(),"3 / 62");
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
  assert.equal((await page.locator("#total").textContent()).trim(),"0 / 62");
  const file={name:"lama-test-progress.json",mimeType:"application/json",buffer:content};
  await page.locator("#file").setInputFiles(file);
  await page.waitForFunction(()=>!document.getElementById("confirm").disabled);
  assert.equal(await page.locator("#confirm").isEnabled(),true);
  assert.match(await page.locator("#restoreReview").textContent(),/Backup file: 3 \/ 62/);
  assert.equal((await page.locator("#total").textContent()).trim(),"0 / 62","Preview must not write data.");
  await page.locator("#cancel").click();
  assert.equal((await page.locator("#total").textContent()).trim(),"0 / 62");
  await page.locator("#file").setInputFiles(file);
  await page.waitForFunction(()=>!document.getElementById("confirm").disabled);
  assert.equal(await page.locator("#confirm").isEnabled(),true);
  await page.locator("#confirm").click();
  assert.match(await page.locator("#status").textContent(),/restored successfully/);
  assert.equal((await page.locator("#total").textContent()).trim(),"3 / 62");
  const restored=await page.evaluate(keys=>Object.fromEntries(
   keys.map(key=>[key,JSON.parse(localStorage.getItem(key))])
  ),Object.keys(snapshot));
  assert.deepEqual(restored,snapshot,"All four modules must match the downloaded backup.");
  assert.equal(await page.evaluate(()=>localStorage.getItem("separate-lama-product")),"KEEP_OTHER_PROJECT_UNCHANGED");
  await page.locator("#file").setInputFiles({
   name:"bad.json",mimeType:"application/json",buffer:Buffer.from("{not-json")
  });
  assert.equal(await page.locator("#confirm").isDisabled(),true);
  await page.waitForFunction(()=>document.getElementById("status").textContent.includes("Backup rejected"));
  assert.match(await page.locator("#status").textContent(),/Backup rejected/);
  assert.equal((await page.locator("#total").textContent()).trim(),"3 / 62");
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
  for(const target of ["index.html","quiz.html","practice.html","python.html","studio.html","progress.html","account.html","privacy.html","diagnostics.html"]){
   await page.goto(insideApp(origin,target));
   await page.locator("body").waitFor();
   await assertNoOverflow(page,target);
  }
  // Repeat at a narrower Android viewport to catch clipped menu/action rows.
  await page.setViewportSize({width:360,height:780});
  for(const target of ["index.html","quiz.html","python.html","practice.html","studio.html","account.html","progress.html"]){
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
 await auditAccessibility(browser,origin,["index.html","quiz.html","practice.html","python.html","studio.html"]);
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
  assert.match((await page.locator("#total").textContent()).trim(),/\/ 62/);
  await page.goto(insideApp(origin,"quiz.html"));
  await page.getByRole("heading",{name:/Learn coding, one small question/}).waitFor();
  assert.equal(await page.evaluate(()=>window.LAMA_CODING_QUESTIONS.items.length),150);
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
