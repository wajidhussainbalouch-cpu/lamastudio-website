'use strict';
const assert=require('node:assert/strict');
const {buildTeacherDiary}=require('./syllabus-teacher-diary-projection');
const scope={schoolId:'s1',classId:'5',subjectId:'English',sessionId:'2026-27'};
const snapshot={snapshotId:'sha256:example',content:{scope,lessons:[
 {lessonId:'L1',unitTitle:'Patience',topic:'Reading',learningObjectives:['Identify main idea'],difficulty:'moderate',sourcePageReference:1},
 {lessonId:'L2',unitTitle:'Patience',topic:'Writing',learningObjectives:[],difficulty:'difficult',sourcePageReference:2}]}};
const schedule={assignments:[{lessonId:'L1',status:'completed',actualDate:'2026-04-02',slots:[{date:'2026-04-02',period:1}]},
 {lessonId:'L2',status:'scheduled',slots:[{date:'2026-04-03',period:1}]}]};
const before=JSON.stringify({snapshot,schedule});
const diary=buildTeacherDiary({snapshot,schedule,...scope});
assert.equal(diary.rows.length,2);
assert.equal(diary.rows[0].actualDate,'2026-04-02');
assert.equal(diary.rows[1].topic,'Writing');
assert.equal(diary.readOnly,true);
assert.equal(JSON.stringify({snapshot,schedule}),before);
assert.throws(()=>buildTeacherDiary({snapshot,schedule,...scope,schoolId:'s2'}),/scope mismatch/);
const overlapping={assignments:[...schedule.assignments,{lessonId:'L2',status:'scheduled',slots:[{date:'2026-04-02',period:1}]}]};
assert.throws(()=>buildTeacherDiary({snapshot,schedule:overlapping,...scope}),/Overlapping/);
console.log('teacher diary projection tests passed');
