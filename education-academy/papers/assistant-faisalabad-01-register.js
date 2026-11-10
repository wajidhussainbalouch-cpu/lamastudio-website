/* Assistant (BS-16), Faisalabad, Board of Revenue — 2026 practice Paper 01.
 * Advert 08/2026, Case 36-RJ/2026; 100 MCQs, 90 minutes.
 * Independent academic and Urdu review pending. These are not official PPSC past questions.
 * Source browser exposes answers; NEVER use as secured premium examination inventory.
 */
'use strict';
(()=>{
 const parts=[window.LAMA_PPSC_AFSD01_1,window.LAMA_PPSC_AFSD01_2,window.LAMA_PPSC_AFSD01_3,window.LAMA_PPSC_AFSD01_4];
 if(parts.some(p=>!Array.isArray(p)||p.length!==25)){console.error('Assistant Faisalabad Paper 01 is incomplete');return}
 const questions=parts.flat().map(q=>({...q,options:[...q.options]}));
 const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const choice=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
 const ids=new Set(),stems=new Set(),topics=new Set();
 const subjectCount={};
 for(let i=0;i<questions.length;i++){
  const q=questions[i],s=norm(q.q),t=norm(q.topic);
  if(q.id!=='AFSD01-'+String(i+1).padStart(3,'0')||q.q.length<22||q.explanation.length<50||q.options.length!==4||new Set(q.options.map(choice)).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.subject||!t||ids.has(q.id)||stems.has(s)||topics.has(t)){
   console.error('Assistant Faisalabad question validation failed',q.id);return;
  }
  ids.add(q.id);stems.add(s);topics.add(t);subjectCount[q.subject]=(subjectCount[q.subject]||0)+1;
 }
 for(const subject of ['General Knowledge','Pakistan Studies','Current Affairs','Islamic Studies','Geography','Basic Mathematics','English','Urdu','Everyday Science','Basic Computer Studies']){
  if(subjectCount[subject]!==10){console.error('Assistant Faisalabad sample coverage is incomplete',subject);return;}
 }
 if(!Array.isArray(window.LAMA_PPSC_PAPERS))return;
 const all=window.LAMA_PPSC_PAPERS;
 const previous=new Set(all.flatMap(p=>(p.questions||[]).map(q=>norm(q.q))));
 if(questions.some(q=>previous.has(norm(q.q)))){console.error('Assistant Faisalabad duplicate question from earlier papers');return}
 for(const q of questions){
  const original=q.options.map((text,index)=>({text,index}));
  let hash=2166136261;for(const ch of q.id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const shift=(hash+Number(q.id.slice(-3)))%4;
  const rotated=original.map((_,i)=>original[(i+shift)%4]);
  q.answer=rotated.findIndex(v=>v.index===q.answer);
  q.options=rotated.map(v=>v.text);
 }
 const paper={
  id:'AFSD-FAISALABAD-2026-P01',sequence:1,
  title:'Paper 1 — Assistant (BS-16), Faisalabad · PPSC Syllabus Practice',
  minutes:90,jobIds:['assistant-faisalabad-bor'],
  access:'free',publishStatus:'public',reviewStatus:'automated-checked',qaStatus:'pass',
  practiceOnly:true,contentVersion:1,publishedOn:'2026-11-10',
  questionCount:100,syllabusAllocation:{generalAbility:100},
  candidateNote:'100 General Ability practice questions. Ten questions per subject are an editorial learning allocation, NOT a PPSC subject weight. PPSC specifies General Knowledge for non-Muslim candidates instead of Islamic Studies; an alternate practice form is pending. Independent academic review required.',
  questions
 };
 if(all.some(p=>p.id===paper.id)){console.error('Assistant Faisalabad paper already registered');return}
 const sameJob=all.filter(p=>Array.isArray(p.jobIds)&&p.jobIds.includes('assistant-faisalabad-bor'));
 if(sameJob.length>=20){console.error('Twenty-paper cap reached for Assistant Faisalabad');return}
 all.push(paper);
})();