'use strict';
/* Six uploaded PPSC screenshots: one existing Bahawalpur and five added Kot Addu tracks.
 * Reusable papers deliberately repeat original MCQ source stems ACROSS jobs, not within
 * a generated paper or across the two variants of the same Junior Clerk job.
 * Run: node education-academy/test-kot-addu-shared-bank.cjs
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=__dirname;const win={};const errs=[];
const ctx={window:win,console:{log:console.log,warn:console.warn,error:(...x)=>errs.push(x.join(' '))}};
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const load=name=>vm.runInNewContext(read(name),ctx,{timeout:6000,filename:name});
const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
load('papers.js');
const html=read('index.html');
const scripts=[...html.matchAll(/<script src="\.\/(papers\/[^"]+\.js)" defer><\/script>/g)].map(m=>m[1]);
for(const script of scripts)load(script);
const base=win.LAMA_PPSC_PAPERS;
assert.equal(base.length,28,'Do not mutate the 28 original authored paper records');
assert.equal(base.reduce((n,p)=>n+p.questions.length,0),2800,'Existing paper content unchanged');
load('shared-paper-bank.js');
const generated=win.LAMA_PPSC_SHARED_PAPERS,audit=win.LAMA_PPSC_SHARED_BANK_AUDIT;
assert.equal(audit.status,'ready','Shared source availability: '+JSON.stringify(audit));
assert.deepEqual(JSON.parse(JSON.stringify(audit.juniorClerkPool)),{general:160,office:40});
assert.ok(audit.itPool>=100,'At least 100 distinct IT questions required');
assert.equal(generated.length,5,'Four Junior Clerk practice variants and one JCO IT paper');
assert.equal(base.length,28,'Composition cannot alter original source registry');
assert.equal(new Set([...base,...generated].map(p=>p.id)).size,33,'Every paper ID distinct');
const jobs=['junior-clerk-kot-addu-dc-bor','junior-clerk-kot-addu-adc-revenue-bor','junior-computer-operator-kot-addu-adc-bor'];
const allQuestionIds=new Set(base.flatMap(p=>p.questions.map(q=>q.id)));
const sourceById=new Map(base.flatMap(p=>p.questions.map(q=>[q.id,q])));
for(const paper of generated){
 assert.equal(paper.questions.length,100);
 assert.equal(paper.minutes,90);
 assert.equal(paper.sharedFromExistingQuestions,true);
 assert.equal(paper.newOriginalQuestionCount,0,'Reused questions are not new editorial bank records');
 assert.equal(new Set(paper.questions.map(q=>norm(q.q))).size,100,'No repetition inside generated paper');
 assert.equal(paper.jobIds.length,1);
 assert.ok(jobs.includes(paper.jobIds[0]),'No wrong job ID');
 for(const q of paper.questions){
  assert.ok(!allQuestionIds.has(q.id),'Duplicate answer-state ID across source/derived papers: '+q.id);
  allQuestionIds.add(q.id);
  const origin=sourceById.get(q.sourceQuestionId);
  assert.ok(origin,'Missing question provenance: '+q.id);
  assert.equal(q.q,origin.q,'Source stem changed without author review');
  assert.equal(q.options[q.answer],origin.options[origin.answer],'Rotated correct answer key changed: '+q.id);
  assert.equal(q.options.length,4);
  assert.equal(new Set(q.options.map(s=>String(s).trim())).size,4);
 }
}
for(const job of jobs.slice(0,2)){
 const papers=generated.filter(p=>p.jobIds[0]===job);
 assert.equal(papers.length,2,'Two published shared-bank papers per Junior Clerk job');
 const a=new Set(papers[0].questions.map(q=>q.sourceQuestionId));
 const b=new Set(papers[1].questions.map(q=>q.sourceQuestionId));
 assert.ok([...a].every(id=>!b.has(id)),'Paper 1 and 2 repeat source MCQs within the same job');
 for(const p of papers){
  const office=p.questions.filter(q=>q.subject==='MS Office and Computer Skills').length;
  assert.equal(office,20,'Exact 80 General Ability + 20 MS Office composition');
 }
}
const it=generated.find(p=>p.jobIds[0]===jobs[2]);
assert.ok(it,'Junior Computer Operator paper missing');
assert.equal(it.questions.length,100);
assert.ok(it.questions.every(q=>q.subject==='MS Office'||q.subject==='Information Technology'),'JCO paper must be 100% Office/IT');
const manifest=JSON.parse(read('PPSC_KOT_ADDU_ADDITIONAL_SYLLABI_2026.json'));
assert.equal(manifest.jobs.length,5,'Five newly supplied Kot Addu tracks; do not duplicate Bahawalpur');
assert.equal(manifest.existingSyllabusAlreadyRegistered.id,'junior-clerk-bahawalpur-bor');
assert.equal(manifest.jobs.filter(j=>j.assessmentType==='practical').length,2);
load('jobs.js');
const catalog=win.LAMA_PPSC_JOBS;
assert.equal(new Set(catalog.map(j=>j.id)).size,catalog.length,'No duplicate job IDs');
for(const entry of manifest.jobs){
 const job=catalog.find(j=>j.id===entry.id);
 assert.ok(job,'Job absent from global dropdown: '+entry.id);
 assert.equal(job.title,entry.title);
 assert.equal(job.caseNo,entry.caseNo);
 assert.equal(job.assessmentType,entry.assessmentType);
 assert.deepEqual(JSON.parse(JSON.stringify(job.syllabusEvidence.sections)),JSON.parse(JSON.stringify(entry.syllabusEvidence.sections)));
 if(job.assessmentType==='practical'){
  assert.equal(job.ready,false,'Shorthand skill tests are not fake MCQ exams');
  assert.ok(job.skillsPracticeUrl.startsWith('./stenography.html?job='));
 }else assert.equal(job.ready,true);
}
for(const file of ['index.html','print.html','answer-key.html','sw.js']){
 assert.ok(read(file).includes('shared-paper-bank.js'),file+' missing shared view');
}
assert.ok(read('paper-library.js').includes('window.LAMA_PPSC_SHARED_PAPERS'),'PaperLibrary must expose virtual papers');
assert.ok(read('stenography.html').includes('70 WPM')&&read('stenography.html').includes('35 WPM'));
assert.ok(read('stenography.html').includes('60 WPM')&&read('stenography.html').includes('25 WPM'));
assert.ok(read('shell.js').includes('skillsPracticeUrl'),'Steno job card must link to the practical trainer');
assert.ok(read('sw.js').includes("'./stenography.html'"),'Steno page must be cached in PWA public shell');
assert.equal(errs.length,0,'Source paper registration errors: '+errs.join('; '));
console.log('PPSC Kot Addu shared bank PASS: 5 new jobs, 5 source-credited paper variants (2+2 Clerk, 1 IT), no new repeated stems per paper, 2 shorthand practice tracks, 28 original papers preserved.');
