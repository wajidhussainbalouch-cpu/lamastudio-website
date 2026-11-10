/* Assistant BS-16 Kot Addu, Paper 01. Independent academic review required.
 * PPSC Advertisement 07/2026, Case 29-RJ/2026; 100 MCQ General Ability, 90 minutes.
 * This is free practice content, not official PPSC questions or a secured exam.
 */
'use strict';
(()=>{
 const parts=[window.LAMA_PPSC_AKD01_1,window.LAMA_PPSC_AKD01_2,window.LAMA_PPSC_AKD01_3,window.LAMA_PPSC_AKD01_4];
 if(parts.some(p=>!Array.isArray(p)||p.length!==25)){console.error('Assistant Kot Addu Paper 01 incomplete');return}
 const questions=parts.flat().map(q=>({...q,options:[...q.options]}));
 const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const choice=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
 const ids=new Set(),stems=new Set(),topics=new Set();
 for(let i=0;i<questions.length;i++){
  const q=questions[i],s=norm(q.q),t=norm(q.topic);
  if(q.id!=='AKD01-'+String(i+1).padStart(3,'0')||q.q.length<22||q.explanation.length<50||q.options.length!==4||new Set(q.options.map(choice)).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.subject||!t||ids.has(q.id)||stems.has(s)||topics.has(t)){console.error('Invalid Kot Addu question',q.id);return}
  ids.add(q.id);stems.add(s);topics.add(t);
 }
 if(!Array.isArray(window.LAMA_PPSC_PAPERS))return;
 const all=window.LAMA_PPSC_PAPERS;
 const previous=new Set(all.flatMap(p=>(p.questions||[]).map(q=>norm(q.q))));
 if(questions.some(q=>previous.has(norm(q.q)))){console.error('Kot Addu question repeats an existing paper');return}
 for(const q of questions){
  let hash=2166136261;for(const ch of q.id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const original=q.options.map((text,index)=>({text,index}));const n=(hash+Number(q.id.slice(-3)))%4;
  const shifted=original.map((_,i)=>original[(i+n)%4]);q.answer=shifted.findIndex(x=>x.index===q.answer);q.options=shifted.map(x=>x.text);
 }
 if(all.some(p=>p.id==='AKD-KOT-ADDU-2026-P01'))return;
 const existing=all.filter(p=>Array.isArray(p.jobIds)&&p.jobIds.includes('assistant-kot-addu-bor'));
 if(existing.length>=20)return;
 all.push({id:'AKD-KOT-ADDU-2026-P01',sequence:1,title:'Paper 1 — Assistant (BS-16), Kot Addu · PPSC Syllabus Practice',minutes:90,jobIds:['assistant-kot-addu-bor'],access:'free',publishStatus:'public',reviewStatus:'automated-checked',qaStatus:'pass',practiceOnly:true,contentVersion:1,publishedOn:'2026-11-10',questionCount:100,syllabusAllocation:{generalAbility:100},candidateNote:'PPSC syllabus includes General Knowledge instead of Islamic Studies for non-Muslim candidates; an alternate practice form is pending. These AI-assisted practice questions are not an official past paper.',questions});
})();
