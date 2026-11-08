'use strict';
/** Read-only admin preview. Never publishes or mutates an approved division. */
const {auditCapacity}=require('./syllabus-capacity-audit');
const {scheduleApprovedDivision}=require('./syllabus-calendar-engine');
function buildAdminPreview({division,calendar,completed={},previousSchedule={}}){
 if(!division||!Array.isArray(division.lessons))throw Error('Division required');
 const lessons=division.lessons;
 const audit=auditCapacity({lessons:lessons.filter(l=>!completed[l.lessonId]),calendar});
 const schedule=scheduleApprovedDivision({lessons,calendar,completed,previousSchedule});
 const byId=new Map(lessons.map(l=>[l.lessonId,l]));
 const rows=schedule.assignments.map((a,i)=>{
  const lesson=byId.get(a.lessonId);
  return {order:i+1,lessonId:a.lessonId,unit:lesson.unitTitle||lesson.unitId||'',
   topic:lesson.topic,difficulty:lesson.difficulty,weight:lesson.weight,
   estimatedPeriods:lesson.estimatedPeriods,sourceConfidence:lesson.sourceConfidence||'',
   status:a.status,dates:[...new Set((a.slots||[]).map(s=>s.date))],
   actualDate:a.actualDate||null,missingPeriods:a.missingPeriods||0};
 });
 const warnings=[];
 if(!audit.feasible)warnings.push('Not enough subject periods before the deadline; do not shorten or omit approved lessons.');
 if(lessons.some(l=>l.sourceConfidence&&/require/i.test(l.sourceConfidence)))warnings.push('Some lesson details and difficulty estimates still require textbook and teacher verification.');
 if(!calendar.holidaysConfirmed)warnings.push('School-specific public holidays are not yet confirmed.');
 return {readOnly:true,divisionStatus:division.status||'unknown',approvalReady:false,
  requiredUnfinishedPeriods:audit.requiredPeriods,availablePeriods:audit.availablePeriods,
  shortfall:audit.shortfall,feasible:audit.feasible&&schedule.feasible,
  months:audit.months,rows,warnings,summary:{totalLessons:lessons.length,
   completed:rows.filter(r=>r.status==='completed').length,
   unscheduled:rows.filter(r=>r.status==='insufficient-capacity').length}};
}
if(typeof module!=='undefined')module.exports={buildAdminPreview};
