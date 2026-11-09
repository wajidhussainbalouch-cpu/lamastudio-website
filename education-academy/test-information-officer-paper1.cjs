'use strict';
/* Information Officer Paper 01 structural, answer-key, job-isolation and cap regression.
 * Automated checks are not independent academic or current-PPSC-syllabus approval.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,context={window:{},console};
const load=name=>vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name,timeout:3000});
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
load('papers.js');
for(let n=2;n<=20;n++){
 for(let i=1;i<=4;i++)load('papers/headmaster-'+String(n).padStart(2,'0')+'-part'+i+'.js');
 load('papers/headmaster-'+String(n).padStart(2,'0')+'-register.js');
}
const earlier=context.window.LAMA_PPSC_PAPERS.slice();
assert.equal(earlier.length,20,'preserve 20 Headmaster-family papers');
const original=[];
for(let i=1;i<=4;i++){
 load('papers/information-officer-01-part'+i+'.js');
 original.push(...context.window['LAMA_PPSC_IO01_'+i]);
}
assert.equal(original.length,100);
load('papers/information-officer-01-register.js');
const papers=context.window.LAMA_PPSC_PAPERS;
assert.equal(papers.length,21,'one new paper in another job family');
earlier.forEach((p,i)=>assert.equal(papers[i],p,'existing paper changed at '+i));
const p=papers.find(p=>p.id==='INFO-2026-P01');
assert.ok(p,'Information Officer Paper 1 not registered');
assert.equal(p.questions.length,100);
assert.equal(p.minutes,90);
assert.equal(p.access,'free');
assert.equal(p.practiceOnly,true);
assert.equal(p.reviewStatus,'automated-checked');
assert.deepEqual(Array.from(p.jobIds),['information-officer']);
assert.equal(p.sequence,1);
assert.equal(papers.reduce((n,p)=>n+p.questions.length,0),2100);
const priorStems=new Set(earlier.flatMap(p=>p.questions.map(q=>norm(q.q))));
const priorIds=new Set(earlier.flatMap(p=>p.questions.map(q=>q.id)));
const subjects=new Set(),topics=new Set(),seen=new Set(),positions=[0,0,0,0];
const stop=new Set('a an the and or in on for to of is are was were which what when how that this who does best most school teacher pupil pupils student students should will can it with by from as do be not one only'.split(' '));
const words=s=>new Set(norm(s).split(' ').filter(w=>w.length>2&&!stop.has(w)));
const jaccard=(a,b)=>{const A=words(a),B=words(b);let matches=0;for(const x of A)if(B.has(x))matches++;return matches/(A.size+B.size-matches||1)};
for(let i=0;i<p.questions.length;i++){
 const q=p.questions[i],before=original[i],stem=norm(q.q);
 assert.equal(q.id,'IO01-'+String(i+1).padStart(3,'0'));
 assert.ok(q.q.length>=45,'short question '+q.id);
 assert.ok(q.explanation.length>=65,'short explanation '+q.id);
 assert.ok(q.subject&&q.topic,'missing metadata '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(norm)).size,4,'duplicate choices '+q.id);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=3,'invalid answer '+q.id);
 assert.equal(q.options[q.answer],before.options[before.answer],'option rotation changed correct text '+q.id);
 assert.ok(!priorIds.has(q.id),'repeated question id '+q.id);
 assert.ok(!priorStems.has(stem),'same question as older practice '+q.id);
 assert.ok(!seen.has(stem),'duplicate stem within Paper 1 '+q.id);
 assert.ok(!topics.has(norm(q.topic)),'repeated Paper 1 topic '+q.id);
 for(let j=0;j<i;j++)assert.ok(jaccard(q.q,p.questions[j].q)<.60,'near-repeat '+q.id+'/'+p.questions[j].id);
 seen.add(stem);subjects.add(q.subject);topics.add(norm(q.topic));positions[q.answer]++;
}
assert.equal(seen.size,100);
assert.equal(topics.size,100);
assert.ok(subjects.size>=20);
assert.ok(positions.every(n=>n>=16&&n<=35),'unbalanced rotated answer choices '+positions);
assert.equal(p.questions.slice(0,80).length,80);
assert.equal(p.questions.slice(80).length,20);
const required=[1,2,3,4].map(n=>'information-officer-01-part'+n+'.js').concat('information-officer-01-register.js');
for(const file of ['index.html','print.html','answer-key.html','sw.js']){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 for(const basename of required)assert.ok(source.includes(basename),'missing '+basename+' from '+file);
}
const key=fs.readFileSync(path.join(root,'answer-key.html'),'utf8');
assert.ok(key.includes('submitted')||key.includes('history'),'answer-key must check submitted attempt');
assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/lama-ppsc-preview-v\d+/,'public PWA must retain versioned cache');
console.log('Information Officer Paper 01: 100 original structural questions; 80 journalism and 20 related subjects; job isolation and answer rotation passed');
