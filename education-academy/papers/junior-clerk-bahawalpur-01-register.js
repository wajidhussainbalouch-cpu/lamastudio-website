/* LAMA PPSC Junior Clerk BS-11, Bahawalpur (Board of Revenue), Paper 01.
 * User-provided PPSC syllabus: 100 MCQs / 90 min; 80 General Ability / 20 MS Office & Computer Skills.
 * Independent academic review pending. Islamic Studies is subject to PPSC's GK alternative for non-Muslim applicants.
 * Public browser practice exposes answer keys and must NOT be used for a secured paid examination.
 */
'use strict';
(()=>{
 const parts=[window.LAMA_PPSC_JCB01_1,window.LAMA_PPSC_JCB01_2,window.LAMA_PPSC_JCB01_3,window.LAMA_PPSC_JCB01_4];
 if(parts.some(part=>!Array.isArray(part)||part.length!==25)){console.error('Junior Clerk Bahawalpur Paper 01 is incomplete');return}
 const questions=parts.flat().map(q=>({...q,options:[...q.options]}));
 // Unicode-aware comparison preserves Urdu words; answer-choice checks preserve significant symbols like $ in $A$1.
 const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const choice=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
 if(questions.length!==100||new Set(questions.map(q=>q.id)).size!==100)return;
 const stems=new Set(),topics=new Set();
 for(let i=0;i<100;i++){
  const q=questions[i],stem=norm(q.q),topic=norm(q.topic);
  if(q.id!=='JCB01-'+String(i+1).padStart(3,'0')||q.q.length<22||q.explanation.length<50||!q.subject||!q.topic||q.options.length!==4||new Set(q.options.map(choice)).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||stems.has(stem)||topics.has(topic)){console.error('Junior Clerk Bahawalpur question validation failed',q.id);return}
  stems.add(stem);topics.add(topic);
 }
 if(questions.slice(0,80).some(q=>q.subject==='MS Office and Computer Skills')||questions.slice(80).some(q=>q.subject!=='MS Office and Computer Skills')){console.error('Junior Clerk Bahawalpur 80/20 syllabus mismatch');return}
 if(!Array.isArray(window.LAMA_PPSC_PAPERS))return;
 const existing=window.LAMA_PPSC_PAPERS;
 const previous=new Set(existing.flatMap(p=>(p.questions||[]).map(q=>norm(q.q))));
 if(questions.some(q=>previous.has(norm(q.q)))){console.error('Junior Clerk Bahawalpur duplicates an existing paper');return}
 for(const q of questions){
  const original=q.options.map((text,index)=>({text,index}));let hash=2166136261;
  for(const ch of q.id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const offset=(hash+Number(q.id.slice(-3)))%4;
  const rotated=original.map((_,i)=>original[(i+offset)%4]);
  q.answer=rotated.findIndex(v=>v.index===q.answer);q.options=rotated.map(v=>v.text);
 }
 const paper={
  id:'JCB-BAHAWALPUR-2026-P01',sequence:1,
  title:'Paper 1 — Junior Clerk (BS-11), Bahawalpur Division · PPSC Syllabus Practice',
  minutes:90,jobIds:['junior-clerk-bahawalpur-bor'],
  access:'free',publishStatus:'public',reviewStatus:'automated-checked',qaStatus:'pass',
  practiceOnly:true,contentVersion:1,publishedOn:'2026-11-09',
  questionCount:100,syllabusAllocation:{generalAbility:80,msOfficeAndComputerSkills:20},
  candidateNote:'For non-Muslim candidates, the PPSC screenshot specifies General Knowledge in place of Islamic Studies; this paper currently includes Islamic Studies and does not yet offer the alternative form.',
  questions
 };
 if(existing.some(p=>p.id===paper.id)){console.error('Junior Clerk Bahawalpur paper ID already exists');return}
 const current=existing.filter(p=>p&&Array.isArray(p.questions)&&p.questions.length===100&&Array.isArray(p.jobIds)&&p.jobIds.some(id=>String(id).split(':')[0]==='junior-clerk-bahawalpur-bor'));
 if(current.length>=20){console.error('Junior Clerk Bahawalpur twenty-paper limit reached');return}
 existing.push(paper);
})();
