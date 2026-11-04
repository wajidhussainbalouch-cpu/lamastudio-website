/* LAMA syllabus progress and examination scope: pure, read-only helpers.
 * Persistence, identity, tenant and entitlement enforcement belong to the backend.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.LamaSyllabusProgress=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const validDate=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+"T12:00:00Z"))&&new Date(x+"T12:00:00Z").toISOString().slice(0,10)===x;
function lessonKey(x){return [x.date,x.slot,x.chapterId,x.lessonId,x.period].join("|");}
function progress(plan,updates=[],asOf){
 if(!plan||!Array.isArray(plan.scheduled))throw Error("Plan required");
 if(!validDate(asOf))throw Error("Valid asOf date required");
 const known=new Set(plan.scheduled.filter(x=>x.lessonId).map(lessonKey)),latest=new Map();
 for(const u of updates){
  if(!u||!known.has(u.key))throw Error("Unknown lesson entry");
  if(!["completed","delayed","pending"].includes(u.status))throw Error("Invalid progress status");
  if(u.completedAt&&!validDate(u.completedAt))throw Error("Invalid completion date");
  latest.set(u.key,u);
 }
 const entries=plan.scheduled.filter(x=>x.lessonId).map(x=>{
  const u=latest.get(lessonKey(x)),completed=u?.status==="completed";
  const status=completed?"completed":u?.status==="delayed"||x.date<asOf?"delayed":"pending";
  return {...x,key:lessonKey(x),status,completedAt:completed?u.completedAt||null:null};
 });
 const totals={completed:0,pending:0,delayed:0};
 for(const e of entries)totals[e.status]++;
 return {asOf,totals,entries,completionPercent:entries.length?Math.round(100*totals.completed/entries.length):100};
}
function diarySuggestions(plan,day,updates=[]){
 const state=progress(plan,updates,day);
 return state.entries.filter(x=>x.date===day).map(x=>({date:x.date,slot:x.slot,chapterId:x.chapterId,lessonId:x.lessonId,title:x.lessonTitle,status:x.status,source:"syllabus-plan",suggestionOnly:true}));
}
function examCoverage(plan,updates=[],asOf,{periodId=null,completedOnly=true}={}){
 const p=progress(plan,updates,asOf);
 const selected=p.entries.filter(x=>(!periodId||x.periodId===periodId)&&(!completedOnly||x.status==="completed"));
 const chapterIds=[...new Set(selected.map(x=>x.chapterId))];
 const chapters=chapterIds.map(id=>{
  const all=p.entries.filter(x=>x.chapterId===id&&(!periodId||x.periodId===periodId));
  const done=all.filter(x=>x.status==="completed").length;
  return {chapterId:id,completedPeriods:done,totalPeriods:all.length,fullyCovered:done===all.length};
 });
 return {chapterIds,chapters,requiresTeacherApproval:true,questionBankApprovalRequired:true};
}
return {lessonKey,progress,diarySuggestions,examCoverage};
});
