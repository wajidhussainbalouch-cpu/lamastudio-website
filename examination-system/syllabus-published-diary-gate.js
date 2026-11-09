'use strict';
/** Fail-closed, read-only gate before rendering teacher diary data. */
const {verifyDivisionSnapshot}=require('./syllabus-division-snapshot');
const {verifyApprovalLedger}=require('./syllabus-approval-ledger');
const {buildTeacherDiary}=require('./syllabus-teacher-diary-projection');
function buildPublishedTeacherDiary({snapshot,ledger,schedule,scope,actor}){
 if(!verifyDivisionSnapshot(snapshot))throw Error('Invalid division snapshot integrity');
 if(snapshot.snapshotId!=='sha256:'+snapshot.hash)throw Error('Snapshot ID mismatch');
 if(!verifyApprovalLedger(ledger)||!ledger.length)throw Error('Invalid approval ledger');
 const last=ledger.at(-1);
 if(last.payload.action!=='published'||last.payload.snapshotId!==snapshot.snapshotId)throw Error('Snapshot not published');
 for(const k of ['schoolId','classId','subjectId','sessionId']){
  if(!scope||typeof scope[k]!=='string'||!scope[k]||scope[k]!==snapshot.content.scope[k]||scope[k]!==last.payload[k])throw Error('Scope mismatch: '+k);
 }
 if(!actor||actor.schoolId!==scope.schoolId||!actor.userId)throw Error('Unauthorized diary reader');
 if(actor.role==='teacher'){
  if(!Array.isArray(actor.assignedClasses)||!actor.assignedClasses.includes(scope.classId))throw Error('Teacher class not assigned');
 }else if(!['school_admin','school_owner'].includes(actor.role))throw Error('Unauthorized diary role');
 if(!schedule||schedule.snapshotId!==snapshot.snapshotId||!Number.isSafeInteger(schedule.version)||schedule.version<1)throw Error('Unversioned or mismatched schedule');
 return buildTeacherDiary({snapshot,schedule,...scope});
}
module.exports={buildPublishedTeacherDiary};
