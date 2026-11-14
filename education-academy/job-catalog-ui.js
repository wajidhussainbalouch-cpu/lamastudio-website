/* Shared job options for the dashboard, study planner and syllabus finder.
 * Source of truth: jobs.js / window.LAMA_PPSC_JOBS.
 * Add jobs there, not separately in each academy form.
 */
'use strict';
window.LamaAcademyJobCatalog=(()=>{
 function jobs(){
  return Array.isArray(window.LAMA_PPSC_JOBS)?
   window.LAMA_PPSC_JOBS.filter(j=>j&&typeof j.id==='string'&&typeof j.title==='string'&&j.id&&j.title):[];
 }
 function options(){
  const result=[],used=new Set();
  for(const j of jobs()){
   if(used.has(j.id))continue;
   used.add(j.id);
   const subjects=Array.isArray(j.subjects)?[...new Set(j.subjects.map(s=>String(s).trim()).filter(Boolean))]:[];
   // One teaching catalog track covers two separately selectable posts.
   const variants=j.id==='teaching'?String(j.post||'').split(';').map(s=>s.trim()).filter(Boolean):[];
   if(variants.length>1){
    variants.forEach((label,i)=>result.push({
     id:j.id+':'+i,jobId:j.id,label,subjects,category:j.category||'',caseNo:j.caseNo||'',ready:!!j.ready,assessmentType:j.assessmentType||'mcq',skillsPracticeUrl:typeof j.skillsPracticeUrl==='string'&&/^\.\/stenography\.html\?job=[a-z0-9-]+$/.test(j.skillsPracticeUrl)?j.skillsPracticeUrl:'',sharedBankGroup:j.sharedBankGroup||'',syllabusEvidence:j.syllabusEvidence||null,priorityOrder:Number(j.priorityOrder)||99
    }));
   }else{
    result.push({id:j.id,jobId:j.id,label:j.title,subjects,category:j.category||'',caseNo:j.caseNo||'',ready:!!j.ready,assessmentType:j.assessmentType||'mcq',skillsPracticeUrl:typeof j.skillsPracticeUrl==='string'&&/^\.\/stenography\.html\?job=[a-z0-9-]+$/.test(j.skillsPracticeUrl)?j.skillsPracticeUrl:'',sharedBankGroup:j.sharedBankGroup||'',syllabusEvidence:j.syllabusEvidence||null,priorityOrder:Number(j.priorityOrder)||99});
   }
  }
  return result;
 }
 function resolve(value){
  const str=String(value||'').trim();
  if(!str)return null;
  const all=options();
  let found=all.find(j=>j.id===str);
  if(found)return found;
  found=all.find(j=>j.jobId===str);
  if(found)return found;
  const key=str.toLowerCase();
  found=all.find(j=>j.label.toLowerCase()===key);
  if(found)return found;
  // Support plans stored before the dropdown was linked to the catalog.
  if(key==='headmaster bs-17')return all.find(j=>j.id==='teaching:0')||null;
  if(key==='senior headmaster bs-18')return all.find(j=>j.id==='teaching:1')||null;
  return null;
 }
 function fromUrl(){
  try{return resolve(new URLSearchParams(location.search).get('job'))}
  catch(e){return null}
 }
 function populate(select,{allowEmpty=false,emptyLabel='Choose a job',value,preferUrl=false}={}){
  if(!select)return null;
  const previous=value!==undefined?value:select.value;
  const target=(preferUrl&&fromUrl())||resolve(previous);
  const all=options();
  select.replaceChildren();
  if(allowEmpty){
   const item=document.createElement('option');
   item.value='';item.textContent=emptyLabel;select.append(item);
  }
  if(!all.length){
   const item=document.createElement('option');item.value='';
   item.textContent='Job catalog unavailable';item.disabled=true;select.append(item);
   select.value='';return null;
  }
  all.forEach(job=>{
   const item=document.createElement('option');
   item.value=job.id;item.textContent=job.label;
   select.append(item);
  });
  select.value=target?target.id:allowEmpty?'':all[0].id;
  return resolve(select.value);
 }
 return Object.freeze({jobs,options,resolve,fromUrl,populate});
})();
