/* Pure syllabus reporting helper. No storage or authentication; backend must scope records. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusReport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function key(e){return [e.date,e.slot,e.chapterId||'',e.lessonId,e.period||''].join('|')}
 function summarize(plan,updates,asOf){
  if(!plan||!Array.isArray(plan.scheduled)||!Array.isArray(updates))throw Error('Plan and updates required');
  if(typeof asOf!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(asOf))throw Error('Report date required');
  const index=new Map();
  for(const u of updates){
   if(!u||typeof u.key!=='string'||index.has(u.key))throw Error('Invalid or duplicate progress row');
   index.set(u.key,u);
  }
  const totals={completed:0,pending:0,delayed:0},chapters=new Map(),lessons=[];
  for(const e of plan.scheduled){
   if(!e.lessonId)continue;
   const u=index.get(key(e));
   const status=u&&u.status==='completed'?'completed':u&&u.status==='delayed'||e.date<asOf?'delayed':'pending';
   totals[status]++;
   const chapterId=e.chapterId||'Unassigned';
   if(!chapters.has(chapterId))chapters.set(chapterId,{chapterId,completed:0,pending:0,delayed:0,total:0});
   const ch=chapters.get(chapterId);ch[status]++;ch.total++;
   lessons.push({date:e.date,slot:e.slot,lessonId:e.lessonId,lessonTitle:e.lessonTitle||'',chapterId,status,completedAt:u&&u.completedAt||null});
  }
  const totalLessons=lessons.length;
  return {planId:plan.planId,classId:plan.classId,subjectId:plan.subjectId,asOf,totals,totalLessons,
   completionPercent:totalLessons?Math.round(100*totals.completed/totalLessons):0,
   chapters:[...chapters.values()],lessons};
 }
 return {summarize};
});
