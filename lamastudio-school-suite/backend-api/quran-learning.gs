/**
 * LAMA School Suite — Quran & Islamic Learning Centre (draft integration).
 * Loaded alongside code.gs in the EXISTING Apps Script project.
 * No separate app, login, spreadsheet, student registry or deployment.
 *
 * All Quran actions are POST, role-scoped, school-scoped and fail closed.
 * Do not expose these tables through generic COLLECTIONS/CRUD.
 */

const QURAN_TABLES_ = {
  settings: {tab:'QuranSettings',headers:['id','enabledProgramsJson','updatedAt','updatedBy']},
  groups: {tab:'QuranTeacherGroups',headers:['id','teacherId','className','section','programCode','groupName','createdAt']},
  enrollments: {tab:'QuranEnrollments',headers:['id','studentId','programCode','teacherId','level','groupName','status','version','createdAt','updatedAt']},
  attendance: {tab:'QuranAttendance',headers:['id','enrollmentId','studentId','teacherId','date','status','version','clientRequestId','createdAt','updatedAt']},
  lessons: {tab:'QuranLessons',headers:['id','enrollmentId','studentId','teacherId','programCode','date','sessionType','lessonTitle','surahNumber','ayahFrom','ayahTo','juzNumber','lessonRef','quality','mistakes','revisionRequired','revisionWork','teacherRemarks','parentFeedback','published','version','clientRequestId','createdAt','updatedAt']},
  assessments: {tab:'QuranAssessments',headers:['id','enrollmentId','studentId','teacherId','date','criterion','level','remarks','parentFeedback','published','version','clientRequestId','createdAt','updatedAt']},
  schedules: {tab:'QuranSchedules',headers:['id','teacherId','className','section','dayOfWeek','startTime','endTime','programCode','groupName','createdAt','updatedAt']},
  audit: {tab:'QuranAudit',headers:['id','timestamp','schoolId','actorId','actorRole','operation','tableName','recordId','beforeJson','afterJson']}
};
const QURAN_PROGRAMS_=['qaida','nazra','hifz','islamicStudies'];
const QURAN_QUALITY_=['Excellent','Good','Developing','Needs Support'];
const QURAN_CRITERIA_=['Pronunciation','Makharij','Tajweed','Reading fluency','Memorization accuracy','Revision performance','Islamic understanding'];
const QURAN_SESSIONS_=['lesson','sabaq','sabqi','manzil','revision'];
const QURAN_ATTENDANCE_=['Present','Absent','Leave'];
const QURAN_GRANTS_TAB_='QuranModuleGrants';
const QURAN_GRANTS_HEADERS_=['schoolId','enabled','hifzEnabled','updatedAt','approvedBy','reason'];

function quranDate_(value){
  const d=String(value||'').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d+'T12:00:00Z'))||
     new Date(d+'T12:00:00Z').toISOString().slice(0,10)!==d)throw Error('Valid school date required (YYYY-MM-DD).');
  return d;
}
function quranText_(value,limit,label){
  const text=String(value==null?'':value).trim();
  if(text.length>limit||/^[=+@]/.test(text))throw Error('Invalid '+label+'.');
  return text;
}
function quranEnum_(value,items,label){
  const text=String(value||'').trim();
  if(items.indexOf(text)<0)throw Error('Invalid '+label+'.');
  return text;
}
function quranActor_(ctx){
  return ctx.role==='school'&&ctx.auditActor?
    {id:ctx.auditActor.id,role:'schoolAdmin'}:
    ctx.role==='teacher'?{id:ctx.teacher.id,role:'teacher'}:
    {id:ctx.student&&ctx.student.id||'',role:ctx.role};
}
function quranTable_(ctx,key,create){
  const spec=QURAN_TABLES_[key];
  if(!spec)throw Error('Unknown Quran record table.');
  let sheet=ctx.ss.getSheetByName(spec.tab);
  if(!sheet){
    if(!create)return null;
    sheet=ctx.ss.insertSheet(spec.tab);
    sheet.appendRow(spec.headers);
    sheet.setFrozenRows(1);
  }else if(create){
    ensureSheetHeaders(sheet,spec.headers);
  }
  const headerCount=sheet.getLastColumn();
  if(headerCount<1)throw Error('Quran record table missing headers.');
  const headers=sheet.getRange(1,1,1,headerCount).getValues()[0];
  return {sheet,headers};
}
function quranRows_(ctx,key){
  const data=quranTable_(ctx,key,false);
  if(!data)return [];
  const dateCol=data.headers.indexOf('date');
  const zone=typeof ctx.ss.getSpreadsheetTimeZone==='function'?
    ctx.ss.getSpreadsheetTimeZone()||'Asia/Karachi':'Asia/Karachi';
  return data.sheet.getDataRange().getValues().slice(1)
    .filter(row=>row[data.headers.indexOf('id')])
    .map(row=>{
      const record=rowToRecord(data.headers,row);
      if(dateCol>=0&&row[dateCol] instanceof Date)
        record.date=Utilities.formatDate(row[dateCol],zone,'yyyy-MM-dd');
      return record;
    });
}
function quranRowIndex_(ctx,key,id){
  const data=quranTable_(ctx,key,true),values=data.sheet.getDataRange().getValues();
  const col=data.headers.indexOf('id');
  for(let i=1;i<values.length;i++)if(String(values[i][col])===String(id))
    return {data,index:i+1,record:rowToRecord(data.headers,values[i])};
  return {data,index:0,record:null};
}
function quranWrite_(ctx,key,value,existing){
  const {data,index}=existing||quranRowIndex_(ctx,key,value.id);
  if(index)data.sheet.getRange(index,1,1,data.headers.length).setValues([recordToRow(data.headers,value)]);
  else data.sheet.appendRow(recordToRow(data.headers,value));
  SpreadsheetApp.flush();
  return value;
}
function quranAudit_(ctx,operation,key,id,oldValue,newValue){
  const spec=QURAN_TABLES_.audit,table=quranTable_(ctx,'audit',true);
  const actor=quranActor_(ctx);
  const safe=value=>JSON.stringify(value||{}).slice(0,15000);
  const row={
    id:genId('qau'),timestamp:new Date().toISOString(),
    schoolId:ctx.schoolId,actorId:actor.id,actorRole:actor.role,
    operation,tableName:key,recordId:id,
    beforeJson:safe(oldValue),afterJson:safe(newValue)
  };
  table.sheet.appendRow(recordToRow(table.headers,row));
}
function quranGrant_(schoolId){
  const master=getRegistrySheet().getParent();
  const sheet=master.getSheetByName(QURAN_GRANTS_TAB_);
  if(!sheet)return {enabled:false,hifzEnabled:false};
  const data=sheet.getDataRange().getValues();
  const headers=data[0]||[];
  for(let i=1;i<data.length;i++){
    const row=rowToRecord(headers,data[i]);
    if(String(row.schoolId)===String(schoolId))return {
      enabled:String(row.enabled).toLowerCase()==='true',
      hifzEnabled:String(row.hifzEnabled).toLowerCase()==='true'
    };
  }
  return {enabled:false,hifzEnabled:false};
}
function quranSetGrant_(p){
  authorizeAdmin(p.adminApiKey); // existing Super Admin authorization
  const schoolId=String(p.targetSchoolId||'').trim();
  if(!schoolId)throw Error('Choose a registered school.');
  const match=findSchoolRow(getRegistrySheet(),r=>String(r.schoolId)===schoolId);
  if(!match)throw Error('Registered school not found.');
  if(typeof p.enabled!=='boolean'||typeof p.hifzEnabled!=='boolean')
    throw Error('Module flags must be booleans.');
  if(p.hifzEnabled&&!p.enabled)throw Error('Hifz cannot be activated when the Quran module is disabled.');
  const master=getRegistrySheet().getParent();
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(15000))throw Error('Module permissions are being updated.');
  try{
    let sheet=master.getSheetByName(QURAN_GRANTS_TAB_);
    if(!sheet){
      sheet=master.insertSheet(QURAN_GRANTS_TAB_);
      sheet.appendRow(QURAN_GRANTS_HEADERS_);
      sheet.setFrozenRows(1);
    }
    ensureSheetHeaders(sheet,QURAN_GRANTS_HEADERS_);
    const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    const rows=sheet.getDataRange().getValues();
    const value={schoolId,enabled:p.enabled,hifzEnabled:p.hifzEnabled,
      updatedAt:new Date().toISOString(),approvedBy:'Super Admin',
      reason:quranText_(p.reason,300,'activation reason')};
    let index=0;
    for(let i=1;i<rows.length;i++)if(String(rows[i][headers.indexOf('schoolId')])===schoolId)index=i+1;
    if(index)sheet.getRange(index,1,1,headers.length).setValues([recordToRow(headers,value)]);
    else sheet.appendRow(recordToRow(headers,value));
    SpreadsheetApp.flush();
    return {schoolId,enabled:p.enabled,hifzEnabled:p.hifzEnabled};
  }finally{lock.releaseLock()}
}
function quranSettings_(ctx,grant){
  const rows=quranRows_(ctx,'settings');
  const defaults=['qaida','nazra','islamicStudies'];
  let programmes=defaults;
  if(rows.length){
    try{const p=JSON.parse(rows[0].enabledProgramsJson||'[]');
      if(Array.isArray(p))programmes=p.filter(x=>QURAN_PROGRAMS_.includes(x));
    }catch(_){}
  }
  return {enabled:true,hifzEnabled:grant.hifzEnabled,
    programmes:programmes.filter(p=>p!=='hifz'||grant.hifzEnabled)};
}
function quranEnabled_(ctx){
  const grant=quranGrant_(ctx.schoolId);
  if(!grant.enabled)throw Error('Quran module is not activated for this school. Contact Super Admin.');
  return quranSettings_(ctx,grant);
}
function quranAllowedProgram_(config,programme){
  quranEnum_(programme,QURAN_PROGRAMS_,'Quran programme');
  if(config.programmes.indexOf(programme)<0)
    throw Error('This Quran programme is not enabled for your school.');
}
function quranSchoolContext_(p){
  // A normal school login is insufficient: require the current verified admin.
  const actor=verifySchoolAdminToken(p);
  const school=findSchoolRow(getRegistrySheet(),r=>String(r.schoolId)===String(p.schoolId));
  if(!school||school.obj.status!=='Active')throw Error('School is inactive.');
  p.apiKey=school.obj.apiKey; // resolved server-side, never returned
  const ctx=resolveContext(p);
  ctx.auditActor=actor;
  return ctx;
}
function quranContext_(p){
  const role=p.role||'school';
  if(role==='school')return quranSchoolContext_(p);
  if(role==='teacher'||role==='student')return resolveContext(p);
  throw Error('This login role cannot open the Quran module.');
}
function quranGetStudent_(ctx,studentId){
  // Read from the existing school roster, but never expose a record unless
  // the authenticated student or assigned Quran teacher owns the scope.
  const matching=quranRowsFromCollection_(ctx,'students')
    .filter(s=>String(s.id)===String(studentId));
  if(matching.length!==1)throw Error('Student unavailable in this school.');
  if(ctx.role==='student'&&String(ctx.student.id)!==String(studentId))
    throw Error('Another student’s record is private.');
  if(ctx.role==='teacher'){
    const authorized=quranRows_(ctx,'enrollments')
      .filter(e=>String(e.studentId)===String(studentId)&&e.status==='Active')
      .some(e=>{try{quranTeacherOwns_(ctx,e);return true}catch(_){return false}});
    if(!authorized)throw Error('Student is not assigned to this Quran teacher.');
  }
  return matching[0];
}
function quranGetTeacher_(ctx,teacherId){
  const all=quranRowsFromCollection_(ctx,'teachers');
  const matches=all.filter(t=>String(t.id)===String(teacherId)&&String(t.status||'Active')==='Active');
  if(matches.length!==1)throw Error('Choose an active teacher in this school.');
  return matches[0];
}
function quranRowsFromCollection_(ctx,name){
  const data=getCollectionSheet(ctx,name),values=data.sheet.getDataRange().getValues();
  return values.slice(1).filter(r=>r[data.headers.indexOf('id')])
    .map(r=>rowToRecord(data.headers,r));
}
function quranEnrollment_(ctx,id){
  const matches=quranRows_(ctx,'enrollments').filter(e=>String(e.id)===String(id)&&e.status==='Active');
  if(matches.length!==1)throw Error('Active Quran enrolment not found.');
  return matches[0];
}
function quranTeacherOwns_(ctx,enrollment){
  if(ctx.role==='school')return;
  if(ctx.role==='student'){
    if(String(enrollment.studentId)!==String(ctx.student.id))
      throw Error('Another student’s Quran record is private.');
    return;
  }
  if(ctx.role!=='teacher'||String(enrollment.teacherId)!==String(ctx.teacher.id))
    throw Error('Quran teacher assignment required.');
  const student=quranRowsFromCollection_(ctx,'students').find(s=>String(s.id)===String(enrollment.studentId));
  if(!student)throw Error('Student record not found.');
  if(teacherOwns(ctx,student))return;
  const grants=quranRows_(ctx,'groups');
  if(grants.some(g=>String(g.teacherId)===String(ctx.teacher.id) &&
      String(g.programCode)===String(enrollment.programCode) &&
      sameClass(g.className,student.class) &&
      (!g.section||String(g.section).toLowerCase()===String(student.section||'').toLowerCase())))
    return;
  throw Error('Student is outside this teacher’s assigned class or authorized Quran learning group.');
}
function quranCanRead_(ctx,enrollment){
  quranTeacherOwns_(ctx,enrollment);
}
function quranLock_(action){
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(20000))throw Error('Quran record is busy. Refresh before retrying.');
  try{return action()}finally{lock.releaseLock()}
}
function quranInt_(v,min,max,label){
  if(v===undefined||v===null||v==='')return '';
  const n=Number(v);
  if(!Number.isSafeInteger(n)||n<min||n>max)throw Error('Invalid '+label+'.');
  return n;
}
function quranValidateLesson_(raw,program){
  const title=quranText_(raw.lessonTitle,180,'lesson title');
  if(!title)throw Error('Lesson title is required.');
  const sessionType=quranEnum_(raw.sessionType||'lesson',QURAN_SESSIONS_,'lesson session type');
  if(['sabaq','sabqi','manzil'].includes(sessionType)&&program!=='hifz')
    throw Error('Sabaq, Sabqi and Manzil are only available for Hifz.');
  if(program==='hifz'&&sessionType==='lesson')
    throw Error('Choose Sabaq, Sabqi, Manzil or Revision for Hifz.');
  const surah=quranInt_(raw.surahNumber,1,114,'Surah number');
  const from=quranInt_(raw.ayahFrom,1,286,'Ayah reference');
  const to=quranInt_(raw.ayahTo,1,286,'Ayah reference');
  const juz=quranInt_(raw.juzNumber,1,30,'Juz/Para');
  if((from||to)&&!surah)throw Error('Surah number required for an Ayah reference.');
  if(from&&to&&Number(from)>Number(to))throw Error('Ending Ayah precedes starting Ayah.');
  // References are stored as entered, not treated as independently verified Quran text.
  return {sessionType,lessonTitle:title,surahNumber:surah,ayahFrom:from,ayahTo:to,
    juzNumber:juz,lessonRef:quranText_(raw.lessonRef,180,'teacher-entered reference'),
    quality:quranEnum_(raw.quality,QURAN_QUALITY_,'progress level'),
    mistakes:quranText_(raw.mistakes,800,'correction notes'),
    revisionRequired:raw.revisionRequired===true,
    revisionWork:quranText_(raw.revisionWork,700,'revision assignment'),
    teacherRemarks:quranText_(raw.teacherRemarks,800,'teacher remarks'),
    parentFeedback:quranText_(raw.parentFeedback,800,'parent-visible feedback'),
    published:raw.published===true};
}
function quranSaveVersioned_(ctx,key,identity,requestId,expectedVersion,record){
  const rows=quranRows_(ctx,key);
  const sameRequest=rows.filter(row=>String(row.clientRequestId||'')===requestId);
  if(sameRequest.length&&sameRequest.some(row=>!identity(row)))
    throw Error('Quran client request ID is already used for a different record.');
  const matches=rows.filter(identity);
  if(matches.length>1)throw Error('Duplicate Quran records detected; do not submit again. Ask School Admin to reconcile.');
  const prior=matches[0]||null;
  if(prior&&String(prior.clientRequestId||'')===requestId)return prior; // same HTTP retry, no extra write
  const ver=Number(expectedVersion);
  if(prior&&(!Number.isSafeInteger(ver)||ver!==Number(prior.version)))
    throw Error('Quran progress changed on another device. Reload the official record and review before correcting.');
  if(!prior&&(expectedVersion!==undefined&&Number(expectedVersion)!==0))
    throw Error('Quran record changed or was removed. Refresh before saving.');
  const now=new Date().toISOString(),full=Object.assign({},prior||{},record,{
    id:prior?prior.id:genId('qur'),version:prior?Number(prior.version)+1:1,
    clientRequestId:requestId,createdAt:prior?.createdAt||now,updatedAt:now
  });
  const target=quranRowIndex_(ctx,key,full.id);
  quranWrite_(ctx,key,full,target);
  quranAudit_(ctx,prior?'update':'add',key,full.id,prior,full);
  return full;
}
function quranAdminConfigure_(ctx,p,grant){
  const enabled=Array.isArray(p.programmes)?p.programmes:null;
  if(!enabled||enabled.length<1||enabled.length>4||
    enabled.some(x=>QURAN_PROGRAMS_.indexOf(x)<0) ||
    new Set(enabled).size!==enabled.length)throw Error('Choose unique valid Quran programmes.');
  if(enabled.includes('hifz')&&!grant.hifzEnabled)throw Error('Hifz requires Super Admin permission.');
  return quranLock_(()=>{
    const settings=quranRows_(ctx,'settings');
    if(settings.length>1)throw Error('Duplicate Quran settings. Contact Super Admin.');
    const now=new Date().toISOString();
    const record={id:settings[0]?.id||genId('qset'),
      enabledProgramsJson:JSON.stringify(enabled),updatedAt:now,
      updatedBy:ctx.auditActor.id};
    quranWrite_(ctx,'settings',record,quranRowIndex_(ctx,'settings',record.id));
    quranAudit_(ctx,'configure','settings',record.id,settings[0]||null,record);
    return {programmes:enabled.filter(x=>x!=='hifz'||grant.hifzEnabled)};
  });
}
function quranValidTeacherAssignment_(ctx,student,teacher,programCode){
  const standard=sameClass(student.class,teacher.assignedClass)&&
    (!String(teacher.assignedSection||'').trim()||
      String(teacher.assignedSection).trim().toLowerCase()===String(student.section||'').trim().toLowerCase());
  if(standard)return true;
  return quranRows_(ctx,'groups').some(g=>
    String(g.teacherId)===String(teacher.id)&&g.programCode===programCode&&
    sameClass(g.className,student.class)&&
    (!g.section||String(g.section).toLowerCase()===String(student.section||'').toLowerCase()));
}
function quranEnroll_(ctx,p,config){
  quranAllowedProgram_(config,p.programCode);
  const student=quranGetStudent_(ctx,p.studentId);
  const teacher=quranGetTeacher_(ctx,p.teacherId);
  if(!quranValidTeacherAssignment_(ctx,student,teacher,p.programCode))
    throw Error('Teacher is not assigned to this class, section or approved Quran learning group.');
  if(!student.class)throw Error('Student must have a registered class.');
  const program=p.programCode,level=quranText_(p.level,110,'Quran level');
  const groupName=quranText_(p.groupName,90,'Quran group');
  return quranLock_(()=>{
    const existing=quranRows_(ctx,'enrollments')
      .filter(e=>String(e.studentId)===String(student.id)&&e.programCode===program);
    if(existing.length>1)throw Error('Duplicate Quran enrolment; administrator review required.');
    const prior=existing[0],now=new Date().toISOString();
    const row={
      id:prior?.id||genId('qen'),studentId:student.id,
      programCode:program,teacherId:teacher.id,
      level,groupName,status:'Active',version:prior?Number(prior.version)+1:1,
      createdAt:prior?.createdAt||now,updatedAt:now
    };
    if(prior&&p.expectedVersion!==undefined&&Number(p.expectedVersion)!==Number(prior.version))
      throw Error('Quran enrolment changed. Refresh before editing.');
    quranWrite_(ctx,'enrollments',row,quranRowIndex_(ctx,'enrollments',row.id));
    quranAudit_(ctx,prior?'assign':'enroll','enrollments',row.id,prior||null,row);
    return row;
  });
}
function quranTeacherGroup_(ctx,p,config){
  quranAllowedProgram_(config,p.programCode);
  quranGetTeacher_(ctx,p.teacherId);
  const className=quranText_(p.className,70,'class');
  const section=quranText_(p.section,50,'section');
  if(!className)throw Error('Class required for Quran teacher assignment.');
  const groupName=quranText_(p.groupName,90,'Quran learning group');
  return quranLock_(()=>{
    const old=quranRows_(ctx,'groups').find(g=>String(g.teacherId)===String(p.teacherId) &&
      g.programCode===p.programCode&&sameClass(g.className,className)&&String(g.section||'')===section);
    if(old)return old;
    const row={id:genId('qgroup'),teacherId:p.teacherId,className,section,
      programCode:p.programCode,groupName,createdAt:new Date().toISOString()};
    quranWrite_(ctx,'groups',row,quranRowIndex_(ctx,'groups',row.id));
    quranAudit_(ctx,'assign','groups',row.id,null,row);
    return row;
  });
}
function quranSaveLesson_(ctx,p,config){
  const enrollment=quranEnrollment_(ctx,p.enrollmentId);
  quranAllowedProgram_(config,enrollment.programCode);
  quranTeacherOwns_(ctx,enrollment);
  const date=quranDate_(p.date),validated=quranValidateLesson_(p,enrollment.programCode);
  const requestId=quranText_(p.clientRequestId,110,'request ID');
  if(!requestId||!/^[-_a-zA-Z0-9]{8,110}$/.test(requestId))
    throw Error('A unique lesson request ID is required for duplicate prevention.');
  return quranLock_(()=>quranSaveVersioned_(ctx,'lessons',
    r=>r.enrollmentId===enrollment.id && String(r.date)===date &&
       r.sessionType===validated.sessionType,
    requestId,p.expectedVersion,
    Object.assign({},validated,{enrollmentId:enrollment.id,studentId:enrollment.studentId,
      teacherId:ctx.role==='teacher'?ctx.teacher.id:enrollment.teacherId,
      programCode:enrollment.programCode,date})));
}
function quranSaveAttendance_(ctx,p,config){
  const enrollment=quranEnrollment_(ctx,p.enrollmentId);
  quranAllowedProgram_(config,enrollment.programCode);
  quranTeacherOwns_(ctx,enrollment);
  const date=quranDate_(p.date),status=quranEnum_(p.status,QURAN_ATTENDANCE_,'lesson attendance');
  const requestId=quranText_(p.clientRequestId,110,'request ID');
  if(!/^[-_a-zA-Z0-9]{8,110}$/.test(requestId))throw Error('Unique attendance request ID required.');
  return quranLock_(()=>quranSaveVersioned_(ctx,'attendance',
    r=>r.enrollmentId===enrollment.id&&String(r.date)===date,
    requestId,p.expectedVersion,
    {enrollmentId:enrollment.id,studentId:enrollment.studentId,
     teacherId:enrollment.teacherId,date,status}));
}
function quranSaveAssessment_(ctx,p,config){
  const enrollment=quranEnrollment_(ctx,p.enrollmentId);
  quranAllowedProgram_(config,enrollment.programCode);
  quranTeacherOwns_(ctx,enrollment);
  const date=quranDate_(p.date);
  const criterion=quranEnum_(p.criterion,QURAN_CRITERIA_,'assessment criterion');
  const level=quranEnum_(p.level,QURAN_QUALITY_,'qualitative assessment');
  const requestId=quranText_(p.clientRequestId,110,'request ID');
  if(!/^[-_a-zA-Z0-9]{8,110}$/.test(requestId))throw Error('Unique assessment request ID required.');
  return quranLock_(()=>quranSaveVersioned_(ctx,'assessments',
    r=>r.enrollmentId===enrollment.id&&String(r.date)===date&&r.criterion===criterion,
    requestId,p.expectedVersion,
    {enrollmentId:enrollment.id,studentId:enrollment.studentId,
      teacherId:enrollment.teacherId,date,criterion,level,
      remarks:quranText_(p.remarks,700,'assessment remarks'),
      parentFeedback:quranText_(p.parentFeedback,700,'parent feedback'),
      published:p.published===true}));
}
function quranSaveSchedule_(ctx,p,config){
  quranAllowedProgram_(config,p.programCode);
  const teacher=quranGetTeacher_(ctx,p.teacherId);
  const cls=quranText_(p.className,70,'class'),section=quranText_(p.section,50,'section');
  const day=Number(p.dayOfWeek),start=String(p.startTime||''),end=String(p.endTime||'');
  if(!cls||!Number.isInteger(day)||day<0||day>6||
     !/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||
     !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)||start>=end)
    throw Error('Choose a valid class, weekday and lesson time range.');
  return quranLock_(()=>{
    const schedules=quranRows_(ctx,'schedules');
    if(schedules.some(r=>Number(r.dayOfWeek)===day && start<r.endTime && end>r.startTime &&
       (String(r.teacherId)===String(teacher.id) ||
        (sameClass(r.className,cls)&&String(r.section||'')===section))))
      throw Error('Quran timetable conflict: teacher or class already has a Quran period.');
    const now=new Date().toISOString();
    const item={id:genId('qslot'),teacherId:teacher.id,className:cls,section,
      dayOfWeek:day,startTime:start,endTime:end,programCode:p.programCode,
      groupName:quranText_(p.groupName,90,'group'),createdAt:now,updatedAt:now};
    quranWrite_(ctx,'schedules',item,quranRowIndex_(ctx,'schedules',item.id));
    quranAudit_(ctx,'schedule','schedules',item.id,null,item);
    return item;
  });
}
function quranProfile_(ctx,studentId){
  const target=String(studentId||'').trim();
  if(ctx.role==='student'&&target!==String(ctx.student.id))
    throw Error('Another student’s Quran progress is private.');
  const student=quranGetStudent_(ctx,target);
  let enrollments=quranRows_(ctx,'enrollments')
    .filter(e=>String(e.studentId)===target&&e.status==='Active');
  if(ctx.role==='teacher')enrollments=enrollments.filter(e=>{try{quranTeacherOwns_(ctx,e);return true}catch(_){return false}});
  if(ctx.role==='teacher'&&!enrollments.length)throw Error('Student is not assigned to this Quran teacher.');
  const ids=new Set(enrollments.map(e=>e.id));
  const lessons=quranRows_(ctx,'lessons').filter(x=>ids.has(x.enrollmentId));
  const assessments=quranRows_(ctx,'assessments').filter(x=>ids.has(x.enrollmentId));
  const attendance=quranRows_(ctx,'attendance').filter(x=>ids.has(x.enrollmentId));
  const parent=ctx.role==='student';
  return {
    student:{id:student.id,name:student.name,class:student.class,section:student.section||'',photo:student.photo||''},
    enrollments,
    lessons:lessons.filter(x=>!parent||x.published===true||String(x.published)==='true')
      .map(x=>parent?{id:x.id,enrollmentId:x.enrollmentId,date:x.date,sessionType:x.sessionType,
        lessonTitle:x.lessonTitle,surahNumber:x.surahNumber,ayahFrom:x.ayahFrom,ayahTo:x.ayahTo,
        juzNumber:x.juzNumber,revisionRequired:x.revisionRequired,revisionWork:x.revisionWork,
        parentFeedback:x.parentFeedback,quality:x.quality,
        version:x.version,programCode:x.programCode}:x),
    assessments:assessments.filter(x=>!parent||x.published===true||String(x.published)==='true')
      .map(x=>parent?{enrollmentId:x.enrollmentId,date:x.date,criterion:x.criterion,level:x.level,parentFeedback:x.parentFeedback}:x),
    attendance:attendance.map(x=>parent?
      {enrollmentId:x.enrollmentId,date:x.date,status:x.status} : x)
  };
}
function quranOverview_(ctx,config){
  let enrollments=quranRows_(ctx,'enrollments').filter(e=>e.status==='Active'&&config.programmes.includes(e.programCode));
  if(ctx.role==='teacher')enrollments=enrollments.filter(e=>{try{quranTeacherOwns_(ctx,e);return true}catch(_){return false}});
  if(ctx.role==='student')enrollments=enrollments.filter(e=>String(e.studentId)===String(ctx.student.id));
  const ids=new Set(enrollments.map(e=>e.id));
  const lessons=quranRows_(ctx,'lessons').filter(l=>ids.has(l.enrollmentId));
  const attendance=quranRows_(ctx,'attendance').filter(a=>ids.has(a.enrollmentId));
  const now=Utilities.formatDate(new Date(),ctx.ss.getSpreadsheetTimeZone()||'Asia/Karachi','yyyy-MM-dd');
  const month=now.slice(0,7),count=code=>enrollments.filter(e=>e.programCode===code).length;
  const todayLessons=lessons.filter(l=>l.date===now);
  const monthlyLessons=lessons.filter(l=>String(l.date||'').slice(0,7)===month);
  const students=quranRowsFromCollection_(ctx,'students');
  const learnerRows=enrollments.map(e=>{
    const student=students.find(s=>String(s.id)===String(e.studentId));
    return Object.assign({},e,{studentName:student?.name||'Student',
      className:student?.class||'',section:student?.section||''});
  });
  const byClass=new Map(),byTeacher=new Map();
  if(ctx.role!=='student'){
    for(const e of learnerRows){
      const classKey=[e.className,e.section].join(' · ');
      const cls=byClass.get(classKey)||{className:e.className,section:e.section,learnerCount:0,lessonsThisMonth:0};
      cls.learnerCount++;
      cls.lessonsThisMonth+=monthlyLessons.filter(l=>l.enrollmentId===e.id).length;
      byClass.set(classKey,cls);
      const t=byTeacher.get(e.teacherId)||{teacherId:e.teacherId,assignedProgrammes:0,lessonsThisMonth:0,revisionFollowups:0};
      t.assignedProgrammes++;
      t.lessonsThisMonth+=monthlyLessons.filter(l=>l.enrollmentId===e.id).length;
      t.revisionFollowups+=monthlyLessons.filter(l=>l.enrollmentId===e.id &&
        (l.revisionRequired===true||String(l.revisionRequired)==='true')).length;
      byTeacher.set(e.teacherId,t);
    }
  }
  const teachers=ctx.role==='student'?[]:quranRowsFromCollection_(ctx,'teachers');
  return {
    asOf:now,month,students:new Set(enrollments.map(e=>e.studentId)).size,
    programmes:{qaida:count('qaida'),nazra:count('nazra'),hifz:count('hifz'),islamicStudies:count('islamicStudies')},
    lessonsToday:todayLessons.length,lessonsThisMonth:monthlyLessons.length,
    revisionRequired:todayLessons.filter(l=>l.revisionRequired===true||String(l.revisionRequired)==='true').length,
    attendanceToday:attendance.filter(a=>a.date===now&&a.status==='Present').length,
    classProgress:[...byClass.values()],
    teacherPerformance:[...byTeacher.values()].map(t=>Object.assign({},t,{
      teacherName:teachers.find(x=>String(x.id)===String(t.teacherId))?.name||'Assigned Quran Teacher'
    })),
    learners:learnerRows
  };
}
/**
 * Main backend entrypoint. Only dedicated actions; no generic Quran CRUD.
 * Any authorization failure is caught by the existing handleRequest.
 */
function quranHandleRequest_(p){
  const action=String(p.action||'');
  if(action==='quranAdminSetSchool')return {status:'success',result:quranSetGrant_(p)};
  const ctx=quranContext_(p);
  if(action==='quranStatus'){
    const grant=quranGrant_(ctx.schoolId);
    return {status:'success',result:grant.enabled?quranSettings_(ctx,grant):{
      enabled:false,hifzEnabled:false,programmes:[]}};
  }
  const config=quranEnabled_(ctx);
  if(action==='quranOverview')return {status:'success',result:quranOverview_(ctx,config)};
  if(action==='quranProfile'){
    return {status:'success',result:quranProfile_(ctx,ctx.role==='student'?ctx.student.id:p.studentId)};
  }
  if(action==='quranSchedules'){
    if(ctx.role==='student')throw Error('Student access to staff timetable is not enabled.');
    const all=quranRows_(ctx,'schedules');
    return {status:'success',result:ctx.role==='teacher'?all.filter(x=>x.teacherId===ctx.teacher.id):all};
  }
  if(action==='quranGroups'){
    if(ctx.role==='student')throw Error('Student access to teacher group assignments is denied.');
    const rows=quranRows_(ctx,'groups');
    return {status:'success',result:ctx.role==='teacher'?
      rows.filter(g=>String(g.teacherId)===String(ctx.teacher.id)):rows};
  }
  if(ctx.role==='student')throw Error('Student accounts have read-only Quran access.');
  if(action==='quranSaveLesson')return {status:'success',result:quranSaveLesson_(ctx,p,config)};
  if(action==='quranSaveAttendance')return {status:'success',result:quranSaveAttendance_(ctx,p,config)};
  if(action==='quranSaveAssessment')return {status:'success',result:quranSaveAssessment_(ctx,p,config)};
  if(ctx.role!=='school')throw Error('School Administrator approval required.');
  if(action==='quranConfigure')return {status:'success',result:quranAdminConfigure_(ctx,p,quranGrant_(ctx.schoolId))};
  if(action==='quranEnroll')return {status:'success',result:quranEnroll_(ctx,p,config)};
  if(action==='quranAssignTeacherGroup')return {status:'success',result:quranTeacherGroup_(ctx,p,config)};
  if(action==='quranSaveSchedule')return {status:'success',result:quranSaveSchedule_(ctx,p,config)};
  throw Error('Unknown Quran action.');
}
