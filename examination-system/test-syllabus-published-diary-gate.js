'use strict';
const assert=require('node:assert/strict');
const {makeDivisionSnapshot}=require('./syllabus-division-snapshot');
const {appendApprovalEvent}=require('./syllabus-approval-ledger');
const {buildPublishedTeacherDiary}=require('./syllabus-published-diary-gate');
const scope={schoolId:'s1',classId:'5',subjectId:'English',sessionId:'2026-27'};
const division={status:'submitted',revision:1,classId:'5',subjectId:'English',lessons:[{lessonId:'L1',topic:'Reading',estimatedPeriods:1,learningObjectives:['Read']} ]};
const snapshot=makeDivisionSnapshot({division,scope,expectedRevision:1});
let ledger=[];
for(const [i,action] of ['submitted','approved','published'].entries()){
 ledger=appendApprovalEvent({events:ledger,event:{...scope,snapshotId:snapshot.snapshotId,actorId:'admin1',action,at:'2026-11-09T04:0'+i+':00Z'},expectedSequence:i});
}
const schedule={snapshotId:snapshot.snapshotId,version:1,assignments:[{lessonId:'L1',status:'scheduled',slots:[{date:'2026-11-10',period:1}]}]};
const actor={role:'teacher',schoolId:'s1',userId:'t1',assignedClasses:['5']};
const result=buildPublishedTeacherDiary({snapshot,ledger,schedule,scope,actor});
assert.equal(result.rows.length,1);
assert.equal(result.readOnly,true);
assert.throws(()=>buildPublishedTeacherDiary({snapshot,ledger:ledger.slice(0,2),schedule,scope,actor}),/not published/);
assert.throws(()=>buildPublishedTeacherDiary({snapshot,ledger,schedule,scope,actor:{...actor,schoolId:'s2'}}),/Unauthorized/);
assert.throws(()=>buildPublishedTeacherDiary({snapshot,ledger,schedule,scope,actor:{...actor,assignedClasses:['4']}}),/not assigned/);
assert.throws(()=>buildPublishedTeacherDiary({snapshot,ledger,schedule:{...schedule,version:undefined},scope,actor}),/Unversioned/);
const tampered=JSON.parse(JSON.stringify(snapshot));tampered.content.lessons[0].topic='Altered';
assert.throws(()=>buildPublishedTeacherDiary({snapshot:tampered,ledger,schedule,scope,actor}),/integrity/);
console.log('published diary gate tests passed');
