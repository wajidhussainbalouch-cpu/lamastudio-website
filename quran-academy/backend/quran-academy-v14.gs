/**
 * LAMA Quran & Islamic Learning Academy — Version 14 unified learner reports.
 * PRIVATE DEVELOPMENT PILOT ONLY; same School Suite IDs, registration and Sheets.
 * Install in the SAME Apps Script project as Code.gs + Quran v8/v9/v13 addons.
 * No new database, student records, guardian accounts, or Quran audio storage.
 *
 * Independently gated via Script Properties:
 *   QURAN_V14_PROGRESS_ENABLED=true
 *   QURAN_V14_PILOT_SCHOOLS=<exact fictional pilot school IDs>
 * In addition to the existing v8, v13 and v9 (for guardians) gates.
 *
 * Reports summarize observed PRACTICE and teacher-written ASSESSMENTS;
 * no automatic Tajweed judgments, certification, or mastery percentages.
 * Guardian responses exclude student name, teacher identity and private notes.
 */
var Q14_ACTIONS_=['quranV14GetLearnerReport','quranV14ClassDashboard','quranV14GuardianReport'];
var Q14_TRACKS_=['qaida','nazra','hifz'];
var Q14_MAX_LESSONS_=100;

function q14Gate_(p) {
  var schoolId=quranV8Id_(p.schoolId,'school ID');
  var props=PropertiesService.getScriptProperties();
  if(String(props.getProperty('QURAN_V14_PROGRESS_ENABLED'))!=='true')
    throw Error('Unified Quran progress pilot disabled.');
  var allow=String(props.getProperty('QURAN_V14_PILOT_SCHOOLS')||'')
    .split(',').map(function(x){return x.trim();});
  if(allow.indexOf(schoolId)<0)throw Error('Quran progress pilot not enabled for this school.');
  // Checks registered school still active for all roles, including teachers.
  var match=findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===schoolId;});
  if(!match||String(match.obj.status)!=='Active')throw Error('School unavailable.');
  if(typeof q13SchoolGate_!=='function')throw Error('Teacher review add-on is unavailable.');
  q13SchoolGate_(p);
  return schoolId;
}
function q14Track_(raw) {
  var s=String(raw||'');
  if(/^(letters-[1-4]|harakat|joining|tanween|sukoon|shaddah|madd|mixed|bridge|child-(0[1-9]|1[0-2]))$/.test(s))return 'qaida';
  if(/^nazra-juz-(0[1-9]|[12][0-9]|30)$/.test(s))return 'nazra';
  if(/^(hifz-(fatiha|asr|kawthar|ikhlas|falaq|nas)|surah-(1|103|108|112|113|114))$/.test(s))return 'hifz';
  return null;
}
function q14Date_(v) {
  if(v instanceof Date){
    if(isNaN(v.getTime()))return '';
    return Utilities.formatDate(v,Session.getScriptTimeZone(),'yyyy-MM-dd');
  }
  var s=String(v||'').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return '';
  var parsed=new Date(s+'T00:00:00Z');
  return !isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===s?s:'';
}
function q14Timestamp_(v){
  if(v instanceof Date)return isNaN(v.getTime())?'':v.toISOString();
  return String(v||'').trim();
}
function q14Today_(){
  return Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd');
}
function q14TrackEmpty_(){
  return {practiceEvents:0,practicedLessons:0,assessedLessons:0,
    revisionDue:0,revisionUpcoming:0,reviewStatuses:{
      'needs-support':0,'progressing':0,'ready-to-review':0
    }};
}
function q14Build_(studentId,practiceRows,assessmentRows,today,guardian,includeLessons){
  var lessonById={};
  var tracks={qaida:q14TrackEmpty_(),nazra:q14TrackEmpty_(),hifz:q14TrackEmpty_()};
  var invalidEntries=0;
  practiceRows.forEach(function(r){
    if(String(r.studentId)!==String(studentId))return;
    var lessonId=String(r.lessonId||''),track=q14Track_(lessonId);
    if(!track){invalidEntries++;return;}
    if(!lessonById[lessonId])lessonById[lessonId]={lessonId:lessonId,track:track,practiceCount:0,lastPracticedAt:'',review:null};
    var x=lessonById[lessonId],timestamp=q14Timestamp_(r.createdAt);
    x.practiceCount++;
    if(timestamp>x.lastPracticedAt)x.lastPracticedAt=timestamp;
    tracks[track].practiceEvents++;
  });
  assessmentRows.forEach(function(r){
    if(String(r.studentId)!==String(studentId))return;
    var lessonId=String(r.lessonId||''),track=q14Track_(lessonId);
    if(!track){invalidEntries++;return;}
    if(!lessonById[lessonId])lessonById[lessonId]={lessonId:lessonId,track:track,practiceCount:0,lastPracticedAt:'',review:null};
    // Assessment log is append-only; the most recent row for each lesson wins.
    lessonById[lessonId].review=r;
  });
  var lessons=Object.keys(lessonById).sort().map(function(id){
    var x=lessonById[id],view={lessonId:id,track:x.track,practiceCount:x.practiceCount,
      lastPracticedAt:x.lastPracticedAt};
    if(x.practiceCount)tracks[x.track].practicedLessons++;
    if(x.review){
      var d=q14Date_(x.review.revisionDueOn);
      var state=String(x.review.reviewStatus||'');
      if(Object.prototype.hasOwnProperty.call(tracks[x.track].reviewStatuses,state))
        tracks[x.track].reviewStatuses[state]++;
      tracks[x.track].assessedLessons++;
      if(d && d<=today)tracks[x.track].revisionDue++;
      if(d && d>today)tracks[x.track].revisionUpcoming++;
      var read=q13Assessment_(x.review,guardian);
      read.revisionDueOn=d;
      view.review=read;
    }
    return view;
  });
  var total={practiceEvents:0,practicedLessons:0,assessedLessons:0,
    revisionDue:0,revisionUpcoming:0};
  Q14_TRACKS_.forEach(function(track){
    Object.keys(total).forEach(function(k){total[k]+=tracks[track][k];});
  });
  var report={asOfDate:today,totals:total,tracks:tracks,unclassifiedEntries:invalidEntries};
  if(includeLessons){
    report.lessons=lessons.slice(0,Q14_MAX_LESSONS_);
    report.truncated=lessons.length>Q14_MAX_LESSONS_;
  }
  return report;
}
function q14Load_(ss) {
  return {practice:quranV8Rows_(ss,QURAN_V8_PRACTICE_TAB,QURAN_V8_PRACTICE_HEADERS),
    assessment:quranV8Rows_(ss,Q13_TAB_,Q13_HEADERS_)};
}
// Group rows once per class page instead of scanning every school row per learner.
function q14IndexByStudent_(rows,ids){
  var index=Object.create(null);
  ids.forEach(function(id){index[String(id)]=[];});
  rows.forEach(function(r){
    var id=String(r.studentId||'');
    if(Object.prototype.hasOwnProperty.call(index,id))index[id].push(r);
  });
  return index;
}
function q14StaffContext_(p) {
  var id=q14Gate_(p),ctx=quranV8Guard_(p);
  if(ctx.schoolId!==id || (ctx.role!=='school'&&ctx.role!=='teacher'))
    throw Error('Verified teacher or school administrator required.');
  return ctx;
}
function q14Learner_(p) {
  var ctx=q14StaffContext_(p);
  var student=quranV8Student_(ctx,p.targetStudentId); // class/section check
  var data=q14Load_(ctx.ss);
  return {student:student,report:q14Build_(student.id,data.practice,data.assessment,q14Today_(),false,true)};
}
function q14Class_(p) {
  var ctx=q14StaffContext_(p),klass,section;
  if(ctx.role==='teacher') {
    klass=String(ctx.teacher.assignedClass||'').trim();
    section=String(ctx.teacher.assignedSection||'').trim();
    if(!klass)throw Error('Teacher class assignment is missing.');
  } else {
    klass=String(p.className||'').trim();
    section=String(p.section||'').trim();
    if(!klass||klass.length>60||section.length>60)throw Error('School administrator must select a valid class.');
  }
  var records=listRecords(ctx,'students').filter(function(s){
    return sameClass(s.class,klass) &&
      (ctx.role==='teacher'?teacherOwns(ctx,s):(!section||String(s.section||'').trim()===section));
  }).sort(function(a,b){return String(a.id).localeCompare(String(b.id));});
  var total=records.length;
  var offset=Number(p.offset==null?0:p.offset),limit=Number(p.limit==null?25:p.limit);
  if(!Number.isInteger(offset)||offset<0||offset>10000||
     !Number.isInteger(limit)||limit<1||limit>50)throw Error('Invalid class page size.');
  var data=q14Load_(ctx.ss),today=q14Today_();
  var page=records.slice(offset,offset+limit);
  var ids=page.map(function(s){return String(s.id);});
  var practiceIndex=q14IndexByStudent_(data.practice,ids);
  var assessmentIndex=q14IndexByStudent_(data.assessment,ids);
  var students=page.map(function(s){
    var id=String(s.id);
    var report=q14Build_(id,practiceIndex[id],assessmentIndex[id],today,false,false);
    return {id:String(s.id),name:String(s.name||''),className:String(s.class||''),
      section:String(s.section||''),totals:report.totals};
  });
  return {asOfDate:today,className:klass,section:section,totalStudents:total,
    offset:offset,returnedStudents:students.length,
    nextOffset:offset+limit<total?offset+limit:null,students:students};
}
function q14Guardian_(p) {
  var schoolId=q14Gate_(p);
  if(p.role!=='guardian')throw Error('Verified guardian session required.');
  if(typeof quranV9Gate_!=='function'||typeof quranV9Session_!=='function')
    throw Error('Guardian verification service unavailable.');
  var gate=quranV9Gate_(p);
  if(String(gate.schoolId)!==schoolId)throw Error('Guardian school mismatch.');
  var session=quranV9Session_(p,gate),id=quranV8Id_(p.targetStudentId,'student ID');
  if(!session.links.some(function(r){return String(r.studentId)===id;}))
    throw Error('Guardian not approved for this child.');
  // If student was deleted since approval, no longer reveal retained activity.
  var exists=getRecord({role:'school',schoolId:schoolId,ss:gate.ss},'students',id);
  if(!exists)throw Error('Student is no longer enrolled.');
  var data=q14Load_(gate.ss);
  return {studentId:id,report:q14Build_(id,data.practice,data.assessment,q14Today_(),true,true)};
}
function quranV14Run_(p){
  p=p||{};
  if(Q14_ACTIONS_.indexOf(String(p.action||''))<0)throw Error('Unknown unified progress action.');
  if(p.action==='quranV14GetLearnerReport')return q14Learner_(p);
  if(p.action==='quranV14ClassDashboard')return q14Class_(p);
  return q14Guardian_(p);
}
