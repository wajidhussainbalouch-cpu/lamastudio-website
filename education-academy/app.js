'use strict';
/* Candidate study planner: local-only planning data, no exam date claims. */
(()=>{
 const $=id=>document.getElementById(id);
 const fields=['examDate','hours','post','planWeeks','planLevel','planPriority','planRest'];
 const planKey='lama_ppsc_plan_v2',dailyKey='lama_ppsc_daily_check_v2';
 const subjects={assessment:'Assessment & evaluation',leadership:'Educational leadership',psychology:'Educational psychology',curriculum:'Curriculum & pedagogy',data:'Data interpretation'};
 const topics=Object.values(subjects);
 const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
 const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const localDay=(d)=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
 const node=(tag,txt,cls)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e};
 const old=read('lama_ppsc_plan_v1')||{},saved=read(planKey)||old;
 fields.forEach(id=>{if(saved[id]!==undefined&&saved[id]!==null&&$(id))$(id).value=String(saved[id])});
 const exam=$('examDate');exam.min=today();
 function config(){return Object.fromEntries(fields.map(id=>[id,$(id).value]))}
 function calculate(c){
  const start=localDay(new Date());const selected=c.examDate?localDay(new Date(c.examDate+'T12:00:00')):null;
  const until=selected?Math.round((selected-start)/86400000):null;
  const duration=Number(c.planWeeks)*7;
  const days=until===null?duration:Math.min(duration,until);
  const rest=c.planRest==='none'?null:Number(c.planRest);
  let studyDays=0;for(let i=0;i<Math.max(0,days);i++){const d=new Date(start);d.setDate(d.getDate()+i);if(rest===null||d.getDay()!==rest)studyDays++}
  return {days,studyDays,studyHours:Math.round(studyDays*Number(c.hours)*10)/10,until,rest};
 }
 const phaseNames=['Foundation concepts','Applied questions and explanations','Timed practice and weak-area revision','Mock test and final review'];
 function render(){
  const c=config(),stats=calculate(c),out=$('plannerOutput');
  if(stats.until!==null&&stats.until<1){$('plan').textContent='Choose a future target date or leave the date blank for a flexible study plan.';out.hidden=true;return}
  if(!stats.studyDays){$('plan').textContent='Choose a longer preparation period or a different rest day.';out.hidden=true;return}
  out.hidden=false;
  $('plan').textContent='Suggested '+stats.days+'-day plan for '+c.post+'. '+(stats.until!==null?'Target date is '+stats.until+' day(s) away. ':'')+'This is not an official PPSC exam schedule.';
  const summary=$('plannerSummary');summary.replaceChildren();
  for(const [label,value] of [['Study days',stats.studyDays],['Available hours',stats.studyHours],['Daily target',c.hours+' hours'],['Priority',subjects[c.planPriority]]]){
   const item=node('div');item.append(node('span',label),node('strong',String(value)));summary.append(item)
  }
  const phases=$('plannerPhases');phases.replaceChildren();
  const weights=c.planLevel==='beginner'?[.4,.3,.2,.1]:c.planLevel==='advanced'?[.15,.25,.35,.25]:[.3,.3,.25,.15];
  let allocated=0;
  phaseNames.forEach((name,i)=>{const count=i===3?stats.studyDays-allocated:Math.floor(stats.studyDays*weights[i]);allocated+=count;const row=node('div',name+' · '+count+' study day(s)','planner-phase');phases.append(row)});
  const tasks=[
   'Study '+subjects[c.planPriority]+' concepts and make short notes',
   'Practise 15–20 relevant MCQs and read each explanation',
   'Revise errors and update your weak-topic notes',
   'Complete a short timed practice set or review previous mistakes'
  ];
  const key=today(),record=read(dailyKey),checks=record&&record.date===key?record.checked:[];
  const list=$('plannerChecklist');list.replaceChildren();
  tasks.forEach((task,i)=>{const label=node('label',undefined,'planner-task');const input=node('input');input.type='checkbox';input.checked=checks.includes(i);input.addEventListener('change',()=>{const chosen=[...list.querySelectorAll('input')].flatMap((box,j)=>box.checked?[j]:[]);try{localStorage.setItem(dailyKey,JSON.stringify({date:key,checked:chosen}))}catch(e){}updateProgress()});label.append(input,node('span',task));list.append(label)});
  const week=$('plannerWeek');week.replaceChildren();
  const first=localDay(new Date());
  for(let i=0;i<7;i++){const d=new Date(first);d.setDate(d.getDate()+i);const rest=stats.rest!==null&&d.getDay()===stats.rest;const topic=topics[(i+topics.indexOf(subjects[c.planPriority]))%topics.length];const text=rest?'Rest day · optional light review':topic+' · '+c.hours+' hour(s) · concepts, MCQs and revision';const row=node('div',undefined,'planner-day');row.append(node('strong',new Intl.DateTimeFormat('en-PK',{weekday:'short',day:'numeric',month:'short'}).format(d)),node('span',text));week.append(row)}
  updateProgress();
 }
 function updateProgress(){const checks=[...$('plannerChecklist').querySelectorAll('input')];const done=checks.filter(x=>x.checked).length;const pct=Math.round(done/Math.max(1,checks.length)*100);$('plannerProgress').value=pct;$('plannerProgressText').textContent='Today: '+done+' of '+checks.length+' tasks complete ('+pct+'%)'}
 fields.forEach(id=>$(id).addEventListener('change',render));
 $('savePlan').addEventListener('click',()=>{const c=config();if(c.examDate&&calculate(c).until<1){render();return}try{localStorage.setItem(planKey,JSON.stringify(c));render();$('plan').textContent+=' Saved on this device.'}catch(e){$('plan').textContent='Unable to save on this device. Check browser storage permissions.'}});
 $('resetPlan').addEventListener('click',()=>{if(!confirm('Clear only today’s study checklist? Your study settings will remain saved.'))return;try{localStorage.removeItem(dailyKey)}catch(e){}render()});
 render();
 if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
