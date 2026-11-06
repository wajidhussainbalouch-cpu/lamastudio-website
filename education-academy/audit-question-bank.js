/* Offline audit: node education-academy/audit-question-bank.js */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'papers.js'),'utf8');
const context={window:{}};vm.runInNewContext(source,context,{timeout:3000});
const papers=context.window.LAMA_PPSC_PAPERS||[];
const errors=[],seenIds=new Set(),seenQuestions=new Map();
const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
for(const paper of papers){
 if(!paper.id||!Number.isInteger(paper.minutes)||paper.minutes<1)errors.push('Invalid paper metadata');
 const questions=paper.questions||[];console.log(paper.id+': '+questions.length+' questions, '+paper.minutes+' minutes');
 for(const q of questions){
  if(!q.id||seenIds.has(q.id))errors.push('Duplicate or missing ID '+q.id);seenIds.add(q.id);
  const n=normalize(q.q);if(n.length<12)errors.push('Question too short: '+q.id);
  if(seenQuestions.has(n))errors.push('Duplicate question text: '+q.id+' / '+seenQuestions.get(n));else seenQuestions.set(n,q.id);
  if(!Array.isArray(q.options)||q.options.length!==4||new Set(q.options.map(normalize)).size!==4)errors.push('Invalid or repeated options: '+q.id);
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)errors.push('Invalid answer index: '+q.id);
  if(!q.explanation||String(q.explanation).trim().length<20)errors.push('Missing or short explanation: '+q.id);
  if(!q.subject)errors.push('Missing subject: '+q.id);
 }
}
console.log('Total questions: '+seenIds.size+'; issues: '+errors.length);if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
