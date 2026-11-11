/* Contract test: counts in the cloud backup MUST match real authored lesson catalogs.
 * Avoids hand-maintained fixtures that accidentally mask renamed milestone IDs.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const data={window:{}};
vm.runInNewContext(read("projects-data.js"),data);
vm.runInNewContext(read("python-lessons.js"),data);
vm.runInNewContext(read("cloud-core.js"),{window:data.window,TextEncoder});
const core=data.window.LAMA_CODING_CLOUD_CORE;
assert.ok(core&&core.counts,"Cloud core must be loadable");
const projects=data.window.LAMA_STUDIO_PROJECTS,py=data.window.LAMA_PYTHON_MISSIONS;
const foundationText=read("index.html"),practiceText=read("practice.js");
const foundationMatch=foundationText.match(/var lessons=\[([\s\S]*?)\];\s*var defaults/);
const practiceMatch=practiceText.match(/const tracks=\{([\s\S]*?)\};\s*const safe=/);
assert.ok(foundationMatch&&practiceMatch,"Lesson catalogs must be discoverable");
const idsFoundation=[...foundationMatch[1].matchAll(/\bid:'([^']+)'/g)].map(x=>x[1]);
const idsPractice=[...practiceMatch[1].matchAll(/\bid:'([^']+)'/g)].map(x=>x[1]);
const idsPython=py.map(x=>x.id);
const idsProjects=projects.flatMap(p=>p.steps.map(s=>p.id+"/"+s.id));
const lengths=[idsFoundation,idsPractice,idsPython,idsProjects].map(arr=>arr.length);
assert.deepEqual(lengths,[12,18,10,12],"Actual catalog activity totals must remain 52");
for(const ids of [idsFoundation,idsPractice,idsPython,idsProjects]){
 assert.equal(new Set(ids).size,ids.length,"No duplicated module/step IDs");
}
const modules={
 foundation:{goal:"web",name:"Test Learner",progress:{},drafts:{},quiz:{},lastLesson:idsFoundation[0]},
 practice:{track:"js",selected:{js:idsPractice[0]},drafts:{},passed:{}},
 python:{selected:idsPython[0],drafts:{},answers:{},passed:{},lang:"ur"},
 studio:{project:projects[0].id,lang:"ur",steps:{},code:{},checks:{},reflection:{}}
};
function snapshot(){return {format:core.format,version:1,modules:JSON.parse(JSON.stringify(modules))};}
function count(){return core.counts(snapshot());}
assert.equal(count().done,0,"Zero completions initially");
for(const id of idsFoundation)modules.foundation.progress[id]=true;
assert.equal(count().items[0].done,12,"Foundation IDs must match");
for(const id of idsPractice)modules.practice.passed[id]=true;
assert.equal(count().items[1].done,18,"Practice IDs must match");
for(const id of idsPython)modules.python.passed[id]={at:"2026-11-10"};
assert.equal(count().items[2].done,10,"Python IDs must match");
for(const p of projects){
 modules.studio.checks[p.id]={};
 for(const step of p.steps)modules.studio.checks[p.id][step.id]={reviewed:true,checkedAt:"2026-11-10"};
}
const full=count();
assert.equal(full.done,52,"All real lessons must reach 52/52");
assert.deepEqual(full.items.map(x=>x.done),[12,18,10,12]);
modules.studio.checks[projects[0].id][projects[0].steps[0].id].reviewed=false;
assert.equal(count().done,51,"An unreviewed portfolio milestone cannot be counted");
modules.studio.checks[projects[0].id][projects[0].steps[0].id].reviewed=true;
modules.practice.passed[idsPractice[3]]=false;
assert.equal(count().done,51,"A non-passing challenge cannot count");
modules.practice.passed[idsPractice[3]]=true;
modules.python.passed[idsPython[3]]=false;
assert.equal(count().done,51,"Python needs a completion object, not boolean");
modules.python.passed[idsPython[3]]={at:"2026-11-10"};
modules.foundation.progress[idsFoundation[3]]=false;
assert.equal(count().done,51,"Foundation needs a completed flag");
modules.foundation.progress[idsFoundation[3]]=true;
// Cloud serialized snapshot roundtrip must preserve all real catalog states.
const stored=new Map();
const browser={
 getItem:key=>stored.has(key)?stored.get(key):null,
 setItem:(key,value)=>stored.set(key,String(value)),
 removeItem:key=>stored.delete(key)
};
core.apply(browser,snapshot());
assert.equal(core.counts(core.read(browser)).done,52);
assert.equal(JSON.stringify(core.read(browser).modules.studio.checks),JSON.stringify(modules.studio.checks));
assert.equal(core.read(browser).modules.python.lang,"ur");
assert.equal(core.read(browser).modules.foundation.name,"Test Learner");
// A malicious unexpected root key or nested prototype mutation must be rejected.
const extra=snapshot();extra.modules.studio.admin=true;
assert.throws(()=>core.validate(extra),/unexpected keys|invalid field/);
const nested=snapshot();nested.modules.practice.drafts={safe:{"__proto__":"not allowed"}};
// A JSON parsed own __proto__ property is explicitly dangerous, and must be rejected.
nested.modules.practice.drafts={safe:JSON.parse('{"__proto__":{"isAdmin":true}}')};
assert.throws(()=>core.validate(nested),/invalid field/i);
console.log("PASS: Real 12+18+10+12 catalogs match cloud scoring, reviewed milestones, local backup roundtrip and malicious input rejection.");
