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
 window.addEventListener('lama:admin-authorized',()=>{authorized=true;refresh()});
 $('refresh')?.addEventListener('click',()=>{if(authorized)refresh()});
 $('logout')?.addEventListener('click',()=>{authorized=false;rows=[];jobs=[];root.replaceChildren();message('Sign in to access the private question bank.')});
})();