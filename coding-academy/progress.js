/* LAMA Coding Academy — unified, local-only progress and portable backup.
 * Four independent module stores are summarized. There is no server request.
 */
(function(){
"use strict";
const FORMAT="lama-coding-academy-backup-v1";
const MODULES=[
  {key:"foundation",storage:"lama-coding-academy-v1",title:"Beginner Foundations",icon:"🌱",url:"./index.html",copy:"Start from zero: browser basics, HTML, CSS, JavaScript, debugging and mini apps.",total:22},
  {key:"practice",storage:"lama-coding-practice-v2",title:"Industry Practice",icon:"⚡",url:"./practice.html",copy:"JavaScript, SQL and Python syntax practice in small scenarios.",total:18},
  {key:"python",storage:"lama-python-executable-v1",title:"Executable Python",icon:"🐍",url:"./python.html",copy:"Run real Python functions and pass behavioral checks.",total:10},
  {key:"studio",storage:"lama-coding-project-studio-v1",title:"Project Studio",icon:"🏗️",url:"./studio.html",copy:"Create three practical projects through coached milestones.",total:12}
];
const FOUNDATION=["intro-browser","intro-html","intro-tags","intro-css","intro-js","intro-debug","h1","p","link","semantic","css","layout","variable","click","functions","array","form-fields","condition","objects","capstone","access","portfolio"];
const PRACTICE=["js-fee","js-attendance","js-passing","js-stock","js-search","js-label","sql-select","sql-filter","sql-order","sql-stock","sql-count","sql-sum","py-print","py-variable","py-function","py-condition","py-loop","py-dictionary"];
const PYTHON=Array.isArray(window.LAMA_PYTHON_MISSIONS)?window.LAMA_PYTHON_MISSIONS.map(x=>x.id):[];
const PROJECTS=Array.isArray(window.LAMA_STUDIO_PROJECTS)?window.LAMA_STUDIO_PROJECTS:[];
const byId=id=>document.getElementById(id);
const isRecord=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const parse=x=>{try{const parsed=JSON.parse(x);return isRecord(parsed)?parsed:null;}catch(e){return null;}};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function source(m){
 try{return parse(localStorage.getItem(m.storage));}catch(e){return null;}
}
function score(m,s){
 if(!isRecord(s))return 0;
 if(m.key==="foundation")return FOUNDATION.filter(id=>Boolean(isRecord(s.progress)&&s.progress[id])).length;
 if(m.key==="practice")return PRACTICE.filter(id=>isRecord(s.passed)&&s.passed[id]===true).length;
 if(m.key==="python")return PYTHON.filter(id=>isRecord(s.passed)&&isRecord(s.passed[id])).length;
 if(m.key==="studio"){
   return PROJECTS.reduce((sum,p)=>sum+p.steps.filter(st=>isRecord(s.checks)&&isRecord(s.checks[p.id])&&isRecord(s.checks[p.id][st.id])&&s.checks[p.id][st.id].reviewed===true).length,0);
 }
 return 0;
}
function collect(){
 return Object.fromEntries(MODULES.map(m=>[m.key,source(m)]));
}
function summary(snapshot){
 const rows=MODULES.map(m=>({key:m.key,title:m.title,total:m.total,done:score(m,snapshot[m.key]),url:m.url,icon:m.icon,copy:m.copy}));
 const done=rows.reduce((sum,r)=>sum+r.done,0),total=rows.reduce((sum,r)=>sum+r.total,0);
 return {rows,done,total};
}
function update(){
 const all=summary(collect()),percent=Math.round(all.done*100/all.total);
 byId("total").textContent=all.done+" / "+all.total;
 byId("overallFill").style.width=percent+"%";
 byId("overall").setAttribute("aria-valuenow",String(percent));
 byId("overallText").textContent=percent+"% completed";
 byId("modules").innerHTML=all.rows.map(r=>'<article class="card"><div class="cardtop"><span class="card-icon" aria-hidden="true">'+r.icon+'</span><span class="count">'+r.done+' / '+r.total+'</span></div><h3>'+esc(r.title)+'</h3><p>'+esc(r.copy)+'</p><div class="bar" role="progressbar" aria-label="'+esc(r.title)+' completion" aria-valuenow="'+Math.round(r.done/r.total*100)+'" aria-valuemin="0" aria-valuemax="100"><div style="width:'+Math.round(r.done/r.total*100)+'%"></div></div><a href="'+r.url+'">'+(r.done===r.total?'Review module →':'Continue learning →')+'</a></article>').join("");
 const next=all.rows.find(r=>r.done<r.total);
 byId("nextAction").textContent=next?'Continue '+next.title+' ('+next.done+'/'+next.total+'). Complete the next guided activity and check what you learned.':'You have marked all introductory activities completed. Continue improving each project with real-world testing and peer review.';
 byId("nextLinks").innerHTML='<a href="'+(next?next.url:"./studio.html")+'" style="font-weight:800"> '+(next?'Open '+esc(next.title):'Review portfolio projects')+' →</a><a href="./index.html">Academy home</a>';
}
function message(s,kind){
 const el=byId("status");el.className="message"+(kind?" "+kind:"");el.textContent=s;
}
const allowed={
 foundation:{goal:"string",name:"string",progress:"object",drafts:"object",quiz:"object",lastLesson:"string"},
 practice:{track:"string",selected:"object",passed:"object",drafts:"object"},
 python:{selected:"string",drafts:"object",answers:"object",passed:"object",lang:"string"},
 studio:{project:"string",lang:"string",steps:"object",code:"object",checks:"object",reflection:"object"}
};
function validPlainValue(v,depth){
 if(depth>5)return false;
 if(v===null||typeof v==="boolean")return true;
 if(typeof v==="string")return v.length<=90000;
 if(typeof v==="number")return Number.isFinite(v);
 if(Array.isArray(v))return v.length<=50&&v.every(x=>validPlainValue(x,depth+1));
 if(isRecord(v))return Object.keys(v).length<=80&&Object.entries(v).every(([k,x])=>k.length<=120&&!["__proto__","constructor","prototype"].includes(k)&&validPlainValue(x,depth+1));
 return false;
}
function validateModule(module,value){
 if(value===null)return null;
 if(!isRecord(value))throw Error(module.key+" must be an object or null.");
 const schema=allowed[module.key],keys=Object.keys(value);
 if(keys.length>Object.keys(schema).length+2)throw Error(module.key+" contains unexpected fields.");
 for(const [field,v] of Object.entries(value)){
   if(!Object.hasOwn(schema,field))throw Error(module.key+" has an unsupported field: "+field);
   if(typeof v!==schema[field]||(schema[field]==="object"&&!isRecord(v))||!validPlainValue(v,0))throw Error(module.key+" has invalid or oversized data in "+field+".");
 }
 return value;
}
function validateBackup(raw){
 if(!isRecord(raw)||raw.format!==FORMAT||!isRecord(raw.modules))throw Error("This is not a supported LAMA Coding Academy progress backup.");
 const keys=Object.keys(raw.modules);
 if(keys.length!==MODULES.length||MODULES.some(m=>!Object.hasOwn(raw.modules,m.key)))throw Error("The backup must contain all four learning modules.");
 return Object.fromEntries(MODULES.map(m=>[m.key,validateModule(m,raw.modules[m.key])]));
}
// Do not silently export a missing module when its local JSON is corrupt.
// A genuine first-time learner has no record (null); a damaged one must not be
// mistaken for a blank record that would erase work when restored elsewhere.
function validatedLocalBackupModules(){
 const result={};
 for(const module of MODULES){
   const raw=localStorage.getItem(module.storage);
   if(raw===null){result[module.key]=null;continue;}
   let parsed;
   try{parsed=JSON.parse(raw);}
   catch(error){throw Error(module.title+" has unreadable saved progress. Do not delete this browser's data; recover a trusted earlier backup.");}
   result[module.key]=validateModule(module,parsed);
 }
 return result;
}
function backup(){
 const modules=validatedLocalBackupModules();
 const object={format:FORMAT,version:1,createdAt:new Date().toISOString(),modules};
 const contents=JSON.stringify(object,null,2),blob=new Blob([contents],{type:"application/json;charset=utf-8"});
 if(blob.size>800000)throw Error("This backup exceeds the 800 KB restore limit. Please save smaller code drafts before exporting.");
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download="lama-coding-academy-progress-"+new Date().toISOString().slice(0,10)+".json";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 message("Your progress backup was downloaded. Keep it private: it contains code drafts and reflections.","ok");
}
let pending=null;
function resetPending(){
 pending=null;byId("previewSection").hidden=true;byId("restoreReview").textContent="";
 byId("confirm").disabled=true;byId("file").value="";
}
function previewRestore(obj){
 pending=validateBackup(obj);
 const info=summary(pending);
 const existing=summary(collect());
 byId("restoreInfo").textContent="Selected backup: "+(typeof obj.createdAt==="string"?obj.createdAt.slice(0,40):"date not recorded")+".";
 byId("restoreReview").textContent="Current device: "+existing.done+" / "+existing.total+" activities\nBackup file: "+info.done+" / "+info.total+" activities\n\n"+info.rows.map(r=>r.title+": "+r.done+" / "+r.total).join("\n");
 byId("previewSection").hidden=false;byId("confirm").disabled=false;
 message("The backup is valid. Review its numbers above before you confirm. No changes have been made yet.");
}
function restore(){
 if(!pending)return;
 if(!confirm("Replace all current academy progress and drafts with the selected backup? This cannot be undone unless you already downloaded a backup."))return;
 const previous=MODULES.map(m=>[m.storage,localStorage.getItem(m.storage)]);
 try{
   for(const m of MODULES){
     const data=pending[m.key];if(data===null)localStorage.removeItem(m.storage);
     else localStorage.setItem(m.storage,JSON.stringify(data));
   }
 }catch(error){
   for(const [key,value] of previous){
     try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch(e){}
   }
   message("Could not restore the backup. Existing progress was restored where storage permits. Free space or adjust browser storage settings, then retry.","error");
   return;
 }
 resetPending();update();message("Academy progress restored successfully. Reopen any learning module to load the saved work.","ok");
}
byId("export").addEventListener("click",()=>{
 try{backup();}catch(error){message("Backup could not be created. Existing learning data was not changed: "+String(error.message||error),"error");}
});
byId("import").addEventListener("click",()=>byId("file").click());
byId("file").addEventListener("change",async()=>{
 const file=byId("file").files?.[0];
 if(!file)return;
 resetPending();
 if(file.size>800000){message("Backup is larger than the 800 KB safety limit. Please select a valid academy backup.","error");return;}
 try{previewRestore(JSON.parse(await file.text()));}
 catch(error){resetPending();message("Backup rejected: "+String(error.message||error),"error");}
});
// Complete backup is additive; the original four-module backup still works.
const completeCore=window.LAMA_COMPLETE_BACKUP;
const quizCore=window.LAMA_QUIZ_BACKUP;
const questionBank=window.LAMA_CODING_QUESTIONS;
let pendingComplete=null,completeTicket=0;
function completeStatus(text,kind){
 const el=byId("completeStatus");
 el.textContent=text;
 el.className="message"+(kind?" "+kind:"");
}
function clearCompletePreview(){
 pendingComplete=null;
 byId("completePreview").hidden=true;
 byId("completeReview").textContent="";
 byId("completeConfirm").disabled=true;
 byId("completeFile").value="";
}
function requireComplete(){
 if(!completeCore||!quizCore||!questionBank)
  throw Error("The complete-backup components are not available. Reload the academy while online or reinstall the updated test app.");
}
function completeExport(){
 requireComplete();
 const modules=validatedLocalBackupModules();
 // Reject corrupt question scores; never silently replace them with blank data.
 const questionJson=quizCore.exportData(localStorage,questionBank);
 const json=completeCore.create(modules,questionJson);
 const blob=new Blob([json],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download="lama-coding-academy-COMPLETE-"+new Date().toISOString().slice(0,10)+".json";
 document.body.appendChild(link);link.click();link.remove();
 // Android's file-save picker reads the blob asynchronously.
 setTimeout(()=>URL.revokeObjectURL(url),6000);
 completeStatus("Complete backup download prepared. Confirm the file was saved in Android Files before replacing or uninstalling this app.","ok");
}
function renderCompletePreview(backup){
 const existing=summary(collect()),incoming=summary(backup.modules);
 const currentQuiz=window.LAMA_QUESTION_CORE.totals(questionBank,
   window.LAMA_QUESTION_CORE.load(localStorage,questionBank));
 const restoreQuiz=window.LAMA_QUESTION_CORE.totals(questionBank,backup.questions);
 byId("completeReview").textContent=
  "Current device: "+existing.done+" / "+existing.total+" course activities\n"+
  "Selected backup: "+incoming.done+" / "+incoming.total+" course activities\n"+
  "Current question practice: "+currentQuiz.answered+" answers checked; "+currentQuiz.missed+" mistakes\n"+
  "Selected question practice: "+restoreQuiz.answered+" answers checked; "+restoreQuiz.missed+" mistakes\n\n"+
  incoming.rows.map(r=>r.title+": "+r.done+" / "+r.total).join("\n")+
  "\n\nBackup date: "+backup.createdAt+
  "\nOnly these five learning records will change after you confirm.";
 byId("completePreview").hidden=false;
 byId("completeConfirm").disabled=false;
 completeStatus("Complete backup verified. Review the preview. Your saved work is unchanged until you confirm.");
}
byId("completeExport").addEventListener("click",()=>{
 try{completeExport();}
 catch(e){completeStatus("Download stopped safely: "+String(e.message||e)+". Your saved data was not changed.","error");}
});
byId("completeImport").addEventListener("click",()=>{
 completeTicket++;clearCompletePreview();byId("completeFile").click();
});
byId("completeFile").addEventListener("change",async()=>{
 const file=byId("completeFile").files?.[0];if(!file)return;
 const ticket=++completeTicket;
 clearCompletePreview();
 try{
  requireComplete();
  if(file.size>completeCore.MAX_BYTES)throw Error("File exceeds the 1.1 MB complete-backup size limit.");
  const text=await file.text();
  if(ticket!==completeTicket)return;
  pendingComplete=completeCore.parseText(text,validateBackup,quizCore,questionBank);
  renderCompletePreview(pendingComplete);
 }catch(e){
  if(ticket!==completeTicket)return;
  clearCompletePreview();
  completeStatus("Complete backup rejected: "+String(e.message||e)+". Nothing was changed.","error");
 }
});
byId("completeCancel").addEventListener("click",()=>{
 completeTicket++;clearCompletePreview();
 completeStatus("Complete restore cancelled. Nothing was changed.");
});
byId("completeConfirm").addEventListener("click",()=>{
 if(!pendingComplete||!completeCore)return;
 if(!confirm("Replace all FOUR course records AND the 150-question practice record on this device? Download your current complete backup first; this cannot be undone."))return;
 try{
  completeCore.restore(localStorage,MODULES,pendingComplete);
  completeTicket++;clearCompletePreview();update();
  completeStatus("Complete academy progress restored: all four courses and question scores. Reopen Practice Questions to see restored results.","ok");
 }catch(e){
  completeStatus("Complete restore failed: "+String(e.message||e),"error");
 }
});

byId("confirm").addEventListener("click",restore);
byId("cancel").addEventListener("click",()=>{resetPending();message("Restore cancelled. No data was changed.");});
update();
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
})();