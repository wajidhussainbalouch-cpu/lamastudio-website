'use strict';
/* Paper 16 structural, originality, answer-key and backward-compatibility regression.
 * Automated checks do not replace independent subject-expert review.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,context={window:{},console};
const load=name=>vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name,timeout:3000});
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
load('papers.js');
for(let n=2;n<=15;n++){
 for(let i=1;i<=4;i++)load('papers/headmaster-'+String(n).padStart(2,'0')+'-part'+i+'.js');
 load('papers/headmaster-'+String(n).padStart(2,'0')+'-register.js');
}
const earlier=context.window.LAMA_PPSC_PAPERS.slice();
assert.equal(earlier.length,15,'Papers 1–15 registry must remain intact');
const raw=[];
for(let i=1;i<=4;i++){load('papers/headmaster-16-part'+i+'.js');raw.push(...context.window['LAMA_PPSC_HM16_'+i])}
assert.equal(raw.length,100);
load('papers/headmaster-16-register.js');
const papers=context.window.LAMA_PPSC_PAPERS;
assert.equal(papers.length,16,'Paper 16 must add exactly one complete paper');
earlier.forEach((p,i)=>assert.equal(papers[i],p,'old paper changed at position '+i));
const p=papers.find(p=>p.id==='HM-2026-P16');
assert.ok(p,'Paper 16 not registered');
assert.equal(p.questions.length,100);
assert.equal(p.minutes,90);
assert.equal(p.access,'free');
assert.equal(p.publishStatus,'public');
assert.equal(p.reviewStatus,'automated-checked');
assert.equal(p.qaStatus,'pass');
assert.equal(p.practiceOnly,true);
assert.deepEqual(Array.from(p.jobIds),['teaching']);
assert.equal(papers.reduce((n,p)=>n+p.questions.length,0),1600);
const priorIds=new Set(earlier.flatMap(p=>p.questions.map(q=>q.id)));
const priorStems=new Set(earlier.flatMap(p=>p.questions.map(q=>norm(q.q))));
const privateHashes=new Set(JSON.parse(fs.readFileSync(path.join(root,'papers/prior-private-stem-fingerprints.json'),'utf8')).hashes);
const hash=s=>{let x=2166136261;for(const ch of s)x=Math.imul(x^ch.charCodeAt(0),16777619)>>>0;return x.toString(16).padStart(8,'0')};
const seen=new Set(),subjects=new Set(),topics=new Set(),positions=[0,0,0,0];
const stop=new Set('a an the and or in on for to of is are was were which what when how that this who does best most school teacher pupil pupils student students should will can it with by from as do be not one only'.split(' '));
const wordset=s=>new Set(norm(s).split(' ').filter(w=>w.length>2&&!stop.has(w)));
function jaccard(a,b){const A=wordset(a),B=wordset(b);let count=0;for(const w of A)if(B.has(w))count++;return count/(A.size+B.size-count||1)}
for(let i=0;i<100;i++){
 const q=p.questions[i],before=raw[i],stem=norm(q.q);
 assert.equal(q.id,'HM16-'+String(i+1).padStart(3,'0'));
 assert.ok(q.q.length>=45,'short question '+q.id);
 assert.ok(q.explanation.length>=65,'short explanation '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(norm)).size,4,'duplicate option '+q.id);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=3);
 assert.equal(q.options[q.answer],before.options[before.answer],'answer rotation altered correct text '+q.id);
 assert.ok(!priorIds.has(q.id),'duplicate ID '+q.id);
 assert.ok(!priorStems.has(stem),'duplicate older question '+q.id);
 assert.ok(!privateHashes.has(hash(stem)),'same question as fingerprinted private draft '+q.id);
 assert.ok(!seen.has(stem),'duplicate Paper 16 stem '+q.id);
 for(let j=0;j<i;j++)assert.ok(jaccard(q.q,p.questions[j].q)<.6,'near-repeat '+q.id+' versus '+p.questions[j].id);
 seen.add(stem);topics.add(norm(q.topic));subjects.add(q.subject);positions[q.answer]++;
}
assert.equal(seen.size,100);
assert.equal(topics.size,100);
assert.ok(subjects.size>=20);
assert.ok(positions.every(n=>n>=16&&n<=35),'imbalanced answer letters '+positions);
const files=['index.html','print.html','answer-key.html','sw.js'];
const required=[1,2,3,4].map(n=>'headmaster-16-part'+n+'.js').concat('headmaster-16-register.js');
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const name of required)assert.ok(html.includes(name),'missing '+name+' in '+file);
}
const html=fs.readFileSync(path.join(root,'answer-key.html'),'utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)?.[1];
assert.ok(inline&&inline.includes('attempt.submitted'));
function answerPage(attempt){
 const nodes=new Map();
 const element=tag=>({tag,children:[],textContent:'',hidden:true,className:'',append(...x){this.children.push(...x)},addEventListener(){}});
 const document={getElementById(id){if(!nodes.has(id))nodes.set(id,element('div'));return nodes.get(id)},createElement:element};
 const localStorage={getItem(key){return key==='lama_ppsc_attempt_HM-2026-P16'&&attempt?JSON.stringify(attempt):null}};
 vm.runInNewContext(inline,{window:{LAMA_PPSC_PAPERS:papers,print(){}},document,localStorage,location:{search:'?paper=HM-2026-P16'},URLSearchParams,Number,String,Math,JSON},{timeout:3000});
 return nodes;
}
assert.equal(answerPage(null).get('keyQuestions').children.length,0,'no answer key before attempt');
assert.equal(answerPage({startedAt:1,submitted:false,answers:{}}).get('keyQuestions').children.length,0,'no answer key during attempt');
const submitted={startedAt:1,submittedAt:2,submitted:true,answers:Object.fromEntries(p.questions.slice(0,9).map(q=>[q.id,q.answer]))};
const result=answerPage(submitted);
assert.equal(result.get('keyQuestions').children.length,100,'100 reviewed answers after submission');
assert.equal(result.get('printAnswerKey').hidden,false);
assert.ok(result.get('keyStatus').textContent.includes('9 correct'));
console.log('Paper 16 validated: 100 MCQs; fifteen distinct papers and 1600 public practice positions');
console.log('Subjects '+subjects.size+'; unique topics '+topics.size+'; answer distribution '+positions.join('/'));
