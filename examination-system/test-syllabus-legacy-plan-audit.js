'use strict';
const assert=require('node:assert/strict');
const {auditLegacyDatedPlan}=require('./syllabus-legacy-plan-audit');
const scope={schoolId:'s1',classId:'5',subjectId:'English',sessionId:'2026-27'};
const base={...scope,planId:'p1',version:1,status:'draft',scheduled:[
 {date:'2026-04-01',slot:2,lessonId:'L1',lessonTitle:'Reading'},
 {date:'2026-04-02',slot:3,lessonId:'L2',lessonTitle:'Writing'}
]};
const original=JSON.stringify(base);
const good=auditLegacyDatedPlan(base,scope);
assert.equal(good.compatible,true);
assert.equal(good.requiresMigration,true);
assert.equal(good.distinctLessonIds,2);
assert.equal(JSON.stringify(base),original);
assert.equal(auditLegacyDatedPlan(base,{...scope,schoolId:'other'}).compatible,false);
assert.ok(auditLegacyDatedPlan({...base,scheduled:[base.scheduled[0],base.scheduled[0]]}).issues.includes('Duplicate dated slot'));
assert.ok(auditLegacyDatedPlan({...base,scheduled:[base.scheduled[0],{...base.scheduled[1],lessonId:'L1'}]}).issues.includes('Repeated lesson ID needs exercise-level review'));
assert.ok(auditLegacyDatedPlan({...base,scheduled:[{...base.scheduled[0],date:'2026-02-30'}]}).issues.includes('Invalid scheduled date'));
assert.ok(auditLegacyDatedPlan({...base,version:0}).issues.includes('Invalid plan version'));
assert.equal(auditLegacyDatedPlan(null).compatible,false);
assert.ok(auditLegacyDatedPlan({...base,planId:''}).issues.includes('Missing planId'));
assert.ok(auditLegacyDatedPlan({...base,scheduled:[{...base.scheduled[0],lessonTitle:''}]}).issues.includes('Missing lesson title'));
const oversized=Array.from({length:301},(_,i)=>({date:'2026-04-01',slot:1,lessonId:'L'+i,lessonTitle:'Lesson '+i}));
assert.ok(auditLegacyDatedPlan({...base,scheduled:oversized}).issues.includes('Legacy schedule exceeds supported 300 entries'));
console.log('legacy syllabus compatibility audit tests passed');
