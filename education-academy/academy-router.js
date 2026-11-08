/* LAMA PPSC Academy: mobile-first section routing, no destructive state resets. */
'use strict';
(()=>{
 const views=new Set(['subscription','account','performance','studyPlanner','papers','resources','library','paper','jobDetail']);
 const toView=()=>{
  let hash='';try{hash=decodeURIComponent(location.hash.slice(1))}catch(e){hash=''}
  let view=views.has(hash)?hash:'jobs';
  if(view==='paper'&&window.LamaPpscPaperLibrary&&!window.LamaPpscPaperLibrary.activePaper()){
   view='papers';history.replaceState(null,'',location.pathname+location.search+'#papers');
  }
  const detail=document.getElementById('jobDetail');
  if(view==='jobDetail'&&detail&&detail.hidden){document.body.dataset.view='jobs';return;}
  document.body.classList.add('academy-routed');
  document.body.dataset.view=view;
  const viewLabels={jobs:'Job Categories',subscription:'Membership',account:'Registration & Login',performance:'My Scores',studyPlanner:'My Study Plan',papers:'Papers & Examinations',library:'Question Bank Library',resources:'Syllabus & Resources',paper:'Practice Examination',jobDetail:'Job Details'};
  document.title=(viewLabels[view]||'Dashboard')+' | LAMA PPSC Preparation Academy';
  document.querySelectorAll('#academyMenu > a[href]').forEach(link=>{
   const target=new URL(link.href,location.href),named=target.searchParams.get('view');
   const active=link.id==='menuJobs'?view==='jobs':named===view;
   if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
  const menu=document.getElementById('academyMenu');
  if(menu){menu.hidden=true;}
  const trigger=document.getElementById('openMenu');
  if(trigger)trigger.setAttribute('aria-expanded','false');
  if(view==='paper'){
   const workspace=document.getElementById('examWorkspace');
   const entry=document.querySelector('#paper .exam-entry');
   if(entry)entry.hidden=Boolean(workspace&&!workspace.hidden);
  }
  if(view!=='jobs'){
   const section=document.getElementById(view);
   if(section)requestAnimationFrame(()=>section.scrollIntoView({block:'start'}));
  }else if(hash)requestAnimationFrame(()=>window.scrollTo({top:0}));
 };
 document.addEventListener('DOMContentLoaded',()=>{
  toView();
  const start=document.getElementById('startExam');
  if(start)start.addEventListener('click',()=>{
   // The examination engine starts the timer and renders the questions.
   // The router only opens the dedicated paper view.
   if(location.hash!=='#paper')location.hash='paper';
   const workspace=document.getElementById('examWorkspace');
   if(workspace&&!workspace.hidden)workspace.scrollIntoView({block:'start',behavior:'smooth'});
  });
  document.querySelectorAll('a[href="#paper"]').forEach(link=>link.addEventListener('click',()=>{document.body.dataset.view='paper'}));
  window.addEventListener('hashchange',toView);
 });
})();