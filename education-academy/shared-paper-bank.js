/* LAMA PPSC — reusable, syllabus-matched PUBLIC practice bank.
 * Composes source-credited papers; DOES NOT create new independent questions.
 * Browser-side answer keys are visible: not for secret/premium examination delivery.
 * Source papers must load before this file, paper-library.js afterwards.
 */
'use strict';
(()=>{
 const existing=window.LAMA_PPSC_PAPERS;
 const output=[];
 const audit={status:'not-ready',originalPapers:0,sharedPapers:0,juniorClerkPool:{general:0,office:0},itPool:0};
 window.LAMA_PPSC_SHARED_PAPERS=output;
 window.LAMA_PPSC_SHARED_BANK_AUDIT=audit;
 if(!Array.isArray(existing)){audit.reason='Source paper registry absent';return}
 const byId=id=>existing.find(p=>p.id===id&&Array.isArray(p.questions)&&p.questions.length===100);
 const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const hash=s=>{let x=2166136261;for(const ch of String(s))x=Math.imul(x^ch.charCodeAt(0),16777619)>>>0;return x>>>0};
 const rng=seed=>{let a=hash(seed)||1;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}};
 const permute=(values,seed)=>{const array=values.slice(),rand=rng(seed);for(let i=array.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[array[i],array[j]]=[array[j],array[i]]}return array};
 const unique=values=>{const seen=new Set();return values.filter(q=>{if(!q||!q.id||!q.q||!Array.isArray(q.options)||q.options.length!==4)return false;const key=norm(q.q);if(!key||seen.has(key))return false;seen.add(key);return true})};
 const jcb=byId('JCB-BAHAWALPUR-2026-P01'),jcf=byId('JCF-FAISALABAD-2026-P01');
 if(!jcb||!jcf){audit.reason='Both existing Junior Clerk source papers are required';return}
 const sources=[...jcb.questions,...jcf.questions];
 const general=unique(sources.filter(q=>q.subject!=='MS Office and Computer Skills'));
 const office=unique(sources.filter(q=>q.subject==='MS Office and Computer Skills'));
 audit.juniorClerkPool={general:general.length,office:office.length};
 if(general.length<160||office.length<40){audit.reason='80/20 source bank lacks 160 distinct General Ability and 40 distinct Office questions';return}
 function derivedQuestion(original,jobId,paperNo,position,group,subject){
  const idPrefix=group==='junior-clerk-80-20'?(jobId.includes('adc-revenue')?'JCADC':'JCDC'):'JCOP';
  const q={...original,options:[...original.options],id:idPrefix+String(paperNo).padStart(2,'0')+'-'+String(position+1).padStart(3,'0'),
   sourceQuestionId:original.id,sharedBankGroup:group,originalSubject:original.subject,
   provenance:'Previously authored LAMA practice item (reused, not newly written)'};
  if(subject)q.subject=subject;
  const offset=hash(q.id+':answers')%4;
  const old=q.options.map((text,index)=>({text,index}));
  const rotated=old.map((_,i)=>old[(i+offset)%4]);
  q.answer=rotated.findIndex(o=>o.index===q.answer);q.options=rotated.map(o=>o.text);
  return q;
 }
 function paper(jobId,paperId,title,sequence,items,group,allocation){
  const shuffled=permute(items,paperId+':order');
  if(shuffled.length!==100||new Set(shuffled.map(q=>norm(q.q))).size!==100)throw Error(paperId+': 100 distinct source stems required');
  const questions=shuffled.map((q,i)=>derivedQuestion(q,jobId,sequence,i,group,
   group==='office-it-100'?(q.subject==='MS Office and Computer Skills'?'MS Office':'Information Technology'):null));
  return {id:paperId,sequence,title,jobIds:[jobId],minutes:90,access:'free',publishStatus:'public',reviewStatus:'automated-checked',qaStatus:'pass',practiceOnly:true,
   sharedBankGroup:group,sharedFromExistingQuestions:true,newOriginalQuestionCount:0,
   candidateNote:'This paper reuses previously authored LAMA questions from a shared syllabus-aligned bank. It is a shuffled selection, not 100 newly authored questions or an official PPSC past paper. Source answers are accessible and academic review is pending.',
   questionCount:100,syllabusAllocation:allocation,questions};
 }
 for(const [jobId,prefix,label] of [
  ['junior-clerk-kot-addu-dc-bor','JCKDC','Junior Clerk (BS-11), DC Office Kot Addu'],
  ['junior-clerk-kot-addu-adc-revenue-bor','JCKADC','Junior Clerk (BS-11), ADC Revenue Kot Addu']
 ]){
  const g=permute(general,jobId+':general'),o=permute(office,jobId+':office');
  for(let n=1;n<=2;n++){
   const selected=[...g.slice((n-1)*80,n*80),...o.slice((n-1)*20,n*20)];
   output.push(paper(jobId,prefix+'-2026-P'+String(n).padStart(2,'0'),
    'Paper '+n+' — '+label+' · Reusable 80/20 Syllabus Practice',
    n,selected,'junior-clerk-80-20',{generalAbility:80,msOfficeAndComputerSkills:20}));
  }
 }
 // Junior Computer Operator: 100% MS Office / I.T. No GK, English or other subject filler.
 const assistants=['AKD-KOT-ADDU-2026-P01','AFSD-FAISALABAD-2026-P01'].flatMap(id=>(byId(id)?.questions||[]).filter(q=>q.subject==='Basic Computer Studies'));
 const secretary=(byId('SAC-PAMRA-2026-P01')?.questions||[]).filter(q=>q.subject==='Basic Computer Studies');
 const demo=(byId('DEMO-01')?.questions||[]).filter(q=>q.subject==='Computer');
 const hm=existing.filter(p=>/^HM-2026-P\d{2}$/.test(p.id)).flatMap(p=>p.questions)
  .filter(q=>['ICT','Information Technology','Computer Literacy','Computer Science','Digital Literacy','Digital Systems','Digital Safety','Digital Records','Digital Security'].includes(q.subject))
  .filter(q=>/(comput|spreadsheet|excel|word|powerpoint|file|data|database|network|security|software|hardware|internet|browser|web|system|digital|password|email|ict|upload|backup|storage|cpu|printer|qr|cloud|encrypt|server|login|privacy)/i.test(q.q+' '+(q.topic||'')));
 const core=unique([...office,...assistants,...secretary,...demo]);
 const coreKeys=new Set(core.map(q=>norm(q.q)));
 const other=permute(unique(hm),'jco:technology-bank').filter(q=>!coreKeys.has(norm(q.q)));
 const totalPool=unique([...core,...other]);
 audit.itPool=totalPool.length;
 if(totalPool.length>=100){
  output.push(paper('junior-computer-operator-kot-addu-adc-bor','JCOP-2026-P01',
   'Paper 1 — Junior Computer Operator (BS-12), ADC Kot Addu · 100% MS Office & I.T. Practice',
   1,totalPool.slice(0,100),'office-it-100',{msOfficeAndInformationTechnology:100}));
 }else{audit.jcoReason='Fewer than 100 distinct qualifying source IT questions; do not publish an incomplete JCO test'}
 audit.originalPapers=existing.length;audit.sharedPapers=output.length;
 audit.status=output.length===5?'ready':'partial';
 // Do not mutate LAMA_PPSC_PAPERS: a generated view is not 500 new editorial questions.
})();
