/* LAMA Coding Academy: shared local/cloud snapshot logic.
 * No network access, credentials or automatic sync in this file.
 */
(function(root){
"use strict";
const FORMAT="lama-coding-academy-cloud-v2";
const LIMIT=240000;
const QUIZ_KEY="lama-coding-questions-v1";
const PARTS=[
 {id:"foundation",key:"lama-coding-academy-v1",label:"Foundations",total:22},
 {id:"practice",key:"lama-coding-practice-v2",label:"Industry practice",total:18},
 {id:"python",key:"lama-python-executable-v1",label:"Real Python",total:10},
 {id:"studio",key:"lama-coding-project-studio-v1",label:"Project Studio",total:12}
];
const SCHEMA={
 foundation:{goal:"string",name:"string",progress:"object",drafts:"object",quiz:"object",lastLesson:"string"},
 practice:{track:"string",selected:"object",passed:"object",drafts:"object"},
 python:{selected:"string",drafts:"object",answers:"object",passed:"object",lang:"string"},
 studio:{project:"string",lang:"string",steps:"object",code:"object",checks:"object",reflection:"object"}
};
const FOUNDATION=["intro-browser","intro-html","intro-tags","intro-css","intro-js","intro-debug","h1","p","link","semantic","css","layout","variable","click","functions","array","form-fields","condition","objects","capstone","access","portfolio"];
const PRACTICE=["js-fee","js-attendance","js-passing","js-stock","js-search","js-label","sql-select","sql-filter","sql-order","sql-stock","sql-count","sql-sum","py-print","py-variable","py-function","py-condition","py-loop","py-dictionary"];
const PYTHON=["pyx-greetings","pyx-fees","pyx-grades","pyx-attendance","pyx-stock","pyx-average","pyx-clean","pyx-absent","pyx-grade-label","pyx-report"];
const PROJECT_STEPS={
 school:["navigation","programs","responsive","contact"],
 fees:["calculate","inputs","output","validate"],
 attendance:["count","absent","summary","records"]
};
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
function questionState(value){
 if(value===null)return null;
 if(!plain(value))throw Error("Question scores must be an object.");
 const keys=["stats","rounds","history","selection"];
 if(Object.keys(value).length!==4||Object.keys(value).some(k=>!keys.includes(k))||
  !plain(value.stats)||!plain(value.rounds)||!Array.isArray(value.history)||!plain(value.selection))
  throw Error("Invalid question-score fields.");
 if(Object.keys(value.stats).length>150)throw Error("Too many question scores.");
 const validNumber=(n,max=10000)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
 for(const [id,row] of Object.entries(value.stats)){
  if(!/^(?:html|css|javascript|python|sql)-[123]-(?:0[1-9]|10)$/.test(id)||!plain(row)||
   !validNumber(row.attempts)||!validNumber(row.correct,row.attempts)||
   (row.lastCorrect!==undefined&&typeof row.lastCorrect!=="boolean")||
   Object.keys(row).some(k=>!["attempts","correct","lastCorrect"].includes(k)))
   throw Error("Invalid question score entry.");
 }
 if(Object.keys(value.rounds).length>18)throw Error("Too many round counters.");
 for(const [key,n] of Object.entries(value.rounds)){
  if(!/^(?:mixed|html|css|javascript|python|sql)-[123]$/.test(key)||!validNumber(n))
   throw Error("Invalid question round count.");
 }
 if(value.history.length>20||value.history.some(row=>!plain(row)||
   !["mixed","html","css","javascript","python","sql"].includes(row.track)||
   !validNumber(row.level,3)||row.level===0||!validNumber(row.score,10)||
   Object.keys(row).some(k=>!["track","level","score"].includes(k))))
   throw Error("Invalid question round history.");
 if(!["mixed","html","css","javascript","python","sql"].includes(value.selection.track)||
   !validNumber(value.selection.level,3)||value.selection.level===0||
   Object.keys(value.selection).some(k=>!["track","level"].includes(k)))
   throw Error("Invalid question selection.");
 return value;
}
function validValue(x,depth){
 if(depth>6)return false;
 if(x===null||typeof x==="boolean")return true;
 if(typeof x==="number")return Number.isFinite(x);
 if(typeof x==="string")return x.length<=90000;
 if(Array.isArray(x))return x.length<=40&&x.every(v=>validValue(v,depth+1));
 if(plain(x)){
  const pairs=Object.entries(x);
  return pairs.length<=80&&pairs.every(([k,v])=>k.length<=100&&!["__proto__","constructor","prototype"].includes(k)&&validValue(v,depth+1));
 }
 return false;
}
function validateModule(id,value){
 if(value===null)return null;
 if(!plain(value))throw Error(id+": expected object or null.");
 const rules=SCHEMA[id];if(!rules)throw Error("Unknown module: "+id);
 if(Object.keys(value).length>Object.keys(rules).length)throw Error(id+": unexpected keys.");
 for(const [k,v] of Object.entries(value)){
  if(!Object.hasOwn(rules,k)||typeof v!==rules[k]||(rules[k]==="object"&&!plain(v))||!validValue(v,0)){
   throw Error(id+": invalid field "+k+".");
  }
 }
 return value;
}
function sizeOf(value){return new TextEncoder().encode(JSON.stringify(value)).length;}
function validate(snapshot){
 if(!plain(snapshot)||snapshot.format!==FORMAT||snapshot.version!==2||!plain(snapshot.modules)||!Object.hasOwn(snapshot,"questions")||Object.keys(snapshot).some(k=>!["format","version","modules","questions"].includes(k))){
  throw Error("Unsupported Coding Academy cloud backup.");
 }
 const keys=Object.keys(snapshot.modules);
 if(keys.length!==PARTS.length||PARTS.some(p=>!Object.hasOwn(snapshot.modules,p.id)))throw Error("A backup must include all four academy modules.");
 for(const part of PARTS)validateModule(part.id,snapshot.modules[part.id]);
 questionState(snapshot.questions);
 if(sizeOf(snapshot)>LIMIT)throw Error("This backup exceeds the 200 KB cloud limit; download it locally instead.");
 return snapshot;
}
function read(storage){
 const modules={};
 for(const part of PARTS){
  const raw=storage.getItem(part.key);
  if(raw===null){modules[part.id]=null;continue;}
  let parsed;
  try{parsed=JSON.parse(raw);}catch(e){throw Error("Cannot sync invalid local "+part.label+" data.");}
  modules[part.id]=validateModule(part.id,parsed);
 }
 let questions=null;
 const raw=storage.getItem(QUIZ_KEY);
 if(raw!==null){try{questions=JSON.parse(raw);}catch(e){throw Error("Cannot sync unreadable local question scores.");}}
 return validate({format:FORMAT,version:2,modules,questions});
}
function apply(storage,snapshot){
 const s=validate(snapshot);
 const before=[...PARTS.map(p=>({key:p.key,value:storage.getItem(p.key)})),{key:QUIZ_KEY,value:storage.getItem(QUIZ_KEY)}];
 try{
  for(const part of PARTS){
   const data=s.modules[part.id];
   if(data===null)storage.removeItem(part.key);
   else storage.setItem(part.key,JSON.stringify(data));
  }
  if(s.questions===null)storage.removeItem(QUIZ_KEY);
  else storage.setItem(QUIZ_KEY,JSON.stringify(s.questions));
 }catch(error){
  let rollbackOk=true;
  for(const entry of before){
   try{
    if(entry.value===null)storage.removeItem(entry.key);
    else storage.setItem(entry.key,entry.value);
   }catch(e){rollbackOk=false;}
  }
  throw Error(rollbackOk?"Cloud restore failed. Previous local data was restored.":"Restore failed, and some local data could not be rolled back. Use your downloaded backup.");
 }
}
function counts(snapshot){
 const s=validate(snapshot),m=s.modules;
 const done=[
  FOUNDATION.filter(id=>Boolean(m.foundation?.progress?.[id])).length,
  PRACTICE.filter(id=>m.practice?.passed?.[id]===true).length,
  PYTHON.filter(id=>plain(m.python?.passed?.[id])).length,
  Object.entries(PROJECT_STEPS).reduce((n,[p,steps])=>n+steps.filter(st=>m.studio?.checks?.[p]?.[st]?.reviewed===true).length,0)
 ];
 return {items:PARTS.map((p,i)=>({id:p.id,label:p.label,done:done[i],total:p.total})),done:done.reduce((a,b)=>a+b,0),total:62};
}
root.LAMA_CODING_CLOUD_CORE=Object.freeze({format:FORMAT,maxBytes:LIMIT,parts:PARTS,quizKey:QUIZ_KEY,read,validate,apply,counts,sizeOf});
})(typeof window!=="undefined"?window:globalThis);
