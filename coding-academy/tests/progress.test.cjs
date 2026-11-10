/* Run: node coding-academy/tests/progress.test.cjs
 * Check aggregation, English/Urdu coverage, and explicit backup/restore protection.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const base=path.join(__dirname,"..");
const read=x=>fs.readFileSync(path.join(base,x),"utf8");
const foundationHtml=read("index.html"),practice=read("practice.js"),progress=read("progress.js");
const python=read("python-app.js"),pythonPage=read("python.html"),pythonI18n=read("python-i18n.js"),pythonLessons=read("python-lessons.js"),studioData=read("projects-data.js");
new Function(progress);new Function(python);new Function(pythonI18n);
assert.match(pythonPage,/python-i18n\.js/);
assert.match(python,/byId\("language"\)\.addEventListener/);
const windowData={};
vm.runInNewContext(studioData,{window:windowData});
vm.runInNewContext(pythonLessons,{window:windowData});
vm.runInNewContext(pythonI18n,{window:windowData});
const projects=windowData.LAMA_STUDIO_PROJECTS;
const missions=windowData.LAMA_PYTHON_MISSIONS;
const i18n=windowData.LAMA_PYTHON_I18N;
assert.equal(missions.length,10);
assert.equal(Object.keys(i18n.missions).length,10);
assert.ok(i18n.ui.en&&i18n.ui.ur);
for(const mission of missions){
  const ur=i18n.missions[mission.id];
  assert.ok(ur,mission.id+" needs Urdu coaching");
  for(const field of ["title","topic","concept","task","purpose","question"]){
    assert.ok(typeof ur[field]==="string"&&ur[field].length>=(field==="topic"?3:7),mission.id+" missing Urdu "+field);
  }
  assert.equal(ur.options.length,mission.quiz.options.length);
}
const foundationMatch=foundationHtml.match(/var lessons=\[([\s\S]*?)\];\s*var defaults/);
assert.ok(foundationMatch,"Foundation lesson catalog available");
const foundations=[...foundationMatch[1].matchAll(/\bid:'([^']+)'/g)].map(x=>x[1]);
assert.equal(foundations.length,12);
const practiceMatch=practice.match(/const tracks=\{([\s\S]*?)\};\s*const safe=/);
assert.ok(practiceMatch,"Practice lesson catalog available");
const exercises=[...practiceMatch[1].matchAll(/\bid:'([^']+)'/g)].map(x=>x[1]);
assert.equal(exercises.length,18);
assert.equal(projects.reduce((s,p)=>s+p.steps.length,0),12);
const memory=new Map();
const save=(key,obj)=>memory.set(key,JSON.stringify(obj));
const progressAll=Object.fromEntries(foundations.map(id=>[id,true]));
const practiceAll=Object.fromEntries(exercises.map(id=>[id,true]));
const pythonAll=Object.fromEntries(missions.map(m=>[m.id,{at:"2026-11-10"}]));
const studioAll=Object.fromEntries(projects.map(p=>[p.id,Object.fromEntries(p.steps.map(s=>[s.id,{reviewed:true,checkedAt:"2026-11-10"}]))]));
save("lama-coding-academy-v1",{goal:"web",name:"Test Learner",progress:progressAll,drafts:{},quiz:{},lastLesson:"h1"});
save("lama-coding-practice-v2",{track:"js",selected:{js:"js-fee"},passed:practiceAll,drafts:{}});
save("lama-python-executable-v1",{selected:missions[0].id,drafts:{},answers:{},passed:pythonAll,lang:"ur"});
save("lama-coding-project-studio-v1",{project:projects[0].id,lang:"ur",steps:{},code:{},checks:studioAll,reflection:{}});
class Element{
  constructor(){this.textContent="";this.innerHTML="";this.disabled=false;this.hidden=false;this.value="";this.className="";this.style={};this.handlers={};this.attributes={};this.files=[];}
  addEventListener(type,fn){this.handlers[type]=fn;}
  setAttribute(k,v){this.attributes[k]=v;}
  click(){this.clicked=true;}
  fire(name){assert.ok(this.handlers[name]);return this.handlers[name]();}
}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
let lastBlob;
const document={getElementById:get,createElement:()=>new Element(),body:{appendChild(){}}};
const localStorage={
 getItem:k=>memory.has(k)?memory.get(k):null,
 setItem:(k,v)=>memory.set(k,String(v)),
 removeItem:k=>memory.delete(k)
};
windowData.addEventListener=()=>{};
const context={document,window:windowData,navigator:{},localStorage,
  Blob,URL:{createObjectURL(blob){lastBlob=blob;return "blob:testing";},revokeObjectURL(){}},
  setTimeout(){},Date,confirm:()=>true,console};
vm.runInNewContext(progress,context);
assert.equal(get("total").textContent,"52 / 52");
assert.equal(get("overall").attributes["aria-valuenow"],"100");
(async()=>{
  get("export").fire("click");
  assert.ok(lastBlob,"Must create a downloadable backup blob");
  const backup=JSON.parse(await lastBlob.text());
  assert.equal(backup.format,"lama-coding-academy-backup-v1");
  assert.equal(backup.modules.python.lang,"ur");
  assert.equal(Object.keys(backup.modules).length,4);
  assert.equal(get("status").className,"message ok");
  const replacement={...backup,createdAt:"2026-11-10T00:00:00Z",modules:{
    foundation:{goal:"web",name:"Test Learner",progress:{h1:true},drafts:{},quiz:{},lastLesson:"h1"},
    practice:null,python:null,studio:null
  }};
  get("file").files=[{size:5000,text:async()=>JSON.stringify(replacement)}];
  await get("file").fire("change");
  assert.equal(get("confirm").disabled,false);
  assert.equal(get("previewSection").hidden,false);
  assert.equal(get("total").textContent,"52 / 52","No changes before explicit confirmation");
  get("cancel").fire("click");
  assert.equal(get("total").textContent,"52 / 52","Cancel preserves progress");
  get("file").files=[{size:5000,text:async()=>JSON.stringify(replacement)}];
  await get("file").fire("change");
  get("confirm").fire("click");
  assert.equal(get("total").textContent,"1 / 52","Confirmed restore updates counts");
  assert.equal(localStorage.getItem("lama-python-executable-v1"),null);
  assert.equal(JSON.parse(localStorage.getItem("lama-coding-academy-v1")).progress.h1,true);
  // Malformed and suspicious backups must not change storage.
  const bad={...backup,modules:{...backup.modules,python:{passed:[]}}};
  get("file").files=[{size:2000,text:async()=>JSON.stringify(bad)}];
  await get("file").fire("change");
  assert.equal(get("confirm").disabled,true);
  assert.equal(get("total").textContent,"1 / 52");
  const huge={...backup,modules:{...backup.modules,python:{drafts:{x:"A".repeat(90001)}}}};
  get("file").files=[{size:2500,text:async()=>JSON.stringify(huge)}];
  await get("file").fire("change");
  assert.equal(get("confirm").disabled,true);
  assert.equal(get("total").textContent,"1 / 52");
  console.log("PASS: 52 activity counts, 10 Urdu Python translations, export, preview, cancel, confirm, malformed/oversized restore rejection.");
})().catch(error=>{console.error(error);process.exitCode=1;});
