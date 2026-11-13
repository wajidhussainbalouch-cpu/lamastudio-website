/* Question practice export/import safety and cross-test-app portability.
 * Run: node coding-academy/tests/quiz-backup.test.cjs
 */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),env={window:{},TextEncoder};
for(const file of ["quiz-data.js","quiz-core.js","quiz-backup.js"]){
 const content=fs.readFileSync(path.join(root,file),"utf8");
 new Function(content);
 vm.runInNewContext(content,env);
}
const data=env.window.LAMA_CODING_QUESTIONS,core=env.window.LAMA_QUESTION_CORE,b=env.window.LAMA_QUIZ_BACKUP;
assert.equal(b.FORMAT,"lama-coding-questions-backup-v1");
const storeMap=new Map(),store={
 getItem:key=>storeMap.has(key)?storeMap.get(key):null,
 setItem:(key,value)=>storeMap.set(key,String(value)),
 removeItem:key=>storeMap.delete(key)
};
store.setItem("lama-coding-academy-v1",JSON.stringify({secret:"DO_NOT_TOUCH_LESSONS"}));
store.setItem("lama-coding-project-studio-v1",JSON.stringify({secret:"DO_NOT_TOUCH_PROJECTS"}));
store.setItem("other-lama-product","OTHER_APP_MUST_REMAIN");
const state=core.createState();
const q1=data.items[0],q2=data.items[1];
core.record(state,q1,false);core.record(state,q2,true);
state.rounds["html-1"]=2;
state.history.push({track:"html",level:1,score:9});
state.selection={track:"html",level:1};
assert.equal(core.save(store,state),true);
const snapshot=store.getItem(core.KEY);
const exportJson=b.exportData(store,data);
const parsed=JSON.parse(exportJson);
assert.equal(parsed.format,b.FORMAT);
assert.equal(parsed.bankVersion,1);
assert.equal(parsed.state.stats[q1.id].lastCorrect,false);
assert.equal(parsed.state.stats[q2.id].lastCorrect,true);
assert.equal(parsed.state.history[0].score,9);
assert.ok(b.textBytes(exportJson)<b.MAX_BYTES);
const imported=b.importData(exportJson,data);
assert.equal(core.totals(data,imported.state).answered,2);
assert.equal(core.totals(data,imported.state).missed,1);
assert.equal(store.getItem(core.KEY),snapshot,"Preview/parsing must never write to localStorage.");
store.removeItem(core.KEY);
assert.equal(core.totals(data,core.load(store,data)).answered,0);
b.restore(store,imported.state);
const restored=core.load(store,data);
assert.equal(core.totals(data,restored).answered,2);
assert.equal(core.totals(data,restored).correct,1);
assert.equal(core.totals(data,restored).missed,1);
assert.equal(restored.selection.track,"html");
assert.equal(store.getItem("other-lama-product"),"OTHER_APP_MUST_REMAIN");
assert.match(store.getItem("lama-coding-academy-v1"),/DO_NOT_TOUCH_LESSONS/);
assert.match(store.getItem("lama-coding-project-studio-v1"),/DO_NOT_TOUCH_PROJECTS/);
const invalid=[
 ["not JSON","{invalid"],
 ["wrong magic",JSON.stringify({...parsed,format:"lama-coding-academy-backup-v1"})],
 ["future version",JSON.stringify({...parsed,version:2})],
 ["wrong bank",JSON.stringify({...parsed,bankVersion:500})],
 ["oversized"," ".repeat(b.MAX_BYTES+1)],
 ["unrecognized ID",JSON.stringify({...parsed,state:{...parsed.state,stats:{"unknown-question":{attempts:1,correct:1,lastCorrect:true}}}})],
 ["bad counters",JSON.stringify({...parsed,state:{...parsed.state,stats:{[q1.id]:{attempts:2,correct:5,lastCorrect:true}}}})],
 ["invalid latest status",JSON.stringify({...parsed,state:{...parsed.state,stats:{[q1.id]:{attempts:2,correct:1,lastCorrect:"yes"}}}})],
 ["bad round key",JSON.stringify({...parsed,state:{...parsed.state,rounds:{"../../attack":3}}})],
 ["oversized history",JSON.stringify({...parsed,state:{...parsed.state,history:Array.from({length:21},()=>({track:"html",level:1,score:5}))}})],
 ["non-array history",JSON.stringify({...parsed,state:{...parsed.state,history:{score:7}}})],
 ["unknown top-level field",JSON.stringify({...parsed,state:{...parsed.state,adminPassword:"nope"}})],
 ["prototype key",JSON.stringify({...parsed,state:{...parsed.state,stats:JSON.parse('{"__proto__":{"attempts":1,"correct":1,"lastCorrect":true}}')}})]
];
for(const [label,content] of invalid){
 assert.throws(()=>b.importData(content,data),undefined,"Reject "+label);
 assert.equal(core.totals(data,core.load(store,data)).answered,2,"Invalid preview cannot change existing scores");
}
const damagedLocal="{bad JSON";
store.setItem(core.KEY,damagedLocal);
assert.throws(()=>b.exportData(store,data),/unreadable/i);
assert.equal(store.getItem(core.KEY),damagedLocal,"Broken local JSON stays untouched instead of being exported as zero.");
store.setItem(core.KEY,snapshot);
const before=store.getItem(core.KEY);
const brokenStorage={setItem(){throw Error("Browser quota exceeded");}};
assert.throws(()=>b.restore(brokenStorage,imported.state),/quota/i);
assert.equal(store.getItem(core.KEY),before,"Failed storage write must not remove or alter actual record.");
console.log("PASS: portable 150-question backups, strict schema/size guards, non-mutating preview, exact restore and unrelated-LAMA data isolation.");
