'use strict';
const assert=require('node:assert/strict');
const {scheduleApprovedDivision}=require('./syllabus-calendar-engine');
const calendar={start:'2026-11-09',end:'2026-11-10',periodsByWeekday:{0:0,1:3,2:3,3:3,4:3,5:3,6:0}};
const lessons=[{lessonId:'A',estimatedPeriods:1},{lessonId:'B',estimatedPeriods:1},{lessonId:'C',estimatedPeriods:1}];
const missingPeriod=scheduleApprovedDivision({lessons,calendar,completed:{A:{actualDate:'2026-11-09'}}});
assert.deepEqual(missingPeriod.assignments[1].slots,[{date:'2026-11-10',period:1}]);
assert.equal(missingPeriod.assignments[0].status,'completed');
const completed={A:{actualDate:'2026-11-09'},B:{actualDate:'2026-11-09'}};
assert.throws(()=>scheduleApprovedDivision({lessons,calendar,completed,previousSchedule:{
 A:[{date:'2026-11-09',period:1}],B:[{date:'2026-11-09',period:1}]
}}),/Overlapping completed historical slots/);
const valid=scheduleApprovedDivision({lessons,calendar,completed,previousSchedule:{
 A:[{date:'2026-11-09',period:1}],B:[{date:'2026-11-09',period:2}]
}});
assert.deepEqual(valid.assignments[2].slots,[{date:'2026-11-09',period:3}]);
assert.throws(()=>scheduleApprovedDivision({lessons,calendar,completed:{A:{actualDate:'2026-11-09'}},previousSchedule:{A:[{date:'2026-11-10',period:1}]}}),/after completion date/);
console.log('completed history integrity tests passed');
