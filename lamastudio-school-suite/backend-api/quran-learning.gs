/**
 * LAMA Quran & Islamic Learning Centre — additive Google Apps Script module.
 * Same school spreadsheet, same school/teacher/student credentials, existing Student IDs.
 * NOT installed into any production Apps Script deployment by this GitHub commit.
 *
 * All entry points go through quranDispatch_ -> resolveContext -> module grant.
 * Never expose these tabs through the generic list/add/update collections.
 */
var LAMA_QURAN_TABLES_ = {
  settings:['id','programmesJson','hifzEnabled','akhlaqEnabled','version','updatedAt'],
  assignments:['id','teacherId','programme','class','section','groupName','status','version','createdAt','updatedAt'],
  enrollments:['id','studentId','programme','teacherId','level','status','version','createdAt','updatedAt'],
  lessons:['id','studentId','programme','date','lesson','surah','ayahFrom','ayahTo','juz','sabaq','sabqi','manzil','mistakes','revision','attendance','teacherRemarks','parentNote','teacherId','requestId','version','createdAt','updatedAt'],
  assessments:['id','studentId','programme','date','skill','level','notes','parentNote','teacherId','requestId','version','createdAt','updatedAt'],
  revisions:['id','studentId','programme','date','target','dueDate','status','teacherId','parentNote','requestId','version','createdAt','updatedAt'],
  timetable:['id','class','section','teacherId','programme','day','start','end','version','createdAt','updatedAt'],
  audit:['id','date','actorId','actorRole','operation','table','recordId','beforeJson','afterJson']
};
var LAMA_QURAN_TABS_ = {
  settings:'QuranSettings',assignments:'QuranTeacherAssignments',
  enrollments:'QuranEnrollments',lessons:'QuranLessons',
  assessments:'QuranAssessments',revisions:'QuranRevisions',
  timetable:'QuranTimetable',audit:'QuranAudit'
};
var LAMA_QURAN_PROGRAMMES_=['Qaida','Nazra','Hifz','IslamicStudies','Akhlaq'];
var LAMA_QURAN_LEVELS_=['Excellent','Good','Developing','Needs Support'];

function quranRequire_(p,operation) {
  if(!p||!p.schoolId||!['school','teacher','student'].includes(p.role))
    throw Error('Valid School Suite session required');
  // resolveContext verifies the actual school and teacher/student credentials.
  var ctx=resolveContext(p);
  if(String(ctx.schoolId)!==String(p.schoolId))throw Error('School mismatch');
  // Deny by default when the entitlement adapter has not been installed.
  if(typeof lamaRequireModuleForVerifiedSchool_!=='function')
    throw Error('Quran module entitlement service is not available');
  lamaRequireModuleForVerifiedSchool_(String(ctx.schoolId),'quranLearning');
  if(ctx.role==='school'){
    // A normal school login alone may not authorize school administrator writes.
    var actor=verifySchoolAdminToken(p);
    if(!actor||!actor.id)throw Error('Verified School Administrator required');
    ctx.auditActor=actor;
  }
  if(operation==='write'){
    if(ctx.role==='student')throw Error('Students cannot change Quran learning records');
    assertSchoolWritable(ctx.schoolId);
  }
  return ctx;
}
function quranTab_(ctx,kind,create) {
  var headers=LAMA_QURAN_TABLES_[kind],tab=LAMA_QURAN_TABS_[kind];
  if(!headers||!tab)throw Error('Unknown Quran table');
  var sheet=ctx.ss.getSheetByName(tab);
  if(!sheet&&create){
    sheet=ctx.ss.insertSheet(tab);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  if(!sheet)return {sheet:null,headers:headers};
  var actual=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  // Do not silently overwrite tables that were manually changed.
  if(actual.length!==headers.length||actual.some(function(h,i){return h!==headers[i]}))
    throw Error(tab+' schema requires administrator review; no record changed');
  return {sheet:sheet,headers:headers};
}
function quranRows_(ctx,kind) {
  var t=quranTab_(ctx,kind,false);
  if(!t.sheet)return [];
  return t.sheet.getDataRange().getValues().slice(1)
    .filter(function(r){return r[0]})
    .map(function(r){return rowToRecord(t.headers,r)});
}
function quranStudent_(ctx,id) {
  var t=getCollectionSheet(ctx,'students');
  var rows=t.sheet.getDataRange().getValues().slice(1);
  var matches=rows.map(function(r){return rowToRecord(t.headers,r)})
    .filter(function(r){return String(r.id)===String(id)});
  if(matches.length!==1)throw Error('Existing student ID not found or duplicated');
  return matches[0];
}
function quranTeacher_(ctx,id) {
  var t=getCollectionSheet(ctx,'teachers');
  var rows=t.sheet.getDataRange().getValues().slice(1);
  var matches=rows.map(function(r){return rowToRecord(t.headers,r)})
    .filter(function(r){return String(r.id)===String(id)&&String(r.status||'Active')==='Active'});
  if(matches.length!==1)throw Error('Active Quran teacher not found');
  return matches[0];
}
function quranSettings_(ctx) {
  var rows=quranRows_(ctx,'settings');
  if(rows.length>1)throw Error('Conflicting Quran school settings; administrator review required');
  if(!rows.length)return {programmes:['Qaida','Nazra','IslamicStudies'],hifzEnabled:false,akhlaqEnabled:false,version:0};
  var row=rows[0],programmes;
  try{programmes=JSON.parse(String(row.programmesJson||'[]'))}catch(_){throw Error('Invalid Quran programme configuration')}
  if(!Array.isArray(programmes)||programmes.some(function(p){return LAMA_QURAN_PROGRAMMES_.indexOf(p)<0}))
    throw Error('Invalid Quran programme configuration');
  return {programmes:programmes,hifzEnabled:String(row.hifzEnabled)==='true',
    akhlaqEnabled:String(row.akhlaqEnabled)==='true',version:Number(row.version)||0};
}
function quranProgrammeAllowed_(settings,programme) {
  if(LAMA_QURAN_PROGRAMMES_.indexOf(programme)<0 || settings.programmes.indexOf(programme)<0)
    throw Error('Programme is not enabled by this school');
  if(programme==='Hifz'&&!settings.hifzEnabled)throw Error('Hifz is not enabled');
  if(programme==='Akhlaq'&&!settings.akhlaqEnabled)throw Error('Akhlaq is not enabled');
}
function quranClean_(value,max) {
  var text=String(value==null?'':value).trim();
  if(text.length>(max||300))throw Error('Input too long');
  return text;
}
function quranDate_(value) {
  var day=String(value||'').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day) ||
     !Number.isFinite(Date.parse(day+'T12:00:00Z')) ||
     new Date(day+'T12:00:00Z').toISOString().slice(0,10)!==day)
    throw Error('Invalid lesson date');
  return day;
}
function quranTeacherOwns_(ctx,student,programme,teacherId) {
  if(ctx.role==='school')return true;
  if(ctx.role!=='teacher'||String(ctx.teacher.id)!==String(teacherId))return false;
  // Existing class/section scope always applies: group assignment cannot bypass it.
  if(!teacherOwns(ctx,student))return false;
  return quranRows_(ctx,'assignments').some(function(a){
    return a.teacherId===ctx.teacher.id && a.programme===programme &&
      a.status==='Active' && sameClass(a.class,student.class) &&
      (!a.section||sameClass(a.section,student.section));
  });
}
function quranEnrollment_(ctx,studentId,programme) {
  var found=quranRows_(ctx,'enrollments').filter(function(r){
    return String(r.studentId)===String(studentId)&&r.programme===programme&&r.status==='Active'
  });
  if(found.length>1)throw Error('Duplicate active Quran enrolment; administrator review required');
  if(found.length!==1)throw Error('Student is not enrolled in that Quran programme');
  return found[0];
}
function quranAudit_(ctx,kind,recordId,before,after) {
  var t=quranTab_(ctx,'audit',true);
  var now=new Date().toISOString();
  var actor=ctx.role==='school'?ctx.auditActor.id:ctx.teacher.id;
  // Do not store passwords, API keys, student photos or unrelated student details.
  var row={id:genId('qau'),date:now,actorId:actor,actorRole:ctx.role,
    operation:before?'update':'add',table:kind,recordId:recordId,
    beforeJson:before?JSON.stringify(before).slice(0,6000):'',
    afterJson:JSON.stringify(after).slice(0,6000)};
  t.sheet.appendRow(recordToRow(t.headers,row));
}
function quranLockWrite_(ctx,kind,operation,payload,expectedVersion) {
  var lock=LockService.getScriptLock();
  if(!lock.tryLock(20000))throw Error('Quran register busy; refresh before another attempt');
  try{
    var info=quranTab_(ctx,kind,true),sheet=info.sheet,rows=sheet.getDataRange().getValues();
    var source=rows.slice(1).map(function(r,i){return {r:r,item:rowToRecord(info.headers,r),index:i+2}}).filter(function(x){return x.item.id});
    var found=operation.id?source.filter(function(x){return String(x.item.id)===String(operation.id)}):[];
    if(found.length>1)throw Error('Duplicate Quran record ID; no changes made');
    var old=found.length?found[0].item:null;
    if(operation.id&&!old)throw Error('Quran record changed or missing; refresh');
    if(old&&Number(old.version)!==Number(expectedVersion))
      throw Error('Quran edit conflict: someone changed this record. Refresh before correcting.');
    var next=Object.assign({},old||{},payload,{
      id:old?old.id:genId('q'+kind.slice(0,2)),
      version:old?Number(old.version)+1:1,
      createdAt:old?old.createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    });
    if(old)sheet.getRange(found[0].index,1,1,info.headers.length).setValues([recordToRow(info.headers,next)]);
    else sheet.appendRow(recordToRow(info.headers,next));
    SpreadsheetApp.flush();
    quranAudit_(ctx,kind,next.id,old,next);
    return next;
  }finally{lock.releaseLock()}
}
function quranSave_(ctx,p) {
  if(ctx.role==='student')throw Error('Read-only student portal');
  var kind=String(p.kind||''),body=p.record||{},settings=quranSettings_(ctx);
  if(!body||typeof body!=='object'||Array.isArray(body))throw Error('Invalid Quran record');
  if(!['settings','assignments','enrollments','lessons','assessments','revisions','timetable'].includes(kind))
    throw Error('Unsupported Quran operation');
  if(ctx.role!=='school'&&['settings','assignments','enrollments','timetable'].includes(kind))
    throw Error('Only School Administrator may configure Quran learning');
  var student=null,programme=quranClean_(body.programme,40);
  if(kind!=='settings')quranProgrammeAllowed_(settings,programme);
  if(['enrollments','lessons','assessments','revisions'].includes(kind)){
    student=quranStudent_(ctx,quranClean_(body.studentId,120));
  }
  if(['lessons','assessments','revisions'].includes(kind)){
    var enrolled=quranEnrollment_(ctx,student.id,programme);
    if(!quranTeacherOwns_(ctx,student,programme,enrolled.teacherId))
      throw Error('Student outside your assigned Quran class or group');
  }
  var clean={};
  if(kind==='settings'){
    var programmes=body.programmes;
    if(!Array.isArray(programmes)||!programmes.length||
       programmes.some(function(x){return LAMA_QURAN_PROGRAMMES_.indexOf(x)<0}))
      throw Error('Select valid Quran programmes');
    clean={id:'settings',programmesJson:JSON.stringify([...new Set(programmes)]),
      hifzEnabled:body.hifzEnabled===true,akhlaqEnabled:body.akhlaqEnabled===true};
    var existingSettings=quranRows_(ctx,'settings');
    if(existingSettings.length>1)throw Error('Conflicting Quran settings');
    return quranLockWrite_(ctx,kind,{id:existingSettings[0]?.id||''},clean,p.expectedVersion||0);
  }
  if(kind==='assignments'){
    var teacher=quranTeacher_(ctx,quranClean_(body.teacherId,120));
    var cls=quranClean_(body.class,100),section=quranClean_(body.section,80);
    if(!cls||!teacher.assignedClass||!sameClass(cls,teacher.assignedClass)||
      (teacher.assignedSection&&!sameClass(section,teacher.assignedSection)))
      throw Error('Quran group must match the teacher existing class/section');
    clean={teacherId:teacher.id,programme,class:cls,section:section,
      groupName:quranClean_(body.groupName,100),status:body.status==='Inactive'?'Inactive':'Active'};
  }
  if(kind==='enrollments'){
    var assigned=quranTeacher_(ctx,quranClean_(body.teacherId,120));
    if(!sameClass(student.class,assigned.assignedClass)||
       (assigned.assignedSection&&!sameClass(student.section,assigned.assignedSection)))
      throw Error('Student and assigned Quran teacher class do not match');
    var assignments=quranRows_(ctx,'assignments');
    if(!assignments.some(function(a){return a.teacherId===assigned.id &&
       a.programme===programme && a.status==='Active' &&
       sameClass(a.class,student.class)&&(!a.section||sameClass(a.section,student.section))}))
      throw Error('Quran teacher assignment must be saved before student enrolment');
    var prior=quranRows_(ctx,'enrollments').filter(function(r){return r.studentId===student.id&&r.programme===programme&&r.status==='Active'});
    if(prior.length>1)throw Error('Duplicate Quran enrolments: review before changes');
    if(prior.length && String(prior[0].id)!==String(p.id||''))
      throw Error('Student is already enrolled in this programme; edit the existing enrolment');
    clean={studentId:student.id,programme,teacherId:assigned.id,
      level:quranClean_(body.level,100),status:body.status==='Inactive'?'Inactive':'Active'};
  }
  if(['lessons','assessments','revisions'].includes(kind)){
    var when=quranDate_(body.date),teacherId=ctx.role==='teacher'?ctx.teacher.id:
      quranClean_(body.teacherId||quranEnrollment_(ctx,student.id,programme).teacherId,120);
    var enrolledTeacher=quranEnrollment_(ctx,student.id,programme).teacherId;
    if(String(teacherId)!==String(enrolledTeacher))throw Error('Wrong Quran teacher for enrolment');
    var requestId=quranClean_(body.requestId,120);
    if(!/^[A-Za-z0-9_-]{12,120}$/.test(requestId))
      throw Error('Unique request ID required to prevent duplicate saves');
    clean={studentId:student.id,programme,date:when,teacherId,requestId};
    if(kind==='lessons'){
      if(!['Present','Absent','Leave'].includes(body.attendance))throw Error('Choose Quran lesson attendance');
      clean=Object.assign(clean,{
        lesson:quranClean_(body.lesson,200),surah:quranClean_(body.surah,100),
        ayahFrom:quranClean_(body.ayahFrom,30),ayahTo:quranClean_(body.ayahTo,30),
        juz:quranClean_(body.juz,30),sabaq:quranClean_(body.sabaq,200),
        sabqi:quranClean_(body.sabqi,200),manzil:quranClean_(body.manzil,200),
        mistakes:quranClean_(body.mistakes,750),revision:quranClean_(body.revision,500),
        attendance:body.attendance,teacherRemarks:quranClean_(body.teacherRemarks,750),
        parentNote:quranClean_(body.parentNote,500)});
      if(!clean.lesson&&!clean.sabaq&&!clean.sabqi&&!clean.manzil)
        throw Error('Enter a Quran lesson or memorization target');
    }else if(kind==='assessments'){
      if(!['Pronunciation','Makharij','Tajweed','Reading fluency','Memorization','Revision','Islamic understanding'].includes(body.skill))
        throw Error('Invalid Quran assessment skill');
      if(LAMA_QURAN_LEVELS_.indexOf(body.level)<0)throw Error('Use a descriptive assessment level');
      clean=Object.assign(clean,{skill:body.skill,level:body.level,
        notes:quranClean_(body.notes,700),parentNote:quranClean_(body.parentNote,500)});
    }else clean=Object.assign(clean,{target:quranClean_(body.target,400),
      dueDate:body.dueDate?quranDate_(body.dueDate):'',
      status:['Assigned','Completed','Needs Revision'].includes(body.status)?body.status:'Assigned',
      parentNote:quranClean_(body.parentNote,500)});
    // Idempotency applies across both new saves and retries after lost ACK.
    var previous=quranRows_(ctx,kind).filter(function(r){return r.requestId===requestId});
    if(previous.length>1)throw Error('Duplicate Quran request IDs; manual review required');
    if(previous.length){
      var exact=Object.keys(clean).every(function(key){
        return String(previous[0][key]??'')===String(clean[key]??'')
      });
      if(!exact)throw Error('Request ID already used for different Quran data');
      return previous[0];
    }
  }
  if(kind==='timetable'){
    var teacherTime=quranTeacher_(ctx,quranClean_(body.teacherId,120));
    var day=quranClean_(body.day,20),start=quranClean_(body.start,5),end=quranClean_(body.end,5);
    var cls2=quranClean_(body.class,100),sec2=quranClean_(body.section,80);
    if(!['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].includes(day)||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)||start>=end)
      throw Error('Valid Quran timetable day and times required');
    if(!sameClass(teacherTime.assignedClass,cls2)||
      (teacherTime.assignedSection&&!sameClass(teacherTime.assignedSection,sec2)))
      throw Error('Quran teacher must be assigned to that class');
    var clashes=quranRows_(ctx,'timetable').filter(function(row){
      return row.id!==String(p.id||'') && row.day===day&&start<row.end&&end>row.start &&
       (row.teacherId===teacherTime.id||(sameClass(row.class,cls2)&&sameClass(row.section||'',sec2||'')))
    });
    if(clashes.length)throw Error('Quran timetable teacher/class conflict');
    clean={teacherId:teacherTime.id,programme,day,start,end,class:cls2,section:sec2};
    // Existing school-wide timetable conflict integration is a release gate.
  }
  return quranLockWrite_(ctx,kind,{id:p.id||''},clean,p.expectedVersion||0);
}
function quranVisible_(ctx,kind,rows) {
  if(ctx.role==='school')return rows;
  if(ctx.role==='student'){
    if(['assignments','settings','timetable'].includes(kind))return [];
    return rows.filter(function(r){return String(r.studentId)===String(ctx.student.id)});
  }
  var enroll=quranRows_(ctx,'enrollments');
  var allowed={};
  enroll.forEach(function(e){
    if(e.status!=='Active'||e.teacherId!==ctx.teacher.id)return;
    var student=quranStudent_(ctx,e.studentId);
    if(quranTeacherOwns_(ctx,student,e.programme,e.teacherId))
      allowed[e.studentId+'|'+e.programme]=true;
  });
  if(kind==='assignments'||kind==='timetable')
    return rows.filter(function(r){return r.teacherId===ctx.teacher.id});
  return rows.filter(function(r){return !!allowed[r.studentId+'|'+r.programme]});
}
function quranView_(ctx,params) {
  var cfg=quranSettings_(ctx),all={};
  for(var kind of ['assignments','enrollments','lessons','assessments','revisions','timetable']){
    all[kind]=quranVisible_(ctx,kind,quranRows_(ctx,kind));
  }
  var studentRows={};
  for(var e of all.enrollments){
    var st=quranStudent_(ctx,e.studentId);
    studentRows[e.studentId]={id:st.id,name:st.name,class:st.class,section:st.section||'',photo:st.photo||''};
  }
  // Parent/student views receive only explicitly parent-visible learning notes.
  if(ctx.role==='student'){
    all.lessons=all.lessons.map(function(row){
      return {id:row.id,studentId:row.studentId,programme:row.programme,date:row.date,
        lesson:row.lesson,surah:row.surah,ayahFrom:row.ayahFrom,ayahTo:row.ayahTo,
        juz:row.juz,attendance:row.attendance,parentNote:row.parentNote,
        revision:row.revision,sabaq:row.sabaq,sabqi:row.sabqi,manzil:row.manzil};
    });
    all.assessments=all.assessments.map(function(row){
      return {id:row.id,studentId:row.studentId,programme:row.programme,date:row.date,
        skill:row.skill,level:row.level,parentNote:row.parentNote};
    });
    all.revisions=all.revisions.map(function(row){
      return {id:row.id,studentId:row.studentId,programme:row.programme,
        date:row.date,target:row.target,dueDate:row.dueDate,
        status:row.status,parentNote:row.parentNote};
    });
  }
  var recentDay=String(params.date||'').trim();
  if(recentDay)quranDate_(recentDay);
  var counts={Qaida:0,Nazra:0,Hifz:0,IslamicStudies:0,Akhlaq:0};
  all.enrollments.forEach(function(e){if(e.status==='Active'&&counts[e.programme]!==undefined)counts[e.programme]++});
  var daily=recentDay?all.lessons.filter(function(l){return l.date===recentDay}):[];
  return {settings:cfg,school:{id:ctx.schoolId,role:ctx.role},
    learners:Object.keys(studentRows).length,students:Object.values(studentRows),
    programmes:counts,lessonsToday:daily.length,
    attendanceToday:{present:daily.filter(function(l){return l.attendance==='Present'}).length,
      absent:daily.filter(function(l){return l.attendance==='Absent'}).length,
      leave:daily.filter(function(l){return l.attendance==='Leave'}).length},
    revisionRequired:all.revisions.filter(function(r){return r.status!=='Completed'}).length,
    records:all};
}
function quranDispatch_(p) {
  var action=String(p.action||'');
  if(!['quranBootstrap','quranSave','quranAudit'].includes(action))throw Error('Unknown Quran operation');
  var ctx=quranRequire_(p,action==='quranSave'?'write':'read');
  if(action==='quranBootstrap')return {status:'success',data:quranView_(ctx,p)};
  if(action==='quranSave'){
    var result=quranSave_(ctx,p);
    // An acknowledged write also performs independent readback.
    var confirmed=quranRows_(ctx,p.kind).filter(function(r){return r.id===result.id});
    if(confirmed.length!==1||Number(confirmed[0].version)!==Number(result.version))
      throw Error('Quran save is not verified: DO NOT RESUBMIT. Refresh to review the school record.');
    return {status:'success',record:confirmed[0],verified:true};
  }
  if(ctx.role!=='school')throw Error('Only School Administrator may view Quran audit history');
  var rows=quranRows_(ctx,'audit');
  return {status:'success',records:rows.slice(-100).reverse()};
}
