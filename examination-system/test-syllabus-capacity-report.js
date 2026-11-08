'use strict';
const assert=require('node:assert/strict');
const {analyzeCapacity}=require('./syllabus-capacity-report');
const {createDraftDivision}=require('./syllabus-division-draft');
const catalog=require('./catalogs/english-class-5.json');
const lessons=createDraftDivision(catalog).lessons;
const calendar={start:'2026-04-01',end:'2026-12-23',periodsByWeekday:{1:1,2:1,3:1,4:1,5:1},
 closedRanges:[{start:'2026-05-22',end:'2026-08-23'}],holidays:[]};
const result=analyzeCapacity({lessons,calendar});
assert.equal(result.requiredUnfinishedPeriods,176);
assert.equal(result.feasible,false);
assert.ok(result.missingPeriods>0);
assert.equal(result.unscheduled.reduce((n,x)=>n+x.missingPeriods,0),result.missingPeriods);
assert.equal(result.byMonth['2026-06'],undefined);
assert.equal(result.byMonth['2026-07'],undefined);
const enough=analyzeCapacity({lessons,calendar:{...calendar,periodsByWeekday:{1:2,2:2,3:2,4:2,5:1}}});
assert.equal(enough.feasible,true);
assert.equal(enough.missingPeriods,0);
console.log('Capacity reporting tests passed');
