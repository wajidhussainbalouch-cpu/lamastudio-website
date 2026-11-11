/* Secretary 'A' Class Market Committee (BS-17), PAMRA — Paper 01.
 * PPSC Advertisement 08/2026, 47-RJ/2026; 60% qualification-related,
 * 40% General Ability, 100 MCQs / 90 minutes. Topic split is editorial.
 * Independent academic review pending; NOT an official PPSC previous paper.
 * Browser-side answer keys MUST NOT be used for secured paid examinations.
 */
'use strict';
(()=>{
 const parts=[window.LAMA_PPSC_SAC01_1,window.LAMA_PPSC_SAC01_2,window.LAMA_PPSC_SAC01_3,window.LAMA_PPSC_SAC01_4];
 if(parts.some(p=>!Array.isArray(p)||p.length!==25)){console.error('Secretary A Market Committee Paper 01 incomplete');return}
 const questions=parts.flat().map(q=>({...q,options:[...q.options]}));
 const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const choice=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
 const ids=new Set(),stems=new Set(),topics=new Set(),counts={};
 for(let i=0;i<100;i++){
  const q=questions[i],stem=norm(q.q),topic=norm(q.topic);
  if(q.id!=='SAC01-'+String(i+1).padStart(3,'0')||q.q.length<22||q.explanation.length<48||
   !q.subject||!q.domain||topic.length<4||!Array.isArray(q.options)||q.options.length!==4||
   new Set(q.options.map(choice)).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||
   ids.has(q.id)||stems.has(stem)||topics.has(topic)){console.error('Secretary A invalid item',q.id);return}
  ids.add(q.id);stems.add(stem);topics.add(topic);counts[q.subject]=(counts[q.subject]||0)+1;
 }
 if(counts['Qualification-related knowledge']!==60||
    questions.slice(0,60).some(q=>q.subject!=='Qualification-related knowledge')||
    questions.slice(60).some(q=>q.subject==='Qualification-related knowledge')||
    Object.entries(counts).filter(([k])=>k!=='Qualification-related knowledge').reduce((a,[,n])=>a+n,0)!==40){
  console.error('Secretary A 60/40 distribution mismatch');return
 }
 if(!Array.isArray(window.LAMA_PPSC_PAPERS))return;
 const all=window.LAMA_PPSC_PAPERS;
 const previous=new Set(all.flatMap(p=>(p.questions||[]).map(q=>norm(q.q))));
 if(questions.some(q=>previous.has(norm(q.q)))){console.error('Secretary A repeats an earlier question');return}
 if(all.some(p=>p.id==='SAC-PAMRA-2026-P01'))return;
 if(all.filter(p=>Array.isArray(p.jobIds)&&p.jobIds.includes('secretary-a-market-pamra')).length>=20)return;
 for(const q of questions){
  const original=q.options.map((text,index)=>({text,index}));
  let hash=2166136261;for(const ch of q.id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const offset=(hash+Number(q.id.slice(-3)))%4;
  const rotated=original.map((_,i)=>original[(i+offset)%4]);
  q.answer=rotated.findIndex(x=>x.index===q.answer);q.options=rotated.map(x=>x.text);
 }
 all.push({
  id:'SAC-PAMRA-2026-P01',sequence:1,
  title:"Paper 1 — Secretary 'A' Class Market Committee (BS-17) · PPSC Syllabus Practice",
  minutes:90,jobIds:['secretary-a-market-pamra'],
  access:'free',publishStatus:'public',reviewStatus:'automated-checked',qaStatus:'pass',
  practiceOnly:true,contentVersion:1,publishedOn:'2026-11-11',
  questionCount:100,syllabusAllocation:{qualificationRelated:60,generalAbility:40},
  candidateNote:'PPSC lists approximately 60% qualification-related and 40% General Ability questions. Agricultural Economics, Marketing, Agribusiness, Finance, Supply Chain and Research Methods topic choices are an original academy practice interpretation from eligible degree fields, not official PPSC topic allocations. Human academic review pending.',
  questions
 });
})();