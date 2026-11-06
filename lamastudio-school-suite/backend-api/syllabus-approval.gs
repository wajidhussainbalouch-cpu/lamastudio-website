/**
 * Server-only syllabus workflow rules for Google Apps Script.
 * Do not accept actor or school from a browser payload.
 * Requires authenticated school administrator identity and active Examination grant.
 */
var LamaSyllabusApproval = (function(){
 'use strict';
 var transitions={draft:['submitted'],submitted:['approved','draft'],approved:['published','draft'],published:['archived'],archived:[]};
 function nonempty(v){return typeof v==='string'&&!!v.trim()}
 function prepare(plan, target, expectedVersion, actorId, reason, now){
  if(!plan||!nonempty(plan.schoolId)||!nonempty(plan.planId)||!nonempty(plan.sessionId)||
    !nonempty(plan.classId)||!nonempty(plan.subjectId)||!Array.isArray(plan.scheduled)||
    !plan.scheduled.length)throw Error('Invalid stored syllabus plan');
  if(!nonempty(actorId))throw Error('Verified administrator required');
  if(!Number.isSafeInteger(plan.version)||plan.version<1||!Number.isSafeInteger(expectedVersion)||
    plan.version!==expectedVersion)throw Error('Version conflict');
  if(!transitions[plan.status]||transitions[plan.status].indexOf(target)<0)throw Error('Invalid syllabus status transition');
  if(target==='draft'&&!nonempty(reason))throw Error('Reason required when returning plan to draft');
  if(target==='published'&&!nonempty(plan.approvedBy))throw Error('Plan approval required before publishing');
  if(!nonempty(now)||!Number.isFinite(Date.parse(now)))throw Error('Trusted server time required');
  var next=JSON.parse(JSON.stringify(plan));next.status=target;next.version=plan.version+1;
  if(target==='approved')next.approvedBy=actorId;
  if(target==='draft'){next.approvedBy=null;next.publishedBy=null}
  if(target==='published')next.publishedBy=actorId;
  return {schoolId:plan.schoolId,planId:plan.planId,expectedVersion:plan.version,plan:next,
   audit:{schoolId:plan.schoolId,planId:plan.planId,actorId:actorId,from:plan.status,to:target,
    fromVersion:plan.version,toVersion:next.version,reason:reason||null,serverTime:now}};
 }
 return {prepare:prepare};
})();
