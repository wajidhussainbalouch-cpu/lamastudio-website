'use strict';
/* PPSC Advertisement 13/2026: owner-requested Junior Patrol Officer only,
 * minimum 10 posts selection for future ads, and original-question reuse.
 * Does NOT create candidates, publish official adverts or change private Supabase bank.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname;
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const ctx={window:{},console};vm.createContext(ctx);
const load=name=>vm.runInContext(read(name),ctx,{filename:name,timeout:7000});
const manifest=JSON.parse(read('PPSC_ADVERT13_2026_SELECTION.json'));
assert.equal(manifest.advertisement,'13/2026');
assert.equal(manifest.included.length,1,'Owner only requested Junior Patrol Officer from this advertisement');
assert.equal(manifest.included[0].posts,187);
assert.equal(manifest.included[0].caseNo,'07-RK/2026');
assert.equal(manifest.policy.minimumPostsPerIndividualJob,10);
load('ppsc-intake-policy.js');
const policy=ctx.window.LamaPpscIntakePolicy;
assert.equal(policy.minimumVacancies,10);
for(const count of [0,1,9,null,undefined,10.5,'187'])assert.equal(policy.eligible({advertisedVacancies:count}),false,'Reject invalid or insufficient per-post count');
for(const count of [10,11,187])assert.equal(policy.eligible({advertisedVacancies:count}),true);
const mixed=[{id:'jpo',advertisedVacancies:187},{id:'jco',advertisedVacancies:17},{id:'single',advertisedVacancies:1},{id:'minimum',advertisedVacancies:10},{id:'jpo',advertisedVacancies:187}];
assert.deepEqual(Array.from(policy.select(mixed).map(x=>x.id)),['jpo','jco','minimum'],'Minimum 10 without duplicates');
assert.deepEqual(Array.from(policy.select(mixed,{onlyJobIds:['jpo']}).map(x=>x.id)),['jpo'],'Owner scope overrides other eligible advertisement jobs');
load('papers.js');
const html=read('index.html');
const scripts=[...html.matchAll(/<script src="\.\/(papers\/[^"]+\.js)" defer><\/script>/g)].map(m=>m[1]);
for(const scr of scripts)load(scr);
const originals=ctx.window.LAMA_PPSC_PAPERS;
assert.equal(originals.length,28,'No new source questions were written for this job');
const sourceLength=JSON.stringify(originals).length;
load('shared-paper-bank.js');
assert.equal(JSON.stringify(originals).length,sourceLength,'Shared generation does not mutate original source registry');
const generated=ctx.window.LAMA_PPSC_SHARED_PAPERS;
const audit=ctx.window.LAMA_PPSC_SHARED_BANK_AUDIT;
assert.equal(audit.status,'ready','Shared bank must construct all seven papers');
assert.equal(generated.length,7,'Existing five derived + two new JPO');
assert.equal(audit.juniorPatrolPool,200,'The original 2 x 100 General Ability bank must remain intact');
const p=generated.filter(p=>p.jobIds.includes('junior-patrol-officer-prra-2026')).sort((a,b)=>a.sequence-b.sequence);
assert.equal(p.length,2);
assert.equal(p[0].id,'JPO-2026-P01');assert.equal(p[1].id,'JPO-2026-P02');
const sources=new Map(originals.flatMap(p=>p.questions.map(q=>[q.id,q])));
const names=['General Knowledge','Pakistan Studies','Current Affairs','Islamic Studies','Geography','Basic Mathematics','English','Urdu','Everyday Science','Basic Computer Studies'];
for(const paper of p){
 assert.equal(paper.minutes,90);
 assert.equal(paper.questions.length,100);
 assert.equal(paper.sharedFromExistingQuestions,true);
 assert.equal(paper.newOriginalQuestionCount,0);
 assert.equal(paper.syllabusAllocation.generalAbility,100);
 const ids=new Set(),topics=new Set(),subjects={};
 for(const q of paper.questions){
  assert.ok(!ids.has(q.id),'Unique question answer-state ID');ids.add(q.id);
  assert.ok(!topics.has(norm(q.q)),'Unique question stem in each paper');topics.add(norm(q.q));
  const origin=sources.get(q.sourceQuestionId);
  assert.ok(origin,'Every shared JPO question must have a source ID');
  assert.ok(/^AKD01-|^AFSD01-/.test(origin.id),'JPO draws only from existing General Ability papers');
  assert.equal(q.options[q.answer],origin.options[origin.answer],'Correct answer preserved after shuffle');
  assert.equal(q.q,origin.q,'No question rewriting in reused paper');
  subjects[q.subject]=(subjects[q.subject]||0)+1;
 }
 for(const n of names)assert.equal(subjects[n],10,'10 balanced editorial practice questions for '+n);
}
const p1Ids=new Set(p[0].questions.map(q=>q.sourceQuestionId));
assert.ok(p[1].questions.every(q=>!p1Ids.has(q.sourceQuestionId)),'Papers 1 and 2 must not repeat source questions');
load('jobs.js');
const job=ctx.window.LAMA_PPSC_JOBS.filter(j=>j.id==='junior-patrol-officer-prra-2026');
assert.equal(job.length,1,'JPO is one single job track');
assert.equal(job[0].advertisedVacancies,187);
assert.equal(job[0].caseNo,'07-RK/2026');assert.equal(job[0].ready,true);
assert.equal(job[0].sharedBankGroup,'general-ability-100');
assert.equal(job[0].syllabusEvidence.marks,100);
assert.equal(job[0].syllabusEvidence.minutes,90);
assert.equal(job[0].syllabusEvidence.sections[0].percent,100);
assert.ok(!ctx.window.LAMA_PPSC_JOBS.some(j=>j.advertisementNo==='13/2026'&&j.id!=='junior-patrol-officer-prra-2026'),'No other jobs imported from Advertisement 13');
for(const name of ['index.html','print.html','answer-key.html']){
 const s=read(name);
 assert.ok(s.indexOf('shared-paper-bank.js')<s.indexOf('paper-library.js'),'Shared bank must load before paper library in '+name);
}
assert.ok(read('sw.js').includes("'./shared-paper-bank.js'"),'PWA cache must load shared questions');
console.log('PPSC Advert 13/2026 PASS: only Junior Patrol Officer, 187 posts, 2 distinct 100% General Ability shared-bank papers, source traceability, future >=10 vacancy policy.');
