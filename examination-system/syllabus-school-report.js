/* Aggregates verified per-plan syllabus summaries; no authentication or I/O. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusSchoolReport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function aggregate(reports){
 if(!Array.isArray(reports))throw Error('Reports required');
 const totals={completed:0,pending:0,delayed:0},classes=new Map();
 for(const report of reports){
  if(!report||!report.classId||!report.subjectId||!report.totals)throw Error('Invalid syllabus report');
  const classId=String(report.classId),subjectId=String(report.subjectId);
  if(!classes.has(classId))classes.set(classId,{classId,plans:0,subjects:[],completed:0,pending:0,delayed:0,totalLessons:0});
  const group=classes.get(classId);group.plans++;
  group.subjects.push(subjectId);
  for(const k of ['completed','pending','delayed']){
   const n=report.totals[k];
   if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid lesson count');
   totals[k]+=n;group[k]+=n;
  }
  group.totalLessons=group.completed+group.pending+group.delayed;
 }
 const rows=[...classes.values()].map(c=>({...c,subjects:[...new Set(c.subjects)],completionPercent:c.totalLessons?Math.round(c.completed*100/c.totalLessons):0})).sort((a,b)=>a.classId.localeCompare(b.classId));
 const totalLessons=totals.completed+totals.pending+totals.delayed;
 return {plans:reports.length,classes:rows,totals,totalLessons,completionPercent:totalLessons?Math.round(totals.completed*100/totalLessons):0};
}
return {aggregate};
});
