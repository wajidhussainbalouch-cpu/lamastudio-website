'use strict';
/* Offline tests of the public paper registry; no browser or network dependency. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=__dirname;
const store=new Map();
const localStorage={
 getItem:key=>store.has(key)?store.get(key):null,
 setItem:(key,value)=>store.set(key,String(value)),
 removeItem:key=>store.delete(key)
};
const context={window:{},localStorage,URLSearchParams,location:{search:'?job=teaching:1'}};
for(const name of ['jobs.js','job-catalog-ui.js','papers.js','papers/headmaster-02-part1.js','papers/headmaster-02-part2.js','papers/headmaster-02-part3.js','papers/headmaster-02-part4.js','papers/headmaster-02-register.js','paper-library.js']){
 vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),context,{timeout:1500,filename:name});
}
const registry=context.window.LamaPpscPaperLibrary;
assert.ok(registry,'paper registry exposed');
assert.equal(registry.list().length,2,'both original free practice papers are available');
assert.equal(registry.forJob('teaching:0').length,2);
assert.equal(registry.forJob('teaching:1').length,2,'school-head variants share the approved foundation set');
assert.equal(registry.coverage('teaching:0').reduce((sum,item)=>sum+item.count,0),200,'published subject coverage matches bank');
assert.equal(registry.coverage('information-officer').length,0,'unpublished track must not show MCQs');
assert.equal(registry.forJob('information-officer').length,0,'do not substitute Headmaster exam for another job');
assert.equal(registry.activePaper().id,'DEMO-01');
context.location.search='?job=teaching:0&paper=HM-2026-P02';
assert.equal(registry.activePaper().id,'HM-2026-P02','Paper 2 deep link selects correct 100 questions');
assert.equal(registry.activePaper().questions.length,100);
context.location.search='?job=teaching:1&paper=HM-2026-P02';
assert.equal(registry.activePaper().id,'HM-2026-P02','senior headteacher can choose Paper 2');
context.location.search='?job=information-officer&paper=DEMO-01';
assert.equal(registry.activePaper(),null,'cross-job paper link must be rejected');
const base=context.window.LAMA_PPSC_PAPERS[0];
const candidate={id:'INFO-01',title:'Information Officer draft',jobIds:['information-officer'],minutes:90,questions:base.questions,access:'free',publishStatus:'draft',reviewStatus:'editorial-draft'};
context.window.LAMA_PPSC_PAPERS.push(candidate);
assert.equal(registry.forJob('information-officer').length,0,'editorial draft must remain unpublished');
candidate.publishStatus='public';candidate.reviewStatus='approved';candidate.access='premium';
assert.equal(registry.forJob('information-officer').length,0,'paid bank must never be exposed from public JS');
candidate.access='free';
assert.equal(registry.forJob('information-officer').length,1,'approved public paper auto-appears under the matching job');
assert.equal(registry.coverage('information-officer').reduce((sum,item)=>sum+item.count,0),100,'new job coverage registered automatically');
context.location.search='?job=information-officer&paper=INFO-01';
assert.equal(registry.activePaper().id,'INFO-01','job-specific paper URL resolves');
assert.equal(registry.progress(base).state,'not-started');
localStorage.setItem('lama_ppsc_attempt_DEMO-01',JSON.stringify({startedAt:Date.now(),submitted:false,answers:{}}));
assert.equal(registry.progress(base).state,'in-progress','unfinished exam remains resumable');
localStorage.removeItem('lama_ppsc_attempt_DEMO-01');
localStorage.setItem('lama_ppsc_history_v1',JSON.stringify([{paperId:'DEMO-01',id:'a1',submittedAt:Date.now(),total:100,correct:78}]));
assert.equal(registry.progress(base).state,'completed','completed score is visible in paper library');
assert.equal(registry.progress(base).last.correct,78,'existing history is preserved');
localStorage.setItem('lama_ppsc_attempt_DEMO-01',JSON.stringify({startedAt:Date.now(),submitted:false}));
assert.equal(registry.progress(base).state,'in-progress','retake can resume while old history remains completed');
localStorage.removeItem('lama_ppsc_attempt_DEMO-01');
localStorage.setItem('lama_ppsc_history_cleared_at',String(Date.now()+1));
assert.equal(registry.progress(base).state,'not-started','cleared history must not appear in paper badges');
console.log('Job-wise paper library checks: all passed');
