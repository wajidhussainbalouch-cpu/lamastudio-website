'use strict';
/* Kot Addu Assistant Paper 01 regression: 100 original General Ability MCQs.
 * Run with: node education-academy/test-assistant-kot-addu-paper1.cjs
 * Structural tests are not independent expert verification of factual answers.
 */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname,context={window:{},console};
const load=p=>vm.runInNewContext(fs.readFileSync(path.join(root,p),'utf8'),context,{filename:p,timeout:4000});
const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
load('papers.js');
const scripts=[...html.matchAll(/<script src="\.\/(papers\/[^"]+\.js)" defer><\/script>/g)].map(m=>m[1]);
assert.ok(scripts.includes('papers/assistant-kot-addu-01-register.js'));
for(const script of scripts)load(script);
const all=context.window.LAMA_PPSC_PAPERS;
assert.equal(all.length,28,'Expected 20 Headmaster, 3 Information Officer, 2 Junior Clerk, 2 Assistant and 1 Secretary A papers');
assert.equal(all.reduce((sum,p)=>sum+p.questions.length,0),2800);
const p=all.find(p=>p.id==='AKD-KOT-ADDU-2026-P01');
assert.ok(p,'Kot Addu Assistant paper missing from candidate list');
assert.equal(p.minutes,90);assert.equal(p.sequence,1);assert.equal(p.questions.length,100);
assert.deepEqual(Array.from(p.jobIds),['assistant-kot-addu-bor']);
assert.equal(all.filter(p=>p.jobIds&&p.jobIds.includes('assistant-kot-addu-bor')).length,1);
const allStems=new Set(),allIds=new Set(),subjects={};
for(const entry of all){
 for(const q of entry.questions){
  const s=norm(q.q);
  assert.ok(s&&!allStems.has(s),'Duplicate question across papers: '+q.id);
  assert.ok(!allIds.has(q.id),'Duplicate question ID: '+q.id);
  allStems.add(s);allIds.add(q.id);
 }
}
const positions=[0,0,0,0],topics=new Set();
for(let i=0;i<100;i++){
 const q=p.questions[i];
 assert.equal(q.id,'AKD01-'+String(i+1).padStart(3,'0'));
 assert.ok(q.q.length>=22&&q.explanation.length>=50&&q.topic&&q.subject,'Missing content '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(x=>String(x).toLowerCase().trim())).size,4);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=3);
 assert.ok(!topics.has(norm(q.topic)),'Duplicate topic '+q.id);
 topics.add(norm(q.topic));positions[q.answer]++;subjects[q.subject]=(subjects[q.subject]||0)+1;
}
for(const label of ['General Knowledge','Pakistan Studies','Current Affairs','Islamic Studies','Geography','Basic Mathematics','English','Urdu','Everyday Science','Basic Computer Studies'])assert.equal(subjects[label],10,'Unbalanced '+label);
assert.equal(topics.size,100);
assert.ok(positions.every(n=>n>=15&&n<=35),'Answer balance '+positions);
for(const name of ['index.html','print.html','answer-key.html','sw.js']){
 const text=fs.readFileSync(path.join(root,name),'utf8');
 for(let i=1;i<=4;i++)assert.ok(text.includes('assistant-kot-addu-01-part'+i+'.js'),name+' missing part '+i);
 assert.ok(text.includes('assistant-kot-addu-01-register.js'),name+' missing registration');
}
assert.match(fs.readFileSync(path.join(root,'jobs.js'),'utf8'),/id:"assistant-kot-addu-bor"[^\n]*ready:true/);
assert.ok(fs.readFileSync(path.join(root,'print.html'),'utf8').includes('column-count:2!important'),'A4 two-column print must remain');
console.log('Kot Addu Assistant Paper 01 PASS: 100 questions; 10x10 syllabus; 28 paper registry; 2,800 items; unique IDs/stems; exam, print, answer key and offline asset wiring');
