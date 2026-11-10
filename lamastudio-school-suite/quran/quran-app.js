/* LAMA Quran Learning Centre — existing School Suite sessions and APIs only. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PROGRAMS={qaida:'Noorani / Tajweedi Qaida',nazra:'Nazra Quran',hifz:'Hifz Quran',islamicStudies:'Islamic Studies & Akhlaq'};
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const state={role:'',session:null,config:null,overview:null,students:[],teachers:[],selectedStudentId:'',profile:null,pending:null,busy:false};
const show=(id,on)=>$(id)?.classList.toggle('hidden',!on);
function say(message,variant){
 const el=$('status');el.textContent=String(message||'');
 el.className='notice'+(variant?' '+variant:'');
}
function connection(){
 const online=navigator.onLine!==false;
 $('connection').textContent=online?'● Internet connected':'● Offline — records cannot be confirmed';
 $('connection').style.color=online?'#bdf5d1':'#ffcf9f';
}
function uuid(){
 if(typeof crypto==='undefined'||!crypto.getRandomValues)throw Error('Secure browser randomness is required for an attendance/lesson request.');
 const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
 return 'q'+Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('');
}
function currentRole(){
 const session=LamaAPI.getSession?.();
 if(!session||!['school','teacher','student'].includes(session.role))
  throw Error('Sign in through your existing School Administrator, Teacher or Student Portal.');
 state.session=session;state.role=session.role;return session.role;
}
const api=(action,body={})=>LamaAPI.quran(action,body,state.role);
function pendingKey(){return 'lama-quran-pending-'+String(state.session?.schoolId||'')+'-'+state.role+'-'+String(state.session?.teacherId||state.session?.studentId||state.session?.id||'school')}
function persistPending(){
 try{if(state.pending)sessionStorage.setItem(pendingKey(),JSON.stringify(state.pending));
 else sessionStorage.removeItem(pendingKey())}catch(_){}
}
function restorePending(){
 try{const raw=sessionStorage.getItem(pendingKey());state.pending=raw?JSON.parse(raw):null}catch(_){state.pending=null}
}
function setPending(message){
 show('pending',!!state.pending);show('recheck',!!state.pending);
 if(state.pending)$('pending').textContent=message||'Submission awaiting independent server verification. Do not submit again; use read-only Recheck.';
 for(const id of ['saveLesson','lessonEnrollment','lessonDate','attendanceForm','assessmentForm']){
  if(id==='attendanceForm'||id==='assessmentForm'){
   $(id)?.querySelectorAll('button[type=submit]').forEach(b=>b.disabled=!!state.pending||state.busy);
  }else if($(id))$(id).disabled=!!state.pending||state.busy;
 }
 if($('recheck'))$('recheck').disabled=state.busy;
}
function learnerLabel(l){return (l.studentName||l.studentId)+' — '+(PROGRAMS[l.programCode]||l.programCode)+' · '+(l.className||'Class not set')}
function selectedLearner(){
 return state.overview?.learners?.find(e=>String(e.id)===String($('lessonEnrollment').value))||null;
}
function quranFindVerified(pending,profile){
 if(!pending||!profile)return null;
 const collection=pending.action==='quranSaveLesson'?'lessons':
   pending.action==='quranSaveAssessment'?'assessments':
   pending.action==='quranSaveAttendance'?'attendance':null;
 if(!collection)return null;
 const matches=(profile[collection]||[]).filter(row=>
   String(row.enrollmentId)===String(pending.enrollmentId)&&
   String(row.clientRequestId||'')===String(pending.clientRequestId));
 return matches.length===1?matches[0]:null;
}
async function verifyPending(){
 const pending=state.pending;
 if(!pending||state.busy)return;
 state.busy=true;setPending();
 try{
  const profile=await api('quranProfile',{studentId:pending.studentId});
  if(!profile||String(profile.student?.id)!==String(pending.studentId))
   throw Error('Server did not return the authorised learner profile.');
  const verified=quranFindVerified(pending,profile);
  if(!verified){
   say('Quran record still unverified. It may have been saved with a delayed response; do not send a second write. Recheck online or ask School Administrator to inspect the Quran table.','warn');
   return;
  }
  state.profile=profile;
  state.pending=null;persistPending();
  say('✓ Quran '+(pending.action==='quranSaveLesson'?'lesson':pending.action==='quranSaveAssessment'?'assessment':'attendance')+
   ' verified in the school database. Server record '+verified.id+' · version '+verified.version+'.','success');
 }catch(error){say('Verification unavailable: '+(error.message||String(error))+
  '. No additional write was attempted; pending request preserved for read-only Recheck.','warn')}
 finally{state.busy=false;setPending();renderProfile();}
}
async function saveVerified(action,params){
 if(state.pending)return say('An earlier Quran write is unverified. Recheck the server before saving again.','warn');
 if(state.busy)return;
 if(navigator.onLine===false)return say('Offline: Quran records cannot be confirmed. Do not attempt Save until connected. An encrypted offline queue is not yet available in this module.','warn');
 const enrollment=state.overview?.learners?.find(e=>String(e.id)===String(params.enrollmentId));
 if(!enrollment)return say('Select an assigned Quran student and programme.','error');
 // Read first, so a correction is explicitly version-checked.
 state.busy=true;setPending();let pending;
 try{
  const profile=await api('quranProfile',{studentId:enrollment.studentId});
  const source=action==='quranSaveLesson'?profile.lessons:action==='quranSaveAssessment'?profile.assessments:profile.attendance;
  const existing=(source||[]).filter(r=>r.enrollmentId===params.enrollmentId&&r.date===params.date&&
   (action==='quranSaveLesson'?r.sessionType===params.sessionType:
    action==='quranSaveAssessment'?r.criterion===params.criterion:true));
  if(existing.length>1)throw Error('Duplicate Quran records found; School Administrator review required.');
  const clientRequestId=uuid();
  pending={
   action,enrollmentId:enrollment.id,studentId:enrollment.studentId,
   clientRequestId,date:params.date,sessionType:params.sessionType||'',criterion:params.criterion||''
  };
  const body=Object.assign({},params,{clientRequestId,expectedVersion:existing[0]?Number(existing[0].version):0});
  state.pending=pending;persistPending();setPending('Submitting once; verification required…');
  try{await api(action,body)}catch(error){
   say('Save acknowledgment uncertain: '+(error.message||String(error))+
    '. The original write might have reached the school database. Do not submit it again.','warn');
  }
 }catch(error){say('Quran save was not started: '+(error.message||String(error)),'error');return}
 finally{state.busy=false;setPending()}
 if(pending)await verifyPending();
}
function option(value,label){return '<option value="'+esc(value)+'">'+esc(label)+'</option>'}
function programOptions(){
 return (state.config?.programmes||[]).map(p=>option(p,PROGRAMS[p]||p)).join('');
}
function renderStats(){
 const o=state.overview;
 if(!o)return;
 const metrics=[
  ['Quran learners',o.students],['Qaida',o.programmes?.qaida||0],
  ['Nazra',o.programmes?.nazra||0],['Hifz',o.programmes?.hifz||0],
  ['Islamic Studies',o.programmes?.islamicStudies||0],
  ['Lessons today',o.lessonsToday],['Lessons this month',o.lessonsThisMonth],
  ['Quran present today',o.attendanceToday],
  ['Need revision',o.revisionRequired]
 ];
 $('stats').innerHTML=metrics.map(([label,value])=>'<div class="stat"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong></div>').join('');
 const classes=o.classProgress||[],teachers=o.teacherPerformance||[];
 $('classReports').innerHTML=classes.length?'<ul class="profile-list">'+classes.map(r=>'<li><b>'+
  esc(r.className||'Class')+'</b> '+esc(r.section||'')+' · '+esc(r.learnerCount)+
  ' enrolment(s) · '+esc(r.lessonsThisMonth)+' lesson(s) recorded this month</li>').join('')+'</ul>':
  '<p class="muted">No class progress available for your access scope.</p>';
 $('teacherReports').innerHTML=teachers.length?'<ul class="profile-list">'+teachers.map(r=>'<li><b>'+
  esc(r.teacherName||'Quran Teacher')+'</b> · '+esc(r.assignedProgrammes)+
  ' assigned programme(s) · '+esc(r.lessonsThisMonth)+' lesson(s) recorded · '+
  esc(r.revisionFollowups)+' revision follow-up(s) this month</li>').join('')+'</ul>':
  '<p class="muted">No assigned Quran teacher activity available.</p>';
}
function renderLearners(){
 const ls=state.overview?.learners||[];
 $('learners').innerHTML=ls.length?ls.map(l=>
  '<div class="learner"><div><b>'+esc(l.studentName||'Student')+'</b><br><span class="muted">'+
  esc(PROGRAMS[l.programCode]||l.programCode)+' · '+esc(l.level||l.className||'')+
  '</span></div><button data-student="'+esc(l.studentId)+'" type="button">View</button></div>').join(''):
  '<p class="muted">No Quran enrolments yet. The school administrator can enrol existing students above.</p>';
 const unique=new Map();
 ls.forEach(l=>unique.set(l.studentId,l.studentName||l.studentId));
 $('studentSelect').innerHTML='<option value="">Select learner</option>'+
  [...unique].map(([id,name])=>option(id,name)).join('');
 for(const selectId of ['lessonEnrollment','attEnrollment','assessmentEnrollment']){
  if(!$(selectId))continue;
  const prev=$(selectId).value;
  $(selectId).innerHTML=ls.map(l=>option(l.id,learnerLabel(l))).join('');
  if(ls.some(l=>l.id===prev))$(selectId).value=prev;
 }
 if(state.selectedStudentId&&unique.has(state.selectedStudentId))$('studentSelect').value=state.selectedStudentId;
}
function renderProfile(){
 const p=state.profile;
 if(!p){$('profile').textContent='Choose a learner. No information from another student is displayed.';return}
 const student=p.student||{},ls=[...(p.lessons||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const photo=/^(https?:\/\/|data:image\/(png|jpeg|webp);base64,)/i.test(student.photo||'')?
  '<img class="profile-photo" src="'+esc(student.photo)+'" alt="Student photo">':'';
 let html='<div class="profile-head">'+photo+'<div><h3>'+esc(student.name||'Student')+
  '</h3><span class="muted">'+esc(student.class||'')+' · '+esc(student.section||'')+'</span></div></div>';
 html+='<p><b>Programmes:</b> '+(p.enrollments||[]).map(e=>esc(PROGRAMS[e.programCode]||e.programCode)+
  (e.level?' ('+esc(e.level)+')':'')).join(', ')+'</p>';
 html+='<p><b>Quran attendance entries:</b> '+(p.attendance||[]).length+' · <b>Recorded assessments:</b> '+(p.assessments||[]).length+'</p>';
 html+='<h3>Recent lessons</h3><ul class="profile-list">';
 html+=ls.slice(0,10).map(l=>'<li><b>'+esc(l.date)+' — '+esc(l.lessonTitle||'Lesson')+
  '</b> <span class="badge">'+esc(PROGRAMS[l.programCode]||l.programCode)+'</span>'+
  '<div class="muted">'+esc(l.sessionType||'')+
  (l.quality?' · '+esc(l.quality):'')+
  (l.revisionRequired===true||l.revisionRequired==='true'?' · Revision needed':'')+
  '</div><div>'+esc(l.parentFeedback||'')+'</div><div>'+esc(l.revisionWork||'')+'</div></li>').join('')||'<li>No published lessons to display.</li>';
 html+='</ul>';
 $('profile').innerHTML=html;
}
async function openProfile(studentId){
 if(!studentId)return;
 try{
  const p=await api('quranProfile',{studentId});
  if(String(p?.student?.id)!==String(studentId))throw Error('Student ID mismatch');
  state.selectedStudentId=studentId;state.profile=p;
  $('studentSelect').value=studentId;renderProfile();
 }catch(error){say('Profile unavailable: '+(error.message||String(error)),'error')}
}
async function refresh(){
 if(state.pending)return verifyPending();
 if(state.busy)return;
 state.busy=true;setPending();say('Loading Quran records from the existing school database…');
 try{
  state.config=await api('quranStatus');
  if(!state.config?.enabled){
   show('dashboard',false);show('inactive',true);
   say('Quran module is not activated for this school. Only Super Admin can enable it.','warn');return;
  }
  show('inactive',false);show('dashboard',true);
  state.overview=await api('quranOverview');
  renderStats();renderLearners();
  if(state.role==='school')await loadAdmin();
  if(state.role==='student'){
   const s=state.session;
   await openProfile(s.studentId);
  }else if(state.selectedStudentId){
   await openProfile(state.selectedStudentId);
  }
  say('Quran records loaded from the school backend. No writes were made.','success');
 }catch(error){show('dashboard',false);say('Quran records cannot be verified: '+(error.message||String(error)),'error')}
 finally{state.busy=false;setPending()}
}
async function loadAdmin(){
 const [students,teachers]=await Promise.all([LamaAPI.list('students'),LamaAPI.list('teachers')]);
 if(!Array.isArray(students)||!Array.isArray(teachers))throw Error('School roster or staff list unavailable');
 state.students=students;state.teachers=teachers.filter(t=>String(t.status||'Active')==='Active');
 $('enrollStudent').innerHTML=students.map(s=>option(s.id,(s.name||'Student')+' · '+(s.class||'')+' · '+(s.enrlNo||''))).join('');
 const teacherOptions=state.teachers.map(t=>option(t.id,t.name||t.id)).join('');
 for(const id of ['enrollTeacher','groupTeacher','scheduleTeacher'])$(id).innerHTML=teacherOptions;
 for(const id of ['enrollProgram','groupProgram','scheduleProgram'])$(id).innerHTML=programOptions();
 const all=Object.keys(PROGRAMS);
 $('programChoices').innerHTML=all.map(p=>
  '<label><input type="checkbox" name="quranProgramme" value="'+p+'" '+
  (state.config.programmes.includes(p)?'checked ':'')+
  (p==='hifz'&&!state.config.hifzEnabled?'disabled ':'')+'>'+esc(PROGRAMS[p])+'</label>').join('');
 show('adminPanel',true);
 await loadSchedules();
}
async function loadSchedules(){
 try{
  const rows=await api('quranSchedules');
  const weekdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  $('schedules').innerHTML='<h3>Configured Quran periods</h3>'+
   (rows.length?'<ul class="profile-list">'+rows.map(r=>'<li>'+
    esc(weekdays[Number(r.dayOfWeek)]||'Day')+' · '+esc(r.startTime)+'–'+esc(r.endTime)+
    ' · '+esc(r.className)+' '+esc(r.section||'')+' · '+esc(PROGRAMS[r.programCode]||r.programCode)+
    '</li>').join('')+'</ul>':'<p class="muted">No Quran periods scheduled.</p>');
 }catch(error){$('schedules').textContent='Quran timetable unavailable: '+error.message}
}
function bodyValue(id){return $(id).value.trim()}
async function schoolWrite(action,data,verify){
 if(state.pending||state.busy)return say('Resolve the pending request before another write.','warn');
 if(navigator.onLine===false)return say('Offline. No write request sent.','warn');
 state.busy=true;setPending();say('Submitting to the school backend. Independent readback required…');
 try{
  const result=await api(action,data);
  if(!await verify(result))throw Error('Backend did not confirm the new settings or record in a separate read.');
  say('✓ Quran school configuration independently verified in the existing backend.','success');
  return result;
 }catch(error){say('School configuration not confirmed: '+(error.message||String(error))+
  '. Check the official records before trying again.','warn');return null}
 finally{state.busy=false;setPending()}
}
function reportPaper(){
 const p=state.profile;if(!p)return say('Select an authorised learner before printing.','warn');
 const kind=$('printKind').value,student=p.student||{},school=state.session?.schoolName||state.session?.name||'Registered LAMA School';
 const titles={progress:'Student Quran Progress Card',monthly:'Monthly Quran Assessment',
  hifz:'Hifz Progress Report',diary:'Daily Quran Lesson Register',
  revision:'Revision Assignment',parent:'Parent Quran Progress Report'};
 const lessons=[...(p.lessons||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)))
  .filter(l=>kind!=='hifz'||l.programCode==='hifz')
  .filter(l=>kind!=='revision'||l.revisionRequired===true||l.revisionRequired==='true');
 const assessments=p.assessments||[];
 const paper=document.getElementById('printPaper')||document.createElement('article');
 paper.id='printPaper';
 const rows=lessons.slice(0,kind==='diary'||kind==='revision'?10:25).map(l=>
  '<tr><td>'+esc(l.date)+'</td><td>'+esc(l.lessonTitle||'')+'</td><td>'+esc(l.sessionType||'')+
  '</td><td>'+esc(l.revisionWork||l.parentFeedback||l.quality||'')+'</td></tr>').join('');
 const assessmentsHtml=kind==='monthly'||kind==='progress'?
   '<h3>Teacher assessment</h3><table><tr><th>Date</th><th>Criterion</th><th>Level</th></tr>'+
   assessments.slice(0,12).map(a=>'<tr><td>'+esc(a.date)+'</td><td>'+esc(a.criterion)+'</td><td>'+esc(a.level)+'</td></tr>').join('')+'</table>':'';
 const schoolLocation=state.session?.address||state.session?.schoolAddress||
   (/^LAMA Islamic School$/i.test(school)?'Shah Sadar Din, Dera Ghazi Khan':'');
 const logo=String(state.session?.schoolLogo||state.session?.logo||'');
 const safeLogo=/^(https?:\/\/|data:image\/(png|jpeg|webp);base64,)/i.test(logo)?
  '<p style="text-align:center"><img src="'+esc(logo)+'" alt="School logo" style="width:65px;height:65px;object-fit:contain"></p>':'';
 paper.innerHTML=safeLogo+'<h1>'+esc(school)+'</h1><p class="paper-subtitle">'+
  esc(schoolLocation)+(schoolLocation?' · ':'')+
  'Modern Education with Islamic Values</p><h2>'+esc(titles[kind])+'</h2>'+
  '<p><strong>Student:</strong> '+esc(student.name||'')+' · <strong>Class:</strong> '+
  esc(student.class||'')+' · <strong>Section:</strong> '+esc(student.section||'')+'</p>'+
  '<p><strong>Enrolments:</strong> '+(p.enrollments||[]).map(e=>esc(PROGRAMS[e.programCode]||e.programCode)).join(', ')+'</p>'+
  '<table><tr><th>Date</th><th>Lesson</th><th>Type</th><th>Feedback / Revision</th></tr>'+
  rows+'</table>'+assessmentsHtml+
  '<div class="signature"><span>Quran Teacher: ______________</span><span>School Head: ______________</span></div>'+
  '<p class="paper-footer">LAMA School Suite · A project of lamastudio.pk · Teacher-reviewed learning records</p>';
 document.body.append(paper);
 let style=document.getElementById('quranPaperSize');
 if(!style){style=document.createElement('style');style.id='quranPaperSize';document.head.append(style)}
 style.textContent='@media print{@page{size:'+
  (['diary','revision','parent'].includes(kind)?'A5':'A4')+' portrait;margin:12mm}}';
 window.print();
}
function submit(form,callback){$(form).addEventListener('submit',e=>{e.preventDefault();callback().catch(error=>say(error.message,'error'))})}
function attachActions(){
 $('refresh').onclick=refresh;
 $('recheck').onclick=verifyPending;
 $('learners').addEventListener('click',e=>{const b=e.target.closest('button[data-student]');if(b)openProfile(b.dataset.student)});
 $('studentSelect').onchange=e=>openProfile(e.target.value);
 $('printProfile').onclick=reportPaper;
 $('lessonEnrollment').onchange=e=>{
  const l=selectedLearner();
  $('sessionType').value=l?.programCode==='hifz'?'sabaq':'lesson';
  if(l)openProfile(l.studentId);
 };
 submit('lessonForm',async()=>{
  const l=selectedLearner();if(!l)return say('Select learner first.','warn');
  await saveVerified('quranSaveLesson',{
    enrollmentId:l.id,date:bodyValue('lessonDate'),sessionType:bodyValue('sessionType'),
    lessonTitle:bodyValue('lessonTitle'),lessonRef:bodyValue('lessonRef'),
    surahNumber:bodyValue('surahNumber'),ayahFrom:bodyValue('ayahFrom'),
    ayahTo:bodyValue('ayahTo'),juzNumber:bodyValue('juzNumber'),quality:bodyValue('quality'),
    mistakes:bodyValue('mistakes'),revisionRequired:$('revisionRequired').checked,
    revisionWork:bodyValue('revisionWork'),teacherRemarks:bodyValue('teacherRemarks'),
    parentFeedback:bodyValue('parentFeedback'),published:$('publishLesson').checked
  });
 });
 submit('attendanceForm',async()=>{
  await saveVerified('quranSaveAttendance',{
   enrollmentId:bodyValue('attEnrollment'),date:bodyValue('quranAttDate'),status:bodyValue('attStatus')
  });
 });
 submit('assessmentForm',async()=>{
  await saveVerified('quranSaveAssessment',{
   enrollmentId:bodyValue('assessmentEnrollment'),date:bodyValue('assessmentDate'),
   criterion:bodyValue('criterion'),level:bodyValue('assessmentLevel'),
   remarks:bodyValue('assessmentRemarks'),parentFeedback:bodyValue('assessmentFeedback'),
   published:$('assessmentPublished').checked
  });
 });
 submit('programForm',async()=>{
  const programmes=[...document.querySelectorAll('input[name=quranProgramme]:checked')].map(x=>x.value);
  await schoolWrite('quranConfigure',{programmes},async()=>{const c=await api('quranStatus');
   const a=JSON.stringify([...c.programmes].sort())===JSON.stringify([...programmes].sort());
   if(a){state.config=c;}return a});
 });
 submit('enrollForm',async()=>{
  const studentId=bodyValue('enrollStudent'),programCode=bodyValue('enrollProgram'),teacherId=bodyValue('enrollTeacher');
  await schoolWrite('quranEnroll',{studentId,programCode,teacherId,level:bodyValue('enrollLevel'),groupName:bodyValue('enrollGroup')},
   async result=>{const overview=await api('quranOverview');
    const record=overview.learners.find(r=>r.id===result.id&&r.studentId===studentId&&
     r.programCode===programCode&&r.teacherId===teacherId);
    if(record){state.overview=overview;renderStats();renderLearners();}return !!record});
 });
 submit('groupForm',async()=>{
  const data={teacherId:bodyValue('groupTeacher'),programCode:bodyValue('groupProgram'),
   className:bodyValue('groupClass'),section:bodyValue('groupSection'),groupName:bodyValue('groupName')};
  await schoolWrite('quranAssignTeacherGroup',data,async result=>{
   const groups=await api('quranGroups');return groups.some(g=>g.id===result.id&&g.teacherId===data.teacherId);
  });
 });
 submit('scheduleForm',async()=>{
  const data={teacherId:bodyValue('scheduleTeacher'),programCode:bodyValue('scheduleProgram'),
   className:bodyValue('scheduleClass'),section:bodyValue('scheduleSection'),
   dayOfWeek:Number(bodyValue('scheduleDay')),startTime:bodyValue('scheduleStart'),
   endTime:bodyValue('scheduleEnd'),groupName:bodyValue('scheduleGroup')};
  await schoolWrite('quranSaveSchedule',data,async result=>{
   const schedules=await api('quranSchedules');
   const ok=schedules.some(s=>s.id===result.id&&s.startTime===data.startTime&&s.endTime===data.endTime);
   if(ok)await loadSchedules();return ok;
  });
 });
}
async function init(){
 connection();
 window.addEventListener('online',connection);window.addEventListener('offline',connection);
 const date=today();
 for(const name of ['lessonDate','quranAttDate','assessmentDate'])$(name).value=date;
 attachActions();
 try{
  currentRole();
  $('schoolTag').textContent=(state.session.schoolName||state.session.name||'Registered LAMA School')+
   ' · Modern Education with Islamic Values';
  show('adminPanel',state.role==='school');
  show('teacherPanel',state.role==='school'||state.role==='teacher');
  show('learnersPanel',state.role!=='student');
  restorePending();setPending();
  if(state.pending){
   show('dashboard',true);
   say('A previous Quran save is awaiting verification after refresh. Recheck is read-only; do not submit again.','warn');
   await verifyPending();
   if(!state.pending)await refresh();
  }else await refresh();
 }catch(error){say('Quran Centre cannot open: '+(error.message||String(error)),'error')}
}
init();
})();
