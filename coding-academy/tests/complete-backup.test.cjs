/* Full five-record portable backup, independent from cloud/app account tests.
 * Run: node coding-academy/tests/complete-backup.test.cjs
 */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const folder=path.join(__dirname,".."),read=x=>fs.readFileSync(path.join(folder,x),"utf8");
const env={window:{},TextEncoder};
for(const file of ["quiz-data.js","quiz-core.js","quiz-backup.js","complete-backup.js"]){
 const source=read(file);new Function(source);vm.runInNewContext(source,env);
}
const all=env.window,complete=all.LAMA_COMPLETE_BACKUP,quizBackup=all.LAMA_QUIZ_BACKUP,
 core=all.LAMA_QUESTION_CORE,catalog=all.LAMA_CODING_QUESTIONS;
const sections=[
 {key:"foundation",storage:"lama-coding-academy-v1"},
 {key:"practice",storage:"lama-coding-practice-v2"},
 {key:"python",storage:"lama-python-executable-v1"},
 {key:"studio",storage:"lama-coding-project-studio-v1"}
];
const modules={
 foundation:{goal:"web",name:"Test learner",progress:{h1:true},drafts:{h1:"<h1>Private demo</h1>"},quiz:{h1:0},lastLesson:"h1"},
 practice:{track:"js",selected:{js:"js-fee"},passed:{"js-fee":true},drafts:{"js-fee":"const amount=42;"}},
 python:{selected:"pyx-greetings",drafts:{"pyx-greetings":"print('Hello')"},answers:{},passed:{},lang:"en"},
 studio:{project:"school",lang:"en",steps:{school:1},code:{school:"<h1>School</h1>"},checks:{},reflection:{school:"Test only"}}
};
const memory=new Map(),storage={
 getItem:key=>memory.has(key)?memory.get(key):null,
 setItem:(key,value)=>memory.set(key,String(value)),
 removeItem:key=>memory.delete(key)
};
for(const section of sections)storage.setItem(section.storage,JSON.stringify(modules[section.key]));
storage.setItem("other-lama-project","UNCHANGED");
let qstate=core.createState();
core.record(qstate,catalog.items[0],true);
core.record(qstate,catalog.items[1],false);
qstate.history=[{track:"html",level:1,score:1}];
core.save(storage,qstate);
const questionBackupText=quizBackup.exportData(storage,catalog);
const text=complete.create(modules,questionBackupText);
assert.ok(complete.textBytes(text)<complete.MAX_BYTES);
const parsed=JSON.parse(text);
assert.equal(parsed.format,"lama-coding-academy-complete-v1");
assert.deepEqual(Object.keys(parsed.modules).sort(),Object.keys(modules).sort());
assert.equal(parsed.questionBackup.format,quizBackup.FORMAT);
const validateLegacy=raw=>{
 if(raw.format!=="lama-coding-academy-backup-v1")throw Error("Not a course backup");
 const names=sections.map(x=>x.key);
 if(!raw.modules||Object.keys(raw.modules).length!==names.length||names.some(k=>!Object.hasOwn(raw.modules,k)))
  throw Error("Missing four course module records");
 return Object.fromEntries(names.map(k=>[k,raw.modules[k]]));
};
const loaded=complete.parseText(text,validateLegacy,quizBackup,catalog);
assert.equal(loaded.modules.foundation.name,"Test learner");
assert.equal(core.totals(catalog,loaded.questions).answered,2);
const original=new Map(memory);
for(const key of sections.map(x=>x.storage))storage.removeItem(key);
storage.removeItem("lama-coding-questions-v1");
assert.equal(storage.getItem("other-lama-project"),"UNCHANGED");
complete.restore(storage,sections,loaded);
for(const section of sections)assert.deepEqual(JSON.parse(storage.getItem(section.storage)),modules[section.key]);
assert.equal(core.totals(catalog,core.load(storage,catalog)).missed,1);
assert.equal(storage.getItem("other-lama-project"),"UNCHANGED");
const invalid=[
 ["broken JSON","{not json"],
 ["wrong format",JSON.stringify({...parsed,format:"wrong"})],
 ["wrong version",JSON.stringify({...parsed,version:2})],
 ["missing questions",JSON.stringify({...parsed,questionBackup:undefined})],
 ["unknown module",JSON.stringify({...parsed,modules:{...parsed.modules,unexpected:{}}})],
 ["wrong question bank",JSON.stringify({...parsed,questionBackup:{...parsed.questionBackup,bankVersion:999}})],
 ["oversized file","x".repeat(complete.MAX_BYTES+1)],
 ["unknown top-level field",JSON.stringify({...parsed,token:"DO_NOT_IMPORT"})]
];
for(const [name,input] of invalid){
 assert.throws(()=>complete.parseText(input,validateLegacy,quizBackup,catalog),undefined,name);
 for(const [key,value] of original)assert.equal(storage.getItem(key),value,"No previous data changed after invalid input "+name);
}
const before=new Map(memory),brokenStorage={
 getItem:k=>storage.getItem(k),
 setItem(k,v){if(k==="lama-python-executable-v1")throw Error("Simulated storage quota");storage.setItem(k,v);},
 removeItem:k=>storage.removeItem(k)
};
const other={modules:{...loaded.modules,foundation:{...loaded.modules.foundation,name:"Changed"}},questions:loaded.questions};
assert.throws(()=>complete.restore(brokenStorage,sections,other),/Restore failed/i);
for(const [k,v] of before)assert.equal(storage.getItem(k),v,"Rollback must keep "+k+" intact");
assert.match(read("progress.html"),/id="completeExport"/);
assert.match(read("progress.html"),/id="completeConfirm"/);
assert.match(read("progress.html"),/complete-backup\.js/);
assert.match(read("progress.js"),/completeCore\.restore\(localStorage,MODULES,pendingComplete\)/);
console.log("PASS: portable 5-area academy backup, strict file checks, question records, transactional rollback and unrelated data isolation.");
