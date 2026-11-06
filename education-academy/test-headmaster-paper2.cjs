'use strict';
/* Paper 2 QA: no network, checks content, keys, legacy overlap, draft fingerprints. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname,context={window:{},console};
function load(name){vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),context,{timeout:2500,filename:name})}
load('papers.js');
const old=context.window.LAMA_PPSC_PAPERS[0];
const original=[];
for(let part=1;part<=4;part++){
 load('papers/headmaster-02-part'+part+'.js');
 original.push(...context.window['LAMA_PPSC_HM02_'+part]);
}
load('papers/headmaster-02-register.js');
const all=context.window.LAMA_PPSC_PAPERS;
assert.equal(all.length,2,'Paper 1 and Paper 2 must both remain available');
const paper=all.find(p=>p.id==='HM-2026-P02');
assert.ok(paper,'Paper 2 must have a stable independent ID');
assert.equal(paper.title,'Paper 2 — Headmaster / Headmistress Original Practice');
assert.equal(paper.minutes,90);
assert.equal(paper.questions.length,100);
assert.equal(paper.access,'free');
assert.equal(paper.publishStatus,'public');
assert.equal(paper.practiceOnly,true);
assert.equal(paper.reviewStatus,'automated-checked','do not claim independent academic approval');
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const priorHashes=JSON.parse(fs.readFileSync(path.join(root,'papers/prior-private-stem-fingerprints.json'),'utf8'));
function hash(s){let x=2166136261;for(const ch of s)x=Math.imul(x^ch.charCodeAt(0),16777619)>>>0;return x.toString(16).padStart(8,'0')}
const privateHashes=new Set(priorHashes.hashes);
const legacyStems=new Set(old.questions.map(q=>norm(q.q)));
const allIDs=new Set(old.questions.map(q=>q.id)),seen=new Set(),topics=new Set(),subjects=new Map(),positions=[0,0,0,0];
const stop=new Set('a an the and or in on for to of is are was were which what when how that this who does best most school teacher pupil pupils student students should will can it with by from as do be not one only'.split(' '));
const words=s=>new Set(norm(s).split(' ').filter(w=>w.length>2&&!stop.has(w)));
function overlap(a,b){const A=words(a),B=words(b);let common=0;for(const w of A)if(B.has(w))common++;return common/(A.size+B.size-common||1)}
for(let i=0;i<100;i++){
 const q=paper.questions[i],originalQ=original[i],normalized=norm(q.q);
 assert.equal(q.id,'HM02-'+String(i+1).padStart(3,'0'),'question ID/order must not change silently');
 assert.ok(q.q.length>=45,'worded practice question too short: '+q.id);
 assert.ok(q.explanation.length>=65,'specific explanation too short: '+q.id);
 assert.equal(q.options.length,4);
 assert.ok(q.options.every(x=>x.trim().length>=1));
 assert.equal(new Set(q.options.map(norm)).size,4,'repeated option '+q.id);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
 assert.equal(q.options[q.answer],originalQ.options[originalQ.answer],'answer key changed during rotation: '+q.id);
 assert.ok(!allIDs.has(q.id),'reused question ID '+q.id);allIDs.add(q.id);
 assert.ok(!legacyStems.has(normalized),'copied published question '+q.id);
 assert.ok(!privateHashes.has(hash(normalized)),'copied prior private draft '+q.id);
 assert.ok(!seen.has(normalized),'duplicate within Paper 2 '+q.id);seen.add(normalized);
 topics.add(norm(q.topic));
 subjects.set(q.subject,(subjects.get(q.subject)||0)+1);
 positions[q.answer]++;
 for(let j=0;j<i;j++)assert.ok(overlap(q.q,paper.questions[j].q)<0.65,'closely repeated question in Paper 2: '+q.id+' vs '+paper.questions[j].id);
}
assert.ok(topics.size>=80,'too few distinct real question topics');
assert.ok(subjects.size>=14,'question coverage is insufficiently varied');
assert.ok(positions.every(n=>n>=15&&n<=35),'answer position concentration: '+positions.join(','));
const html=fs.readFileSync(path.join(root,'answer-key.html'),'utf8');
const exam=fs.readFileSync(path.join(root,'engine.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const print=fs.readFileSync(path.join(root,'print.html'),'utf8');
const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert.ok(html.includes("attempt.submitted!==true"),'keys must require submitted practice in standard UI');
assert.ok(html.includes("q.options[q.answer]"),'correct option missing from answer-key rendering');
assert.ok(html.includes("attempt.answers[q.id]"),'candidate selection must be shown beside correct option');
assert.ok(html.includes("window.print()"),'printable key must support PDF via print dialog');
assert.ok(exam.includes('View / Print Answer Key'),'post-submission link missing');
assert.ok(index.includes('headmaster-02-register.js'));
assert.ok(print.includes('headmaster-02-register.js'));
assert.ok(worker.includes("'./answer-key.html'"));
assert.ok(worker.includes("'./papers/headmaster-02-register.js'"));
console.log('Paper 2 validated: 100 unique questions, 0 duplicate stems vs Paper 1 and 30 private draft fingerprints');
console.log('Unique topics:',topics.size,'subjects:',subjects.size,'correct positions A-D:',positions.join('/'));
