/* LAMA PPSC Paper 9 — new original, free Headmaster/Headmistress practice.
 * No source claims official PPSC endorsement, current recruitment pattern,
 * or independent human academic review. All answers are in PUBLIC client JS,
 * so this is not suitable for paid or high-stakes examination security.
 */
'use strict';
(()=>{
 const parts=[window.LAMA_PPSC_HM09_1,window.LAMA_PPSC_HM09_2,window.LAMA_PPSC_HM09_3,window.LAMA_PPSC_HM09_4];
 if(parts.some(p=>!Array.isArray(p)||p.length!==25)){console.error('Paper 9 bank is incomplete; refusing to publish incomplete exam');return}
 const questions=parts.flat().map(q=>({...q,options:[...q.options]}));
 if(questions.length!==100||new Set(questions.map(q=>q.id)).size!==100){console.error('Invalid Paper 9 count or duplicate IDs');return}
 const normalized=text=>String(text||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const stems=new Set();
 for(const q of questions){
  if(!q.subject||!q.topic||!q.q||q.q.length<30||!q.explanation||q.explanation.length<40||!Array.isArray(q.options)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||new Set(q.options.map(normalized)).size!==4){console.error('Paper 9 failed structural preflight',q.id);return}
  const stem=normalized(q.q);
  if(stems.has(stem)){console.error('Paper 9 duplicate question',q.id);return}
  stems.add(stem);
 }
 if(!Array.isArray(window.LAMA_PPSC_PAPERS))return;
 const earlier=new Set(window.LAMA_PPSC_PAPERS.flatMap(p=>p.questions.map(q=>normalized(q.q))));
 if(questions.some(q=>earlier.has(normalized(q.q)))){console.error('Paper 9 overlaps a previously released question. Aborting');return}
 // Identical deterministic rotation as papers.js, stable on reload/print/answer key.
 for(const q of questions){
  const original=q.options.map((text,index)=>({text,index}));
  let hash=2166136261;
  for(const ch of q.id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const offset=hash%4;
  const rotated=original.map((_,i)=>original[(i+offset)%4]);
  q.answer=rotated.findIndex(item=>item.index===q.answer);
  q.options=rotated.map(item=>item.text);
 }
 const paper={
  id:'HM-2026-P09',
  title:'Paper 9 — Headmaster / Headmistress Original Practice',
  minutes:90,
  jobIds:['teaching'],
  access:'free',
  publishStatus:'public',
  reviewStatus:'automated-checked',
  qaStatus:'pass',
  practiceOnly:true,
  contentVersion:1,
  publishedOn:'2026-11-06',
  questionCount:100,
  questions
 };
 if(window.LAMA_PPSC_PAPERS.some(p=>p.id===paper.id)){console.error('Paper 9 ID already exists');return}
 window.LAMA_PPSC_PAPERS.push(paper);
})();
