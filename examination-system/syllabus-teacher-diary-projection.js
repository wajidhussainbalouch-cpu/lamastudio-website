'use strict';
/** Read-only teacher diary projection. No edits to approved division or completed history. */
function buildTeacherDiary({snapshot,schedule,schoolId,classId,subjectId,sessionId}){
 if(!snapshot||!snapshot.content||!Array.isArray(snapshot.content.lessons)||!schedule||!Array.isArray(schedule.assignments))throw Error('Snapshot and schedule required');
 const scope=snapshot.content.scope||{};
 for(const [k,v] of Object.entries({schoolId,classId,subjectId,sessionId}))if(!v||scope[k]!==v)throw Error('Diary scope mismatch: '+k);
 const lessons=snapshot.content.lessons,byId=new Map(lessons.map(l=>[l.lessonId,l]));
 if(byId.size!==lessons.length)throw Error('Duplicate snapshot lesson');
 const rows=[],assignedIds=new Set();
 for(const a of schedule.assignments){
  if(!a||typeof a.lessonId!=='string'||assignedIds.has(a.lessonId))throw Error('Duplicate or invalid schedule assignment');
  assignedIds.add(a.lessonId);
  const l=byId.get(a.lessonId);
  if(!l)throw Error('Unknown schedule lesson');
  if(!['scheduled','completed','insufficient-capacity'].includes(a.status))throw Error('Invalid status');
  const slots=a.slots||[];
  if(!Array.isArray(slots))throw Error('Invalid slots');
  for(const s of slots){
   if(!s||!/^\d{4}-\d{2}-\d{2}$/.test(s.date)||!Number.isSafeInteger(s.period)||s.period<1)throw Error('Invalid diary slot');
   rows.push({date:s.date,period:s.period,lessonId:l.lessonId,unitTitle:l.unitTitle||'',topic:l.topic,
    learningObjectives:[...(l.learningObjectives||[])],difficulty:l.difficulty,
    status:a.status,actualDate:a.actualDate||null,sourcePageReference:l.sourcePageReference||null});
  }
 }
 if(assignedIds.size!==lessons.length)throw Error('Incomplete schedule assignments');
 // A published schedule must retain the approved lesson sequence, not just its IDs.
 for(let i=0;i<lessons.length;i++)if(schedule.assignments[i].lessonId!==lessons[i].lessonId)throw Error('Schedule lesson order differs from approved division');
 const seen=new Set();
 for(const r of rows){const key=r.date+'#'+r.period;if(seen.has(key))throw Error('Overlapping subject diary slots');seen.add(key);}
 rows.sort((a,b)=>a.date.localeCompare(b.date)||a.period-b.period);
 return {readOnly:true,snapshotId:snapshot.snapshotId,scope:{schoolId,classId,subjectId,sessionId},
  rows,unscheduledLessonIds:schedule.assignments.filter(a=>a.status==='insufficient-capacity').map(a=>a.lessonId),
  note:'Preview only. Teacher diary publishing requires authenticated school and section permissions, an approved snapshot and server-side validation.'};
}
if(typeof module!=='undefined')module.exports={buildTeacherDiary};
