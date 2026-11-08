/* Job-wise public practice library. One job catalog, one published question-bank registry.
   Never treat planned papers, editorial drafts or local storage as paid access control. */
'use strict';
(()=>{
 const LEGACY_PUBLIC_ID='DEMO-01';
 const HISTORY_KEY='lama_ppsc_history_v1';
 const CLEAR_KEY='lama_ppsc_history_cleared_at';
 const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
 const jobs=()=>window.LamaAcademyJobCatalog;
 const variants=()=>jobs()?.options()||[];
 const jobId=id=>String(id||'').split(':')[0];
 const isPublic=paper=>Boolean(paper&&typeof paper.id==='string'&&Array.isArray(paper.questions)&&paper.questions.length===100&&Number.isInteger(paper.minutes)&&paper.minutes>0&&(paper.id===LEGACY_PUBLIC_ID||(paper.access==='free'&&paper.publishStatus==='public'&&(paper.reviewStatus==='approved'||(paper.reviewStatus==='automated-checked'&&paper.qaStatus==='pass'&&paper.practiceOnly===true)))));
 // The owner's fixed paper ceiling is enforced independently for each job family.
 // Job variants (e.g. teaching:0 and teaching:1) share the same family and count.
 const MAX_PAPERS_PER_JOB=20;
 const candidates=()=>Array.isArray(window.LAMA_PPSC_PAPERS)?window.LAMA_PPSC_PAPERS.filter(isPublic):[];
 // Stable numerical order across public paper list, job-specific library and side menu.
 // Demo Paper 1 keeps its historic ID and saved attempt key.
 const paperNumber=paper=>{
  if(paper.id===LEGACY_PUBLIC_ID)return 1;
  if(Number.isInteger(paper.sequence)&&paper.sequence>0)return paper.sequence;
  const m=String(paper.id||'').match(/(?:^|[-_])P(?:APER)?0*([0-9]+)$/i)||String(paper.title||'').match(/\bPaper\s+([0-9]+)\b/i);
  return m?Number(m[1]):null;
 };
 const comparePapers=(a,b)=>{
  const na=paperNumber(a),nb=paperNumber(b);
  if(na!==null&&nb!==null&&na!==nb)return na-nb;
  if(na!==null&&nb===null)return -1;
  if(nb!==null&&na===null)return 1;
  return String(a.id).localeCompare(String(b.id));
 };

 const assignedJobs=paper=>[...new Set((Array.isArray(paper.jobIds)?paper.jobIds:(paper.id===LEGACY_PUBLIC_ID?['teaching']:[])).map(jobId).filter(Boolean))];
 const forJob=id=>candidates().filter(paper=>assignedJobs(paper).includes(jobId(id))).sort(comparePapers).slice(0,MAX_PAPERS_PER_JOB);
 // Only expose papers occupying an allowed job slot. The source registry is never deleted.
 const list=()=>{
  const counts=new Map();
  return candidates().sort(comparePapers).filter(paper=>{
   let allowed=false;
   for(const id of assignedJobs(paper)){
    const count=counts.get(id)||0;
    if(count<MAX_PAPERS_PER_JOB){counts.set(id,count+1);allowed=true}
   }
   return allowed;
  });
 };
 const find=id=>list().find(paper=>paper.id===id)||null;
 function coverage(id){
  const counts=new Map();
  for(const paper of forJob(id))for(const q of paper.questions){const subject=String(q.subject||'General').trim()||'General';counts.set(subject,(counts.get(subject)||0)+1)}
  return [...counts.entries()].map(([subject,count])=>({subject,count})).sort((a,b)=>b.count-a.count||a.subject.localeCompare(b.subject));
 }
 function selectedJob(){
  const params=new URLSearchParams(location.search);
  const requested=params.get('job');
  if(requested)return jobs()?.resolve(requested)||null;
  return jobs()?.resolve('teaching:0')||variants()[0]||null;
 }
 function activePaper(){
  const selected=selectedJob();
  const requested=new URLSearchParams(location.search).get('paper');
  const available=selected?forJob(selected.id):[];
  return available.find(p=>p.id===requested)||(!requested?available[0]:null);
 }
 function history(){
  const rows=read(HISTORY_KEY);
  const cleared=Number(localStorage.getItem(CLEAR_KEY)||0);
  return Array.isArray(rows)?rows.filter(x=>x&&typeof x.paperId==='string'&&Number(x.submittedAt)>cleared):[];
 }
 function progress(paper){
  const rows=history().filter(x=>x.paperId===paper.id).sort((a,b)=>Number(b.submittedAt)-Number(a.submittedAt));
  const latest=rows[0]||null,attempt=read('lama_ppsc_attempt_'+paper.id);
  if(attempt&&Number.isFinite(attempt.startedAt)&&attempt.startedAt>0&&!attempt.submitted){
   return {state:Date.now()-attempt.startedAt>=paper.minutes*60000?'expired':'in-progress',last:latest,attempts:rows.length};
  }
  if(latest||attempt&&attempt.submitted)return {state:'completed',last:latest,attempts:rows.length};
  return {state:'not-started',last:null,attempts:0};
 }
 const api=Object.freeze({list,forJob,find,coverage,paperNumber,selectedJob,activePaper,history,progress,maxPapersPerJob:MAX_PAPERS_PER_JOB});
 window.LamaPpscPaperLibrary=api;
 if(typeof document==='undefined')return;
 const select=document.getElementById('paperJob'),filter=document.getElementById('paperStateFilter');
 const root=document.getElementById('jobPaperList'),summary=document.getElementById('paperSummary');
 const stats=document.getElementById('paperStats'),helper=document.getElementById('paperHelp'),coverageArea=document.getElementById('paperCoverage');
 if(!select||!filter||!root||!summary||!stats||!helper||!coverageArea)return;
 const element=(tag,text,css)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=String(text);if(css)el.className=css;return el};
 const urlFor=(view,selected,paper)=>{
  const url=new URL('./index.html',location.href);
  url.searchParams.set('job',selected.id);
  if(paper)url.searchParams.set('paper',paper.id);else url.searchParams.delete('paper');
  url.hash=view;
  return url.href;
 };
 let selected=selectedJob()?.id||'';
 function populate(){
  const current=selected;
  const options=variants();
  select.replaceChildren();
  for(const job of options){
   const opt=element('option',job.label+(forJob(job.id).length?' · '+forJob(job.id).length+' of '+MAX_PAPERS_PER_JOB+' available':' · awaiting paper'));
   opt.value=job.id;select.append(opt);
  }
  if(!options.length){select.append(element('option','No jobs found'));select.disabled=true;selected='';return}
  selected=options.some(j=>j.id===current)?current:options[0].id;
  select.value=selected;
 }
 function makeLink(label,href,secondary){
  const a=element('a',label,'paper-action'+(secondary?' paper-action-secondary':''));
  a.href=href;return a;
 }
 function render(){
  const job=jobs()?.resolve(selected),available=job?forJob(job.id):[];
  const jump=document.getElementById('paperLibraryOpen');
  if(jump&&job)jump.href=urlFor('library',job);
  const fold=document.getElementById('paperCoverageDisclosure');
  if(fold)fold.querySelector('summary').textContent='Show published subject coverage for '+(job?job.label:'this job');

  const details=available.map(p=>({paper:p,state:progress(p)}));
  const completed=details.filter(p=>p.state.state==='completed'||p.state.last).length;
  const started=details.filter(p=>['in-progress','expired'].includes(p.state.state)).length;
  stats.replaceChildren();coverageArea.replaceChildren();
  const subjects=job?coverage(job.id):[];
  if(subjects.length)for(const entry of subjects)coverageArea.append(element('span',entry.subject+' · '+entry.count+' MCQs','paper-topic-chip'));
  else coverageArea.append(element('p','No published questions for this job yet. Preparation topics are available below.','muted'));
  for(const [value,label] of [[available.length+'/'+MAX_PAPERS_PER_JOB,'Published papers'],[completed,'Completed'],[started,'In progress'],[available.length-completed-started,'Not started']]){
   const cell=element('div',undefined,'paper-stat');cell.append(element('strong',value),element('span',label));stats.append(cell);
  }
  summary.textContent=job?job.label+' · '+(job.category||'PPSC')+' · '+available.length+' of '+MAX_PAPERS_PER_JOB+' maximum full-length public papers available.':'Select a preparation job.';
  root.replaceChildren();
  const visible=details.filter(entry=>filter.value==='all'||filter.value===entry.state.state||(filter.value==='in-progress'&&entry.state.state==='expired'));
  visible.forEach(({paper,state},i)=>{
   const card=element('article',undefined,'library-paper');
   const head=element('div',undefined,'library-paper-head');
   head.append(element('h3',(paperNumber(paper)!==null?'Paper '+paperNumber(paper):paper.title)+' · '+paper.questions.length+' MCQs'));
   const labels={'not-started':'Not started','in-progress':'In progress','expired':'Time elapsed','completed':'Completed'};
   head.append(element('span',labels[state.state],'library-status library-status-'+state.state));
   card.append(head,element('p',paper.title+' · '+paper.minutes+' minutes · Free educational practice','muted'));
   if(paper.reviewStatus==='automated-checked')card.append(element('p','Original practice · Automated checks · Independent academic review pending','muted'));
   card.append(element('p','Answer keys and explanations appear after submitting this paper.','muted'));
   const subjects=[...new Set(paper.questions.map(q=>q.subject).filter(Boolean))].slice(0,9);
   card.append(element('p','Subjects: '+subjects.join(' · '),'paper-subjects'));
   if(state.last&&Number(state.last.total)>0){
    card.append(element('p','Last result: '+state.last.correct+'/'+state.last.total+' ('+Math.round(state.last.correct/state.last.total*100)+'%) · '+state.attempts+' completed attempt(s)','paper-score'));
   }else if(state.state==='expired')card.append(element('p','Your previous timer has expired. Open the paper to finalise the attempt.','paper-score'));
   const actions=element('div',undefined,'library-actions');
   const primary=state.state==='completed'?'Review completed paper':state.state==='in-progress'?'Resume examination':state.state==='expired'?'Finalise timed paper':'Open Paper '+(available.indexOf(paper)+1);
   actions.append(makeLink(primary,urlFor('paper',job,paper),false));
   actions.append(makeLink('My scores',urlFor('performance',job),true));
   card.append(actions);root.append(card);
  });
  if(!available.length&&job){
   const empty=element('div',undefined,'library-empty');
   empty.append(element('h3','Job-specific papers not published yet'));
   empty.append(element('p','This '+job.category+' track is in preparation. We will show a paper here only after its questions, answer keys and academic coverage have been reviewed. No unrelated Headmaster paper will be substituted.'));
   empty.append(element('p','Suggested study areas: '+(job.subjects||[]).join(' · '),'muted'));
   empty.append(makeLink('View syllabus & resources',urlFor('resources',job),true));
   empty.append(makeLink('Create study plan',urlFor('studyPlanner',job),true));
   root.append(empty);
  }else if(!visible.length){root.append(element('p','No papers match this status filter. Choose All papers to see available practice.','library-empty'))}
  helper.textContent='Each preparation job is limited to '+MAX_PAPERS_PER_JOB+' published papers. Paper availability is separate from PPSC vacancy status. This is a preparation library, not an official PPSC examination or an active-recruitment announcement. Results and unfinished attempts are retained in this browser; back up scores before changing devices. Planned premium papers are not live.';
 }
 select.addEventListener('change',()=>{
  selected=select.value;
  const url=new URL(location.href);url.searchParams.set('job',selected);url.searchParams.delete('paper');
  window.history.replaceState(null,'',url.href);
  render();
 });
 filter.addEventListener('change',render);
 window.addEventListener('storage',render);
 window.addEventListener('focus',render);
 window.addEventListener('lama:paper-completed',render);
 window.addEventListener('lama:jobs-updated',()=>{const fromUrl=jobs()?.fromUrl();if(fromUrl)selected=fromUrl.id;populate();render()});
 window.addEventListener('hashchange',()=>{if(location.hash==='#papers')render()});
 populate();render();
})();