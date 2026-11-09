'use strict';
const assert=require('node:assert/strict');
const {scheduleApprovedDivision}=require('./syllabus-calendar-engine');
const lessons=[{lessonId:'EN5-01',estimatedPeriods:1},{lessonId:'EN5-02',estimatedPeriods:2}];
const calendar={start:'2026-11-09',end:'2026-11-10',periodsByWeekday:{1:2,2:1},
 periodSlotsByWeekday:{1:[2,5],2:[3]}};
const result=scheduleApprovedDivision({lessons,calendar});
assert.equal(result.feasible,true);
assert.deepEqual(result.assignments[0].slots,[{date:'2026-11-09',period:2}]);
assert.deepEqual(result.assignments[1].slots,[{date:'2026-11-09',period:5},{date:'2026-11-10',period:3}]);
assert.equal(result.availablePeriods,3);
const holiday=scheduleApprovedDivision({lessons,calendar:{...calendar,holidays:['2026-11-09']}});
assert.equal(holiday.feasible,false);
assert.deepEqual(holiday.assignments[0].slots,[{date:'2026-11-10',period:3}]);
for(const invalid of [[2,2],[5,2],[0,2],[1.5,2],[13]]) {
 assert.throws(()=>scheduleApprovedDivision({lessons,calendar:{...calendar,periodSlotsByWeekday:{1:invalid}}}),/Invalid explicit teaching periods/);
}
const legacy=scheduleApprovedDivision({lessons,calendar:{start:'2026-11-09',end:'2026-11-10',periodsByWeekday:{1:2,2:1}}});
assert.deepEqual(legacy.assignments[0].slots,[{date:'2026-11-09',period:1}]);
const omitted=scheduleApprovedDivision({lessons:[{lessonId:'ONLY-MON',estimatedPeriods:3}],calendar:{start:'2026-11-09',end:'2026-11-10',periodsByWeekday:{1:3,2:3},periodSlotsByWeekday:{1:[2,5]}}});
assert.equal(omitted.feasible,false);
assert.equal(omitted.availablePeriods,2);
assert.deepEqual(omitted.assignments[0].slots,[{date:'2026-11-09',period:2},{date:'2026-11-09',period:5}]);
console.log('explicit subject timetable tests passed');
