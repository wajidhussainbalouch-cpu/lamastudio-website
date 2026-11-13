/**
 * LAMA Quran Academy v8 — protected pilot addon for existing School Suite Apps Script.
 * Keep in SAME Apps Script project as Code.gs. Never deploy as a second backend.
 * School/student IDs are authoritative; no guardian access or audio uploads.
 * QURAN_V8_PILOT_SCHOOLS: comma-separated exact school IDs; absent = DENY ALL.
 */
var QURAN_V8_PRACTICE_TAB='QuranPracticeLog',QURAN_V8_REVIEW_TAB='QuranTeacherReviews';
var QURAN_V8_PRACTICE_HEADERS=['id','studentId','lessonId','kind','recordedByRole','recordedById','createdAt'];
var QURAN_V8_REVIEW_HEADERS=['id','studentId','lessonId','status','note','teacherId','reviewedAt'];
var QURAN_V8_ACTIONS=['quranV8ListLearners','quranV8GetProgress','quranV8LogPractice','quranV8TeacherReview','quranV8ParentChildren'];

function quranV8Guard_(p){
 var schoolId=String(p.schoolId||'').trim();
 if(!/^[A-Za-z0-9_-]{1,90}$/.test(schoolId))throw Error('Invalid School ID.');
 var list=(PropertiesService.getScriptProperties().getProperty('QURAN_V8_PILOT_SCHOOLS')||'').split(',').map(function(v){return v.trim();});
 if(list.indexOf(schoolId)<0)throw Error('Quran integration not enabled for this school.');
 var role=String(p.role||'');
 if(role==='parent'||role==='guardian')throw Error('Guardian verification unavailable. Access denied.');
 // Version 11: legacy student passwords and static student API keys require migration.
 // No student API access in the supervised pilot until a new authenticated flow is reviewed.
 if(role==='student')throw Error('Student Quran pilot access is paused pending secure student authentication.');
 if(role==='school'){
  var actor=verifySchoolAdminToken(p);
  var match=findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===schoolId;});
  if(!match||match.obj.status!=='Active')throw Error('School unavailable.');
  return {role:'school',schoolId:schoolId,ss:SpreadsheetApp.openById(match.obj.sheetId),actor:actor};
 }
 if(role!=='teacher'&&role!=='student')throw Error('Existing authenticated teacher or student required.');
 var ctx=resolveContext(p);
 if(String(ctx.schoolId)!==schoolId)throw Error('School mismatch.');
 return ctx;
}
function quranV8Id_(v,label){
 var id=String(v||'').trim();
 if(!/^[A-Za-z0-9_-]{1,90}$/.test(id))throw Error('Invalid '+label+'.');
 return id;
}
function quranV8Lesson_(v){
 var id=quranV8Id_(v,'lesson ID');
 if(!/^(letters-[1-4]|harakat|joining|tanween|sukoon|shaddah|madd|mixed|bridge|child-(0[1-9]|1[0-2])|hifz-(fatiha|asr|kawthar|ikhlas|falaq|nas)|surah-(1|103|108|112|113|114))$/.test(id))throw Error('Unknown lesson ID.');
 return id;
}
function quranV8Note_(value){
 var s=String(value==null?'':value).trim();
 if(s.length>400)throw Error('Review note too long.');
 return /^[=+\-@\t\r]/.test(s)?"'"+s:s;
}
function quranV8Sheet_(ss,name,headers,create){
 var sheet=ss.getSheetByName(name);
 if(!sheet){
  if(!create)return null;
  sheet=ss.insertSheet(name);sheet.appendRow(headers);sheet.setFrozenRows(1);
 }
 var h=sheet.getRange(1,1,1,headers.length).getValues()[0];
 if(headers.some(function(k,i){return h[i]!==k;}))throw Error('Quran sheet schema mismatch.');
 return sheet;
}
function quranV8Rows_(ss,name,headers){
 var sheet=quranV8Sheet_(ss,name,headers,false);
 if(!sheet||sheet.getLastRow()<2)return [];
 return sheet.getRange(2,1,sheet.getLastRow()-1,headers.length).getValues().map(function(row){return rowToRecord(headers,row);});
}
function quranV8Student_(ctx,id){
 var key=quranV8Id_(id,'student ID');
 if(ctx.role==='student'&&String(ctx.student.id)!==key)throw Error('Access denied to another student.');
 var r=getRecord(ctx,'students',key);
 if(!r)throw Error('Student unavailable.');
 if(ctx.role==='teacher'&&!teacherOwns(ctx,r))throw Error('Student outside assigned class and section.');
 return {id:String(r.id),name:String(r.name||''),className:String(r.class||''),section:String(r.section||'')};
}
function quranV8Progress_(ctx,studentId){
 var student=quranV8Student_(ctx,studentId);
 var activity=quranV8Rows_(ctx.ss,QURAN_V8_PRACTICE_TAB,QURAN_V8_PRACTICE_HEADERS).filter(function(r){return String(r.studentId)===student.id;});
 var reviews=quranV8Rows_(ctx.ss,QURAN_V8_REVIEW_TAB,QURAN_V8_REVIEW_HEADERS).filter(function(r){return String(r.studentId)===student.id;});
 var latest={};reviews.forEach(function(r){latest[r.lessonId]={lessonId:String(r.lessonId),status:String(r.status),note:String(r.note||''),teacherId:String(r.teacherId),reviewedAt:String(r.reviewedAt)};});
 return {student:student,practiceCount:activity.length,practices:activity.slice(-100).map(function(r){return {lessonId:String(r.lessonId),kind:String(r.kind),createdAt:String(r.createdAt)};}),reviews:Object.keys(latest).map(function(k){return latest[k];})};
}
function quranV8Run_(p){
 p=p||{};var action=String(p.action||'');
 if(QURAN_V8_ACTIONS.indexOf(action)<0)throw Error('Unknown Quran action.');
 if(action==='quranV8ParentChildren')throw Error('Verified guardian account is not yet supported.');
 var ctx=quranV8Guard_(p);
 if(action==='quranV8ListLearners'){
  if(ctx.role==='student')throw Error('Class lists unavailable to students.');
  var records=listRecords(ctx,'students');
  if(ctx.role==='school'){
   var klass=String(p.className||'').trim();
   if(!klass||klass.length>60)throw Error('School admin must choose a class.');
   records=records.filter(function(r){return sameClass(r.class,klass);});
  }
  return {students:records.slice(0,100).map(function(r){return {id:String(r.id),name:String(r.name||''),className:String(r.class||''),section:String(r.section||'')};}),truncated:records.length>100};
 }
 if(action==='quranV8GetProgress')return quranV8Progress_(ctx,p.targetStudentId);
 if(action==='quranV8LogPractice'){
  if(ctx.role==='school')throw Error('School administrator cannot impersonate student practice.');
  assertSchoolWritable(ctx.schoolId);
  var student=quranV8Student_(ctx,p.targetStudentId),lesson=quranV8Lesson_(p.lessonId),eventId=quranV8Id_(p.requestId,'request ID');
  var kind=String(p.kind||'read');
  if(['read','listen','repeat','revision'].indexOf(kind)<0)throw Error('Invalid practice type.');
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
   var sh=quranV8Sheet_(ctx.ss,QURAN_V8_PRACTICE_TAB,QURAN_V8_PRACTICE_HEADERS,true);
   var old=quranV8Rows_(ctx.ss,QURAN_V8_PRACTICE_TAB,QURAN_V8_PRACTICE_HEADERS).filter(function(r){return String(r.id)===eventId;});
   if(old.length){
    if(old.length>1||String(old[0].studentId)!==student.id||String(old[0].lessonId)!==lesson||String(old[0].kind)!==kind)throw Error('Conflicting request ID.');
    return {duplicate:true,requestId:eventId};
   }
   sh.appendRow([eventId,student.id,lesson,kind,ctx.role,ctx.role==='teacher'?ctx.teacher.id:ctx.student.id,new Date().toISOString()]);
   return {saved:true,requestId:eventId};
  }finally{lock.releaseLock();}
 }
 if(action==='quranV8TeacherReview'){
  if(ctx.role!=='teacher')throw Error('Only assigned teacher can submit a teacher review.');
  assertSchoolWritable(ctx.schoolId);
  var learner=quranV8Student_(ctx,p.targetStudentId),lessonId=quranV8Lesson_(p.lessonId),requestId=quranV8Id_(p.requestId,'request ID');
  var status=String(p.status||'');
  if(['needs-practice','reviewed'].indexOf(status)<0)throw Error('Invalid review status.');
  var note=quranV8Note_(p.note),reviewLock=LockService.getScriptLock();reviewLock.waitLock(20000);
  try{
   var reviewSh=quranV8Sheet_(ctx.ss,QURAN_V8_REVIEW_TAB,QURAN_V8_REVIEW_HEADERS,true);
   var old=quranV8Rows_(ctx.ss,QURAN_V8_REVIEW_TAB,QURAN_V8_REVIEW_HEADERS).filter(function(r){return String(r.id)===requestId;});
   if(old.length){
    if(old.length>1||String(old[0].studentId)!==learner.id||String(old[0].lessonId)!==lessonId||String(old[0].teacherId)!==String(ctx.teacher.id)||String(old[0].status)!==status||String(old[0].note)!==note)throw Error('Conflicting review ID.');
    return {duplicate:true,requestId:requestId};
   }
   reviewSh.appendRow([requestId,learner.id,lessonId,status,note,ctx.teacher.id,new Date().toISOString()]);
   writeAudit(ctx.ss,ctx.schoolId,{id:ctx.teacher.id,name:ctx.teacher.name,role:'teacher'},'quranTeacherReview',QURAN_V8_REVIEW_TAB,requestId,null,{studentId:learner.id,lessonId:lessonId,status:status});
   return {saved:true,requestId:requestId};
  }finally{reviewLock.releaseLock();}
 }
 throw Error('Unsupported Quran action.');
}