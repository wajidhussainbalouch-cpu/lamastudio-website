/**
 * LAMA Quran Academy v10 — READ-ONLY pilot readiness + teacher summary.
 * Development branch ONLY. Add to the EXISTING School Suite Apps Script project,
 * alongside v8/v9 addons, after review. No new doPost/doGet, accounts or sheets.
 * Routes: quranV10PilotReadiness (verified school admin only)
 *         quranV10TeacherSummary (existing authenticated assigned teacher only)
 * Both routes MUST be POST-only in Code.gs. No write calls are made here.
 * This is NOT a production launch approval or an audit of child privacy.
 */
var QURAN_V10_ACTIONS=['quranV10PilotReadiness','quranV10TeacherSummary'];
function quranV10Allowlisted_(property,schoolId){
  var value=String(PropertiesService.getScriptProperties().getProperty(property)||'');
  return value.split(',').map(function(x){return x.trim();}).indexOf(String(schoolId))!==-1;
}
function quranV10Rows_(ss,tab,headers){
  // quranV8Rows_ is a read-only helper: a missing tab remains missing.
  return quranV8Rows_(ss,tab,headers);
}
function quranV10Readiness_(p){
  if(String(p.role)!=='school')throw Error('Verified school administrator required.');
  // The v8 guard verifies the EXISTING school-admin token server-side.
  var ctx=quranV8Guard_(p);
  if(ctx.role!=='school'||!ctx.actor||!ctx.actor.id)throw Error('Verified school administrator required.');
  var props=PropertiesService.getScriptProperties(),schoolId=ctx.schoolId;
  var enabled=String(props.getProperty('QURAN_V9_GUARDIAN_ENABLED'))==='true';
  var secret=String(props.getProperty('QURAN_V9_GUARDIAN_SECRET')||'');
  var guardianGate=enabled&&quranV10Allowlisted_('QURAN_V9_PILOT_SCHOOLS',schoolId)&&secret.length>=32;
  var practice=quranV10Rows_(ctx.ss,QURAN_V8_PRACTICE_TAB,QURAN_V8_PRACTICE_HEADERS);
  var reviews=quranV10Rows_(ctx.ss,QURAN_V8_REVIEW_TAB,QURAN_V8_REVIEW_HEADERS);
  var links=(typeof quranV9Links_==='function' && guardianGate)?quranV9Links_({schoolId:schoolId,ss:ctx.ss,secret:secret}):[];
  // Deliberately no emails, student names, IDs, or tokens in the response.
  return {
    release:'v10-development-only',schoolId:schoolId,mode:'pilot',canLaunch:false,
    counts:{practiceEvents:practice.length,teacherReviews:reviews.length,
      approvedGuardianLinks:links.filter(function(r){return String(r.status)==='approved';}).length},
    gates:{v8Pilot:true,guardianPilotConfigured:guardianGate,
      guardianAddonInstalled:typeof quranV9Run_==='function',
      studentCredentialHardeningReviewed:false,
      childPrivacyAndRetentionApproved:false,
      scholarAndRecitationContentApproved:false,
      liveDeviceAndAppsScriptTestsPassed:false},
    next:'Keep pilot disabled until credential, privacy, content and live integration reviews pass.'
  };
}
function quranV10TeacherSummary_(p){
  if(String(p.role)!=='teacher')throw Error('Existing teacher login required.');
  var ctx=quranV8Guard_(p); // verifies teacher API key and active assignment
  if(ctx.role!=='teacher'||!ctx.teacher||!String(ctx.teacher.assignedClass||'').trim())
    throw Error('Assigned teacher class is required.');
  var roster=listRecords(ctx,'students').filter(function(r){return teacherOwns(ctx,r);});
  var ids={};roster.forEach(function(r){ids[String(r.id)]=true;});
  var logs=quranV10Rows_(ctx.ss,QURAN_V8_PRACTICE_TAB,QURAN_V8_PRACTICE_HEADERS).filter(function(r){return !!ids[String(r.studentId)];});
  var reviews=quranV10Rows_(ctx.ss,QURAN_V8_REVIEW_TAB,QURAN_V8_REVIEW_HEADERS).filter(function(r){return !!ids[String(r.studentId)];});
  var practising={};logs.forEach(function(r){practising[String(r.studentId)]=true;});
  var latest={};reviews.forEach(function(r){
    var key=String(r.studentId)+'|'+String(r.lessonId);
    if(!latest[key]||String(r.reviewedAt)>String(latest[key].reviewedAt))latest[key]=r;
  });
  var needs=Object.keys(latest).filter(function(k){return String(latest[k].status)==='needs-practice';}).length;
  return {release:'v10-development-only',scope:'assigned-teacher-class',
    className:String(ctx.teacher.assignedClass),section:String(ctx.teacher.assignedSection||''),
    totals:{learners:roster.length,learnersWithPractice:Object.keys(practising).length,
      practiceEvents:logs.length,reviewedLessonRecords:Object.keys(latest).length,needsPractice:needs},
    privacy:'Aggregate class counts only. No child names, identifiers or teacher notes.'};
}
function quranV10Run_(p){
  p=p||{};
  if(QURAN_V10_ACTIONS.indexOf(String(p.action||''))<0)throw Error('Unsupported Quran v10 action.');
  if(p.action==='quranV10PilotReadiness')return quranV10Readiness_(p);
  if(p.action==='quranV10TeacherSummary')return quranV10TeacherSummary_(p);
  throw Error('Unsupported Quran v10 action.');
}
