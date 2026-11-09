'use strict';
/* Faisalabad Junior Clerk Paper 01 — 100 new 80/20 syllabus practice items, Unicode and Office
 * answer fidelity, job isolation and earlier paper preservation. Automated checks are NOT an academic review.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,context={window:{},console};
const load=name=>vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name,timeout:3500});
const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const choice=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const ignore=new Set('a an the and or in on for to of is are was were which what when how that this who does best most should will can it with by from as do be not one only'.split(' '));
const ws=s=>new Set(norm(s).split(' ').filter(w=>w.length>2&&!ignore.has(w)));
const overlap=(s,t)=>{const a=ws(s),b=ws(t);let common=0;for(const w of a)if(b.has(w))common++;return common/(a.size+b.size-common||1)};
load('papers.js');
for(let n=2;n<=20;n++){
 for(let i=1;i<=4;i++)load('papers/headmaster-'+String(n).padStart(2,'0')+'-part'+i+'.js');
 load('papers/headmaster-'+String(n).padStart(2,'0')+'-register.js');
}
for(let n=1;n<=3;n++){
 for(let i=1;i<=4;i++)load('papers/information-officer-'+String(n).padStart(2,'0')+'-part'+i+'.js');
 load('papers/information-officer-'+String(n).padStart(2,'0')+'-register.js');
}
for(let i=1;i<=4;i++)load('papers/junior-clerk-bahawalpur-01-part'+i+'.js');
load('papers/junior-clerk-bahawalpur-01-register.js');
const before=context.window.LAMA_PPSC_PAPERS.slice();
assert.equal(before.length,24,'preserve 20 Headmaster, 3 Information Officer and 1 Bahawalpur Clerk papers');
const original=[];
for(let i=1;i<=4;i++){
 load('papers/junior-clerk-faisalabad-01-part'+i+'.js');
 original.push(...context.window['LAMA_PPSC_JCF01_'+i]);
}
assert.equal(original.length,100);
load('papers/junior-clerk-faisalabad-01-register.js');
const all=context.window.LAMA_PPSC_PAPERS;
assert.equal(all.length,25,'new distinct job family adds precisely one paper');
before.forEach((p,i)=>assert.equal(all[i],p,'prior paper object mutated at '+i));
const p=all.find(x=>x.id==='JCF-FAISALABAD-2026-P01');
assert.ok(p,'Faisalabad Paper 1 was not registered');
assert.deepEqual(Array.from(p.jobIds),['junior-clerk-faisalabad-bor']);
assert.equal(p.minutes,90);
assert.equal(p.questions.length,100);
assert.equal(p.sequence,1);
assert.equal(p.access,'free');
assert.equal(p.publishStatus,'public');
assert.equal(p.practiceOnly,true);
assert.equal(p.reviewStatus,'automated-checked');
assert.equal(p.qaStatus,'pass');
assert.equal(p.syllabusAllocation.generalAbility,80);
assert.equal(p.syllabusAllocation.msOfficeAndComputerSkills,20);
assert.ok(p.candidateNote.includes('1:20'),'retain official post-written typing ratio note');
assert.ok(p.candidateNote.includes('non-Muslim'),'general knowledge alternative must be disclosed');
assert.equal(all.reduce((n,p)=>n+p.questions.length,0),2500);
const priorIds=new Set(before.flatMap(p=>p.questions.map(q=>q.id)));
const priorStems=new Set(before.flatMap(p=>p.questions.map(q=>norm(q.q))));
const bahawalpur=before.find(p=>p.id==='JCB-BAHAWALPUR-2026-P01');
assert.ok(bahawalpur);
const topics=new Set(),stems=new Set(),positions=[0,0,0,0],subjects={};
for(let i=0;i<100;i++){
 const q=p.questions[i],raw=original[i],s=norm(q.q),t=norm(q.topic);
 assert.equal(q.id,'JCF01-'+String(i+1).padStart(3,'0'));
 assert.ok(q.q.length>=22&&q.explanation.length>=50&&q.topic&&q.subject,'missing content '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(choice)).size,4,'duplicate answer options '+q.id);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,'invalid answer key '+q.id);
 assert.equal(q.options[q.answer],raw.options[raw.answer],'rotated correct answer changed '+q.id);
 assert.ok(!priorIds.has(q.id)&&!priorStems.has(s),'duplicate older MCQ '+q.id);
 assert.ok(!stems.has(s)&&!topics.has(t),'intra-paper repetition '+q.id);
 for(let j=0;j<i;j++)assert.ok(overlap(q.q,p.questions[j].q)<0.60,'internal near-duplicate '+q.id+' and '+p.questions[j].id);
 for(const earlier of bahawalpur.questions)assert.ok(overlap(q.q,earlier.q)<0.60,'Bahawalpur near-repeat '+q.id+' and '+earlier.id);
 if(i<80)assert.notEqual(q.subject,'MS Office and Computer Skills','unexpected computer item '+q.id);
 else assert.equal(q.subject,'MS Office and Computer Skills','missing Office item '+q.id);
 stems.add(s);topics.add(t);subjects[q.subject]=(subjects[q.subject]||0)+1;positions[q.answer]++;
}
assert.equal(stems.size,100);assert.equal(topics.size,100);
assert.equal(subjects['MS Office and Computer Skills'],20);
assert.equal(subjects.Urdu,8);
assert.ok(positions.every(n=>n>=16&&n<=34),'unbalanced answer letters '+positions);
for(const name of ['index.html','print.html','answer-key.html','sw.js']){
 const s=fs.readFileSync(path.join(root,name),'utf8');
 for(let n=1;n<=4;n++)assert.ok(s.includes('junior-clerk-faisalabad-01-part'+n+'.js'),name+' missing part '+n);
 assert.ok(s.includes('junior-clerk-faisalabad-01-register.js'),name+' missing registration');
}
const print=fs.readFileSync(path.join(root,'print.html'),'utf8');
assert.ok(print.includes('column-count:2!important'),'A4 printing must have two columns');
assert.ok(print.includes('LAMA PPSC Preparation Academy'),'print header must name the academy');
assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/lama-ppsc-preview-v\d+/);
console.log('Faisalabad Junior Clerk Paper 01: 100 checked MCQs, 80/20 allocation, corrected Urdu, keys, 25 prior-inclusive papers and A4 print wiring PASS');
