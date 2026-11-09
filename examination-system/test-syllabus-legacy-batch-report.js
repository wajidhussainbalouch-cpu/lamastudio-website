'use strict';
const assert=require('node:assert/strict');
const {buildLegacyBatchReport}=require('./syllabus-legacy-batch-report');
const base={schoolId:'s1',classId:'5',subjectId:'English',sessionId:'2026-27',planId:'p1',
 version:1,status:'draft',scheduled:[{date:'2026-04-01',slot:2,lessonId:'L1',lessonTitle:'Reading'}]};
const plans=[base,{...base,planId:'p2',scheduled:[base.scheduled[0],{...base.scheduled[0],date:'2026-04-02'}]},
 {...base,planId:'p3',scheduled:[{...base.scheduled[0],date:'2026-02-30'}]}];
const before=JSON.stringify(plans);
const r=buildLegacyBatchReport({plans,schoolId:'s1'});
assert.equal(r.readOnly,true);
assert.equal(r.requiresAuthorizedMigration,true);
assert.deepEqual(r.counts,{total:3,compatible:2,needsRepair:1,manualReview:1});
assert.equal(JSON.stringify(plans),before);
assert.equal(r.records[1].warnings.length,1);
assert.equal(r.records[2].compatible,false);
const cross=buildLegacyBatchReport({plans:[{...base,schoolId:'s2'}],schoolId:'s1'});
assert.equal(cross.counts.needsRepair,1);
assert.equal(cross.records[0].planId,null);
const duplicates=buildLegacyBatchReport({plans:[base,base],schoolId:'s1'});
assert.equal(duplicates.counts.needsRepair,1);
assert.ok(duplicates.records[1].issues.includes('Missing or repeated plan ID in school inventory'));
assert.throws(()=>buildLegacyBatchReport({plans:[],schoolId:''}),/Trusted school scope/);
console.log('Legacy batch syllabus inventory tests passed');
