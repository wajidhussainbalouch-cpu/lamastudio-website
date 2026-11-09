'use strict';
/**
 * Read-only school-scoped inventory of legacy dated syllabus plans.
 * Never writes, approves or migrates plans. Avoids exposing pupil/teacher data.
 */
const {auditLegacyDatedPlan}=require('./syllabus-legacy-plan-audit');
function buildLegacyBatchReport({plans,schoolId}){
 if(typeof schoolId!=='string'||!schoolId.trim())throw Error('Trusted school scope required');
 if(!Array.isArray(plans)||plans.length>1000)throw Error('Expected at most 1000 stored plans');
 const counts={total:0,compatible:0,needsRepair:0,manualReview:0};
 const records=[];
 const seen=new Set();
 for(const plan of plans){
  counts.total++;
  if(!plan||typeof plan!=='object'||Array.isArray(plan)||plan.schoolId!==schoolId){
   counts.needsRepair++;
   records.push({planId:null,compatible:false,issues:['Stored plan outside school scope or invalid'],warnings:[]});
   continue;
  }
  const scope={schoolId,classId:plan.classId,subjectId:plan.subjectId,sessionId:plan.sessionId};
  const result=auditLegacyDatedPlan(plan,scope);
  const key=plan.planId;
  if(typeof key!=='string'||!key.trim()||seen.has(key)){
   result.compatible=false;
   result.issues.push('Missing or repeated plan ID in school inventory');
  }else seen.add(key);
  if(result.compatible)counts.compatible++;
  else counts.needsRepair++;
  if(result.warnings.length)counts.manualReview++;
  records.push({planId:typeof key==='string'?key:null,compatible:result.compatible,
   datedEntries:result.datedEntries,distinctLessonIds:result.distinctLessonIds,
   issues:result.issues,warnings:result.warnings});
 }
 return {schoolId,readOnly:true,requiresAuthorizedMigration:true,counts,records};
}
module.exports={buildLegacyBatchReport};
