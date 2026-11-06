'use strict';
/* Original Headmaster Paper 3 regression tests: integrity, uniqueness, answer key, preserved papers. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,context={window:{},console};
function load(name){vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),context,{timeout:2500,filename:name})}
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
load('papers.js');
for(let i=1;i<=4;i++)load('papers/headmaster-02-part'+i+'.js');
load('papers/headmaster-02-register.js');
const earlier=context.window.LAMA_PPSC_PAPERS.slice();
assert.equal(earlier.length,2,'Paper 1 and Paper 2 must remain intact');
const raw=[];
for(let i=1;i<=4;i++){load('papers/headmaster-03-part'+i+'.js');raw.push(...context.window['LAMA_PPSC_HM03_'+i])}
assert.equal(raw.length,100,'four parts contain exactly 100 new questions');
load('papers/headmaster-03-register.js');
const papers=context.window.LAMA_PPSC_PAPERS;
assert.equal(papers.length,3,'three separate public practice papers');
assert.equal(papers[0],earlier[0],'legacy Paper 1 not replaced');
assert.equal(papers[1],earlier[1],'Paper 2 not replaced');
const p=papers.find(x=>x.id==='HM-2026-P03');
assert.ok(p,'Paper 3 registered');
assert.equal(p.title,'Paper 3 — Headmaster / Headmistress Original Practice');
assert.equal(p.minutes,90);
assert.equal(p.questions.length,100);
assert.equal(p.access,'free');
assert.equal(p.publishStatus,'public');
assert.equal(p.practiceOnly,true);
assert.equal(p.qaStatus,'pass');
assert.equal(p.reviewStatus,'automated-checked');
assert.deepEqual(Array.from(p.jobIds),['teaching']);
assert.equal(papers.reduce((n,x)=>n+x.questions.length,0),300);
const olderStems=new Set(earlier.flatMap(x=>x.questions.map(q=>norm(q.q))));
const olderIds=new Set(earlier.flatMap(x=>x.questions.map(q=>q.id)));
const privateHashes=new Set(JSON.parse(fs.readFileSync(path.join(root,'papers/prior-private-stem-fingerprints.json'),'utf8')).hashes);
function hash(s){let x=2166136261;for(const ch of s)x=Math.imul(x^ch.charCodeAt(0),16777619)>>>0;return x.toString(16).padStart(8,'0')}
const seen=new Set(),topics=new Set(),subjects=new Set(),positions=[0,0,0,0];
const stop=new Set('a an the and or in on for to of is are was were which what when how that this who does best most school teacher pupil pupils student students should will can it with by from as do be not one only'.split(' '));
const wordset=s=>new Set(norm(s).split(' ').filter(w=>w.length>2&&!stop.has(w)));
function jaccard(a,b){const A=wordset(a),B=wordset(b);let n=0;for(const w of A)if(B.has(w))n++;return n/(A.size+B.size-n||1)}
for(let i=0;i<100;i++){
 const q=p.questions[i],before=raw[i],stem=norm(q.q);
 assert.equal(q.id,'HM03-'+String(i+1).padStart(3,'0'));
 assert.ok(q.q.length>=45,'short question '+q.id);
 assert.ok(q.explanation.length>=65,'short explanation '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(norm)).size,4,'duplicate options '+q.id);
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
 assert.equal(q.options[q.answer],before.options[before.answer],'rotated answer must preserve correct text '+q.id);
 assert.ok(!olderIds.has(q.id));
 assert.ok(!olderStems.has(stem),'Paper 1/2 question copied '+q.id);
 assert.ok(!privateHashes.has(hash(stem)),'prior unpublished draft copied '+q.id);
 assert.ok(!seen.has(stem),'new Paper 3 duplicate '+q.id);seen.add(stem);
 for(let j=0;j<i;j++)assert.ok(jaccard(q.q,p.questions[j].q)<.60,'repeated scenario '+q.id+' vs '+p.questions[j].id);
 topics.add(norm(q.topic));subjects.add(q.subject);positions[q.answer]++;
}
assert.equal(seen.size,100);
assert.ok(topics.size>=90);
assert.ok(subjects.size>=20);
assert.ok(positions.every(n=>n>=15&&n<=35),'unbalanced answer letters '+positions.join('/'));
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const print=fs.readFileSync(path.join(root,'print.html'),'utf8');
const keyHtml=fs.readFileSync(path.join(root,'answer-key.html'),'utf8');
const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const scripts=['headmaster-03-part1.js','headmaster-03-part2.js','headmaster-03-part3.js','headmaster-03-part4.js','headmaster-03-register.js'];
for(const name of scripts){
 assert.ok(index.includes(name),'Main exam missing '+name);
 assert.ok(print.includes(name),'Printable exam missing '+name);
 assert.ok(keyHtml.includes(name),'Answer key missing '+name);
 assert.ok(worker.includes("'./papers/"+name+"'"),'PWA missing '+name);
}
const inline=[...keyHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)?.[1];
assert.ok(inline&&inline.includes('attempt.submitted'));
function answerPage(attempt){
 const nodes=new Map();
 function element(tag='div'){
  return {tag,children:[],textContent:'',hidden:true,className:'',append(...parts){this.children.push(...parts)},addEventListener(){}};
 }
 const dom={getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)},createElement:element};
 const store={getItem:key=>key==='lama_ppsc_attempt_HM-2026-P03'&&attempt?JSON.stringify(attempt):null};
 vm.runInNewContext(inline,{window:{LAMA_PPSC_PAPERS:papers,print(){}},document:dom,localStorage:store,
  location:{search:'?paper=HM-2026-P03'},URLSearchParams,Number,String,Math,JSON},{timeout:2500});
 return dom;
}
assert.equal(answerPage(null).getElementById('keyQuestions').children.length,0,'no keys before exam');
assert.equal(answerPage({startedAt:1,submitted:false,answers:{}}).getElementById('keyQuestions').children.length,0,'no keys during exam');
const answers=Object.fromEntries(p.questions.slice(0,11).map(q=>[q.id,q.answer]));
const submitted=answerPage({startedAt:1,submittedAt:2,submitted:true,answers});
assert.equal(submitted.getElementById('keyQuestions').children.length,100,'100 answers after submission');
assert.equal(submitted.getElementById('printAnswerKey').hidden,false,'PDF printing unlocked');
assert.ok(submitted.getElementById('keyStatus').textContent.includes('11 correct'));
console.log('Paper 3 passed: 100 unique MCQs; 300 public paper slots; independent answer keys');
console.log('Topics',topics.size,'subjects',subjects.size,'post-rotation answer positions',positions.join('/'));
