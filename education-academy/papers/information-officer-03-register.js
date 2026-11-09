/* LAMA PPSC — Information Officer (BS-17) original educational practice, Paper 03.
 * Independent academic checking and official recruitment-specific syllabus verification pending.
 * Public free-practice browser code includes answer keys: never use for secured paid examinations.
 */
'use strict';
(()=>{
 const parts=[window.LAMA_PPSC_IO03_1,window.LAMA_PPSC_IO03_2,window.LAMA_PPSC_IO03_3,window.LAMA_PPSC_IO03_4];
 if(parts.some(p=>!Array.isArray(p)||p.length!==25)){console.error('Information Officer Paper 03 incomplete; aborting');return}
 const questions=parts.flat().map(q=>({...q,options:[...q.options]}));
 const norm=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 if(questions.length!==100||new Set(questions.map(q=>q.id)).size!==100){console.error('Information Officer Paper 03 invalid count/IDs');return}
 const seen=new Set();
 for(let i=0;i<questions.length;i++){
  const q=questions[i],stem=norm(q.q);
  if(q.id!=='IO03-'+String(i+1).padStart(3,'0')||q.q.length<45||q.explanation.length<65||!q.subject||!q.topic||q.options.length!==4||new Set(q.options.map(norm)).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||seen.has(stem)){console.error('Information Officer Paper 03 preflight failed',q.id);return}
  seen.add(stem);
 }
 if(!Array.isArray(window.LAMA_PPSC_PAPERS))return;
 const previousStems=new Set(window.LAMA_PPSC_PAPERS.flatMap(p=>(p.questions||[]).map(q=>norm(q.q))));
 if(questions.some(q=>previousStems.has(norm(q.q)))){console.error('Information Officer Paper 03 duplicates an existing paper question');return}
 // Deterministic ID-derived rotation, identical on candidate exam, print and answer review.
 for(const q of questions){
  const original=q.options.map((text,index)=>({text,index}));
  let hash=2166136261;
  for(const ch of q.id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const offset=(hash+Number(q.id.slice(-3)))%4;
  const rotated=original.map((_,i)=>original[(i+offset)%4]);
  q.answer=rotated.findIndex(item=>item.index===q.answer);
  q.options=rotated.map(item=>item.text);
 }
 const paper={
  id:'INFO-2026-P03',
  sequence:3,
  title:'Paper 3 — Information Officer (BS-17) Original Practice',
  minutes:90,
  jobIds:['information-officer'],
  access:'free',
  publishStatus:'public',
  reviewStatus:'automated-checked',
  qaStatus:'pass',
  practiceOnly:true,
  contentVersion:1,
  publishedOn:'2026-11-09',
  questionCount:100,
  questions
 };
 if(window.LAMA_PPSC_PAPERS.some(p=>p.id===paper.id)){console.error('Information Officer Paper 03 ID already exists');return}
 // The teaching-family twenty-paper quota must not block or subsidize this separate job.
 const current=window.LAMA_PPSC_PAPERS.filter(p=>p&&Array.isArray(p.questions)&&p.questions.length===100&&Array.isArray(p.jobIds)&&p.jobIds.some(id=>String(id).split(':')[0]==='information-officer'));
 if(current.length>=20){console.error('Information Officer twenty-paper ceiling reached');return}
 window.LAMA_PPSC_PAPERS.push(paper);
})();
