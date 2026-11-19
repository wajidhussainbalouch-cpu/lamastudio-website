(()=>{'use strict';
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const role=new URLSearchParams(location.search).get('role')||'school',adminMode=role==='school',session=LamaAPI.getSession(role),schoolId=session?.schoolId;
let rows=[],teachers=[],offeredClasses=[],curriculumClasses=[],month=new Date(new Date().getFullYear(),new Date().getMonth(),1),verified=false,sessionBusy=false,printSchoolProfile=null,printPrepared=false,printSelection=null,printSelectionSession='',quickBusy=false,hiddenGrid=new Map();
const type={period:'planning-period',session:'planning-session',event:'planning-event'};
const status=s=>{$('status').textContent=s};
const field=id=>$(id).value.trim(),parsed=r=>{try{return JSON.parse(r.description||'{}')}catch{return {}}};
const data=t=>rows.filter(r=>r.category===type[t]).map(r=>({...parsed(r),id:r.id})).filter(r=>r.id);
const same=(a,b)=>String(a??'').trim().toLowerCase()===String(b??'').trim().toLowerCase();
const authorized=()=>{if(!adminMode||!verified)throw Error('Verified school administrator required')};
const matchStudent=r=>same(r.grade,session?.class||session?.grade||session?.studentClass)&&(!session?.section||!r.section||same(r.section,session.section));
const matchTeacher=r=>same(r.teacherId,session?.teacherId||session?.id);
function allowed(r){if(adminMode)return true;if(r.published===false)return false;if(role==='student')return matchStudent(r);if(role==='teacher')return matchTeacher(r);return false}
async function load(){if(!schoolId){status('School session missing. Sign in again.');return}try{const all=await LamaAPI.list('resources');if(!Array.isArray(all))throw Error('Invalid saved schedule response. Refresh to retry.');rows=all.filter(r=>Object.values(type).includes(r.category));if(adminMode){
 // The public client exports getSchoolClassOptions and getActiveSchool,
 // not getSchoolConfig (which is an internal Apps Script action).
 offeredClasses=[];
 try{
  if(typeof LamaAPI.getSchoolClassOptions==='function'){
   const options=await LamaAPI.getSchoolClassOptions();
   if(Array.isArray(options))offeredClasses=options.map(c=>typeof c==='string'?{name:c}:{name:String(c?.class||c?.name||c?.grade||''),section:String(c?.section||'')}).filter(c=>c.name.trim());
  }
 }catch(error){console.warn('Class options unavailable; trying school profile',error.message)}
 if(!offeredClasses.length){
  let config=session;
  try{if(typeof LamaAPI.getActiveSchool==='function')config=await LamaAPI.getActiveSchool()||session}catch(error){console.warn('School profile unavailable; retaining saved timetable',error.message)}
  try{
   const raw=config?.offeredClassesJson||'[]',offered=Array.isArray(raw)?raw:JSON.parse(raw);
   offeredClasses=Array.isArray(offered)?offered.map(c=>typeof c==='string'?{name:c}:{name:String(c?.name||c?.class||''),sections:Array.isArray(c?.sections)?c.sections:[]}).filter(c=>c.name.trim()):[];
  }catch(_){offeredClasses=[]}
 }
 const resource=(Array.isArray(all)?all:[]).find(r=>r.category==='school-curriculum'&&r.title==='LAMA School Class Subjects');
 try{const doc=JSON.parse(resource?.description||'{}');curriculumClasses=doc.schoolId===schoolId&&Array.isArray(doc.classes)?doc.classes:[]}catch(_){curriculumClasses=[]}
}else{offeredClasses=[];curriculumClasses=[]}
if(adminMode){teachers=await LamaAPI.list('teachers').catch(()=>[]);const sel=$('teacher');sel.replaceChildren(new Option('Select teacher',''));for(const t of teachers){const o=new Option((t.name||t.fullName||t.teacherName||'Teacher')+' · '+(t.subject||''),t.id);sel.add(o)}}render();status('Schedule loaded. '+data('period').length+' period entries, '+data('event').length+' calendar entries.');return true}catch(e){status('Unable to load schedule: '+e.message);return false}}
async function save(kind,id,payload){authorized();const title=kind==='period'?[payload.day,payload.grade,payload.period].join(' · '):kind==='session'?payload.name:payload.title;const record={category:type[kind],title,description:JSON.stringify(payload),link:''};if(id)await LamaAPI.update('resources',id,record);else await LamaAPI.add('resources',record);return await load()}
function sessionKey(name){
 return String(name||'').normalize('NFKC').replace(/[‐‑‒–—−]/g,'-').replace(/\s+/g,'').toLowerCase();
}
function sessionReferences(id,source=rows){
 const matches=source.filter(r=>(r.category===type.period||r.category===type.event)&&String(parsed(r).sessionId||'')===String(id));
 return {periods:matches.filter(r=>r.category===type.period).length,events:matches.filter(r=>r.category===type.event).length};
}
function sessionRecords(source=rows){
 return source.filter(r=>r.category===type.session).map(r=>({...parsed(r),id:r.id})).filter(r=>r.id);
}
function sessionDuplicate(candidate,editingId='',source=rows){
 return sessionRecords(source).find(r=>String(r.id)!==String(editingId)&&sessionKey(r.name)===sessionKey(candidate.name));
}
async function remove(kind,id){
 authorized();
 if(kind!=='session'){
  if(!confirm('Delete this '+kind+'?'))return;
  await LamaAPI.remove('resources',id);await load();return;
 }
 if(sessionBusy){status('Another academic session operation is running.');return}
 const target=data('session').find(r=>String(r.id)===String(id));
 if(!target)throw Error('Session not found. Refresh the schedule before deleting.');

 const initial=sessionReferences(id);
 if(initial.periods||initial.events)
  throw Error('Cannot delete '+target.name+': '+initial.periods+' timetable period(s) and '+initial.events+' calendar event(s) still use this session. Reassign or remove those entries first.');
 sessionBusy=true;
 try{
  // Read the current resource sheet again before displaying a destructive
  // confirmation. Never delete based only on a potentially stale screen.
  const latest=await LamaAPI.list('resources');
  if(!Array.isArray(latest))throw Error('Latest school calendar could not be verified. No deletion attempted.');
  const live=sessionRecords(latest).find(r=>String(r.id)===String(id));
  if(!live)throw Error('This session has already been removed or changed. Refresh the schedule.');
  if(sessionKey(live.name)!==sessionKey(target.name)||String(live.start)!==String(target.start)||String(live.end)!==String(target.end))
   throw Error('This academic session changed since it was displayed. Refresh before deleting.');

  const refs=sessionReferences(id,latest);
  if(refs.periods||refs.events)
   throw Error('Deletion blocked: '+refs.periods+' timetable period(s) and '+refs.events+' calendar event(s) now refer to this session.');
  const summary='"'+live.name+'" ('+live.start+' – '+live.end+'), record '+String(live.id).slice(-8);
  if(!confirm('Permanently delete ONLY academic session '+summary+'?\n\nThis action cannot be undone. Student records will not be deleted.'))return;
  await LamaAPI.remove('resources',id);
  if($('sessionId').value===id)$('sessionId').value='';
  const reloaded=await load();
  if(!reloaded)throw Error('Deletion may have succeeded, but the session list could not be reloaded. Refresh and verify before trying again.');
  if(data('session').some(r=>String(r.id)===String(id)))
   throw Error('Deletion was not verified. Refresh the academic session list before retrying.');
  status('Academic session "'+live.name+'" deleted and the list verified. Other school records were not changed.');
 }finally{sessionBusy=false}
}

function timetableForSession(){return data('period').filter(p=>p.sessionId===activeSession()&&allowed(p))}
function visibleClasses(periods=timetableForSession()){
 const extra=adminMode?[...offeredClasses]:[];
 if(adminMode)for(const c of curriculumClasses){
  if(!offeredClasses.some(o=>LamaTimetableGrid.classKey(o.name)===LamaTimetableGrid.classKey(c.name)))extra.push(c);
 }
 return LamaTimetableGrid.labels(periods,extra);
}
function renderPrintClassPicker(periods,sessionId){
 const classes=visibleClasses(periods);
 if(!printSelection||printSelectionSession!==sessionId){printSelection=new Set(classes);printSelectionSession=sessionId}
 else printSelection=new Set([...printSelection].filter(c=>classes.includes(c)));
 $('printClassList').innerHTML=classes.length?classes.map(c=>'<label class="print-class-option"><input type="checkbox" data-print-class="'+esc(c)+'" '+(printSelection.has(c)?'checked':'')+'><span>'+esc(c)+'</span></label>').join(''):'<p class="text-slate-400 text-xs">No classes available yet. Add them in School Settings or the Period editor.</p>';
 const sel=$('printOneClass'),old=sel.value;sel.replaceChildren(new Option('Choose a class / section',''));
 for(const c of classes)sel.add(new Option(c,c));if(classes.includes(old))sel.value=old;
 updatePrintCount();
}
function updatePrintCount(){
 const total=$('printClassList').querySelectorAll('[data-print-class]').length;
 $('printClassStatus').textContent=(printSelection?.size||0)+' of '+total+' classes selected. Select Print layout to choose master, individual or separate class pages.';
}
function gridState(){const key=activeSession()+'|'+field('quickDay');if(!hiddenGrid.has(key))hiddenGrid.set(key,{classes:new Set(),periods:new Set()});return hiddenGrid.get(key)}
function renderQuickGrid(periods=timetableForSession()){
 if(!adminMode)return;
 const hidden=gridState();$('quickGrid').innerHTML=LamaTimetableGrid.gridMarkup(periods,visibleClasses(periods).filter(c=>!hidden.classes.has(LamaTimetableGrid.classKey(c))),field('quickDay')||'Monday',Number(field('quickPeriods'))||8,[...hidden.periods]);
}
function curriculumSubjects(grade){
 const match=curriculumClasses.find(c=>LamaTimetableGrid.classKey(c.name)===LamaTimetableGrid.classKey(grade));
 return [...new Set((Array.isArray(match?.subjects)?match.subjects:[]).map(x=>String(x).trim()).filter(Boolean))];
}
function subjectOptionsFor(grade,id='quickSubject',previous=''){
 const select=$(id),choices=curriculumSubjects(grade);
 select.replaceChildren(new Option(choices.length?'Choose subject':'Configure class subjects in School Settings',''));
 for(const subj of choices)select.add(new Option(subj,subj));
 // Preserve an existing legacy lesson when editing, without offering it for new lessons.
 if(previous&&!choices.includes(previous))select.add(new Option(previous+' (existing lesson)',previous));
 select.value=previous||'';
}
function populateClassEditor(grade='',section='',subject=''){
 const labels=visibleClasses(),grades=[...new Map(labels.map(x=>{const g=LamaTimetableGrid.splitLabel(x).grade;return [LamaTimetableGrid.classKey(g),g]})).values()];
 const select=$('grade');select.replaceChildren(new Option('Choose class',''));
 for(const g of grades)select.add(new Option(g,g));
 const match=grades.find(g=>LamaTimetableGrid.classKey(g)===LamaTimetableGrid.classKey(grade));
 if(grade&&!match)select.add(new Option(grade,grade));
 select.value=match||grade||'';
 const sections=labels.map(x=>LamaTimetableGrid.splitLabel(x)).filter(x=>LamaTimetableGrid.classKey(x.grade)===LamaTimetableGrid.classKey(select.value)).map(x=>x.section).filter(Boolean);
 $('section').replaceChildren(new Option('No section',''));for(const sec of new Set([...sections,...(section?[section]:[])]))$('section').add(new Option(sec,sec));
 $('section').value=section;subjectOptionsFor(select.value,'subject',subject);
}
function requireSubject(grade,subject,old){
 if(!curriculumSubjects(grade).includes(subject)&&!(old&&same(old.grade,grade)&&old.subject===subject))throw Error('Choose a subject configured for this class in School Settings.');
}
async function clearGridAxis(kind,value){
 authorized();if(quickBusy)throw Error('Another timetable operation is running.');
 const day=field('quickDay'),sid=activeSession();if(!sid)throw Error('Select a session first.');
 const match=p=>p.sessionId===sid&&same(p.day,day)&&(kind==='period'?Number(p.period)===Number(value):LamaTimetableGrid.classKey(LamaTimetableGrid.classLabel(p))===LamaTimetableGrid.classKey(value));
 quickBusy=true;
 try{
  const latest=await LamaAPI.list('resources');if(!Array.isArray(latest))throw Error('Cannot verify timetable.');
  const targets=latest.filter(r=>r.category===type.period&&match(parsed(r)));
  const label=kind==='period'?'Period '+value:value;
  if(targets.length&&!confirm('Delete '+targets.length+' saved lesson(s) for '+label+' on '+day+' in the selected session? Other days, classes and school settings will remain unchanged.'))return;
  if(!targets.length&&!confirm('Hide empty '+label+' from this day’s grid? You can restore it.'))return;
  for(const item of targets)await LamaAPI.remove('resources',item.id);
  if(!await load())throw Error('Could not verify removal. Refresh before retrying.');
  if(timetableForSession().some(match))throw Error('Some lessons remain. Review before retrying.');
  const hidden=gridState();if(kind==='period')hidden.periods.add(Number(value));else hidden.classes.add(LamaTimetableGrid.classKey(value));
  renderQuickGrid();status('Removed '+label+' from '+day+' grid. '+targets.length+' saved lesson(s) deleted and verified.');
 }finally{quickBusy=false}
}
function openQuickEditor(b){
 authorized();
 const day=b.dataset.quickDay,num=Number(b.dataset.quickPeriod),cls=b.dataset.quickClass;
 const parts=LamaTimetableGrid.splitLabel(cls),periods=timetableForSession();
 const matches=periods.filter(p=>same(p.day,day)&&Number(p.period)===num&&LamaTimetableGrid.classKey(LamaTimetableGrid.classLabel(p))===LamaTimetableGrid.classKey(cls));
 if(matches.length>1){status('This cell has multiple saved periods. Use the detailed editor to choose the correct one.');return}
 const old=matches[0],t=LamaTimetableGrid.timesFor(periods,day,num);
 for(const [id,v] of Object.entries({quickPeriodId:old?.id||'',quickGrade:parts.grade,quickSection:parts.section,quickPeriodDay:day,quickPeriodNumber:num,quickStart:old?.start||t.start,quickEnd:old?.end||t.end,quickSubject:old?.subject||'',quickRoom:old?.room||''}))$(id).value=v;
 $('quickPublished').checked=old?.published!==false;
 $('quickTeacher').replaceChildren(new Option('Unassigned',''));
 for(const teacher of teachers)$('quickTeacher').add(new Option(teacher.name||teacher.fullName||teacher.teacherName||'Teacher',teacher.id));
 $('quickTeacher').value=old?.teacherId||'';
 subjectOptionsFor(parts.grade,'quickSubject',old?.subject||'');
 $('quickTarget').textContent=(old?'Edit':'Add')+' · '+cls+' · '+day+' · P'+num;
 $('quickEditor').classList.remove('hidden');
 $('quickEditor').scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function saveQuickPeriod(){
 authorized();
 if(quickBusy)throw Error('Another period save is in progress.');
 const id=field('quickPeriodId'),grade=field('quickGrade'),section=field('quickSection'),day=field('quickPeriodDay'),period=Number(field('quickPeriodNumber')),start=field('quickStart'),end=field('quickEnd'),subject=field('quickSubject'),teacherId=field('quickTeacher');
 const sessionId=activeSession();
 if(!sessionId)throw Error('Create an academic session first.');
 if(!grade||!subject||!start||!end)throw Error('Class, subject, start and end time are required.');
 requireSubject(grade,subject,data('period').find(x=>String(x.id)===id));
 if(start>=end)throw Error('End time must be after start time.');
 if(!Number.isInteger(period)||period<1||period>30)throw Error('Invalid period number.');
 const conflicts=timetableForSession().filter(x=>String(x.id)!==id&&same(x.day,day)&&x.start<end&&x.end>start&&
  ((LamaTimetableGrid.classKey(LamaTimetableGrid.classLabel(x))===LamaTimetableGrid.classKey(grade+(section?' · Section '+section:'')))||(teacherId&&String(x.teacherId)===teacherId)));
 if(conflicts.length)throw Error('Time conflict: class/section or teacher is already scheduled during these times.');
 const payload={sessionId,day,period,start,end,grade,section,subject,teacherId,teacherName:(teachers.find(x=>String(x.id)===teacherId)?.name||teachers.find(x=>String(x.id)===teacherId)?.fullName||teachers.find(x=>String(x.id)===teacherId)?.teacherName||''),room:field('quickRoom'),published:$('quickPublished').checked};
 quickBusy=true;$('quickSave').disabled=true;
 try{
  const loaded=await save('period',id,payload);
  if(!loaded)throw Error('Save response received, but the timetable was not reloaded. Verify before retrying.');
  const saved=timetableForSession().filter(x=>LamaTimetableGrid.classKey(LamaTimetableGrid.classLabel(x))===LamaTimetableGrid.classKey(grade+(section?' · Section '+section:''))&&same(x.day,day)&&Number(x.period)===period&&x.start===start&&x.end===end&&x.subject===subject);
  if(saved.length!==1)throw Error('The saved period could not be uniquely verified. Check the list before retrying.');
  $('quickEditor').classList.add('hidden');
  status('✓ Saved and verified: '+grade+(section?' / '+section:'')+' · '+day+' P'+period+' · '+subject);
 }finally{quickBusy=false;$('quickSave').disabled=false}
}
function sessions(){return data('session').sort((a,b)=>a.start.localeCompare(b.start))}
function activeSession(){return field('viewSession')||sessions().find(s=>s.active)?.id||sessions()[0]?.id||''}
function render(){const list=sessions(),old=field('viewSession');for(const id of ['viewSession','periodSession','eventSession']){const el=$(id);el.replaceChildren();for(const s of list)el.add(new Option(s.name+(s.active?' (active)':''),s.id));if(list.some(s=>s.id===old))el.value=old}
const chosen=activeSession(),periods=data('period').filter(p=>p.sessionId===chosen&&allowed(p));
const grade=field('viewGrade'),oldGrade=grade;const grades=[...new Set(periods.map(p=>p.grade).filter(Boolean))].sort();$('viewGrade').replaceChildren(new Option('All classes',''));for(const g of grades)$('viewGrade').add(new Option(g,g));$('viewGrade').value=grades.includes(oldGrade)?oldGrade:'';
const selectedGrade=field('viewGrade'),day=field('viewDay');periods.sort((a,b)=>days.indexOf(a.day)-days.indexOf(b.day)||Number(a.period)-Number(b.period)||a.start.localeCompare(b.start));
const view=periods.filter(p=>(!selectedGrade||same(p.grade,selectedGrade))&&(!day||p.day===day));
$('periodRows').innerHTML=view.length?view.map(p=>'<tr class="border-b border-slate-700"><td class="p-2">'+esc(p.day)+'</td><td class="p-2">'+esc(p.period)+'</td><td class="p-2">'+esc(p.start)+'–'+esc(p.end)+'</td><td class="p-2">'+esc(p.grade)+(p.section?' / '+esc(p.section):'')+'</td><td class="p-2">'+esc(p.subject)+'</td><td class="p-2">'+esc(p.teacherName||'Unassigned')+'</td><td class="p-2 no-print">'+(adminMode?'<button class="text-cyan-300" data-edit-period="'+esc(p.id)+'">Edit</button> <button class="text-rose-300" data-remove-period="'+esc(p.id)+'">Delete</button> '+(p.teacherId?'<button class="text-amber-300" data-ping-period="'+esc(p.id)+'">Ping teacher</button>':''):'')+'</td></tr>').join(''):'<tr><td colspan="7" class="p-5 text-slate-400">No published periods for this selection.</td></tr>';
$('sessionList').innerHTML=list.map(s=>{
 const refs=sessionReferences(s.id),used=refs.periods+refs.events;
 const duplicate=list.some(other=>other.id!==s.id&&sessionKey(other.name)===sessionKey(s.name));
 const reason=used?'Move or delete '+refs.periods+' timetable period(s) and '+refs.events+' calendar event(s) before deleting.':'';
 return '<div class="border-b border-slate-700 p-3 flex flex-wrap justify-between items-center gap-3">'+
  '<div class="min-w-0 flex-1"><strong class="break-words">'+esc(s.name)+'</strong>'+
  (s.active?' <span class="text-xs text-emerald-300">(active)</span>':'')+
  (duplicate?' <span class="text-xs text-amber-300">(repeated name)</span>':'')+
  '<div class="text-xs text-slate-300">'+esc(s.start)+' – '+esc(s.end)+'</div>'+
  '<div class="text-[11px] text-slate-400">Record '+esc(String(s.id).slice(-8))+
   ' · '+refs.periods+' period(s), '+refs.events+' calendar event(s)</div>'+
  (reason?'<p class="text-xs text-amber-300 mt-1">'+esc(reason)+'</p>':'')+'</div>'+
  '<div class="flex flex-wrap items-center gap-3">'+
  '<button type="button" class="text-cyan-300 min-h-10 px-2" data-edit-session="'+esc(s.id)+'">Edit</button>'+
  '<button type="button" class="text-rose-300 border border-rose-800 rounded-lg min-h-10 px-3 disabled:opacity-40 disabled:cursor-not-allowed" data-remove-session="'+esc(s.id)+'" aria-label="Delete session '+esc(s.name)+'" title="'+esc(reason||'Delete this unlinked academic session')+'" '+(reason?'disabled':'')+'>Delete</button>'+
  '</div></div>';
}).join('');
renderCalendar();renderPrintClassPicker(periods,chosen);if(adminMode){populateClassEditor(field('grade'),field('section'),field('subject'));renderQuickGrid(periods);}
}
function renderCalendar(){const chosen=activeSession(),events=data('event').filter(e=>e.sessionId===chosen&&allowed(e)).sort((a,b)=>a.start.localeCompare(b.start));$('monthTitle').textContent=month.toLocaleDateString(undefined,{month:'long',year:'numeric'});const y=month.getFullYear(),m=month.getMonth(),offset=(new Date(y,m,1).getDay()+6)%7,last=new Date(y,m+1,0).getDate();let h=days.map(d=>'<b class="p-2 text-cyan-300">'+d.slice(0,3)+'</b>').join('');for(let i=0;i<offset;i++)h+='<div></div>';for(let d=1;d<=last;d++){const date=[y,String(m+1).padStart(2,'0'),String(d).padStart(2,'0')].join('-'),hits=events.filter(e=>e.start<=date&&e.end>=date);h+='<div class="border border-slate-700 rounded-lg min-h-16 p-1 text-left"><b>'+d+'</b>'+hits.slice(0,2).map(e=>'<p class="text-[10px] text-amber-300 truncate" title="'+esc(e.title)+'">'+esc(e.title)+'</p>').join('')+'</div>'}$('monthGrid').innerHTML=h;
$('eventRows').innerHTML=events.length?events.map(e=>'<div class="border-b border-slate-700 py-2 text-sm"><b>'+esc(e.type)+'</b> · '+esc(e.title)+' · '+esc(e.start)+' – '+esc(e.end)+(e.description?' · '+esc(e.description):'')+(adminMode?' <button class="text-cyan-300" data-edit-event="'+esc(e.id)+'">Edit</button> <button class="text-rose-300" data-remove-event="'+esc(e.id)+'">Delete</button>':'')+'</div>').join(''):'<p class="text-slate-400 text-sm">No events for this session.</p>'}
function edit(kind,id){const p=data(kind).find(r=>r.id===id);if(!p)return;const fields=kind==='period'?{periodId:'id',periodSession:'sessionId',day:'day',period:'period',start:'start',end:'end',grade:'grade',section:'section',subject:'subject',teacher:'teacherId',room:'room',published:'published'}:kind==='event'?{eventId:'id',eventSession:'sessionId',eventType:'type',eventTitle:'title',eventStart:'start',eventEnd:'end',eventDescription:'description',eventPublished:'published'}:{sessionId:'id',sessionName:'name',sessionStart:'start',sessionEnd:'end',sessionActive:'active'};if(kind==='period')populateClassEditor(p.grade,p.section||'',p.subject||'');for(const [input,key] of Object.entries(fields)){if($(input).type==='checkbox')$(input).checked=p[key]!==false;else if(kind!=='period'||!['grade','section','subject'].includes(input))$(input).value=p[key]??''}window.scrollTo({top:0,behavior:'smooth'})}
$('periodForm').onsubmit=async e=>{e.preventDefault();try{authorized();const p={sessionId:field('periodSession'),day:field('day'),period:Number(field('period')),start:field('start'),end:field('end'),grade:field('grade'),section:field('section'),subject:field('subject'),teacherId:field('teacher'),teacherName:teachers.find(t=>t.id===field('teacher'))?.name||'',room:field('room'),published:$('published').checked};if(!p.sessionId)throw Error('Create an academic session first');requireSubject(p.grade,p.subject,data('period').find(x=>String(x.id)===field('periodId')));if(p.start>=p.end)throw Error('Period end must be after start');const conflict=data('period').find(x=>x.id!==field('periodId')&&x.sessionId===p.sessionId&&x.day===p.day&&x.start<p.end&&x.end>p.start&&((same(x.grade,p.grade)&&same(x.section,p.section))||(p.teacherId&&x.teacherId===p.teacherId)));if(conflict)throw Error('Time conflict: class/section or teacher is already assigned');await save('period',field('periodId'),p);$('periodId').value='';status('Period saved')}catch(err){status(err.message)}};
$('sessionForm').onsubmit=async e=>{
 e.preventDefault();
 if(sessionBusy){status('Academic session is being saved. Please do not submit twice.');return}
 sessionBusy=true;
 const submit=$('saveSession');submit.disabled=true;
 let attemptedWrite=false;
 try{
  authorized();
  const p={name:field('sessionName'),start:field('sessionStart'),end:field('sessionEnd'),active:$('sessionActive').checked};
  const editingId=field('sessionId');
  if(!p.name||!p.start||!p.end)throw Error('Enter the academic session name and both dates.');
  if(p.start>p.end)throw Error('Session start must precede end.');
  // A fresh read prevents repeat taps and stale browser tabs from creating
  // indistinguishable academic sessions.
  const latest=await LamaAPI.list('resources');
  if(!Array.isArray(latest))throw Error('Cannot verify existing sessions. No session was saved.');
  const prior=editingId?sessionRecords(latest).find(s=>String(s.id)===String(editingId)):null;
  if(editingId&&!prior)
   throw Error('The session being edited no longer exists. Refresh before saving.');
  // Permit correction/deactivation of already duplicated legacy sessions,
  // while refusing any new duplicate session name.
  if((!editingId||sessionKey(prior.name)!==sessionKey(p.name))&&sessionDuplicate(p,editingId,latest))
   throw Error('This academic session name already exists. Use its Edit button instead of creating a duplicate.');
  if(p.active&&sessionRecords(latest).some(s=>String(s.id)!==String(editingId)&&s.active))
   throw Error('Deactivate the previous active session before activating another.');
  attemptedWrite=true;
  const refreshed=await save('session',editingId,p);
  if(!refreshed)throw Error('Session save response received but the updated list could not be verified.');
  const matching=sessionRecords().filter(s=>(editingId?String(s.id)===String(editingId):sessionKey(s.name)===sessionKey(p.name))&&same(s.name,p.name)&&s.start===p.start&&s.end===p.end&&!!s.active===p.active);
  if(matching.length!==1)throw Error('Session save could not be uniquely verified. Review the list before trying again.');
  $('sessionId').value='';
  status('Academic session saved and verified. Duplicate names are blocked.');
 }catch(err){
  status((attemptedWrite?'Session save not fully verified. Refresh and check the list before retrying. ':'')+err.message);
 }finally{sessionBusy=false;submit.disabled=false}
};
$('eventForm').onsubmit=async e=>{e.preventDefault();try{const p={sessionId:field('eventSession'),type:field('eventType'),title:field('eventTitle'),start:field('eventStart'),end:field('eventEnd'),description:field('eventDescription'),published:$('eventPublished').checked};if(!p.sessionId)throw Error('Create an academic session first');if(p.start>p.end)throw Error('Event start must precede end');await save('event',field('eventId'),p);$('eventId').value='';status('Event saved')}catch(err){status(err.message)}};
$('clearPeriod').onclick=()=>{$('periodForm').reset();$('periodId').value=''};$('clearEvent').onclick=()=>{$('eventForm').reset();$('eventId').value=''};$('clearSession').onclick=()=>{$('sessionForm').reset();$('sessionId').value='';status('Ready to add a new academic session.')};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const pingId=b.getAttribute('data-ping-period');if(pingId){(async()=>{try{authorized();const p=data('period').find(x=>x.id===pingId);if(!p?.teacherId)throw Error('No assigned teacher');const msg='Period reminder: '+p.day+' '+p.start+'–'+p.end+', '+p.subject+', Class '+p.grade+(p.section?' '+p.section:'')+'.';await LamaAPI.pingTeacher(p.teacherId,msg);status('In-app teacher ping queued. This does not send WhatsApp.')}catch(err){status('Ping failed: '+err.message)}})();return}for(const kind of ['period','session','event']){const editId=b.getAttribute('data-edit-'+kind),removeId=b.getAttribute('data-remove-'+kind);if(editId){edit(kind,editId);return}if(removeId){remove(kind,removeId).catch(err=>status(err.message));return}}});

$('printClassList').addEventListener('change',event=>{
 const input=event.target.closest('input[data-print-class]');if(!input)return;
 if(input.checked)printSelection.add(input.dataset.printClass);
 else printSelection.delete(input.dataset.printClass);
 updatePrintCount();
});
$('selectAllPrintClasses').onclick=()=>{
 printSelection=new Set(visibleClasses());renderPrintClassPicker(timetableForSession(),activeSession());
};
$('clearPrintClasses').onclick=()=>{
 printSelection=new Set();renderPrintClassPicker(timetableForSession(),activeSession());
};
$('quickDay').onchange=()=>renderQuickGrid();
$('quickPeriods').onchange=()=>{const n=Number($('quickPeriods').value);$('quickPeriods').value=String(Math.max(1,Math.min(14,Number.isFinite(n)?n:8)));renderQuickGrid()};
$('grade').onchange=()=>populateClassEditor(field('grade'));
$('restoreGrid').onclick=()=>{hiddenGrid.delete(activeSession()+'|'+field('quickDay'));renderQuickGrid()};
$('quickGrid').addEventListener('click',event=>{
 const remove=event.target.closest('button[data-clear-period],button[data-clear-class]');if(remove){const isPeriod=remove.hasAttribute('data-clear-period');clearGridAxis(isPeriod?'period':'class',isPeriod?remove.dataset.clearPeriod:remove.dataset.clearClass).catch(e=>status('Removal not fully verified: '+e.message));return;}
 const button=event.target.closest('button[data-quick-class]');
 if(!button)return;
 try{openQuickEditor(button)}catch(e){status(e.message)}
});
$('quickForm').addEventListener('submit',async event=>{
 event.preventDefault();
 try{await saveQuickPeriod()}catch(error){status('Quick save not verified: '+error.message)}
});
$('quickCancel').onclick=()=>$('quickEditor').classList.add('hidden');
$('quickOpenFull').onclick=()=>{
 if(!adminMode)return;
 populateClassEditor(field('quickGrade'),field('quickSection'),field('quickSubject'));
 for(const [id,v] of Object.entries({
  periodId:field('quickPeriodId'),periodSession:activeSession(),day:field('quickPeriodDay'),
  period:field('quickPeriodNumber'),start:field('quickStart'),end:field('quickEnd'),
  teacher:field('quickTeacher'),room:field('quickRoom')}))$(id).value=v;
 $('published').checked=$('quickPublished').checked;
 $('quickEditor').classList.add('hidden');$('periodForm').scrollIntoView({behavior:'smooth'});
};
for(const id of ['viewSession','viewGrade','viewDay'])$(id).onchange=render;
$('prevMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);renderCalendar()};$('nextMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);renderCalendar()};$('reload').onclick=load;$('print').onclick=printTimetable;
function printProfileFallback(){
 const schoolRole=role==='school';
 return {
  name:session?.schoolName||session?.instituteName||(schoolRole?session?.name:'')||'',
  logo:session?.schoolLogo||session?.logo||session?.logoUrl||''
 };
}
async function printProfile(){
 if(printSchoolProfile)return printSchoolProfile;
 const fallback=printProfileFallback();
 if(adminMode&&typeof LamaAPI.getActiveSchool==='function'){
  try{
   const school=await LamaAPI.getActiveSchool();
   if(school&&typeof school==='object'){
    printSchoolProfile={...fallback,...school,
     name:school.name||school.schoolName||fallback.name,
     logo:school.logo||school.logoUrl||school.schoolLogo||fallback.logo};
   }
  }catch(error){console.warn('School branding unavailable; using logged-in school profile',error)}
 }
 return printSchoolProfile||(printSchoolProfile=fallback);
}
function buildTimetablePrint(profile){
 const selectedSession=activeSession();
 const name=sessions().find(item=>item.id===selectedSession)?.name||'Not configured';
 const periods=data('period').filter(p=>p.sessionId===selectedSession&&allowed(p));
 const mode=field('printScope');
 const cls=field('printOneClass')||field('viewGrade');
 const selectedClasses=printSelection instanceof Set?[...printSelection]:null;
 const calendarIncluded=$('printCalendar').checked;
 const calMonth=$('monthTitle').textContent;
 return LamaTimetablePrint.printMarkup({
  school:profile,
  schoolFallback:printProfileFallback(),
  sessionName:name,
  records:periods,
  scope:mode,
  selectedClass:cls,
  selectedClasses:mode==='selected'?null:selectedClasses,
  printDay:field('printDay'),
  calendar:calendarIncluded,
  calendarMonth:calMonth,
  calendarContent:$('monthGrid').innerHTML,
  calendarItems:data('event').filter(event=>event.sessionId===selectedSession&&allowed(event)&&event.published!==false).sort((a,b)=>String(a.start||'').localeCompare(String(b.start||'')))
 });
}
async function printTimetable(){
 const button=$('print');
 if(button.disabled)return;
 button.disabled=true;
 const original=button.textContent;
 button.textContent='Preparing school timetable…';
 try{
  const profile=await printProfile();
  const output=buildTimetablePrint(profile);
  $('printSheet').innerHTML=output;
  printPrepared=true;
  const img=$('printSheet').querySelector('img.print-school-logo');
  if(img&&typeof img.decode==='function'){
   // A logo that cannot load should not prevent the timetable from printing.
   await Promise.race([img.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1800))]);
  }
  window.print();
 }catch(error){
  printPrepared=false;
  status('Print view not opened: '+error.message);
 }finally{
  button.disabled=false;
  button.textContent=original;
 }
}
window.addEventListener('beforeprint',()=>{
 // Support the browser's own Print command without replacing a logo
 // whose bytes have already been loaded for the print-button preview.
 if(printPrepared)return;
 try{$('printSheet').innerHTML=buildTimetablePrint(printSchoolProfile||printProfileFallback());printPrepared=true}
 catch(error){status('Unable to prepare print: '+error.message)}
});
window.addEventListener('afterprint',()=>{printPrepared=false});
async function init(){if(!['school','student','teacher'].includes(role)||!schoolId){status('Valid school, student or teacher login required.');return}if(role==='teacher')$('back').href='../portals/teacher/index.html';if(role==='student')$('back').href='../portals/student/index.html';if(adminMode){let a;try{a=JSON.parse(sessionStorage.getItem('lama_school_admin_auth')||'null')}catch{}if(!a?.token||a.schoolId!==schoolId){status('School administrator login required.');return}try{await LamaAPI.schoolAdminVerify(schoolId,a.token);verified=true;$('admin').classList.remove('hidden');$('quickBuilder').classList.remove('hidden')}catch(e){status('Administrator verification failed: '+e.message);return}}else{for(const el of document.querySelectorAll('#admin'))el.remove()}await load();void printProfile()}
init();
})();