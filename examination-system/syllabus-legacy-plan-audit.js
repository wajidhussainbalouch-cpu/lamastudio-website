'use strict';
/**
 * Read-only assessment of the legacy dated Apps Script plan format.
 * Does not approve, migrate, mutate or convert plans to permanent divisions.
 */
function auditLegacyDatedPlan(plan,expectedScope){
 const issues=[],warnings=[];
 if(!plan||typeof plan!=='object'||Array.isArray(plan))return {compatible:false,requiresMigration:true,issues:['Invalid legacy plan']};
 const scopeFields=['schoolId','classId','subjectId','sessionId'];
 for(const k of scopeFields){
  if(typeof plan[k]!=='string'||!plan[k].trim())issues.push('Missing '+k);
  if(expectedScope&&plan[k]!==expectedScope[k])issues.push('Scope mismatch: '+k);
 }
 if(!Array.isArray(plan.scheduled)||!plan.scheduled.length)issues.push('Missing dated schedule');
 if(Array.isArray(plan.scheduled)&&plan.scheduled.length>300)issues.push('Legacy schedule exceeds supported 300 entries');
 if(typeof plan.planId!=='string'||!plan.planId.trim())issues.push('Missing planId');
 const seenSlots=new Set(),seenLessons=new Set();
 for(const item of Array.isArray(plan.scheduled)?plan.scheduled:[]){
  if(!item||typeof item!=='object'||Array.isArray(item)){issues.push('Invalid scheduled entry');continue;}
  const d=item.date;
  const validDate=typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
  if(!validDate)issues.push('Invalid scheduled date');
  if(!Number.isSafeInteger(item.slot)||item.slot<1||item.slot>12)issues.push('Invalid scheduled slot');
  const key=d+'#'+item.slot;
  if(seenSlots.has(key))issues.push('Duplicate dated slot');
  seenSlots.add(key);
  if(typeof item.lessonId!=='string'||!item.lessonId.trim())issues.push('Invalid lesson ID');
  if(typeof item.lessonTitle!=='string'||!item.lessonTitle.trim())issues.push('Missing lesson title');
  else if(seenLessons.has(item.lessonId)&&!warnings.includes('Repeated lesson ID needs exercise-level review'))warnings.push('Repeated lesson ID needs exercise-level review');
  seenLessons.add(item.lessonId);
 }
 if(!Number.isSafeInteger(plan.version)||plan.version<1)issues.push('Invalid plan version');
 if(!['draft','submitted','approved','published','archived'].includes(plan.status))issues.push('Invalid plan status');
 return {compatible:issues.length===0,requiresMigration:true,issues,warnings,
  datedEntries:Array.isArray(plan.scheduled)?plan.scheduled.length:0,
  distinctLessonIds:seenLessons.size,
  warning:'Legacy dated plans are not approved immutable syllabus divisions. Manual review and authorized migration are required.'};
}
module.exports={auditLegacyDatedPlan};
