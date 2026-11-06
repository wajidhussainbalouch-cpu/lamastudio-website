'use strict';
/* Candidate study planner. Job lists and subjects come from jobs.js, not a manual list. */
(()=>{
 const $=id=>document.getElementById(id);
 const catalog=window.LamaAcademyJobCatalog;
 const post=$('post'),priority=$('planPriority');
 if(!catalog||!post||!priority)return;
 const sharedFields=['examDate','hours','planWeeks','planLevel','planRest'];
 const recentKey='lama_ppsc_plan_v3_recent',legacyKey='lama_ppsc_plan_v2';
 const localPlanKey=id=>'lama_ppsc_job_plan_v1_'+id;
 const dailyKey=id=>'lama_ppsc_daily_check_v3_'+id;
 const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}};
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 const localDay=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
 const node=(tag,txt,cls)=>{const el=document.createElement(tag);if(txt!==undefined)el.textContent=txt;if(cls)el.className=cls;return el};
 const defaultSubjects=['Core professional knowledge','English comprehension','General knowledge and reasoning'];
 const legacyTopics={assessment:'Assessment',leadership:'School Leadership',psychology:'Educational Psychology',curriculum:'Curriculum',data:'Data Analysis'};
 const chosen=()=>catalog.resolve(post.value);
 const topics=()=>{const job=chosen();return job&&job.subjects.length?job.subjects:defaultSubjects};
 const old=read(recentKey)||read(legacyKey)||read('lama_ppsc_plan_v1')||{};
 const urlChoice=catalog.fromUrl();
 catalog.populate(post,{value:urlChoice?urlChoice.id:old.post});
 const original=chosen();
 const initial=original&&(read(localPlanKey(original.id))||(!urlChoice?old:null))||{};
 sharedFields.forEach(id=>{if(initial[id]!==undefined&&initial[id]!==null&&$(id))$(id).value=String(initial[id])});
 $('examDate').min=today();
 function refreshSubjects(preferred){
  const list=topics(),previous=String(preferred||priority.value||'');
  priority.replaceChildren();
  list.forEach(topic=>{const item=node('option',topic);item.value=topic;priority.append(item)});
  if(list.includes(previous))priority.value=previous;
  else if(legacyTopics[previous]&&list.includes(legacyTopics[previous]))priority.value=legacyTopics[previous];
  else priority.value=list[0];
 }
 refreshSubjects(initial.planPriority||old.planPriority);
 function config(){return {...Object.fromEntries(sharedFields.map(id=>[id,$(id).value])),post:post.value,planPriority:priority.value}}
 function calculate(c){
  const start=localDay(new Date()),target=c.examDate?localDay(new Date(c.examDate+'T12:00:00')):null;
  const until=target?Math.round((target-start)/86400000):null;
  const weeks=Math.max(1,Number(c.planWeeks)||4),duration=weeks*7;
  const days=until===null?duration:Math.min(duration,until);
  const rest=c.planRest==='none'?null:Number(c.planRest);
  let studyDays=0;
  for(let i=0;i<Math.max(0,days);i++){const d=new Date(start);d.setDate(d.getDate()+i);if(rest===null||d.getDay()!==rest)studyDays++}
  return {days,studyDays,studyHours:Math.round(studyDays*Number(c.hours)*10)/10,until,rest};
 }
 const phaseNames=['Foundation concepts','Applied questions and explanations','Timed practice and weak-area revision','Mock test and final review'];
 function updateProgress(){
  const boxes=[...$('plannerChecklist').querySelectorAll('input')],done=boxes.filter(el=>el.checked).length;
  const percent=Math.round(done/Math.max(1,boxes.length)*100);
  $('plannerProgress').value=percent;
  $('plannerProgressText').textContent='Today: '+done+' of '+boxes.length+' tasks complete ('+percent+'%)';
 }
 function render(){
  const c=config(),job=chosen(),stats=calculate(c),out=$('plannerOutput');
  if(!job){$('plan').textContent='The job catalog is not available. Please reload the page.';out.hidden=true;return}
  if(stats.until!==null&&stats.until<1){$('plan').textContent='Choose a future target date or leave the date blank for a flexible study plan.';out.hidden=true;return}
  if(!stats.studyDays){$('plan').textContent='Choose a longer preparation period or a different rest day.';out.hidden=true;return}
  out.hidden=false;
  const hasPaper=job.ready;
  $('plan').textContent='Suggested '+stats.days+'-day plan for '+job.label+'. '+(stats.until!==null?'Your personal target is '+stats.until+' day(s) away. ':'')+(hasPaper?'A practice paper is available for this track. ':'This track has no dedicated published practice paper yet. ')+'These topics are preparation guidance, not an official PPSC case syllabus.';
  const summary=$('plannerSummary');summary.replaceChildren();
  for(const [label,value] of [['Study days',stats.studyDays],['Available hours',stats.studyHours],['Daily target',c.hours+' hours'],['Priority',c.planPriority]]){
   const item=node('div');item.append(node('span',label),node('strong',String(value)));summary.append(item);
  }
  const phases=$('plannerPhases');phases.replaceChildren();
  const weights=c.planLevel==='beginner'?[.4,.3,.2,.1]:c.planLevel==='advanced'?[.15,.25,.35,.25]:[.3,.3,.25,.15];
  let allocated=0;
  phaseNames.forEach((name,i)=>{const count=i===3?stats.studyDays-allocated:Math.floor(stats.studyDays*weights[i]);allocated+=count;phases.append(node('div',name+' · '+count+' study day(s)','planner-phase'))});
  const tasks=[
   'Study '+c.planPriority+' concepts and prepare short notes',
   hasPaper?'Practice available topic-wise MCQs and review explanations':'Review topic-wise questions or self-test from your notes',
   'Revise mistakes and update weak-topic notes',
   hasPaper?'Complete a timed practice set or review earlier errors':'Complete a short self-test and revise difficult concepts'
  ];
  const key=today();
  const stored=read(dailyKey(job.id))||(job.jobId==='teaching'?read('lama_ppsc_daily_check_v2'):null);
  const checked=stored&&stored.date===key&&Array.isArray(stored.checked)?stored.checked:[];
  const list=$('plannerChecklist');list.replaceChildren();
  tasks.forEach((task,i)=>{
   const label=node('label',undefined,'planner-task'),input=node('input');
   input.type='checkbox';input.checked=checked.includes(i);
   input.addEventListener('change',()=>{
    const indices=[...list.querySelectorAll('input')].flatMap((box,j)=>box.checked?[j]:[]);
    try{localStorage.setItem(dailyKey(job.id),JSON.stringify({date:key,checked:indices}))}catch(e){}
    updateProgress();
   });
   label.append(input,node('span',task));list.append(label);
  });
  const week=$('plannerWeek');week.replaceChildren();
  const first=localDay(new Date()),subjectList=topics();
  const offset=Math.max(0,subjectList.indexOf(c.planPriority));
  for(let i=0;i<Math.min(7,stats.days);i++){
   const d=new Date(first);d.setDate(d.getDate()+i);
   const rest=stats.rest!==null&&d.getDay()===stats.rest;
   const topic=subjectList[(i+offset)%subjectList.length];
   const activity=rest?'Rest day · optional light review':topic+' · '+c.hours+' hour(s) · study, self-test and revision';
   const row=node('div',undefined,'planner-day');
   row.append(node('strong',new Intl.DateTimeFormat('en-PK',{weekday:'short',day:'numeric',month:'short'}).format(d)),node('span',activity));
   week.append(row);
  }
  updateProgress();
 }
 function switchJob(){
  const job=chosen();
  if(!job)return;
  const specific=read(localPlanKey(job.id));
  if(specific)sharedFields.forEach(id=>{if(specific[id]!==undefined&&$(id))$(id).value=String(specific[id])});
  refreshSubjects(specific&&specific.planPriority);
  render();
 }
 post.addEventListener('change',switchJob);
 priority.addEventListener('change',render);
 sharedFields.forEach(id=>$(id).addEventListener('change',render));
 $('savePlan').addEventListener('click',()=>{
  const c=config(),job=chosen();
  if(!job||c.examDate&&calculate(c).until<1){render();return}
  try{
   localStorage.setItem(localPlanKey(job.id),JSON.stringify(c));
   localStorage.setItem(recentKey,JSON.stringify(c));
   render();$('plan').textContent+=' Saved on this device for this job.';
  }catch(e){$('plan').textContent='Unable to save. Check browser storage permissions.'}
 });
 $('resetPlan').addEventListener('click',()=>{
  if(!confirm('Clear today\'s checklist for the selected job? Other job plans remain saved.'))return;
  const job=chosen();if(!job)return;
  try{localStorage.removeItem(dailyKey(job.id))}catch(e){}
  render();
 });
 window.addEventListener('lama:jobs-updated',()=>{
  const selected=catalog.fromUrl()?.id||post.value;catalog.populate(post,{value:selected});switchJob();
 });
 render();
 if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
