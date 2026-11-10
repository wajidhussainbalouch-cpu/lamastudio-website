/* Run: node education-academy/validate-papers.cjs
 * No third-party dependencies. Validates structure and flags repetition for academic review.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'papers.js'),'utf8');
const sandbox={window:{}};vm.runInNewContext(src,sandbox,{timeout:2000});
for(const name of ['headmaster-02-part1.js','headmaster-02-part2.js','headmaster-02-part3.js','headmaster-02-part4.js','headmaster-02-register.js','headmaster-03-part1.js','headmaster-03-part2.js','headmaster-03-part3.js','headmaster-03-part4.js','headmaster-03-register.js','headmaster-04-part1.js','headmaster-04-part2.js','headmaster-04-part3.js','headmaster-04-part4.js','headmaster-04-register.js','headmaster-05-part1.js','headmaster-05-part2.js','headmaster-05-part3.js','headmaster-05-part4.js','headmaster-05-register.js','headmaster-06-part1.js','headmaster-06-part2.js','headmaster-06-part3.js','headmaster-06-part4.js','headmaster-06-register.js','headmaster-07-part1.js','headmaster-07-part2.js','headmaster-07-part3.js','headmaster-07-part4.js','headmaster-07-register.js','headmaster-08-part1.js','headmaster-08-part2.js','headmaster-08-part3.js','headmaster-08-part4.js','headmaster-08-register.js','headmaster-09-part1.js','headmaster-09-part2.js','headmaster-09-part3.js','headmaster-09-part4.js','headmaster-09-register.js','headmaster-10-part1.js','headmaster-10-part2.js','headmaster-10-part3.js','headmaster-10-part4.js','headmaster-10-register.js','headmaster-11-part1.js','headmaster-11-part2.js','headmaster-11-part3.js','headmaster-11-part4.js','headmaster-11-register.js','headmaster-12-part1.js','headmaster-12-part2.js','headmaster-12-part3.js','headmaster-12-part4.js','headmaster-12-register.js','headmaster-13-part1.js','headmaster-13-part2.js','headmaster-13-part3.js','headmaster-13-part4.js','headmaster-13-register.js','headmaster-14-part1.js','headmaster-14-part2.js','headmaster-14-part3.js','headmaster-14-part4.js','headmaster-14-register.js','headmaster-15-part1.js','headmaster-15-part2.js','headmaster-15-part3.js','headmaster-15-part4.js','headmaster-15-register.js','headmaster-16-part1.js','headmaster-16-part2.js','headmaster-16-part3.js','headmaster-16-part4.js','headmaster-16-register.js','headmaster-17-part1.js','headmaster-17-part2.js','headmaster-17-part3.js','headmaster-17-part4.js','headmaster-17-register.js','headmaster-18-part1.js','headmaster-18-part2.js','headmaster-18-part3.js','headmaster-18-part4.js','headmaster-18-register.js','headmaster-19-part1.js','headmaster-19-part2.js','headmaster-19-part3.js','headmaster-19-part4.js','headmaster-19-register.js','headmaster-20-part1.js','headmaster-20-part2.js','headmaster-20-part3.js','headmaster-20-part4.js','headmaster-20-register.js','information-officer-01-part1.js','information-officer-01-part2.js','information-officer-01-part3.js','information-officer-01-part4.js','information-officer-01-register.js','information-officer-02-part1.js','information-officer-02-part2.js','information-officer-02-part3.js','information-officer-02-part4.js','information-officer-02-register.js','information-officer-03-part1.js','information-officer-03-part2.js','information-officer-03-part3.js','information-officer-03-part4.js','information-officer-03-register.js','junior-clerk-bahawalpur-01-part1.js','junior-clerk-bahawalpur-01-part2.js','junior-clerk-bahawalpur-01-part3.js','junior-clerk-bahawalpur-01-part4.js','junior-clerk-bahawalpur-01-register.js','junior-clerk-faisalabad-01-part1.js','junior-clerk-faisalabad-01-part2.js','junior-clerk-faisalabad-01-part3.js','junior-clerk-faisalabad-01-part4.js','junior-clerk-faisalabad-01-register.js','assistant-kot-addu-01-part1.js','assistant-kot-addu-01-part2.js','assistant-kot-addu-01-part3.js','assistant-kot-addu-01-part4.js','assistant-kot-addu-01-register.js','assistant-faisalabad-01-part1.js','assistant-faisalabad-01-part2.js','assistant-faisalabad-01-part3.js','assistant-faisalabad-01-part4.js','assistant-faisalabad-01-register.js']){
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'papers',name),'utf8'),sandbox,{timeout:2000,filename:name});
}
const papers=sandbox.window.LAMA_PPSC_PAPERS;
const errors=[],warnings=[],normalize=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim(),normalizeChoice=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const globalIds=new Set(),globalStems=new Map();
if(!Array.isArray(papers)||!papers.length)errors.push('No paper collection');
for(const paper of papers||[]){
 const ids=new Set(),texts=new Map(),subjects=new Map();
 if(!Array.isArray(paper.questions)||paper.questions.length!==100)errors.push(paper.id+': expected 100 questions');
 if(paper.minutes!==90)errors.push(paper.id+': expected 90-minute exam');
 for(const [i,q] of (paper.questions||[]).entries()){
  const tag=paper.id+' Q'+(i+1);
  if(!q.id||ids.has(q.id))errors.push(tag+': missing/duplicate question id');ids.add(q.id);
  if(globalIds.has(q.id))errors.push(tag+': repeated ID in another paper');globalIds.add(q.id);
  if(!q.subject||!q.q||!q.explanation)errors.push(tag+': missing subject/question/explanation');
  if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!String(x).trim()))errors.push(tag+': four non-empty options required');
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)errors.push(tag+': answer index must be 0-3');
  if(Array.isArray(q.options)&&new Set(q.options.map(normalizeChoice)).size!==q.options.length)errors.push(tag+': duplicate answer options');
  const n=normalize(q.q);if(texts.has(n))errors.push(tag+': duplicate question text with '+texts.get(n));texts.set(n,tag);
  if(globalStems.has(n))errors.push(tag+': question text repeats across papers with '+globalStems.get(n));globalStems.set(n,tag);
  const stem=n.split(' ').slice(0,9).join(' ');if(stem.length>40){const count=subjects.get(stem)||0;subjects.set(stem,count+1)}
  if(/foundational concept in .*consult standard teacher education references/i.test(q.explanation))warnings.push(tag+': generic explanation; replace with subject-specific reasoning');
  if(String(q.q).length<22)warnings.push(tag+': short question; check difficulty and context');
 }
 for(const [stem,n] of subjects)if(n>=4)warnings.push(paper.id+': repeated question opening '+n+' times: '+stem);
}
console.log('PPSC bank validation:',errors.length,'errors,',warnings.length,'academic-review warnings');
for(const x of errors)console.error('ERROR',x);
for(const x of warnings.slice(0,35))console.warn('REVIEW',x);
if(warnings.length>35)console.warn('...and',warnings.length-35,'more review warnings');
if(errors.length)process.exitCode=1;
