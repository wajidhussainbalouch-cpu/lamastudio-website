'use strict';
/* Secretary A Market Committee Paper 01 — full source and integration regression.
 * Run node education-academy/test-secretary-a-market-paper1.cjs
 * Automated checks do not replace independent academic/editorial review.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,ctx={window:{},console};
const load=p=>vm.runInNewContext(fs.readFileSync(path.join(root,p),'utf8'),ctx,{filename:p,timeout:4500});
const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
load('papers.js');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="\.\/(papers\/[^"]+\.js)" defer><\/script>/g)].map(m=>m[1]);
for(let n=1;n<=4;n++)assert.ok(scripts.includes('papers/secretary-a-market-01-part'+n+'.js'));
assert.ok(scripts.includes('papers/secretary-a-market-01-register.js'));
for(const script of scripts)load(script);
const bank=ctx.window.LAMA_PPSC_PAPERS;
assert.equal(bank.length,28,'Prior 27 papers plus Secretary A');
assert.equal(bank.reduce((a,p)=>a+p.questions.length,0),2800,'28 complete papers with 100 questions each');
const paper=bank.find(p=>p.id==='SAC-PAMRA-2026-P01');
assert.ok(paper,'Missing Secretary A paper');
assert.equal(paper.minutes,90);assert.equal(paper.sequence,1);
assert.deepEqual(Array.from(paper.jobIds),['secretary-a-market-pamra']);
assert.equal(paper.questionCount,100);
assert.equal(paper.syllabusAllocation.qualificationRelated,60);
assert.equal(paper.syllabusAllocation.generalAbility,40);
assert.equal(paper.practiceOnly,true);
assert.ok(paper.candidateNote.includes('not official PPSC topic allocations'));
assert.equal(bank.filter(p=>p.jobIds&&p.jobIds.includes('secretary-a-market-pamra')).length,1);
assert.ok(bank.some(p=>p.id==='AFSD-FAISALABAD-2026-P01'),'Previous Faisalabad Assistant preserved');
assert.ok(bank.some(p=>p.id==='AKD-KOT-ADDU-2026-P01'),'Previous Kot Addu Assistant preserved');
const allIds=new Set(),allStems=new Set(),topics=new Set(),answers=[0,0,0,0];
for(const p of bank){
 assert.equal(p.questions.length,100,'Incomplete prior paper '+p.id);
 for(const q of p.questions){
  assert.ok(!allIds.has(q.id),'Repeated question ID: '+q.id);allIds.add(q.id);
  const qnorm=norm(q.q);assert.ok(qnorm&&!allStems.has(qnorm),'Repeated normalized question '+q.id);
  allStems.add(qnorm);
 }
}
for(const [i,q] of paper.questions.entries()){
 assert.equal(q.id,'SAC01-'+String(i+1).padStart(3,'0'));
 assert.ok(q.q.length>=22&&q.explanation.length>=48&&q.topic&&q.domain,'Missing question detail '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(v=>String(v).trim().toLowerCase())).size,4,'Repeated option '+q.id);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=3,'Bad answer index '+q.id);
 assert.ok(!topics.has(norm(q.topic)),'Repeated specialist topic '+q.id);topics.add(norm(q.topic));
 answers[q.answer]++;
 if(i<60)assert.equal(q.subject,'Qualification-related knowledge','60-item specialist allocation');
 else assert.notEqual(q.subject,'Qualification-related knowledge','40-item GA allocation');
}
const ga=paper.questions.slice(60).reduce((acc,q)=>(acc[q.subject]=(acc[q.subject]||0)+1,acc),{});
assert.deepEqual(Object.keys(ga).sort(),['General Knowledge','Pakistan Studies','Current Affairs','Geography','Everyday Science','Basic Mathematics','English','Urdu','Basic Computer Studies'].sort());
assert.equal(Object.values(ga).reduce((a,b)=>a+b,0),40);
assert.ok(answers.every(n=>n>=15&&n<=35),'Unbalanced shuffled answers '+answers);
for(const filename of ['index.html','print.html','answer-key.html','sw.js']){
 const body=fs.readFileSync(path.join(root,filename),'utf8');
 for(let n=1;n<=4;n++)assert.ok(body.includes('secretary-a-market-01-part'+n+'.js'),filename+' missing paper part');
 assert.ok(body.includes('secretary-a-market-01-register.js'),filename+' missing registrar');
}
const jobs=fs.readFileSync(path.join(root,'jobs.js'),'utf8');
assert.match(jobs,/id:"secretary-a-market-pamra"[^\n]*BS-17[^\n]*caseNo:"47-RJ\/2026"[^\n]*ready:true/);
assert.match(jobs,/id:"secretary-b-market-pamra"[^\n]*BS-16[^\n]*ready:false/);
assert.ok(fs.readFileSync(path.join(root,'print.html'),'utf8').includes('column-count:2!important'),'A4 printing layout missing');
console.log('Secretary A Market Paper 01 PASS: 100 original practice MCQs; 60 specialist + 40 general; 28 papers, 2800 positions; separated B Class and previous jobs; exam/print/PWA wired.');
