'use strict';
/* Information Officer Paper 02: 100-MCQ QA, backward compatibility, job isolation.
 * Automated structural checks are not professional academic verification.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,context={window:{},console};
const load=name=>vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name,timeout:3000});
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const stop=new Set('a an the and or in on for to of is are was were which what when how that this who does best most school teacher pupil pupils student students should will can it with by from as do be not one only'.split(' '));
const words=s=>new Set(norm(s).split(' ').filter(w=>w.length>2&&!stop.has(w)));
const overlap=(a,b)=>{const A=words(a),B=words(b);let n=0;for(const w of A)if(B.has(w))n++;return n/(A.size+B.size-n||1)};
load('papers.js');
for(let n=2;n<=20;n++){
 for(let i=1;i<=4;i++)load('papers/headmaster-'+String(n).padStart(2,'0')+'-part'+i+'.js');
 load('papers/headmaster-'+String(n).padStart(2,'0')+'-register.js');
}
for(let i=1;i<=4;i++)load('papers/information-officer-01-part'+i+'.js');
load('papers/information-officer-01-register.js');
const earlier=context.window.LAMA_PPSC_PAPERS.slice();
assert.equal(earlier.length,21,'20 teaching papers and Information Officer Paper 01 unchanged');
const raw=[];
for(let i=1;i<=4;i++){load('papers/information-officer-02-part'+i+'.js');raw.push(...context.window['LAMA_PPSC_IO02_'+i])}
assert.equal(raw.length,100);
load('papers/information-officer-02-register.js');
const all=context.window.LAMA_PPSC_PAPERS;
assert.equal(all.length,22,'second Information Officer paper adds one total paper');
earlier.forEach((x,i)=>assert.equal(x,all[i],'historical paper object mutated at '+i));
const paper=all.find(x=>x.id==='INFO-2026-P02');
assert.ok(paper,'Paper 02 not registered');
assert.equal(paper.minutes,90);
assert.equal(paper.sequence,2);
assert.equal(paper.questions.length,100);
assert.equal(paper.practiceOnly,true);
assert.equal(paper.access,'free');
assert.equal(paper.publishStatus,'public');
assert.equal(paper.qaStatus,'pass');
assert.equal(paper.reviewStatus,'automated-checked');
assert.deepEqual(Array.from(paper.jobIds),['information-officer']);
assert.equal(all.reduce((n,p)=>n+p.questions.length,0),2200);
const oldIds=new Set(earlier.flatMap(p=>p.questions.map(q=>q.id))),oldStems=new Set(earlier.flatMap(p=>p.questions.map(q=>norm(q.q))));
const origQuestion=earlier.find(p=>p.id==='INFO-2026-P01');
const topicSet=new Set(),stemSet=new Set(),choiceCounts=[0,0,0,0];
for(let i=0;i<100;i++){
 const q=paper.questions[i],base=raw[i],stem=norm(q.q);
 assert.equal(q.id,'IO02-'+String(i+1).padStart(3,'0'));
 assert.ok(q.q.length>=45&&q.explanation.length>=65&&q.subject&&q.topic,'missing education content '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(norm)).size,4,'duplicate option '+q.id);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
 assert.equal(q.options[q.answer],base.options[base.answer],'rotated correct answer text changed '+q.id);
 assert.ok(!oldIds.has(q.id)&&!oldStems.has(stem),'overlap with earlier papers '+q.id);
 assert.ok(!stemSet.has(stem)&&!topicSet.has(norm(q.topic)),'within-paper repetition '+q.id);
 for(let j=0;j<i;j++)assert.ok(overlap(q.q,paper.questions[j].q)<0.60,'near repeat in current paper '+q.id+'/'+paper.questions[j].id);
 for(const old of origQuestion.questions)assert.ok(overlap(q.q,old.q)<0.60,'near repeat with Paper 01 '+q.id+'/'+old.id);
 stemSet.add(stem);topicSet.add(norm(q.topic));choiceCounts[q.answer]++;
}
assert.equal(stemSet.size,100);
assert.ok(choiceCounts.every(n=>n>=16&&n<=34),'answer distribution '+choiceCounts);
for(const file of ['index.html','print.html','answer-key.html','sw.js']){
 const data=fs.readFileSync(path.join(root,file),'utf8');
 for(let i=1;i<=4;i++)assert.ok(data.includes('information-officer-02-part'+i+'.js'),'missing part '+i+' in '+file);
 assert.ok(data.includes('information-officer-02-register.js'),'missing register in '+file);
}
assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/lama-ppsc-preview-v\d+/,'public PWA must retain versioned cache');
console.log('Information Officer Paper 02: all 100 MCQs, rotated keys, distinct job, previous papers and offline assets passed');
