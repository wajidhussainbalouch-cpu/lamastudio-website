/* Fail-closed syllabus persistence orchestration.
 * Only trusted backend code may supply the verified session, entitlement loader,
 * scoped repository and exclusive lock. This is NOT a public API endpoint.
 */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./syllabus-transaction.js'):root.LamaSyllabusTransaction);if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusStore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(transaction){
'use strict';
function required(fn,name){if(typeof fn!=='function')throw Error(name+' backend dependency required');}
async function changeStatus({schoolId,planId,to,expectedVersion,reason,session,loadEntitlements,withLock,readPlan,commitPlanAndAudit,now}){
 if(!session||session.verified!==true||!session.schoolId||session.schoolId!==schoolId)throw Error('Verified school session required');
 if(typeof schoolId!=='string'||!schoolId.trim()||typeof planId!=='string'||!planId.trim())throw Error('Plan scope required');
 for(const [name,fn] of Object.entries({loadEntitlements,withLock,readPlan,commitPlanAndAudit,now}))required(fn,name);
 // The lock must remain held through read, version validation and durable commit.
 return withLock(schoolId,planId,async()=>{
  const current=await readPlan(schoolId,planId);
  if(!current||current.schoolId!==schoolId||current.planId!==planId)throw Error('Plan not found in school');
  const entitlements=await loadEntitlements(schoolId);
  if(!entitlements||entitlements.schoolId!==schoolId)throw Error('Trusted school entitlement required');
  const prepared=transaction.prepareTransition({current,session,entitlements,to,expectedVersion,reason,serverTime:now()});
  const saved=await commitPlanAndAudit(prepared);
  if(!saved||saved.planId!==planId||saved.schoolId!==schoolId||saved.version!==prepared.plan.version)throw Error('Backend commit confirmation missing');
  return {planId:saved.planId,schoolId:saved.schoolId,status:prepared.plan.status,version:saved.version};
 });
}
return {changeStatus};
});
