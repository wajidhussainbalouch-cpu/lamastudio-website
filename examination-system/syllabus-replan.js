/* Safe replan preview. Preserves completed lesson entries and original audit history.
 * Pure logic only; never writes school records.
 */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./syllabus-progress.js'):root.LamaSyllabusProgress);if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusReplan=api;})(typeof globalThis!=='undefined'?globalThis:this,function(progressApi){
'use strict';
const identity=x=>JSON.stringify([x.chapterId,x.lessonId,x.period]);
const slot=x=>JSON.stringify([x.date,x.slot]);
function previewReplan({originalPlan,updates=[],replacementPlan,asOf}){
 if(!progressApi)throw Error('Progress module required');
 if(!replacementPlan||!Array.isArray(replacementPlan.scheduled))throw Error('Replacement plan required');
 const original=progressApi.progress(originalPlan,updates,asOf);
 const oldLessons=original.entries, newLessons=replacementPlan.scheduled.filter(x=>x.lessonId);
 const oldIds=oldLessons.map(identity),newIds=newLessons.map(identity);
 if(new Set(oldIds).size!==oldIds.length||new Set(newIds).size!==newIds.length)throw Error('Duplicate lesson period identity');
 if(oldIds.length!==newIds.length||oldIds.some(x=>!newIds.includes(x)))throw Error('Catalog lesson periods changed; manual review required');
 const done=oldLessons.filter(x=>x.status==='completed');
 const fixedSlots=new Set(done.map(slot));
 const pending=oldLessons.filter(x=>x.status!=='completed');
 // Future revision/assessment slots must never be used for lessons.
 const reservedSlots=new Set(replacementPlan.scheduled.filter(x=>!x.lessonId).map(slot));
 const available=newLessons.filter(x=>x.date>=asOf&&!fixedSlots.has(slot(x))&&!reservedSlots.has(slot(x)));
 const freeSlots=available.map(x=>({date:x.date,slot:x.slot,periodId:x.periodId})).sort((a,b)=>a.date.localeCompare(b.date)||a.slot-b.slot);
 const used=new Set();
 const reassigned=[];
 for(const item of pending){
  const next=freeSlots.find(x=>!used.has(slot(x)));
  if(!next)throw Error('Insufficient future slots; completed lessons cannot be moved');
  used.add(slot(next));
  reassigned.push({...item,...next,status:'planned',replannedFrom:{date:item.date,slot:item.slot}});
 }
 const scheduled=[...done.map(x=>({...x,status:'completed'})),...reassigned,...replacementPlan.scheduled.filter(x=>!x.lessonId&&!fixedSlots.has(slot(x)))].sort((a,b)=>a.date.localeCompare(b.date)||a.slot-b.slot);
 if(new Set(scheduled.map(slot)).size!==scheduled.length)throw Error('Conflicting teaching slots');
 return {scheduled,unchangedCompleted:done.length,rescheduled:reassigned.length,requiresApproval:true,previewOnly:true,originalPlanUnchanged:true,reasonRequiredOnSave:true};
}
return {previewReplan};
});
