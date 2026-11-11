'use strict';
/* Assistant Faisalabad Paper 01 regression. Run:
 * node education-academy/test-assistant-faisalabad-paper1.cjs
 * Automated content checks are not a factual or subject expert review.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,context={window:{},console};
const load=name=>vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name,timeout:4500});
const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
load('papers.js');
const scripts=[...html.matchAll(/<script src="\.\/(papers\/[^"]+\.js)" defer><\/script>/g)].map(m=>m[1]);
assert.equal(scripts.filter(s=>s.includes('assistant-faisalabad-01-')).length,5,'Faisalabad assistant needs four batches and registrar');
for(const script of scripts)load(script);
const all=context.window.LAMA_PPSC_PAPERS;
assert.equal(all.length,28,'Expect 20 teaching, 3 Information Officer, 2 Junior Clerk, two Assistant and one Secretary A paper');
assert.equal(all.reduce((sum,p)=>sum+p.questions.length,0),2800,'Total verified practice question positions');
const target=all.find(p=>p.id==='AFSD-FAISALABAD-2026-P01');
assert.ok(target,'Faisalabad Assistant paper missing');
assert.deepEqual(Array.from(target.jobIds),['assistant-faisalabad-bor']);
assert.equal(target.sequence,1);assert.equal(target.minutes,90);assert.equal(target.questions.length,100);
assert.equal(target.syllabusAllocation.generalAbility,100);
assert.equal(target.practiceOnly,true);
const previous=all.filter(p=>p.id!==target.id);
for(const id of ['AKD-KOT-ADDU-2026-P01','JCB-BAHAWALPUR-2026-P01','JCF-FAISALABAD-2026-P01']){
 assert.ok(previous.some(p=>p.id===id),'Previously delivered paper disappeared: '+id);
}
const ids=new Set(),stems=new Set(),subjects={},topics=new Set(),letters=[0,0,0,0];
for(const p of all){
 assert.equal(p.questions.length,100,'Paper incomplete '+p.id);
 for(const q of p.questions){
  assert.ok(!ids.has(q.id),'Repeated question ID: '+q.id);ids.add(q.id);
  const s=norm(q.q);
  assert.ok(s&&!stems.has(s),'Repeated normalized stem: '+q.id);stems.add(s);
 }
}
for(let i=0;i<100;i++){
 const q=target.questions[i];
 assert.equal(q.id,'AFSD01-'+String(i+1).padStart(3,'0'));
 assert.ok(q.q.length>=22&&q.explanation.length>=50&&q.topic&&q.subject,'Incomplete question '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(x=>String(x).trim().toLowerCase())).size,4);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
 assert.ok(!topics.has(norm(q.topic)),'Repeated topic '+q.topic);topics.add(norm(q.topic));
 letters[q.answer]++;subjects[q.subject]=(subjects[q.subject]||0)+1;
}
const expected=['General Knowledge','Pakistan Studies','Current Affairs','Islamic Studies','Geography','Basic Mathematics','English','Urdu','Everyday Science','Basic Computer Studies'];
assert.equal(Object.keys(subjects).length,10);
for(const subject of expected)assert.equal(subjects[subject],10,'Practice subject allocation mismatch '+subject);
assert.ok(letters.every(n=>n>=15&&n<=35),'Answer key option imbalance '+letters.join(','));
const normalizedOriginals=new Set();
for(let i=1;i<=4;i++){
 const file=fs.readFileSync(path.join(root,'papers/assistant-faisalabad-01-part'+i+'.js'),'utf8');
 assert.ok(file.includes('window.LAMA_PPSC_AFSD01_'+i),'Wrong file '+i);
}
for(const name of ['index.html','print.html','answer-key.html','sw.js']){
 const src=fs.readFileSync(path.join(root,name),'utf8');
 for(let i=1;i<=4;i++)assert.ok(src.includes('assistant-faisalabad-01-part'+i+'.js'),name+' missing part '+i);
 assert.ok(src.includes('assistant-faisalabad-01-register.js'),name+' missing registrar');
}
const job=fs.readFileSync(path.join(root,'jobs.js'),'utf8');
assert.match(job,/id:"assistant-faisalabad-bor"[^\n]*caseNo:"36-RJ\/2026"[^\n]*ready:true/);
assert.ok(fs.readFileSync(path.join(root,'print.html'),'utf8').includes('column-count:2!important'),'Question paper must print in two A4 columns');
assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/lama-ppsc-preview-v\d+/);
console.log('Assistant Faisalabad Paper 01 PASS: 100 MCQs, 10 subject areas, unique stems and options, full library 28 papers/2800 positions, exam/print/review/PWA wiring');
