/* LAMA PPSC Academy: mobile-first section routing, no destructive state resets. */
'use strict';
(()=>{
 const views=new Set(['subscription','account','performance','studyPlanner','papers','resources','paper','jobDetail']);
 const toView=()=>{
  const hash=decodeURIComponent(location.hash.slice(1));
  const view=views.has(hash)?hash:'jobs';
  document.body.classList.add('academy-routed');
  document.body.dataset.view=view;
  const menu=document.getElementById('academyMenu');
  if(menu){menu.hidden=true;}
  const trigger=document.getElementById('openMenu');
  if(trigger)trigger.setAttribute('aria-expanded','false');
  if(view==='paper'){
   const workspace=document.getElementById('examWorkspace');
   const entry=document.querySelector('#paper .exam-entry');
   if(workspace&&!workspace.hidden&&entry)entry.hidden=true;
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