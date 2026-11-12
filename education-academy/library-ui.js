/* LAMA PPSC: job-wise resource library, numbered papers and side-menu navigation.
 * Source of truth is jobs.js + the published PaperLibrary; this does not create
 * candidate attempts or expose unpublished/private Supabase question drafts.
 */
'use strict';
(()=>{
 const api=window.LamaPpscPaperLibrary,cat=window.LamaAcademyJobCatalog;
 if(!api||!cat)return;
 const $=id=>document.getElementById(id);
 const libraryJob=$('libraryJob'),subjectSearch=$('librarySearch'),summary=$('librarySummary');
 const summaryCards=$('librarySnapshot'),subjectList=$('librarySubjectList'),paperList=$('libraryPaperList');
 const exportButton=$('libraryExport'),exportMessage=$('libraryExportMessage');
 const menuJob=$('menuPaperJob'),menuItems=$('menuPaperItems');
 if(!libraryJob||!subjectSearch||!subjectList||!paperList||!menuJob||!menuItems)return;
 const make=(tag,txt,cls)=>{
  const e=document.createElement(tag);
  if(txt!==undefined)e.textContent=String(txt);
  if(cls)e.className=cls;
  return e;
 };
 const url=(job,view,paper)=>{
  const link=new URL('./index.html',location.href);
  link.searchParams.set('job',job.id);
  if(paper)link.searchParams.set('paper',paper.id);
  else link.searchParams.delete('paper');
  link.hash=view;
  return link.href;
 };
 function populate(select,value){
  const options=cat.options();
  const previous=value===undefined?select.value:value;
  const chosen=cat.resolve(previous);
  select.replaceChildren();
  if(!options.length){select.append(make('option','Job catalog unavailable'));select.disabled=true;return null}
  select.disabled=false;
  for(const job of options){
   const item=make('option',job.label);
   item.value=job.id;
   select.append(item);
  }
  const first=cat.fromUrl()||cat.resolve('teaching:0')||options[0];
  select.value=(chosen||first).id;
  return cat.resolve(select.value);
 }
 function ordinal(paper,index){
  return api.paperNumber(paper)||index+1;
 }
 function status(paper){
  const state=api.progress(paper);
  const labels={'not-started':'Not started','in-progress':'In progress','expired':'Time elapsed','completed':'Completed'};
  return labels[state.state]||'Not started';
 }
 function refreshMenu(){
  const selected=cat.resolve(menuJob.value);
  menuItems.replaceChildren();
  if(!selected){menuItems.append(make('p','Select a job to see its papers.'));return}
  const all=api.forJob(selected.id);
  const top=make('a','Open '+selected.label+' library');
  top.href=url(selected,'library');
  menuItems.append(top);
  if(!all.length){menuItems.append(make('p','No published papers yet for this job. See its suggested syllabus and study plan.'));return}
  for(const [index,paper] of all.entries()){
   const link=make('a','Paper '+ordinal(paper,index)+' · '+paper.questions.length+' MCQs · '+status(paper));
   link.href=url(selected,'paper',paper);
   menuItems.append(link);
  }
 }
 function refreshLibrary(){
  const selected=cat.resolve(libraryJob.value);
  summaryCards.replaceChildren();subjectList.replaceChildren();paperList.replaceChildren();
  if(!selected){summary.textContent='The job catalog is unavailable.';return}
  const papers=api.forJob(selected.id),coverage=api.coverage(selected.id);
  const count=papers.reduce((n,p)=>n+p.questions.length,0);
  const uniqueCount=new Set(papers.flatMap(p=>p.questions.map(q=>String(q.sourceQuestionId||q.id)))).size;
  const hasShared=papers.some(p=>p.sharedFromExistingQuestions);
  summary.textContent=selected.label+' · '+papers.length+' numbered public practice papers · '+count+' question positions from '+uniqueCount+' unique source questions.'+(hasShared?' Shared-bank papers reuse existing questions; these positions are not newly authored items.':'');
  const stats=[['Papers',papers.length+' / '+api.maxPapersPerJob],['Question slots',count],['Unique questions',uniqueCount],['Subjects',coverage.length]];
  for(const [label,value] of stats){
   const tile=make('div');tile.append(make('strong',value),make('span',label));summaryCards.append(tile);
  }
  const query=subjectSearch.value.trim().toLocaleLowerCase();
  const matches=coverage.filter(x=>x.subject.toLocaleLowerCase().includes(query));
  if(!coverage.length){
   subjectList.append(make('div','No published MCQ coverage yet for this job. This track has preparation guidance only.','library-empty-note'));
  }else if(!matches.length){
   subjectList.append(make('div','No matching published subjects. Clear the search to view the full index.','library-empty-note'));
  }else{
   for(const entry of matches){
    const cell=make('div',undefined,'library-subject');
    cell.append(make('span',entry.subject),make('strong',entry.count+' MCQs'));
    subjectList.append(cell);
   }
  }
  for(const [index,paper] of papers.entries()){
   const li=make('li',undefined,'library-entry');
   const heading=make('div',undefined,'library-entry-title');
   heading.append(make('h4','Paper '+ordinal(paper,index)));
   heading.append(make('span',status(paper),'library-status'));
   li.append(heading);
   li.append(make('p',paper.questions.length+' MCQs · '+paper.minutes+' minutes · '+paper.title));
   if(paper.reviewStatus==='automated-checked')li.append(make('p','Automated structural checks completed; independent academic review pending.'));
   const a=make('a','Open Paper '+ordinal(paper,index));
   a.href=url(selected,'paper',paper);
   li.append(a);paperList.append(li);
  }
  if(!papers.length){
   paperList.append(make('li','No job-specific examinations have been published yet. Papers appear here automatically after their complete question banks have been registered.','library-empty-note'));
  }
  exportButton.disabled=!coverage.length;
  if(exportMessage)exportMessage.textContent='';
 }
 function chooseLibraryJob(){
  const selected=cat.resolve(libraryJob.value);if(!selected)return;
  const address=new URL(location.href);
  address.searchParams.set('job',selected.id);address.searchParams.delete('paper');
  history.replaceState(null,'',address.href);
  menuJob.value=selected.id;
  subjectSearch.value='';
  refreshMenu();refreshLibrary();
 }
 function downloadCoverage(){
  const selected=cat.resolve(libraryJob.value);if(!selected)return;
  const coverage=api.coverage(selected.id);if(!coverage.length)return;
  const safe=s=>{
   const value=String(s||'');
   const cell=/^[=+\-@\t\r]/.test(value)?"'"+value:value;
   return '"'+cell.replace(/"/g,'""')+'"';
  };
  const lines=['"Job","Subject","Question Positions (may share source content with other jobs)"',...coverage.map(x=>[selected.label,x.subject,x.count].map(safe).join(','))];
  const content='\ufeff'+lines.join('\r\n');
  const blob=new Blob([content],{type:'text/csv;charset=utf-8'});
  const href=URL.createObjectURL(blob),link=make('a');
  link.href=href;link.download='lama-ppsc-'+selected.id.replace(/[^a-z0-9-]/gi,'-')+'-coverage.csv';
  document.body.append(link);
  link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(href),10000);
  if(exportMessage)exportMessage.textContent='Subject-count CSV prepared for download.';
 }
 const defaultJob=cat.fromUrl()||cat.resolve('teaching:0')||cat.options()[0]||null;
 populate(libraryJob,defaultJob&&defaultJob.id);
 populate(menuJob,defaultJob&&defaultJob.id);
 libraryJob.addEventListener('change',chooseLibraryJob);
 subjectSearch.addEventListener('input',refreshLibrary);
 menuJob.addEventListener('change',refreshMenu);
 exportButton.addEventListener('click',downloadCoverage);
 menuItems.addEventListener('click',e=>{
  const link=e.target.closest('a');
  if(!link)return;
  const menu=$('academyMenu'),trigger=$('openMenu');
  if(menu)menu.hidden=true;
  if(trigger)trigger.setAttribute('aria-expanded','false');
 });
 window.addEventListener('lama:jobs-updated',()=>{
  const saved=libraryJob.value,side=menuJob.value;
  populate(libraryJob,saved);populate(menuJob,side);
  refreshLibrary();refreshMenu();
 });
 window.addEventListener('lama:paper-completed',()=>{refreshLibrary();refreshMenu()});
 window.addEventListener('focus',()=>{refreshLibrary();refreshMenu()});
 refreshLibrary();refreshMenu();
})();
