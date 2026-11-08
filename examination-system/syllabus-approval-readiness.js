'use strict';
/** Strict pre-publication gate. A capacity pass alone never authorizes publication. */
function assessApprovalReadiness({division,preview,review,actor}){
 if(!division||!Array.isArray(division.lessons)||!preview||!review)throw Error('Missing approval inputs');
 const blockers=[];
 if(!actor||actor.role!=='school_admin'||!actor.schoolId||actor.schoolId!==review.schoolId)blockers.push('Authorized school administrator required');
 if(!review.schoolId||!review.classId||!review.subjectId||!review.sessionId)blockers.push('School, class, subject and session scope required');
 if(String(division.classId)!==String(review.classId)||division.subjectId!==review.subjectId)blockers.push('Division scope mismatch');
 if(division.status!=='submitted')blockers.push('Division must be submitted for approval');
 if(!review.textbookExercisesVerified)blockers.push('Textbook exercises must be verified');
 if(!review.teacherReviewedDifficulty)blockers.push('Teacher must review topic difficulty and period estimates');
 if(!review.timetableConfirmed)blockers.push('School subject timetable must be confirmed');
 if(!review.holidaysConfirmed)blockers.push('School holiday calendar must be confirmed');
 if(!preview.feasible||preview.shortfall>0)blockers.push('Insufficient teaching capacity');
 if(!Array.isArray(preview.rows)||preview.rows.length!==division.lessons.length)blockers.push('Incomplete schedule preview');
 const seen=new Set();
 for(const l of division.lessons){
  if(!l.lessonId||seen.has(l.lessonId)||!Number.isSafeInteger(l.estimatedPeriods)||l.estimatedPeriods<1)blockers.push('Invalid or duplicate lesson');
  seen.add(l.lessonId);
  if(!Array.isArray(l.learningObjectives)||!l.learningObjectives.length||!Array.isArray(l.subtopics)||!l.subtopics.length)blockers.push('Missing verified objectives or subtopics');
 }
 if(preview.rows?.some(r=>r.status==='insufficient-capacity'))blockers.push('Unscheduled lessons remain');
 return {ready:blockers.length===0,blockers:[...new Set(blockers)],requiresServerSideAuthorization:true,mutated:false};
}
if(typeof module!=='undefined')module.exports={assessApprovalReadiness};
