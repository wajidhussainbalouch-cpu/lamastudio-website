'use strict';
/*
 * LAMA School Suite Quran module UI.
 * Uses the existing LamaAPI session; does not create accounts, students or
 * a separate database. Never displays "Saved" until server + fresh readback.
 */
const $=id=>document.getElementById(id);
const escapeText=v=>String(v??'').replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const today=()=>{
 const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
const role=LamaAPI.getSession?.()||null;
const isAdmin=role?.role==='school',isTeacher=role?.role==='teacher',isStudent=role?.role==='student';
const subjectName={Qaida:'Noorani / Tajweedi Qaida',Nazra:'Nazra Quran',Hifz:'Hifz Quran',IslamicStudies:'Islamic Studies',Akhlaq:'Akhlaq & Asool'};
let data=null,teacherRoster=[],studentRoster=[],currentPanel='learners',pending=null,loading=false,saveBusy=false;
const pendingKey=()=>role?'lama_quran_pending_v1_'+String(role.schoolId||'')+'_'+
 String(role.role||'')+'_'+String(role.teacherId||role.studentId||'admin'):'';
function show(text,kind=''){
 const node=$('status');node.className=kind;node.textContent=text;
}
function setError(error){show('Unable to verify Quran records: '+(error?.message||String(error))+
 '. No new write was confirmed. Check your school connection and existing login.','error');}
function newRequestId(){
 const a=new Uint8Array(16);
 if(!globalThis.crypto?.getRandomValues)throw Error('Secure browser required for duplicate-safe lesson saving.');
 crypto.getRandomValues(a);
 return 'q'+Array.from(a,x=>x.toString(16).padStart(2,'0')).join('');
}
function readPending(){
 try{
  const d=JSON.parse(sessionStorage.getItem(pendingKey())||'null');
  if(d&&['lessons','assessments','revisions'].includes(d.kind)&&
   /^[A-Za-z0-9_-]{12,120}$/.test(d.requestId)&&d.schoolId===role.schoolId)return d;
 }catch(_){}
 return null;
}
function storePending(next){
 pending=next;
 if(next&&['lessons','assessments','revisions'].includes(next.kind))
  sessionStorage.setItem(pendingKey(),JSON.stringify({
   schoolId:role.schoolId,kind:next.kind,requestId:next.requestId
  }));
 else sessionStorage.removeItem(pendingKey());
 togglePending();
}
function togglePending(){
 $('recheck').hidden=!pending;
 $('offlineStatus').textContent=(!navigator.onLine?'Offline — writes locked; encrypted queue is not available yet':
   pending?'Unverified write pending — do not resubmit':'Online verification required for each write');
 document.querySelectorAll('form button[type=submit]').forEach(button=>button.disabled=!!pending||saveBusy||!data);
 $('recheck').disabled=loading;
}
function validLogo(v){
 const s=String(v||'');
 return /^https:\/\//i.test(s)||/^data:image\/(png|jpeg|webp);base64,/i.test(s);
}
function schoolBrand(){
 const name=String(role?.schoolName||role?.name||'LAMA School Suite');
 $('schoolName').textContent=name+' · Quran Learning Centre';
 const isLamaIslamic=/lama islamic school/i.test(name);
 $('schoolTagline').textContent=isLamaIslamic?'Modern Education with Islamic Values':'Quran, Islamic Studies & character development';
 $('schoolLocation').textContent=isLamaIslamic?'Shah Sadar Din, Dera Ghazi Khan':'LAMA · Learn • Allah • Muhammad ﷺ • Asool';
 const logo=String(role?.logo||'');
 if(validLogo(logo)){$('schoolLogo').src=logo;$('schoolLogo').hidden=false;$('masterMark').hidden=true}
 else{$('schoolLogo').hidden=true;$('masterMark').hidden=false}
 $('teacherBack').hidden=!isTeacher;
 $('studentBack').hidden=!isStudent;
 $('panel-admin').hidden=!isAdmin;
 document.querySelector('[data-panel="admin"]').hidden=!isAdmin;
 $('lessonEditor').hidden=isStudent;
 $('assessmentEditor').hidden=isStudent;
 $('revisionEditor').hidden=isStudent;
 if(isStudent){$('panel-lessons').querySelector('h2').textContent="My Quran learning";
  document.querySelector('[data-panel="lessons"]').textContent='My lessons';
  document.querySelector('[data-panel="assessments"]').textContent='My progress & revision';}
}
function accessibleProgrammes(){
 const cfg=data?.settings||{};
 return (cfg.programmes||[]).filter(p=>p!=='Hifz'||cfg.hifzEnabled)
  .filter(p=>p!=='Akhlaq'||cfg.akhlaqEnabled);
}
function opt(select,items,placeholder,mapper){
 const options=['<option value="">'+escapeText(placeholder)+'</option>'];
 for(const x of items){const mapped=mapper(x);options.push('<option value="'+escapeText(mapped.value)+'">'+escapeText(mapped.label)+'</option>')}
 select.innerHTML=options.join('');
}
function refreshForms(){
 const records=data.records||{},enroll=records.enrollments||[];
 const students=data.students||[];
 const programmeOptions=accessibleProgrammes();
 const current=Object.fromEntries(['lessonStudent','assessmentStudent','revisionStudent','reportStudent',
  'enrollStudent','enrollTeacher','assignTeacher','assignProgramme','enrollProgramme'].map(k=>[k,$(k).value]));
 for(const name of ['lessonStudent','assessmentStudent','revisionStudent','reportStudent'])
  opt($(name),students,name==='reportStudent'?'All students':'Choose enrolled student',
   s=>({value:s.id,label:s.name+' · '+s.class+(s.section?' / '+s.section:'')}));
 opt($('enrollStudent'),studentRoster,'Choose existing registered student',
   s=>({value:s.id,label:s.name+' · '+s.class+(s.enrlNo?' (#'+s.enrlNo+')':'')}));
 opt($('assignTeacher'),teacherRoster,'Choose existing teacher',
   t=>({value:t.id,label:t.name+' · '+t.assignedClass}));
 opt($('enrollTeacher'),teacherRoster,'Choose teacher',
   t=>({value:t.id,label:t.name+' · '+t.assignedClass}));
 for(const key of ['assignProgramme','enrollProgramme'])
  opt($(key),programmeOptions,'Choose programme',x=>({value:x,label:subjectName[x]||x}));
 for(const key of Object.keys(current))if([...$(key).options].some(o=>o.value===current[key]))$(key).value=current[key];
 for(const row of [
  ['lessonStudent','lessonProgramme'],
  ['assessmentStudent','assessmentProgramme'],
  ['revisionStudent','revisionProgramme']
 ]){
  const [studentIdKey,progKey]=row,studentId=$(studentIdKey).value,prior=$(progKey).value;
  const own=enroll.filter(e=>e.status==='Active'&&e.studentId===studentId);
  opt($(progKey),own,'Choose enrolled programme',e=>({value:e.programme,label:subjectName[e.programme]||e.programme}));
  if([...$(progKey).options].some(o=>o.value===prior))$(progKey).value=prior;
  else if(own.length===1)$(progKey).value=own[0].programme;
 }
 $('enableHifz').checked=!!data.settings?.hifzEnabled;
 $('enableAkhlaq').checked=!!data.settings?.akhlaqEnabled;
 if($('assignTeacher').value)assignmentTeacherChanged();
}
function table(container,headers,rows){
 container.replaceChildren();
 if(!rows.length){const p=document.createElement('p');p.className='muted';p.textContent='No authorised records found.';container.append(p);return}
 const wrapper=document.createElement('div');wrapper.className='table-wrap';
 const t=document.createElement('table'),head=document.createElement('tr');
 for(const h of headers){const cell=document.createElement('th');cell.textContent=h;head.append(cell)}
 const thead=document.createElement('thead');thead.append(head);t.append(thead);
 const tb=document.createElement('tbody');
 for(const r of rows){const tr=document.createElement('tr');for(const value of r){
  const td=document.createElement('td');td.textContent=String(value??'—');tr.append(td)}tb.append(tr)}
 t.append(tb);wrapper.append(t);container.append(wrapper);
}
function renderData(){
 if(!data)return;
 const m=data.programmes||{},attendance=data.attendanceToday||{};
 const stats=[
  ['Enrolled learners',data.learners||0],
  ['Qaida',m.Qaida||0],['Nazra',m.Nazra||0],['Hifz',m.Hifz||0],
  ['Quran lessons today',data.lessonsToday||0],
  ['Quran attendance today',String(attendance.present||0)+' present'],
  ['Revision assignments pending',data.revisionRequired||0]
 ];
 $('stats').innerHTML=stats.map(([label,v])=>
  '<div class="stat"><small>'+escapeText(label)+'</small><strong>'+escapeText(v)+'</strong></div>').join('');
 $('statNote').textContent='Verified school-scoped Quran records · '+today()+
  ' · Assessments are qualitative, not automatic recitation judgments.';
 const monthly=data.monthlyProgress||{};
 table($('monthlyProgress'),['Class / section','Learners','Monthly lessons recorded','Programmes'],
  (monthly.classProgress||[]).map(c=>[
   c.className,c.learners,c.recordedLessons,(c.programmes||[]).map(p=>subjectName[p]||p).join(', ')]));
 const activity=data.teacherActivity||[];
 if(isStudent){$('teacherActivity').textContent='Teacher activity is available to authorised school staff.'}
 else table($('teacherActivity'),['Quran teacher','Monthly recorded lessons','Learners with lessons','Revision assignments'],
   activity.map(x=>[teacherRoster.find(t=>t.id===x.teacherId)?.name||x.teacherId,
    x.recordedLessons,x.learnersWithLessons,x.revisionAssigned]));
 const lookup=Object.fromEntries((data.students||[]).map(s=>[s.id,s]));
 const enrolled=data.records.enrollments||[];
 table($('learnerList'),['Student','Class','Programme','Current level','Quran teacher'],
  enrolled.map(e=>{const st=lookup[e.studentId]||{};
   return [st.name||e.studentId,(st.class||'')+(st.section?' / '+st.section:''),
    subjectName[e.programme]||e.programme,e.level||'—',e.teacherId||'—']} ));
 const lessons=data.records.lessons||[];
 table($('lessonHistory'),['Date','Student','Programme','Lesson / Sabaq','Attendance','Revision / Parent note'],
  lessons.slice().reverse().slice(0,70).map(l=>[l.date,lookup[l.studentId]?.name||l.studentId,
   subjectName[l.programme]||l.programme,l.lesson||l.sabaq||'—',l.attendance,l.revision||l.parentNote||'—']));
 const assessments=data.records.assessments||[],revisions=data.records.revisions||[];
 table($('assessmentHistory'),['Type','Date','Student','Programme','Topic','Level / Status'],
  [...assessments.map(a=>['Assessment',a.date,lookup[a.studentId]?.name||a.studentId,a.programme,a.skill,a.level]),
   ...revisions.map(r=>['Revision',r.date,lookup[r.studentId]?.name||r.studentId,r.programme,r.target,r.status])]
   .sort((a,b)=>String(b[1]).localeCompare(String(a[1]))).slice(0,100));
 table($('assignmentList'),['Teacher','Class','Programme','Group','Status'],
  (data.records.assignments||[]).map(a=>[
   teacherRoster.find(t=>t.id===a.teacherId)?.name||a.teacherId,
   a.class+(a.section?' / '+a.section:''),subjectName[a.programme]||a.programme,
   a.groupName||'—',a.status]));
 refreshForms();
 renderReport();
}
async function reload(){
 if(loading)return;
 loading=true;togglePending();$('reload').disabled=true;
 try{
  if(!role?.schoolId||!['school','teacher','student'].includes(role.role))
   throw Error('Please sign in using your existing School Suite account.');
  if(!navigator.onLine)throw Error('No internet connection. Existing saved data was not fetched.');
  const result=await LamaAPI.quranBootstrap(today());
  if(!result?.records||!result.settings)throw Error('Quran backend returned an invalid response');
  data=result;
  if(isAdmin){
   const others=await Promise.all([LamaAPI.list('teachers'),LamaAPI.list('students')]);
   if(!Array.isArray(others[0])||!Array.isArray(others[1]))throw Error('Existing school staff/student roster unavailable');
   teacherRoster=others[0].filter(x=>x.id&&String(x.status||'Active')==='Active');
   studentRoster=others[1].filter(x=>x.id);
  }
  renderData();
  show('Quran records loaded from the School Suite backend for '+(role.schoolName||role.schoolId)+
   '. No records were changed.','success');
  if(pending)await recheckPending();
 }catch(error){data=null;setError(error)}
 finally{loading=false;$('reload').disabled=false;togglePending()}
}
function assignmentTeacherChanged(){
 const t=teacherRoster.find(x=>x.id===$('assignTeacher').value);
 $('assignClass').value=t?.assignedClass||'';
 $('assignSection').value=t?.assignedSection||'';
}
async function recheckPending(){
 if(!pending)return;
 try{
  if(!navigator.onLine)throw Error('Network is offline');
  const latest=await LamaAPI.quranBootstrap(today());
  const rows=latest.records?.[pending.kind];
  if(!Array.isArray(rows))throw Error('Backend did not return the expected Quran table');
  const match=rows.filter(r=>r.requestId===pending.requestId);
  if(match.length!==1){
   show('Quran save still unverified ('+match.length+' matching request records). No second save was sent. Keep the reference and ask the school administrator to inspect the original Quran register.','error');
   return;
  }
  if(match[0].studentId && isTeacher &&
    !(latest.records.enrollments||[]).some(e=>e.studentId===match[0].studentId&&e.programme===match[0].programme))
    throw Error('Student scope changed; verify with school administrator');
  const confirmedKind=pending.kind;
  data=latest;storePending(null);renderData();
  show('✓ Quran '+confirmedKind+' entry verified in the school database. No duplicate request was sent.','success');
 }catch(error){show('Read-only verification failed: '+error.message+'. Do not submit again.','error')}
}
async function write(kind,record,form){
 if(saveBusy||pending)return show('A previous save is not yet verified. Recheck before another write.','error');
 if(!navigator.onLine)return show('Offline entries are not enabled without secure encryption and conflict-safe sync. No data were sent.','error');
 if(!data)return show('Load verified Quran records first.','error');
 saveBusy=true;const requestId=['lessons','assessments','revisions'].includes(kind)?newRequestId():'';
 if(requestId){record.requestId=requestId;storePending({kind,requestId,schoolId:role.schoolId})}
 else togglePending();
 try{
  const options=kind==='settings'?{expectedVersion:data.settings?.version||0}:{};
  const saved=await LamaAPI.quranSave(kind,record,options);
  if(!saved?.id)throw Error('Missing verified Quran record ID');
  const latest=await LamaAPI.quranBootstrap(today());
  const matching=(latest.records?.[kind]||[]).filter(r=>r.id===saved.id&&Number(r.version)===Number(saved.version));
  if(matching.length!==1)throw Error('Write accepted, but independent Quran record readback was not verified');
  data=latest;storePending(null);renderData();
  if(form&&kind!=='settings')form.reset();
  if(form&&kind!=='settings')for(const node of form.querySelectorAll('input[type=date]'))node.value=today();
  show('✓ '+kind+' record confirmed in your existing school database.','success');
 }catch(error){
  show('Save NOT verified: '+error.message+
   '. Do not submit again. Refresh or use read-only Recheck before retrying.','error');
 }finally{saveBusy=false;togglePending()}
}
function renderReport(){
 if(!data)return;
 const preview=$('reportPreview');preview.replaceChildren();
 const brand=document.createElement('div');brand.className='report-header';
 if(!$('schoolLogo').hidden){const img=document.createElement('img');img.src=$('schoolLogo').src;img.alt='School logo';brand.append(img)}
 const head=document.createElement('div');const school=document.createElement('h2');
 school.textContent=role.schoolName||role.name||'Registered School';
 const location=document.createElement('div');location.className='report-sub';
 location.textContent=/lama islamic school/i.test(school.textContent)?
  'Shah Sadar Din, Dera Ghazi Khan · Modern Education with Islamic Values':
  'LAMA School Suite • Quran & Islamic Learning Centre';
 head.append(school,location);brand.append(head);preview.append(brand);
 const selectedKind=$('reportKind').value,studentId=$('reportStudent').value;
 const title=document.createElement('h2');title.textContent={
  daily:'Daily Quran Lesson Register',student:'Student Quran Progress Card',
  monthly:'Monthly Quran Assessment',hifz:'Hifz Learning Progress',
  revision:'Revision Assignments',parent:'Parent Quran Progress Report'
 }[selectedKind]||'Quran Report';preview.append(title);
 const subtitle=document.createElement('p');subtitle.className='report-sub';
 subtitle.textContent='Report generated '+today()+' · Teacher reviewed learning records · No automated Quran recitation grades';
 preview.append(subtitle);
 const lookup=Object.fromEntries((data.students||[]).map(s=>[s.id,s]));
 const lessons=(data.records.lessons||[]).filter(r=>!studentId||r.studentId===studentId);
 const assessments=(data.records.assessments||[]).filter(r=>!studentId||r.studentId===studentId);
 const revisions=(data.records.revisions||[]).filter(r=>!studentId||r.studentId===studentId);
 let headers=[],rows=[];
 if(selectedKind==='hifz'){
  headers=['Date','Learner','Sabaq','Sabqi','Manzil','Revision'];
  rows=lessons.filter(l=>l.programme==='Hifz').map(l=>[
   l.date,lookup[l.studentId]?.name||l.studentId,l.sabaq,l.sabqi,l.manzil,l.revision]);
 }else if(selectedKind==='revision'){
  headers=['Student','Programme','Assigned','Due','Revision','Status'];
  rows=revisions.map(r=>[lookup[r.studentId]?.name||r.studentId,
   r.programme,r.date,r.dueDate,r.target,r.status]);
 }else if(selectedKind==='monthly'){
  headers=['Date','Learner','Programme','Skill','Teacher assessment','Parent comment'];
  rows=assessments.filter(r=>r.date.slice(0,7)===today().slice(0,7)).map(r=>[
   r.date,lookup[r.studentId]?.name||r.studentId,r.programme,r.skill,r.level,r.parentNote]);
 }else{
  headers=['Date','Learner','Programme','Lesson / Surah','Quran attendance','Revision / parent feedback'];
  rows=lessons.filter(l=>selectedKind!=='daily'||l.date===today()).map(l=>[
   l.date,lookup[l.studentId]?.name||l.studentId,l.programme,
   [l.lesson,l.surah].filter(Boolean).join(' · '),l.attendance,
   l.parentNote||l.revision]);
 }
 if(!rows.length){const n=document.createElement('p');n.textContent='No verified records for this report selection.';preview.append(n);return}
 const reportTable=document.createElement('div');preview.append(reportTable);
 table(reportTable,headers,rows);
 const foot=document.createElement('p');foot.className='report-sub';
 foot.textContent='Teacher signature: __________________  Parent acknowledgment: __________________';
 preview.append(foot);
}
function bind(){
 schoolBrand();
 $('lessonDate').value=today();$('assessmentDate').value=today();
 $('revisionDate').value=today();$('revisionDue').value=today();
 for(const b of document.querySelectorAll('.tab')){
  b.addEventListener('click',()=>{
   currentPanel=b.dataset.panel;
   for(const x of document.querySelectorAll('.tab'))x.setAttribute('aria-selected',String(x===b));
   for(const p of document.querySelectorAll('.panel'))p.hidden=p.id!=='panel-'+currentPanel;
  });
 }
 $('reload').onclick=reload;
 $('recheck').onclick=recheckPending;
 for(const [student,programme] of [['lessonStudent','lessonProgramme'],
  ['assessmentStudent','assessmentProgramme'],['revisionStudent','revisionProgramme']])
  $(student).addEventListener('change',()=>{
   const prior=$(programme).value;
   const enrol=(data?.records.enrollments||[]).filter(e=>e.studentId===$(student).value&&e.status==='Active');
   opt($(programme),enrol,'Choose programme',e=>({value:e.programme,label:subjectName[e.programme]||e.programme}));
   if([...$(programme).options].some(o=>o.value===prior))$(programme).value=prior;
   else if(enrol.length===1)$(programme).value=enrol[0].programme;
  });
 $('assignTeacher').onchange=assignmentTeacherChanged;
 $('settingsForm').onsubmit=async e=>{e.preventDefault();
  const h=$('enableHifz').checked,a=$('enableAkhlaq').checked;
  await write('settings',{programmes:['Qaida','Nazra','IslamicStudies',...(h?['Hifz']:[]),...(a?['Akhlaq']:[])],
   hifzEnabled:h,akhlaqEnabled:a},null);
 };
 $('assignmentForm').onsubmit=async e=>{e.preventDefault();await write('assignments',{
  teacherId:$('assignTeacher').value,programme:$('assignProgramme').value,
  class:$('assignClass').value,section:$('assignSection').value,
  groupName:$('assignGroup').value,status:'Active'},$('assignmentForm'))};
 $('enrollmentForm').onsubmit=async e=>{e.preventDefault();await write('enrollments',{
  studentId:$('enrollStudent').value,programme:$('enrollProgramme').value,
  teacherId:$('enrollTeacher').value,level:$('enrollLevel').value,status:'Active'},$('enrollmentForm'))};
 $('lessonForm').onsubmit=async e=>{e.preventDefault();await write('lessons',{
  studentId:$('lessonStudent').value,programme:$('lessonProgramme').value,date:$('lessonDate').value,
  attendance:$('lessonAttendance').value,lesson:$('lessonTitle').value,
  surah:$('lessonSurah').value,juz:$('lessonJuz').value,
  ayahFrom:$('lessonAyahFrom').value,ayahTo:$('lessonAyahTo').value,
  sabaq:$('lessonSabaq').value,sabqi:$('lessonSabqi').value,manzil:$('lessonManzil').value,
  mistakes:$('lessonMistakes').value,revision:$('lessonRevision').value,
  parentNote:$('lessonParent').value},$('lessonForm'))};
 $('assessmentForm').onsubmit=async e=>{e.preventDefault();await write('assessments',{
  studentId:$('assessmentStudent').value,programme:$('assessmentProgramme').value,date:$('assessmentDate').value,
  skill:$('assessmentSkill').value,level:$('assessmentLevel').value,
  notes:$('assessmentNotes').value,parentNote:$('assessmentParent').value},$('assessmentForm'))};
 $('revisionForm').onsubmit=async e=>{e.preventDefault();await write('revisions',{
  studentId:$('revisionStudent').value,programme:$('revisionProgramme').value,date:$('revisionDate').value,
  dueDate:$('revisionDue').value,target:$('revisionTarget').value,
  parentNote:$('revisionParent').value,status:'Assigned'},$('revisionForm'))};
 for(const k of ['reportKind','reportStudent'])$(k).onchange=renderReport;
 $('printReport').onclick=()=>{
  if(!data)return show('Load verified Quran records before printing.','error');
  document.body.classList.toggle('print-a5',$('reportPaper').value==='a5');
  const old=document.getElementById('dynamicQuranPaper');if(old)old.remove();
  const css=document.createElement('style');css.id='dynamicQuranPaper';
  css.textContent=$('reportPaper').value==='a5'?'@page {size:A5;margin:9mm}':'@page {size:A4;margin:12mm}';
  document.head.append(css);window.print();
 };
 window.addEventListener('online',togglePending);
 window.addEventListener('offline',togglePending);
 pending=readPending();
 togglePending();
 reload();
}
bind();