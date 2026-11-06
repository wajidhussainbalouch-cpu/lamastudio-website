'use strict';
const assert=require('node:assert/strict');
const {select}=require('./syllabus-session-filter');
const plans=[
 {planId:'a',sessionId:'2026-27',classId:'1',subjectId:'Math',status:'published'},
 {planId:'b',sessionId:'2026-27',classId:'1',subjectId:'English',status:'published'},
 {planId:'c',sessionId:'2025-26',classId:'1',subjectId:'Math',status:'published'},
 {planId:'d',sessionId:'2026-27',classId:'1',subjectId:'Math',status:'archived'}
];
assert.deepEqual(select(plans,'2026-27').map(x=>x.planId),['a','b']);
assert.equal(select(plans,'2027-28').length,0);
assert.throws(()=>select(plans.concat([{...plans[0],planId:'e',subjectId:'math'}]),'2026-27'),/Overlapping/);
assert.throws(()=>select(plans,''),/Academic session/);
console.log('Academic session filtering tests passed');
