/* Super Admin-only job management. Database RLS is the authority, never browser role flags. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id),form=$('jobForm'),auth=window.LamaAcademyAuth;
 if(!form||!auth)return;
 const feedback=$('jobFeedback'),root=$('adminJobList');
 let managed=[],editing=false;
 const slug=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,64).replace(/-+$/,'');
 const text=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el};
 function render(){
  root.replaceChildren();
  if(!managed.length){root.append(text('p','No new managed jobs yet. Use the form above to create one.'));return}
  for(const job of managed){
   const card=text('article','');card.className='job-item';
   const badge=text('span',job.is_published?'Published':'Draft');badge.className='job-tag';
   const title=text('h3',job.title),meta=text('p',job.category+' · '+job.subjects.length+' topics · Vacancy '+job.vacancy_status);
   const edit=text('button','Edit');edit.type='button';edit.dataset.jobId=job.id;
   card.append(badge,title,meta,edit);root.append(card);
  }
 }
 async function refresh(){
  managed=await auth.adminJobs();render();
  feedback.textContent='Managed jobs loaded: '+managed.length;
 }
 function reset(){
  editing=false;form.reset();$('jobId').readOnly=false;$('jobId').value='';
  feedback.textContent='New job form ready.';
 }
 $('resetJob').addEventListener('click',reset);
 $('jobTitle').addEventListener('input',()=>{if(!editing)$('jobId').value=slug($('jobTitle').value)});
 root.addEventListener('click',e=>{
  const button=e.target.closest('button[data-job-id]');if(!button)return;
  const job=managed.find(j=>j.id===button.dataset.jobId);if(!job)return;
  editing=true;
  for(const key of ['id','title','post','category','case_no','listing_date','vacancy_status','official_url','priority_order','subjects','priority','is_published']){
   const input=form.elements.namedItem(key);if(!input)continue;
   if(input.type==='checkbox')input.checked=!!job[key];
   else input.value=key==='subjects'?job.subjects.join('\n'):(job[key]??'');
  }
  $('jobId').readOnly=true;
  feedback.textContent='Editing '+job.title+'. Uncheck Publish to hide this managed track.';
  form.scrollIntoView({behavior:'smooth',block:'start'});
 });
 form.addEventListener('submit',async e=>{
  e.preventDefault();const button=$('saveJob');button.disabled=true;
  try{
   const f=new FormData(form),id=String(f.get('id')||'').trim().toLowerCase();
   const subjects=[...new Set(String(f.get('subjects')||'').split(/\r?\n|,/).map(x=>x.trim()).filter(Boolean))];
   const vacancy=String(f.get('vacancy_status')||'unverified'),official=String(f.get('official_url')||'').trim();
   if(!/^[a-z0-9][a-z0-9-]{1,63}$/.test(id))throw Error('Job ID must contain lowercase letters, numbers and hyphens.');
   if(subjects.length<1||subjects.length>25||subjects.some(x=>x.length>120))throw Error('Enter 1 to 25 distinct topics, each at most 120 characters.');
   if(official&&!/^https:\/\/(www\.)?ppsc\.gop\.pk(\/|$)/i.test(official))throw Error('Official source must be on ppsc.gop.pk.');
   if(vacancy==='open'&&!official)throw Error('Add an official PPSC advertisement link before marking vacancy Open.');
   const data={id,title:String(f.get('title')||'').trim(),post:String(f.get('post')||'').trim(),
    category:String(f.get('category')||'').trim(),case_no:String(f.get('case_no')||'').trim(),
    listing_date:String(f.get('listing_date')||'')||null,subjects,
    priority:f.get('priority')==='on',priority_order:Number(f.get('priority_order')||99),
    vacancy_status:vacancy,official_url:official||null,is_published:f.get('is_published')==='on'};
   const exists=managed.some(j=>j.id===id);
   if(!editing&&exists)throw Error('Job ID already exists. Choose Edit from the list below.');
   await auth.adminSaveJob(data,exists);
   await refresh();reset();
   feedback.textContent=(data.is_published?'Published: ':'Saved as draft: ')+data.title+'. Academy visitors see updates after a catalog refresh.';
  }catch(err){feedback.textContent='Unable to save job: '+(err.message||'Request failed')}
  finally{button.disabled=false}
 });
 window.addEventListener('lama:admin-authorized',()=>refresh().catch(err=>feedback.textContent='Could not load job manager: '+err.message));
})();