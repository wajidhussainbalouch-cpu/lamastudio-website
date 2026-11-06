/* LAMA PPSC Super Admin question bank editor.
 * Drafts and answer keys are private in RLS-protected Supabase.
 * "Approved" means editorially reviewed, NEVER published to candidate exams.
 */
'use strict';
(()=>{
 const $=id=>document.getElementById(id),root=$('qList'),form=$('questionForm'),auth=window.LamaAcademyAuth;
 if(!root||!form||!auth)return;
 let authorized=false,rows=[],jobs=[],editing=false;
 const message=s=>{$('qFeedback').textContent=s};
 const node=(tag,value,cls)=>{
  const e=document.createElement(tag);
  if(value!==undefined)e.textContent=String(value);
  if(cls)e.className=cls;
  return e;
 };
 const readForm=()=>new FormData(form);
 function reset(){
  editing=false;form.reset();
  $('qId').readOnly=false;
  const job=$('qJob');
  if(jobs.length)job.value=jobs[0].id;
  message('New question. Save it as a private draft before requesting an academic review.');
 }
 function validData(){
  const f=readForm();
  const id=String(f.get('id')||'').trim().toUpperCase();
  const job_id=String(f.get('job_id')||'');
  const text=String(f.get('question_text')||'').trim();
  const options=['option_a','option_b','option_c','option_d'].map(key=>String(f.get(key)||'').trim());
  const explanation=String(f.get('explanation')||'').trim();
  const status=String(f.get('review_status')||'draft');
  if(!/^[A-Z0-9][A-Z0-9-]{4,79}$/.test(id))throw Error('Use an uppercase question ID of 5–80 letters/numbers/hyphens.');
  if(!jobs.some(j=>j.id===job_id))throw Error('Select a managed preparation job.');
  if(text.length<30||text.length>1500)throw Error('Question length must be 30–1,500 characters.');
  if(options.some(x=>x.length<1||x.length>400)||new Set(options.map(x=>x.toLowerCase())).size!==4)throw Error('Four distinct non-empty options are required.');
  if(explanation.length<40||explanation.length>2500)throw Error('Add a meaningful explanation of at least 40 characters.');
  if(!editing&&status!=='draft')throw Error('New questions must first be saved as drafts. Then select Edit to review.');
  if(!['draft','in_review','approved'].includes(status))throw Error('Invalid editorial review status.');
  return {id,job_id,subject:String(f.get('subject')||'').trim(),topic:String(f.get('topic')||'').trim(),
    question_text:text,options,answer_index:Number(f.get('answer_index')),
    explanation,difficulty:String(f.get('difficulty')||'intermediate'),
    review_status:status,source_notes:String(f.get('source_notes')||'').trim()||'Original academy draft; academic review required'};
 }
 function render(){
  const s=$('qSearch').value.trim().toLowerCase();
  const selected=$('qJob').value;
  const visible=rows.filter(r=>r.job_id===selected&&
   (!s||[r.id,r.question_text,r.subject,r.topic,r.review_status].join(' ').toLowerCase().includes(s)));
  root.replaceChildren();
  const filtered=rows.filter(r=>r.job_id===selected);
  const approved=filtered.filter(r=>r.review_status==='approved').length;
  const inReview=filtered.filter(r=>r.review_status==='in_review').length;
  $('qStats').textContent=filtered.length+' loaded · '+approved+' academically reviewed · '+inReview+' in review · '+(filtered.length-approved-inReview)+' draft (latest 200 overall)';
  if(!visible.length){root.append(node('p','No questions matching this filter. Add a draft using the form above.'));return}
  for(const r of visible){
   const card=node('article',undefined,'job-item');
   card.append(node('span',r.review_status,'job-tag'),node('h3',r.id+' · '+r.subject));
   card.append(node('p',r.question_text));
   card.append(node('p',r.topic+' · '+r.difficulty,'muted'));
   const edit=node('button','Edit & Review');
   edit.type='button';edit.dataset.qId=r.id;card.append(edit);root.append(card);
  }
 }
 function makeJobSelect(){
  $('qJob').replaceChildren();
  for(const j of jobs){
   const opt=node('option',j.title);opt.value=j.id;$('qJob').append(opt);
  }
  if(!jobs.length){const opt=node('option','Add a managed job first');opt.value='';$('qJob').append(opt)}
 }
 async function refresh(){
  if(!authorized)return;
  try{
   const [available,questions]=await Promise.all([auth.adminJobs(),auth.adminQuestions()]);
   jobs=available;rows=questions;makeJobSelect();
   render();message('Private question bank ready. '+rows.length+' items loaded.');
  }catch(err){message('Question bank could not load: '+(err.message||'Access denied'))}
 }
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!authorized)return;
  const save=$('qSave');save.disabled=true;
  try{
   const data=validData();
   if(editing&&!rows.some(q=>q.id===data.id))throw Error('Original question was not found.');
   if(!editing&&rows.some(q=>q.id===data.id))throw Error('Duplicate question ID. Use Edit & Review.');
   if(data.review_status==='approved'&&!confirm('Confirm that you personally reviewed the answer, explanation, ambiguity, originality and job applicability? This is an editorial status, not public exam publication.'))return;
   await auth.adminSaveQuestion(data,editing);
   await refresh();reset();
   message('Saved '+data.id+' ('+data.review_status+'). The question remains private; it is not an active exam paper.');
  }catch(err){message('Unable to save: '+(err.message||'Request failed'))}
  finally{save.disabled=false}
 });
 $('qReset').addEventListener('click',reset);
 $('qSearch').addEventListener('input',render);
 $('qJob').addEventListener('change',render);
 root.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-q-id]');if(!btn)return;
  const q=rows.find(x=>x.id===btn.dataset.qId);if(!q)return;
  editing=true;
  for(const key of ['id','job_id','subject','topic','question_text','answer_index','explanation','difficulty','review_status','source_notes']){
   const input=form.elements.namedItem(key);
   if(input)input.value=q[key]??'';
  }
  ['a','b','c','d'].forEach((s,i)=>form.elements.namedItem('option_'+s).value=q.options[i]);
  $('qId').readOnly=true;form.elements.namedItem('job_id').value=q.job_id;
  message('Editing '+q.id+'. Examine the explanation and answer before setting status to Academically reviewed.');
  form.scrollIntoView({behavior:'smooth',block:'start'});
 });

 const exportedFields=['id','job_id','subject','topic','question_text','options','answer_index','explanation','difficulty','source_notes'];
 $('qExport')?.addEventListener('click',()=>{
  if(!authorized){message('Sign in before exporting questions.');return}
  if(!rows.length){message('No questions currently loaded.');return}
  const backup={format:'lama-ppsc-questions-v1',version:1,exported_at:new Date().toISOString(),
   partial:rows.length===200,questions:rows.map(q=>Object.fromEntries(exportedFields.map(k=>[k,q[k]])))};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='lama-ppsc-private-questions-'+Date.now()+'.json';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  message('Downloaded '+rows.length+' privately managed questions. Keep the file secure; answers are included.'+(backup.partial?' Only the latest 200 loaded records were exported.':''));
 });
 $('qImportFile')?.addEventListener('change',async e=>{
  const input=e.target,file=input.files&&input.files[0];input.value='';
  if(!file||!authorized)return;
  if(file.size>1024*1024){message('Import exceeds 1 MB. Split into smaller batches.');return}
  try{
   const data=JSON.parse(await file.text());
   if(!data||data.format!=='lama-ppsc-questions-v1'||data.version!==1||!Array.isArray(data.questions)||!data.questions.length||data.questions.length>100)throw Error('Expected 1–100 questions in a LAMA JSON backup.');
   const clean=data.questions.map(raw=>{
    if(!raw||!/^[A-Z0-9][A-Z0-9-]{4,79}$/.test(raw.id)||!jobs.some(j=>j.id===raw.job_id))throw Error('Invalid question ID or unmanaged job.');
    if(typeof raw.question_text!=='string'||raw.question_text.trim().length<30||raw.question_text.length>1500)throw Error('A question has invalid wording.');
    if(!Array.isArray(raw.options)||raw.options.length!==4||raw.options.some(x=>typeof x!=='string'||x.trim().length===0||x.length>400)||new Set(raw.options.map(x=>x.trim().toLowerCase())).size!==4)throw Error('Every question requires four distinct options.');
    if(!Number.isInteger(raw.answer_index)||raw.answer_index<0||raw.answer_index>3||typeof raw.explanation!=='string'||raw.explanation.trim().length<40)throw Error('A correct answer or explanation is invalid.');
    if(typeof raw.subject!=='string'||raw.subject.trim().length<3||typeof raw.topic!=='string'||raw.topic.trim().length<3)throw Error('Missing subject or topic.');
    return {id:raw.id,job_id:raw.job_id,subject:raw.subject.trim(),topic:raw.topic.trim(),
     question_text:raw.question_text.trim(),options:raw.options.map(x=>x.trim()),answer_index:raw.answer_index,
     explanation:raw.explanation.trim(),difficulty:['foundation','intermediate','advanced'].includes(raw.difficulty)?raw.difficulty:'intermediate',
     source_notes:String(raw.source_notes||'Imported private draft').slice(0,800),review_status:'draft'};
   });
   if(new Set(clean.map(q=>q.id)).size!==clean.length)throw Error('Duplicate IDs within the file.');
   if(!confirm('Import '+clean.length+' questions as private drafts? Existing records will not be overwritten.'))return;
   await auth.adminImportQuestions(clean);
   await refresh();
   message('Imported '+clean.length+' new private drafts. Academic review is still required.');
  }catch(err){message('Import failed without publishing: '+(err.message||'Invalid file'))}
 });
 window.addEventListener('lama:admin-authorized',()=>{authorized=true;refresh()});
 $('refresh')?.addEventListener('click',()=>{if(authorized)refresh()});
 $('logout')?.addEventListener('click',()=>{authorized=false;rows=[];jobs=[];root.replaceChildren();message('Sign in to access the private question bank.')});
})();