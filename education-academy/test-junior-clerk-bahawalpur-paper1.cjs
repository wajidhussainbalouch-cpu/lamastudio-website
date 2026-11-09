'use strict';
/* Junior Clerk (BS-11) Bahawalpur Paper 01 — source, 80/20 syllabus allocation, Unicode/Office answer-key,
 * twenty-paper family isolation, print and PWA integration. Automated QA ≠ expert content approval.
 */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname,context={window:{},console};
const load=f=>vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f,timeout:3500});
const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const choice=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
load('papers.js');
for(let n=2;n<=20;n++){
 for(let i=1;i<=4;i++)load('papers/headmaster-'+String(n).padStart(2,'0')+'-part'+i+'.js');
 load('papers/headmaster-'+String(n).padStart(2,'0')+'-register.js');
}
for(let n=1;n<=3;n++){
 for(let i=1;i<=4;i++)load('papers/information-officer-'+String(n).padStart(2,'0')+'-part'+i+'.js');
 load('papers/information-officer-'+String(n).padStart(2,'0')+'-register.js');
}
const before=context.window.LAMA_PPSC_PAPERS.slice();
assert.equal(before.length,23,'existing 20 teaching and 3 Information Officer papers stay intact');
const original=[];
for(let i=1;i<=4;i++){load('papers/junior-clerk-bahawalpur-01-part'+i+'.js');original.push(...context.window['LAMA_PPSC_JCB01_'+i]);}
assert.equal(original.length,100);
load('papers/junior-clerk-bahawalpur-01-register.js');
const all=context.window.LAMA_PPSC_PAPERS;
assert.equal(all.length,24,'exactly one additional job-specific paper published');
for(let i=0;i<23;i++)assert.equal(all[i],before[i],'earlier paper changed '+i);
const p=all.find(x=>x.id==='JCB-BAHAWALPUR-2026-P01');
assert.ok(p,'Junior Clerk Bahawalpur Paper 1 was not registered');
assert.deepEqual(Array.from(p.jobIds),['junior-clerk-bahawalpur-bor']);
assert.equal(p.questions.length,100);assert.equal(p.minutes,90);assert.equal(p.sequence,1);
assert.equal(p.access,'free');assert.equal(p.publishStatus,'public');assert.equal(p.practiceOnly,true);
assert.equal(p.reviewStatus,'automated-checked');assert.equal(p.qaStatus,'pass');
assert.equal(p.syllabusAllocation.generalAbility,80);assert.equal(p.syllabusAllocation.msOfficeAndComputerSkills,20);
assert.ok(p.candidateNote.includes('non-Muslim'),'alternative candidate note must not be hidden');
assert.equal(all.reduce((n,x)=>n+x.questions.length,0),2400);
const priorIds=new Set(before.flatMap(x=>x.questions.map(q=>q.id)));
const priorStems=new Set(before.flatMap(x=>x.questions.map(q=>norm(q.q))));
const seen=new Set(),topics=new Set(),positions=[0,0,0,0],subjects={};
for(let i=0;i<100;i++){
 const q=p.questions[i],raw=original[i],s=norm(q.q);
 assert.equal(q.id,'JCB01-'+String(i+1).padStart(3,'0'));
 assert.ok(q.q.length>=22&&q.explanation.length>=50&&q.topic&&q.subject,'question metadata missing '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(choice)).size,4,'duplicated answer option '+q.id);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
 assert.equal(q.options[q.answer],raw.options[raw.answer],'rotation changed correct answer '+q.id);
 assert.ok(!priorIds.has(q.id),'duplicated question id across jobs '+q.id);
 assert.ok(!priorStems.has(s),'duplicated question stem across jobs '+q.id);
 assert.ok(!seen.has(s),'duplicated question in this paper '+q.id);
 assert.ok(!topics.has(norm(q.topic)),'repeated topic tag in this paper '+q.id);
 if(i<80)assert.notEqual(q.subject,'MS Office and Computer Skills','computer question among the 80 General Ability questions');
 else assert.equal(q.subject,'MS Office and Computer Skills','20 MS Office questions must close the paper');
 seen.add(s);topics.add(norm(q.topic));positions[q.answer]++;subjects[q.subject]=(subjects[q.subject]||0)+1;
}
assert.equal(seen.size,100);assert.equal(topics.size,100);
assert.equal(subjects['MS Office and Computer Skills'],20);
assert.equal(subjects['Urdu'],8);
assert.ok(positions.every(n=>n>=15&&n<=35),'poor rotated answer distribution '+positions);
assert.equal(before.filter(x=>x.jobIds?.includes('information-officer')).length,3,'Information Officer sequence preserved');
for(const f of ['index.html','print.html','answer-key.html','sw.js']){
 const html=fs.readFileSync(path.join(root,f),'utf8');
 for(let i=1;i<=4;i++)assert.ok(html.includes('junior-clerk-bahawalpur-01-part'+i+'.js'),f+' missing question batch '+i);
 assert.ok(html.includes('junior-clerk-bahawalpur-01-register.js'),f+' missing registration script');
}
assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/lama-ppsc-preview-v\d+/);
console.log('Junior Clerk Bahawalpur Paper 01: 100 original MCQs, 80/20 split, Urdu/Excel-safe keys, 90-minute exam and category isolation passed');
