/* Syllabus plan storage transaction contract (pure; no network or database).
 * Backend must authenticate, load server-side entitlements, acquire a per-plan
 * lock, reload current plan, apply mutation, and atomically persist plan+audit.
 * Never accept actor identity, school or entitlements from request JSON.
 */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./syllabus-workflow.js'):root.LamaSyllabusWorkflow,typeof module==='object'&&module.exports?require('./syllabus-policy.js'):root.LamaSyllabusPolicy);if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusTransaction=api;})(typeof globalThis!=='undefined'?globalThis:this,function(workflow,policy){
'use strict';
const actionByState={submitted:'submit',approved:'approve',published:'publish',draft:'approve'};
function prepareTransition({current,session,entitlements,to,expectedVersion,reason,serverTime}){
 if(!current)throw Error('Current stored plan required');
 workflow.assertPlan(current);
 if(!session||session.verified!==true)throw Error('Verified backend session required');
 if(typeof serverTime!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(serverTime)||!Number.isFinite(Date.parse(serverTime)))throw Error('Server timestamp required');
 const action=actionByState[to];if(!action)throw Error('Unsupported target state');
 policy.authorize({session,resource:{schoolId:current.schoolId},action,entitlements});
 if(to==='draft'&&current.status!=='submitted'&&current.status!=='approved')throw Error('Cannot return this plan to draft');
 if(to==='draft'&&(!reason||!String(reason).trim()))throw Error('Reason required when returning to draft');
 const result=workflow.transition(current,{to,expectedVersion,actorId:session.actorId,reason});
 return {plan:result.plan,audit:{...result.event,serverTime,sessionRole:session.role},expectedVersion:current.version,schoolId:current.schoolId,planId:current.planId,atomicCommitRequired:true};
}
return {prepareTransition};
});
