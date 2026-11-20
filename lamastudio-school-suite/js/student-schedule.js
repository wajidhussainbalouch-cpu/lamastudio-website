/* Student-only read view of the school's saved planning resources. */
(function(root){
'use strict';
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const colors={winter:'#38bdf8',summer:'#4ade80',summerVacation:'#fbbf24',winterVacation:'#a78bfa',holiday:'#fb7185',event:'#60a5fa'};
const labels={winter:'Winter timings',summer:'Summer timings',summerVacation:'Summer vacations',winterVacation:'Winter vacations',holiday:'Holiday',event:'Exams / events'};
const str=v=>String(v??'').trim(),norm=v=>str(v).toLowerCase().replace(/^(grade|class|standard|std)[\s._-]*/i,'').replace(/^0+(?=\d)/,'').replace(/\s+/g,'');
const iso=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(str(v)))return false;const d=new Date(v+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v};
const range=v=>!!v&&iso(v.from)&&iso(v.to)&&v.from<=v.to;
const inside=(d,r)=>range(r)&&r.from<=d&&d<=r.to;
const published=r=>r.published===true||str(r.published).toLowerCase()==='true';
const time=v=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(str(v));
function dateNow(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day}
function dayName(d){return days[(new Date(d+'T12:00:00Z').getUTCDay()+6)%7]}
function applies(r,student,allowSchool=false){
 if(!norm(student.class))return false;
 if(!str(r.grade))return allowSchool&&!str(r.section)&&!str(r.teacherId);
 return norm(r.grade)===norm(student.class)&&(!str(r.section)||!!str(student.section)&&norm(r.section)===norm(student.section));
}
function collect(rows,student,schoolId){
 const sessions=[],periods=[],events=[];
 for(const row of rows){
  if(!row?.id||(row.schoolId&&str(row.schoolId)!==str(schoolId)))continue;
  let p;try{p=JSON.parse(row.description||'{}')}catch{continue}
  if(!p||typeof p!=='object'||(p.schoolId&&str(p.schoolId)!==str(schoolId)))continue;
  const r={...p,id:str(row.id)};
  if(row.category==='planning-session'&&str(r.name)&&iso(r.start)&&iso(r.end)&&r.start<=r.end)sessions.push(r);
  if(row.category==='planning-period'&&published(r)&&applies(r,student)&&days.includes(r.day)&&time(r.start)&&time(r.end)&&r.start<r.end&&str(r.subject))periods.push(r);
  if(row.category==='planning-event'&&published(r)&&applies(r,student,true)&&iso(r.start)&&iso(r.end)&&r.start<=r.end&&str(r.title))events.push(r);
 }
 const ids=new Set(sessions.map(s=>s.id));
 return {sessions:sessions.sort((a,b)=>a.start.localeCompare(b.start)),periods:periods.filter(p=>ids.has(str(p.sessionId))).sort((a,b)=>days.indexOf(a.day)-days.indexOf(b.day)||a.start.localeCompare(b.start)||Number(a.period)-Number(b.period)),events:events.filter(e=>ids.has(str(e.sessionId))).sort((a,b)=>a.start.localeCompare(b.start))};
}
function currentSession(sessions,date){return sessions.find(s=>s.active===true&&s.start<=date&&date<=s.end)||sessions.find(s=>s.start<=date&&date<=s.end)||sessions.find(s=>s.active===true)||sessions.at(-1)||null}
function classify(date,session,events,weeklyOff=null){
 if(!session||date<session.start||date>session.end)return {kind:'',hits:[]};
 const hits=events.filter(e=>e.start<=date&&date<=e.end);
 const season=inside(date,session.schoolTiming)?'winter':inside(date,session.summerTiming)?'summer':'';
 const schedule=season==='winter'?session.schoolTiming:season==='summer'?session.summerTiming:null;
 const vacation=['summerVacation','winterVacation'].find(k=>inside(date,session.vacations?.[k]));
 const closed=Array.isArray(weeklyOff)?weeklyOff.includes(new Date(date+'T12:00:00Z').getUTCDay()):schedule?.hours?.[dayName(date)]?.open===false;
 const holiday=hits.some(e=>/holiday|vacation/i.test(e.type||''));
 return {kind:vacation||(closed||holiday?'holiday':hits.length?'event':season),hits,schedule};
}
function fmtTime(v){if(!time(v))return '—';const [h,m]=v.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM')}
function fmtDate(d){return iso(d)?new Date(d+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'—'}
function mount(container,student,schoolId){
 const $=id=>container.querySelector('#'+id),node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
 let data=null,selected=null,month=dateNow().slice(0,7),busy=false,seq=0;
 container.innerHTML='<div class="flex flex-wrap items-center justify-between gap-2"><h2 class="font-black text-xl">📅 My Timetable &amp; Calendar</h2><button type="button" id="ssRefresh" class="rounded-lg bg-cyan-700 px-3 py-2 text-sm">Refresh</button></div><p id="ssClass" class="text-sm text-cyan-200 mt-2"></p><p id="ssStatus" role="status" class="text-sm text-slate-300 mt-2">Loading published schedule…</p><div id="ssContent" hidden><label class="block mt-3 text-sm">Academic session<select id="ssSession" class="block w-full rounded-lg bg-slate-900 border border-slate-600 p-2 mt-1"></select></label><div id="ssHours" class="mt-3 space-y-2"></div><h3 class="font-bold mt-5">My subject timetable</h3><label class="block mt-2 text-sm">Weekday<select id="ssDay" class="block w-full rounded-lg bg-slate-900 border border-slate-600 p-2 mt-1"><option value="">Full week</option>'+days.map(d=>'<option>'+d+'</option>').join('')+'</select></label><div id="ssPeriods" class="mt-3 space-y-3"></div><h3 class="font-bold mt-5">Academic calendar</h3><div class="flex items-center justify-between gap-2 mt-3"><button id="ssPrev" type="button" class="bg-slate-700 p-2 rounded-lg" aria-label="Previous month">‹</button><strong id="ssMonth"></strong><button id="ssNext" type="button" class="bg-slate-700 p-2 rounded-lg" aria-label="Next month">›</button></div><div id="ssLegend" class="flex flex-wrap gap-2 mt-3 text-xs"></div><div id="ssCalendar" class="mt-3" style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px"></div><p id="ssDateInfo" class="text-sm mt-2" aria-live="polite"></p><div id="ssEvents" class="mt-3 space-y-2"></div></div>';
 $('ssClass').textContent='Class '+str(student.class)+(student.section?' · Section '+student.section:'');
 for(const k of Object.keys(colors)){const tag=node('span',labels[k]);tag.style.cssText='border-left:4px solid '+colors[k]+';padding-left:5px';$('ssLegend').append(tag)}
 function renderHours(){
  const box=$('ssHours');box.replaceChildren();
  for(const [key,title] of [['schoolTiming','Winter school timings'],['summerTiming','Summer school timings']]){
   const t=selected?.[key];if(!range(t)||!t.hours)continue;
   const card=node('div',undefined,'rounded-xl bg-slate-900/80 p-3 text-sm');card.append(node('strong',title),node('p',fmtDate(t.from)+' – '+fmtDate(t.to),'text-slate-400'));
   const groups=new Map();for(const d of days){const h=t.hours[d],off=data.weeklyOff;const closed=Array.isArray(off)?off.includes(LamaSchoolWeek.names.indexOf(d)):h?.open===false;const line=closed?'Closed':h?.open===true&&time(h.start)&&time(h.end)?fmtTime(h.start)+' – '+fmtTime(h.end):'Hours not configured';if(!groups.has(line))groups.set(line,[]);groups.get(line).push(d.slice(0,3))}
   for(const [line,ds] of groups)card.append(node('p',ds.join(', ')+': '+line));
   if(time(t.assemblyStart)&&time(t.assemblyEnd))card.append(node('p','Morning assembly: '+fmtTime(t.assemblyStart)+' – '+fmtTime(t.assemblyEnd),'text-amber-200'));if(time(t.breakStart)&&time(t.breakEnd))card.append(node('p','Lunch break: '+fmtTime(t.breakStart)+' – '+fmtTime(t.breakEnd),'text-amber-200'));box.append(card)
  }
  if(!box.children.length)box.append(node('p','Seasonal hours have not been published yet.','text-sm text-slate-400'));
  const terms=Array.isArray(selected?.terms)?selected.terms.filter(t=>str(t?.name)&&range(t)&&t.from>=selected.start&&t.to<=selected.end).sort((a,b)=>a.from.localeCompare(b.from)):[];
  if(terms.length&&!terms.some((t,i)=>i&&t.from<=terms[i-1].to)){const card=node('div',undefined,'rounded-xl bg-slate-900/80 p-3 text-sm');card.append(node('strong','Academic terms'));for(const t of terms)card.append(node('p',t.name+' · '+fmtDate(t.from)+' – '+fmtDate(t.to),'text-slate-300'));box.append(card)}
 }
 function renderPeriods(){
  const box=$('ssPeriods');box.replaceChildren();const filter=$('ssDay').value,work=Array.isArray(data.weeklyOff)?days.filter(d=>!data.weeklyOff.includes(LamaSchoolWeek.names.indexOf(d))):days,week=filter?[filter]:work;
  const records=data.periods.filter(p=>str(p.sessionId)===selected.id);
  for(const day of week){if(!work.includes(day)){box.append(node('p',day+' — weekly holiday','text-sm text-slate-400'));continue}const items=records.filter(p=>p.day===day);if(!items.length&&!filter)continue;
   const card=node('div',undefined,'rounded-xl bg-slate-900/70 border border-slate-700 p-3');card.append(node('h4',day,'font-bold text-cyan-200 mb-2'));
   if(!items.length)card.append(node('p','No published lessons for this day.','text-sm text-slate-400'));
   for(const p of items){const line=node('div',undefined,'py-2 border-t border-slate-700 text-sm');line.append(node('b',str(p.subject)),node('p',fmtTime(p.start)+' – '+fmtTime(p.end)+(p.period?' · Period '+p.period:''),'text-slate-300'),node('p',str(p.teacherName)||'Teacher not published','text-slate-400'));if(str(p.supportName))line.append(node('p',p.supportName+' · '+(p.supportRole||'Additional staff'),'text-slate-400'));if(str(p.room))line.append(node('p','Room: '+p.room,'text-slate-400'));card.append(line)}box.append(card)
  }
  if(!box.children.length)box.append(node('p','No published timetable for your class and section yet.','text-sm text-slate-400'));
  if(records.length)box.append(node('p','Weekly lesson pattern. Check the calendar for holidays and special events.','text-xs text-slate-400'));
 }
 function renderCalendar(){
  const grid=$('ssCalendar'),events=data.events.filter(e=>str(e.sessionId)===selected.id),[y,m]=month.split('-').map(Number),first=new Date(Date.UTC(y,m-1,1)),offset=(first.getUTCDay()+6)%7,last=new Date(Date.UTC(y,m,0)).getUTCDate();
  $('ssMonth').textContent=first.toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'});grid.replaceChildren();$('ssDateInfo').textContent='Tap a date for details.';
  for(const d of days)grid.append(node('span',d.slice(0,3),'text-xs text-center text-slate-400'));
  for(let i=0;i<offset;i++)grid.append(node('span'));
  for(let d=1;d<=last;d++){const date=month+'-'+String(d).padStart(2,'0'),mark=classify(date,selected,events,data.weeklyOff),b=node('button',String(d),'rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm');b.type='button';b.style.minHeight='40px';if(colors[mark.kind]){b.style.borderBottom='4px solid '+colors[mark.kind];b.style.background=colors[mark.kind]+'22'}if(date===dateNow())b.style.outline='2px solid white';b.setAttribute('aria-label',fmtDate(date)+(mark.kind?' '+labels[mark.kind]:''));b.onclick=()=>{$('ssDateInfo').textContent=fmtDate(date)+' · '+(labels[mark.kind]||'No published calendar marking')+(mark.hits.length?' · '+mark.hits.map(e=>e.title).join(' · '):'')};grid.append(b)}
  const out=$('ssEvents');out.replaceChildren();const from=month+'-01',to=month+'-'+String(last).padStart(2,'0');
  for(const k of ['summerVacation','winterVacation']){const v=selected.vacations?.[k];if(range(v)&&v.from<=to&&v.to>=from)out.append(node('p',labels[k]+': '+fmtDate(v.from)+' – '+fmtDate(v.to),'text-sm text-slate-300'))}
  for(const e of events.filter(e=>e.start<=to&&e.end>=from)){const card=node('div',undefined,'rounded-lg bg-slate-900/70 p-3 text-sm');card.append(node('strong',e.title),node('p',fmtDate(e.start)+' – '+fmtDate(e.end),'text-slate-400'));if(str(e.description))card.append(node('p',e.description));out.append(card)}
  if(!out.children.length)out.append(node('p','No additional published events this month.','text-sm text-slate-400'));
 }
 function select(id){selected=data.sessions.find(s=>s.id===id)||currentSession(data.sessions,dateNow());$('ssContent').hidden=!selected;if(!selected)return; $('ssSession').value=selected.id;const today=dateNow();month=(today>=selected.start&&today<=selected.end?today:selected.start).slice(0,7);renderHours();renderPeriods();renderCalendar()}
 function move(n){if(!selected)return;const [y,m]=month.split('-').map(Number),d=new Date(Date.UTC(y,m-1+n,1));month=d.toISOString().slice(0,7);renderCalendar()}
 $('ssPrev').onclick=()=>move(-1);$('ssNext').onclick=()=>move(1);$('ssSession').onchange=()=>select($('ssSession').value);$('ssDay').onchange=()=>{if(selected)renderPeriods()};
 async function load(){if(busy)return;busy=true;const ticket=++seq;$('ssRefresh').disabled=true;$('ssStatus').textContent='Loading published schedule…';$('ssContent').hidden=true;
  try{if(!LamaAPI.requireLogin('student','../../students/student-login.html'))return;const s=LamaAPI.getSession('student');if(!s||str(s.schoolId)!==str(schoolId)||str(s.studentId)!==str(student.id))throw Error('Student session changed. Sign in again.');
   const rows=await LamaAPI.list('resources');if(!Array.isArray(rows))throw Error('Invalid schedule response.');if(ticket!==seq)return;
   data=collect(rows,student,schoolId);data.weeklyOff=LamaSchoolWeek.read(rows)?.weeklyOff??null;for(const o of $('ssDay').options){o.disabled=!!o.value&&Array.isArray(data.weeklyOff)&&data.weeklyOff.includes(LamaSchoolWeek.names.indexOf(o.value));if(o.disabled&&o.selected)$('ssDay').value=''};$('ssSession').replaceChildren(...data.sessions.map(x=>new Option(x.name+(x.active===true?' (active)':''),x.id)));select(selected?.id);$('ssStatus').textContent=selected?'Showing your published class schedule and school calendar.':'No academic session published yet.';
  }catch(e){data=null;selected=null;$('ssStatus').textContent='Unable to load schedule: '+e.message}
  finally{busy=false;$('ssRefresh').disabled=false}
 }
 $('ssRefresh').onclick=load;return load();
}
root.LamaStudentSchedule={collect,currentSession,classify,mount};
})(window);