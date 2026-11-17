/**
 * LAMA Quran & Islamic Learning Academy v13 — teacher-reviewed recitation / Hifz.
 * Development PILOT ONLY. Install in SAME School Suite Apps Script project as
 * Code.gs, quran-academy-v8.gs and quran-academy-v9.gs. No new student registry.
 *
 * Script Properties (missing = DENY):
 * QURAN_V13_PILOT_SCHOOLS=<comma-separated exact fictional school IDs>
 * QURAN_V13_TEACHER_REVIEWS_ENABLED=true
 *
 * Parent read needs the existing separate VERIFIED v9 guardian session and
 * its own independent gates; a role flag, learner ID or phone number isn't auth.
 * Scores are human observations only, NEVER automated Tajweed certification.
 * No audio is sent to, processed by or stored in this add-on.
 */
var Q13_TAB_='QuranTeacherAssessments';
var Q13_HEADERS_=[
  'id','studentId','lessonId','kind','fluency','letterSounds','tajweedObservation',
  'memorization','reviewStatus','revisionDueOn','teacherNote','teacherId','recordedAt'
];
var Q13_ACTIONS_=['quranV13SaveAssessment','quranV13GetAssessment','quranV13GuardianSummary'];
var Q13_LEVELS_=['not-assessed','developing','improving','confident'];
var Q13_STATES_=['needs-support','progressing','ready-to-review'];

function q13SchoolGate_(p){
  var id=quranV8Id_(p.schoolId,'school ID');
  var props=PropertiesService.getScriptProperties();
  if(String(props.getProperty('QURAN_V13_TEACHER_REVIEWS_ENABLED'))!=='true')
    throw Error('Teacher recitation pilot is disabled.');
  var allow=String(props.getProperty('QURAN_V13_PILOT_SCHOOLS')||'')
    .split(',').map(function(v){return v.trim();});
  if(allow.indexOf(id)<0)throw Error('School is not enabled for recitation pilot.');
  return id;
}
function q13Lesson_(v){
  var lesson=quranV8Lesson_(v);
  return {lessonId:lesson,kind:/^(hifz-|surah-)/.test(lesson)?'hifz':'recitation'};
}
function q13Level_(value,name){
  var v=String(value||'');
  if(Q13_LEVELS_.indexOf(v)<0)throw Error('Invalid '+name+' observation.');
  return v;
}
function q13ReviewDue_(value){
  var s=String(value||'');
  if(!s)return '';
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||new Date(s+'T00:00:00Z').toISOString().slice(0,10)!==s)
    throw Error('Invalid revision date.');
  var now=new Date();
  var today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  var diff=(Date.parse(s+'T00:00:00Z')-today)/86400000;
  if(diff < -1 || diff > 366)throw Error('Revision date outside permitted range.');
  return s;
}
function q13Note_(raw){
  var s=String(raw==null?'':raw).trim();
  if(s.length>400)throw Error('Assessment note is too long.');
  // Avoid spreadsheet formula execution in Google Sheets.
  return /^[=+\-@\t\r]/.test(s)?"'"+s:s;
}
function q13Assessment_(r,guardian){
  var x={lessonId:String(r.lessonId),kind:String(r.kind),
    fluency:String(r.fluency),letterSounds:String(r.letterSounds),
    tajweedObservation:String(r.tajweedObservation),memorization:String(r.memorization),
    reviewStatus:String(r.reviewStatus),revisionDueOn:String(r.revisionDueOn||''),
    reviewedAt:String(r.recordedAt||'')};
  if(!guardian) {
    x.id=String(r.id);
    x.studentId=String(r.studentId);
    x.teacherId=String(r.teacherId);
    x.teacherNote=String(r.teacherNote||'');
  }
  return x;
}
function q13Latest_(ss,studentId){
  var rows=quranV8Rows_(ss,Q13_TAB_,Q13_HEADERS_).filter(function(r){
    return String(r.studentId)===String(studentId);
  });
  var latest={};
  rows.forEach(function(r){latest[String(r.lessonId)]=r;});
  return Object.keys(latest).map(function(k){return latest[k];})
    .sort(function(a,b){return String(a.lessonId).localeCompare(String(b.lessonId));});
}
function q13ReviewSummary_(ss,studentId,guardian){
  var latest=q13Latest_(ss,studentId);
  return {reviewedLessons:latest.length,
    revisionDue:latest.filter(function(r){return !!String(r.revisionDueOn||'');}).length,
    lessons:latest.slice(0,100).map(function(r){return q13Assessment_(r,guardian);}),
    truncated:latest.length>100};
}
function q13Save_(p){
  var schoolId=q13SchoolGate_(p);
  // Existing School Suite auth and class+section assignment enforced by v8.
  var ctx=quranV8Guard_(p);
  if(ctx.role!=='teacher')throw Error('Only an assigned authenticated teacher can review recitation.');
  if(ctx.schoolId!==schoolId)throw Error('School context mismatch.');
  assertSchoolWritable(ctx.schoolId);
  var student=quranV8Student_(ctx,p.targetStudentId);
  var lesson=q13Lesson_(p.lessonId);
  var requestId=quranV8Id_(p.requestId,'request ID');
  var fluency=q13Level_(p.fluency,'fluency');
  var sounds=q13Level_(p.letterSounds,'letter pronunciation');
  var tajweed=q13Level_(p.tajweedObservation,'Tajweed');
  var memorization=q13Level_(p.memorization,'memorization');
  if(lesson.kind!=='hifz' && memorization!=='not-assessed')
    throw Error('Memorization scoring is reserved for Hifz or Surah lessons.');
  var status=String(p.reviewStatus||'');
  if(Q13_STATES_.indexOf(status)<0)throw Error('Invalid teacher review status.');
  var revisionDue=q13ReviewDue_(p.revisionDueOn);
  var note=q13Note_(p.teacherNote);
  var teacherId=quranV8Id_(ctx.teacher.id,'teacher ID');
  var tuple=[requestId,student.id,lesson.lessonId,lesson.kind,fluency,sounds,tajweed,
    memorization,status,revisionDue,note,teacherId];
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    var sh=quranV8Sheet_(ctx.ss,Q13_TAB_,Q13_HEADERS_,true);
    var rows=quranV8Rows_(ctx.ss,Q13_TAB_,Q13_HEADERS_);
    var duplicates=rows.filter(function(r){return String(r.id)===requestId;});
    if(duplicates.length){
      if(duplicates.length!==1)throw Error('Conflicting assessment request ID.');
      var actual=Q13_HEADERS_.slice(0,-1).map(function(k){return String(duplicates[0][k]);});
      if(actual.some(function(value,i){return value!==String(tuple[i]);}))
        throw Error('Conflicting assessment request ID.');
      return {duplicate:true,requestId:requestId,studentId:student.id};
    }
    var now=new Date().toISOString();
    sh.appendRow(tuple.concat([now]));
    return {saved:true,requestId:requestId,studentId:student.id,
      assessment:q13Assessment_(Object.assign(
        {},Object.fromEntries(Q13_HEADERS_.slice(0,-1).map(function(k,i){return [k,tuple[i]];})),
        {recordedAt:now}
      ),false)};
  }finally{lock.releaseLock();}
}
function q13TeacherRead_(p){
  q13SchoolGate_(p);
  var ctx=quranV8Guard_(p);
  if(ctx.role!=='teacher'&&ctx.role!=='school')
    throw Error('Teacher or verified school administrator required.');
  // Enforce class / section via existing v8 Student helper before reading rows.
  var student=quranV8Student_(ctx,p.targetStudentId);
  var summary=q13ReviewSummary_(ctx.ss,student.id,false);
  return {student:student,summary:summary};
}
function q13GuardianRead_(p){
  var schoolId=q13SchoolGate_(p);
  if(p.role!=='guardian')throw Error('Verified guardian session required.');
  if(typeof quranV9Gate_!=='function'||typeof quranV9Session_!=='function')
    throw Error('Guardian verification service unavailable.');
  var gate=quranV9Gate_(p);   // separate server-side guardian pilot flag and active school
  if(gate.schoolId!==schoolId)throw Error('Guardian school mismatch.');
  var session=quranV9Session_(p,gate);
  var id=quranV8Id_(p.targetStudentId,'student ID');
  if(!session.links.some(function(l){return String(l.studentId)===id;}))
    throw Error('Guardian is not approved for this child.');
  // Do not return teacher ID, private notes, names, contacts or raw submissions.
  return {studentId:id,summary:q13ReviewSummary_(gate.ss,id,true)};
}
function quranV13Run_(p){
  p=p||{};
  var action=String(p.action||'');
  if(Q13_ACTIONS_.indexOf(action)<0)throw Error('Unknown recitation pilot action.');
  if(action==='quranV13SaveAssessment')return q13Save_(p);
  if(action==='quranV13GetAssessment')return q13TeacherRead_(p);
  return q13GuardianRead_(p);
}
