'use strict';
const assert=require('node:assert/strict');
const {appendApprovalEvent,verifyApprovalLedger}=require('./syllabus-approval-ledger');
const base={schoolId:'s1',classId:'5',subjectId:'English',sessionId:'2026-27',
 snapshotId:'sha256:'+'a'.repeat(64),actorId:'admin-1',at:'2026-11-09T04:00:00Z'};
let events=appendApprovalEvent({events:[],event:{...base,action:'submitted'},expectedSequence:0});
assert.equal(events.length,1);
assert.equal(verifyApprovalLedger(events),true);
assert.throws(()=>appendApprovalEvent({events,event:{...base,action:'approved'},expectedSequence:0}),/sequence conflict/);
events=appendApprovalEvent({events,event:{...base,action:'approved',at:'2026-11-09T04:01:00Z'},expectedSequence:1});
events=appendApprovalEvent({events,event:{...base,action:'published',at:'2026-11-09T04:02:00Z'},expectedSequence:2});
assert.equal(verifyApprovalLedger(events),true);
assert.equal(verifyApprovalLedger(events.map((x,i)=>i===1?{...x,payload:{...x.payload,action:'rejected'}}:x)),false);
assert.throws(()=>appendApprovalEvent({events,event:{...base,action:'submitted',at:'2026-11-09T04:03:00Z'},expectedSequence:3}),/closed/);
assert.throws(()=>appendApprovalEvent({events:[],event:{...base,action:'approved'},expectedSequence:0}),/requires submission/);
console.log('approval ledger chain tests passed');
