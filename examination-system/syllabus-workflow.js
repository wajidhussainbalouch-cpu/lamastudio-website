/* Draft approval and optimistic concurrency rules for syllabus plans.
 * Pure domain logic: server MUST authenticate, authorize tenant/role/entitlement,
 * persist atomically and create its own trusted audit timestamps.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusWorkflow=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const states=new Set(['draft','submitted','approved','published','archived']);
const transitions={draft:['submitted'],submitted:['approved','draft'],approved:['published','draft'],published:['archived'],archived:[]};
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
function assertPlan(plan){
 if(!plan||!nonempty(plan.schoolId)||!nonempty(plan.sessionId)||!nonempty(plan.classId)||!nonempty(plan.subjectId)||!nonempty(plan.planId))throw Error('Plan identity required');
 if(!states.has(plan.status)||!Number.isSafeInteger(plan.version)||plan.version<1)throw Error('Invalid plan state/version');
 if(!Array.isArray(plan.scheduled)||!plan.scheduled.length)throw Error('Plan entries required');
 if(plan.scheduled.some(x=>!x||!nonempty(x.date)||(!x.lessonId&&!['revision','assessment'].includes(x.kind))))throw Error('Invalid plan entry');
 return true;
}
function createDraft({schoolId,sessionId,classId,subjectId,planId,preview}){
 if(!preview||!preview.metadata?.previewOnly||!preview.metadata?.requiresApproval)throw Error('Approved preview input required');
 const plan={schoolId,sessionId,classId,subjectId,planId,status:'draft',version:1,scheduled:preview.scheduled.map(x=>({...x})),catalog:preview.catalog?{...preview.catalog}:null,calendar:preview.calendar?{...preview.calendar}:null,division:preview.division,approvedBy:null,publishedBy:null};
 assertPlan(plan);return plan;
}
function transition(plan,{to,expectedVersion,actorId,reason}){
 assertPlan(plan);
 if(!Number.isSafeInteger(expectedVersion)||expectedVersion!==plan.version)throw Error('Version conflict');
 if(!nonempty(actorId))throw Error('Actor required');
 if(!transitions[plan.status].includes(to))throw Error('Invalid transition: '+plan.status+' -> '+to);
 if(to==='draft'&&!nonempty(reason))throw Error('Reason required when returning to draft');
 const updated={...plan,status:to,version:plan.version+1,approvedBy:to==='approved'?actorId:to==='draft'?null:plan.approvedBy,publishedBy:to==='published'?actorId:plan.publishedBy};
 const event={planId:plan.planId,schoolId:plan.schoolId,actorId,from:plan.status,to,fromVersion:plan.version,toVersion:updated.version,reason:reason||null};
 return {plan:updated,event};
}
function canSuggestDiary(plan){assertPlan(plan);return plan.status==='published';}
function assertSameTenant(plan,schoolId){assertPlan(plan);if(!nonempty(schoolId)||plan.schoolId!==schoolId)throw Error('School scope mismatch');return true;}
return {assertPlan,createDraft,transition,canSuggestDiary,assertSameTenant};
});
