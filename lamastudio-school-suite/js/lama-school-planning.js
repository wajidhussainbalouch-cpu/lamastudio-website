(()=>{'use strict';
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const role=new URLSearchParams(location.search).get('role')||'school',adminMode=role==='school',session=LamaAPI.getSession(role),schoolId=session?.schoolId;
let schoolWeekResources=[],rows=[],teachers=[],teacherDirectoryLoaded=false,offeredClasses=[],curriculumClasses=[],month=new Date(new Date().getFullYear(),new Date().getMonth(),1),verified=false,sessionBusy=false,printSchoolProfile=null,printPrepared=false,printSelection=null,printSelectionSession='',quickBusy=false,hiddenGrid=new Map(),quickScopePreference='day',quickCustomDays=days.slice(0,6),quickSession='',periodNeedsRefresh=false,timingFormSession='',timingBusy=false;
const type={period:'planning-period',session:'planning-session',event:'planning-event'};
const status=s=>{$('status').textContent=s};
const field=id=>$(id).value.trim(),parsed=r=>{try{return JSON.parse(r.description||'{}')}catch{return {}}};
const data=t=>rows.filter(r=>r.category===type[t]).map(r=>({...parsed(r),id:r.id})).filter(r=>r.id);
const same=(a,b)=>String(a??'').trim().toLowerCase()===String(b??'').trim().toLowerCase();
const authorized=()=>{if(!adminMode||!verified)throw Error('Verified school administrator required')};
const matchStudent=r=>same(r.grade,session?.class||session?.grade||session?.studentClass)&&(!session?.section||!r.section||same(r.section,session.section));
const matchTeacher=r=>same(r.teacherId,session?.teacherId||session?.id)||(r.supportKind==='teacher'&&same(r.supportId,session?.teacherId||session?.id));
function allowed(r){if(adminMode)return true;if(r.published===false)return false;if(r.type&&r.title&&r.start&&r.end&&!r.grade&&!r.teacherId)return true;if(role==='student')return matchStudent(r);if(role==='teacher')return matchTeacher(r);return false}
async function load(allowBusy=false){if((quickBusy||timingBusy)&&allowBusy!==true)return false;if(!schoolId){status('School session missing. Sign in again.');return}try{const all=await LamaAPI.list('resources');if(!Array.isArray(all))throw Error('Invalid saved schedule response. Refresh to retry.');schoolWeekResources=all;LamaSchoolWeek.read(all);rows=all.filter(r=>Object.values(type).includes(r.category));if(adminMode){
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
if(adminMode){await Promise.all([loadTeacherDirectory(),loadSupportStaff()]);populateTeacherPicker('teacher',field('subject'),field('teacher'));populateTeacherPicker('quickTeacher',field('quickSubject'),field('quickTeacher'))}timingFormSession='';if($('vacationForm'))$('vacationForm').dataset.session='';if($('academicTermForm'))$('academicTermForm').dataset.session='';render();periodNeedsRefresh=false;if(adminMode&&$('classBuilder'))updateClassDraft();status('Schedule loaded. '+data('period').length+' period entries, '+data('event').length+' calendar entries.'+(adminMode?(teacherDirectoryLoaded?' '+teachers.length+' active teacher(s) available.':' Teacher directory unavailable. Refresh before assigning a lesson.') :''));return true}catch(e){status('Unable to load schedule: '+e.message);return false}}
async function save(kind,id,payload){authorized();if(kind==='period'){if(quickBusy||periodNeedsRefresh)throw Error('Finish the timetable operation or refresh before saving.');quickBusy=true;try{await writePeriod(id,payload);render();return true}catch(e){periodNeedsRefresh=true;throw Error('Save could not be confirmed. Reload the timetable before retrying. '+e.message)}finally{quickBusy=false}}const title=kind==='period'?[payload.day,payload.grade,payload.period].join(' · '):kind==='session'?payload.name:payload.title;const record={category:type[kind],title,description:JSON.stringify(payload),link:''};if(id)await LamaAPI.update('resources',id,record);else await LamaAPI.add('resources',record);return await load()}
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
  if(quickBusy||timingBusy||sessionBusy||periodNeedsRefresh)throw Error('Timetable is busy or needs refresh. Reload before deleting.');
  const category=type[kind],prior=rows.find(r=>r.category===category&&String(r.id)===String(id));
  if(!prior)throw Error('Saved '+kind+' not found. Refresh the timetable.');
  const item=parsed(prior),label=kind==='period'?item.day+' · '+item.grade+' · P'+item.period+' · '+(item.start||'')+'–'+(item.end||''):item.title+' · '+item.start;
  if(!confirm('Permanently delete this saved '+kind+'?\n'+label+'\n\nOther lessons and settings will not change.'))return;
  quickBusy=true;let attempted=false;
  try{
   const fresh=await LamaAPI.list('resources');
   if(!Array.isArray(fresh))throw Error('Latest timetable could not be verified. No deletion attempted.');
   const live=fresh.find(r=>r.category===category&&String(r.id)===String(id));
   if(!live||String(live.description||'')!==String(prior.description||''))throw Error('The saved period changed. Refresh before deleting.');
   attempted=true;await LamaAPI.remove('resources',id);
   const latest=await LamaAPI.list('resources');
   if(!Array.isArray(latest)||latest.some(r=>String(r.id)===String(id)))throw Error('Deletion not verified in Google Sheets. Refresh before retrying.');
   if(latest.filter(r=>r.category===category).length!==fresh.filter(r=>r.category===category).length-1)throw Error('Unexpected change in saved periods. Refresh and inspect.');
   schoolWeekResources=latest;rows=latest.filter(r=>Object.values(type).includes(r.category));
   render();periodNeedsRefresh=false;status('✓ '+kind+' deleted and verified against saved records.');return;
  }catch(e){if(attempted)periodNeedsRefresh=true;throw Error((attempted?'Deletion status uncertain. Refresh before trying again. ':'')+e.message)}
  finally{quickBusy=false}
 }
 if(sessionBusy||timingBusy){status('Another academic session operation is running.');return}
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
function slotOutsideHours(sessionId,day,period,periods,season=chosenSeason()){
 const exact=periods.filter(p=>p.sessionId===sessionId&&Number(p.period)===Number(period)&&p.day===day&&validTime(p.start)&&validTime(p.end));
 const known=exact.length?exact:periods.filter(p=>p.sessionId===sessionId&&Number(p.period)===Number(period)&&validTime(p.start)&&validTime(p.end));
 return !!known.length&&known.every(p=>!!currentLessonIssue({sessionId,day,start:p.start,end:p.end},season));
}
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
 queuePrintPreview();
}
function gridState(){const key=activeSession()+'|'+field('quickDay');if(!hiddenGrid.has(key))hiddenGrid.set(key,{classes:new Set(),periods:new Set()});return hiddenGrid.get(key)}
function renderQuickGrid(periods=timetableForSession()){
 if(!adminMode)return;const work=workingWeek();for(const id of ['quickDay','quickTargetDay','day','cbDay','viewDay']){const el=$(id);if(!el)continue;for(const o of el.options)o.disabled=days.includes(o.value)&&!work.includes(o.value);if(days.includes(el.value)&&!work.includes(el.value))el.value=[...el.options].some(o=>o.value==='')?'':work[0]||'';}
 const hidden=gridState(),day=field('quickDay')||'Monday',sid=activeSession(),safe=periods.filter(p=>!currentLessonIssue(p,chosenSeason()));
 const classes=visibleClasses(periods).filter(c=>!hidden.classes.has(LamaTimetableGrid.classKey(c))),counts=Object.fromEntries(classes.map(c=>[countKey(c),effectivePeriodCount(sid,c,periods)]));
 const count=Math.max(1,...Object.values(counts)),hiddenSlots=new Set(hidden.periods);
 for(let i=1;i<=count;i++)if(slotOutsideHours(sid,day,i,periods))hiddenSlots.add(i);
 $('quickPeriods').value=String(count);
 $('quickGrid').innerHTML=LamaTimetableGrid.gridMarkup(safe,classes,day,count,[...hiddenSlots],counts);
}
function teacherLabel(t){return String(t?.name||t?.fullName||t?.teacherName||'').trim()}
function normalizeTeachers(records){
 if(!Array.isArray(records))throw Error('Incomplete teacher directory');
 const unique=new Map();
 for(const t of records){
  const id=String(t?.id??'').trim(),name=teacherLabel(t);
  if(!id||!name||String(t.status||'Active').trim().toLowerCase()!=='active')continue;
  unique.set(id,{id,name,designation:String(t.designation||'').trim(),subject:String(t.subject||'').trim(),assignedClass:String(t.assignedClass||'').trim(),assignedSection:String(t.assignedSection||'').trim(),loginId:String(t.loginId||'').trim()});
 }
 return [...unique.values()].sort(LamaClassOrder.teachers);
}
let supportStaff=[],supportDirectoryReady=false;
async function loadSupportStaff(){supportStaff=[];supportDirectoryReady=false;try{const r=await LamaAPI.staffAdminDirectory();if(r?.version!==1||!Array.isArray(r.staff))throw Error('Invalid staff directory');supportStaff=r.staff.filter(x=>x.status==='Active').map(x=>({id:String(x.id),name:String(x.name),role:String(x.designation||'Support staff'),kind:'staff'}));supportDirectoryReady=true}catch(e){console.warn('Additional staff directory unavailable',e.message)}}
function planningStaffKeys(p){return [p.teacherId?'teacher:'+p.teacherId:'',p.supportId?p.supportKind+':'+p.supportId:''].filter(Boolean)}
async function loadTeacherDirectory(){
 teacherDirectoryLoaded=false;teachers=[];
 // The same authenticated, school-scoped collection used by Manage Teachers.
 try{teachers=normalizeTeachers(await LamaAPI.list('teachers'));teacherDirectoryLoaded=true;return}
 catch(err){console.warn('Teacher list unavailable; trying management directory',err.message)}
 try{
  if(typeof LamaAPI.getTeacherManagementBootstrap!=='function')throw Error('Teacher directory unavailable');
  const result=await LamaAPI.getTeacherManagementBootstrap();
  if(result?.diagnostics?.teachersLoaded===false||(result?.warnings||[]).some(w=>String(w).startsWith('Teacher records:')))throw Error('Teacher records could not be verified');
  if(result?.school?.schoolId&&String(result.school.schoolId)!==String(schoolId))throw Error('School mismatch');
  teachers=normalizeTeachers(result?.records);teacherDirectoryLoaded=true;
 }catch(err){console.warn('Teacher directory unavailable',err.message)}
}
function teacherSubjectMatch(t,subject){
 const key=x=>String(x||'').toLowerCase().trim().replace(/\s+/g,' ');
 return !!key(subject)&&String(t.subject||'').split(/[,;|/]/).some(s=>key(s)===key(subject));
}
function teacherChoices(subject){
 return [...teachers].sort((a,b)=>LamaClassOrder.compare(LamaTimetableGrid.classLabel({grade:a.assignedClass,section:a.assignedSection}),LamaTimetableGrid.classLabel({grade:b.assignedClass,section:b.assignedSection}))||Number(teacherSubjectMatch(b,subject))-Number(teacherSubjectMatch(a,subject))||LamaClassOrder.teachers(a,b));
}
function populateTeacherPicker(id,subject,previous=''){
 const select=$(id),choices=teacherChoices(subject);
 select.replaceChildren(new Option(!teacherDirectoryLoaded?'Teacher list unavailable — refresh':!choices.length?'No active teachers — add in Manage Teachers':'Select teacher',''));
 select.disabled=!teacherDirectoryLoaded||!choices.length;
 for(const t of choices){
  const duplicated=choices.filter(x=>same(x.name,t.name)).length>1;
  const detail=[t.subject,duplicated?(t.loginId||t.id):''].filter(Boolean).join(' · ');
  select.add(new Option((t.assignedClass||'Unassigned')+(t.assignedSection?' / '+t.assignedSection:'')+' — '+t.name+(detail?' · '+detail:''),t.id));
 }
 select.value=choices.some(t=>t.id===String(previous))?String(previous):'';
}
function requireTeacher(id){
 if(!teacherDirectoryLoaded)throw Error('Teacher directory unavailable. Refresh and try again.');
 const teacher=teachers.find(t=>t.id===String(id));
 if(!teacher)throw Error('Select an active teacher from your school teacher list.');
 return teacher;
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
 $('section').value=section;subjectOptionsFor(select.value,'subject',subject);populateTeacherPicker('teacher',field('subject'),field('teacher'));
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
  if(!await load(true))throw Error('Could not verify removal. Refresh before retrying.');
  if(timetableForSession().some(match))throw Error('Some lessons remain. Review before retrying.');
  const hidden=gridState();if(kind==='period')hidden.periods.add(Number(value));else hidden.classes.add(LamaTimetableGrid.classKey(value));
  renderQuickGrid();status('Removed '+label+' from '+day+' grid. '+targets.length+' saved lesson(s) deleted and verified.');
 }finally{quickBusy=false}
}
// The generic resources API returns the saved record after the sheet write.
async function writePeriod(id,payload){
 const old=id?data('period').find(x=>String(x.id)===String(id)):null;if(old?.supportId)throw Error('Use Easy timetable builder to edit lessons with additional staff.');
 assertLessonHours(payload);
 if(!workingWeek().includes(payload.day))throw Error(payload.day+' is not a working day. Change School Settings if required.');
 if(checkProposedConflicts(data('period'),[{id,payload}]).some(c=>!c.warningOnly))throw Error('Blocking timetable conflict. Review the weekly conflict report.');
 const record={category:type.period,title:[payload.day,payload.grade,payload.period].join(' · '),description:JSON.stringify(payload),link:''};
 const saved=id?await LamaAPI.update('resources',id,record):await LamaAPI.add('resources',record);
 if(!saved?.id||(id&&String(saved.id)!==String(id))||saved.category!==type.period)throw Error('Missing or invalid server acknowledgement.');
 const actual=parsed(saved);
 if(Object.keys(payload).some(k=>actual[k]!==payload[k]))throw Error('Server acknowledgement did not match the submitted lesson.');
 const index=rows.findIndex(r=>String(r.id)===String(saved.id));
 if(index<0)rows.push(saved);else rows[index]=saved;
}
function validDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v}
function validTime(v){return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v)}
function validateTiming(t){
 if(!t||!validDate(t.from)||!validDate(t.to)||t.from>t.to)throw Error('Choose a valid season start and end date.');
 if(!t.hours||!days.some(d=>t.hours[d]?.open===true))throw Error('Choose at least one working day.');
 if((t.breakStart||t.breakEnd)&&(!validTime(t.breakStart)||!validTime(t.breakEnd)||t.breakStart>=t.breakEnd))throw Error('Choose a valid lunch break or leave both fields empty.');
 if((t.assemblyStart||t.assemblyEnd)&&(!validTime(t.assemblyStart)||!validTime(t.assemblyEnd)||t.assemblyStart>=t.assemblyEnd))throw Error('Choose valid assembly times or leave both blank.');
 if(t.assemblyStart&&t.breakStart&&t.assemblyStart<t.breakEnd&&t.assemblyEnd>t.breakStart)throw Error('Assembly and lunch break cannot overlap.');
 for(const d of days){const h=t.hours[d];if(h?.open===true&&(!validTime(h.start)||!validTime(h.end)||h.start>=h.end||(t.breakStart&&(t.breakStart<h.start||t.breakEnd>h.end))||(t.assemblyStart&&(t.assemblyStart<h.start||t.assemblyEnd>h.end))))throw Error(d+': school hours must contain the lunch break.')}
 return t;
}
const seasonKeys={winter:'schoolTiming',summer:'summerTiming'};
const vacationKeys={summerVacation:'Summer vacations',winterVacation:'Winter vacations'};
const calendarColors={winter:'#38bdf8',summer:'#4ade80',summerVacation:'#fbbf24',winterVacation:'#a78bfa',holiday:'#fb7185',event:'#60a5fa'};
const calendarLabels={winter:'Winter timings',summer:'Summer timings',summerVacation:'Summer vacations',winterVacation:'Winter vacations',holiday:'Weekly / public holiday',event:'Exams / events'};
function sessionRecord(sid=activeSession()){return sessions().find(x=>String(x.id)===String(sid))}
function schoolTiming(sid=activeSession(),season='winter'){
 const t=sessionRecord(sid)?.[seasonKeys[season]];
 try{return validateTiming(t)}catch(_){return null}
}
function vacationsFor(sid=activeSession()){
 const v=sessionRecord(sid)?.vacations||{};
 return Object.fromEntries(Object.keys(vacationKeys).filter(k=>validDate(v[k]?.from)&&validDate(v[k]?.to)&&v[k].from<=v[k].to).map(k=>[k,v[k]]));
}
function formatTime(v){const [h,m]=v.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM')}
function formatDate(v){return new Date(v+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}
function timingSummary(t,season='winter'){
 if(!t)return null;
 const groups=new Map();
 for(const d of days){const h=t.hours[d],policy=LamaSchoolWeek.read(schoolWeekResources),closed=policy?policy.weeklyOff.includes(LamaSchoolWeek.names.indexOf(d)):h?.open!==true,key=closed?'Closed / weekly holiday':h?.open===true?formatTime(h.start)+' – '+formatTime(h.end):'Working day — hours not configured';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(d)}
 return {title:(season==='summer'?'Summer':'Winter')+' School Timings',dates:formatDate(t.from)+' – '+formatDate(t.to),lines:[...groups].map(([hours,ds])=>ds.join(', ')+': '+hours),assemblyTime:t.assemblyStart?'Morning assembly: '+formatTime(t.assemblyStart)+' – '+formatTime(t.assemblyEnd):'Morning assembly not configured',breakTime:t.breakStart?'Lunch break: '+formatTime(t.breakStart)+' – '+formatTime(t.breakEnd):'No lunch break configured'};
}
function scheduleSummaries(sid=activeSession()){
 const list=['winter','summer'].map(k=>timingSummary(schoolTiming(sid,k),k)).filter(Boolean);
 const v=vacationsFor(sid);
 for(const k of Object.keys(vacationKeys))if(v[k])list.push({title:vacationKeys[k],dates:formatDate(v[k].from)+' – '+formatDate(v[k].to),lines:[],breakTime:''});
 const session=sessionRecord(sid);if(session){try{for(const t of validateAcademicTerms(session.terms||[],session))list.push({title:t.name,dates:formatDate(t.from)+' – '+formatDate(t.to),lines:[],breakTime:''})}catch(_){}}
 return list;
}
function dateInside(date,t){return !!t&&t.from<=date&&date<=t.to}
function dateToday(){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));return parts.year+'-'+parts.month+'-'+parts.day}
function seasonForDate(date,sid=activeSession()){return ['winter','summer'].find(k=>dateInside(date,schoolTiming(sid,k)))||''}
function currentLessonIssue(p,season=''){const ss=sessionRecord(p.sessionId),t=LamaSchoolWeek.seasonTiming?.(ss,dateToday(),season)?.timing;return LamaSchoolWeek.lessonIssue?.(t,p,ss?.fridayClose)||''}
function assertLessonHours(p){const why=currentLessonIssue(p);if(why)throw Error(p.day+' '+p.grade+' P'+p.period+': '+why)}
function chosenSeason(){const picker=$('quickSeason');return picker?picker.value:seasonForDate(dateToday())}
function workingWeek(){const t=schoolTiming(activeSession(),chosenSeason());return LamaSchoolWeek.working(schoolWeekResources,t?days.filter(d=>t.hours[d]?.open===true):days.slice(0,6))}
function calendarDay(date,sid,events=[]){
 const season=seasonForDate(date,sid),t=season?schoolTiming(sid,season):null;
 const v=vacationsFor(sid),vacation=Object.keys(vacationKeys).find(k=>dateInside(date,v[k]));
 const weekday=days[(new Date(date+'T12:00:00Z').getUTCDay()+6)%7];
 const hits=events.filter(e=>e.start<=date&&date<=e.end);
 const publicHoliday=hits.some(e=>/holiday|vacation/i.test(e.type||''));
 const configured=LamaSchoolWeek.read(schoolWeekResources);const closed=configured?configured.weeklyOff.includes(new Date(date+'T12:00:00Z').getUTCDay()):t?t.hours[weekday]?.open!==true:weekday==='Sunday';
 const kind=vacation||(publicHoliday||closed?'holiday':hits.length?'event':season);
 return {kind,label:vacation?vacationKeys[vacation]:publicHoliday?'Holiday':closed?'Weekly holiday':hits.length?'School event':season?calendarLabels[season]:'',hits};
}
function overlap(a,b){return !!a&&!!b&&a.from<=b.to&&b.from<=a.to}
function validateSessionRange(t,p,label){
 if(t&&(t.from<p.start||t.to>p.end))throw Error(label+' dates must fall inside the selected academic session.');
}
function validateAcademicTerms(terms,session){
 if(!Array.isArray(terms)||terms.length>12)throw Error('Use at most 12 academic terms per session.');
 const names=new Set(), result=terms.map(t=>{
  const name=String(t.name||'').trim(),from=String(t.from||''),to=String(t.to||'');
  if(!name||name.length>80||names.has(name.toLowerCase()))throw Error('Each term needs a unique name (up to 80 characters).');
  names.add(name.toLowerCase());
  if(!validDate(from)||!validDate(to)||from>to||from<session.start||to>session.end)throw Error(name+': dates must be valid and inside the academic session.');
  return {name,from,to};
 }).sort((a,b)=>a.from.localeCompare(b.from));
 for(let i=1;i<result.length;i++)if(result[i].from<=result[i-1].to)throw Error('Academic terms must not overlap.');
 return result;
}
function renderAcademicTerms(sid,session){
 const box=$('termSettings'),summary=$('termSummary'),form=$('academicTermForm');
 if(!box)return;
 box.classList.toggle('hidden',!session||(!adminMode&&!session.terms?.length));
 form.classList.toggle('hidden',!adminMode||!verified||!session);
 summary.replaceChildren();
 if(!session)return;
 let terms=[];try{terms=validateAcademicTerms(session.terms||[],session)}catch(e){summary.textContent='Saved term configuration needs review: '+e.message;return}
 for(const t of terms){const p=document.createElement('p');p.className='text-sm';p.textContent=t.name+' · '+formatDate(t.from)+' – '+formatDate(t.to);summary.append(p)}
 if(!terms.length)summary.textContent='No academic terms published for this session.';
 if(form.dataset.session===sid)return;
 form.dataset.session=sid;
 $('termRows').replaceChildren();
 for(const t of terms)addAcademicTermRow(t);
 if(!terms.length)addAcademicTermRow({name:'Term 1'});
}
function addAcademicTermRow(t={}){
 const row=document.createElement('div');row.className='grid gap-2 border border-slate-700 rounded-xl p-2 my-2 md:grid-cols-4';
 for(const [label,key,type] of [['Term name','name','text'],['Start date','from','date'],['End date','to','date']]){
  const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type=type;input.dataset.termKey=key;input.value=t[key]||'';input.required=true;if(key==='name')input.maxLength=80;l.append(input);row.append(l)
 }
 const b=document.createElement('button');b.type='button';b.className='text-rose-300 p-2';b.textContent='Remove';b.onclick=()=>row.remove();row.append(b);$('termRows').append(row)
}
function setupAcademicTerms(section){
 const box=document.createElement('div');box.id='termSettings';box.className='mt-5 border-t border-slate-700 pt-4';
 box.innerHTML='<h3 class="font-bold text-cyan-200">Academic terms</h3><div id="termSummary" class="space-y-1 mt-2 text-sm"></div><form id="academicTermForm" class="hidden mt-4"><p class="text-xs text-slate-300">Set term names and dates for the selected academic session. Published terms are used in the homework register. Changing dates does not delete historical records.</p><div id="termRows"></div><div class="flex flex-wrap gap-2"><button type="button" id="addAcademicTerm" class="bg-slate-700 rounded-lg px-3 py-2">+ Add term</button><button id="saveAcademicTerms" type="submit" class="bg-cyan-600 rounded-lg px-3 py-2 font-bold">Publish academic terms</button></div><p id="termStatus" role="status" class="text-sm text-amber-200 mt-2"></p></form>';
 section.append(box);
 $('addAcademicTerm').onclick=()=>{if($('termRows').children.length<12)addAcademicTermRow();else $('termStatus').textContent='Maximum 12 terms.'};
 $('academicTermForm').onsubmit=async e=>{e.preventDefault();const form=$('academicTermForm'),note=$('termStatus'),sid=activeSession();if(form.dataset.session!==sid)return;
  const terms=[...$('termRows').children].map(row=>Object.fromEntries([...row.querySelectorAll('[data-term-key]')].map(input=>[input.dataset.termKey,input.value])));
  await updateSessionSettings(note,p=>{const clean=validateAcademicTerms(terms,p);if((p.terms||[]).some(t=>!clean.some(x=>x.name===t.name&&x.from===t.from&&x.to===t.to))&&!confirm('Update the published term dates? Existing homework and examination records will not be deleted.'))return null;return {...p,terms:clean}});
 };
}

function setupTiming(){
 const section=document.createElement('section');section.id='schoolTimings';section.className='no-print hidden bg-slate-900 rounded-2xl p-4 border border-slate-700 mb-5';
 section.innerHTML='<h2 class="text-lg font-bold text-cyan-200">Seasonal school timings &amp; vacations</h2><div id="schoolTimingSummary" class="mt-2 text-sm grid gap-3 md:grid-cols-2"></div><details id="timingAdmin" class="hidden mt-4"><summary class="cursor-pointer text-cyan-300 font-bold">Configure seasonal school timings</summary><form id="timingForm" class="mt-3"><p class="text-xs text-slate-300">Applies only to the selected school and academic session. Save each season separately. Blank summer timings are not published.</p><label>Season<select id="timingSeason"><option value="winter">Winter school timings</option><option value="summer">Summer school timings</option></select></label><div class="grid grid-cols-2 gap-3"><label>Effective from<input id="timingFrom" type="date" required></label><label>Effective to<input id="timingTo" type="date" required></label><label>Morning assembly starts (optional)<input id="timingAssemblyStart" type="time"></label><label>Morning assembly ends (optional)<input id="timingAssemblyEnd" type="time"></label><label>Lunch break starts (optional)<input id="timingBreakStart" type="time"></label><label>Lunch break ends (optional)<input id="timingBreakEnd" type="time"></label></div><div class="mt-3 space-y-1">'+days.map((d,i)=>'<div class="grid grid-cols-3 gap-2 items-center"><label class="flex items-center gap-1"><input type="checkbox" class="w-auto" id="timingOpen'+i+'"> '+d+'</label><input type="time" id="timingStart'+i+'" aria-label="'+d+' school opens"><input type="time" id="timingEnd'+i+'" aria-label="'+d+' school closes"></div>').join('')+'</div><button id="saveTiming" class="mt-3 bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl" type="submit">Save and publish timings</button> <button id="removeTiming" type="button" class="mt-3 text-rose-300 border border-rose-800 rounded-xl px-3 py-2">Clear published season</button><p id="timingStatus" role="status" class="mt-2 text-sm text-amber-200"></p></form></details><details id="vacationAdmin" class="hidden mt-4"><summary class="cursor-pointer text-cyan-300 font-bold">Configure summer &amp; winter vacations</summary><form id="vacationForm" class="mt-3"><p class="text-xs text-slate-300">Leave both dates empty if a vacation is not configured. Dates are inclusive.</p>'+Object.entries(vacationKeys).map(([k,label])=>'<fieldset class="mt-3 border border-slate-600 rounded-lg p-3"><legend>'+label+'</legend><div class="grid grid-cols-2 gap-3"><label>From<input type="date" id="'+k+'From"></label><label>To<input type="date" id="'+k+'To"></label></div></fieldset>').join('')+'<button id="saveVacations" type="submit" class="mt-3 bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl">Save and publish vacations</button><p id="vacationStatus" class="mt-2 text-sm text-amber-200" role="status"></p></form></details>';
 $('status').after(section);
 const fridayBox=document.createElement('div');fridayBox.id='fridayDismissalSettings';fridayBox.className='border border-cyan-700 rounded-xl p-3 mb-4';
 fridayBox.innerHTML='<h3 class="font-bold text-cyan-200">Friday closing time</h3><p class="text-xs text-slate-300 mb-2">Saved for this school and academic session. Applies to student, teacher, admin and printed timetables even before complete seasonal hours are published.</p><div id="fridayClosePublished" class="text-sm text-amber-200 mb-2"></div><div id="fridayCloseAdmin" class="flex flex-wrap gap-2 items-end"><label class="text-xs">Friday closes<input type="time" id="fridayCloseInput" value="12:30" class="block rounded-lg bg-slate-950 text-white px-3 py-2 mt-1"></label><button type="button" id="fridayCloseSave" class="bg-cyan-600 text-white font-bold rounded-lg px-4 py-2">Save Friday closing</button></div><p id="fridayCloseStatus" class="text-xs mt-2" role="status"></p>';
 section.prepend(fridayBox);$('fridayCloseSave').onclick=()=>void saveFridayClosing();
 setupAcademicTerms(section);
 const legend=document.createElement('div');legend.id='calendarLegend';legend.className='flex flex-wrap gap-2 mb-3 text-xs';legend.innerHTML=calendarLegendMarkup();$('monthGrid').before(legend);
 const quickSeason=document.createElement('label');quickSeason.innerHTML='Working week for seasonal hours<select id="quickSeason"><option value="">Default school week</option></select><small>Changes working days for full-week saving only; saved subjects and periods remain unchanged.</small>';
 $('quickDay').closest('label').parentElement.append(quickSeason);
 $('quickSeason').onchange=()=>{if($('quickApplyScope'))updateQuickScope()};
 for(let i=0;i<days.length;i++)$('timingOpen'+i).onchange=()=>toggleTimingDay(i);
 $('timingSeason').onchange=()=>{timingFormSession='';renderTiming()};
 $('timingForm').onsubmit=e=>{e.preventDefault();void saveTiming(false)};
 $('removeTiming').onclick=()=>{void saveTiming(true)};
 $('vacationForm').onsubmit=e=>{e.preventDefault();void saveVacations()};
}
function calendarLegendMarkup(){return Object.keys(calendarColors).map(k=>'<span class="calendar-key" style="display:inline-block;border-left:5px solid '+calendarColors[k]+';padding:2px 6px;margin:2px 4px">'+esc(calendarLabels[k])+'</span>').join('')}
function toggleTimingDay(i){const on=$('timingOpen'+i).checked;for(const k of ['timingStart','timingEnd']){$(k+i).disabled=!on;$(k+i).required=on}}
async function saveFridayClosing(){
 const note=$('fridayCloseStatus'),value=$('fridayCloseInput').value;
 if(!validTime(value)){note.textContent='Choose a valid Friday closing time.';return}
 const button=$('fridayCloseSave');button.disabled=true;
 try{await updateSessionSettings(note,p=>{
  if(!p.start||!p.end)throw Error('Select a valid academic session.');
  if(p.fridayClose===value){note.textContent='Friday closing is already published.';return null}
  return {...p,fridayClose:value};
 });}finally{button.disabled=false}
}
function renderTiming(){
 const sid=activeSession(),ss=sessionRecord(sid),summaries=scheduleSummaries(sid),section=$('schoolTimings');
 section.classList.toggle('hidden',!sid||(!adminMode&&!summaries.length&&!ss?.terms?.length));
 $('fridayDismissalSettings').classList.toggle('hidden',!sid);
 $('fridayCloseAdmin').classList.toggle('hidden',!adminMode||!verified||!ss);
 $('fridayClosePublished').textContent=validTime(ss?.fridayClose)?'✓ Published Friday dismissal: '+formatTime(ss.fridayClose):'Friday dismissal is not yet saved. Tap Save Friday closing to enforce 12:30 PM for this session.';
 if(adminMode&&validTime(ss?.fridayClose))$('fridayCloseInput').value=ss.fridayClose;
 renderAcademicTerms(sid,ss);
 $('schoolTimingSummary').innerHTML=summaries.length?summaries.map(t=>'<div class="border border-slate-600 rounded-xl p-3"><strong>'+esc(t.title)+'</strong><p>'+esc(t.dates)+'</p>'+t.lines.map(l=>'<p>'+esc(l)+'</p>').join('')+(t.assemblyTime?'<p class="text-amber-200 font-medium">'+esc(t.assemblyTime)+'</p>':'')+(t.breakTime?'<p class="text-amber-200 font-medium">'+esc(t.breakTime)+'</p>':'')+'</div>').join(''):'<p>No seasonal timings or vacations published for this session.</p>';
 for(const id of ['timingAdmin','vacationAdmin'])$(id).classList.toggle('hidden',!adminMode||!verified||!ss);
 const picker=$('quickSeason'),previous=picker.value;
 picker.replaceChildren(new Option('Default school week',''));
 for(const k of ['winter','summer'])if(schoolTiming(sid,k))picker.add(new Option(k==='winter'?'Winter':'Summer',k));
 const preferred=picker.dataset.session===sid&&[...picker.options].some(o=>o.value===previous)?previous:seasonForDate(dateToday(),sid)||(schoolTiming(sid,'winter')?'winter':schoolTiming(sid,'summer')?'summer':'');
 picker.value=preferred;picker.dataset.session=sid;
 if(!adminMode||!ss)return;
 const season=field('timingSeason'),formKey=sid+'|'+season;
 if(timingFormSession!==formKey){
  timingFormSession=formKey;
  const year=Number(String(ss.start||'').slice(0,4))||new Date().getFullYear();
  const example=season==='winter'?{from:year+'-10-16',to:(year+1)+'-03-31',breakStart:'12:15',breakEnd:'12:30',hours:Object.fromEntries(days.map((d,i)=>[d,{open:i<5,start:'08:45',end:i===4?'12:30':'13:30'}]))}:{from:'',to:'',breakStart:'',breakEnd:'',hours:Object.fromEntries(days.map((d,i)=>[d,{open:i<5,start:'',end:''}]))};
  const v=schoolTiming(sid,season)||example;
  for(const [id,k] of Object.entries({timingFrom:'from',timingTo:'to',timingBreakStart:'breakStart',timingBreakEnd:'breakEnd',timingAssemblyStart:'assemblyStart',timingAssemblyEnd:'assemblyEnd'}))$(id).value=v[k]||'';
  for(let i=0;i<days.length;i++){const h=v.hours[days[i]]||{};$('timingOpen'+i).checked=h.open===true;$('timingStart'+i).value=h.start||'';$('timingEnd'+i).value=h.end||'';toggleTimingDay(i)}
  $('timingStatus').textContent='';
 }
 const form=$('vacationForm');
 if(form.dataset.session!==sid){
  form.dataset.session=sid;const v=vacationsFor(sid);
  for(const k of Object.keys(vacationKeys)){ $(k+'From').value=v[k]?.from||'';$(k+'To').value=v[k]?.to||'' }
  $('vacationStatus').textContent='';
 }
}
async function updateSessionSettings(note,apply){
 if(timingBusy||quickBusy||sessionBusy||periodNeedsRefresh){note.textContent='Finish the current operation or refresh before saving.';return}
 let attempted=false;const sid=activeSession();
 try{
  authorized();if(!sid)throw Error('Select the correct academic session.');
  timingBusy=true;for(const id of ['saveTiming','removeTiming','saveVacations','saveAcademicTerms'])$(id).disabled=true;
  const latest=await LamaAPI.list('resources');if(!Array.isArray(latest))throw Error('Could not verify the selected session.');
  const prev=latest.find(r=>r.category===type.session&&String(r.id)===String(sid));if(!prev)throw Error('Session no longer exists. Refresh before saving.');
  if(activeSession()!==sid)throw Error('Academic session changed; reopen settings.');
  const p=parsed(prev),next=apply(p);if(!next)return;
  const record={category:type.session,title:prev.title,description:JSON.stringify(next),link:prev.link||''};
  attempted=true;const saved=await LamaAPI.update('resources',sid,record);
  if(!saved?.id||String(saved.id)!==String(sid)||JSON.stringify(parsed(saved))!==JSON.stringify(next))throw Error('Server did not confirm the published settings.');
  const i=rows.findIndex(r=>String(r.id)===String(sid));if(i>=0)rows[i]=saved;else rows.push(saved);
  timingFormSession='';$('vacationForm').dataset.session='';$('academicTermForm').dataset.session='';render();if($('quickApplyScope'))updateQuickScope();
  note.textContent='✓ Settings saved and published.';status('Seasonal school settings saved.');
 }catch(err){if(attempted){periodNeedsRefresh=true;note.textContent='Save uncertain. Refresh before retrying. '+err.message}else note.textContent=err.message}
 finally{timingBusy=false;for(const id of ['saveTiming','removeTiming','saveVacations','saveAcademicTerms'])$(id).disabled=false}
}
async function saveTiming(clear){
 const note=$('timingStatus'),sid=activeSession(),season=field('timingSeason'),key=seasonKeys[season];
 if(!key||timingFormSession!==sid+'|'+season){note.textContent='Select the correct academic session and season.';return}
 let t;
 try{if(!clear)t=validateTiming({from:field('timingFrom'),to:field('timingTo'),breakStart:field('timingBreakStart'),breakEnd:field('timingBreakEnd'),assemblyStart:field('timingAssemblyStart'),assemblyEnd:field('timingAssemblyEnd'),hours:Object.fromEntries(days.map((d,i)=>[d,{open:$('timingOpen'+i).checked,start:field('timingStart'+i),end:field('timingEnd'+i)}]))})}catch(e){note.textContent=e.message;return}
 await updateSessionSettings(note,p=>{
  if(clear){if(!p[key])throw Error('No published season to clear.');if(!confirm('Clear the published '+season+' timings? Saved lessons and vacations remain unchanged.'))return null;const next={...p};delete next[key];return next}
  validateSessionRange(t,p,season);
  if(overlap(t,p[seasonKeys[season==='winter'?'summer':'winter']]))throw Error('Summer and winter timing date ranges must not overlap.');
  return {...p,[key]:t};
 });
}
async function saveVacations(){
 const note=$('vacationStatus'),sid=activeSession();if($('vacationForm').dataset.session!==sid){note.textContent='Select the correct academic session.';return}
 const v={};
 try{for(const k of Object.keys(vacationKeys)){const from=field(k+'From'),to=field(k+'To');if(!from&&!to)continue;if(!validDate(from)||!validDate(to)||from>to)throw Error(vacationKeys[k]+': select a valid start and end date.');v[k]={from,to}}if(overlap(v.summerVacation,v.winterVacation))throw Error('Summer and winter vacations must not overlap.')}catch(e){note.textContent=e.message;return}
 await updateSessionSettings(note,p=>{
  for(const k of Object.keys(v))validateSessionRange(v[k],p,vacationKeys[k]);
  if(Object.keys(p.vacations||{}).some(k=>!v[k])&&!confirm('Remove cleared vacation dates from the calendar?'))return null;
  return {...p,vacations:v};
 });
}
function quickScopeDays(){
 const mode=field('quickApplyScope');
 return mode==='week'?workingWeek():mode==='custom'?workingWeek().filter(d=>quickCustomDays.includes(d)):[field('quickTargetDay')].filter(d=>workingWeek().includes(d));
}
function updateQuickScope(){
 const mode=field('quickApplyScope'),selected=quickScopeDays(),source=field('quickPeriodDay'),target=field('quickTargetDay');
 const weekOption=$('quickApplyScope').querySelector('option[value="week"]');
 if(weekOption)weekOption.textContent=(schoolTiming(activeSession(),chosenSeason())?'Configured school week':'Full school week')+' ('+workingWeek().map(d=>d.slice(0,3)).join(', ')+')';
 const anotherDay=mode==='day'&&target!==source;
 const canMove=anotherDay&&!!field('quickPeriodId');
 $('quickTargetDay').disabled=mode!=='day';
 $('quickDayActionWrap').classList.toggle('hidden',!canMove);
 if(!canMove)$('quickDayAction').value='copy';
 $('quickCustomDays').classList.toggle('hidden',mode!=='custom');
 const moving=canMove&&field('quickDayAction')==='move';
 $('quickScopeSummary').textContent=selected.length?'Applies to '+selected.join(', ')+'. '+(moving?'Move the original lesson from '+source+'; the destination must be empty.':anotherDay?'The original '+source+' lesson is kept.':'Existing different lessons on other days require confirmation.'):'Select at least one day.';
 $('quickSave').textContent=moving?'✓ Move to '+target:selected.length>1?'✓ Save for '+selected.length+' days':anotherDay?'✓ Save to '+target:'✓ Save class period';
}

let classDraftDirty=false,classDraftKey='',classDraftRows=[],classDraftBusy=false;

let lastConflictAttempt=null, savedConflictPairs=[];
function conflictClass(p){return LamaTimetableGrid.classKey(LamaTimetableGrid.classLabel(p))}
function coverageTeacher(p){return multiClassMode(p.sessionId)&&p.supportKind==='teacher'&&!!p.supportId&&String(p.supportId)!==String(p.teacherId)}
function conflictStaff(p){
 const out=[];if(p.teacherId&&!coverageTeacher(p))out.push({key:'teacher:'+p.teacherId,name:p.teacherName||'Unnamed teacher'});
 if(p.supportId&&p.supportKind)out.push({key:p.supportKind+':'+p.supportId,name:p.supportName||'Unnamed additional staff'});
 return out;
}
function multiClassMode(sid){return sessionRecord(sid)?.teacherSchedulingMode==='multi-class'}
function findTimetableConflicts(records,onlyProposed=false){
 const result=[],groups=new Map();
 for(const p of records){const key=JSON.stringify([String(p.sessionId),p.day]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p)}
 for(const group of groups.values())for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
  let a=group[i],b=group[j];if(onlyProposed&&!a.proposed&&!b.proposed)continue;
  if(a.id&&b.id&&String(a.id)===String(b.id))continue;
  if(!a.proposed&&b.proposed)[a,b]=[b,a];
  const classMatch=conflictClass(a)===conflictClass(b),slot=classMatch&&Number(a.period)===Number(b.period);
  const overlap=validTime(a.start)&&validTime(a.end)&&a.start<a.end&&validTime(b.start)&&validTime(b.end)&&b.start<b.end&&a.start<b.end&&b.start<a.end;
  const shared=overlap?conflictStaff(a).filter(x=>conflictStaff(b).some(y=>x.key===y.key)):[];
  const reasons=[];if(slot)reasons.push('Duplicate class period');if(overlap&&classMatch)reasons.push('Class time overlap');const multi=multiClassMode(a.sessionId)&&!classMatch,blocking=shared.filter(x=>!multi||!x.key.startsWith('teacher:')),advisory=shared.filter(x=>multi&&x.key.startsWith('teacher:'));if(blocking.length)reasons.push('Staff booked twice: '+blocking.map(x=>x.name).join(', '));const warningOnly=!reasons.length&&advisory.length>0;if(advisory.length)reasons.push('Multi-class teaching: '+advisory.map(x=>x.name).join(', '));
  if(reasons.length)result.push({a,b,reasons,warningOnly,overlap:overlap?{start:a.start>b.start?a.start:b.start,end:a.end<b.end?a.end:b.end}:null});
 }
 return result.sort((x,y)=>days.indexOf(x.a.day)-days.indexOf(y.a.day)||String(x.a.start).localeCompare(String(y.a.start))||Number(x.a.period)-Number(y.a.period));
}
function checkProposedConflicts(existing,jobs,sourceDay=null){
 const ids=new Set(jobs.map(j=>String(j.id||'')).filter(Boolean));
 return findTimetableConflicts([...existing.filter(x=>!ids.has(String(x.id))),...jobs.map(j=>({...j.payload,id:j.id||'',proposed:true,sourceDay}))],true);
}
function conflictDescription(p){return LamaTimetableGrid.classLabel(p)+' · '+p.day+' · P'+p.period+' · '+(p.start||'—')+'–'+(p.end||'—')}
function jumpConflictLesson(p){
 if(!adminMode||!verified||quickBusy||timingBusy||sessionBusy)return;
 const cls=LamaTimetableGrid.classLabel(p),day=p.sourceDay||p.day;
 if(p.proposed&&p.sourceDay===null){if($('quickEditor')&&!$('quickEditor').classList.contains('hidden'))$('quickEditor').scrollIntoView({behavior:'smooth',block:'center'});else $('periodForm').scrollIntoView({behavior:'smooth',block:'center'});return}
 let row=classDraftRows.find(r=>conflictClass({grade:LamaTimetableGrid.splitLabel(r.classLabel).grade,section:LamaTimetableGrid.splitLabel(r.classLabel).section})===conflictClass(p)&&r.i===Number(p.period)&&field('cbDay')===day&&activeSession()===p.sessionId);
 if(!row){
  if(!workingWeek().includes(day)){status(day+' is a weekly holiday. Review the existing saved record in the weekly list.');return}
  if(classDraftDirty&&!confirm('Opening another class or day will discard unsaved lesson edits. Continue?'))return;
  if(activeSession()!==p.sessionId){status('Switch to the indicated academic session first.');return}
  const match=visibleClasses().find(c=>LamaTimetableGrid.classKey(c)===LamaTimetableGrid.classKey(cls));
  if(!match)return status('Class not available in builder. Review the saved timetable.');
  classDraftDirty=false;$('cbClass').value=match;$('cbDay').value=day;renderClassBuilder(true);
  row=classDraftRows.find(r=>r.i===Number(p.period)&&LamaTimetableGrid.classKey(r.classLabel)===LamaTimetableGrid.classKey(cls));
 }
 if(row?.duplicate){const target=[...row.duplicateBox.querySelectorAll('[data-duplicate-id]')].find(e=>e.dataset.duplicateId===String(p.id))||row.duplicateBox;target.classList.add('conflict-focus');target.scrollIntoView({behavior:'smooth',block:'center'});return}
 if(row){for(const old of document.querySelectorAll('.conflict-focus'))old.classList.remove('conflict-focus');row.card.classList.add('conflict-focus');row.card.scrollIntoView({behavior:'smooth',block:'center'});row.subject.focus({preventScroll:true})}
 else status('Open the detailed period editor to review this lesson.');
}
function renderConflictReport(){
 const panel=$('timetableConflicts');if(!panel||!adminMode||!verified)return;
 const sid=activeSession(),allPeriods=timetableForSession().filter(p=>workingWeek().includes(p.day)),outside=allPeriods.filter(p=>currentLessonIssue(p,chosenSeason())),periods=allPeriods.filter(p=>!currentLessonIssue(p,chosenSeason()));
 savedConflictPairs=findTimetableConflicts(periods);const hard=savedConflictPairs.filter(c=>!c.warningOnly),advisories=savedConflictPairs.filter(c=>c.warningOnly);
 const attempt=lastConflictAttempt?.sid===sid?lastConflictAttempt:null;
 panel.hidden=false;panel.replaceChildren();
 const node=(tag,value,cls)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;if(cls)n.className=cls;return n};
 const heading=node('h3','Timetable conflict report','text-lg font-bold');panel.append(heading);
 const summary=node('p',(multiClassMode(sid)?'Multi-class teaching mode':'Strict scheduling mode')+' · '+hard.length+' blocking conflict pair(s) · '+advisories.length+' multi-class advisory pair(s) across '+periods.length+' saved working-day lessons.','text-sm mt-1');panel.append(summary);if(outside.length){const details=node('details',undefined,'mt-3 text-amber-200');details.append(node('summary',outside.length+' saved lessons outside seasonal school hours — excluded from published views; review and correct'));for(const p of outside){const line=node('p',conflictDescription(p)+' · '+p.subject+' · '+currentLessonIssue(p,chosenSeason()),'text-sm mt-2');const editButton=node('button',' Edit lesson','conflict-jump');editButton.type='button';editButton.onclick=()=>jumpConflictLesson(p);line.append(editButton);const del=node('button',' Delete saved period','conflict-jump');del.type='button';del.classList.add('text-rose-300');del.onclick=()=>void remove('period',p.id).catch(e=>status('Delete failed: '+e.message));line.append(del);details.append(line)}panel.append(details)}
 const ids=new Set(),warningIds=new Set();for(const pair of [...savedConflictPairs,...(attempt?.pairs||[])])for(const p of [pair.a,pair.b])if(p.id)(pair.warningOnly?warningIds:ids).add(String(p.id));
 for(const tr of $('periodRows').querySelectorAll('tr[data-lesson-id]')){tr.classList.toggle('conflict-saved-row',ids.has(tr.dataset.lessonId));tr.classList.toggle('conflict-advisory-row',!ids.has(tr.dataset.lessonId)&&warningIds.has(tr.dataset.lessonId))}
 const list=(title,pairs)=>{if(!pairs.length)return;panel.append(node('h4',title+' ('+pairs.length+')','font-bold text-rose-200 mt-4'));for(const c of pairs){
  const card=node('article',undefined,'conflict-pair'+(c.warningOnly?' conflict-advisory':''));card.append(node('p',c.reasons.join(' · '),c.warningOnly?'font-bold text-amber-200':'font-bold text-rose-200'),node('p',c.overlap?'Overlapping time: '+c.overlap.start+'–'+c.overlap.end:'Same class and period number, even though times differ.','text-sm text-amber-200'));
  for(const p of [c.a,c.b]){const line=node('div',undefined,'conflict-lesson');line.append(node('strong',conflictDescription(p)),node('p',(p.subject||'No subject')+' · '+(p.teacherName||'Unassigned')+(coverageTeacher(p)?' (original / covered)':'')+(p.supportName?' · '+(coverageTeacher(p)?'Cover teacher: ':'Additional staff: ')+p.supportName+(p.supportRole?' ('+p.supportRole+')':''):''),'text-sm'),node('p',p.proposed?'Proposed lesson'+(p.sourceDay&&p.sourceDay!==p.day?' (copied from '+p.sourceDay+')':''):'Saved lesson','text-xs text-slate-300'));const b=node('button',p.proposed?'Go to proposed lesson':'Go to saved lesson','conflict-jump');b.type='button';b.onclick=()=>jumpConflictLesson(p);line.append(b);card.append(line)}
  panel.append(card);
 }};
 if(attempt){panel.append(node('p',attempt.pairs.some(c=>!c.warningOnly)?'Last save blocked — no changes submitted. Correct the blocking conflicts before saving.':'Review the intended multi-class assignments before saving.','font-bold text-amber-200 mt-2'));list('Blocking conflicts in last save attempt',attempt.pairs.filter(c=>!c.warningOnly));list('Multi-class advisories in last save attempt',attempt.pairs.filter(c=>c.warningOnly))}
 list('Blocking conflicts already in saved timetable',hard);list('Allowed multi-class assignments — review as needed',advisories);
 if(!attempt&&!savedConflictPairs.length)panel.append(node('p','✓ No overlapping class or staff assignments found in the saved working-day timetable.','text-emerald-300 text-sm mt-2'));
 if($('cbConflictLink')){$('cbConflictLink').textContent=attempt?'Review '+attempt.pairs.length+' scheduling notice(s)':savedConflictPairs.length?'Review '+savedConflictPairs.length+' saved scheduling notice(s)':'Check timetable conflicts';$('cbConflictLink').classList.toggle('conflict-link-warning',!!attempt||!!savedConflictPairs.length)}
}
function rejectTimetableConflicts(pairs,sid){
 if(!pairs.length)return;
 lastConflictAttempt={sid,pairs};renderConflictReport();$('timetableConflicts').scrollIntoView({behavior:'smooth',block:'start'});
 const blocking=pairs.filter(c=>!c.warningOnly);if(blocking.length)throw Error(blocking.length+' blocking timetable conflict pair(s). Review the conflict report above Weekly subject timetable. No changes saved.');
 if(!confirm(pairs.length+' multi-class teacher assignment pair(s) found. The school allows shared teaching. Confirm these assignments are intentional?'))throw Error('Save cancelled. Review the multi-class advisories; no changes saved.');
 lastConflictAttempt=null;renderConflictReport();
}


const pendingPeriodCounts=new Map();
const countKey=label=>LamaTimetableGrid.classKey(label);
function savedPeriodCount(session,label){
 const key=countKey(label),v=(Array.isArray(session?.classPeriodCounts)?session.classPeriodCounts:[]).find(x=>x.key===key)?.count;
 return Number.isInteger(v)&&v>=1&&v<=14?v:null;
}
function highestSavedPeriod(periods,label){
 return Math.max(0,...periods.filter(p=>countKey(LamaTimetableGrid.classLabel(p))===countKey(label)).map(p=>Number(p.period)||0));
}
function effectivePeriodCount(sid,label,periods=timetableForSession()){
 const pending=pendingPeriodCounts.get(sid)?.get(countKey(label)),saved=savedPeriodCount(sessionRecord(sid),label),highest=highestSavedPeriod(periods,label);
 return Math.min(14,Math.max(highest,pending??saved??(highest||8)));
}
function periodCountOptions(count){return Array.from({length:14},(_,i)=>new Option(String(i+1),String(i+1),false,i+1===count))}
function pendingCounts(sid){return pendingPeriodCounts.get(sid)||new Map()}
function countNotice(){
 const sid=activeSession(),n=pendingCounts(sid).size;
 $('cbCountSave').disabled=!n||classDraftBusy||quickBusy||timingBusy||sessionBusy||periodNeedsRefresh;
 $('cbCountSave').textContent=n?'Save period counts ('+n+' class'+(n===1?'':'es')+')':'Period counts saved / unchanged';
}
function changePeriodCount(label,value){
 if(classDraftBusy||quickBusy||timingBusy||sessionBusy)return;
 const sid=activeSession(),periods=timetableForSession(),n=Number(value),highest=highestSavedPeriod(periods,label);
 if(!Number.isInteger(n)||n<1||n>14||n<highest){$('cbStatus').textContent='Cannot reduce '+label+' below '+highest+' while saved lessons exist. Remove unwanted lessons explicitly first.';renderClassBuilder(true,true);return}
 if(classDraftRows.some(r=>countKey(r.classLabel)===countKey(label)&&r.i>n&&draftChanged(r))){$('cbStatus').textContent='Save or discard changes in the extra periods before reducing the count.';renderClassBuilder(true,true);return}
 const next=new Map(pendingCounts(sid)),k=countKey(label);
 if(savedPeriodCount(sessionRecord(sid),label)===n)next.delete(k);else next.set(k,n);
 if(next.size)pendingPeriodCounts.set(sid,next);else pendingPeriodCounts.delete(sid);
 renderClassBuilder(true,true);renderQuickGrid();$('cbStatus').textContent=label+' now shows '+n+' periods. Save period counts to retain this setting across devices.';
}
async function savePeriodCounts(){
 const sid=activeSession(),changes=new Map(pendingCounts(sid)),note=$('cbStatus');if(!changes.size||classDraftBusy||quickBusy||timingBusy||sessionBusy||periodNeedsRefresh)return;
 const periodRows=timetableForSession();
 for(const [key,n] of changes){if(periodRows.some(r=>countKey(LamaTimetableGrid.classLabel(r))===key&&Number(r.period)>n)){note.textContent='A saved lesson exceeds the requested count. Refresh and review.';return}}
 $('cbCountSave').disabled=true;
 await updateSessionSettings(note,p=>{
  const entries=new Map((Array.isArray(p.classPeriodCounts)?p.classPeriodCounts:[]).filter(x=>x&&typeof x.key==='string'&&Number.isInteger(x.count)&&x.count>=1&&x.count<=14).map(x=>[x.key,x.count]));
  for(const [key,n] of changes)entries.set(key,n);
  return {...p,classPeriodCounts:[...entries].map(([key,count])=>({key,count}))};
 });
 const saved=sessionRecord(sid);if([...changes].every(([key,count])=>saved?.classPeriodCounts?.some(x=>x.key===key&&x.count===count))){const next=new Map(pendingCounts(sid));for(const [key,val] of changes)if(next.get(key)===val)next.delete(key);if(next.size)pendingPeriodCounts.set(sid,next);else pendingPeriodCounts.delete(sid);note.textContent='✓ Class-specific period counts saved.';renderClassBuilder(true,true);renderQuickGrid();}countNotice();
}

function setupClassBuilder(){
 const box=document.createElement('section');box.id='classBuilder';box.className='no-print hidden bg-slate-900 rounded-2xl border border-slate-700 p-4 mb-5';
 box.innerHTML='<h2 class="text-xl font-black text-cyan-200">Easy class timetable builder</h2><p class="text-sm text-slate-300 mt-2">Choose one class or All classes. Edit any lesson or fill several empty periods together, then save once. Green = saved; amber = unsaved change. No need to delete an incorrect teacher or subject.</p><div class="grid grid-cols-2 gap-3 mt-3"><label>Academic session<select id="cbSession"></select></label><label>Class / section<select id="cbClass"></select></label><label>Weekday<select id="cbDay">'+days.map(d=>'<option>'+d+'</option>').join('')+'</select></label><label>Apply changes to<select id="cbScope"><option value="day">Selected day</option><option value="week">Changed periods to working week</option><option value="copyweek">Copy all filled periods to working week</option></select></label><label id="cbCountLabel">Number of periods for this class<select id="cbCount" aria-label="Number of periods for this class"></select></label><label>Default teacher<select id="cbTeacher"><option value="">Choose teacher</option></select></label></div><div id="teacherSchedulingSettings" class="border border-slate-700 rounded-xl p-3 mt-3"><label>Teacher scheduling policy (this academic session)<select id="cbSchedulingMode"><option value="strict">Strict — prevent simultaneous teacher assignments</option><option value="multi-class">Multi-class teaching — allow shared teachers</option></select></label><p class="text-xs text-slate-300 mt-2">Multi-class mode allows shared teachers after confirmation. When an additional teacher is selected, that teacher covers the period; the original teacher remains listed but is not booked for it. Caregivers do not replace teachers. Same-class and non-teaching staff conflicts remain blocked.</p><button type="button" id="cbSchedulingSave" class="bg-cyan-700 rounded-lg px-3 py-2 mt-2">Save scheduling policy</button><p id="cbSchedulingStatus" role="status" class="text-sm mt-2"></p></div><div class="flex flex-wrap gap-2 mt-3"><button type="button" id="cbConflictLink" class="bg-slate-700 rounded-xl px-3 py-2 font-bold">Check timetable conflicts</button><button type="button" id="cbCountSave" class="bg-cyan-700 rounded-xl px-3 py-2 font-bold">Save period counts</button><button type="button" id="cbFill" class="bg-slate-700 rounded-xl px-3 py-2">Fill empty teacher fields</button><button type="button" id="cbReset" class="bg-slate-700 rounded-xl px-3 py-2">Discard unsaved changes</button><button type="button" id="cbAdvanced" class="bg-slate-700 rounded-xl px-3 py-2">Show all-class grid</button><button type="button" id="cbSettings" class="bg-slate-700 rounded-xl px-3 py-2">Session &amp; calendar editors</button></div><p class="text-xs text-slate-400 mt-2">Times are suggested from existing school periods where available; review them. Changes to saved lessons retain their record IDs. Blank periods are left unchanged.</p><div id="cbRows" class="grid gap-2 mt-4"></div><div class="sticky bottom-2 mt-4 bg-slate-900 border border-cyan-700 rounded-xl p-3 shadow-lg"><button type="button" id="cbSave" class="bg-emerald-600 text-white rounded-xl px-4 py-3 font-bold w-full disabled:opacity-50">Save changes</button><p id="cbStatus" class="text-sm text-amber-200 mt-2" role="status"></p></div>';
 $('admin').before(box);$('cbSchedulingSave').onclick=async()=>{const sid=activeSession(),mode=field('cbSchedulingMode'),note=$('cbSchedulingStatus');if(!sid||classDraftBusy||quickBusy||timingBusy||sessionBusy||periodNeedsRefresh)return;if(!['strict','multi-class'].includes(mode))return;if(mode===(multiClassMode(sid)?'multi-class':'strict')){note.textContent='Policy already saved.';return}if(!confirm(mode==='multi-class'?'Allow teachers to teach multiple classes simultaneously for this academic session? Conflicts will still be listed as advisories.':'Enable strict scheduling? Existing simultaneous assignments will be reported as conflicts, not deleted.'))return;const button=$('cbSchedulingSave');button.disabled=true;lastConflictAttempt=null;try{await updateSessionSettings(note,p=>({...p,teacherSchedulingMode:mode}));}finally{button.disabled=false;$('cbSchedulingMode').value=multiClassMode(activeSession())?'multi-class':'strict';renderConflictReport();updateClassDraft()}};$('cbConflictLink').onclick=()=>{renderConflictReport();$('timetableConflicts').scrollIntoView({behavior:'smooth',block:'start'})};
 for(const id of ['cbSession','cbClass','cbDay'])$(id).onchange=()=>{
  if(classDraftBusy||quickBusy){renderClassBuilder(true);return}
  if(classDraftDirty&&!confirm('Discard unsaved timetable changes before switching?')){const [sid,cls,day,count]=JSON.parse(classDraftKey);$('cbSession').value=sid;$('cbClass').value=cls;$('cbDay').value=day;$('cbCount').value=count;return}
  classDraftDirty=false;
  if(id==='cbSession'){$('viewSession').value=$('cbSession').value;render()}else renderClassBuilder(true);
 };
 $('cbCount').onchange=()=>{if(field('cbClass')!=='__all__')changePeriodCount(field('cbClass'),field('cbCount'))};$('cbCountSave').onclick=()=>void savePeriodCounts();
 $('cbScope').onchange=updateClassDraft;
 $('cbReset').onclick=()=>{if(!classDraftDirty||confirm('Discard unsaved changes?')){classDraftDirty=false;renderClassBuilder(true)}};
 $('cbFill').onclick=()=>{const id=field('cbTeacher'),all=field('cbClass')==='__all__';if(!id&&!all)return $('cbStatus').textContent='Choose a default teacher first.';for(const r of classDraftRows)if(!r.teacher.value&&r.subject.value){r.teacher.value=all?r.defaultId:id}updateClassDraft()};
 $('cbAdvanced').onclick=()=>{if(classDraftBusy)return;if(classDraftDirty&&!confirm('Discard unsaved class timetable changes before opening the all-class grid?'))return;classDraftDirty=false;renderClassBuilder(true);const show=$('quickBuilder').classList.contains('class-grid-collapsed');$('quickBuilder').classList.toggle('class-grid-collapsed',!show);$('cbAdvanced').textContent=show?'Hide all-class grid':'Show all-class grid';if(show)$('quickBuilder').scrollIntoView({behavior:'smooth',block:'start'})};
 $('cbSettings').onclick=()=>{const show=$('admin').classList.contains('class-grid-collapsed');$('admin').classList.toggle('class-grid-collapsed',!show);$('cbSettings').textContent=show?'Hide session & calendar editors':'Session & calendar editors';if(show)$('admin').scrollIntoView({behavior:'smooth',block:'start'})};$('cbSave').onclick=()=>void saveClassDraft();
 window.addEventListener('beforeunload',e=>{if(classDraftDirty||pendingPeriodCounts.size){e.preventDefault();e.returnValue=''}});
 $('quickBuilder').classList.add('class-grid-collapsed');$('admin').classList.add('class-grid-collapsed');
}

function duplicateSlot(record,lesson){
 if(record.category!==type.period)return false;
 const p=parsed(record);
 return String(p.sessionId)===String(lesson.sessionId)&&p.day===lesson.day&&Number(p.period)===Number(lesson.period)&&conflictClass(p)===conflictClass(lesson);
}
function duplicateSnapshot(records){
 return JSON.stringify(records.map(r=>[String(r.id),String(r.description||'')]).sort((a,b)=>a[0].localeCompare(b[0])));
}
function duplicateDetails(p){
 return (p.subject||'No subject')+' | '+(p.teacherName||'Unassigned teacher')+(p.supportName?' + '+p.supportName+' ('+(p.supportRole||'Additional staff')+')':'')+' | '+p.start+'–'+p.end+(p.room?' | Room '+p.room:'')+(p.published===false?' | Draft':' | Published');
}
async function removeDuplicateEntry(row,lesson){
 const note=$('cbStatus');if(quickBusy||classDraftBusy||timingBusy||sessionBusy||periodNeedsRefresh)return;
 const snapshot=rows.filter(r=>duplicateSlot(r,lesson)),id=String(lesson.id);
 if(snapshot.length<2||!snapshot.some(r=>String(r.id)===id)){note.textContent='Duplicate records changed. Refresh before editing.';return}
 if(!confirm('Remove ONLY this unwanted duplicate?\n'+conflictDescription(lesson)+'\n'+duplicateDetails(lesson)+'\nRecord: '+id+'\n\nOther saved lessons will remain. You can edit the remaining lesson afterwards.'))return;
 let attempted=false;
 quickBusy=true;classDraftBusy=true;
 const controls=[...$('classBuilder').querySelectorAll('input,select,button')],states=controls.map(e=>e.disabled);controls.forEach(e=>e.disabled=true);
 note.textContent='Verifying the duplicate before removing it…';
 try{
  authorized();
  const fresh=await LamaAPI.list('resources');if(!Array.isArray(fresh))throw Error('Could not verify saved lessons.');
  const current=fresh.filter(r=>duplicateSlot(r,lesson));
  if(current.length<2||duplicateSnapshot(current)!==duplicateSnapshot(snapshot))throw Error('The duplicate records changed elsewhere. Refresh and review them before deleting.');
  attempted=true;await LamaAPI.remove('resources',id);
  const verifiedRows=await LamaAPI.list('resources');if(!Array.isArray(verifiedRows)||verifiedRows.some(r=>String(r.id)===id))throw Error('Removal not confirmed.');
  const remaining=verifiedRows.filter(r=>duplicateSlot(r,lesson));
  if(duplicateSnapshot(remaining)!==duplicateSnapshot(snapshot.filter(r=>String(r.id)!==id)))throw Error('Other lessons in this slot changed. Refresh and verify the remaining records.');
  rows=rows.filter(r=>String(r.id)!==id);lastConflictAttempt=null;
  render();renderClassBuilder(true,true);
  const currentRow=classDraftRows.find(r=>countKey(r.classLabel)===countKey(row.classLabel)&&r.i===row.i);
  note.textContent=remaining.length===1?'✓ Duplicate removed. You can now change the subject, teacher or time and save the remaining lesson.':'✓ One duplicate removed. Review the remaining '+remaining.length+' entries.';
  if(currentRow){currentRow.card.scrollIntoView({behavior:'smooth',block:'center'});if(!currentRow.duplicate)currentRow.subject.focus({preventScroll:true})}
 }catch(e){
  if(attempted||/changed elsewhere/.test(e.message))periodNeedsRefresh=true;
  note.textContent=(attempted?'Removal could not be fully verified. ': '')+e.message+(periodNeedsRefresh?' Refresh before retrying.':'');
 }finally{
  classDraftBusy=false;quickBusy=false;
  controls.forEach((e,i)=>e.disabled=states[i]);updateClassDraft();
 }
}
function showDuplicateEntries(row,hits){
 const box=document.createElement('div');box.className='duplicate-entry-list';row.duplicateBox=box;
 const add=(parent,tag,txt,cls)=>{const n=document.createElement(tag);n.textContent=txt;if(cls)n.className=cls;parent.append(n);return n};
 add(box,'p',hits.length+' saved records for this period. Compare them below. Remove only the unwanted record(s); then edit the remaining lesson normally.','font-bold text-amber-200');
 for(const [i,p] of hits.entries()){
  const item=document.createElement('div');item.className='duplicate-entry';item.dataset.duplicateId=String(p.id);box.append(item);
  add(item,'strong','Saved entry '+(i+1)+' — '+(p.subject||'No subject'));
  add(item,'p',duplicateDetails(p),'text-sm');
  add(item,'p','Record: '+String(p.id),'text-xs text-slate-400');
  const button=add(item,'button','Remove this duplicate','duplicate-remove');button.type='button';button.onclick=()=>void removeDuplicateEntry(row,p);
 }
 row.card.append(box);
}

function renderClassBuilder(force=false,preserve=false){
 if(!adminMode||!verified||!$('classBuilder'))return;
 $('classBuilder').classList.remove('hidden');
 $('cbSchedulingMode').value=multiClassMode(activeSession())?'multi-class':'strict';
 if(classDraftDirty&&!force)return;
 const sid=activeSession(),classes=visibleClasses(),old=$('cbClass').value,sessionList=sessions();
 const snapshots=preserve?new Map(classDraftRows.filter(r=>!r.duplicate&&draftChanged(r)).map(r=>[JSON.stringify([countKey(r.classLabel),r.i]),{subject:r.subject.value,teacher:r.teacher.value,support:r.support.value,start:r.start.value,end:r.end.value}])):new Map();
 $('cbSession').replaceChildren(...sessionList.map(s=>new Option(s.name+(s.active?' (active)':''),s.id)));$('cbSession').value=sid;
 $('cbClass').replaceChildren(new Option('All classes — edit together','__all__'),...classes.map(c=>new Option(c,c)));$('cbClass').value=old==='__all__'||classes.includes(old)?old:classes[0]||'';
 const day=workingWeek().includes(field('cbDay'))?field('cbDay'):workingWeek()[0];$('cbDay').value=day||'';const cls=field('cbClass'),num=cls==='__all__'?Math.max(1,...classes.map(c=>effectivePeriodCount(sid,c))):effectivePeriodCount(sid,cls);$('cbCount').replaceChildren(...periodCountOptions(num));$('cbCountLabel').classList.toggle('hidden',cls==='__all__');
 const previousClass=classDraftKey?JSON.parse(classDraftKey)[1]:'';classDraftKey=JSON.stringify([sid,cls,day,String(num)]);classDraftRows=[];const out=$('cbRows');out.replaceChildren();
 const periods=timetableForSession(),parts=LamaTimetableGrid.splitLabel(cls);
 const choices=teacherChoices('').sort((a,b)=>Number(LamaTimetableGrid.classKey(b.assignedClass)===LamaTimetableGrid.classKey(parts.grade))-Number(LamaTimetableGrid.classKey(a.assignedClass)===LamaTimetableGrid.classKey(parts.grade)));
 const teacherOptions=()=>[new Option('Choose teacher',''),...choices.map(t=>new Option(t.name+' · '+(t.assignedClass||'Unassigned'),t.id))];
 const prevTeacher=$('cbTeacher').value;$('cbTeacher').replaceChildren(...teacherOptions());if(previousClass===cls&&choices.some(t=>t.id===prevTeacher))$('cbTeacher').value=prevTeacher;else {const own=choices.filter(t=>LamaTimetableGrid.classKey(t.assignedClass)===LamaTimetableGrid.classKey(parts.grade)&&(!parts.section||!t.assignedSection||same(t.assignedSection,parts.section)));if(own.length===1)$('cbTeacher').value=own[0].id}
 if(!sid||!cls||!classes.length||!day){$('cbStatus').textContent='Configure an academic session and classes first.';$('cbSave').disabled=true;return}
 const create=(tag,txt)=>{const x=document.createElement(tag);if(txt!==undefined)x.textContent=txt;return x};
 for(const classLabel of (cls==='__all__'?classes:[cls])){
  const parts=LamaTimetableGrid.splitLabel(classLabel),key=LamaTimetableGrid.classKey(classLabel),matching=x=>LamaTimetableGrid.classKey(LamaTimetableGrid.classLabel(x))===key;
  const assigned=choices.filter(t=>LamaTimetableGrid.classKey(t.assignedClass)===LamaTimetableGrid.classKey(parts.grade)&&(!parts.section||String(t.assignedSection||'').toLowerCase()===String(parts.section).toLowerCase()));
  const defaultId=cls==='__all__'?(assigned.length===1?assigned[0].id:''):field('cbTeacher');
  const n=effectivePeriodCount(sid,classLabel),available=Array.from({length:n},(_,i)=>i+1).filter(i=>!slotOutsideHours(sid,day,i,periods)).length,heading=create('div');heading.className='font-black text-lg text-cyan-200 col-span-full mt-3 flex flex-wrap items-center gap-3';heading.append(create('h3',classLabel+' · '+available+' teaching periods'+(available<n?' ('+(n-available)+' beyond closing hidden)':'')));if(cls==='__all__'){const pick=create('select');pick.setAttribute('aria-label','Number of periods for '+classLabel);pick.replaceChildren(...periodCountOptions(n));pick.style.width='auto';pick.onchange=()=>changePeriodCount(classLabel,pick.value);heading.append(pick)}out.append(heading);
 for(let i=1;i<=n;i++){
  if(slotOutsideHours(sid,day,i,periods))continue;
  const hits=periods.filter(x=>x.day===day&&Number(x.period)===i&&matching(x)&&!currentLessonIssue(x,chosenSeason())),old=hits[0],times=LamaTimetableGrid.timesFor(periods,day,i),card=create('article');card.className='cb-period bg-slate-950/60 border rounded-xl p-3';
  const title=create('div','Period '+i);title.className='font-bold text-cyan-200';const tag=create('span',hits.length>1?'Duplicate — resolve here':old?'Saved · editable':'Empty');tag.className='text-xs text-slate-300 ml-2';title.append(tag);card.append(title);
  const grid=create('div');grid.className='grid grid-cols-2 gap-2';card.append(grid);
  const input=(label,type,value,options)=>{const l=create('label',label),x=create(type==='select'?'select':'input');if(type==='select')x.replaceChildren(...options);else x.type=type;x.value=value||'';l.append(x);grid.append(l);x.onchange=updateClassDraft;return x};
  const subjects=curriculumSubjects(parts.grade);if(old?.subject&&!subjects.includes(old.subject))subjects.push(old.subject);
  const subject=input('Subject','select',old?.subject,[new Option('Choose subject',''),...subjects.map(x=>new Option(x,x))]);
  const teacher=input(multiClassMode(sid)?'Original / primary teacher':'Teacher','select',old?.teacherId,teacherOptions());if(old?.teacherId&&!choices.some(t=>t.id===String(old.teacherId))){teacher.add(new Option((old.teacherName||'Saved teacher')+' (not active)',old.teacherId));teacher.value=old.teacherId}
  const extras=[...choices.map(t=>({...t,kind:'teacher',role:'Teacher'})),...supportStaff];const oldKey=old?.supportId?old.supportKind+':'+old.supportId:'';if(oldKey&&!extras.some(x=>x.kind+':'+x.id===oldKey))extras.push({id:old.supportId,kind:old.supportKind,name:old.supportName,role:old.supportRole});const support=input(multiClassMode(sid)?'Cover teacher / caregiver (optional)':'Additional staff (optional)','select',oldKey,[new Option(supportDirectoryReady?'None':'None — caregiver directory unavailable',''),...extras.map(x=>new Option(x.name+' · '+x.role,x.kind+':'+x.id))]);
  const start=input('Start time','time',old?.start||times.start),end=input('End time','time',old?.end||times.end);
  const coverageNote=create('p');coverageNote.className='text-xs text-cyan-200 mt-2';card.append(coverageNote);
  const row={i,classLabel,defaultId,old,duplicate:hits.length>1,card,tag,subject,teacher,support,extras,start,end,coverageNote};classDraftRows.push(row);
  const snap=snapshots.get(JSON.stringify([countKey(classLabel),i]));if(snap&&!row.duplicate){for(const key of ['subject','teacher','support','start','end'])row[key].value=snap[key]}
  if(row.duplicate){for(const e of [subject,teacher,support,start,end])e.disabled=true;showDuplicateEntries(row,hits)}
  subject.addEventListener('change',()=>{if(subject.value&&!teacher.value){const suggested=cls==='__all__'?defaultId:field('cbTeacher');if(suggested)teacher.value=suggested;}updateClassDraft()});out.append(card);
 }}
 updateClassDraft();$('cbStatus').textContent=teacherDirectoryLoaded?'Edit saved entries or fill empty periods.':'Teacher directory unavailable. Refresh before editing.';
}
function draftChanged(r){
 if(r.duplicate)return false;
 if(!r.old)return !!(r.subject.value||r.teacher.value||r.support.value);
 return r.subject.value!==String(r.old.subject||'')||r.teacher.value!==String(r.old.teacherId||'')||r.start.value!==String(r.old.start||'')||r.end.value!==String(r.old.end||'')||r.support.value!==(r.old.supportId?r.old.supportKind+':'+r.old.supportId:'');
}
function draftSelected(r){return draftChanged(r)||(field('cbScope')==='copyweek'&&!r.duplicate&&!!r.subject.value)}
function updateClassDraft(){
 const weekOption=$('cbScope').querySelector('option[value="week"]');if(weekOption)weekOption.textContent='Changed periods to week ('+workingWeek().map(d=>d.slice(0,3)).join(', ')+')';const copyOption=$('cbScope').querySelector('option[value="copyweek"]');if(copyOption)copyOption.textContent='Copy all filled periods to '+workingWeek().map(d=>d.slice(0,3)).join(', ');$('cbTeacher').disabled=field('cbClass')==='__all__'||classDraftBusy;let count=0;for(const r of classDraftRows){const changed=draftChanged(r);if(changed)count++;const outside=currentLessonIssue({sessionId:activeSession(),day:field('cbDay'),start:r.start.value,end:r.end.value});if(r.coverageNote){const extra=r.extras.find(x=>x.kind+':'+x.id===r.support.value);r.coverageNote.textContent=multiClassMode(activeSession())&&extra?.kind==='teacher'&&String(extra.id)!==String(r.teacher.value)?extra.name+' covers this period. Original teacher is free for other lessons.':extra?.kind==='staff'?'Additional staff assist; the primary teacher remains responsible for the lesson.':''}r.card.style.borderColor=r.duplicate?'#fb7185':changed?'#f59e0b':r.old?'#25815f':'#475569';r.tag.textContent=r.duplicate?'Duplicate — resolve here':outside&&r.start.value&&r.end.value?'Outside hours — '+outside:changed?'Unsaved change':r.old?'Saved · editable':'Empty'}
 for(const btn of $('cbRows').querySelectorAll('.duplicate-remove'))btn.disabled=classDraftBusy||quickBusy||periodNeedsRefresh;
 classDraftDirty=count>0;countNotice();const selected=classDraftRows.filter(draftSelected).length;$('cbSave').disabled=!selected||!teacherDirectoryLoaded||classDraftBusy||quickBusy||periodNeedsRefresh;$('cbSave').textContent=field('cbScope')==='copyweek'&&selected?'Copy '+selected+' filled periods to working week':count?'Save '+count+' changed period'+(count===1?'':'s'):'No unsaved changes';
}
async function saveClassDraft(){
 if(classDraftBusy||quickBusy||timingBusy||sessionBusy||periodNeedsRefresh)return;
 let attempted=false,completed=0;const note=$('cbStatus');
 try{
  authorized();lastConflictAttempt=null;renderConflictReport();const [sid,cls,day]=JSON.parse(classDraftKey);if(sid!==activeSession())throw Error('Session changed. Reopen class timetable.');
  const week=field('cbScope')!=='day'?workingWeek():[day],existing=timetableForSession(),jobs=[],replace=[],skipped=[];
  if(!week.length||week.some(d=>!workingWeek().includes(d)))throw Error('Select configured working days.');
  for(const r of classDraftRows.filter(draftSelected)){
   const parts=LamaTimetableGrid.splitLabel(r.classLabel),key=LamaTimetableGrid.classKey(r.classLabel),sameCls=x=>LamaTimetableGrid.classKey(LamaTimetableGrid.classLabel(x))===key;
   const subject=r.subject.value,teacher=requireTeacher(r.teacher.value),start=r.start.value,end=r.end.value;
   if(!subject||!validTime(start)||!validTime(end)||start>=end)throw Error('Period '+r.i+': choose subject, teacher and valid times.');
   requireSubject(parts.grade,subject,r.old);
   for(const d of week){
    const why=currentLessonIssue({sessionId:sid,day:d,start,end});if(why){if(week.length===1||d===day)throw Error(r.classLabel+' '+d+' P'+r.i+': '+why);skipped.push(r.classLabel+' '+d+' P'+r.i+' ('+why+')');continue}
    const hits=existing.filter(x=>x.day===d&&Number(x.period)===r.i&&sameCls(x));if(hits.length>1){rejectTimetableConflicts(findTimetableConflicts(hits),sid);throw Error(r.classLabel+' '+d+' P'+r.i+': duplicate saved lessons.');}
    const old=hits[0];const payload={sessionId:sid,day:d,period:r.i,start,end,grade:old?.grade||parts.grade,section:old?.section??parts.section,subject,teacherId:teacher.id,teacherName:teacher.name,room:old?.room||'',published:old?.published!==false};
    const extra=r.extras.find(x=>x.kind+':'+x.id===r.support.value);if(r.support.value&&!extra)throw Error('Select a registered additional staff member.');if(extra){if(extra.kind==='teacher'&&extra.id===teacher.id)throw Error('Primary and additional teacher must be different.');Object.assign(payload,{supportId:String(extra.id),supportKind:extra.kind,supportName:extra.name,supportRole:extra.role})}
    if(old&&String(old.supportId||'')===String(payload.supportId||'')&&Object.keys(payload).every(k=>old[k]===payload[k]))continue;
    if(old&&d!==day)replace.push(r.classLabel+' '+d+' P'+r.i);
    const expected=old?parsed(rows.find(x=>String(x.id)===String(old.id))):null;
    jobs.push({id:old?.id||'',expected,payload});
   }
  }
  if(!jobs.length)throw Error('No changed lessons to save for the selected days.'+(skipped.length?' Skipped outside school hours: '+skipped.join('; '):''));
  if(jobs.length>500)throw Error('Save at most 500 lessons at a time. Reduce periods or save one day at a time.');
  lastConflictAttempt=null;rejectTimetableConflicts(checkProposedConflicts(existing,jobs,day),sid);renderConflictReport();
  if(week.length>1&&!confirm('Apply '+jobs.length+' changed lesson(s) to '+week.join(', ')+'?'+(skipped.length?' Out-of-hours copies will be skipped: '+skipped.join('; ')+'. Existing records are retained.':'')+(replace.length?' Existing lessons will be updated: '+replace.join(', '):'')))return;
  classDraftBusy=true;quickBusy=true;$('classBuilder').querySelectorAll('input,select,button').forEach(e=>e.disabled=true);note.textContent='Saving '+jobs.length+' lesson(s) in one request…';
  attempted=true;
  const result=await LamaAPI.planningSaveBatch(jobs);
  if(!Array.isArray(result?.records)||result.records.length!==jobs.length)throw Error('Incomplete server acknowledgement.');
  for(let i=0;i<jobs.length;i++){const r=result.records[i],j=jobs[i],p=parsed(r);if(!r?.id||(j.id&&String(j.id)!==String(r.id))||r.category!==type.period||Object.keys(j.payload).some(k=>p[k]!==j.payload[k]))throw Error('Saved lesson acknowledgement mismatch.')}
  for(const r of result.records){const i=rows.findIndex(x=>String(x.id)===String(r.id));if(i<0)rows.push(r);else rows[i]=r}completed=jobs.length;
  classDraftDirty=false;$('cbScope').value='day';render();renderClassBuilder(true);note.textContent='✓ '+completed+' lessons saved and verified.'+(skipped.length?' '+skipped.length+' out-of-hours copies skipped.':'');status(note.textContent);
 }catch(e){
  if(attempted&&!/Unknown action: planningSaveBatch/i.test(e.message))periodNeedsRefresh=true;
  note.textContent=/Unknown action: planningSaveBatch/i.test(e.message)?'Fast batch save requires the updated Apps Script backend. Your changes are still in this form. No batch was saved.':e.message+(periodNeedsRefresh?' Refresh and verify before retrying.':'');
 }finally{if(classDraftBusy){classDraftBusy=false;quickBusy=false;$('classBuilder').querySelectorAll('input,select,button').forEach(e=>e.disabled=false);for(const r of classDraftRows)if(r.duplicate)for(const e of [r.subject,r.teacher,r.support,r.start,r.end])e.disabled=true;updateClassDraft()}}
}

function setupQuickScope(){
 const box=document.createElement('div');
 box.className='space-y-2 my-3';
 box.innerHTML='<label for="quickApplyScope">Apply this period to</label><select id="quickApplyScope" style="width:100%"><option value="day">Selected day only</option><option value="week">Full school week (Monday–Saturday)</option><option value="custom">Choose specific days</option></select><div id="quickCustomDays" class="hidden flex flex-wrap gap-3" role="group" aria-label="Select weekdays">'+days.map(d=>'<label style="display:inline-flex;align-items:center;gap:5px"><input type="checkbox" style="width:auto" value="'+d+'" '+(quickCustomDays.includes(d)?'checked':'')+'> '+d.slice(0,3)+'</label>').join('')+'</div><p id="quickScopeSummary" class="text-xs text-slate-300"></p><p id="quickSaveStatus" class="text-sm" role="status" aria-live="polite"></p>';
 const dayLabel=document.createElement('label');
 dayLabel.innerHTML='Day to save<select id="quickTargetDay" required>'+days.map(d=>'<option>'+d+'</option>').join('')+'</select><small>Changing the day keeps all other lesson fields unchanged.</small>';
 $('quickForm').querySelector('.quick-editor-grid').prepend(dayLabel);
 const action=document.createElement('label');
 action.id='quickDayActionWrap';action.className='hidden';
 action.innerHTML='Action for another day<select id="quickDayAction"><option value="copy">Copy — keep original lesson</option><option value="move">Move — change original day</option></select>';
 box.insertBefore(action,box.querySelector('#quickScopeSummary'));
 $('quickForm').insertBefore(box,$('quickSave').parentElement);
 $('quickTargetDay').onchange=()=>{updateQuickScope();$('quickSaveStatus').textContent=''};
 $('quickDayAction').onchange=updateQuickScope;
 $('quickApplyScope').onchange=()=>{quickScopePreference=field('quickApplyScope');updateQuickScope()};
 $('quickCustomDays').onchange=()=>{quickCustomDays=[...$('quickCustomDays').querySelectorAll('input:checked')].map(c=>c.value);updateQuickScope()};
}
function openQuickEditor(b){
 authorized();if(classDraftDirty){if(!confirm('Discard unsaved class builder changes before editing this grid cell?'))return;classDraftDirty=false;renderClassBuilder(true)}
 if(quickBusy)throw Error('Please finish the current save first.');
 if(periodNeedsRefresh)throw Error('Previous save uncertain. Reload the timetable before editing.');
 quickSession=activeSession();
 const day=b.dataset.quickDay,num=Number(b.dataset.quickPeriod),cls=b.dataset.quickClass;if(num>effectivePeriodCount(activeSession(),cls))throw Error('Increase the period count for this class first.');
 const parts=LamaTimetableGrid.splitLabel(cls),periods=timetableForSession();
 const matches=periods.filter(p=>same(p.day,day)&&Number(p.period)===num&&LamaTimetableGrid.classKey(LamaTimetableGrid.classLabel(p))===LamaTimetableGrid.classKey(cls));
 if(matches.length>1){status('This cell has multiple saved periods. Use the detailed editor to choose the correct one.');return}
 const old=matches[0],t=LamaTimetableGrid.timesFor(periods,day,num);
 for(const [id,v] of Object.entries({quickPeriodId:old?.id||'',quickGrade:parts.grade,quickSection:parts.section,quickPeriodDay:day,quickPeriodNumber:num,quickStart:old?.start||t.start,quickEnd:old?.end||t.end,quickSubject:old?.subject||'',quickRoom:old?.room||''}))$(id).value=v;
 $('quickPublished').checked=old?.published!==false;
 subjectOptionsFor(parts.grade,'quickSubject',old?.subject||'');
 populateTeacherPicker('quickTeacher',field('quickSubject'),old?.teacherId||'');
 $('quickTarget').textContent=(old?'Edit':'Add')+' · '+cls+' · '+day+' · P'+num;
 $('quickTargetDay').value=day;$('quickDayAction').value='copy';$('quickApplyScope').value=old?'day':quickScopePreference;$('quickSaveStatus').textContent='';updateQuickScope();
 $('quickEditor').classList.remove('hidden');
 $('quickEditor').scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function saveQuickPeriod(){
 authorized();
 if(quickBusy)throw Error('Another period save is in progress.');
 if(periodNeedsRefresh)throw Error('Previous save uncertain. Reload the timetable before retrying.');
 const id=field('quickPeriodId'),grade=field('quickGrade'),section=field('quickSection'),period=Number(field('quickPeriodNumber')),start=field('quickStart'),end=field('quickEnd'),subject=field('quickSubject'),teacherId=field('quickTeacher');
 const sessionId=activeSession(),targetDays=quickScopeDays(),sourceDay=field('quickPeriodDay');
 if(!sessionId||quickSession!==sessionId)throw Error('Session changed. Reopen the correct timetable cell.');
 if(!targetDays.length)throw Error('Choose at least one day.');
 if(!grade||!subject||!start||!end)throw Error('Class, subject, start and end time are required.');
 requireSubject(grade,subject,data('period').find(x=>String(x.id)===id));
 const selectedTeacher=requireTeacher(teacherId);
 if(start>=end)throw Error('End time must be after start time (check AM/PM).');
 if(!Number.isInteger(period)||period<1||period>30)throw Error('Invalid period number.');
 const classKey=LamaTimetableGrid.classKey(grade+(section?' · Section '+section:''));
 const sameClass=x=>LamaTimetableGrid.classKey(LamaTimetableGrid.classLabel(x))===classKey;
 const existing=timetableForSession(),jobs=[],replaceDays=[],skippedDays=[];
 const moving=field('quickApplyScope')==='day'&&field('quickDayAction')==='move'&&targetDays[0]!==sourceDay;
 const original=existing.find(x=>String(x.id)===id&&same(x.day,sourceDay)&&Number(x.period)===period&&sameClass(x));
 if(moving&&!original)throw Error('Original lesson not found. Reopen the timetable cell.');
 for(const day of targetDays){
  const why=currentLessonIssue({sessionId,day,start,end});if(why){if(targetDays.length===1||day===sourceDay)throw Error(day+' P'+period+': '+why);skippedDays.push(day+' ('+why+')');continue}
  const hits=existing.filter(x=>same(x.day,day)&&Number(x.period)===period&&sameClass(x));
  if(hits.length>1){rejectTimetableConflicts(findTimetableConflicts(hits),sessionId);throw Error(grade+' '+day+' P'+period+': duplicate class periods exist.');}
  const old=hits[0],oldId=old?String(old.id):'';
  if(moving&&old)throw Error(day+': this period already has a lesson. Move is blocked; choose an empty day.');
  if(day===sourceDay&&id!==oldId)throw Error('This period changed. Reopen the timetable cell.');
  const payload={sessionId,day,period,start,end,grade,section,subject,teacherId,teacherName:selectedTeacher.name,room:field('quickRoom'),published:$('quickPublished').checked};assertLessonHours(payload);

  const unchanged=old&&Object.keys(payload).every(k=>old[k]===payload[k]);
  if(unchanged)continue;
  if(old&&day!==sourceDay)replaceDays.push(day);
  jobs.push({id:moving?id:oldId,payload});
 }
 lastConflictAttempt=null;rejectTimetableConflicts(checkProposedConflicts(existing,jobs),sessionId);renderConflictReport();
 if(moving&&!confirm('Move this lesson from '+sourceDay+' to '+targetDays[0]+'? The original day will become empty.'))return;
 if(skippedDays.length&&!confirm('Skip days outside published school hours: '+skippedDays.join('; ')+'? Existing records will be retained.'))return;
 if(replaceDays.length&&!confirm('Replace existing different lessons for this class and period on '+replaceDays.join(', ')+'? Other periods will not change.'))return;
 if(!jobs.length){const message=skippedDays.length?'No eligible changes. Skipped: '+skippedDays.join('; '):'Already saved for all selected days. No duplicate records created.';$('quickSaveStatus').textContent=message;status(message);return}
 quickBusy=true;
 const form=$('quickForm'),controls=[...form.querySelectorAll('input,select,button')],previous=controls.map(c=>c.disabled);
 controls.forEach(c=>c.disabled=true);
 let completed=0;
 try{
  for(const job of jobs){
   const message='Saving '+job.payload.day+' ('+(completed+1)+' of '+jobs.length+')…';
   $('quickSaveStatus').textContent=message;status(message);
   await writePeriod(job.id,job.payload);
   completed++;
   renderQuickGrid();
  }
  // Retain the entire form after saving so the administrator can reuse it.
  // Re-anchor to the original saved lesson, or to the new target after a move/new entry.
  const anchorDay=moving?targetDays[0]:targetDays.includes(sourceDay)||id?sourceDay:targetDays[0];
  const anchor=data('period').find(x=>x.sessionId===sessionId&&same(x.day,anchorDay)&&Number(x.period)===period&&sameClass(x));
  if(anchor){$('quickPeriodId').value=anchor.id;$('quickPeriodDay').value=anchorDay;$('quickTarget').textContent='Edit / copy · '+grade+(section?' / '+section:'')+' · '+anchorDay+' · P'+period;}
  $('quickDayAction').value='copy';
  render();
  const message='✓ '+(moving?'Moved':'Saved')+': '+grade+(section?' / '+section:'')+' · P'+period+' · '+subject+' · '+targetDays.join(', ')+' ('+completed+' changed, '+(targetDays.length-completed-skippedDays.length)+' already saved, '+skippedDays.length+' skipped). Change the day to reuse these details.';
  $('quickSaveStatus').textContent=message;status(message);
 }catch(error){
  periodNeedsRefresh=true;
  render();
  throw Error(completed+' of '+jobs.length+' changes confirmed. Remaining save status uncertain. Reload before retrying. '+error.message);
 }finally{
  quickBusy=false;
  controls.forEach((c,i)=>c.disabled=previous[i]);
  updateQuickScope();
 }
}
function sessions(){return data('session').sort((a,b)=>a.start.localeCompare(b.start))}
function activeSession(){return field('viewSession')||sessions().find(s=>s.active)?.id||sessions()[0]?.id||''}
function render(){const list=sessions(),old=field('viewSession');for(const id of ['viewSession','periodSession','eventSession']){const el=$(id);if(!el)continue;el.replaceChildren();for(const s of list)el.add(new Option(s.name+(s.active?' (active)':''),s.id));if(list.some(s=>s.id===old))el.value=old;else if(list.some(s=>s.active))el.value=list.find(s=>s.active).id}
const chosen=activeSession(),periods=data('period').filter(p=>p.sessionId===chosen&&allowed(p)&&!currentLessonIssue(p,chosenSeason()));
const grade=field('viewGrade'),oldGrade=grade;const grades=[...new Set(periods.map(p=>p.grade).filter(Boolean))].sort(LamaClassOrder.compare);$('viewGrade').replaceChildren(new Option('All classes',''));for(const g of grades)$('viewGrade').add(new Option(g,g));$('viewGrade').value=grades.includes(oldGrade)?oldGrade:'';
const selectedGrade=field('viewGrade'),day=field('viewDay');periods.sort((a,b)=>days.indexOf(a.day)-days.indexOf(b.day)||Number(a.period)-Number(b.period)||LamaClassOrder.compare(LamaTimetableGrid.classLabel(a),LamaTimetableGrid.classLabel(b))||String(a.start||'').localeCompare(String(b.start||'')));
const view=periods.filter(p=>workingWeek().includes(p.day)&&(!selectedGrade||same(p.grade,selectedGrade))&&(!day||p.day===day));
$('periodRows').innerHTML=view.length?view.map(p=>'<tr data-lesson-id="'+esc(p.id)+'" class="border-b border-slate-700"><td class="p-2">'+esc(p.day)+'</td><td class="p-2">'+esc(p.period)+'</td><td class="p-2">'+esc(p.start)+'–'+esc(p.end)+(adminMode&&currentLessonIssue(p,chosenSeason())?'<br><strong class="text-amber-300">'+esc(currentLessonIssue(p,chosenSeason()))+'</strong>':'')+'</td><td class="p-2">'+esc(p.grade)+(p.section?' / '+esc(p.section):'')+'</td><td class="p-2">'+esc(p.subject)+'</td><td class="p-2">'+esc(p.teacherName||'Unassigned')+(coverageTeacher(p)?' (original / covered)':'')+(p.supportName?'<br>'+esc(p.supportName)+' ('+esc(coverageTeacher(p)?'Cover teacher':p.supportRole||'Additional staff')+')':'')+'</td><td class="p-2 no-print">'+(adminMode?'<button class="text-cyan-300" data-edit-period="'+esc(p.id)+'">Edit</button> <button type="button" class="text-emerald-300" data-copy-period="'+esc(p.id)+'">Copy / change day</button> <button class="text-rose-300" data-remove-period="'+esc(p.id)+'">Delete</button> '+(p.teacherId?'<button class="text-amber-300" data-ping-period="'+esc(p.id)+'">Ping teacher</button>':''):'')+'</td></tr>').join(''):'<tr><td colspan="7" class="p-5 text-slate-400">No published periods for this selection.</td></tr>';
if(adminMode)$('sessionList').innerHTML=list.map(s=>{
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
renderTiming();renderCalendar();renderPrintClassPicker(periods,chosen);if(adminMode){populateClassEditor(field('grade'),field('section'),field('subject'));renderQuickGrid(periods);renderClassBuilder();renderConflictReport();}try{syncPrintFilters();queuePrintPreview()}catch(error){console.warn('Print preview refresh skipped:',error.message)}
}
function renderCalendar(){
 const chosen=activeSession(),events=data('event').filter(e=>e.sessionId===chosen&&allowed(e)).sort((a,b)=>a.start.localeCompare(b.start));
 $('monthTitle').textContent=month.toLocaleDateString(undefined,{month:'long',year:'numeric'});
 const y=month.getFullYear(),m=month.getMonth(),offset=(new Date(y,m,1).getDay()+6)%7,last=new Date(y,m+1,0).getDate();
 let h=days.map(d=>'<b class="p-2 text-cyan-300">'+d.slice(0,3)+'</b>').join('');
 for(let i=0;i<offset;i++)h+='<div></div>';
 for(let d=1;d<=last;d++){
  const date=[y,String(m+1).padStart(2,'0'),String(d).padStart(2,'0')].join('-'),mark=calendarDay(date,chosen,events),color=calendarColors[mark.kind];
  h+='<div class="calendar-date border border-slate-700 rounded-lg min-h-16 p-1 text-left" '+(color?'style="border-top:4px solid '+color+';background:'+color+'22"':'')+'><b>'+d+'</b>'+(mark.label?'<p class="calendar-day-label text-[10px] break-words" style="color:'+color+'">'+esc(mark.label)+'</p>':'')+mark.hits.slice(0,2).map(e=>'<p class="text-[10px] text-amber-300 break-words" title="'+esc(e.title)+'">'+esc(e.title)+'</p>').join('')+'</div>';
 }
 $('monthGrid').innerHTML=h;
 const vacationRows=Object.entries(vacationsFor(chosen)).map(([k,v])=>'<div class="border-b border-slate-700 py-2 text-sm"><b>'+esc(vacationKeys[k])+'</b> · '+esc(formatDate(v.from))+' – '+esc(formatDate(v.to))+'</div>').join('');
 $('eventRows').innerHTML=vacationRows+(events.length?events.map(e=>'<div class="border-b border-slate-700 py-2 text-sm"><b>'+esc(e.type)+'</b> · '+esc(e.title)+' · '+esc(e.start)+' – '+esc(e.end)+(e.description?' · '+esc(e.description):'')+(adminMode?' <button class="text-cyan-300" data-edit-event="'+esc(e.id)+'">Edit</button> <button class="text-rose-300" data-remove-event="'+esc(e.id)+'">Delete</button>':'')+'</div>').join(''):'<p class="text-slate-400 text-sm">No additional events for this session.</p>');queuePrintPreview();
}
function edit(kind,id){if(quickBusy)return;const p=data(kind).find(r=>r.id===id);if(!p)return;$('admin').classList.remove('class-grid-collapsed');if($('cbSettings'))$('cbSettings').textContent='Hide session & calendar editors';const fields=kind==='period'?{periodId:'id',periodSession:'sessionId',day:'day',period:'period',start:'start',end:'end',grade:'grade',section:'section',subject:'subject',teacher:'teacherId',room:'room',published:'published'}:kind==='event'?{eventId:'id',eventSession:'sessionId',eventType:'type',eventTitle:'title',eventStart:'start',eventEnd:'end',eventDescription:'description',eventPublished:'published'}:{sessionId:'id',sessionName:'name',sessionStart:'start',sessionEnd:'end',sessionActive:'active'};if(kind==='period')populateClassEditor(p.grade,p.section||'',p.subject||'');for(const [input,key] of Object.entries(fields)){if($(input).type==='checkbox')$(input).checked=p[key]!==false;else if(kind!=='period'||!['grade','section','subject'].includes(input))$(input).value=p[key]??''}if(kind==='period')populateTeacherPicker('teacher',p.subject,p.teacherId);$(kind==='period'?'periodForm':kind==='event'?'eventForm':'sessionForm').scrollIntoView({behavior:'smooth',block:'start'})}
$('periodForm').onsubmit=async e=>{e.preventDefault();try{authorized();const p={sessionId:field('periodSession'),day:field('day'),period:Number(field('period')),start:field('start'),end:field('end'),grade:field('grade'),section:field('section'),subject:field('subject'),teacherId:field('teacher'),teacherName:requireTeacher(field('teacher')).name,room:field('room'),published:$('published').checked};if(!p.sessionId)throw Error('Create an academic session first');requireSubject(p.grade,p.subject,data('period').find(x=>String(x.id)===field('periodId')));if(p.start>=p.end)throw Error('Period end must be after start');lastConflictAttempt=null;rejectTimetableConflicts(checkProposedConflicts(data('period'),[{id:field('periodId'),payload:p}]),p.sessionId);renderConflictReport();if(!await save('period',field('periodId'),p))throw Error('Period save could not be verified. Refresh before retrying.');$('periodId').value='';status('Period saved')}catch(err){status(err.message)}};
$('sessionForm').onsubmit=async e=>{
 e.preventDefault();
 if(sessionBusy||timingBusy){status('Academic session is being saved. Please do not submit twice.');return}
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
  if(prior){for(const key of ['schoolTiming','summerTiming','vacations','terms','classPeriodCounts','teacherSchedulingMode'])if(prior[key])p[key]=prior[key];for(const key of ['schoolTiming','summerTiming'])validateSessionRange(p[key],p,key);for(const [key,v] of Object.entries(p.vacations||{}))validateSessionRange(v,p,key);if(p.terms)validateAcademicTerms(p.terms,p)}
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
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const copyId=b.getAttribute('data-copy-period');if(copyId){try{const p=timetableForSession().find(x=>String(x.id)===copyId);if(!p)throw Error('Period not found. Reload the timetable.');openQuickEditor({dataset:{quickDay:p.day,quickPeriod:String(p.period),quickClass:LamaTimetableGrid.classLabel(p)}})}catch(err){status(err.message)}return}const pingId=b.getAttribute('data-ping-period');if(pingId){(async()=>{try{authorized();const p=data('period').find(x=>x.id===pingId);if(!p?.teacherId)throw Error('No assigned teacher');const msg='Period reminder: '+p.day+' '+p.start+'–'+p.end+', '+p.subject+', Class '+p.grade+(p.section?' '+p.section:'')+'.';await LamaAPI.pingTeacher(p.teacherId,msg);status('In-app teacher ping queued. This does not send WhatsApp.')}catch(err){status('Ping failed: '+err.message)}})();return}for(const kind of ['period','session','event']){const editId=b.getAttribute('data-edit-'+kind),removeId=b.getAttribute('data-remove-'+kind);if(editId){edit(kind,editId);return}if(removeId){remove(kind,removeId).catch(err=>status(err.message));return}}});

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
setupTiming();
setupQuickScope();
if(adminMode)setupClassBuilder();
$('quickDay').onchange=()=>{renderQuickGrid();if(!quickBusy&&!$('quickEditor').classList.contains('hidden')){$('quickTargetDay').value=field('quickDay');$('quickApplyScope').value='day';$('quickDayAction').value='copy';updateQuickScope();$('quickSaveStatus').textContent='Day changed. Lesson details retained; save to apply.'}};
$('quickPeriods').disabled=true;$('quickPeriods').title='Uses the saved period count of each class. Change counts in the Easy class timetable builder.';
$('grade').onchange=()=>{populateClassEditor(field('grade'));populateTeacherPicker('teacher',field('subject'))};
$('subject').onchange=()=>populateTeacherPicker('teacher',field('subject'),field('teacher'));
$('quickSubject').onchange=()=>populateTeacherPicker('quickTeacher',field('quickSubject'),field('quickTeacher'));
$('restoreGrid').onclick=()=>{hiddenGrid.delete(activeSession()+'|'+field('quickDay'));renderQuickGrid()};
$('quickGrid').addEventListener('click',event=>{
 const remove=event.target.closest('button[data-clear-period],button[data-clear-class]');if(remove){const isPeriod=remove.hasAttribute('data-clear-period');clearGridAxis(isPeriod?'period':'class',isPeriod?remove.dataset.clearPeriod:remove.dataset.clearClass).catch(e=>status('Removal not fully verified: '+e.message));return;}
 const button=event.target.closest('button[data-quick-class]');
 if(!button)return;
 try{openQuickEditor(button)}catch(e){status(e.message)}
});
$('quickForm').addEventListener('submit',async event=>{
 event.preventDefault();
 try{await saveQuickPeriod()}catch(error){$('quickSaveStatus').textContent=error.message;status('Quick save not verified: '+error.message)}
});
$('quickCancel').onclick=()=>$('quickEditor').classList.add('hidden');
$('quickOpenFull').onclick=()=>{
 if(!adminMode||quickBusy)return;
 populateClassEditor(field('quickGrade'),field('quickSection'),field('quickSubject'));
 for(const [id,v] of Object.entries({
  periodId:field('quickPeriodDay')===field('quickTargetDay')?field('quickPeriodId'):'',periodSession:activeSession(),day:field('quickTargetDay'),
  period:field('quickPeriodNumber'),start:field('quickStart'),end:field('quickEnd'),
  room:field('quickRoom')}))$(id).value=v;
 populateTeacherPicker('teacher',field('subject'),field('quickTeacher'));
 $('published').checked=$('quickPublished').checked;
 $('quickEditor').classList.add('hidden');$('admin').classList.remove('class-grid-collapsed');if($('cbSettings'))$('cbSettings').textContent='Hide session & calendar editors';$('periodForm').scrollIntoView({behavior:'smooth'});
};
for(const id of ['viewSession','viewGrade','viewDay'])$(id).onchange=()=>{if(id==='viewSession'&&classDraftDirty){if(!confirm('Discard unsaved class timetable changes before switching session?')){$('viewSession').value=JSON.parse(classDraftKey)[0];return}classDraftDirty=false}if(id==='viewSession'&&!quickBusy)$('quickEditor').classList.add('hidden');render()};
$('prevMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);renderCalendar()};$('nextMonth').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);renderCalendar()};$('reload').onclick=()=>{if(classDraftBusy||quickBusy)return;if(classDraftDirty&&!confirm('Discard unsaved timetable changes and refresh saved records?'))return;classDraftDirty=false;void load()};$('print').onclick=printTimetable;
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
 if(adminMode&&!verified)throw Error('Sign in as school administrator first.');
 const name=sessions().find(item=>item.id===selectedSession)?.name||'Not configured';
 const season=field('printSeason')||seasonForDate(dateToday(),selectedSession);const dayTiming=season?schoolTiming(selectedSession,season):null;const printWork=LamaSchoolWeek.working(schoolWeekResources,dayTiming?days.filter(d=>dayTiming.hours[d]?.open===true):workingWeek());
 const periods=data('period').filter(p=>p.sessionId===selectedSession&&allowed(p)&&printWork.includes(p.day)&&!currentLessonIssue(p,season));
 const mode=field('printScope');
 if(!selectedSession)throw Error('Load an academic session before previewing or printing.');
 if(field('printDay')&&!printWork.includes(field('printDay')))throw Error('Choose a working day for the selected season.');
 const cls=field('printOneClass');
 const selectedClasses=printSelection instanceof Set?[...printSelection]:null;
 const inCharge={};for(const label of [...visibleClasses(),cls]){if(!label)continue;const parts=LamaTimetableGrid.splitLabel(label);const assigned=teachers.filter(t=>LamaTimetableGrid.classKey(t.assignedClass)===LamaTimetableGrid.classKey(parts.grade)&&(!parts.section||same(t.assignedSection,parts.section)));if(assigned.length===1){const t=assigned[0];inCharge[label]=t.name+(t.designation?' ('+t.designation+')':'');}}
 const seasonLabel=season==='winter'?'Winter':season==='summer'?'Summer':'';const printTiming=dayTiming?[timingSummary(dayTiming,season)]:[{title:seasonLabel?seasonLabel+' school timings not published':'Seasonal school timings not published for this date',lines:['School opening, closing, assembly and break times require published seasonal settings.']}];
 const calendarIncluded=$('printCalendar').checked;
 const calMonth=$('monthTitle').textContent;
 return LamaTimetablePrint.printMarkup({
  school:profile,
  schoolFallback:printProfileFallback(),
  sessionName:name,
  timing:printTiming,seasonLabel,showRooms:$('printRooms')?.checked===true,
  calendarLegend:calendarLegendMarkup(),
  records:periods.map(p=>({...p,coveredByTeacher:coverageTeacher(p)})),
  scope:mode,
  selectedClass:cls,
  selectedClasses:mode==='selected'?null:selectedClasses,
  printDay:field('printDay'),workingDays:printWork,dayTiming,inCharge,
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
  if(periodNeedsRefresh)throw Error('Refresh saved timetable records before printing.');
  if(adminMode&&(classDraftDirty||pendingPeriodCounts.size)&&!confirm('There are unsaved timetable changes or period counts. Print the currently saved records only?'))return;
  const profile=await printProfile();
  const output=buildTimetablePrint(profile);
  $('printSheet').innerHTML=output;
  setPrintOrientation();
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
function printOrientation(){return field('printScope')==='all'||!field('printDay')?'landscape':'portrait'}
function setPrintOrientation(){let style=document.getElementById('dynamicPrintPage');if(!style){style=document.createElement('style');style.id='dynamicPrintPage';document.head.append(style)}style.textContent='@page{size:A4 '+printOrientation()+';margin:10mm}'}
window.addEventListener('beforeprint',()=>{setPrintOrientation();
 // Support the browser's own Print command without replacing a logo
 // whose bytes have already been loaded for the print-button preview.
 if(printPrepared)return;
 $('printSheet').replaceChildren();
 try{$('printSheet').innerHTML=buildTimetablePrint(printSchoolProfile||printProfileFallback());printPrepared=true}
 catch(error){status('Unable to prepare print: '+error.message)}
});
window.addEventListener('afterprint',()=>{printPrepared=false});

let previewGeneration=0,previewTimer=null;
function previewDocument(markup,styles,orientation,scale){
 const width=orientation==='landscape'?297:210;
 // Use the same print markup and the page's print CSS, with print media rules
 // enabled on screen. Scrolling is contained inside the sandboxed frame.
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src &apos;none&apos;; img-src https: data:; style-src &apos;unsafe-inline&apos;; base-uri &apos;none&apos;; form-action &apos;none&apos;"><style>'+styles.replace(/<\/style/gi,'<\\/style')+'\n*{box-sizing:border-box}html,body{min-height:100%;background:#e2e8f0!important}body{overflow:auto}main{width:'+width+'mm;min-height:'+(orientation==='landscape'?210:297)+'mm;background:#fff!important;padding:10mm!important;zoom:'+scale+';box-sizing:border-box}#printSheet{width:100%;} .print-class-page+.print-class-page,.print-calendar-block{border-top:2px dashed #94a3b8;margin-top:10mm;padding-top:10mm}@media print{body{background:white}}</style></head><body><main><div id="printSheet" class="print-only">'+markup+'</div></main></body></html>';
}
function syncPrintFilters(){
 if(!$('printOneClassWrap'))return;
 const single=field('printScope')==='selected';
 $('printClassList').hidden=single;
 $('printClassList').style.display=single?'none':'';
 $('selectAllPrintClasses').hidden=single;$('clearPrintClasses').hidden=single;
 $('printClassStatus').hidden=single;
 $('printOneClassWrap').hidden=!single;
 $('printOneClass').disabled=!single;
 // Day options must reflect the season being printed, not the builder's season.
 if(activeSession()){
  const season=field('printSeason')||seasonForDate(dateToday(),activeSession()),t=season?schoolTiming(activeSession(),season):null;
  const work=LamaSchoolWeek.working(schoolWeekResources,t?days.filter(d=>t.hours[d]?.open===true):workingWeek());
  for(const o of $('printDay').options)o.disabled=!!o.value&&!work.includes(o.value);
  if(field('printDay')&&!work.includes(field('printDay')))$('printDay').value='';
 }
}
function queuePrintPreview(){
 clearTimeout(previewTimer);
 if(!$('printPreviewPanel')||$('printPreviewPanel').hidden)return;
 // Immediately hide the old document so it cannot be mistaken for a new filter.
 previewGeneration++;$('printPreviewFrame').hidden=true;$('printPreviewStatus').textContent='Preparing preview…';
 previewTimer=setTimeout(()=>void refreshPrintPreview(),60);
}
async function refreshPrintPreview(){
 const generation=++previewGeneration,frame=$('printPreviewFrame'),note=$('printPreviewStatus');
 if($('printPreviewPanel').hidden)return;
 frame.hidden=true;note.textContent='Preparing preview…';
 try{
  syncPrintFilters();
  if(adminMode&&!verified)throw Error('Sign in as school administrator first.');
  if(periodNeedsRefresh)throw Error('Refresh saved timetable records before previewing.');
  const profile=await printProfile();
  if(generation!==previewGeneration||$('printPreviewPanel').hidden)return;
  const markup=buildTimetablePrint(profile),orientation=printOrientation();
  const available=$('printPreviewPanel').clientWidth-28;
  const scale=field('printPreviewZoom')==='actual'?1:Math.max(.2,Math.min(1,available/((orientation==='landscape'?297:210)*96/25.4)));
  const styles=[...document.querySelectorAll('head style')].map(el=>el.textContent).filter(css=>/@media\s+print\b/.test(css)&&!/\.print-preview-frame/.test(css)).join('\n').replace(/@media\s+print\b/g,'@media all');
  frame.srcdoc=previewDocument(markup,styles,orientation,scale);
  frame.hidden=false;
  const cls=field('printScope')==='selected'?field('printOneClass'):(printSelection?.size||0)+' selected class(es)';
  note.textContent=cls+' · '+(field('printDay')||'Full week')+' · A4 '+orientation+' · Saved published records only. '+(adminMode&&classDraftDirty?'Unsaved editor changes are not included. ':'')+'Print pagination may vary by device.';
 }catch(e){if(generation!==previewGeneration)return;frame.srcdoc='';note.textContent=e.message+' Select the appropriate filters and try again.'}
}
function setupPrintPreview(){
 if(!$('printPreviewPanel')||!$('previewTimetable'))return;
 syncPrintFilters();
 $('previewTimetable').onclick=()=>{$('printPreviewPanel').hidden=false;syncPrintFilters();queuePrintPreview();$('printPreviewPanel').scrollIntoView({behavior:'smooth',block:'nearest'})};
 $('closePrintPreview').onclick=()=>{previewGeneration++;clearTimeout(previewTimer);$('printPreviewPanel').hidden=true;$('printPreviewFrame').srcdoc='';$('previewTimetable').focus()};
 $('refreshPrintPreview').onclick=()=>{syncPrintFilters();queuePrintPreview()};
 $('previewPrint').onclick=()=>void printTimetable();
 $('previewEdit').hidden=!adminMode;
 $('previewEdit').onclick=()=>{$('classBuilder').scrollIntoView({behavior:'smooth',block:'start'})};
 for(const id of ['printScope','printOneClass','printDay','printSeason','printRooms','printCalendar','printPreviewZoom'])$(id).addEventListener('change',()=>{syncPrintFilters();queuePrintPreview()});
 window.addEventListener('resize',()=>{if(field('printPreviewZoom')!=='actual')queuePrintPreview()});
}

// Optional preview controls must never prevent loading the school schedule.
try{setupPrintPreview()}catch(error){console.warn('Print preview setup skipped:',error.message)}
async function init(){if(!['school','student','teacher'].includes(role)||!schoolId){status('Valid school, student or teacher login required.');return}if(!LamaAPI.requireLogin(role,role==='teacher'?'../teacher-login.html':role==='student'?'../students/student-login.html':'../school-admin-login.html'))return;if(role==='teacher')$('back').href='../portals/teacher/index.html';if(role==='student')$('back').href='../portals/student/index.html';if(adminMode){let a;try{a=JSON.parse(sessionStorage.getItem('lama_school_admin_auth')||'null')}catch{}if(!a?.token||a.schoolId!==schoolId){status('School administrator login required.');return}try{await LamaAPI.schoolAdminVerify(schoolId,a.token);verified=true;$('admin').classList.remove('hidden');$('quickBuilder').classList.remove('hidden')}catch(e){status('Administrator verification failed: '+e.message);return}}else{for(const el of document.querySelectorAll('#admin'))el.remove()}await load();void printProfile()}
init();
})();