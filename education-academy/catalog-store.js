/* RLS-protected Supabase published jobs merged into the offline jobs.js list. */
'use strict';
window.LamaPpscJobStore=(()=>{
 const base=Array.isArray(window.LAMA_PPSC_JOBS)?window.LAMA_PPSC_JOBS.map(j=>({...j})):[];
 function mergeRows(rows){
  if(!Array.isArray(rows))throw Error('Invalid job catalog response');
  const all=base.map(j=>({...j})),positions=new Map(all.map((j,i)=>[j.id,i]));
  for(const r of rows){
   if(!r||r.is_published!==true||!/^[a-z0-9][a-z0-9-]{1,63}$/.test(String(r.id||'')))continue;
   if(typeof r.title!=='string'||r.title.trim().length<4||typeof r.post!=='string'||r.post.trim().length<3||typeof r.category!=='string'||r.category.trim().length<2)continue;
   const subjects=Array.isArray(r.subjects)?r.subjects.filter(s=>typeof s==='string'&&s.trim()&&s.length<=120).map(s=>s.trim()).slice(0,25):[];
   if(!subjects.length)continue;
   const job={id:r.id,title:r.title.trim(),post:r.post.trim(),category:r.category.trim(),caseNo:String(r.case_no||''),date:r.listing_date||'',subjects,priority:!!r.priority,priorityOrder:Number(r.priority_order)||99,vacancyStatus:r.vacancy_status||'unverified',officialUrl:String(r.official_url||''),source:'admin'};
   const index=positions.get(job.id);
   if(index===undefined){positions.set(job.id,all.length);all.push({...job,ready:false})}
   else all[index]={...all[index],...job,ready:!!all[index].ready};
  }
  if(!Array.isArray(window.LAMA_PPSC_JOBS))window.LAMA_PPSC_JOBS=[];
  window.LAMA_PPSC_JOBS.splice(0,window.LAMA_PPSC_JOBS.length,...all);
  if(typeof window.dispatchEvent==='function')window.dispatchEvent(new Event('lama:jobs-updated'));
  return all;
 }
 async function refresh(){
  const cfg=window.LAMA_PPSC_SUPABASE||{};
  if(!cfg.enabled||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url||'')||!cfg.publishableKey||typeof fetch!=='function')return false;
  const url=new URL(cfg.url.replace(/\/$/,'')+'/rest/v1/ppsc_job_catalog');
  url.searchParams.set('select','id,title,post,category,case_no,listing_date,subjects,priority,priority_order,vacancy_status,official_url,is_published');
  url.searchParams.set('is_published','eq.true');url.searchParams.set('limit','500');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetch(url.href,{headers:{apikey:cfg.publishableKey,Accept:'application/json'},signal:controller.signal,cache:'no-store'});
   if(!response.ok)throw Error('Catalog service unavailable');
   mergeRows(await response.json());return true;
  }catch(e){return false}
  finally{clearTimeout(timer)}
 }
 let last=0;
 function refreshIfDue(){if(Date.now()-last>=60000){last=Date.now();refresh()}}
 if(typeof window.addEventListener==='function')window.addEventListener('focus',refreshIfDue);
 if(typeof fetch==='function')refreshIfDue();
 return Object.freeze({mergeRows,refresh});
})();