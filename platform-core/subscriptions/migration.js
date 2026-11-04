/* Pure migration planning only: never writes to Sheets or changes existing grants. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaGrantMigration=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const MODULES=['schoolManagement','examination','smartMarker'];
function planLegacyMigration(rows,existingGrants=[],options={}){
 if(!Array.isArray(rows)||!Array.isArray(existingGrants))throw Error('Invalid inputs');
 const grants=[],review=[],seen=new Set();
 for(const row of rows){
  const schoolId=String(row&&row.schoolId||'').trim();
  if(!schoolId||seen.has(schoolId)){review.push({schoolId,reason:'MISSING_OR_DUPLICATE_SCHOOL_ID'});continue;}seen.add(schoolId);
  const type=String(row.subscriptionType||'').trim();
  if(!['Trial','Paid','Free','Unclassified',''].includes(type)){review.push({schoolId,reason:'UNKNOWN_LEGACY_TYPE'});continue;}
  const configured=existingGrants.filter(g=>g&&g.schoolId===schoolId);
  if(configured.length){review.push({schoolId,reason:'EXISTING_GRANTS_PRESERVED'});continue;}
  if(type==='Trial'||type==='Paid'){
   const end=String(row.subscriptionEnd||''),start=String(row.subscriptionStart||'');
   if(!/^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(start)||!/^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(end)||!Number.isFinite(Date.parse(end))||!Number.isFinite(Date.parse(start))||Date.parse(end)<=Date.parse(start)){review.push({schoolId,reason:'INVALID_LEGACY_DATES'});continue;}
   grants.push({schoolId,module:'schoolManagement',status:'active',revision:1,startsAt:new Date(start).toISOString(),expiresAt:new Date(end).toISOString(),migrationSource:'legacy-plan-review-required'});
   review.push({schoolId,reason:'OPTIONAL_MODULES_REQUIRE_APPROVAL'});
  }else review.push({schoolId,reason:'NO_PAID_ENTITLEMENT_INFERRED'});
 }
 return {dryRun:true,proposedGrants:grants,manualReview:review,requiresSuperAdminApproval:true};
}
return Object.freeze({MODULES,planLegacyMigration});
});