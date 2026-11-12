/* Python Lab UI regression with real authored missions and a mocked worker transport.
 * Verifies first-use network consent, quiz completion, Urdu switching and editing resets.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,".."),read=name=>fs.readFileSync(path.join(root,name),"utf8");
const js=read("python-app.js"),lessonsJs=read("python-lessons.js"),translationJs=read("python-i18n.js");
new Function(js);
class E{
 constructor(id){this.id=id;this._text="";this._html="";this.value="";this.disabled=false;this.style={};this.className="";this.listeners={};this.children=[];this.dataset={};this.checked=false;}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text;}
 set innerHTML(value){this._html=String(value);}
 get innerHTML(){return this._html;}
 addEventListener(name,callback){this.listeners[name]=callback;}
 appendChild(child){this.children.push(child);}
 querySelector(){return null;}
}
const elements=new Map(),byId=id=>{if(!elements.has(id))elements.set(id,new E(id));return elements.get(id);};
const document={getElementById:byId,documentElement:{lang:"en"},createElement:tag=>new E(tag),querySelector:()=>new E("main")};
const storage=new Map();
const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const windowContext={addEventListener(){},scrollTo(){}};
vm.runInNewContext(lessonsJs,{window:windowContext});
vm.runInNewContext(translationJs,{window:windowContext});
const missions=windowContext.LAMA_PYTHON_MISSIONS,first=missions[0];
let consent=false,confirmCount=0,workerCreates=0,workerRuns=0,workerStops=0;
class Worker{
 constructor(url,opts){
  assert.equal(url,"./python-runner.mjs");assert.equal(opts.type,"module");workerCreates++;
 }
 terminate(){workerStops++;}
 postMessage(message){
  assert.equal(message.action,"run");workerRuns++;
  const tests=message.tests.map(t=>({label:t.label,pass:true,details:""}));
  this.onmessage({data:{id:message.id,type:"loading"}});
  this.onmessage({data:{id:message.id,type:"ready"}});
  this.onmessage({data:{id:message.id,type:"result",result:{
   stdout:"Large example output",stdout_truncated:true,
   stderr:"Short warning",stderr_truncated:true,error:"",
   results:tests,passed:true
  }}});
 }
}
vm.runInNewContext(js,{
 document,window:windowContext,localStorage,navigator:{connection:{saveData:true,effectiveType:"2g"},onLine:true},
 confirm(){confirmCount++;return consent;},
 Worker,setTimeout,clearTimeout,Date,URL,Blob,console
});
assert.equal(workerCreates,0,"No Python worker before explicit learner action.");
assert.equal(byId("editor").value,first.starter);
assert.equal(byId("run").disabled,false);
byId("run").listeners.click();
assert.equal(confirmCount,1,"First run must seek data-download consent.");
assert.equal(workerCreates,0,"Cancelled runtime download cannot start worker.");
assert.equal(workerRuns,0);
assert.equal(JSON.parse(storage.get("lama-python-executable-v1")).drafts[first.id],first.starter,"Cancelled load keeps code saved.");
consent=true;
byId("run").listeners.click();
assert.equal(confirmCount,2);
assert.equal(workerCreates,1);
assert.equal(workerRuns,1);
assert.match(byId("stdout").textContent,/first 4,000 characters shown/);
assert.match(byId("stdout").textContent,/Error output was truncated/);
assert.match(byId("feedback").textContent,/behavior tests passed/);
byId("options").listeners.change({target:{name:"answer",value:String(first.quiz.answer)}});
byId("complete").listeners.click();
let state=JSON.parse(storage.get("lama-python-executable-v1"));
assert.ok(state.passed[first.id],"Correct run and quiz should complete lesson.");
byId("run").listeners.click();
assert.equal(confirmCount,2,"After consent, other runs in the same page do not reprompt.");
assert.equal(workerCreates,1,"Runtime should be reused while page stays open.");
assert.equal(workerRuns,2);
byId("language").listeners.click();
state=JSON.parse(storage.get("lama-python-executable-v1"));
assert.equal(state.lang,"ur");
assert.equal(document.documentElement.lang,"ur");
assert.equal(byId("missionTitle").textContent,windowContext.LAMA_PYTHON_I18N.missions[first.id].title);
assert.equal(byId("editor").value,first.starter,"Urdu switch must preserve Python code.");
byId("editor").value=first.starter+"\n# new edit";
byId("editor").listeners.input();
state=JSON.parse(storage.get("lama-python-executable-v1"));
assert.equal(Boolean(state.passed[first.id]),false,"Editing source must revoke stale completion.");
assert.equal(state.drafts[first.id],byId("editor").value);
assert.equal(workerStops,0,"Editing source must not damage already completed idle worker.");
console.log("PASS: data-saving runtime consent, cancellation without download, learner draft persistence, bounded output notice, Python quiz gating and Urdu switching.");
